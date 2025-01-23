package com.project.chess_game.ChessGame.Handler;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.project.chess_game.ChessGame.Model.Room;
import com.project.chess_game.ChessGame.Repository.RoomRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.*;

@Component
public class WebSocketHandler extends TextWebSocketHandler {

    private static final Logger logger = LoggerFactory.getLogger(WebSocketHandler.class);
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Autowired
    private RoomRepository roomRepository; // RoomRepository 의존성 주입

    private Map<Long, WebSocketSession> roomSessions = new HashMap<>(); // 생성된 방과 세션 연결
    private Map<Long, Integer> roomPlayerCount = new HashMap<>(); // 방에 플레이어 수 추적

    public WebSocketHandler(RoomRepository roomRepository) {
        this.roomRepository = roomRepository;
    }

    // 방 생성 메소드
    private Long createRoom(String roomName, String password) {
        Room room = new Room();
        room.setRoomName(roomName);
        room.setPassword(password); // 비밀번호 저장 (선택 사항)

        // 첫 번째 플레이어 정보 설정 (초기 플레이어 설정)
        room.setPlayer1("플레이어1"); // 방 생성 시 플레이어1은 방 생성자로 설정 (추후 조인 시 설정됨)
        room.setPlayer2(null); // 방 생성 시 플레이어2는 null로 설정 (추후 조인 시 설정됨)

        Room savedRoom = roomRepository.save(room); // 데이터베이스에 저장
        logger.info("새로운 방이 생성되었습니다. 방 이름: {}, 방 ID: {}", roomName, savedRoom.getId());
        return savedRoom.getId();
    }

    // 방 생성 이벤트를 클라이언트에 전송
    private void sendRoomCreatedEvent(WebSocketSession session, Long roomId, String roomName) throws Exception {
        Map<String, Object> response = new HashMap<>();
        response.put("event", "roomCreated");
        response.put("roomId", roomId);
        response.put("roomName", roomName);
        session.sendMessage(new TextMessage(objectMapper.writeValueAsString(response)));
        logger.info("방 생성 정보를 클라이언트에 전송: 방 ID {}, 방 이름: {}", roomId, roomName);
    }

    // 방 목록을 클라이언트에 전송
    private void sendRoomListToClient(WebSocketSession session) throws Exception {
        Iterable<Room> rooms = roomRepository.findAll(); // 모든 방 목록 조회
        List<Map<String, Object>> roomList = new ArrayList<>();

        for (Room room : rooms) {
            Map<String, Object> roomData = new HashMap<>();
            roomData.put("roomId", room.getId());  // roomId 포함
            roomData.put("roomName", room.getRoomName()); // roomName 포함
            roomData.put("currentPlayers", getPlayerCount(room));
            roomData.put("maxPlayers", 2);

            roomList.add(roomData);  // 리스트에 추가
        }

        Map<String, Object> response = new HashMap<>();
        response.put("event", "roomListUpdate"); // 방 목록 업데이트 이벤트
        response.put("rooms", roomList); // 방 목록 정보

        session.sendMessage(new TextMessage(objectMapper.writeValueAsString(response))); // 클라이언트에게 방 목록 전송
        logger.info("방 목록 전송: 방 개수 {}", roomList.size());
    }

    // 현재 방에 입장한 플레이어 수 가져오기
    private int getPlayerCount(Room room) {
        int count = 0;
        if (room.getPlayer1() != null) count++;
        if (room.getPlayer2() != null) count++;
        return count;
    }

    // 플레이어 입장 이벤트를 클라이언트에 전송
    private void sendJoinRoomEvent(WebSocketSession session, Long roomId, String roomName, String playerName) throws Exception {
        Map<String, Object> response = new HashMap<>();
        response.put("event", "playerJoined");
        response.put("roomId", roomId);
        response.put("roomName", roomName);
        response.put("playerName", playerName);
        session.sendMessage(new TextMessage(objectMapper.writeValueAsString(response)));
        logger.info("플레이어 입장 정보를 클라이언트에 전송: 방 ID {}, 플레이어: {}", roomId, playerName);
    }

    // 클라이언트로부터 메시지를 받으면 호출되는 메소드
    @Override
    protected void handleTextMessage(WebSocketSession session, TextMessage message) throws Exception {
        String payload = message.getPayload();
        logger.info("받은 메시지 페이로드: {}", payload);

        try {
            // 메시지 페이로드를 Map으로 변환
            Map<String, String> data = objectMapper.readValue(payload, HashMap.class);
            String event = data.get("event");
            logger.info("이벤트 수신: {}", event);

            switch (event) {
                case "createRoom":
                    logger.info("방 생성 요청이 들어왔습니다.");
                    String roomName = data.get("roomName");
                    String password = data.get("password"); // 비밀번호는 선택 사항
                    Long roomId = createRoom(roomName, password);
                    roomSessions.put(roomId, session); // 방 ID와 연결된 세션을 관리
                    roomPlayerCount.put(roomId, 1); // 첫 번째 플레이어 입장
                    logger.info("새 방 생성됨. 방 ID: {}, 방 이름: {}", roomId, roomName);
                    sendRoomCreatedEvent(session, roomId, roomName); // 클라이언트에게 방 생성 이벤트 전송
                    break;

                case "joinRoom":
                    // roomId를 Integer가 아닌 Long으로 변환
                    Long joinRoomId = Long.valueOf(data.get("roomId")); // roomId를 Long 타입으로 변환
                    String joinRoomName = data.get("roomName");
                    String playerName = data.get("playerName");

                    logger.info("방 입장 요청: 방 ID {}, 방 Name {}, 플레이어 이름: {}", joinRoomId, joinRoomName, playerName);

                    int playerCount = roomPlayerCount.getOrDefault(joinRoomId, 0); // 방에 입장한 플레이어 수를 가져옴, 기본값은 0

                    if (playerCount < 2) {
                        Room room = roomRepository.findById(joinRoomId)
                                .orElseThrow(() -> new RuntimeException("해당 방이 존재하지 않습니다."));

                        // 비밀번호 확인
                        if (room.getPassword() != null && !room.getPassword().equals(data.get("password"))) {
                            logger.warn("비밀번호가 일치하지 않음. 방 ID: {}", joinRoomId);
                            return;
                        }

                        // 플레이어 추가
                        roomPlayerCount.put(joinRoomId, playerCount + 1);
                        // 첫 번째 플레이어는 이미 설정되어 있으므로 두 번째 플레이어만 설정
                        if (room.getPlayer1() != null && room.getPlayer2() == null) {
                            room.setPlayer2("플레이어2"); // 두 번째 플레이어 설정
                            roomRepository.save(room); // 업데이트된 방 정보를 데이터베이스에 저장
                            logger.info("플레이어가 방에 입장함. 방 ID: {}, 방 RoomName {}, 플레이어2: {}", joinRoomId, joinRoomName, room.getPlayer2());
                            sendJoinRoomEvent(session, joinRoomId, room.getRoomName(), room.getPlayer2());
                        } else {
                            // 방이 가득 찼을 경우 'roomFull' 이벤트 전송
                            logger.warn("입장 실패: 방이 가득 찼습니다. 방 ID: {}", joinRoomId);
                            Map<String, Object> response = new HashMap<>();
                            response.put("event", "roomFull");
                            response.put("roomId", joinRoomId);
                            response.put("roomName", room.getRoomName());
                            response.put("currentPlayers", playerCount);
                            response.put("maxPlayers", 2);
                            session.sendMessage(new TextMessage(objectMapper.writeValueAsString(response)));
                        }
                        break;
                    }
                case "chat":
                    String chatMessage = data.get("message"); // 채팅 메시지 추출
                    logger.info("채팅 메시지 수신: {}", chatMessage);
                    sendChatMessageToRoom(session, chatMessage); // 방에 채팅 메시지 전송
                    break;

                case "getRoomList":
                    // 방 목록을 클라이언트에 전송하는 로직 추가
                    logger.info("방 목록 요청 수신");
                    sendRoomListToClient(session); // 방 목록 전송 함수 호출
                    break;

                default:
                    logger.warn("알 수 없는 이벤트: {}", event);
            }
        } catch (Exception e) {
            logger.error("메시지 처리 중 오류 발생: {}", e.getMessage());
        }
    }

    // 채팅 메시지를 방에 있는 입장한 플레이어에게 전송
    private void sendChatMessageToRoom(WebSocketSession session, String chatMessage) throws Exception {
        for (Map.Entry<Long, WebSocketSession> entry : roomSessions.entrySet()) {
            WebSocketSession roomSession = entry.getValue();
            Map<String, String> response = new HashMap<>();
            response.put("event", "chatMessage");
            response.put("message", chatMessage);
            roomSession.sendMessage(new TextMessage(objectMapper.writeValueAsString(response)));
        }
        logger.info("채팅 메시지를 입장한 플레이어에게 전송: {}", chatMessage);
    }

    // WebSocket 연결이 성공적으로 이루어졌을 때 호출
    @Override
    public void afterConnectionEstablished(WebSocketSession session) throws Exception {
        super.afterConnectionEstablished(session);

        // 세션 ID를 로그로 기록하거나 세션 관련 정보를 처리할 수 있습니다.
        String sessionId = session.getId();
        logger.info("새로운 WebSocket 연결: 세션 ID = {}", sessionId); // 로그로 기록

        // 방 목록 요청을 처리할 수 있도록 클라이언트에게 방 목록 전송
        sendRoomListToClient(session);
    }

    // WebSocket 연결 종료 시 처리
    @Override
    public void afterConnectionClosed(WebSocketSession session, org.springframework.web.socket.CloseStatus status) throws
            Exception {
        super.afterConnectionClosed(session, status);
        String sessionId = session.getId();
        logger.info("WebSocket 연결 종료: 세션 ID = {}", sessionId); // 로그로 기록
    }
}

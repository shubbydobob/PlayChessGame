package com.project.chess_game.ChessGame.Service;

import com.project.chess_game.ChessGame.Model.Room;
import com.project.chess_game.ChessGame.Repository.RoomRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;


@Service
public class RoomService {

    private static final Logger logger = LoggerFactory.getLogger(RoomService.class);

    private final RoomRepository roomRepository;

    public RoomService(RoomRepository roomRepository) {
        this.roomRepository = roomRepository;
    }

    // 방 생성 (방 이름 추가)
    public Room createRoom(String roomName, String password, String playerName) {
        logger.info("방 생성 요청 받음, 방 이름: {}, 방 비밀번호: {}", roomName, password); // 방 생성 요청을 로그에 기록

        Room room = new Room(); // 새로운 방 생성
        room.setRoomName(roomName != null ? roomName : "Unnamed Room"); // 방 이름 설정
        room.setPassword(password); // 비밀번호 설정
        room.setPlayer1(playerName); // 방 생성자를 플레이어1으로 설정

        Room savedRoom = roomRepository.save(room); // 데이터베이스에 방 저장

        // 방 생성 후 성공적으로 저장된 방 ID를 로그에 기록
        logger.info("방 생성 완료, 방 ID: {}, 방 이름: {}, 방 비밀번호: {}, 방 생성 플레이어: {}"
                , savedRoom.getId(), savedRoom.getRoomName(), savedRoom.getPassword(), savedRoom.getPlayer1());

        return savedRoom; // 방 객체 반환
    }

    // 방 조회
    public Room getRoom(Long id) {
        logger.info("방 조회 요청 받음, 방 ID: {}", id); // 방 조회 요청을 로그에 기록

        Room room = roomRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Room not found")); // 방이 존재하지 않으면 예외 던짐

        // 방이 정상적으로 조회되었음을 로그에 기록
        logger.info("방 조회 성공, 방 ID: {}, 방 이름: {}", room.getId(), room.getRoomName());

        return room; // 조회된 방 반환
    }
}

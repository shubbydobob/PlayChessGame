// WebSocket 서버에 연결
const socket = new WebSocket("ws://localhost:8080/ws/room");

// 연결 상태 확인
socket.onopen = () => {
    console.log("WebSocket 연결 성공"); // WebSocket 연결 성공 시 로그 출력
    const payload = { event: "getRoomList" }; // 방 목록 요청
    socket.send(JSON.stringify(payload)); // 서버에 방 목록 요청
};

socket.onclose = () => {
    console.log("WebSocket 연결 종료"); // WebSocket 연결 종료 시 로그 출력
};

socket.onerror = (error) => {
    console.error("WebSocket 오류:", error); // WebSocket 오류 발생 시 로그 출력
};


// 서버로부터 메시지를 받을 때마다 실행되는 함수
socket.onmessage = (event) => {
    console.log("서버로부터 메시지 수신:", event.data); // 받은 메시지 로그
    const data = JSON.parse(event.data);

    // 방 생성 이벤트 처리
    if (data.event === "roomCreated") {
        const roomId = data.roomId;
        const roomName = data.roomName;
        console.log("새로 생성된 방 ID:", roomId); // 새 방 ID 로그
        console.log("새로 생성된 방 Name:", roomName); // 새 방 Name 로그
        displayMessage(`새로운 방이 생성되었습니다. 방 ID: ${roomId}`);
        displayMessage(`새로운 방이 생성되었습니다. 방 Name: ${roomName}`);

        // 방 목록에 방 추가
        addRoomToBoard(roomId, roomName);
    }

    // 방 목록 갱신: 이미 존재하는 방 목록을 받아올 경우 처리
    if (data.event === "roomListUpdate") {
        console.log("방 목록 업데이트:", data.rooms);
        updateRoomList(data.rooms);
    }

    // 플레이어 입장 이벤트 처리
    if (data.event === "playerJoined") {
        const roomId = data.roomId;
        const roomName = data.roomName;
        const playerName = data.playerName;  // 플레이어 이름 추가
        console.log("플레이어가 입장한 방 ID:", roomId); // 방 입장 로그
        console.log("플레이어가 입장한 방 Name:", roomName); // 방 입장 로그
        console.log("플레이어 이름:", playerName); // 플레이어 이름 로그

        displayMessage(`${playerName}님이 방 ${roomId}, ${roomName}에 입장했습니다.`);
    }

    // 채팅 메시지 처리
    if (data.event === "chatMessage") {
        const chatMessage = data.message;
        console.log("채팅 메시지:", chatMessage); // 채팅 메시지 로그
        displayMessage(chatMessage);
    }
};

// 방 목록 갱신 함수
function updateRoomList(rooms) {
    const roomList = document.getElementById("roomList");
    roomList.innerHTML = ''; // 기존 목록 초기화

    rooms.forEach(room => {
        console.log("room:", room);  // 각 방 객체 확인
        addRoomToBoard(room.id, room.roomName); // 각 방 추가
    });
}

// 방을 게시판에 추가하는 함수
function addRoomToBoard(roomId, roomName) {
    console.log("addRoomToBoard 호출, 방 ID:", roomId, "방 이름:", roomName); // 콘솔 확인
    const roomList = document.getElementById("roomList");
    const roomDiv = document.createElement("div");
    roomDiv.className = "room-item"; // 방 항목 스타일

    const roomTitle = document.createElement("span");
    roomTitle.textContent = `방 ID: ${roomId}, 방 이름: ${roomName}`;
    roomDiv.appendChild(roomTitle);

    // Join 버튼 클릭 시 joinRoom 함수 호출
    const joinButton = document.createElement("button");
    joinButton.textContent = "Join Room";
    joinButton.onclick = () => joinRoom(roomId);  // joinRoom 함수로 변경
    roomDiv.appendChild(joinButton);

    roomList.appendChild(roomDiv); // 게시판에 방 추가
}

// 방 생성 폼 열기
function openCreateRoomForm() {
    document.getElementById("createRoomForm").style.display = "block"; // 폼 표시
}

// 방 생성 폼 닫기
function closeCreateRoomForm() {
    document.getElementById("createRoomForm").style.display = "none"; // 폼 숨기기
}

// 방 생성 요청
function createRoom() {
    const roomName = document.getElementById("roomName").value.trim();
    const password = document.getElementById("password").value.trim();

    console.log("방 생성 요청 전송"); // 방 생성 요청 로그

    if (roomName) {
        const payload = {
            event: "createRoom",
            roomName: roomName,
            password: password
        };
        socket.send(JSON.stringify(payload)); // 서버로 방 생성 요청 전송
        closeCreateRoomForm(); // 폼 닫기
    } else {
        console.warn("방 이름을 입력해주세요.");
    }
}

// 방 입장 요청
function joinRoom(roomId) {
    const password = prompt("비밀번호를 입력하세요 (비밀번호 없음은 Enter):");

    if (password !== null) {
            const payload = {
                event: "joinRoom",
                roomId: String(roomId), // roomId를 문자열로 변환
                password: password,
            };

            // 서버로 방 입장 요청 전송
            socket.send(JSON.stringify(payload));

            // 방 입장 응답 처리 (WebSocket 메시지 수신)
            socket.onmessage = (event) => {
                const response = JSON.parse(event.data);

                if (response.event === "playerJoined" && response.roomId == roomId) {
                    console.log("방 입장 성공:", response);
                    // 방 입장 성공 시 체스 게임 페이지로 이동
                    window.location.href = `/ChessGame?roomId=${roomId}`;
                } else if (response.event === "error") {
                    console.error("방 입장 실패:", response.message);
                    alert(response.message); // 에러 메시지 표시
                }
            };
        } else {
            console.warn("비밀번호를 입력하지 않았습니다.");
        }
    }

// 채팅 메시지 전송
function sendMessage() {
    const chatInput = document.getElementById("chatInput");
    const message = chatInput.value.trim(); // 입력값 앞뒤 공백 제거

    if (message) {
        console.log("채팅 메시지 전송:", message); // 전송할 메시지 로그
        const payload = {
            event: "chat",
            message: message
        };
        socket.send(JSON.stringify(payload)); // 서버로 메시지 전송
        chatInput.value = ""; // 입력 필드 초기화
    } else {
        console.warn("빈 메시지는 전송할 수 없습니다."); // 빈 메시지 전송 시 경고 로그
    }
}

// 메시지 화면에 표시
function displayMessage(message) {
    const chatMessages = document.getElementById("chatMessages");
    const messageDiv = document.createElement("div");
    messageDiv.className = "chat-message";
    messageDiv.textContent = message;
    chatMessages.appendChild(messageDiv); // 메시지를 화면에 추가
    chatMessages.scrollTop = chatMessages.scrollHeight; // 스크롤 하단으로 이동
}

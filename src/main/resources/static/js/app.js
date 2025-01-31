// WebSocket 서버에 연결
const socket = new WebSocket("ws://52.79.175.0:8080/ws/room");

// WebSocket 연결 상태 확인
socket.onopen = () => {
    console.log("WebSocket 연결 성공");
    socket.send(JSON.stringify({ event: "getRoomList" })); // 서버에 방 목록 요청
};

socket.onclose = () => {
    console.warn("⚠WebSocket 연결 종료");
};

socket.onerror = (error) => {
    console.error(" WebSocket 오류 발생:", error);
};

// WebSocket 메시지 수신 (모든 이벤트 처리)
socket.onmessage = (event) => {
    console.log("서버로부터 메시지 수신:", event.data);
    const data = JSON.parse(event.data);

    switch (data.event) {
        case "roomCreated":
            console.log("방 생성됨:", data.roomId, data.roomName);
            displayMessage(`새로운 방이 생성되었습니다. 방 ID: ${data.roomId}, 이름: ${data.roomName}`);
            addRoomToBoard(data.roomId, data.roomName, 1, 2);
            break;

        case "roomListUpdate":
            console.log("방 목록 업데이트:", data.rooms);
            updateRoomList(data.rooms);
            break;

        case "playerJoined":
            console.log("플레이어 입장:", data.playerName, "방 ID:", data.roomId);
            displayMessage(`${data.playerName}님이 방 ${data.roomId}에 입장했습니다.`);
            updateRoomCapacity(data.roomId, data.currentPlayers, data.maxPlayers);

            if (data.currentPlayers === data.maxPlayers) {
                console.log("CheesGame으로 이동: roomId =", data.roomId);
                window.location.href=`/ChessGame?roomId=${data.roomId}`;
            }
            break;

        case "startGame":
            console.log("게임 시작! ChessGame으로 이동: roomId =", data.roomId);
            window.location.href = `/ChessGame?roomId=${data.roomId}`;
            break;

        case "roomFull":
            console.warn("방이 가득 찼습니다. 방 ID:", data.roomId);
            alert(`입장 불가: 방 ${data.roomId}(${data.roomName})는 최대 인원이 찼습니다.`);
            updateRoomCapacity(data.roomId, data.currentPlayers, data.maxPlayers);
            break;

        case "globalChatMessage":
            console.log("채팅 메시지 수신:", data.message);
            displayGlobalMessage(data.message);
            break;

        default:
            console.warn("알 수 없는 이벤트:", data.event);
    }
};

// 방 목록 갱신
function updateRoomList(rooms) {
    const roomList = document.getElementById("roomList");
    roomList.innerHTML = ''; // 기존 목록 초기화

    rooms.forEach(room => {
        console.log("방 정보:", room);
        addRoomToBoard(room.roomId, room.roomName, room.currentPlayers, room.maxPlayers);
    });
}

// 방 추가 함수
function addRoomToBoard(roomId, roomName, currentPlayers, maxPlayers) {
    console.log("방 추가:", roomId, roomName, '(${currentPlayers}/${maxPlayers})');
    const roomList = document.getElementById("roomList");
    const roomDiv = document.createElement("div");
    roomDiv.className = "room-item";

    const roomTitle = document.createElement("span");
    roomTitle.textContent = `방 ID: ${roomId}, 이름: ${roomName} (${currentPlayers}/${maxPlayers})`;
    roomDiv.appendChild(roomTitle);

    const joinButton = document.createElement("button");
    joinButton.textContent = "입장";
    joinButton.disabled = currentPlayers >= maxPlayers;
    joinButton.onclick = () => joinRoom(roomId);
    roomDiv.appendChild(joinButton);

    roomList.appendChild(roomDiv);
}

// 방 입장 후 인원 변경 시 업데이트하는 함수
function updateRoomCapacity(roomId, currentPlayers, maxPlayers) {
    const roomList = document.getElementById("roomList").children;

    for (const roomDiv of roomList) {
        if (roomDiv.textContent.includes(`방 ID: ${roomId}`)) {
            // 기존 정보 업데이트
            const roomTitle = roomDiv.querySelector("span");
            roomTitle.textContent = `방 ID: ${roomId}, (${currentPlayers}/${maxPlayers})`;

            // 입장 가능 여부 업데이트
            const joinButton = roomDiv.querySelector("button");
            joinButton.disabled = currentPlayers >= maxPlayers;
            break;
        }
    }
}

// 방 생성 폼 열기 & 닫기
function openCreateRoomForm() {
    document.getElementById("createRoomForm").style.display = "block";
}

function closeCreateRoomForm() {
    document.getElementById("createRoomForm").style.display = "none";
}

// 방 생성 요청
function createRoom() {
    const roomName = document.getElementById("roomName").value.trim();
    const password = document.getElementById("password").value.trim();

    if (roomName) {
        console.log("방 생성 요청:", roomName);
        socket.send(JSON.stringify({ event: "createRoom", roomName, password }));
        closeCreateRoomForm();
    } else {
        console.warn("방 이름을 입력하세요.");
    }
}

// 방 입장 요청
function joinRoom(roomId) {
    const password = prompt("비밀번호를 입력하세요 (없으면 Enter)");

    if (password !== null) {
        const payload = { event: "joinRoom", roomId: String(roomId), password };

        console.log("방 입장 요청:", payload);
        socket.send(JSON.stringify(payload));
    }
}
// 메시지를 채팅창에 추가
function displayGlobalMessage(message) {
    const chatMessages = document.getElementById("globalChatMessages");
    const messageDiv = document.createElement("div");
    messageDiv.className = "chat-message";
    messageDiv.textContent = message;
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}


// 채팅 메시지 전송
function sendGlobalMessage() {
    const chatInput = document.getElementById("globalChatInput");
    const message = chatInput.value.trim();

    if (message) {
        console.log("채팅 메시지 전송:", message);
        socket.send(JSON.stringify({ event: "globalChat", message }));
        displayGlobalMessage(`(나) ${message}`); // 전송 후 즉시 화면에 추가
        chatInput.value = "";
    } else {
        console.warn("빈 메시지는 전송할 수 없습니다.");
    }
}


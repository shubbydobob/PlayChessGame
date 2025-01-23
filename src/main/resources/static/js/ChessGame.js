// 선택된 기물과 현재 턴 정보를 저장
let selectedPiece = null; // 선택된 체스 기물 (행, 열 정보 포함)
let currentTurn = 'white'; // 현재 턴 (white: 플레이어1, black: 플레이어2)
let timers = { white: 600, black: 600 }; // 초 단위 (5분)
let possibleMoves = []; // 이동 가능 위치를 저장할 배열 설정


// p5.js 체스 보드 렌더링, 보드 크기 및 타일 크기 설정
const tileSize = 100; // 각 타일 크기
const boardSize = 8; // 체스 보드의 행/열 크기

// 체스 기물들의 초기 배치 설정 (각각의 기물을 나타내는 문자열로 정의, 대문자: 흰색, 소문자: 검은색)
const initialBoard = [
      ['R', 'N', 'B', 'Q', 'K', 'B', 'N', 'R'], // 흰색 첫 번째 줄
      ['P', 'P', 'P', 'P', 'P', 'P', 'P', 'P'], // 흰색 폰
      ['', '', '', '', '', '', '', ''], // 빈 줄
      ['', '', '', '', '', '', '', ''],
      ['', '', '', '', '', '', '', ''],
      ['', '', '', '', '', '', '', ''],
      ['p', 'p', 'p', 'p', 'p', 'p', 'p', 'p'], // 검은색 폰
      ['r', 'n', 'b', 'q', 'k', 'b', 'n', 'r']  // 검은색 첫 번째 줄
];

// 체스 보드에서의 기물 이동을 위한 배열
let board = JSON.parse(JSON.stringify(initialBoard)); // 보드를 초기화

// p5.js 초기화 및 보드 렌더링
function setup() {
    const canvas = createCanvas(tileSize * boardSize, tileSize * boardSize);
    canvas.parent('chessBoard'); // 체스 보드 HTML 요소에 캔버스를 붙임
    drawBoard();
    startTimer(); // ✅ 타이머 시작
    console.log("체스 보드 초기화 완료");
}

function drawBoard(){
    clear();
    drawChessBoard();
    highlightPossibleMoves();
    drawPieces();
}


// 체스 보드 그리기
function drawChessBoard() {
    let isWhite = false; // 첫 타일 색상

    for (let row = 0; row < boardSize; row++) {
        for (let col = 0; col < boardSize; col++) {
            fill(isWhite ? 255 : 100); // 흰색(255) 또는 검은색(100)
            rect(col * tileSize, row * tileSize, tileSize, tileSize); // 타일 그리기
            isWhite = !isWhite; // 색상 전환
        }
        isWhite = !isWhite; // 다음 행의 색상 변경
    }
}

// 이동 가능 경로 표시
function highlightPossibleMoves() {
    fill(0, 255, 0, 150);
    for (let move of possibleMoves) {
        ellipse(move.col * tileSize + tileSize / 2, move.row * tileSize + tileSize / 2, tileSize / 3);
    }
}


// 체스 기물 그리기
function drawPieces() {
    for (let row = 0; row < boardSize; row++) {
        for (let col = 0; col < boardSize; col++) {
            const piece = board[row][col];
            if (piece !== '') {
                textSize(32);
                if (piece === piece.toLowerCase()){
                    fill('blue'); // 플레이어 2 (파랑)
                } else {
                    fill('red'); // 플레이어 1 (빨강)
                }
                text(piece, col * tileSize + tileSize / 4, row * tileSize + tileSize / 1.5); // 체스말 그리기
            }
        }
    }
}
// 현재 플레이어의 기물인지 확인하는 함수
function isCurrentPlayerPiece(row, col) {
    const piece = board[row][col];
    if (piece === '') return false;
    return (currentTurn === 'white' && piece === piece.toUpperCase()) ||
           (currentTurn === 'black' && piece === piece.toLowerCase());
}


// 사용자가 마우스로 타일을 클릭할 때
function mousePressed() {
    const col = Math.floor(mouseX / tileSize); // 클릭한 타일의 열 계산
    const row = Math.floor(mouseY / tileSize); // 클릭한 타일의 행 계산

    if (selectedPiece) {
        // 이미 기물이 선택되어 있으면, 선택한 위치로 이동
        if (isValidMove(selectedPiece.row, selectedPiece.col, row, col)) {
            movePiece(selectedPiece.row, selectedPiece.col, row, col);
            selectedPiece = null; // 이동 후 선택된 기물 초기화
        } else {
            console.log("잘못된 이동입니다.");
            selectedPiece = null; // 다른 위치 클릭시 선택 초기화
        }
    } else {
        // 기물 선택하기
        if (board[row][col] !== '') {
            const piece = board[row][col];
            // 현재 턴에 맞는 플레이어의 기물만 선택 가능
            if ((currentTurn === 'white' && piece === piece.toUpperCase()) ||
                (currentTurn === 'black' && piece === piece.toLowerCase())) {
                selectedPiece = { row, col }; // 기물 선택
                console.log(`선택한 기물: ${piece} (행: ${row}, 열: ${col})`);
            } else {
                console.log(`${currentTurn === 'white' ? '플레이어1' : '플레이어2'}의 차례입니다.`);
            }
        } else {
            console.log("빈 칸을 클릭했습니다.");
        }
    }
}

// 유효한 이동인지 확인하는 함수
function isValidMove(fromRow, fromCol, toRow, toCol) {
    const piece = board[fromRow][fromCol]; // 선택된 기물
    console.log(`isValidMove 호출: ${piece} (${fromRow}, ${fromCol}) -> (${toRow}, ${toCol})`);

    if (piece === ''){
        console.error("유효하지 않은 이동: 선택한 칸이 비어있습니다.");
        return false;
    }
    // 플레이어1(흰색) 대문자, 플레이어2(검은색) 소문자 확인
    if ((currentTurn === 'white' && piece !== piece.toUpperCase()) ||
        (currentTurn === 'black' && piece !== piece.toLowerCase())) {
        console.error("현재 턴에 맞지 않는 기물을 선택했습니다.");
        return false;
    }

    // 기물 종류를 소문자로 변환하여 이동 규칙 처리
    switch (piece.toLowerCase()) {
        case 'k':
            console.log("킹 이동 검사");
            return isKingMove(fromRow, fromCol, toRow, toCol);
        case 'q':
            console.log("퀸 이동 검사");
            return isQueenMove(fromRow, fromCol, toRow, toCol);
        case 'r':
            console.log("룩 이동 검사");
            return isRookMove(fromRow, fromCol, toRow, toCol);
        case 'b':
            console.log("비숍 이동 검사");
            return isBishopMove(fromRow, fromCol, toRow, toCol);
        case 'n': // 나이트는 장애물 검사 없이 이동 가능
            console.log("나이트 이동 검사");
            return isKnightMove(fromRow, fromCol, toRow, toCol);
        case 'p':
            console.log("폰 이동 검사");
            return isPawnMove(fromRow, fromCol, toRow, toCol);
        default:
            console.error(`유효하지 않은 기물: ${piece}`);
            return false;
    }
}

// 장애물 확인 함수
function checkPathClear(fromRow, fromCol, toRow, toCol) {
    const rowStep = Math.sign(toRow - fromRow); // 행 이동 방향
    const colStep = Math.sign(toCol - fromCol); // 열 이동 방향

    let currentRow = fromRow + rowStep;
    let currentCol = fromCol + colStep;

    while (currentRow !== toRow || currentCol !== toCol) {
        if (board[currentRow][currentCol] !== '') {
            console.log("장애물 발견: ", currentRow, currentCol);
            return false;
        }
        currentRow += rowStep;
        currentCol += colStep;
    }

    return true; // 경로가 비어 있음
}

// 각 기물 종류별 이동 로직 구현
function isKingMove(fromRow, fromCol, toRow, toCol) {
    // 킹은 1칸 이동, 가로, 세로, 대각선으로 이동 가능
    console.log("킹 이동: ", fromRow, fromCol, "에서", toRow, toCol, "으로 이동");
    return Math.abs(fromRow - toRow) <= 1 && Math.abs(fromCol - toCol) <= 1;
}

function isQueenMove(fromRow, fromCol, toRow, toCol) {
    // 퀸은 가로, 세로, 대각선으로 여러 칸 이동
    console.log("퀸 이동: ", fromRow, fromCol, "에서", toRow, toCol, "으로 이동");
    return checkPathClear(fromRow, fromCol, toRow, toCol) &&
           (isRookMove(fromRow, fromCol, toRow, toCol) || isBishopMove(fromRow, fromCol, toRow, toCol));
}

function isRookMove(fromRow, fromCol, toRow, toCol) {
    console.log("룩 이동: ", fromRow, fromCol, "에서", toRow, toCol, "으로 이동");
    if (fromRow !== toRow && fromCol !== toCol) {
        console.log("룩은 가로 또는 세로로만 이동할 수 있습니다.");
        return false; // 가로 또는 세로가 아닌 경우 이동 불가
    }
    return checkPathClear(fromRow, fromCol, toRow, toCol); // 장애물 검사
}

function isBishopMove(fromRow, fromCol, toRow, toCol) {
    console.log("비숍 이동: ", fromRow, fromCol, "에서", toRow, toCol, "으로 이동");
    if (Math.abs(fromRow - toRow) !== Math.abs(fromCol - toCol)) {
        console.log("비숍은 대각선으로만 이동할 수 있습니다.");
        return false; // 대각선이 아닌 경우 이동 불가
    }
    return checkPathClear(fromRow, fromCol, toRow, toCol); // 장애물 검사
}

function isKnightMove(fromRow, fromCol, toRow, toCol) {
    // 나이트는 L자 형태로 이동 (2칸 직선, 1칸 직각)
    console.log("나이트 이동: ", fromRow, fromCol, "에서", toRow, toCol, "으로 이동");
    return (Math.abs(fromRow - toRow) === 2 && Math.abs(fromCol - toCol) === 1) ||
           (Math.abs(fromRow - toRow) === 1 && Math.abs(fromCol - toCol) === 2);
}


function isPawnMove(fromRow, fromCol, toRow, toCol) {
    const direction = board[fromRow][fromCol] === 'P' ? -1 : 1; // 흰색은 위로, 검은색은 아래로
    console.log("폰 이동: ", fromRow, fromCol, "에서", toRow, toCol, "으로 이동");

    // 기본 1칸 전진
    if (fromCol === toCol && board[toRow][toCol] === '' && Math.abs(fromRow - toRow) === 1) {
        return true;
    }
    // 첫 이동 시 2칸 전진 가능
    if (fromCol === toCol && board[toRow][toCol] === '' && Math.abs(fromRow - toRow) === 2 && (fromRow === 1 || fromRow === 6)) {
        return true;
    }
    // 대각선으로 상대 기물 잡기
    if (Math.abs(fromCol - toCol) === 1 && Math.abs(fromRow - toRow) === 1 && board[toRow][toCol] !== '') {
        return true;
    }
    return false;
}

// 체스 기물 이동 (예: 체스 기물 선택 후 이동)
function movePiece(fromRow, fromCol, toRow, toCol) {
    // 유효한 범위 내에서만 이동하도록 검사
    if (fromRow < 0 || fromRow >= boardSize || fromCol < 0 || fromCol >= boardSize ||
        toRow < 0 || toRow >= boardSize || toCol < 0 || toCol >= boardSize) {
        console.error("잘못된 이동 범위입니다.");
        return;
    }

    const piece = board[fromRow][fromCol];
    if (piece === '') {
        console.error("이동할 기물이 없습니다.");
        return;
    }

    // 간단한 이동 예시: 빈 칸으로 이동 (복잡한 규칙은 추가 필요)
    board[toRow][toCol] = piece;
    board[fromRow][fromCol] = ''; // 기존 자리 비우기

    console.log(`기물이 ${fromRow},${fromCol}에서 ${toRow},${toCol}로 이동했습니다.`);

     // 턴 변경
     currentTurn = (currentTurn === 'white') ? 'black' : 'white';  // 턴 전환

     drawBoardAfterMove(); // 보드 업데이트
     updateTurnDisplay(); // 현재 턴 표시
}

// 이동 후 보드 업데이트 및 리렌더링
function drawBoardAfterMove() {
    clear(); // 캔버스 초기화
    drawChessBoard(); // 보드 재그리기
    drawPieces(); // 새로운 기물들 그리기
}

// 현재 턴을 화면에 표시
function updateTurnDisplay() {
    const turnDisplay = document.getElementById("currentTurn");
    if (turnDisplay) {
        turnDisplay.textContent = currentTurn === 'white' ? "플레이어1" : "플레이어2";
    }
}

// 타이머 UI 업데이트 (오류 방지)
function updateTimerDisplay() {
    const whiteTimerEl = document.getElementById("whiteTimer");
    const blackTimerEl = document.getElementById("blackTimer");

    if (whiteTimerEl && blackTimerEl) {
        whiteTimerEl.textContent = `White: ${timers.white}s`;
        blackTimerEl.textContent = `Black: ${timers.black}s`;
    } else {
        console.warn("⚠️ 타이머 UI 요소를 찾을 수 없습니다. HTML 파일에 추가해야 합니다.");
    }
}

// ✅ 타이머 실행 확인용 로그 추가
function startTimer() {
    console.log("🕰️ 타이머 시작!");

    setInterval(() => {
        if (timers[currentTurn] > 0) {
            timers[currentTurn]--;

            updateTimerDisplay();
        } else {
            console.log(`⏳ ${currentTurn} 시간 초과! 턴 변경`);
            currentTurn = currentTurn === 'white' ? 'black' : 'white';
            resetTimer();
        }
    }, 1000);
}

// ✅ `resetTimer()`에서 실행 확인
function resetTimer() {
    console.log(`🔄 ${currentTurn} 타이머 리셋`);
    timers[currentTurn] = 600;
    updateTimerDisplay();
}



// 게임 초기화
function resetGame() {
    board = JSON.parse(JSON.stringify(initialBoard)); // 보드를 초기화
    currentTurn = 'white'; // 플레이어1부터 시작
    drawBoardAfterMove(); // 보드 업데이트
    updateTurnDisplay(); // 턴 업데이트
}

// URL에서 roomId 가져오기
const urlParams = new URLSearchParams(window.location.search);
const roomId = urlParams.get("roomId");

console.log(`체스 게임에 입장했습니다. 방 ID: ${roomId}`);

// 텍스트 숨기고 다른 위치로 이동
const gameBoard = document.getElementById("chessBoard");
const gameInfo = document.getElementById("gameInfo");

if (gameBoard && gameInfo) {
    gameBoard.textContent = '';  // 체스 보드의 텍스트 지우기

    // gameInfo에 새로운 내용 추가
    const gameMessage = document.createElement('p');
    gameMessage.textContent = `체스 보드가 생성되었습니다. (방 ID: ${roomId})`;
    gameInfo.appendChild(gameMessage);  // gameInfo에 메시지 추가
} else {
    console.error("체스 보드 또는 게임 정보가 존재하지 않습니다!");
}
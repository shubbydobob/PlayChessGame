let selectedPiece = null; // 선택된 말
let currentTurn = 'white'; // 현재 턴 (white: 플레이어1, black: 플레이어2)

// p5.js 체스 보드 렌더링
const tileSize = 100; // 타일 크기
const boardSize = 8; // 체스 보드 크기

// 체스 말들의 초기 배치 설정 (각각의 말을 나타내는 문자열로 정의)
const initialBoard = [
      ['Rook', 'Knight', 'Bishop', 'Queen', 'King', 'Bishop', 'Knight', 'Rook'], // 1번 행 (하얀색의 첫 번째 행)
      ['p', 'p', 'p', 'p', 'p', 'p', 'p', 'p'], // 2번 행 (하얀색의 병사)
      ['', '', '', '', '', '', '', ''], // 3번 행 (빈 공간)
      ['', '', '', '', '', '', '', ''], // 4번 행 (빈 공간)
      ['', '', '', '', '', '', '', ''], // 5번 행 (빈 공간)
      ['', '', '', '', '', '', '', ''], // 6번 행 (빈 공간)
      ['P', 'P', 'P', 'P', 'P', 'P', 'P', 'P'], // 7번 행 (검은색의 병사)
      ['Rook', 'Knight', 'Bishop', 'Queen', 'King', 'Bishop', 'Knight', 'Rook']  // 8번 행 (검은색의 첫 번째 행)
];

// 체스 보드에서의 말 이동을 위한 배열
let board = JSON.parse(JSON.stringify(initialBoard)); // 보드를 초기화

function setup() {
    const canvas = createCanvas(tileSize * boardSize, tileSize * boardSize);
    canvas.parent('chessBoard'); // 체스 보드 HTML 요소에 캔버스를 붙임
    drawChessBoard();
    drawPieces();
}

// 체스 보드 그리기
function drawChessBoard() {
    let isWhite = false;

    for (let row = 0; row < boardSize; row++) {
        for (let col = 0; col < boardSize; col++) {
            // 타일 색상 설정
            if (isWhite) {
                fill(255); // 흰색
            } else {
                fill(100); // 검정색
            }
            rect(col * tileSize, row * tileSize, tileSize, tileSize); // 사각형 그리기
            isWhite = !isWhite; // 색상 전환
        }
        isWhite = !isWhite; // 다음 행에서 색상 시작 변경
    }
}

// 체스말 그리기
function drawPieces() {
    for (let row = 0; row < boardSize; row++) {
        for (let col = 0; col < boardSize; col++) {
            const piece = board[row][col];
            if (piece !== '') {
                textSize(32);
                fill(piece === piece.toLowerCase() ? 'black' : 'white');
                text(piece, col * tileSize + tileSize / 4, row * tileSize + tileSize / 1.5); // 체스말 그리기
            }
        }
    }
}
// 사용자가 마우스로 타일을 클릭할 때
function mousePressed() {
    const col = Math.floor(mouseX / tileSize); // 클릭한 타일의 열
    const row = Math.floor(mouseY / tileSize); // 클릭한 타일의 행

    if (selectedPiece) {
        // 이미 말이 선택되어 있으면, 선택한 위치로 이동
        if (isValidMove(selectedPiece.row, selectedPiece.col, row, col)) {
            movePiece(selectedPiece.row, selectedPiece.col, row, col);
            selectedPiece = null; // 이동 후 선택된 말 초기화
        } else {
            console.log("잘못된 이동입니다.");
            selectedPiece = null; // 다른 위치 클릭시 선택 초기화
        }
    } else {
        // 말 선택하기
        if (board[row][col] !== '') {
            const piece = board[row][col];
            // 현재 턴에 맞는 플레이어의 말만 선택 가능
            if ((currentTurn === 'white' && piece === piece.toUpperCase()) ||
                (currentTurn === 'black' && piece === piece.toLowerCase())) {
                selectedPiece = { row, col }; // 말 선택
                console.log(`선택한 말: ${piece} (행: ${row}, 열: ${col})`);
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
    const piece = board[fromRow][fromCol];
    if (piece === '') return false;

    switch (piece.toLowerCase()) {
        case 'king':
            return isKingMove(fromRow, fromCol, toRow, toCol);
        case 'queen':
            return isQueenMove(fromRow, fromCol, toRow, toCol);
        case 'rook':
            return isRookMove(fromRow, fromCol, toRow, toCol);
        case 'bishop':
            return isBishopMove(fromRow, fromCol, toRow, toCol);
        case 'knight':
            return isKnightMove(fromRow, fromCol, toRow, toCol);
        case 'p':
        case 'P':
            return isPawnMove(fromRow, fromCol, toRow, toCol);
        default:
            return false;
    }
}

// 각 말 종류별 이동 로직 구현
function isKingMove(fromRow, fromCol, toRow, toCol) {
    // 킹은 1칸 이동, 가로, 세로, 대각선으로 이동 가능
    console.log("킹 이동: ", fromRow, fromCol, "에서", toRow, toCol, "으로 이동");
    return Math.abs(fromRow - toRow) <= 1 && Math.abs(fromCol - toCol) <= 1;
}

function isQueenMove(fromRow, fromCol, toRow, toCol) {
    // 퀸은 가로, 세로, 대각선으로 여러 칸 이동
    console.log("퀸 이동: ", fromRow, fromCol, "에서", toRow, toCol, "으로 이동");
    return isRookMove(fromRow, fromCol, toRow, toCol) || isBishopMove(fromRow, fromCol, toRow, toCol);
}

function isRookMove(fromRow, fromCol, toRow, toCol) {
    // 룩은 가로, 세로로만 이동
    console.log("룩 이동: ", fromRow, fromCol, "에서", toRow, toCol, "으로 이동");
    return fromRow === toRow || fromCol === toCol;
}

function isBishopMove(fromRow, fromCol, toRow, toCol) {
    // 비숍은 대각선으로만 이동
    console.log("비숍 이동: ", fromRow, fromCol, "에서", toRow, toCol, "으로 이동");
    return Math.abs(fromRow - toRow) === Math.abs(fromCol - toCol);
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
    // 대각선으로 상대 말 잡기
    if (Math.abs(fromCol - toCol) === 1 && Math.abs(fromRow - toRow) === 1 && board[toRow][toCol] !== '') {
        return true;
    }
    return false;
}

// 체스말 이동 (예: 체스말 선택 후 이동)
function movePiece(fromRow, fromCol, toRow, toCol) {
    // 유효한 범위 내에서만 이동하도록 검사
    if (fromRow < 0 || fromRow >= boardSize || fromCol < 0 || fromCol >= boardSize ||
        toRow < 0 || toRow >= boardSize || toCol < 0 || toCol >= boardSize) {
        console.error("잘못된 이동 범위입니다.");
        return;
    }

    const piece = board[fromRow][fromCol];
    if (piece === '') {
        console.error("이동할 말이 없습니다.");
        return;
    }

    // 간단한 이동 예시: 빈 칸으로 이동 (복잡한 규칙은 추가 필요)
    board[toRow][toCol] = piece;
    board[fromRow][fromCol] = ''; // 기존 자리 비우기

    console.log(`말이 ${fromRow},${fromCol}에서 ${toRow},${toCol}로 이동했습니다.`);

     // 턴 변경
     currentTurn = (currentTurn === 'white') ? 'black' : 'white';  // 턴 전환

     drawBoardAfterMove(); // 보드 업데이트
     updateTurnDisplay(); // 현재 턴 표시
}

// 이동 후 보드 업데이트 및 리렌더링
function drawBoardAfterMove() {
    clear(); // 캔버스 초기화
    drawChessBoard(); // 보드 재그리기
    drawPieces(); // 새로운 말들 그리기
}

// 현재 턴을 화면에 표시
function updateTurnDisplay() {
    const turnDisplay = document.getElementById("currentTurn");
    if (turnDisplay) {
        turnDisplay.textContent = currentTurn === 'white' ? "플레이어1" : "플레이어2";
    }
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
const gameBoard = document.getElementById('game-board');
const scoreDisplay = document.getElementById('score');

const rows = 8;
const cols = 8;
const gemColors = ['#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#800080', '#FFA500']; // 빨강, 초록, 파랑, 노랑, 보라, 주황

let board = [];
let score = 0;
let draggedGem = null;
let replacedGem = null;

// 게임 시작
window.onload = function() {
    startGame();
};

function startGame() {
    for (let r = 0; r < rows; r++) {
        let row = [];
        for (let c = 0; c < cols; c++) {
            const gem = createGem(r, c);
            gameBoard.appendChild(gem);
            row.push(gem);
        }
        board.push(row);
    }

    // 초기 보드에 매칭이 없도록 보장
    while (findInitialMatches()) {
        crushInitialMatches();
        refillBoard();
    }

    // 주기적으로 매칭 확인 및 처리
    window.setInterval(function(){
        crushGems();
        slideGemsDown();
        generateNewGems();
    }, 100);
}

function createGem(r, c) {
    const gem = document.createElement('div');
    gem.classList.add('gem');
    gem.dataset.row = r;
    gem.dataset.col = c;

    const randomColor = gemColors[Math.floor(Math.random() * gemColors.length)];
    gem.style.backgroundColor = randomColor;

    // 드래그 앤 드롭 이벤트 리스너
    gem.addEventListener('dragstart', dragStart);
    gem.addEventListener('dragover', dragOver);
    gem.addEventListener('dragenter', dragEnter);
    gem.addEventListener('dragleave', dragLeave);
    gem.addEventListener('drop', dragDrop);
    gem.addEventListener('dragend', dragEnd);

    gem.draggable = true;

    return gem;
}

// --- 드래그 이벤트 핸들러 ---
function dragStart() {
    draggedGem = this;
}

function dragOver(e) {
    e.preventDefault();
}

function dragEnter(e) {
    e.preventDefault();
}

function dragLeave() { }

function dragDrop() {
    replacedGem = this;
}

function dragEnd() {
    if (!draggedGem || !replacedGem) return;

    let r1 = parseInt(draggedGem.dataset.row);
    let c1 = parseInt(draggedGem.dataset.col);
    let r2 = parseInt(replacedGem.dataset.row);
    let c2 = parseInt(replacedGem.dataset.col);

    // 인접한 보석인지 확인 (상하좌우)
    let moveIsAdjacent = Math.abs(r1 - r2) + Math.abs(c1 - c2) === 1;

    if (moveIsAdjacent) {
        swapGems(draggedGem, replacedGem);
        
        // 스왑 후 매칭이 없으면 다시 원위치
        if (!checkForMatches()) {
            setTimeout(() => swapGems(draggedGem, replacedGem), 300);
        }
    }
    
    draggedGem = null;
    replacedGem = null;
}

function swapGems(gem1, gem2) {
    // 색상 교체
    let tempColor = gem1.style.backgroundColor;
    gem1.style.backgroundColor = gem2.style.backgroundColor;
    gem2.style.backgroundColor = tempColor;
}

// --- 매칭 및 보드 처리 로직 ---

function checkForMatches() {
    let matchesFound = false;
    // 가로 매칭 확인
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols - 2; c++) {
            let gem1 = board[r][c];
            let gem2 = board[r][c + 1];
            let gem3 = board[r][c + 2];
            if (gem1.style.backgroundColor && gem1.style.backgroundColor === gem2.style.backgroundColor && gem2.style.backgroundColor === gem3.style.backgroundColor) {
                matchesFound = true;
            }
        }
    }
    // 세로 매칭 확인
    for (let c = 0; c < cols; c++) {
        for (let r = 0; r < rows - 2; r++) {
            let gem1 = board[r][c];
            let gem2 = board[r + 1][c];
            let gem3 = board[r + 2][c];
            if (gem1.style.backgroundColor && gem1.style.backgroundColor === gem2.style.backgroundColor && gem2.style.backgroundColor === gem3.style.backgroundColor) {
                matchesFound = true;
            }
        }
    }
    return matchesFound;
}

function crushGems() {
    let crushed = false;
    // 가로 매칭
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols - 2; c++) {
            let gem1 = board[r][c];
            let gem2 = board[r][c + 1];
            let gem3 = board[r][c + 2];
            if (gem1.style.backgroundColor && gem1.style.backgroundColor === gem2.style.backgroundColor && gem2.style.backgroundColor === gem3.style.backgroundColor) {
                gem1.style.backgroundColor = '';
                gem2.style.backgroundColor = '';
                gem3.style.backgroundColor = '';
                score += 30;
                crushed = true;
            }
        }
    }
    // 세로 매칭
    for (let c = 0; c < cols; c++) {
        for (let r = 0; r < rows - 2; r++) {
            let gem1 = board[r][c];
            let gem2 = board[r + 1][c];
            let gem3 = board[r + 2][c];
            if (gem1.style.backgroundColor && gem1.style.backgroundColor === gem2.style.backgroundColor && gem2.style.backgroundColor === gem3.style.backgroundColor) {
                gem1.style.backgroundColor = '';
                gem2.style.backgroundColor = '';
                gem3.style.backgroundColor = '';
                score += 30;
                crushed = true;
            }
        }
    }
    if (crushed) {
        scoreDisplay.innerText = score;
    }
}

function slideGemsDown() {
    for (let c = 0; c < cols; c++) {
        let emptyRow = rows - 1;
        for (let r = rows - 1; r >= 0; r--) {
            if (board[r][c].style.backgroundColor !== '') {
                if (emptyRow !== r) {
                    swapGems(board[emptyRow][c], board[r][c]);
                }
                emptyRow--;
            }
        }
    }
}

function generateNewGems() {
    for (let c = 0; c < cols; c++) {
        for (let r = 0; r < rows; r++) {
            if (board[r][c].style.backgroundColor === '') {
                const randomColor = gemColors[Math.floor(Math.random() * gemColors.length)];
                board[r][c].style.backgroundColor = randomColor;
            }
        }
    }
}

// --- 초기 보드 생성 시 사용되는 함수들 ---
function findInitialMatches() {
    let hasMatch = false;
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols - 2; c++) {
            if (board[r][c].style.backgroundColor === board[r][c+1].style.backgroundColor && board[r][c+1].style.backgroundColor === board[r][c+2].style.backgroundColor) {
                hasMatch = true;
            }
        }
    }
    for (let c = 0; c < cols; c++) {
        for (let r = 0; r < rows - 2; r++) {
            if (board[r][c].style.backgroundColor === board[r+1][c].style.backgroundColor && board[r+1][c].style.backgroundColor === board[r+2][c].style.backgroundColor) {
                hasMatch = true;
            }
        }
    }
    return hasMatch;
}

function crushInitialMatches() {
     for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols - 2; c++) {
            let gem1 = board[r][c];
            let gem2 = board[r][c + 1];
            let gem3 = board[r][c + 2];
            if (gem1.style.backgroundColor && gem1.style.backgroundColor === gem2.style.backgroundColor && gem2.style.backgroundColor === gem3.style.backgroundColor) {
                gem1.style.backgroundColor = '';
                gem2.style.backgroundColor = '';
                gem3.style.backgroundColor = '';
            }
        }
    }
    for (let c = 0; c < cols; c++) {
        for (let r = 0; r < rows - 2; r++) {
            let gem1 = board[r][c];
            let gem2 = board[r + 1][c];
            let gem3 = board[r + 2][c];
            if (gem1.style.backgroundColor && gem1.style.backgroundColor === gem2.style.backgroundColor && gem2.style.backgroundColor === gem3.style.backgroundColor) {
                gem1.style.backgroundColor = '';
                gem2.style.backgroundColor = '';
                gem3.style.backgroundColor = '';
            }
        }
    }
}

function refillBoard() {
    for (let c = 0; c < cols; c++) {
        let emptyRow = rows - 1;
        for (let r = rows - 1; r >= 0; r--) {
            if (board[r][c].style.backgroundColor !== '') {
                if (emptyRow !== r) {
                    swapGems(board[emptyRow][c], board[r][c]);
                }
                emptyRow--;
            }
        }
    }
    for (let c = 0; c < cols; c++) {
        for (let r = 0; r < rows; r++) {
            if (board[r][c].style.backgroundColor === '') {
                const randomColor = gemColors[Math.floor(Math.random() * gemColors.length)];
                board[r][c].style.backgroundColor = randomColor;
            }
        }
    }
}
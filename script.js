const gameBoard = document.getElementById('game-board');
const scoreDisplay = document.getElementById('score');

const rows = 8;
const cols = 8;
const gemColors = ['#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#800080', '#FFA500'];

let grid = []; // 데이터(색상)를 저장하는 2D 배열
let board = []; // DOM 요소를 저장하는 2D 배열
let score = 0;

let selectedGem = null;

window.onload = () => startGame();

function startGame() {
    // 데이터 그리드와 DOM 보드 초기화
    for (let r = 0; r < rows; r++) {
        let gridRow = [];
        let boardRow = [];
        for (let c = 0; c < cols; c++) {
            const gem = document.createElement('div');
            gem.classList.add('gem');
            gem.dataset.row = r;
            gem.dataset.col = c;
            
            addEventListeners(gem);

            gameBoard.appendChild(gem);
            gridRow.push(null); // 데이터는 나중에 채움
            boardRow.push(gem);
        }
        grid.push(gridRow);
        board.push(boardRow);
    }

    // 시작 보드 채우기 (매칭 없이)
    do {
        fillInitialGrid();
    } while (findAndMarkMatches(false)); // 매칭이 없을 때까지 반복

    renderBoard();

    // 메인 게임 루프
    setInterval(gameLoop, 150);
}

function fillInitialGrid() {
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            grid[r][c] = gemColors[Math.floor(Math.random() * gemColors.length)];
        }
    }
}

function addEventListeners(gem) {
    gem.addEventListener('click', onGemClick);
}

function onGemClick() {
    const r = parseInt(this.dataset.row);
    const c = parseInt(this.dataset.col);

    if (!selectedGem) {
        // 첫 번째 보석 선택
        selectedGem = { r, c, element: this };
        this.classList.add('selected');
    } else {
        // 두 번째 보석 선택
        const r2 = selectedGem.r;
        const c2 = selectedGem.c;

        // 인접한지 확인
        if (Math.abs(r - r2) + Math.abs(c - c2) === 1) {
            // 데이터 스왑
            swapGridData(r, c, r2, c2);

            // 스왑 후 매칭 확인
            if (checkForMatches()) {
                // 매칭 성공 - 게임 루프가 처리하도록 둠
            } else {
                // 매칭 실패 - 다시 스왑해서 원위치
                setTimeout(() => {
                    swapGridData(r, c, r2, c2);
                    renderBoard();
                }, 200);
            }
            renderBoard();
        }
        
        selectedGem.element.classList.remove('selected');
        selectedGem = null;
    }
}

function swapGridData(r1, c1, r2, c2) {
    const temp = grid[r1][c1];
    grid[r1][c1] = grid[r2][c2];
    grid[r2][c2] = temp;
}

function renderBoard() {
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            const gemElement = board[r][c];
            const color = grid[r][c];
            if (color) {
                gemElement.style.backgroundColor = color;
                gemElement.style.visibility = 'visible';
            } else {
                gemElement.style.visibility = 'hidden';
            }
        }
    }
}

function gameLoop() {
    if (findAndMarkMatches(true)) {
        updateScore();
        slideGemsDown();
        generateNewGems();
        renderBoard();
    }
}

function findAndMarkMatches(mark = false) {
    let foundMatch = false;
    let toMark = [];

    // 가로
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols - 2; c++) {
            if (grid[r][c] && grid[r][c] === grid[r][c+1] && grid[r][c+1] === grid[r][c+2]) {
                foundMatch = true;
                if (mark) {
                    toMark.push({r, c}, {r, c: c+1}, {r, c: c+2});
                }
            }
        }
    }
    // 세로
    for (let c = 0; c < cols; c++) {
        for (let r = 0; r < rows - 2; r++) {
            if (grid[r][c] && grid[r][c] === grid[r+1][c] && grid[r+1][c] === grid[r+2][c]) {
                foundMatch = true;
                if (mark) {
                    toMark.push({r, c}, {r: r+1, c}, {r: r+2, c});
                }
            }
        }
    }

    if (mark && foundMatch) {
        toMark.forEach(pos => grid[pos.r][pos.c] = null);
    }

    return foundMatch;
}

function checkForMatches() {
    return findAndMarkMatches(false);
}

function updateScore() {
    // 이 로직은 단순화되었습니다. 정확한 점수 계산을 위해선
    // findAndMarkMatches에서 지워진 블록 수를 세야 합니다.
    score += 10;
    scoreDisplay.innerText = score;
}

function slideGemsDown() {
    for (let c = 0; c < cols; c++) {
        let emptyRow = rows - 1;
        for (let r = rows - 1; r >= 0; r--) {
            if (grid[r][c]) {
                if (emptyRow !== r) {
                    grid[emptyRow][c] = grid[r][c];
                    grid[r][c] = null;
                }
                emptyRow--;
            }
        }
    }
}

function generateNewGems() {
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            if (!grid[r][c]) {
                grid[r][c] = gemColors[Math.floor(Math.random() * gemColors.length)];
            }
        }
    }
}
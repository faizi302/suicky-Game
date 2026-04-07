const TILE = 40;

function makeGrid(rows, cols) {
    return Array.from({ length: rows }, () => new Uint8Array(cols));
}

function setTile(grid, x, y, value) {
    if (y < 0 || y >= grid.length || x < 0 || x >= grid[0].length) return;
    grid[y][x] = value;
}

function fillRect(grid, x, y, w, h, value) {
    for (let row = y; row < y + h; row++) {
        for (let col = x; col < x + w; col++) {
            setTile(grid, col, row, value);
        }
    }
}

function platform(grid, x, y, length, type = 1) {
    for (let i = 0; i < length; i++) setTile(grid, x + i, y, type);
}

function blockStack(grid, x, y, w, h, value = 2) {
    fillRect(grid, x, y, w, h, value);
}

function addCoin(coins, col, row, offsetY = 16) {
    coins.push({
        x: col * TILE + TILE * 0.5 - 16,
        y: row * TILE - offsetY
    });
}

function addCoins(coins, startCol, endCol, row, offsetY = 16, skipCols = []) {
    for (let col = startCol; col <= endCol; col++) {
        if (!skipCols.includes(col)) addCoin(coins, col, row, offsetY);
    }
}

function addKey(keys, col, row, offsetY = 22) {
    keys.push({
        x: col * TILE + TILE * 0.5 - 16,
        y: row * TILE - offsetY
    });
}

function addKnife(knives, col, row) {
    knives.push({
        x: col * TILE - 10,
        y: row * TILE - 22
    });
}

function addLadder(ladders, col, bottomRow, topRow) {
    const width = 34;
    const x = col * TILE + (TILE - width) / 2;
    ladders.push({
        x,
        y: topRow * TILE - 2,
        width,
        height: (bottomRow - topRow + 1) * TILE + 4
    });
}

function carveGap(grid, startCol, width, groundRow) {
    for (let x = startCol; x < startCol + width; x++) {
        for (let y = groundRow; y < grid.length; y++) {
            setTile(grid, x, y, 0);
        }
    }
}

export function createLevel2Map() {
    const rows = 17;
    const cols = 288;
    const groundRow = 13;

    const grid = makeGrid(rows, cols);
    const coins = [];
    const keys = [];
    const knives = [];
    const enemies = [];
    const ladders = [];

    for (let x = 0; x < cols; x++) {
        setTile(grid, x, groundRow, 2);
        setTile(grid, x, groundRow + 1, 2);
        setTile(grid, x, groundRow + 2, 2);

        if (x === 0 || x === cols - 1) {
            for (let y = 0; y <= groundRow; y++) setTile(grid, x, y, 2);
        }
    }

    blockStack(grid, 3, 12, 1, 2);
    platform(grid, 6, 9, 9);
    addLadder(ladders, 10, 12, 9);
    addCoins(coins, 7, 14, 9);

    carveGap(grid, 18, 3, groundRow);
    platform(grid, 18, 10, 3);
    addCoins(coins, 18, 20, 10);
    addKnife(knives, 22, groundRow);

    enemies.push({
        x: 24 * TILE,
        y: groundRow * TILE - 50,
        patrolLeft: 22 * TILE,
        patrolRight: 29 * TILE,
        type: 0
    });

    platform(grid, 31, 11, 8);
    addCoins(coins, 32, 38, 11);
    addLadder(ladders, 40, 12, 8);
    platform(grid, 37, 8, 8);
    addCoins(coins, 38, 44, 8);

    carveGap(grid, 48, 4, groundRow);
    blockStack(grid, 47, 12, 1, 2);
    blockStack(grid, 52, 12, 1, 2);
    platform(grid, 49, 9, 3);
    addCoins(coins, 49, 51, 9);

    addLadder(ladders, 56, 12, 6);
    platform(grid, 53, 6, 10);
    addCoins(coins, 54, 62, 6);
    addKey(keys, 61, 6);

    enemies.push({
        x: 66 * TILE,
        y: groundRow * TILE - 50,
        patrolLeft: 63 * TILE,
        patrolRight: 71 * TILE,
        type: 1
    });
    addKnife(knives, 69, groundRow);
    addKnife(knives, 71, groundRow);

    carveGap(grid, 74, 3, groundRow);
    platform(grid, 74, 10, 3);
    addCoins(coins, 74, 76, 10);
    blockStack(grid, 78, 12, 1, 2);

    platform(grid, 82, 8, 12);
    addLadder(ladders, 86, 12, 8);
    addCoins(coins, 83, 93, 8);

    blockStack(grid, 96, 11, 1, 3);
    blockStack(grid, 98, 10, 1, 4);
    blockStack(grid, 100, 9, 1, 5);
    addCoins(coins, 96, 100, 8);

    carveGap(grid, 104, 5, groundRow);
    platform(grid, 104, 11, 2);
    platform(grid, 107, 9, 2);
    platform(grid, 110, 7, 3);
    addCoins(coins, 104, 106, 11);
    addCoins(coins, 107, 108, 9);
    addCoins(coins, 110, 112, 7);
    addLadder(ladders, 117, 12, 7);

    platform(grid, 116, 7, 12);
    addCoins(coins, 117, 127, 7);
    addKey(keys, 126, 7);

    enemies.push({
        x: 121 * TILE,
        y: 7 * TILE - 50,
        patrolLeft: 117 * TILE,
        patrolRight: 127 * TILE,
        type: 0
    });

    addKnife(knives, 132, groundRow);
    addKnife(knives, 133, groundRow);
    addKnife(knives, 134, groundRow);

    carveGap(grid, 136, 3, groundRow);
    blockStack(grid, 139, 12, 1, 2);
    platform(grid, 141, 10, 8);
    addCoins(coins, 142, 148, 10);
    addLadder(ladders, 145, 12, 10);

    platform(grid, 152, 6, 13);
    addCoins(coins, 153, 164, 6);

    enemies.push({
        x: 157 * TILE,
        y: 6 * TILE - 50,
        patrolLeft: 153 * TILE,
        patrolRight: 164 * TILE,
        type: 1
    });

    carveGap(grid, 169, 4, groundRow);
    platform(grid, 169, 10, 4);
    platform(grid, 174, 8, 4);
    addCoins(coins, 169, 172, 10);
    addCoins(coins, 174, 177, 8);
    addLadder(ladders, 176, 12, 8);

    blockStack(grid, 181, 12, 1, 2);
    blockStack(grid, 182, 11, 1, 3);
    blockStack(grid, 183, 10, 1, 4);
    blockStack(grid, 184, 9, 1, 5);
    platform(grid, 186, 8, 9);
    addCoins(coins, 187, 194, 8);

    enemies.push({
        x: 190 * TILE,
        y: 8 * TILE - 50,
        patrolLeft: 186 * TILE,
        patrolRight: 194 * TILE,
        type: 0
    });

    addKnife(knives, 198, groundRow);
    addKnife(knives, 200, groundRow);
    carveGap(grid, 202, 4, groundRow);

    platform(grid, 206, 11, 9);
    addCoins(coins, 207, 214, 11);
    addLadder(ladders, 210, 12, 11);

    platform(grid, 219, 7, 12);
    addCoins(coins, 220, 230, 7);
    addKey(keys, 228, 7);

    enemies.push({
        x: 225 * TILE,
        y: 7 * TILE - 50,
        patrolLeft: 220 * TILE,
        patrolRight: 230 * TILE,
        type: 1
    });

    carveGap(grid, 234, 3, groundRow);
    blockStack(grid, 238, 12, 1, 2);
    platform(grid, 240, 9, 7);
    addCoins(coins, 241, 246, 9);
    addLadder(ladders, 244, 12, 9);

    platform(grid, 250, 6, 12);
    addCoins(coins, 251, 260, 6);

    addKnife(knives, 264, groundRow);
    addKnife(knives, 265, groundRow);
    addKnife(knives, 266, groundRow);

    enemies.push({
        x: 258 * TILE,
        y: 6 * TILE - 50,
        patrolLeft: 251 * TILE,
        patrolRight: 260 * TILE,
        type: 0
    });

    carveGap(grid, 270, 4, groundRow);
    platform(grid, 270, 10, 3);
    addCoins(coins, 270, 272, 10);

    blockStack(grid, 276, 12, 2, 1);
    blockStack(grid, 278, 11, 2, 2);
    blockStack(grid, 280, 10, 2, 3);
    platform(grid, 283, 9, 4);
    addCoins(coins, 283, 286, 9);

    const door = {
        x: 283 * TILE,
        y: 12 * TILE,
        width: 52,
        height: 120,
        col: 287,
        row: 9
    };

    return {
        id: 2,
        name: 'Level 2',
        timerMs: 220000,
        progressUnits: 170,
        grid,
        coins,
        keys,
        knives,
        enemies,
        ladders,
        door,
        rows,
        cols,
        groundRow,
        totalCoinsRequiredToOpenDoor: coins.length
    };
}
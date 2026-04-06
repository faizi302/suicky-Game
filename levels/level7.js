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

export function createLevel7Map() {
    const rows = 17;
    const cols = 446;
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
    platform(grid, 6, 10, 6);
    addLadder(ladders, 8, 12, 10);
    addCoins(coins, 6, 11, 10);

    carveGap(grid, 14, 7, groundRow);
    platform(grid, 14, 11, 2);
    platform(grid, 17, 9, 2);
    platform(grid, 20, 7, 2);
    platform(grid, 23, 5, 2);
    platform(grid, 26, 3, 2);
    platform(grid, 29, 2, 3);
    addCoins(coins, 14, 15, 11);
    addCoins(coins, 17, 18, 9);
    addCoins(coins, 20, 21, 7);
    addCoins(coins, 23, 24, 5);
    addCoins(coins, 26, 27, 3);
    addCoins(coins, 29, 31, 2);

    addLadder(ladders, 33, 12, 2);
    platform(grid, 36, 2, 15);
    addCoins(coins, 37, 50, 2);
    addKey(keys, 49, 2);

    enemies.push({
        x: 43 * TILE,
        y: 2 * TILE - 50,
        patrolLeft: 37 * TILE,
        patrolRight: 50 * TILE,
        type: 0
    });

    addKnife(knives, 54, groundRow);
    addKnife(knives, 55, groundRow);
    addKnife(knives, 56, groundRow);
    carveGap(grid, 59, 8, groundRow);

    platform(grid, 59, 10, 3);
    platform(grid, 64, 8, 3);
    platform(grid, 68, 6, 4);
    addCoins(coins, 59, 61, 10);
    addCoins(coins, 64, 66, 8);
    addCoins(coins, 68, 71, 6);

    blockStack(grid, 75, 12, 1, 2);
    blockStack(grid, 76, 11, 1, 3);
    blockStack(grid, 77, 10, 1, 4);
    blockStack(grid, 78, 9, 1, 5);
    platform(grid, 81, 7, 11);
    addCoins(coins, 82, 91, 7);
    addLadder(ladders, 86, 12, 7);

    enemies.push({
        x: 87 * TILE,
        y: 7 * TILE - 50,
        patrolLeft: 82 * TILE,
        patrolRight: 91 * TILE,
        type: 1
    });

    carveGap(grid, 95, 9, groundRow);
    platform(grid, 95, 11, 2);
    platform(grid, 98, 9, 2);
    platform(grid, 101, 7, 2);
    platform(grid, 104, 5, 2);
    platform(grid, 107, 3, 2);
    platform(grid, 110, 1, 3);
    addCoins(coins, 95, 96, 11);
    addCoins(coins, 98, 99, 9);
    addCoins(coins, 101, 102, 7);
    addCoins(coins, 104, 105, 5);
    addCoins(coins, 107, 108, 3);
    addCoins(coins, 110, 112, 1);

    addLadder(ladders, 114, 12, 1);
    platform(grid, 117, 1, 16);
    addCoins(coins, 118, 132, 1);
    addKey(keys, 131, 1);

    enemies.push({
        x: 125 * TILE,
        y: 1 * TILE - 50,
        patrolLeft: 118 * TILE,
        patrolRight: 132 * TILE,
        type: 0
    });

    addKnife(knives, 136, groundRow);
    addKnife(knives, 137, groundRow);
    addKnife(knives, 138, groundRow);

    carveGap(grid, 141, 7, groundRow);
    platform(grid, 141, 10, 2);
    platform(grid, 144, 8, 2);
    platform(grid, 147, 6, 2);
    platform(grid, 150, 4, 3);
    addCoins(coins, 141, 142, 10);
    addCoins(coins, 144, 145, 8);
    addCoins(coins, 147, 148, 6);
    addCoins(coins, 150, 152, 4);

    blockStack(grid, 156, 12, 1, 2);
    platform(grid, 158, 9, 9);
    addCoins(coins, 159, 166, 9);
    addLadder(ladders, 162, 12, 9);

    platform(grid, 170, 6, 12);
    addCoins(coins, 171, 181, 6);

    enemies.push({
        x: 176 * TILE,
        y: 6 * TILE - 50,
        patrolLeft: 171 * TILE,
        patrolRight: 181 * TILE,
        type: 1
    });

    carveGap(grid, 185, 10, groundRow);
    platform(grid, 185, 11, 2);
    platform(grid, 188, 9, 2);
    platform(grid, 191, 7, 2);
    platform(grid, 194, 5, 2);
    platform(grid, 197, 3, 2);
    platform(grid, 200, 1, 2);
    platform(grid, 203, 0, 3);
    addCoins(coins, 185, 186, 11);
    addCoins(coins, 188, 189, 9);
    addCoins(coins, 191, 192, 7);
    addCoins(coins, 194, 195, 5);
    addCoins(coins, 197, 198, 3);
    addCoins(coins, 200, 201, 1);
    addCoins(coins, 203, 205, 0);

    addLadder(ladders, 207, 12, 0);
    platform(grid, 210, 0, 17);
    addCoins(coins, 211, 226, 0);
    addKey(keys, 225, 0);

    enemies.push({
        x: 218 * TILE,
        y: 0 * TILE - 50,
        patrolLeft: 211 * TILE,
        patrolRight: 226 * TILE,
        type: 1
    });

    addKnife(knives, 230, groundRow);
    addKnife(knives, 231, groundRow);
    addKnife(knives, 232, groundRow);

    carveGap(grid, 235, 8, groundRow);
    platform(grid, 235, 10, 3);
    platform(grid, 240, 8, 3);
    addCoins(coins, 235, 237, 10);
    addCoins(coins, 240, 242, 8);

    blockStack(grid, 246, 12, 1, 2);
    blockStack(grid, 247, 11, 1, 3);
    blockStack(grid, 248, 10, 1, 4);
    blockStack(grid, 249, 9, 1, 5);
    platform(grid, 252, 7, 11);
    addCoins(coins, 253, 262, 7);
    addLadder(ladders, 257, 12, 7);

    enemies.push({
        x: 258 * TILE,
        y: 7 * TILE - 50,
        patrolLeft: 253 * TILE,
        patrolRight: 262 * TILE,
        type: 0
    });

    carveGap(grid, 266, 9, groundRow);
    platform(grid, 266, 11, 2);
    platform(grid, 269, 9, 2);
    platform(grid, 272, 7, 2);
    platform(grid, 275, 5, 2);
    platform(grid, 278, 3, 2);
    platform(grid, 281, 1, 3);
    addCoins(coins, 266, 267, 11);
    addCoins(coins, 269, 270, 9);
    addCoins(coins, 272, 273, 7);
    addCoins(coins, 275, 276, 5);
    addCoins(coins, 278, 279, 3);
    addCoins(coins, 281, 283, 1);

    addLadder(ladders, 285, 12, 1);
    platform(grid, 288, 1, 15);
    addCoins(coins, 289, 302, 1);
    addKey(keys, 301, 1);

    enemies.push({
        x: 295 * TILE,
        y: 1 * TILE - 50,
        patrolLeft: 289 * TILE,
        patrolRight: 302 * TILE,
        type: 0
    });

    addKnife(knives, 306, groundRow);
    addKnife(knives, 307, groundRow);
    carveGap(grid, 310, 7, groundRow);

    platform(grid, 310, 10, 3);
    platform(grid, 315, 8, 4);
    addCoins(coins, 310, 312, 10);
    addCoins(coins, 315, 318, 8);

    blockStack(grid, 322, 12, 1, 2);
    platform(grid, 324, 7, 10);
    addCoins(coins, 325, 333, 7);
    addLadder(ladders, 328, 12, 7);

    platform(grid, 338, 4, 15);
    addCoins(coins, 339, 352, 4);

    enemies.push({
        x: 345 * TILE,
        y: 4 * TILE - 50,
        patrolLeft: 339 * TILE,
        patrolRight: 352 * TILE,
        type: 1
    });

    carveGap(grid, 356, 10, groundRow);
    platform(grid, 356, 11, 2);
    platform(grid, 359, 9, 2);
    platform(grid, 362, 7, 2);
    platform(grid, 365, 5, 2);
    addCoins(coins, 356, 357, 11);
    addCoins(coins, 359, 360, 9);
    addCoins(coins, 362, 363, 7);
    addCoins(coins, 365, 366, 5);

    addLadder(ladders, 368, 12, 5);
    platform(grid, 371, 5, 14);
    addCoins(coins, 372, 384, 5);
    addKey(keys, 383, 5);

    enemies.push({
        x: 378 * TILE,
        y: 5 * TILE - 50,
        patrolLeft: 372 * TILE,
        patrolRight: 384 * TILE,
        type: 1
    });

    addKnife(knives, 388, groundRow);
    addKnife(knives, 389, groundRow);
    addKnife(knives, 390, groundRow);

    carveGap(grid, 393, 6, groundRow);
    platform(grid, 393, 10, 3);
    platform(grid, 398, 8, 3);
    addCoins(coins, 393, 395, 10);
    addCoins(coins, 398, 400, 8);

    blockStack(grid, 404, 12, 1, 2);
    blockStack(grid, 405, 11, 1, 3);
    blockStack(grid, 406, 10, 1, 4);
    platform(grid, 410, 8, 10);
    addCoins(coins, 411, 419, 8);
    addLadder(ladders, 414, 12, 8);

    enemies.push({
        x: 415 * TILE,
        y: 8 * TILE - 50,
        patrolLeft: 411 * TILE,
        patrolRight: 419 * TILE,
        type: 0
    });

    blockStack(grid, 426, 12, 2, 1);
    blockStack(grid, 428, 11, 2, 2);
    blockStack(grid, 430, 10, 2, 3);
    platform(grid, 434, 9, 8);
    addCoins(coins, 434, 441, 9);

    const door = {
        x: 444 * TILE,
        y: 9 * TILE,
        width: 52,
        height: 120,
        col: 444,
        row: 9
    };

    return {
        id: 7,
        name: 'Level 7',
        timerMs: 385000,
        progressUnits: 330,
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
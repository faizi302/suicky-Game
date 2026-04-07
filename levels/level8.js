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

export function createLevel8Map() {
    const rows = 17;
    const cols = 486;
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

    carveGap(grid, 14, 8, groundRow);
    platform(grid, 14, 11, 2);
    platform(grid, 17, 9, 2);
    platform(grid, 20, 7, 2);
    platform(grid, 23, 5, 2);
    platform(grid, 26, 3, 2);
    platform(grid, 29, 5, 3);
    addCoins(coins, 14, 15, 11);
    addCoins(coins, 17, 18, 9);
    addCoins(coins, 20, 21, 7);
    addCoins(coins, 23, 24, 5);
    addCoins(coins, 26, 27, 3);
    addCoins(coins, 29, 31, 5);

    addLadder(ladders, 38, 12, 8);
    platform(grid, 36, 8, 16);
    addCoins(coins, 37, 51, 8);
    addKey(keys, 54, 7);

    enemies.push({
        x: 43 * TILE,
        y: 1 * TILE - 50,
        patrolLeft: 37 * TILE,
        patrolRight: 51 * TILE,
        type: 1
    });

    addKnife(knives, 55, groundRow);
    addKnife(knives, 56, groundRow);
    addKnife(knives, 57, groundRow);
    carveGap(grid, 60, 9, groundRow);

    platform(grid, 60, 10, 3);
    platform(grid, 65, 8, 3);
    platform(grid, 69, 6, 3);
    addCoins(coins, 60, 62, 10);
    addCoins(coins, 65, 67, 8);
    addCoins(coins, 69, 71, 6);

    blockStack(grid, 75, 12, 1, 2);
    blockStack(grid, 76, 11, 1, 3);
    blockStack(grid, 77, 10, 1, 4);
    blockStack(grid, 78, 9, 1, 5);
    blockStack(grid, 79, 8, 1, 6);
    platform(grid, 82, 6, 12);
    addCoins(coins, 83, 93, 6);
    addLadder(ladders, 87, 12, 6);

    enemies.push({
        x: 88 * TILE,
        y: 6 * TILE - 50,
        patrolLeft: 83 * TILE,
        patrolRight: 93 * TILE,
        type: 0
    });

    carveGap(grid, 97, 10, groundRow);
    platform(grid, 97, 11, 2);
    platform(grid, 100, 9, 2);
    platform(grid, 103, 7, 2);
    platform(grid, 106, 5, 2);
    platform(grid, 109, 3, 2);
    platform(grid, 112, 6, 2);
    platform(grid, 115, 10, 3);
    addCoins(coins, 97, 98, 11);
    addCoins(coins, 100, 101, 9);
    addCoins(coins, 103, 104, 7);
    addCoins(coins, 106, 107, 5);
    addCoins(coins, 109, 110, 3);
    addCoins(coins, 112, 113, 6);
    addCoins(coins, 115, 117, 10);

    addLadder(ladders, 124, 12, 6);
    platform(grid, 122, 6, 17);
    addCoins(coins, 123, 138, 6);
    addKey(keys, 137, 6);

    enemies.push({
        x: 130 * TILE,
        y: 0 * TILE - 50,
        patrolLeft: 123 * TILE,
        patrolRight: 138 * TILE,
        type: 1
    });

    addKnife(knives, 142, groundRow);
    addKnife(knives, 143, groundRow);
    addKnife(knives, 144, groundRow);

    carveGap(grid, 147, 8, groundRow);
    platform(grid, 147, 10, 3);
    platform(grid, 152, 8, 3);
    addCoins(coins, 147, 149, 10);
    addCoins(coins, 152, 154, 8);

    blockStack(grid, 158, 12, 1, 2);
    blockStack(grid, 159, 11, 1, 3);
    blockStack(grid, 160, 10, 1, 4);
    blockStack(grid, 161, 9, 1, 5);
    platform(grid, 164, 7, 11);
    addCoins(coins, 165, 174, 7);
    addLadder(ladders, 165, 12, 7);

    enemies.push({
        x: 170 * TILE,
        y: 7 * TILE - 50,
        patrolLeft: 165 * TILE,
        patrolRight: 174 * TILE,
        type: 0
    });

    carveGap(grid, 178, 10, groundRow);
    platform(grid, 178, 11, 2);
    platform(grid, 181, 9, 2);
    platform(grid, 184, 7, 2);
    platform(grid, 187, 5, 2);
    platform(grid, 190, 3, 2);
    platform(grid, 193, 5, 2);
    platform(grid, 196, 7, 3);
    addCoins(coins, 178, 179, 11);
    addCoins(coins, 181, 182, 9);
    addCoins(coins, 184, 185, 7);
    addCoins(coins, 187, 188, 5);
    addCoins(coins, 190, 191, 3);
    addCoins(coins, 193, 194, 5);
    addCoins(coins, 196, 198, 7);

    addLadder(ladders, 204, 12, 4);
    platform(grid, 203, 4, 18);
    addCoins(coins, 204, 220, 4);
    addKey(keys, 219, 4);

    enemies.push({
        x: 212 * TILE,
        y: 0 * TILE - 50,
        patrolLeft: 204 * TILE,
        patrolRight: 220 * TILE,
        type: 0
    });

    addKnife(knives, 224, groundRow);
    addKnife(knives, 225, groundRow);
    addKnife(knives, 226, groundRow);

    carveGap(grid, 229, 8, groundRow);
    platform(grid, 229, 10, 3);
    platform(grid, 234, 8, 3);
    addCoins(coins, 229, 231, 10);
    addCoins(coins, 234, 236, 8);

    blockStack(grid, 240, 12, 1, 2);
    blockStack(grid, 241, 11, 1, 3);
    blockStack(grid, 242, 10, 1, 4);
    blockStack(grid, 243, 9, 1, 5);
    platform(grid, 246, 7, 11);
    addCoins(coins, 247, 256, 7);
    addLadder(ladders, 249, 12, 7);

    enemies.push({
        x: 252 * TILE,
        y: 7 * TILE - 50,
        patrolLeft: 247 * TILE,
        patrolRight: 256 * TILE,
        type: 1
    });

    carveGap(grid, 260, 10, groundRow);
    platform(grid, 260, 11, 2);
    platform(grid, 263, 9, 2);
    platform(grid, 266, 7, 2);
    platform(grid, 269, 5, 2);
    platform(grid, 272, 3, 2);
    platform(grid, 275, 6, 2);
    platform(grid, 278, 10, 3);
    addCoins(coins, 260, 261, 11);
    addCoins(coins, 263, 264, 9);
    addCoins(coins, 266, 267, 7);
    addCoins(coins, 269, 270, 5);
    addCoins(coins, 272, 273, 3);
    addCoins(coins, 275, 276, 10);
    addCoins(coins, 278, 280, 6);

    addLadder(ladders, 287, 12, 6);
    platform(grid, 285, 6, 18);
    addCoins(coins, 286, 302, 6);
    addKey(keys, 301, 6);

    enemies.push({
        x: 294 * TILE,
        y: 0 * TILE - 50,
        patrolLeft: 286 * TILE,
        patrolRight: 302 * TILE,
        type: 1
    });

    addKnife(knives, 306, groundRow);
    addKnife(knives, 307, groundRow);
    addKnife(knives, 308, groundRow);

    carveGap(grid, 311, 8, groundRow);
    platform(grid, 311, 10, 3);
    platform(grid, 316, 8, 3);
    addCoins(coins, 311, 313, 10);
    addCoins(coins, 316, 318, 8);

    blockStack(grid, 322, 12, 1, 2);
    blockStack(grid, 323, 11, 1, 3);
    blockStack(grid, 324, 10, 1, 4);
    blockStack(grid, 325, 9, 1, 5);
    platform(grid, 328, 7, 11);
    addCoins(coins, 329, 338, 7);
    addLadder(ladders, 330, 12, 7);

    enemies.push({
        x: 334 * TILE,
        y: 7 * TILE - 50,
        patrolLeft: 329 * TILE,
        patrolRight: 338 * TILE,
        type: 0
    });

    carveGap(grid, 342, 10, groundRow);
    platform(grid, 342, 11, 2);
    platform(grid, 345, 9, 2);
    platform(grid, 348, 7, 2);
    platform(grid, 351, 5, 2);
    platform(grid, 354, 3, 2);
    platform(grid, 357, 8, 2);
    platform(grid, 360, 6, 3);
    addCoins(coins, 342, 343, 11);
    addCoins(coins, 345, 346, 9);
    addCoins(coins, 348, 349, 7);
    addCoins(coins, 351, 352, 5);
    addCoins(coins, 354, 355, 3);
    addCoins(coins, 357, 358, 8);
    addCoins(coins, 360, 362, 6);

    addLadder(ladders, 368, 12, 5);
    platform(grid, 367, 5, 18);
    addCoins(coins, 368, 384, 5);
    addKey(keys, 383, 5);

    enemies.push({
        x: 376 * TILE,
        y: 0 * TILE - 50,
        patrolLeft: 368 * TILE,
        patrolRight: 384 * TILE,
        type: 0
    });

    addKnife(knives, 388, groundRow);
    addKnife(knives, 389, groundRow);
    addKnife(knives, 390, groundRow);

    carveGap(grid, 393, 8, groundRow);
    platform(grid, 393, 10, 3);
    platform(grid, 398, 8, 3);
    addCoins(coins, 393, 395, 10);
    addCoins(coins, 398, 400, 8);

    blockStack(grid, 404, 12, 1, 2);
    blockStack(grid, 405, 11, 1, 3);
    blockStack(grid, 406, 10, 1, 4);
    blockStack(grid, 407, 9, 1, 5);
    platform(grid, 410, 7, 11);
    addCoins(coins, 411, 420, 7);
    addLadder(ladders, 413, 12, 7);

    enemies.push({
        x: 416 * TILE,
        y: 7 * TILE - 50,
        patrolLeft: 411 * TILE,
        patrolRight: 420 * TILE,
        type: 1
    });

    carveGap(grid, 424, 9, groundRow);
    platform(grid, 424, 11, 2);
    platform(grid, 427, 9, 2);
    platform(grid, 430, 7, 2);
    platform(grid, 433, 5, 2);
    addCoins(coins, 424, 425, 11);
    addCoins(coins, 427, 428, 9);
    addCoins(coins, 430, 431, 7);
    addCoins(coins, 433, 434, 5);

    addLadder(ladders, 436, 12, 5);
    platform(grid, 439, 5, 16);
    addCoins(coins, 440, 454, 5);
    addKey(keys, 453, 5);

    enemies.push({
        x: 447 * TILE,
        y: 5 * TILE - 50,
        patrolLeft: 440 * TILE,
        patrolRight: 454 * TILE,
        type: 1
    });

    addKnife(knives, 458, groundRow);
    addKnife(knives, 459, groundRow);
    addKnife(knives, 460, groundRow);

    carveGap(grid, 463, 5, groundRow);

    blockStack(grid, 470, 12, 2, 1);
    blockStack(grid, 472, 11, 2, 2);
    blockStack(grid, 474, 10, 2, 3);
    blockStack(grid, 476, 9, 2, 4);
    platform(grid, 480, 8, 5);
    addCoins(coins, 480, 484, 8);

    const door = {
        x: 484 * TILE,
        y: 11.5 * TILE,
        width: 52,
        height: 120,
        col: 484,
        row: 8
    };

    return {
        id: 8,
        name: 'Level 8',
        timerMs: 430000,
        progressUnits: 380,
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
const TILE = 40;

function makeGrid(rows, cols) {
    return Array.from({ length: rows }, () => new Uint8Array(cols));
}
function setTile(grid, x, y, value) {
    if (y < 0 || y >= grid.length || x < 0 || x >= grid[0].length) return;
    grid[y][x] = value;
}
function fillRect(grid, x, y, w, h, value) {
    for (let row = y; row < y + h; row++)
        for (let col = x; col < x + w; col++)
            setTile(grid, col, row, value);
}
function platform(grid, x, y, length, type = 1) {
    for (let i = 0; i < length; i++) setTile(grid, x + i, y, type);
}
function blockStack(grid, x, y, w, h, value = 2) {
    fillRect(grid, x, y, w, h, value);
}
function addCoin(coins, col, row) {
    coins.push({ x: col * TILE + TILE * 0.5 - 16, y: row * TILE - 16 });
}
function addCoins(coins, s, e, row) {
    for (let c = s; c <= e; c++) addCoin(coins, c, row);
}
function addKey(keys, col, row) {
    keys.push({ x: col * TILE + TILE * 0.5 - 16, y: row * TILE - 22 });
}
function addKnife(knives, col, row) {
    knives.push({ x: col * TILE - 10, y: row * TILE - 22 });
}
function addLadder(ladders, col, bottomRow, topRow) {
    const width = 34;
    ladders.push({
        x: col * TILE + (TILE - width) / 2,
        y: topRow * TILE - 2,
        width,
        height: (bottomRow - topRow + 1) * TILE + 4
    });
}
function addEnemy(enemies, col, row, lCol, rCol, type = 0) {
    enemies.push({
        x: col * TILE,
        y: row * TILE - 50,
        patrolLeft: lCol * TILE,
        patrolRight: rCol * TILE,
        type
    });
}
function carveGap(grid, startCol, width, groundRow) {
    for (let x = startCol; x < startCol + width; x++)
        for (let y = groundRow; y < grid.length; y++)
            setTile(grid, x, y, 0);
}

// moving platform helper (same style as your level10/level11 logic)
function mp(movingPlatforms, col, row, speed, minRow, maxRow, frameIndices = [9, 10, 11]) {
    movingPlatforms.push({
        x: col * TILE,
        y: row * TILE,
        width: TILE,
        height: TILE,
        axis: 'y',
        speed,
        min: minRow * TILE,
        max: maxRow * TILE,
        frameIndices
    });
    movingPlatforms.push({
        x: (col + 0.7) * TILE,
        y: row * TILE,
        width: TILE,
        height: TILE,
        axis: 'y',
        speed,
        min: minRow * TILE,
        max: maxRow * TILE,
        frameIndices
    });
}

export function createLevel11Map() {
    const rows = 17;
    const cols = 400; // reduced from 600 to 400
    const groundRow = 13;

    const grid = makeGrid(rows, cols);
    const coins = [];
    const keys = [];
    const knives = [];
    const enemies = [];
    const ladders = [];
    const movingPlatforms = [];

    // Ground + boundary walls
    for (let x = 0; x < cols; x++) {
        setTile(grid, x, groundRow, 2);
        setTile(grid, x, groundRow + 1, 2);
        setTile(grid, x, groundRow + 2, 2);

        if (x === 0 || x === cols - 1) {
            for (let y = 0; y <= groundRow; y++) setTile(grid, x, y, 2);
        }
    }

    // ══════════════════════════════════════════════════
    // SECTION 1 — Spiraling entry tower (cols 0–70)
    // ══════════════════════════════════════════════════
    for (let y = 0; y <= groundRow; y++) {
        if (y !== 9 && y !== 10) setTile(grid, 5, y, 2);
    }
    for (let y = 0; y <= groundRow; y++) {
        if (y !== 9 && y !== 10) setTile(grid, 35, y, 2);
    }

    platform(grid, 6, 4, 13);
    addCoins(coins, 5, 10, 4);
    addKey(keys, 6, 4);

    platform(grid, 6, 11, 10);
    addCoins(coins, 6, 15, 11);
    addEnemy(enemies, 10, 11, 6, 15, 0);

    platform(grid, 21, 11, 14);
    addCoins(coins, 21, 34, 11);

    platform(grid, 5, 9, 10);
    addCoins(coins, 6, 10, 9);

    platform(grid, 6, 6, 6);
    addCoins(coins, 6, 8, 6);
    addEnemy(enemies, 10, 6, 6, 15, 0);

    platform(grid, 21, 5, 14);
    addCoins(coins, 21, 34, 5);
    addKey(keys, 33, 5);

    addLadder(ladders, 18, 12, 4);

    addKnife(knives, 23, 13);

    carveGap(grid, 37, 6, groundRow);
    platform(grid, 37, 13, 3);
    addCoins(coins, 37, 40, 10);

    platform(grid, 43, 8, 4);
    addCoins(coins, 43, 46, 8);

    platform(grid, 49, 6, 4);
    addCoins(coins, 49, 52, 6);

    platform(grid, 55, 8, 4);
    addCoins(coins, 55, 58, 8);

    platform(grid, 61, 10, 4);
    addCoins(coins, 61, 64, 10);

    addLadder(ladders, 44, 12, 8);
    addLadder(ladders, 50, 12, 6);
    addLadder(ladders, 56, 12, 8);
    addLadder(ladders, 62, 12, 10);

    mp(movingPlatforms, 41, 9, 1.8, 6, 11, [9, 10, 11]);
    mp(movingPlatforms, 47, 7, 2.2, 5, 10, [10, 9, 11]);
    mp(movingPlatforms, 53, 7, 1.6, 5, 10, [11, 10, 9]);
    mp(movingPlatforms, 59, 9, 2.0, 6, 11, [9, 11, 10]);

    addKnife(knives, 67, groundRow);
    addKnife(knives, 67.5, groundRow);
    addKnife(knives, 68, groundRow);

    // ══════════════════════════════════════════════════
    // SECTION 2 — Crossroads (cols 70–140)
    // ══════════════════════════════════════════════════
    carveGap(grid, 70, 15, groundRow);

    platform(grid, 80, 4, 12);
    addCoins(coins, 81, 91, 4);
    addKey(keys, 91, 4);
    addEnemy(enemies, 85, 4, 81, 91, 0);
    addLadder(ladders, 85, 12, 4);

    platform(grid, 70, 11, 4);
    addCoins(coins, 70, 73, 11);

    platform(grid, 79, 9, 4);
    addCoins(coins, 79, 82, 9);

    addLadder(ladders, 79, 8, 6);
    mp(movingPlatforms, 76, 12, 2.0, 8, 11, [10, 9, 11]);

    platform(grid, 94, 6, 6);
    addCoins(coins, 94, 97, 6);
    addEnemy(enemies, 94, 6, 98, 97, 1);

    platform(grid, 100, 4, 6);
    addCoins(coins, 100, 105, 4);
    addKey(keys, 105, 4);
    addLadder(ladders, 101, 12, 4);

    platform(grid, 70, 6, 10);
    addCoins(coins, 71, 79, 6);
    addEnemy(enemies, 74, 6, 71, 79, 0);
    addLadder(ladders, 72, 10, 6);

    platform(grid, 108, 9, 6);
    addCoins(coins, 109, 113, 9);
    addEnemy(enemies, 111, 9, 109, 113, 0);

    platform(grid, 116, 6, 8);
    addCoins(coins, 117, 123, 6);
    addEnemy(enemies, 120, 6, 117, 123, 1);

    addLadder(ladders, 109, 12, 9);
    addLadder(ladders, 118, 12, 6);

    addKnife(knives, 126, groundRow);
    addKnife(knives, 127, groundRow);

    carveGap(grid, 130, 10, groundRow);

    // ══════════════════════════════════════════════════
    // SECTION 3 — Moving platform river (cols 130–190)
    // ══════════════════════════════════════════════════
    for (let i = 0; i < 6; i++) {
        const col = 131 + i * 3;
        const row = 5 + (i % 5);
        const spd = 1.2 + (i % 4) * 0.4;
        const fi = [[9, 10, 11], [10, 11, 9], [11, 9, 10]][i % 3];

        mp(movingPlatforms, col, row, spd, 5, 11, fi);
        addCoin(coins, col, row);
        addCoin(coins, col + 1, row);
    }

    platform(grid, 132, 13, 4);
    addCoins(coins, 132, 135, 13);

    platform(grid, 150, 5, 5);
    addCoins(coins, 150, 154, 5);
    addKey(keys, 154, 5);

    platform(grid, 168, 11, 4);
    addCoins(coins, 168, 171, 11);

    platform(grid, 182, 5, 5);
    addCoins(coins, 182, 186, 5);
    addKey(keys, 186, 5);

    addEnemy(enemies, 151, 5, 150, 154, 1);
    addEnemy(enemies, 183, 5, 182, 186, 0);

    addLadder(ladders, 183, 12, 5);

    addKnife(knives, 145, 13);
    addKnife(knives, 162, 13);
    addKnife(knives, 178, 13);

    // ══════════════════════════════════════════════════
    // SECTION 4 — The Great Wall (cols 190–230)
    // ══════════════════════════════════════════════════
    for (let x = 200; x <= 215; x++) {
        for (let y = 0; y <= 12; y++) setTile(grid, x, y, 2);
    }

    for (let x = 200; x <= 215; x++) {
        setTile(grid, x, 11, 0);
        setTile(grid, x, 12, 0);
        setTile(grid, x, 7, 0);
        setTile(grid, x, 8, 0);
        setTile(grid, x, 5, 0);
        setTile(grid, x, 6, 0);
    }

    platform(grid, 192, 11, 8);
    addCoins(coins, 193, 199, 11);
    addEnemy(enemies, 196, 11, 193, 199, 0);

    platform(grid, 188, 7, 8);
    addCoins(coins, 188, 194, 7);
    addEnemy(enemies, 196, 7, 193, 199, 1);

    platform(grid, 192, 5, 8);
    addCoins(coins, 193, 199, 5);
    addKey(keys, 199, 5);

    addLadder(ladders, 194, 10, 7);

    platform(grid, 216, 11, 8);
    addCoins(coins, 217, 223, 11);
    addEnemy(enemies, 220, 11, 217, 223, 1);

    platform(grid, 220, 8, 8);
    addCoins(coins, 220, 223, 8);

    platform(grid, 216, 4, 8);
    addCoins(coins, 217, 223, 4);
    addKey(keys, 223, 4);

    addLadder(ladders, 220, 10, 8);
    addLadder(ladders, 222, 7, 4);

    carveGap(grid, 228, 10, groundRow);

    // ══════════════════════════════════════════════════
    // SECTION 5 — Double helix towers (cols 230–270)
    // ══════════════════════════════════════════════════
    for (let y = 4; y <= 12; y++) {
        if (y !== 9 && y !== 10 && y !== 11) setTile(grid, 230, y, 2);
        if (y !== 5 && y !== 6) setTile(grid, 245, y, 2);
    }
    for (let y = 4; y <= 12; y++) {
        if (y !== 10 && y !== 11) setTile(grid, 250, y, 2);
        if (y !== 5 && y !== 6) setTile(grid, 265, y, 2);
    }

    platform(grid, 230, 4, 14);
    platform(grid, 250, 4, 14);

    platform(grid, 231, 12, 6);
    addCoins(coins, 231, 236, 12);
    addEnemy(enemies, 234, 12, 231, 237, 0);

  

    platform(grid, 230, 9, 7);
    addCoins(coins, 231, 237, 9);
    addEnemy(enemies, 234, 9, 231, 237, 1);

    platform(grid, 238, 7, 7);
    addCoins(coins, 238, 244, 7);
    addKey(keys, 244, 7);

    addLadder(ladders, 232, 11, 9);
    addLadder(ladders, 233, 8, 4);

    platform(grid, 251, 12, 7);
    addCoins(coins, 251, 257, 12);
    addEnemy(enemies, 254, 12, 251, 257, 0);

    platform(grid, 258, 9, 7);
    addCoins(coins, 258, 264, 9);
     addKey(keys, 260, 9);

    platform(grid, 251, 7, 7);
    addCoins(coins, 251, 257, 7);
    addEnemy(enemies, 254, 7, 251, 257, 1);

 
   

    addLadder(ladders, 252, 11, 7);
    addLadder(ladders, 253, 6, 4);



    addKnife(knives, 247, groundRow);
    addKnife(knives, 247.5, groundRow);
    addKnife(knives, 267, groundRow);
    addKnife(knives, 268, groundRow);
    carveGap(grid, 270, 10, groundRow);

    // ══════════════════════════════════════════════════
    // SECTION 6 — Descent labyrinth (cols 270–360)
    // ══════════════════════════════════════════════════
    platform(grid, 272, 4, 12);
    addCoins(coins, 273, 283, 4);
    addEnemy(enemies, 277, 4, 273, 283, 0);

    platform(grid, 292, 4, 12);
    addCoins(coins, 293, 303, 4);
    addKey(keys, 303, 4);

    platform(grid, 312, 4, 12);
    addCoins(coins, 313, 323, 4);
    addEnemy(enemies, 317, 4, 313, 323, 1);

    platform(grid, 332, 4, 12);
    addCoins(coins, 333, 343, 4);
    addKey(keys, 343, 4);

    platform(grid, 280, 7, 10);
    addCoins(coins, 281, 289, 7);
    addEnemy(enemies, 285, 7, 281, 289, 1);

    platform(grid, 300, 7, 10);
    addCoins(coins, 301, 309, 7);
    addEnemy(enemies, 305, 7, 301, 309, 0);

    platform(grid, 320, 7, 10);
    addCoins(coins, 321, 329, 7);
    addKey(keys, 329, 7);

    platform(grid, 340, 7, 10);
    addCoins(coins, 341, 349, 7);
    addEnemy(enemies, 345, 7, 341, 349, 1);

    platform(grid, 272, 10, 10);
    addCoins(coins, 273, 281, 10);
    addEnemy(enemies, 277, 10, 273, 281, 0);

    platform(grid, 292, 10, 10);
    addCoins(coins, 293, 301, 10);
    addKey(keys, 301, 10);

    platform(grid, 312, 10, 10);
    addCoins(coins, 313, 321, 10);
    addEnemy(enemies, 317, 10, 313, 321, 1);

    platform(grid, 332, 10, 10);
    addCoins(coins, 333, 341, 10);
    addEnemy(enemies, 337, 10, 333, 341, 0);

    addLadder(ladders, 274, 9, 4);
    addLadder(ladders, 282, 6, 4);
    addLadder(ladders, 294, 12, 10);
    addLadder(ladders, 302, 6, 4);
    addLadder(ladders, 314, 12, 10);
    addLadder(ladders, 322, 6, 4);
    addLadder(ladders, 334, 12, 10);
    addLadder(ladders, 342, 6, 4);

    mp(movingPlatforms, 284, 10, 2.0, 9, 11, [9, 10, 11]);
    mp(movingPlatforms, 290, 7, 2.5, 4, 9, [10, 11, 9]);
    mp(movingPlatforms, 304, 10, 2.0, 9, 11, [11, 9, 10]);
    mp(movingPlatforms, 310, 7, 2.5, 4, 9, [9, 10, 11]);
    mp(movingPlatforms, 324, 10, 2.0, 9, 11, [10, 9, 11]);
    mp(movingPlatforms, 330, 7, 2.5, 4, 9, [11, 10, 9]);

    addKnife(knives, 284, 13);
    addKnife(knives, 292, 4);
    addKnife(knives, 306, 13);
    addKnife(knives, 316, 10);
    addKnife(knives, 326, 13);

    addKnife(knives, 355, groundRow);
    addKnife(knives, 356, groundRow);
    carveGap(grid, 358, 8, groundRow);

     mp(movingPlatforms, 359, 11, 2.0, 9, 11, [10, 9, 11]);
    mp(movingPlatforms, 362, 9, 2.5, 6, 9, [11, 10, 9]);

    // ══════════════════════════════════════════════════
    // SECTION 7 — Shortened final ending (cols 366–399)
    // door + vertical ending wall kept
    // ══════════════════════════════════════════════════
    blockStack(grid, 366, 12, 2, 1);
    blockStack(grid, 368, 11, 2, 2);
    blockStack(grid, 370, 10, 2, 3);

    platform(grid, 373, 9, 8);
    addCoins(coins, 373, 380, 9);
    addEnemy(enemies, 377, 9, 373, 380, 0);

    addLadder(ladders, 374, 12, 9);

    addKnife(knives, 381, groundRow);
    addKnife(knives, 382, groundRow);

    carveGap(grid, 384, 4, groundRow);

     mp(movingPlatforms, 385, 10, 2.0, 9, 11, [10, 9, 11]);

    blockStack(grid, 388, 12, 2, 1);
    blockStack(grid, 390, 11, 2, 2);

    platform(grid, 392, 9, 3);
    addCoins(coins, 392, 394, 9);

    // vertical ending wall next to door
    for (let y = 0; y <= groundRow; y++) {
        setTile(grid, 396, y, 2);
    }

    const door = {
        x: 394 * TILE,
        y: 11.5 * TILE,
        width: 52,
        height: 120,
        col: 394,
        row: 9
    };

    return {
        id: 11,
        name: 'Level 11',
        timerMs: 560000,
        progressUnits: 500,
        grid,
        coins,
        keys,
        knives,
        enemies,
        ladders,
        door,
        movingPlatforms,
        rows,
        cols,
        groundRow,
        totalCoinsRequiredToOpenDoor: coins.length
    };
}
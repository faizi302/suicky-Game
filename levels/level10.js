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
function addCoins(coins, s, e, row, offsetY = 16) {
    for (let c = s; c <= e; c++) addCoin(coins, c, row, offsetY);
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
    for (let x = startCol; x < startCol + width; x++) {
        for (let y = groundRow; y < grid.length; y++) {
            setTile(grid, x, y, 0);
        }
    }
}
function mp(movingPlatforms, col, row, widthTiles, axis, speed, minRow, maxRow, frameIndices = [9, 10, 11]) {
    movingPlatforms.push({
        x: col * TILE,
        y: row * TILE,
        width: TILE,
        height: TILE,
        axis,
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
        axis,
        speed,
        min: minRow * TILE,
        max: maxRow * TILE,
        frameIndices
    });
}

export function createLevel10Map() {
    const rows = 17;
    const cols = 490; // trimmed so camera stops near final wall/door
    const groundRow = 13;

    const grid = makeGrid(rows, cols);
    const coins = [], keys = [], knives = [], enemies = [], ladders = [], movingPlatforms = [];

    for (let x = 0; x < cols; x++) {
        setTile(grid, x, groundRow, 2);
        setTile(grid, x, groundRow + 1, 2);
        setTile(grid, x, groundRow + 2, 2);

        if (x === 0 || x === cols - 1) {
            for (let y = 0; y <= groundRow; y++) setTile(grid, x, y, 2);
        }
    }

    // ════════════════════════════════════════════
    // SECTION 1 — Criss-cross entry (0–65)
    // ════════════════════════════════════════════
    platform(grid, 3, 11, 4);
    addCoins(coins, 3, 6, 11);

    platform(grid, 9, 8, 6);
    addCoins(coins, 9, 14, 8);
    addLadder(ladders, 10, 12, 8);

    platform(grid, 14, 11, 3);
    addCoins(coins, 14, 16, 11);

    carveGap(grid, 17, 7, groundRow);

    movingPlatforms.push({
        x: 18 * TILE, y: 3 * TILE, width: TILE, height: TILE,
        axis: 'y', speed: 1.4, min: 8 * TILE, max: 11 * TILE, frameIndices: [9, 10, 11]
    });
    movingPlatforms.push({
        x: 18.7 * TILE, y: 3 * TILE, width: TILE, height: TILE,
        axis: 'y', speed: 1.4, min: 8 * TILE, max: 11 * TILE, frameIndices: [9, 10, 11]
    });
    movingPlatforms.push({
        x: 21 * TILE, y: 12 * TILE, width: TILE, height: TILE,
        axis: 'y', speed: 1.4, min: 8 * TILE, max: 11 * TILE, frameIndices: [9, 10, 11]
    });
    movingPlatforms.push({
        x: 21.7 * TILE, y: 12 * TILE, width: TILE, height: TILE,
        axis: 'y', speed: 1.4, min: 8 * TILE, max: 11 * TILE, frameIndices: [9, 10, 11]
    });

    platform(grid, 26, 6, 14);
    addCoins(coins, 27, 39, 6);
    addEnemy(enemies, 31, 6, 27, 39, 1);
    addKey(keys, 38, 6);

    platform(grid, 26, 11, 14);
    addCoins(coins, 27, 39, 11);
    addEnemy(enemies, 33, 11, 27, 39, 0);

    addLadder(ladders, 28, 10, 6);
    addLadder(ladders, 36, 10, 6);

    blockStack(grid, 26, 7, 2, 4);
    blockStack(grid, 38, 7, 2, 4);

    addKnife(knives, 42, groundRow);

    carveGap(grid, 44, 5, groundRow);

    movingPlatforms.push({
        x: 45 * TILE, y: 12 * TILE, width: TILE, height: TILE,
        axis: 'y', speed: 1.4, min: 8 * TILE, max: 11 * TILE, frameIndices: [9, 10, 11]
    });
    movingPlatforms.push({
        x: 45.7 * TILE, y: 12 * TILE, width: TILE, height: TILE,
        axis: 'y', speed: 1.4, min: 8 * TILE, max: 11 * TILE, frameIndices: [9, 10, 11]
    });

    platform(grid, 52, 9, 5);
    addCoins(coins, 52, 56, 9);
    addLadder(ladders, 53, 12, 9);

    platform(grid, 26, 4, 36);
    addCoins(coins, 27, 61, 4);
    addKey(keys, 50, 4);
    addKey(keys, 60, 4);
    addEnemy(enemies, 34, 4, 27, 61, 1);
    addEnemy(enemies, 45, 4, 27, 61, 0);
    addEnemy(enemies, 56, 4, 27, 61, 1);
    addLadder(ladders, 29, 5, 4);
    addLadder(ladders, 32, 12, 4);
    addLadder(ladders, 59, 12, 4);

    // ════════════════════════════════════════════
    // SECTION 2 — The Ziggurat (58–130)
    // ════════════════════════════════════════════
    for (let i = 0; i < 8; i++) {
        blockStack(grid, 60 + i, 12 - i, 1, i + 2);
    }

    platform(grid, 70, 4, 16);
    addCoins(coins, 71, 85, 4);
    addKey(keys, 78, 4);
    addKey(keys, 85, 4);
    addEnemy(enemies, 81, 4, 69, 85, 0);

    for (let ix = 70; ix <= 81; ix++) {
        for (let iy = 5; iy <= 11; iy++) setTile(grid, ix, iy, 0);
    }

    platform(grid, 76, 8, 4);
    addCoins(coins, 76, 79, 8);
    platform(grid, 70, 10, 4);
    addCoins(coins, 70, 73, 10);
    platform(grid, 80, 10, 4);
    addCoins(coins, 80, 85, 10);

    addEnemy(enemies, 77, 8, 76, 79, 1);
    addLadder(ladders, 72, 12, 4);
    addLadder(ladders, 78, 12, 8);

    for (let i = 0; i < 8; i++) {
        blockStack(grid, 86 + i, 5 + i, 1, 9 - i);
    }

    addKnife(knives, 95, groundRow);
    addKnife(knives, 96, groundRow);
    addKnife(knives, 101, groundRow);
    addKnife(knives, 102, groundRow);

    carveGap(grid, 103, 12, groundRow);

    // ════════════════════════════════════════════
    // SECTION 3 — Floating island maze (103–185)
    // ════════════════════════════════════════════
    platform(grid, 103, 11, 5); addCoins(coins, 103, 107, 11);
    platform(grid, 115, 11, 5); addCoins(coins, 115, 119, 11);
    platform(grid, 127, 11, 5); addCoins(coins, 127, 131, 11);
    platform(grid, 139, 11, 5); addCoins(coins, 139, 143, 11);

    platform(grid, 108, 8, 5); addCoins(coins, 108, 112, 8);
    platform(grid, 120, 8, 5); addCoins(coins, 120, 124, 8);
    platform(grid, 132, 8, 5); addCoins(coins, 132, 136, 8);
    platform(grid, 144, 8, 5); addCoins(coins, 144, 148, 8);

    platform(grid, 103, 6, 5); addCoins(coins, 103, 107, 6);
    platform(grid, 115, 6, 5); addCoins(coins, 115, 119, 6);
    platform(grid, 127, 6, 5); addCoins(coins, 127, 131, 6);
    platform(grid, 139, 6, 5); addCoins(coins, 139, 143, 6);

    platform(grid, 108, 4, 5); addCoins(coins, 108, 112, 4);
    platform(grid, 120, 4, 5); addCoins(coins, 120, 124, 4);
    platform(grid, 132, 4, 5); addCoins(coins, 132, 136, 4);
    platform(grid, 144, 4, 5); addCoins(coins, 144, 148, 4);

    addKey(keys, 112, 4);
    addKey(keys, 124, 4);
    addKey(keys, 136, 4);
    addKey(keys, 148, 4);

    addEnemy(enemies, 110, 8, 108, 112, 0);
    addEnemy(enemies, 122, 8, 120, 124, 1);
    addEnemy(enemies, 134, 6, 132, 136, 0);
    addEnemy(enemies, 146, 4, 144, 148, 1);

    addLadder(ladders, 104, 10, 6);
    addLadder(ladders, 110, 7, 4);
    addLadder(ladders, 116, 10, 6);
    addLadder(ladders, 122, 7, 4);
    addLadder(ladders, 128, 10, 6);
    addLadder(ladders, 134, 7, 4);
    addLadder(ladders, 140, 10, 6);
    addLadder(ladders, 146, 7, 4);

    platform(grid, 152, 8, 5);
    addCoins(coins, 152, 156, 8);
    addLadder(ladders, 154, 12, 8);

    addKnife(knives, 156, groundRow);
    addKnife(knives, 157, groundRow);

    carveGap(grid, 160, 8, groundRow);

    // ════════════════════════════════════════════
    // SECTION 4 — Vertical shaft gauntlet (160–220)
    // ════════════════════════════════════════════
    for (let y = 6; y <= 12; y++) setTile(grid, 158, y, 2);
    for (let y = 0; y <= 10; y++) setTile(grid, 178, y, 2);

    platform(grid, 159, 8, 8); addCoins(coins, 159, 166, 8); addEnemy(enemies, 159, 8, 159, 166, 0);
    platform(grid, 171, 10, 8); addCoins(coins, 171, 176, 10); addEnemy(enemies, 174, 10, 170, 177, 1);
    platform(grid, 160, 4, 6); addCoins(coins, 161, 164, 4); addKey(keys, 163, 4);
    platform(grid, 169, 6, 9); addCoins(coins, 170, 175, 6); addKey(keys, 172, 6);

    platform(grid, 180, 4, 18);
    addCoins(coins, 181, 197, 4);
    addKey(keys, 196, 4);
    addEnemy(enemies, 186, 4, 181, 197, 1);
    addEnemy(enemies, 193, 4, 181, 197, 0);
    addLadder(ladders, 182, 12, 4);

    carveGap(grid, 200, 10, groundRow);

    // ════════════════════════════════════════════
    // SECTION 5 — Chain-bridge crossing (200–260)
    // ════════════════════════════════════════════
    mp(movingPlatforms, 201, 10, 1, 'y', 1.4, 8, 11);
    mp(movingPlatforms, 204, 10, 1, 'y', 1.2, 8, 11);
    mp(movingPlatforms, 207, 10, 1, 'y', 1.6, 8, 11);
    mp(movingPlatforms, 210, 10, 1, 'y', 1.8, 8, 11);
    mp(movingPlatforms, 213, 10, 1, 'y', 1.2, 8, 11);
    mp(movingPlatforms, 216, 10, 1, 'y', 1.6, 8, 11);

    addCoins(coins, 201, 201, 10, 24);
    addCoins(coins, 204, 204, 8, 24);
    addCoins(coins, 207, 207, 6, 24);
    addCoins(coins, 210, 210, 9, 24);
    addCoins(coins, 213, 213, 7, 24);
    addCoins(coins, 216, 216, 5, 24);
    addKey(keys, 216, 8, 28);

    platform(grid, 232, 8, 8);
    addCoins(coins, 232, 239, 8);
    addKey(keys, 239, 8);
    addEnemy(enemies, 236, 8, 232, 239, 1);
    addLadder(ladders, 234, 12, 8);

    addKnife(knives, 240, groundRow);
    addKnife(knives, 240.5, groundRow);
    addKnife(knives, 241, groundRow);

    carveGap(grid, 245, 8, groundRow);

    // ════════════════════════════════════════════
    // SECTION 6 — Inverted pyramid + filled route (243–316)
    // all support stacks now touch groundRow properly
    // ════════════════════════════════════════════
    platform(grid, 243, 4, 26);
    addCoins(coins, 248, 272, 4);
    addEnemy(enemies, 263, 4, 248, 272, 1);
    addKey(keys, 271, 4);

    platform(grid, 250, 6, 20);
    addCoins(coins, 252, 269, 6);
    addEnemy(enemies, 258, 6, 252, 269, 1);
    addKey(keys, 268, 6);

    platform(grid, 254, 8, 14);
    addCoins(coins, 256, 267, 8);
    addEnemy(enemies, 261, 8, 256, 267, 0);
    addKey(keys, 266, 8);

    platform(grid, 258, 11, 9);
    addCoins(coins, 260, 266, 11);
    addEnemy(enemies, 264, 11, 260, 266, 1);

    addLadder(ladders, 243, 12, 4);
    addLadder(ladders, 253, 12, 6);
    addLadder(ladders, 261, 7, 4);
    addLadder(ladders, 268, 12, 6);

    addKnife(knives, 251, 6);
    addKnife(knives, 255, 8);
    addKnife(knives, 259, 11);

    // support columns touching the ground
    blockStack(grid, 270, 9, 2, 5);
    blockStack(grid, 276, 7, 2, 7);
    blockStack(grid, 284, 10, 2, 4);
    blockStack(grid, 292, 8, 2, 6);
    blockStack(grid, 300, 11, 2, 3);
    blockStack(grid, 308, 6, 2, 8);

    // connected route
    platform(grid, 270, 8, 6);
    addCoins(coins, 271, 275, 8, 24);

    platform(grid, 277, 6, 7);
    addCoins(coins, 278, 283, 6, 24);
    addKey(keys, 282, 6, 28);

    platform(grid, 286, 9, 6);
    addCoins(coins, 287, 291, 9, 24);

    platform(grid, 294, 7, 7);
    addCoins(coins, 295, 300, 7, 24);
    addEnemy(enemies, 297, 7, 295, 300, 0);

    platform(grid, 303, 5, 8);
    addCoins(coins, 304, 310, 5, 24);
    addKey(keys, 309, 5, 28);

    platform(grid, 311, 8, 5);
    addCoins(coins, 311, 315, 8, 24);

    addLadder(ladders, 272, 12, 8);
    addLadder(ladders, 279, 12, 6);
    addLadder(ladders, 296, 12, 7);
    addLadder(ladders, 305, 12, 5);

    addKnife(knives, 312, groundRow);
    addKnife(knives, 316, groundRow);

    carveGap(grid, 320, 10, groundRow);

    // ════════════════════════════════════════════
    // SECTION 7 — Final approach (320–420)
    // cleaned spacing / no overlapping enemies / higher coins
    // ════════════════════════════════════════════
    mp(movingPlatforms, 321, 10, 1, 'y', 1.4, 8, 11);
    mp(movingPlatforms, 325, 10, 1, 'y', 1.2, 8, 11);
    mp(movingPlatforms, 329, 10, 1, 'y', 1.6, 8, 11);
    // mp(movingPlatforms, 333, 10, 1, 'y', 1.8, 8, 11);
    // mp(movingPlatforms, 337, 10, 1, 'y', 1.4, 8, 11);

    blockStack(grid, 341, 6, 2, 8); // reaches ground

    platform(grid, 342, 5, 10);
    addCoins(coins, 343, 351, 5, 24);
    addKey(keys, 351, 5, 28);
    addEnemy(enemies, 347, 5, 344, 350, 1);

    platform(grid, 333, 8, 6);
    addCoins(coins, 334, 338, 8, 24);

    // platform(grid, 339, 10, 5);
    // addCoins(coins, 339, 343, 10, 24);

    blockStack(grid, 348, 8, 2, 6); // reaches ground

    carveGap(grid, 355, 12, groundRow);

    // Final climb — coins raised so they are not inside blocks
    platform(grid, 355, 11, 5); addCoins(coins, 355, 359, 11, 26);
    platform(grid, 362, 9, 5);  addCoins(coins, 362, 366, 9, 26);
    platform(grid, 369, 7, 5);  addCoins(coins, 369, 373, 7, 26);
    platform(grid, 376, 6, 5);  addCoins(coins, 376, 380, 6, 26);
    platform(grid, 383, 5, 5);  addCoins(coins, 383, 387, 5, 26);
    platform(grid, 390, 4, 5);  addCoins(coins, 390, 394, 4, 26);
    addKey(keys, 394, 4, 30);
    addEnemy(enemies, 392, 4, 390, 394, 0);

    mp(movingPlatforms, 360, 10, 1, 'y', 1.5, 8, 11);
    mp(movingPlatforms, 367, 8, 1, 'y', 1.5, 7, 10);
    mp(movingPlatforms, 374, 7, 1, 'y', 1.5, 6, 8);
    mp(movingPlatforms, 381, 6, 1, 'y', 1.4, 5, 7);
    mp(movingPlatforms, 388, 5, 1, 'y', 1.4, 4, 6);

    platform(grid, 397, 4, 20);
    addCoins(coins, 398, 416, 4, 24);
    addKey(keys, 415, 4, 28);
    addEnemy(enemies, 404, 4, 399, 406, 0);
    addEnemy(enemies, 411, 4, 408, 416, 1);
    addLadder(ladders, 400, 12, 4);

    addKnife(knives, 412, groundRow);
    addKnife(knives, 413, groundRow);

    carveGap(grid, 422, 8, groundRow);
    mp(movingPlatforms, 424, 5, 1, 'y', 1.4, 8, 10);

    // Final stair descent — all steps now touch ground correctly
    blockStack(grid, 430, 13, 2, 1);
    blockStack(grid, 432, 12, 2, 2);
    blockStack(grid, 434, 11, 2, 3);
    blockStack(grid, 436, 10, 2, 4);
    blockStack(grid, 438, 9, 2, 5);
    blockStack(grid, 440, 8, 2, 6);

    platform(grid, 443, 7, 14);
    addCoins(coins, 443, 456, 7, 24);
    addEnemy(enemies, 449, 7, 444, 455, 0);
    addLadder(ladders, 445, 12, 7);

    addKnife(knives, 454, groundRow);
    addKnife(knives, 455, groundRow);

    blockStack(grid, 468, 13, 2, 1);
    blockStack(grid, 470, 12, 2, 2);
    blockStack(grid, 472, 11, 2, 3);
    blockStack(grid, 474, 10, 2, 4);

    platform(grid, 476, 9, 8);
    addCoins(coins, 476, 483, 9, 24);

    const door = {
        x: 484 * TILE,
        y: 11.5 * TILE,
        width: 52,
        height: 120,
        col: 484,
        row: 9
    };

    // final end wall near right edge
    blockStack(grid, 486, 0, 3, groundRow + 1);

    return {
        id: 10,
        name: 'Level 10',
        timerMs: 520000,
        progressUnits: 460,
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
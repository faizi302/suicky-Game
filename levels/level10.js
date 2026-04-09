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
function addCoin(coins, col, row, offsetY = 16) {
    coins.push({ x: col * TILE + TILE * 0.5 - 16, y: row * TILE - offsetY });
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
    ladders.push({ x: col * TILE + (TILE - width) / 2, y: topRow * TILE - 2, width, height: (bottomRow - topRow + 1) * TILE + 4 });
}
function addEnemy(enemies, col, row, lCol, rCol, type = 0) {
    enemies.push({ x: col * TILE, y: row * TILE - 50, patrolLeft: lCol * TILE, patrolRight: rCol * TILE, type });
}
function carveGap(grid, startCol, width, groundRow) {
    for (let x = startCol; x < startCol + width; x++)
        for (let y = groundRow; y < grid.length; y++)
            setTile(grid, x, y, 0);
}
function mp(movingPlatforms, col, row, widthTiles, axis, speed, minRow, maxRow, tileType) {
    movingPlatforms.push({
        x: col * TILE, y: row * TILE,
        width: widthTiles * TILE, height: TILE,
        axis, speed,
        min: minRow * TILE, max: maxRow * TILE,
        tileType
    });
}

export function createLevel10Map() {
    const rows = 17;
    const cols = 560;
    const groundRow = 13;

    const grid = makeGrid(rows, cols);
    const coins = [], keys = [], knives = [], enemies = [], ladders = [], movingPlatforms = [];

    for (let x = 0; x < cols; x++) {
        setTile(grid, x, groundRow,     2);
        setTile(grid, x, groundRow + 1, 2);
        setTile(grid, x, groundRow + 2, 2);
        if (x === 0 || x === cols - 1)
            for (let y = 0; y <= groundRow; y++) setTile(grid, x, y, 2);
    }

    // ════════════════════════════════════════════
    // SECTION 1 — Criss-cross entry (0–65)
    // ════════════════════════════════════════════
    // Start ledge
    platform(grid, 3, 11, 4);
    addCoins(coins, 3, 6, 11);

    // Route A (upper): row 8
    platform(grid, 9, 8, 6);
    addCoins(coins, 9, 14, 8);
    addLadder(ladders, 10, 12, 8);

    // Route B (lower): ground stepping stones
    // platform(grid, 9, 11, 3);
    platform(grid, 14, 11, 3);
    // addCoins(coins, 9, 11, 11);
    addCoins(coins, 14, 16, 11);

    carveGap(grid, 17, 8, groundRow);

    // Moving platforms crossing the gap (clamped min to 6)
    mp(movingPlatforms, 17, 9, 2, 'y', 1.5, 5, 11, 9);
    mp(movingPlatforms, 20, 7, 2, 'y', 2, 6, 11, 9);
    mp(movingPlatforms, 23, 9, 2, 'y', 1, 8, 11, 10);

    // Upper path through tower (moved from row 6 → row 6, fine)
    platform(grid, 26, 6, 14);
    addCoins(coins, 27, 39, 6);
    addEnemy(enemies, 31, 6, 27, 39, 1);
    addKey(keys, 38, 6);

    // Lower path (ground level)
    platform(grid, 26, 11, 14);
    addCoins(coins, 27, 39, 11);
    addEnemy(enemies, 33, 11, 27, 39, 0);

    addLadder(ladders, 28, 10, 6);
    addLadder(ladders, 36, 10, 6);

    // Vertical connector walls
    blockStack(grid, 26, 7, 2, 4);
    blockStack(grid, 38, 7, 2, 4);

    addKnife(knives, 42, groundRow);
    addKnife(knives, 43, groundRow);

    carveGap(grid, 44, 5, groundRow);

    // Moving platforms (clamped min to 5→6 where needed)
    mp(movingPlatforms, 45, 8, 3, 'y', 2.0, 5, 11, 10);
    mp(movingPlatforms, 49, 6, 3, 'y', 2.0, 5, 11, 10);

    platform(grid, 52, 9, 5);
    addCoins(coins, 52, 56, 9);
    addLadder(ladders, 53, 12, 9);

    // ── Ceiling path replaced: now a high-but-visible path at row 4 ──
    platform(grid, 26, 4, 36);
    addCoins(coins, 27, 61, 4);
    addKey(keys, 50, 4);
    addKey(keys, 60, 4);
    addEnemy(enemies, 34, 4, 27, 61, 1);
    addEnemy(enemies, 45, 4, 27, 61, 0);
    addEnemy(enemies, 56, 4, 27, 61, 1);
    addLadder(ladders, 29, 5, 4);
    addLadder(ladders, 37, 10, 4);
    addLadder(ladders, 55, 9, 4);

    // ════════════════════════════════════════════
    // SECTION 2 — The Ziggurat (cols 58–130)
    // ════════════════════════════════════════════

    // Outer left slope (ascending blocks) — shifted so peak is at row 4
    for (let i = 0; i < 8; i++) {
        blockStack(grid, 60 + i, 12 - i, 1, i + 2);
    }
    // Top of ziggurat at row 4 (was row 2)
    platform(grid, 68, 4, 18);
    addCoins(coins, 69, 85, 4);
    addKey(keys, 78, 4);
    addKey(keys, 85, 4);
    addEnemy(enemies, 73, 4, 69, 85, 1);
    addEnemy(enemies, 81, 4, 69, 85, 0);

    // Interior of ziggurat — carved cavity (adjusted for new top)
    for (let ix = 70; ix <= 81; ix++) {
        for (let iy = 5; iy <= 11; iy++) setTile(grid, ix, iy, 0);
    }
    // Interior zigzag platforms (rows 6, 8, 10, 12 inside cavity)
    platform(grid, 70, 6, 4);
    addCoins(coins, 70, 73, 6);
    platform(grid, 76, 8, 4);
    addCoins(coins, 76, 79, 8);
    platform(grid, 70, 10, 4);
    addCoins(coins, 70, 73, 10);
    platform(grid, 76, 12, 4);
    addCoins(coins, 76, 79, 12);
    addEnemy(enemies, 71, 6, 70, 73, 0);
    addEnemy(enemies, 77, 8, 76, 79, 1);
    addLadder(ladders, 72, 6, 4);
    addLadder(ladders, 78, 12, 8);

    // Exit right slope (descending)
    for (let i = 0; i < 8; i++) {
        blockStack(grid, 86 + i, 5 + i, 1, 9 - i);
    }

    // After ziggurat — knives gauntlet
    addKnife(knives, 99, groundRow);
    addKnife(knives, 100, groundRow);
    addKnife(knives, 101, groundRow);
    addKnife(knives, 102, groundRow);

    carveGap(grid, 103, 12, groundRow);

    // ════════════════════════════════════════════
    // SECTION 3 — Floating island maze (cols 103–185)
    // All rows clamped: was 2→4, was 5→6, was 8→8, was 11→11
    // ════════════════════════════════════════════
    // Row 11 islands
    platform(grid, 103, 11, 5); addCoins(coins, 103, 107, 11);
    platform(grid, 115, 11, 5); addCoins(coins, 115, 119, 11);
    platform(grid, 127, 11, 5); addCoins(coins, 127, 131, 11);
    platform(grid, 139, 11, 5); addCoins(coins, 139, 143, 11);
    // Row 8 islands
    platform(grid, 108, 8, 5);  addCoins(coins, 108, 112, 8);
    platform(grid, 120, 8, 5);  addCoins(coins, 120, 124, 8);
    platform(grid, 132, 8, 5);  addCoins(coins, 132, 136, 8);
    platform(grid, 144, 8, 5);  addCoins(coins, 144, 148, 8);
    // Row 6 islands (was row 5)
    platform(grid, 103, 6, 5);  addCoins(coins, 103, 107, 6);
    platform(grid, 115, 6, 5);  addCoins(coins, 115, 119, 6);
    platform(grid, 127, 6, 5);  addCoins(coins, 127, 131, 6);
    platform(grid, 139, 6, 5);  addCoins(coins, 139, 143, 6);
    // Row 4 islands (was row 2)
    platform(grid, 108, 4, 5);  addCoins(coins, 108, 112, 4);
    platform(grid, 120, 4, 5);  addCoins(coins, 120, 124, 4);
    platform(grid, 132, 4, 5);  addCoins(coins, 132, 136, 4);
    platform(grid, 144, 4, 5);  addCoins(coins, 144, 148, 4);

    addKey(keys, 112, 4);
    addKey(keys, 124, 4);
    addKey(keys, 136, 4);
    addKey(keys, 148, 4);

    addEnemy(enemies, 110, 8, 108, 112, 0);
    addEnemy(enemies, 122, 8, 120, 124, 1);
    addEnemy(enemies, 134, 6, 132, 136, 0);
    addEnemy(enemies, 146, 4, 144, 148, 1);

    // Ladders connecting rows (topRow clamped to 4)
    addLadder(ladders, 104, 11, 6);
    addLadder(ladders, 110, 8, 4);
    addLadder(ladders, 116, 11, 6);
    addLadder(ladders, 122, 8, 4);
    addLadder(ladders, 128, 11, 6);
    addLadder(ladders, 134, 8, 4);
    addLadder(ladders, 140, 11, 6);
    addLadder(ladders, 146, 8, 4);

    // Moving platforms fill the void (min clamped to 5)
    mp(movingPlatforms, 108, 9, 2, 'y', 1.8, 6, 11, 9);
    mp(movingPlatforms, 120, 7, 2, 'y', 2.0, 5, 8, 10);
    mp(movingPlatforms, 132, 9, 2, 'y', 1.8, 6, 11, 11);
    mp(movingPlatforms, 144, 7, 2, 'y', 2.0, 5, 8, 9);

    addKnife(knives, 106, 11);
    addKnife(knives, 118, 8);
    addKnife(knives, 130, 6);
    addKnife(knives, 142, 4);

    // Exit from maze
    addLadder(ladders, 150, 11, 4);
    platform(grid, 152, 10, 5);
    addCoins(coins, 152, 156, 10);
    addLadder(ladders, 154, 12, 10);

    addKnife(knives, 158, groundRow);
    addKnife(knives, 159, groundRow);

    carveGap(grid, 160, 8, groundRow);

    // ════════════════════════════════════════════
    // SECTION 4 — Vertical shaft gauntlet (cols 160–220)
    // Rows clamped: 1→4, 3→5, 5→6, 7→7, 9→9, 11→11
    // ════════════════════════════════════════════
    for (let y = 0; y <= 12; y++) setTile(grid, 160, y, 2);
    for (let y = 0; y <= 12; y++) setTile(grid, 178, y, 2);

    platform(grid, 161, 11, 8); addCoins(coins, 161, 168, 11); addEnemy(enemies, 164, 11, 161, 168, 0);
    platform(grid, 170, 9,  8); addCoins(coins, 170, 177, 9);  addEnemy(enemies, 174, 9, 170, 177, 1);
    platform(grid, 161, 7,  8); addCoins(coins, 161, 168, 7);  addEnemy(enemies, 164, 7, 161, 168, 0);
    platform(grid, 170, 6,  8); addCoins(coins, 170, 177, 6);  addEnemy(enemies, 174, 6, 170, 177, 1);
    platform(grid, 161, 5,  8); addCoins(coins, 161, 168, 5);  addKey(keys, 168, 5);
    platform(grid, 170, 4,  8); addCoins(coins, 170, 177, 4);  addKey(keys, 177, 4);

    addLadder(ladders, 162, 11, 5);
    addLadder(ladders, 176, 9, 4);

    addKnife(knives, 165, 11);
    addKnife(knives, 173, 9);
    addKnife(knives, 165, 7);
    addKnife(knives, 173, 6);

    // Moving platforms in shaft (min clamped to 4)
    mp(movingPlatforms, 162, 10, 3, 'y', 2.5, 4, 11, 11);
    mp(movingPlatforms, 171, 8, 3, 'y', 2.5, 4, 11, 10);

    // Exit from shaft — high platform at row 4
    platform(grid, 180, 4, 18);
    addCoins(coins, 181, 197, 4);
    addKey(keys, 196, 4);
    addEnemy(enemies, 186, 4, 181, 197, 1);
    addEnemy(enemies, 193, 4, 181, 197, 0);
    addLadder(ladders, 182, 12, 4);

    carveGap(grid, 200, 10, groundRow);

    // ════════════════════════════════════════════
    // SECTION 5 — Chain-bridge crossing (cols 200–260)
    // min clamped to 5 throughout
    // ════════════════════════════════════════════
    mp(movingPlatforms, 201, 10, 2, 'y', 1.2, 7, 11, 9);
    mp(movingPlatforms, 204, 8,  2, 'y', 1.8, 5, 11, 10);
    mp(movingPlatforms, 207, 6,  2, 'y', 2.4, 5, 11, 11);
    mp(movingPlatforms, 210, 9,  2, 'y', 1.5, 6, 11, 9);
    mp(movingPlatforms, 213, 7,  2, 'y', 2.0, 5, 11, 10);
    mp(movingPlatforms, 216, 5,  2, 'y', 2.8, 5, 11, 11);
    mp(movingPlatforms, 219, 8,  2, 'y', 1.6, 5, 11, 9);
    mp(movingPlatforms, 222, 6,  2, 'y', 2.2, 5, 10, 10);
    mp(movingPlatforms, 225, 9,  2, 'y', 1.4, 7, 11, 9);
    mp(movingPlatforms, 228, 7,  2, 'y', 2.6, 5, 11, 11);

    addCoins(coins, 201, 201, 10);
    addCoins(coins, 204, 204, 8);
    addCoins(coins, 207, 207, 6);
    addCoins(coins, 210, 210, 9);
    addCoins(coins, 213, 213, 7);
    addCoins(coins, 216, 216, 5);
    addCoins(coins, 219, 219, 8);
    addCoins(coins, 222, 222, 6);

    platform(grid, 232, 8, 8);
    addCoins(coins, 232, 239, 8);
    addKey(keys, 239, 8);
    addEnemy(enemies, 236, 8, 232, 239, 1);
    addLadder(ladders, 234, 12, 8);

    addKnife(knives, 242, groundRow);
    addKnife(knives, 243, groundRow);
    addKnife(knives, 244, groundRow);

    carveGap(grid, 245, 8, groundRow);

    // ════════════════════════════════════════════
    // SECTION 6 — Inverted pyramid (cols 245–315)
    // Rows: top at 4 (was 2), mid at 6 (was 5), lower at 8, bottom at 11
    // ════════════════════════════════════════════
    // Top wide platform
    platform(grid, 247, 4, 26);
    addCoins(coins, 248, 272, 4);
    addEnemy(enemies, 254, 4, 248, 272, 0);
    addEnemy(enemies, 263, 4, 248, 272, 1);
    addEnemy(enemies, 270, 4, 248, 272, 0);
    addKey(keys, 271, 4);

    // Mid platform
    platform(grid, 251, 6, 20);
    addCoins(coins, 252, 270, 6);
    addEnemy(enemies, 258, 6, 252, 270, 1);
    addEnemy(enemies, 266, 6, 252, 270, 0);
    addKey(keys, 269, 6);

    // Lower platform
    platform(grid, 255, 8, 14);
    addCoins(coins, 256, 268, 8);
    addEnemy(enemies, 261, 8, 256, 268, 1);
    addKey(keys, 267, 8);

    // Narrow bottom platform
    platform(grid, 259, 11, 8);
    addCoins(coins, 260, 266, 11);
    addEnemy(enemies, 263, 11, 260, 266, 0);

    addLadder(ladders, 249, 12, 4);
    addLadder(ladders, 258, 11, 6);
    addLadder(ladders, 262, 8, 4);
    addLadder(ladders, 270, 11, 4);

    addKnife(knives, 251, 6);
    addKnife(knives, 255, 8);
    addKnife(knives, 259, 11);

    addKnife(knives, 318, groundRow);
    addKnife(knives, 319, groundRow);

    carveGap(grid, 320, 10, groundRow);

    // ════════════════════════════════════════════
    // SECTION 7 — Final approach (cols 320–420)
    // min clamped to 5; high platforms clamped to row 4
    // ════════════════════════════════════════════
    mp(movingPlatforms, 321, 10, 3, 'y', 1.5, 7, 11, 9);
    mp(movingPlatforms, 325, 8,  3, 'y', 2.0, 5, 11, 10);
    mp(movingPlatforms, 329, 6,  3, 'y', 2.5, 5, 11, 11);
    mp(movingPlatforms, 333, 9,  3, 'y', 1.8, 6, 11, 9);
    mp(movingPlatforms, 337, 7,  3, 'y', 2.2, 5, 11, 10);

    platform(grid, 342, 5, 10);
    addCoins(coins, 343, 351, 5);
    addKey(keys, 351, 5);
    addEnemy(enemies, 347, 5, 343, 351, 1);
    addLadder(ladders, 344, 12, 5);

    carveGap(grid, 355, 12, groundRow);

    // Final four-level climb — top clamped at row 4
    platform(grid, 355, 11, 5); addCoins(coins, 355, 359, 11);
    platform(grid, 362, 9,  5); addCoins(coins, 362, 366, 9);
    platform(grid, 369, 7,  5); addCoins(coins, 369, 373, 7);
    platform(grid, 376, 6,  5); addCoins(coins, 376, 380, 6);
    platform(grid, 383, 5,  5); addCoins(coins, 383, 387, 5);
    platform(grid, 390, 4,  5); addCoins(coins, 390, 394, 4);
    addKey(keys, 394, 4);
    addEnemy(enemies, 392, 4, 390, 394, 1);

    mp(movingPlatforms, 360, 10, 2, 'y', 2.0, 7, 11, 11);
    mp(movingPlatforms, 367, 8,  2, 'y', 2.0, 5, 10, 10);
    mp(movingPlatforms, 374, 6,  2, 'y', 2.0, 5, 8, 9);
    mp(movingPlatforms, 381, 5,  2, 'y', 2.0, 4, 6, 11);
    mp(movingPlatforms, 388, 4,  2, 'y', 2.0, 4, 6, 9);

    addLadder(ladders, 356, 11, 6);
    addLadder(ladders, 370, 9, 5);
    addLadder(ladders, 384, 7, 4);

    // Final platform stretch at row 4
    platform(grid, 397, 4, 20);
    addCoins(coins, 398, 416, 4);
    addKey(keys, 415, 4);
    addEnemy(enemies, 403, 4, 398, 416, 0);
    addEnemy(enemies, 411, 4, 398, 416, 1);
    addLadder(ladders, 400, 12, 4);

    addKnife(knives, 419, groundRow);
    addKnife(knives, 420, groundRow);

    carveGap(grid, 422, 8, groundRow);

    // Final stair descent to door
    blockStack(grid, 430, 12, 2, 1);
    blockStack(grid, 432, 11, 2, 2);
    blockStack(grid, 434, 10, 2, 3);
    blockStack(grid, 436, 9, 2, 4);
    blockStack(grid, 438, 8, 2, 5);

    platform(grid, 442, 7, 14);
    addCoins(coins, 442, 455, 7);
    addEnemy(enemies, 448, 7, 442, 455, 0);
    addLadder(ladders, 444, 12, 7);

    addKnife(knives, 458, groundRow);
    addKnife(knives, 459, groundRow);

    carveGap(grid, 462, 6, groundRow);

    blockStack(grid, 468, 12, 2, 1);
    blockStack(grid, 470, 11, 2, 2);
    blockStack(grid, 472, 10, 2, 3);
    platform(grid, 476, 9, 8);
    addCoins(coins, 476, 483, 9);

    const door = {
        x: 484 * TILE, y: 9 * TILE,
        width: 52, height: 120,
        col: 484, row: 9
    };

    return {
        id: 10,
        name: 'Level 10',
        timerMs: 520000,
        progressUnits: 460,
        grid, coins, keys, knives, enemies, ladders, door,
        movingPlatforms,
        rows, cols, groundRow,
        totalCoinsRequiredToOpenDoor: coins.length
    };
}
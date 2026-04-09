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
function mp(movingPlatforms, col, row, widthTiles, speed, minRow, maxRow, tileType = 9) {
    movingPlatforms.push({
        x: col * TILE, y: row * TILE,
        width: widthTiles * TILE, height: TILE,
        axis: 'y', speed,
        min: minRow * TILE, max: maxRow * TILE,
        tileType
    });
}

export function createLevel12Map() {
    const rows = 17;
    const cols = 640;
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

    // ══════════════════════════════════════════════════════
    // SECTION 1 — "The Library Hall" (cols 0–80)
    // Three parallel horizontal corridors, interconnected
    // ══════════════════════════════════════════════════════
    // Corridor ceilings (solid platforms become floor for corridor above)
    platform(grid, 3, 1, 74);   // Top corridor floor  (ceiling of mid)
    platform(grid, 3, 5, 74);   // Mid corridor floor  (ceiling of low)
    platform(grid, 3, 9, 74);   // Low corridor floor  (ceiling of ground gap)

    // Carve the corridors themselves open
    for (let x = 4; x <= 76; x++) {
        setTile(grid, x, 2, 0); setTile(grid, x, 3, 0); setTile(grid, x, 4, 0); // top corridor (rows 2-4 open between row 1 and 5 floors)
        setTile(grid, x, 6, 0); setTile(grid, x, 7, 0); setTile(grid, x, 8, 0); // mid corridor
        setTile(grid, x, 10, 0); setTile(grid, x, 11, 0); setTile(grid, x, 12, 0); // low corridor
    }
    // Re-set the corridor floor tiles (they were carved out by loop above)
    for (let x = 3; x <= 77; x++) {
        setTile(grid, x, 1, 1);
        setTile(grid, x, 5, 1);
        setTile(grid, x, 9, 1);
    }

    // Coins in each corridor
    addCoins(coins, 5, 75, 2);  // top corridor coins (on top-corridor floor, row 1+1=2)
    addCoins(coins, 5, 75, 6);  // mid corridor
    addCoins(coins, 5, 75, 10); // low corridor

    // Enemies in corridors
    addEnemy(enemies, 15, 2, 5, 75, 1);  addEnemy(enemies, 40, 2, 5, 75, 0);  addEnemy(enemies, 65, 2, 5, 75, 1);
    addEnemy(enemies, 15, 6, 5, 75, 0);  addEnemy(enemies, 40, 6, 5, 75, 1);  addEnemy(enemies, 65, 6, 5, 75, 0);
    addEnemy(enemies, 15, 10, 5, 75, 1); addEnemy(enemies, 40, 10, 5, 75, 0); addEnemy(enemies, 65, 10, 5, 75, 1);

    // Keys in corridors
    addKey(keys, 75, 2); addKey(keys, 75, 6); addKey(keys, 75, 10);

    // Vertical shafts connecting corridors (openings in the floors)
    const shaftCols = [10, 25, 40, 55, 70];
    for (const sc of shaftCols) {
        // Open shaft in mid floor (row 5) and top floor (row 1 ceiling not needed)
        setTile(grid, sc, 5, 0); setTile(grid, sc+1, 5, 0);
        setTile(grid, sc, 9, 0); setTile(grid, sc+1, 9, 0);
        addLadder(ladders, sc, 9, 1);
    }

    // Knives in low corridors
    addKnife(knives, 12, 10); addKnife(knives, 28, 10);
    addKnife(knives, 45, 6);  addKnife(knives, 62, 2);

    // ══════════════════════════════════════════════════════
    // SECTION 2 — Moving platform maze (cols 80–160)
    // ══════════════════════════════════════════════════════
    carveGap(grid, 80, 20, groundRow);

    // Dense grid of moving platforms — rows 2, 5, 8, 11
    // Staggered so player must time jumps carefully
    for (let c = 0; c < 20; c++) {
        const col = 81 + c * 4;
        // Row oscillators at different phases
        mp(movingPlatforms, col, 2  + (c%3),     2, 1.0 + c*0.1, 0, 5,  9);
        mp(movingPlatforms, col, 8  - (c%3),     2, 1.2 + c*0.1, 5, 11, 10);
    }

    // Fixed islands for rest
    platform(grid, 82,  11, 4); addCoins(coins, 82,  85, 11); addLadder(ladders, 83, 12, 11);
    platform(grid, 100, 2, 4);  addCoins(coins, 100, 103, 2); addKey(keys, 103, 2);
    platform(grid, 118, 11, 4); addCoins(coins, 118, 121, 11);
    platform(grid, 136, 2, 4);  addCoins(coins, 136, 139, 2); addKey(keys, 139, 2);
    platform(grid, 154, 8, 4);  addCoins(coins, 154, 157, 8); addKey(keys, 157, 8);

    addEnemy(enemies, 101, 2, 100, 103, 1);
    addEnemy(enemies, 137, 2, 136, 139, 0);
    addEnemy(enemies, 155, 8, 154, 157, 1);

    addLadder(ladders, 101, 11, 2);
    addLadder(ladders, 137, 11, 2);
    addLadder(ladders, 155, 11, 8);

    addKnife(knives, 94, 11); addKnife(knives, 112, 2);
    addKnife(knives, 130, 11); addKnife(knives, 148, 2);

    // ══════════════════════════════════════════════════════
    // SECTION 3 — "The Citadel" — five-floor fortress (cols 162–250)
    // ══════════════════════════════════════════════════════
    // Outer walls
    for (let y = 0; y <= 12; y++) {
        setTile(grid, 162, y, 2);
        setTile(grid, 230, y, 2);
    }
    platform(grid, 162, 0, 69); // ceiling

    // Floor 1 (Y=11)
    platform(grid, 163, 11, 30); platform(grid, 200, 11, 30);
    addCoins(coins, 163, 192, 11); addCoins(coins, 200, 229, 11);
    addEnemy(enemies, 170, 11, 163, 192, 0); addEnemy(enemies, 185, 11, 163, 192, 1);
    addEnemy(enemies, 208, 11, 200, 229, 0); addEnemy(enemies, 222, 11, 200, 229, 1);
    addKnife(knives, 175, 11); addKnife(knives, 190, 11); addKnife(knives, 210, 11); addKnife(knives, 225, 11);

    // Open shaft in middle of floor 1
    for (let y = 11; y <= 12; y++) {
        setTile(grid, 193, y, 0); setTile(grid, 194, y, 0);
        setTile(grid, 195, y, 0); setTile(grid, 196, y, 0);
        setTile(grid, 197, y, 0); setTile(grid, 198, y, 0); setTile(grid, 199, y, 0);
    }

    // Floor 2 (Y=8)
    platform(grid, 163, 8, 68);
    addCoins(coins, 164, 229, 8);
    addEnemy(enemies, 172, 8, 164, 229, 1); addEnemy(enemies, 188, 8, 164, 229, 0);
    addEnemy(enemies, 205, 8, 164, 229, 1); addEnemy(enemies, 219, 8, 164, 229, 0);
    addKey(keys, 229, 8);
    addKnife(knives, 180, 8); addKnife(knives, 200, 8); addKnife(knives, 220, 8);

    // Floor 3 (Y=5)
    platform(grid, 163, 5, 68);
    addCoins(coins, 164, 229, 5);
    addEnemy(enemies, 172, 5, 164, 229, 0); addEnemy(enemies, 188, 5, 164, 229, 1);
    addEnemy(enemies, 205, 5, 164, 229, 0); addEnemy(enemies, 219, 5, 164, 229, 1);
    addKey(keys, 229, 5);
    addKnife(knives, 175, 5); addKnife(knives, 195, 5); addKnife(knives, 215, 5);

    // Floor 4 (Y=2)
    platform(grid, 163, 2, 68);
    addCoins(coins, 164, 229, 2);
    addEnemy(enemies, 175, 2, 164, 229, 1); addEnemy(enemies, 193, 2, 164, 229, 0);
    addEnemy(enemies, 210, 2, 164, 229, 1); addEnemy(enemies, 225, 2, 164, 229, 0);
    addKey(keys, 229, 2);
    addKnife(knives, 182, 2); addKnife(knives, 205, 2); addKnife(knives, 222, 2);

    // Ladders connecting floors
    addLadder(ladders, 165, 11, 8); addLadder(ladders, 180, 11, 8);
    addLadder(ladders, 205, 11, 8); addLadder(ladders, 225, 11, 8);
    addLadder(ladders, 165, 8, 5);  addLadder(ladders, 180, 8, 5);
    addLadder(ladders, 205, 8, 5);  addLadder(ladders, 225, 8, 5);
    addLadder(ladders, 165, 5, 2);  addLadder(ladders, 190, 5, 2);
    addLadder(ladders, 210, 5, 2);  addLadder(ladders, 225, 5, 2);
    addLadder(ladders, 165, 2, 0);  addLadder(ladders, 215, 2, 0);

    // Moving platforms fill gap between the two halves of floor 1
    mp(movingPlatforms, 193, 11, 2, 3.0, 0, 11, 11);
    mp(movingPlatforms, 195, 8,  2, 3.0, 0, 8, 10);
    mp(movingPlatforms, 197, 5,  2, 3.0, 0, 5, 9);

    // ══════════════════════════════════════════════════════
    // SECTION 4 — Chaos bridge (cols 252–330)
    // ══════════════════════════════════════════════════════
    carveGap(grid, 232, 18, groundRow);

    // Very fast moving platforms over a wide void
    for (let i = 0; i < 12; i++) {
        const col  = 233 + i * 5;
        const row  = 3 + (i % 8);
        const spd  = 2.5 + i * 0.2;
        const minR = 1 + (i % 3);
        const maxR = 9 + (i % 3);
        const tt   = [9, 10, 11][i % 3];
        mp(movingPlatforms, col, row, 3, spd, minR, maxR, tt);
        addCoins(coins, col, row); addCoins(coins, col+1, row);
    }

    platform(grid, 252, 11, 5); addCoins(coins, 252, 256, 11);
    addKey(keys, 256, 11);
    addEnemy(enemies, 254, 11, 252, 256, 0);
    addLadder(ladders, 253, 12, 11);

    platform(grid, 264, 2, 5); addCoins(coins, 264, 268, 2);
    addKey(keys, 268, 2);
    addEnemy(enemies, 266, 2, 264, 268, 1);
    addLadder(ladders, 265, 12, 2);

    platform(grid, 278, 7, 5); addCoins(coins, 278, 282, 7);
    addKey(keys, 282, 7);
    addEnemy(enemies, 280, 7, 278, 282, 0);

    addKnife(knives, 258, 11); addKnife(knives, 270, 2); addKnife(knives, 285, 7);

    // ══════════════════════════════════════════════════════
    // SECTION 5 — Descending spiral exterior (cols 290–370)
    // ══════════════════════════════════════════════════════
    platform(grid, 293, 0, 36);
    addCoins(coins, 294, 328, 0);
    addKey(keys, 310, 0); addKey(keys, 328, 0);
    addEnemy(enemies, 299, 0, 294, 328, 1);
    addEnemy(enemies, 312, 0, 294, 328, 0);
    addEnemy(enemies, 322, 0, 294, 328, 1);
    addLadder(ladders, 295, 12, 0);
    addLadder(ladders, 326, 12, 0);
    addKnife(knives, 305, 0); addKnife(knives, 317, 0);

    // Descend from the top platform
    platform(grid, 332, 2, 8); addCoins(coins, 333, 339, 2); addEnemy(enemies, 336, 2, 333, 339, 0);
    platform(grid, 332, 5, 8); addCoins(coins, 333, 339, 5); addEnemy(enemies, 336, 5, 333, 339, 1);
    platform(grid, 332, 8, 8); addCoins(coins, 333, 339, 8); addEnemy(enemies, 336, 8, 333, 339, 0);
    platform(grid, 332, 11, 8); addCoins(coins, 333, 339, 11); addKey(keys, 339, 11);
    addLadder(ladders, 334, 11, 2);
    addKnife(knives, 335, 5); addKnife(knives, 337, 8);

    carveGap(grid, 343, 12, groundRow);

    // ══════════════════════════════════════════════════════
    // SECTION 6 — The Final Ascent (cols 360–500)
    // ══════════════════════════════════════════════════════
    // The grandest challenge: climb from the bottom to the very top

    // Wide pit with everything mixed — moving platforms, fixed islands, enemies, knives
    mp(movingPlatforms, 344, 10, 3, 2.0, 7, 11, 9);
    mp(movingPlatforms, 348, 7,  3, 2.5, 4, 10, 10);
    mp(movingPlatforms, 352, 4,  3, 3.0, 1, 7, 11);
    mp(movingPlatforms, 356, 9,  3, 2.2, 6, 11, 9);
    mp(movingPlatforms, 360, 6,  3, 2.8, 3, 9, 10);
    mp(movingPlatforms, 364, 3,  3, 3.2, 0, 6, 11);

    platform(grid, 368, 11, 6); addCoins(coins, 368, 373, 11); addLadder(ladders, 369, 12, 11);
    platform(grid, 376, 7, 6);  addCoins(coins, 376, 381, 7);  addEnemy(enemies, 379, 7, 376, 381, 0);
    platform(grid, 384, 3, 6);  addCoins(coins, 384, 389, 3);  addEnemy(enemies, 387, 3, 384, 389, 1);
    platform(grid, 392, 0, 6);  addCoins(coins, 392, 397, 0);  addKey(keys, 397, 0);

    addLadder(ladders, 377, 11, 7);
    addLadder(ladders, 385, 7, 3);
    addLadder(ladders, 393, 3, 0);

    mp(movingPlatforms, 374, 9, 2, 2.5, 5, 11, 11);
    mp(movingPlatforms, 382, 5, 2, 2.8, 1, 7, 9);
    mp(movingPlatforms, 390, 1, 2, 3.0, 0, 4, 10);

    // Long overhead highway
    platform(grid, 400, 0, 40);
    addCoins(coins, 401, 439, 0);
    addKey(keys, 420, 0); addKey(keys, 439, 0);
    addEnemy(enemies, 407, 0, 401, 439, 1); addEnemy(enemies, 418, 0, 401, 439, 0);
    addEnemy(enemies, 428, 0, 401, 439, 1); addEnemy(enemies, 436, 0, 401, 439, 0);
    addKnife(knives, 410, 0); addKnife(knives, 424, 0); addKnife(knives, 434, 0);
    addLadder(ladders, 402, 12, 0);
    addLadder(ladders, 435, 12, 0);

    // Ground-level mid-section
    platform(grid, 400, 8, 40);
    addCoins(coins, 401, 439, 8);
    addEnemy(enemies, 408, 8, 401, 439, 0); addEnemy(enemies, 420, 8, 401, 439, 1);
    addEnemy(enemies, 430, 8, 401, 439, 0);
    addKey(keys, 439, 8);
    addKnife(knives, 414, 8); addKnife(knives, 426, 8);
    addLadder(ladders, 404, 8, 0);
    addLadder(ladders, 420, 8, 0);
    addLadder(ladders, 436, 8, 0);

    // Bottom section
    carveGap(grid, 400, 40, groundRow);
    platform(grid, 400, 11, 40);
    addCoins(coins, 401, 439, 11);
    addEnemy(enemies, 410, 11, 401, 439, 1); addEnemy(enemies, 424, 11, 401, 439, 0);
    addEnemy(enemies, 435, 11, 401, 439, 1);
    addKey(keys, 439, 11);
    addKnife(knives, 408, 11); addKnife(knives, 420, 11); addKnife(knives, 432, 11);
    addLadder(ladders, 403, 11, 8);
    addLadder(ladders, 422, 11, 8);
    addLadder(ladders, 438, 11, 8);

    // ══════════════════════════════════════════════════════
    // SECTION 7 — Final Boss Approach (cols 443–580)
    // ══════════════════════════════════════════════════════
    addKnife(knives, 443, groundRow);
    addKnife(knives, 444, groundRow);
    addKnife(knives, 445, groundRow);

    carveGap(grid, 446, 15, groundRow);

    // Extreme moving platform gauntlet (fastest speeds in game)
    mp(movingPlatforms, 447, 9, 2, 3.5, 2, 11, 11);
    mp(movingPlatforms, 450, 4, 2, 3.5, 0, 9, 9);
    mp(movingPlatforms, 453, 9, 2, 3.5, 2, 11, 10);
    mp(movingPlatforms, 456, 4, 2, 3.5, 0, 9, 11);
    mp(movingPlatforms, 459, 9, 2, 3.5, 2, 11, 9);

    platform(grid, 462, 8, 6); addCoins(coins, 462, 467, 8);
    addEnemy(enemies, 465, 8, 462, 467, 1);
    addLadder(ladders, 463, 12, 8);

    // Ascending spire — single column of platforms you must climb precisely
    platform(grid, 470, 11, 3); addCoin(coins, 471, 11);
    platform(grid, 475, 9, 3);  addCoin(coins, 476, 9);
    platform(grid, 480, 7, 3);  addCoin(coins, 481, 7);
    platform(grid, 485, 5, 3);  addCoin(coins, 486, 5);
    platform(grid, 490, 3, 3);  addCoin(coins, 491, 3);
    platform(grid, 495, 1, 3);  addCoin(coins, 496, 1);

    mp(movingPlatforms, 472, 10, 2, 3.0, 7, 11, 11);
    mp(movingPlatforms, 477, 8, 2, 3.0, 5, 10, 9);
    mp(movingPlatforms, 482, 6, 2, 3.0, 3, 8, 10);
    mp(movingPlatforms, 487, 4, 2, 3.0, 1, 6, 11);
    mp(movingPlatforms, 492, 2, 2, 3.0, 0, 4, 9);

    // Final top platform — THE BOSS ROOM
    platform(grid, 500, 0, 48);
    addCoins(coins, 501, 547, 0);
    addKey(keys, 520, 0); addKey(keys, 530, 0); addKey(keys, 540, 0); addKey(keys, 547, 0);
    addEnemy(enemies, 507, 0, 501, 547, 1);
    addEnemy(enemies, 516, 0, 501, 547, 0);
    addEnemy(enemies, 525, 0, 501, 547, 1);
    addEnemy(enemies, 534, 0, 501, 547, 0);
    addEnemy(enemies, 543, 0, 501, 547, 1);
    addKnife(knives, 510, 0); addKnife(knives, 522, 0);
    addKnife(knives, 533, 0); addKnife(knives, 544, 0);
    addLadder(ladders, 502, 12, 0);
    addLadder(ladders, 540, 12, 0);

    // Descend from boss room
    carveGap(grid, 551, 10, groundRow);

    // Last staircase
    blockStack(grid, 558, 12, 2, 1);
    blockStack(grid, 560, 11, 2, 2);
    blockStack(grid, 562, 10, 2, 3);
    blockStack(grid, 564, 9,  2, 4);
    blockStack(grid, 566, 8,  2, 5);
    blockStack(grid, 568, 7,  2, 6);

    platform(grid, 572, 6, 16);
    addCoins(coins, 572, 587, 6);
    addEnemy(enemies, 578, 6, 572, 587, 0);
    addEnemy(enemies, 584, 6, 572, 587, 1);
    addLadder(ladders, 574, 12, 6);

    addKnife(knives, 590, groundRow);
    addKnife(knives, 591, groundRow);
    addKnife(knives, 592, groundRow);

    carveGap(grid, 595, 8, groundRow);

    blockStack(grid, 602, 12, 2, 1);
    blockStack(grid, 604, 11, 2, 2);
    blockStack(grid, 606, 10, 2, 3);
    blockStack(grid, 608, 9,  2, 4);

    platform(grid, 612, 8, 10);
    addCoins(coins, 612, 621, 8);

    const door = {
        x: 622 * TILE, y: 8 * TILE,
        width: 52, height: 120,
        col: 622, row: 8
    };

    return {
        id: 12,
        name: 'Level 12',
        timerMs: 600000,
        progressUnits: 560,
        grid, coins, keys, knives, enemies, ladders, door,
        movingPlatforms,
        rows, cols, groundRow,
        totalCoinsRequiredToOpenDoor: coins.length
    };
}
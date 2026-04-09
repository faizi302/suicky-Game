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

export function createLevel11Map() {
    const rows = 17;
    const cols = 600;
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

    // ══════════════════════════════════════════════════
    // SECTION 1 — Spiraling entry tower (cols 0–70)
    // ══════════════════════════════════════════════════
    // The tower is a closed box with a spiral path inside
    // Outer walls
    for (let y = 0; y <= 12; y++) {
        setTile(grid, 5,  y, 2);
        setTile(grid, 35, y, 2);
    }
    platform(grid, 5, 0, 31);  // ceiling

    // Spiral interior (platforms wrapping around inside the box)
    platform(grid, 6,  11, 10); addCoins(coins, 6,  15, 11); addEnemy(enemies, 10, 11, 6, 15, 0);
    platform(grid, 21, 11, 14); addCoins(coins, 21, 34, 11); // right side bottom
    platform(grid, 6,  9,  10); addCoins(coins, 6,  15, 9);
    platform(grid, 21, 7,  14); addCoins(coins, 21, 34, 7);  addEnemy(enemies, 28, 7, 21, 34, 1);
    platform(grid, 6,  5,  10); addCoins(coins, 6,  15, 5);  addEnemy(enemies, 10, 5, 6, 15, 0);
    platform(grid, 21, 3,  14); addCoins(coins, 21, 34, 3);  addKey(keys, 33, 3);
    platform(grid, 6,  2,  10); addCoins(coins, 6,  15, 2);  addKey(keys, 15, 2);

    addLadder(ladders, 16, 11, 9);
    addLadder(ladders, 20, 11, 7);
    addLadder(ladders, 16, 9, 5);
    addLadder(ladders, 20, 7, 3);
    addLadder(ladders, 16, 5, 2);
    addLadder(ladders, 20, 3, 2);  // to top exit

    addKnife(knives, 8, 11);
    addKnife(knives, 23, 7);
    addKnife(knives, 8, 5);

    // Top exit of tower leads to an overhead bridge
    platform(grid, 38, 0, 30);
    addCoins(coins, 39, 67, 0);
    addKey(keys, 55, 0);
    addKey(keys, 66, 0);
    addEnemy(enemies, 44, 0, 39, 67, 1);
    addEnemy(enemies, 54, 0, 39, 67, 0);
    addEnemy(enemies, 63, 0, 39, 67, 1);
    addLadder(ladders, 40, 12, 0);
    addLadder(ladders, 60, 12, 0);

    // Ground-level route after tower
    carveGap(grid, 37, 6, groundRow);
    platform(grid, 37, 10, 4); addCoins(coins, 37, 40, 10);
    platform(grid, 43, 8, 4);  addCoins(coins, 43, 46, 8);
    platform(grid, 49, 6, 4);  addCoins(coins, 49, 52, 6);
    platform(grid, 55, 8, 4);  addCoins(coins, 55, 58, 8);
    platform(grid, 61, 10, 4); addCoins(coins, 61, 64, 10);
    addLadder(ladders, 38, 12, 10);
    addLadder(ladders, 62, 10, 6);

    mp(movingPlatforms, 41, 9, 2, 1.8, 6, 11, 9);
    mp(movingPlatforms, 47, 7, 2, 2.2, 4, 10, 10);
    mp(movingPlatforms, 53, 7, 2, 1.6, 4, 10, 11);
    mp(movingPlatforms, 59, 9, 2, 2.0, 6, 11, 9);

    addKnife(knives, 67, groundRow);
    addKnife(knives, 68, groundRow);
    addKnife(knives, 69, groundRow);

    // ══════════════════════════════════════════════════
    // SECTION 2 — Crossroads (cols 70–140)
    // ══════════════════════════════════════════════════
    carveGap(grid, 70, 15, groundRow);

    // Four-way junction — 4 routes converge at a central hub
    // Hub platform
    platform(grid, 82, 6, 8);
    addCoins(coins, 83, 89, 6);
    addKey(keys, 89, 6);
    addEnemy(enemies, 86, 6, 83, 89, 1);

    // Route N (go up from hub)
    addLadder(ladders, 85, 6, 0);
    platform(grid, 80, 0, 12);
    addCoins(coins, 81, 91, 0);
    addKey(keys, 91, 0);
    addEnemy(enemies, 85, 0, 81, 91, 0);

    // Route S (ground-level stepping stones to hub)
    platform(grid, 70, 11, 4); addCoins(coins, 70, 73, 11);
    platform(grid, 76, 9,  4); addCoins(coins, 76, 79, 9);
    addLadder(ladders, 71, 12, 11);
    addLadder(ladders, 77, 11, 6);
    mp(movingPlatforms, 74, 10, 2, 2.0, 7, 11, 10);

    // Route E (right of hub, ascending)
    platform(grid, 92, 4, 6);  addCoins(coins, 92, 97, 4);  addEnemy(enemies, 95, 4, 92, 97, 1);
    platform(grid, 100, 2, 6); addCoins(coins, 100, 105, 2); addKey(keys, 105, 2);
    addLadder(ladders, 93, 6, 4);
    addLadder(ladders, 101, 4, 2);

    // Route W (left of hub, with enemies)
    platform(grid, 70, 6, 10); addCoins(coins, 71, 79, 6); addEnemy(enemies, 74, 6, 71, 79, 0);
    addLadder(ladders, 72, 12, 6);

    // Connecting ground after crossroads
    platform(grid, 108, 9, 6); addCoins(coins, 109, 113, 9); addEnemy(enemies, 111, 9, 109, 113, 0);
    platform(grid, 116, 6, 8); addCoins(coins, 117, 123, 6); addEnemy(enemies, 120, 6, 117, 123, 1);
    addLadder(ladders, 109, 12, 9);
    addLadder(ladders, 118, 9, 6);
    addLadder(ladders, 122, 12, 6);

    addKnife(knives, 126, groundRow);
    addKnife(knives, 127, groundRow);

    carveGap(grid, 130, 10, groundRow);

    // ══════════════════════════════════════════════════
    // SECTION 3 — Moving platform river (cols 130–190)
    // ══════════════════════════════════════════════════
    // Dense forest of moving platforms at all heights
    for (let i = 0; i < 20; i++) {
        const col  = 131 + i * 3;
        const row  = 4 + (i % 7);
        const spd  = 1.2 + (i % 4) * 0.4;
        const minR = 2 + (i % 3);
        const maxR = 9 + (i % 3);
        const tt   = [9, 10, 11][i % 3];
        mp(movingPlatforms, col, row, 2, spd, minR, maxR, tt);
        addCoin(coins, col, row);
        addCoin(coins, col + 1, row);
    }

    // Fixed platforms for breathing room
    platform(grid, 132, 11, 4); addCoins(coins, 132, 135, 11);
    platform(grid, 150, 3, 5);  addCoins(coins, 150, 154, 3); addKey(keys, 154, 3);
    platform(grid, 168, 11, 4); addCoins(coins, 168, 171, 11);
    platform(grid, 182, 3, 5);  addCoins(coins, 182, 186, 3); addKey(keys, 186, 3);

    addEnemy(enemies, 151, 3, 150, 154, 1);
    addEnemy(enemies, 183, 3, 182, 186, 0);

    addLadder(ladders, 133, 11, 5);
    addLadder(ladders, 169, 11, 5);

    addKnife(knives, 145, 11);
    addKnife(knives, 162, 3);
    addKnife(knives, 178, 11);

    // ══════════════════════════════════════════════════
    // SECTION 4 — The Great Wall (cols 190–260)
    // ══════════════════════════════════════════════════
    // A tall solid wall with tunnels cut through it at various levels

    // The wall itself
    for (let x = 200; x <= 215; x++)
        for (let y = 0; y <= 12; y++)
            setTile(grid, x, y, 2);

    // Tunnels cut through the wall
    // Tunnel A (bottom) — row 11-12
    for (let x = 200; x <= 215; x++) { setTile(grid, x, 11, 0); setTile(grid, x, 12, 0); }
    // Tunnel B (mid) — row 7-8
    for (let x = 200; x <= 215; x++) { setTile(grid, x, 7, 0); setTile(grid, x, 8, 0); }
    // Tunnel C (high) — row 3-4
    for (let x = 200; x <= 215; x++) { setTile(grid, x, 3, 0); setTile(grid, x, 4, 0); }
    // Tunnel D (very top) — row 1
    for (let x = 200; x <= 215; x++) setTile(grid, x, 1, 0);

    // Left side of wall — platforms leading to each tunnel
    platform(grid, 192, 11, 8); addCoins(coins, 193, 199, 11); addEnemy(enemies, 196, 11, 193, 199, 0);
    platform(grid, 192, 7, 8);  addCoins(coins, 193, 199, 7);  addEnemy(enemies, 196, 7, 193, 199, 1);
    platform(grid, 192, 3, 8);  addCoins(coins, 193, 199, 3);  addEnemy(enemies, 196, 3, 193, 199, 0);
    platform(grid, 192, 1, 8);  addCoins(coins, 193, 199, 1);  addKey(keys, 199, 1);
    addLadder(ladders, 194, 11, 7);
    addLadder(ladders, 198, 7, 3);
    addLadder(ladders, 194, 3, 1);
    addKnife(knives, 195, 11);
    addKnife(knives, 197, 7);

    // Right side of wall — platforms after each tunnel
    platform(grid, 216, 11, 8); addCoins(coins, 217, 223, 11); addEnemy(enemies, 220, 11, 217, 223, 1);
    platform(grid, 216, 7, 8);  addCoins(coins, 217, 223, 7);  addEnemy(enemies, 220, 7, 217, 223, 0);
    platform(grid, 216, 3, 8);  addCoins(coins, 217, 223, 3);  addKey(keys, 223, 3);
    platform(grid, 216, 1, 8);  addCoins(coins, 217, 223, 1);  addKey(keys, 223, 1);
    addLadder(ladders, 218, 11, 7);
    addLadder(ladders, 222, 7, 3);
    addLadder(ladders, 218, 3, 1);
    addKnife(knives, 219, 7);
    addKnife(knives, 221, 3);

    carveGap(grid, 228, 10, groundRow);

    // ══════════════════════════════════════════════════
    // SECTION 5 — Double helix towers (cols 230–310)
    // ══════════════════════════════════════════════════
    // Two vertical towers side by side, platforms alternate between them

    // Tower A walls
    for (let y = 0; y <= 12; y++) {
        setTile(grid, 230, y, 2);
        setTile(grid, 245, y, 2);
    }
    // Tower B walls
    for (let y = 0; y <= 12; y++) {
        setTile(grid, 250, y, 2);
        setTile(grid, 265, y, 2);
    }
    platform(grid, 230, 0, 16); // shared ceiling
    platform(grid, 250, 0, 16);

    // Tower A interior — left-biased platforms
    platform(grid, 231, 11, 7); addCoins(coins, 231, 237, 11); addEnemy(enemies, 234, 11, 231, 237, 0);
    platform(grid, 238, 9, 7);  addCoins(coins, 238, 244, 9);
    platform(grid, 231, 7, 7);  addCoins(coins, 231, 237, 7);  addEnemy(enemies, 234, 7, 231, 237, 1);
    platform(grid, 238, 5, 7);  addCoins(coins, 238, 244, 5);
    platform(grid, 231, 3, 7);  addCoins(coins, 231, 237, 3);  addKey(keys, 237, 3);
    platform(grid, 238, 1, 7);  addCoins(coins, 238, 244, 1);  addKey(keys, 244, 1);
    addLadder(ladders, 232, 11, 7);
    addLadder(ladders, 239, 9, 5);
    addLadder(ladders, 232, 7, 3);
    addLadder(ladders, 239, 5, 1);
    addKnife(knives, 233, 11); addKnife(knives, 240, 9);

    // Tower B interior — right-biased platforms
    platform(grid, 251, 11, 7); addCoins(coins, 251, 257, 11); addEnemy(enemies, 254, 11, 251, 257, 0);
    platform(grid, 258, 9, 7);  addCoins(coins, 258, 264, 9);
    platform(grid, 251, 7, 7);  addCoins(coins, 251, 257, 7);  addEnemy(enemies, 254, 7, 251, 257, 1);
    platform(grid, 258, 5, 7);  addCoins(coins, 258, 264, 5);
    platform(grid, 251, 3, 7);  addCoins(coins, 251, 257, 3);  addKey(keys, 257, 3);
    platform(grid, 258, 1, 7);  addCoins(coins, 258, 264, 1);  addKey(keys, 264, 1);
    addLadder(ladders, 252, 11, 7);
    addLadder(ladders, 259, 9, 5);
    addLadder(ladders, 252, 7, 3);
    addLadder(ladders, 259, 5, 1);
    addKnife(knives, 253, 11); addKnife(knives, 260, 9);

    // Bridge connecting towers at the top
    platform(grid, 246, 0, 4);
    addCoins(coins, 246, 249, 0);

    // Exit right
    addKnife(knives, 267, groundRow);
    addKnife(knives, 268, groundRow);
    carveGap(grid, 270, 10, groundRow);

    // ══════════════════════════════════════════════════
    // SECTION 6 — Descent labyrinth (cols 270–360)
    // ══════════════════════════════════════════════════
    // A wide open area with many crisscrossing platforms — very complex to navigate

    // Three "floors" of platforms at different Y, overlapping and interconnected
    // Floor 1: Y=2 (ceiling level)
    platform(grid, 272, 2, 12); addCoins(coins, 273, 283, 2); addEnemy(enemies, 277, 2, 273, 283, 0);
    platform(grid, 292, 2, 12); addCoins(coins, 293, 303, 2); addKey(keys, 303, 2);
    platform(grid, 312, 2, 12); addCoins(coins, 313, 323, 2); addEnemy(enemies, 317, 2, 313, 323, 1);
    platform(grid, 332, 2, 12); addCoins(coins, 333, 343, 2); addKey(keys, 343, 2);

    // Floor 2: Y=6
    platform(grid, 280, 6, 10); addCoins(coins, 281, 289, 6); addEnemy(enemies, 285, 6, 281, 289, 1);
    platform(grid, 300, 6, 10); addCoins(coins, 301, 309, 6); addEnemy(enemies, 305, 6, 301, 309, 0);
    platform(grid, 320, 6, 10); addCoins(coins, 321, 329, 6); addKey(keys, 329, 6);
    platform(grid, 340, 6, 10); addCoins(coins, 341, 349, 6); addEnemy(enemies, 345, 6, 341, 349, 1);

    // Floor 3: Y=10
    platform(grid, 272, 10, 10); addCoins(coins, 273, 281, 10); addEnemy(enemies, 277, 10, 273, 281, 0);
    platform(grid, 292, 10, 10); addCoins(coins, 293, 301, 10); addKey(keys, 301, 10);
    platform(grid, 312, 10, 10); addCoins(coins, 313, 321, 10); addEnemy(enemies, 317, 10, 313, 321, 1);
    platform(grid, 332, 10, 10); addCoins(coins, 333, 341, 10); addEnemy(enemies, 337, 10, 333, 341, 0);

    // Ladders between floors
    addLadder(ladders, 274, 10, 6); addLadder(ladders, 284, 6, 2);
    addLadder(ladders, 294, 10, 6); addLadder(ladders, 304, 6, 2);
    addLadder(ladders, 314, 10, 6); addLadder(ladders, 324, 6, 2);
    addLadder(ladders, 334, 10, 6); addLadder(ladders, 344, 6, 2);

    // Moving platforms fill horizontal gaps between floor segments
    mp(movingPlatforms, 284, 10, 2, 2.0, 8, 11, 9);
    mp(movingPlatforms, 289, 6, 2, 2.5, 4, 8, 10);
    mp(movingPlatforms, 304, 10, 2, 2.0, 8, 11, 11);
    mp(movingPlatforms, 309, 6, 2, 2.5, 4, 8, 9);
    mp(movingPlatforms, 324, 10, 2, 2.0, 8, 11, 10);
    mp(movingPlatforms, 329, 6, 2, 2.5, 4, 8, 11);

    addKnife(knives, 276, 10); addKnife(knives, 282, 6); addKnife(knives, 296, 2);
    addKnife(knives, 306, 10); addKnife(knives, 316, 6); addKnife(knives, 326, 2);

    // Exit from labyrinth
    addKnife(knives, 355, groundRow);
    addKnife(knives, 356, groundRow);
    carveGap(grid, 358, 12, groundRow);

    // ══════════════════════════════════════════════════
    // SECTION 7 — Final gauntlet (cols 360–520)
    // ══════════════════════════════════════════════════
    // Maximum chaos: moving platforms, enemies, knives all combined

    // Phase 1: Moving platform field
    for (let i = 0; i < 15; i++) {
        const col = 360 + i * 4;
        const minR = 2 + (i % 4);
        const maxR = 9 + (i % 3);
        const spd  = 1.5 + (i % 5) * 0.3;
        const tt   = [9, 10, 11][i % 3];
        mp(movingPlatforms, col, minR + 2, 3, spd, minR, maxR, tt);
        addCoins(coins, col, minR + 2);
        addCoins(coins, col + 1, minR + 2);
        addCoins(coins, col + 2, minR + 2);
    }

    // Fixed anchor platforms in the field
    platform(grid, 362, 11, 4); addCoins(coins, 362, 365, 11); addLadder(ladders, 363, 12, 11);
    platform(grid, 378, 2, 6);  addCoins(coins, 378, 383, 2);  addKey(keys, 383, 2); addEnemy(enemies, 381, 2, 378, 383, 1);
    platform(grid, 396, 11, 6); addCoins(coins, 396, 401, 11); addEnemy(enemies, 399, 11, 396, 401, 0);
    platform(grid, 412, 2, 6);  addCoins(coins, 412, 417, 2);  addKey(keys, 417, 2); addEnemy(enemies, 415, 2, 412, 417, 1);
    platform(grid, 428, 11, 6); addCoins(coins, 428, 433, 11); addEnemy(enemies, 431, 11, 428, 433, 0);

    addLadder(ladders, 379, 12, 2);
    addLadder(ladders, 397, 11, 5);
    addLadder(ladders, 413, 12, 2);
    addLadder(ladders, 429, 11, 5);

    addKnife(knives, 375, 11);
    addKnife(knives, 392, 2);
    addKnife(knives, 409, 11);
    addKnife(knives, 425, 2);

    // Phase 2: Staircase climbs
    carveGap(grid, 438, 10, groundRow);

    // Ascending staircase
    for (let i = 0; i < 10; i++) {
        blockStack(grid, 440 + i, 12 - i, 1, i + 2);
        addCoin(coins, 440 + i, 12 - i);
    }

    // Long summit platform
    platform(grid, 452, 2, 22);
    addCoins(coins, 453, 473, 2);
    addKey(keys, 465, 2);
    addKey(keys, 473, 2);
    addEnemy(enemies, 458, 2, 453, 473, 1);
    addEnemy(enemies, 466, 2, 453, 473, 0);
    addEnemy(enemies, 471, 2, 453, 473, 1);
    addLadder(ladders, 454, 12, 2);

    // Descend
    carveGap(grid, 477, 8, groundRow);
    blockStack(grid, 483, 12, 2, 1);
    blockStack(grid, 485, 11, 2, 2);
    blockStack(grid, 487, 10, 2, 3);
    blockStack(grid, 489, 9,  2, 4);
    blockStack(grid, 491, 8,  2, 5);

    platform(grid, 495, 7, 14);
    addCoins(coins, 495, 508, 7);
    addEnemy(enemies, 501, 7, 495, 508, 0);
    addEnemy(enemies, 506, 7, 495, 508, 1);
    addLadder(ladders, 497, 12, 7);

    addKnife(knives, 510, groundRow);
    addKnife(knives, 511, groundRow);

    carveGap(grid, 514, 6, groundRow);

    blockStack(grid, 520, 12, 2, 1);
    blockStack(grid, 522, 11, 2, 2);
    blockStack(grid, 524, 10, 2, 3);

    platform(grid, 528, 9, 8);
    addCoins(coins, 528, 535, 9);

    const door = {
        x: 536 * TILE, y: 9 * TILE,
        width: 52, height: 120,
        col: 536, row: 9
    };

    return {
        id: 11,
        name: 'Level 11',
        timerMs: 560000,
        progressUnits: 500,
        grid, coins, keys, knives, enemies, ladders, door,
        movingPlatforms,
        rows, cols, groundRow,
        totalCoinsRequiredToOpenDoor: coins.length
    };
}
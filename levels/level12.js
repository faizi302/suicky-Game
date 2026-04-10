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
// mp matches level10 style: two tiles wide, uses frameIndices array
function mp(movingPlatforms, col, row, speed, minRow, maxRow, frameIndices = [9, 10, 11]) {
    movingPlatforms.push({
        x: col * TILE, y: row * TILE,
        width: TILE, height: TILE,
        axis: 'y', speed,
        min: minRow * TILE, max: maxRow * TILE,
        frameIndices
    });
    movingPlatforms.push({
        x: (col + 0.7) * TILE, y: row * TILE,
        width: TILE, height: TILE,
        axis: 'y', speed,
        min: minRow * TILE, max: maxRow * TILE,
        frameIndices
    });
}

function compressLevel(grid, coins, keys, knives, enemies, ladders, movingPlatforms, door) {
    const cuts = [
        [110, 155],
        [256, 280]
    ];

    function shiftCol(col) {
        let shift = 0;
        for (const [start, end] of cuts) {
            if (col >= start && col <= end) return null;
            if (col > end) shift += (end - start + 1);
        }
        return col - shift;
    }

    function shiftPixelX(x) {
        const col = Math.floor(x / TILE);
        const within = x - col * TILE;
        const newCol = shiftCol(col);
        if (newCol === null) return null;
        return newCol * TILE + within;
    }

    const removedCount = cuts.reduce((sum, [a, b]) => sum + (b - a + 1), 0);
    const newCols = grid[0].length - removedCount;
    const newGrid = makeGrid(grid.length, newCols);

    for (let y = 0; y < grid.length; y++) {
        for (let x = 0; x < grid[0].length; x++) {
            const nx = shiftCol(x);
            if (nx !== null) newGrid[y][nx] = grid[y][x];
        }
    }

    const newCoins = coins
        .map(c => {
            const x = shiftPixelX(c.x);
            return x === null ? null : { ...c, x };
        })
        .filter(Boolean);

    const newKeys = keys
        .map(k => {
            const x = shiftPixelX(k.x);
            return x === null ? null : { ...k, x };
        })
        .filter(Boolean);

    const newKnives = knives
        .map(k => {
            const x = shiftPixelX(k.x);
            return x === null ? null : { ...k, x };
        })
        .filter(Boolean);

    const newEnemies = enemies
        .map(e => {
            const newX = shiftPixelX(e.x);
            const leftCol = shiftCol(Math.floor(e.patrolLeft / TILE));
            const rightCol = shiftCol(Math.floor(e.patrolRight / TILE));
            if (newX === null || leftCol === null || rightCol === null) return null;
            return {
                ...e,
                x: newX,
                patrolLeft: leftCol * TILE,
                patrolRight: rightCol * TILE
            };
        })
        .filter(Boolean);

    const newLadders = ladders
        .map(l => {
            const centerCol = Math.floor((l.x + l.width * 0.5) / TILE);
            const newCol = shiftCol(centerCol);
            if (newCol === null) return null;
            return {
                ...l,
                x: newCol * TILE + (TILE - l.width) / 2
            };
        })
        .filter(Boolean);

    const newMovingPlatforms = movingPlatforms
        .map(p => {
            const newX = shiftPixelX(p.x);
            return newX === null ? null : { ...p, x: newX };
        })
        .filter(Boolean);

    const newDoorCol = shiftCol(door.col);
    const newDoor = {
        ...door,
        col: newDoorCol,
        x: newDoorCol * TILE
    };

    return {
        grid: newGrid,
        coins: newCoins,
        keys: newKeys,
        knives: newKnives,
        enemies: newEnemies,
        ladders: newLadders,
        movingPlatforms: newMovingPlatforms,
        door: newDoor,
        cols: newCols
    };
}

export function createLevel12Map() {
    const rows = 17;
    const cols = 640;
    const groundRow = 13;

    const grid = makeGrid(rows, cols);
    const coins = [], keys = [], knives = [], enemies = [], ladders = [], movingPlatforms = [];

    // Ground + boundary walls
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
    // Corridor floors — moved down to be in visible camera range (y>=4)
    // ══════════════════════════════════════════════════════
    // HARD MULTI-LAYER MAZE SECTION (cols 3–77)
    // Final-level difficulty version
    // ══════════════════════════════════════════════════════

    // Main broken corridor floors
    platform(grid, 3,  4, 10);
    platform(grid, 15, 4, 12);
    platform(grid, 31, 4, 10);
    platform(grid, 45, 4, 12);
    platform(grid, 61, 4, 13);

    platform(grid, 1,  7,  6);
    platform(grid, 14, 7, 10);
    platform(grid, 28, 7, 12);
    platform(grid, 44, 7, 10);
    platform(grid, 58, 7, 16);

    platform(grid, 3, 10, 6);
    platform(grid, 49, 10, 10);
    platform(grid, 63, 10, 12);

    // Clear open corridor spaces above each layer
    for (let x = 3; x <= 77; x++) {
        setTile(grid, x, 5,  0);
        setTile(grid, x, 6,  0);
        setTile(grid, x, 8,  0);
        setTile(grid, x, 9,  0);
        setTile(grid, x, 11, 0);
        setTile(grid, x, 12, 0);
    }

    // Re-set only where floors actually exist
    const topFloorRanges = [
        [3, 10], [15, 26], [31, 40], [45, 56], [61, 73]
    ];
    const midFloorRanges = [
        [3, 10], [14, 23], [28, 39], [44, 48], [58, 73]
    ];
    const lowFloorRanges = [
        [3, 10], [49, 58], [63, 74]
    ];

    for (const [a, b] of topFloorRanges) {
        for (let x = a; x <= b; x++) setTile(grid, x, 4, 1);
    }
    for (const [a, b] of midFloorRanges) {
        for (let x = a; x <= b; x++) setTile(grid, x, 7, 1);
    }
    for (const [a, b] of lowFloorRanges) {
        for (let x = a; x <= b; x++) setTile(grid, x, 10, 1);
    }

    // Vertical walls / blockers to force route changes
    // blockStack(grid, 23,  9, 2, 4);
    blockStack(grid, 29, 12, 2, 2);
    blockStack(grid, 40, 10, 2, 3);
    blockStack(grid, 43, 12, 2, 2);
    blockStack(grid, 54,  9, 2, 4);
    blockStack(grid, 60, 12, 2, 2);
    blockStack(grid, 71, 10, 2, 3);

    // Small staircase climbs to create up/down movement
    blockStack(grid, 16, 12, 2, 1);
    blockStack(grid, 18, 11, 2, 2);
    blockStack(grid, 20, 10, 2, 3);

    blockStack(grid, 34, 12, 2, 1);
    blockStack(grid, 36, 11, 2, 2);
    blockStack(grid, 38, 10, 2, 3);

    blockStack(grid, 64, 12, 2, 1);
    blockStack(grid, 66, 11, 2, 2);
    blockStack(grid, 68, 10, 2, 3);

    // Harder final staircase feel like your sample
    blockStack(grid, 72, 12, 2, 1);
    blockStack(grid, 74, 11, 2, 2);
    blockStack(grid, 76, 10, 2, 3);

    platform(grid, 46, 11, 2);

    // Coins placed in routes, not just straight lines
    addCoins(coins, 4, 10, 4);
    addCoins(coins, 16, 22, 4);
    addCoins(coins, 32, 38, 4);
    addCoins(coins, 46, 52, 4);
    addCoins(coins, 63, 71, 4);

    addCoins(coins, 2,  8, 7);
    addCoins(coins, 15, 20, 7);
    addCoins(coins, 29, 36, 7);
    addCoins(coins, 45, 50, 7);
    addCoins(coins, 59, 70, 7);

    addCoins(coins, 4, 8, 10);
    addCoins(coins, 50, 56, 10);
    addCoins(coins, 64, 72, 10);

    // Reward coins on harder jump spots
    addCoin(coins, 70, 5);

    addCoin(coins, 18, 8);
    addCoin(coins, 63, 9);

    // Enemies — tighter patrol ranges for difficulty
    addEnemy(enemies,  8,  5,  4, 10, 1);
    addEnemy(enemies, 19,  5, 16, 24, 0);
    addEnemy(enemies, 35,  5, 32, 39, 1);
    addEnemy(enemies, 49,  5, 46, 53, 0);
    addEnemy(enemies, 67,  5, 63, 71, 1);

    addEnemy(enemies,  7, 11,  4, 12, 0);
    addEnemy(enemies, 22, 11, 20, 27, 1);
    // addEnemy(enemies, 38, 11, 35, 42, 0);
    addEnemy(enemies, 52, 11, 50, 56, 1);
    addEnemy(enemies, 69, 11, 64, 72, 0);

    // Knives — ground and platform hazard points
    addKnife(knives, 30, 12);
    addKnife(knives, 73, 10);

    // Corridor end rewards / progression keys
    addKey(keys, 24, 4);
    addKey(keys, 53, 7);
    addKey(keys, 75, 10);

    // Vertical shafts connecting layers
    const shaftCols = [10, 27, 42, 58, 74];
    for (const sc of shaftCols) {
        setTile(grid, sc,   7,  0);
        setTile(grid, sc+1, 7,  0);
        setTile(grid, sc,   10, 0);
        setTile(grid, sc+1, 10, 0);

        // addLadder(ladders, sc, 12, 4);
    }

    // Extra shorter ladders for alternate routes
    addLadder(ladders, 18, 10, 7);
    addLadder(ladders, 36, 10, 7);
    addLadder(ladders, 66, 9, 7);

    addLadder(ladders, 21, 6, 4);
    addLadder(ladders, 47, 6, 4);
    addLadder(ladders, 70, 6, 4);

    // ══════════════════════════════════════════════════════
    // SECTION 2 — Moving platform maze (cols 80–160)
    // ══════════════════════════════════════════════════════
    carveGap(grid, 80, 20, groundRow);

    // clean fixed platform area (must stay empty above it)
    platform(grid, 82, 11, 4);
    addCoins(coins, 82, 85, 11);

    // Moving platforms — only ONE platform per lane
    // Avoid cols 82..85 because that area is reserved for the fixed platform above
    const movingCols = [80, 86, 88, 90, 92, 94, 96, 98];

    for (let i = 0; i < movingCols.length; i++) {
        const col = movingCols[i];
        const fi = [[9, 10, 11], [10, 11, 9], [11, 9, 10]][i % 3];

        // alternate visible rows only, one platform per column
        const startRow = (i % 2 === 0) ? 5 : 8;
        const minRow   = 4;
        const maxRow   = 10;
        const speed    = 1.0 + i * 0.08;

        mp(movingPlatforms, col, startRow, speed, minRow, maxRow, fi);
    }

    platform(grid, 100, 5,  4); addCoins(coins, 100, 103, 5); addKey(keys, 103, 5);
    platform(grid, 118, 11, 4); addCoins(coins, 118, 121, 11);
    platform(grid, 136, 5,  4); addCoins(coins, 136, 139, 5); addKey(keys, 139, 5);
    platform(grid, 154, 8,  4); addCoins(coins, 154, 157, 8); addKey(keys, 157, 8);
    platform(grid, 225, 7,  4); addCoins(coins, 225, 157, 7); addKey(keys, 225, 7);

    // Ladders — bottom touches ground or platform
    addLadder(ladders, 101, 12, 5);
    addLadder(ladders, 137, 12, 5);
    addLadder(ladders, 155, 12, 8);

    addKnife(knives, 103, 13); addKnife(knives, 112, 13);
    addKnife(knives, 130, 13); addKnife(knives, 148, 13);

    // ══════════════════════════════════════════════════════
    // SECTION 3 — "The Citadel" — five-floor fortress (cols 162–250)
    // ══════════════════════════════════════════════════════
    // Outer walls with gaps so player can pass through
    // Left wall: gap at rows 11-12 (entry) and rows 7-8 (mid exit)
    for (let y = 0; y <= 12; y++) {
        if (y !== 12 && y !== 11 && y !== 10 && y !== 9 && y !== 8 && y !== 7)
            setTile(grid, 162, y, 2);
    }
    // Right wall: gap at rows 11-12 and rows 5-6
    for (let y = 0; y <= 12; y++) {
        if (y !== 11 && y !== 12 && y !== 5 && y !== 6)
            setTile(grid, 230, y, 2);
    }

    platform(grid, 163, 4, 69); addCoin(coins, 168, 4, 190); addKey(keys, 194, 4); addLadder(ladders, 210, 10, 4);

    // Floor 1 (Y=11)
    platform(grid, 163, 10, 30); platform(grid, 200, 11, 30);
    addCoins(coins, 163, 192, 10); addCoins(coins, 200, 229, 11);
    addEnemy(enemies, 170, 10, 163, 192, 0); addEnemy(enemies, 185, 11, 163, 192, 1);
    addKnife(knives, 175, 13); addKnife(knives, 190, 13); addKnife(knives, 210, 11); addKnife(knives, 225, 13);

    // Open shaft in middle of floor 1 (for moving platforms to pass through)
    for (let y = 11; y <= 12; y++) {
        for (let x = 193; x <= 199; x++) setTile(grid, x, y, 0);
    }

    // Ladders connecting floors — unique columns, spread out
    addLadder(ladders, 165, 9, 4);
    addLadder(ladders, 225, 10, 7);

    // ══════════════════════════════════════════════════════
    // SECTION 4 — Chaos bridge (cols 232–290)
    // ══════════════════════════════════════════════════════
    carveGap(grid, 232, 18, groundRow);

    // Moving platforms over the void — only in clean empty lanes
    // keep them away from fixed platform area starting at col 252
    const movingBlock = [233, 236, 239, 242, 245, 248];

    for (let i = 0; i < movingBlock.length; i++) {
        const col  = movingBlock[i];
        const row  = (i % 2 === 0) ? 6 : 8;
        const spd  = 1.8 + i * 0.12;
        const minR = 5;
        const maxR = 10;
        const fi   = [[9, 10, 11], [10, 11, 9], [11, 9, 10]][i % 3];

        mp(movingPlatforms, col, row, spd, minR, maxR, fi);

        // only one reachable coin per moving platform lane
        addCoin(coins, col, row - 1);
    }

    // fixed landing platform after moving section
    platform(grid, 252, 11, 5);
    addCoins(coins, 252, 256, 11);
    addKey(keys, 256, 11);
    addEnemy(enemies, 254, 11, 252, 256, 0);
    addLadder(ladders, 253, 12, 11);

    // upper platform section
    platform(grid, 264, 5, 5);
    addCoins(coins, 264, 268, 5);
    addKey(keys, 268, 5);
    addLadder(ladders, 265, 12, 5);

    // ground knives only (clean placement on ground row)
    addKnife(knives, 259, groundRow);
    addKnife(knives, 271, groundRow);
    addKnife(knives, 285, groundRow);

    // ══════════════════════════════════════════════════════
    // SECTION 5 — Descending spiral exterior (cols 290–370)
    // ══════════════════════════════════════════════════════

    // Top long visible platform
    platform(grid, 293, 4, 36);
    addCoins(coins, 294, 328, 4);
    addKey(keys, 310, 4);
    addKey(keys, 328, 4);
    addEnemy(enemies, 299, 4, 294, 328, 1);
    addEnemy(enemies, 312, 4, 294, 328, 0);
    addEnemy(enemies, 322, 4, 294, 328, 1);

    // ladders from ground to top visible route
    addLadder(ladders, 295, 12, 4);
    addLadder(ladders, 326, 12, 4);

    // knives on the same top platform
    addKnife(knives, 305, 4);
    addKnife(knives, 317, 4);

    // Descending floors — clean and aligned
    platform(grid, 331, 5, 8);
    addCoins(coins, 332, 338, 5);
    addEnemy(enemies, 333, 5, 333, 337, 0);

    platform(grid, 328, 7, 8);
    addCoins(coins, 329, 335, 7);
    addEnemy(enemies, 329, 7, 333, 334, 1);

    platform(grid, 334, 9, 8);
    addCoins(coins, 334, 339, 9);
    addEnemy(enemies, 335, 9, 333, 339, 0);

    platform(grid, 336, 11, 8);
    addCoins(coins, 337, 339, 11);
    addKey(keys, 338, 11);

    carveGap(grid, 343, 12, groundRow);

    // ══════════════════════════════════════════════════════
    // SECTION 6 — The Final Ascent (cols 344–440)
    // ══════════════════════════════════════════════════════
    // Moving platforms — min row 4 (visible), max row 11
    mp(movingPlatforms, 344, 11, 2.0, 7, 12, [9, 10, 11]);
    mp(movingPlatforms, 346, 8,  2.5, 5, 10, [10, 11, 9]);
    mp(movingPlatforms, 349, 6,  3.0, 4, 8,  [11, 9, 10]);
    mp(movingPlatforms, 352, 9,  2.2, 6, 11, [9, 11, 10]);

    platform(grid, 368, 10, 6); addCoins(coins, 368, 373, 10); addLadder(ladders, 369, 12, 10);
    platform(grid, 376, 7,  6); addCoins(coins, 376, 381, 7);  addEnemy(enemies, 379, 7, 376, 381, 0);
    platform(grid, 384, 5,  6); addCoins(coins, 384, 389, 5);  addEnemy(enemies, 387, 5, 384, 389, 1);
    platform(grid, 392, 4,  6); addCoins(coins, 392, 397, 4);  addKey(keys, 397, 4);

    addLadder(ladders, 377, 12, 7);

    mp(movingPlatforms, 374, 9, 2.5, 5, 11, [11, 9, 10]);
    mp(movingPlatforms, 382, 6, 2.8, 4, 8,  [9, 10, 11]);
    mp(movingPlatforms, 390, 5, 3.0, 4, 6,  [10, 11, 9]);

    // Long overhead highway — moved from y=0 to y=4
    platform(grid, 400, 4, 40);
    addCoins(coins, 401, 439, 4);
    addKey(keys, 420, 4); addKey(keys, 439, 4);
    addEnemy(enemies, 407, 4, 401, 439, 1); addEnemy(enemies, 418, 4, 401, 439, 0);
    addEnemy(enemies, 428, 4, 401, 439, 1); addEnemy(enemies, 436, 4, 401, 439, 0);
    addKnife(knives, 410, 4); addKnife(knives, 424, 4); addKnife(knives, 434, 4);
    addLadder(ladders, 402, 10, 4);
    addLadder(ladders, 435, 10, 4);

    // Bottom section
    carveGap(grid, 400, 40, groundRow);
    platform(grid, 400, 11, 43);
    addCoins(coins, 401, 439, 11);
    addEnemy(enemies, 410, 11, 401, 439, 1); addEnemy(enemies, 424, 11, 401, 439, 0);
    addEnemy(enemies, 435, 11, 401, 439, 1);
    addKey(keys, 439, 11);
    addKnife(knives, 408, 11); addKnife(knives, 420, 11); addKnife(knives, 432, 11);

    // ══════════════════════════════════════════════════════
    // SECTION 7 — Final Boss Approach (cols 443–580)
    // ══════════════════════════════════════════════════════
    addKnife(knives, 442, groundRow);
    addKnife(knives, 442.5, groundRow);
    addKnife(knives, 443, groundRow);

    carveGap(grid, 446, 15, groundRow);

    // Extreme moving platform gauntlet — clamp to visible range (4..11)
    mp(movingPlatforms, 446, 9,  3.5, 5, 11, [11, 9, 10]);
    mp(movingPlatforms, 448, 5,  3.5, 4, 9,  [9, 10, 11]);
    mp(movingPlatforms, 451, 9,  3.5, 5, 11, [10, 11, 9]);
    mp(movingPlatforms, 454, 5,  3.5, 4, 9,  [11, 9, 10]);
    mp(movingPlatforms, 457, 9,  3.5, 5, 11, [9, 11, 10]);

    platform(grid, 462, 8, 6); addCoins(coins, 462, 467, 8);
    addEnemy(enemies, 465, 8, 462, 467, 1);
    addLadder(ladders, 463, 12, 8);

    // Ascending spire — platforms all visible (y=4..11)
    platform(grid, 470, 11, 3); addCoin(coins, 471, 11);
    platform(grid, 475, 9,  3); addCoin(coins, 476, 9);
    platform(grid, 480, 7,  3); addCoin(coins, 481, 7);
    platform(grid, 485, 6,  3); addCoin(coins, 486, 6); addKey(keys, 487, 6);
    platform(grid, 490, 5,  3); addCoin(coins, 491, 5);
    platform(grid, 495, 4,  3); addCoin(coins, 496, 4); addKey(keys, 497, 4);

    mp(movingPlatforms, 473, 10, 3.0, 7, 11, [11, 9, 10]);
    mp(movingPlatforms, 478, 8,  3.0, 5, 10, [9, 10, 11]);
    mp(movingPlatforms, 483, 7,  3.0, 5, 9,  [10, 11, 9]);
    mp(movingPlatforms, 488, 5,  3.0, 4, 7,  [11, 9, 10]);
    mp(movingPlatforms, 493, 4,  3.0, 4, 6,  [9, 11, 10]);

    // Final top platform — THE BOSS ROOM — at y=4
    platform(grid, 500, 4, 48);
    addCoins(coins, 501, 547, 4);
    addKey(keys, 520, 4); addKey(keys, 530, 4); addKey(keys, 540, 4); addKey(keys, 547, 4);
    addEnemy(enemies, 507, 4, 501, 547, 1);
    addEnemy(enemies, 530, 4, 516, 547, 0);
    addEnemy(enemies, 543, 4, 535, 547, 1);
    addKnife(knives, 510, 4); addKnife(knives, 522, 4);
    addKnife(knives, 533, 4); addKnife(knives, 544, 4);
    // Ladders from ground to boss room
    addLadder(ladders, 502, 12, 4);
    addLadder(ladders, 540, 12, 4);

    // Descend from boss room
    carveGap(grid, 551, 10, groundRow);

    mp(movingPlatforms, 552, 9, 1.5, 4, 13, [11, 9, 10]);
    mp(movingPlatforms, 555, 8, 2.0, 4, 12, [9, 11, 10]);

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

    mp(movingPlatforms, 595, 8,  3.0, 4, 11, [11, 9, 10]);
    mp(movingPlatforms, 597, 9,  3.0, 4, 12, [9, 11, 10]);
    mp(movingPlatforms, 599, 10, 3.0, 4, 13, [9, 11, 10]);

    blockStack(grid, 602, 12, 2, 1);
    blockStack(grid, 604, 11, 2, 2);
    blockStack(grid, 606, 10, 2, 3);
    blockStack(grid, 608, 9,  2, 4);

    platform(grid, 612, 8, 10);
    addCoins(coins, 612, 621, 8);

    const door = {
        x: 622 * TILE, y: 11.5 * TILE,
        width: 52, height: 120,
        col: 622, row: 8
    };

    const compressed = compressLevel(
        grid, coins, keys, knives, enemies, ladders, movingPlatforms, door
    );

    return {
        id: 12,
        name: 'Level 12',
        timerMs: 600000,
        progressUnits: 560,
        grid: compressed.grid,
        coins: compressed.coins,
        keys: compressed.keys,
        knives: compressed.knives,
        enemies: compressed.enemies,
        ladders: compressed.ladders,
        door: compressed.door,
        movingPlatforms: compressed.movingPlatforms,
        rows,
        cols: compressed.cols,
        groundRow,
        totalCoinsRequiredToOpenDoor: compressed.coins.length
    };
}
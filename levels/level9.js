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
    coins.push({ x: col * TILE + TILE * 0.5 - 16, y: row * TILE - offsetY });
}

function addCoins(coins, startCol, endCol, row, offsetY = 16) {
    for (let col = startCol; col <= endCol; col++) addCoin(coins, col, row, offsetY);
}

function addKey(keys, col, row, offsetY = 22) {
    keys.push({ x: col * TILE + TILE * 0.5 - 16, y: row * TILE - offsetY });
}

function addKnife(knives, col, row) {
    knives.push({ x: col * TILE - 10, y: row * TILE - 22 });
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

function addEnemy(enemies, col, row, leftCol, rightCol, type = 0) {
    enemies.push({
        x: col * TILE,
        y: row * TILE - 50,
        patrolLeft: leftCol * TILE,
        patrolRight: rightCol * TILE,
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

export function createLevel9Map() {
    const rows = 17;
    const cols = 320;
    const groundRow = 13;

    const grid = makeGrid(rows, cols);
    const coins = [];
    const keys = [];
    const knives = [];
    const enemies = [];
    const ladders = [];
    const movingPlatforms = [];

    const CEMENT = 6;

    // ground
    for (let x = 0; x < cols; x++) {
        setTile(grid, x, groundRow, 2);
        setTile(grid, x, groundRow + 1, 2);
        setTile(grid, x, groundRow + 2, 2);
    }

    // side walls
    for (let y = 0; y <= groundRow; y++) {
        setTile(grid, 0, y, 2);
        setTile(grid, cols - 1, y, 2);
    }

    // SECTION 1: intro + first elevator gap
    blockStack(grid, 3, 12, 2, 2);
    platform(grid, 7, 10, 6);
    addCoins(coins, 7, 12, 10);
    addLadder(ladders, 9, 12, 10);

    platform(grid, 15, 8, 5);
    addCoins(coins, 15, 19, 8);

    carveGap(grid, 22, 6, groundRow);
    movingPlatforms.push({
        x: 23 * TILE,
        y: 10 * TILE,
        width: 3 * TILE,
        height: TILE,
        axis: 'y',
        speed: 1.4,
        min: 8 * TILE,
        max: 11 * TILE,
        frameIndices: [9, 10, 11]
    });
    addCoins(coins, 23, 25, 9);

    platform(grid, 30, 9, 5);
    addCoins(coins, 30, 34, 9);
    addLadder(ladders, 31, 12, 9);

    platform(grid, 37, 6, 6);
    addCoins(coins, 37, 42, 6);
    addKey(keys, 42, 6);
    addEnemy(enemies, 39, 6, 37, 42, 0);
    addLadder(ladders, 39, 12, 6);

    addKnife(knives, 45, groundRow);
    addKnife(knives, 46, groundRow);

    // SECTION 2: zig-zag tower
    carveGap(grid, 49, 8, groundRow);
    platform(grid, 50, 11, 4);
    platform(grid, 55, 9, 4);
    platform(grid, 50, 7, 4);
    platform(grid, 55, 5, 5);

    addCoins(coins, 50, 53, 11);
    addCoins(coins, 55, 58, 9);
    addCoins(coins, 50, 53, 7);
    addCoins(coins, 55, 59, 5);
    addKey(keys, 59, 5);

    addLadder(ladders, 52, 10, 7);
    addLadder(ladders, 57, 8, 5);

    addEnemy(enemies, 56, 5, 55, 59, 1);

    platform(grid, 63, 6, 8);
    addCoins(coins, 63, 70, 6);
    addEnemy(enemies, 67, 6, 63, 70, 0);
    addLadder(ladders, 64, 12, 6);

    // SECTION 3: double moving-platform corridor
    carveGap(grid, 73, 10, groundRow);
    movingPlatforms.push({
        x: 74 * TILE, y: 10 * TILE, width: 2 * TILE, height: TILE,
        axis: 'y', speed: 1.6, min: 8 * TILE, max: 11 * TILE, tileType: CEMENT
    });
    movingPlatforms.push({
        x: 78 * TILE, y: 8 * TILE, width: 2 * TILE, height: TILE,
        axis: 'y', speed: 1.6, min: 6 * TILE, max: 10 * TILE, tileType: CEMENT
    });

    platform(grid, 83, 8, 5);
    addCoins(coins, 83, 87, 8);
    addLadder(ladders, 84, 12, 8);

    platform(grid, 90, 5, 8);
    addCoins(coins, 90, 97, 5);
    addKey(keys, 97, 5);
    addEnemy(enemies, 94, 5, 90, 97, 1);
    addLadder(ladders, 92, 12, 5);

    // SECTION 4: fortress blocks + split routes
    platform(grid, 102, 11, 8);
    addCoins(coins, 102, 109, 11);
    addEnemy(enemies, 106, 11, 102, 109, 0);

    blockStack(grid, 112, 9, 2, 5);
    blockStack(grid, 124, 9, 2, 5);

    platform(grid, 114, 9, 10);
    addCoins(coins, 114, 123, 9);
    addLadder(ladders, 117, 12, 9);

    platform(grid, 114, 6, 10);
    addCoins(coins, 114, 123, 6);
    addKey(keys, 123, 6);
    addEnemy(enemies, 118, 6, 114, 123, 1);
    addLadder(ladders, 121, 8, 6);

    addKnife(knives, 127, groundRow);
    addKnife(knives, 128, groundRow);
    addKnife(knives, 129, groundRow);

    // SECTION 5: precision vertical movers
    carveGap(grid, 132, 12, groundRow);

    platform(grid, 132, 11, 2);
    platform(grid, 141, 8, 3);
    addCoins(coins, 132, 133, 11);
    addCoins(coins, 141, 143, 8);

    movingPlatforms.push({
        x: 135 * TILE, y: 10 * TILE, width: 2 * TILE, height: TILE,
        axis: 'y', speed: 2.0, min: 8 * TILE, max: 11 * TILE, tileType: CEMENT
    });
    movingPlatforms.push({
        x: 138 * TILE, y: 8 * TILE, width: 2 * TILE, height: TILE,
        axis: 'y', speed: 2.0, min: 6 * TILE, max: 10 * TILE, tileType: CEMENT
    });

    platform(grid, 147, 6, 7);
    addCoins(coins, 147, 153, 6);
    addEnemy(enemies, 150, 6, 147, 153, 0);
    addLadder(ladders, 149, 12, 6);

    // SECTION 6: long dual route
    platform(grid, 158, 10, 18);
    addCoins(coins, 159, 175, 10);
    addEnemy(enemies, 164, 10, 159, 175, 0);
    addEnemy(enemies, 172, 10, 159, 175, 1);

    platform(grid, 160, 5, 16);
    addCoins(coins, 160, 175, 5);
    addKey(keys, 175, 5);
    addEnemy(enemies, 167, 5, 160, 175, 1);

    addLadder(ladders, 162, 9, 5);
    addLadder(ladders, 170, 9, 5);

    blockStack(grid, 166, 6, 2, 4);
    blockStack(grid, 174, 6, 2, 4);

    addKnife(knives, 177, groundRow);
    addKnife(knives, 178, groundRow);

    // SECTION 7: cavern with anchored ladders
    carveGap(grid, 181, 16, groundRow);

    platform(grid, 182, 11, 5);
    platform(grid, 189, 8, 5);
    platform(grid, 196, 6, 5);

    addCoins(coins, 182, 186, 11);
    addCoins(coins, 189, 193, 8);
    addCoins(coins, 196, 200, 6);

    movingPlatforms.push({
        x: 187 * TILE, y: 10 * TILE, width: 2 * TILE, height: TILE,
        axis: 'y', speed: 1.8, min: 8 * TILE, max: 11 * TILE, tileType: CEMENT
    });
    movingPlatforms.push({
        x: 194 * TILE, y: 8 * TILE, width: 2 * TILE, height: TILE,
        axis: 'y', speed: 1.8, min: 6 * TILE, max: 10 * TILE, tileType: CEMENT
    });



    addEnemy(enemies, 198, 6, 196, 200, 1);
    addKey(keys, 200, 6);

    // SECTION 8: final ascent
    platform(grid, 206, 10, 6);
    platform(grid, 214, 8, 6);
    platform(grid, 222, 6, 6);

    addCoins(coins, 206, 211, 10);
    addCoins(coins, 214, 219, 8);
    addCoins(coins, 222, 227, 6);

    addLadder(ladders, 208, 12, 10);
    addLadder(ladders, 216, 12, 8);
    addLadder(ladders, 224, 12, 6);

    addEnemy(enemies, 225, 6, 222, 227, 0);

    // SECTION 9: moving bridge finale
    carveGap(grid, 231, 12, groundRow);

    movingPlatforms.push({
        x: 232 * TILE, y: 10 * TILE, width: 2 * TILE, height: TILE,
        axis: 'y', speed: 2.1, min: 8 * TILE, max: 11 * TILE, tileType: CEMENT
    });
    movingPlatforms.push({
        x: 236 * TILE, y: 8 * TILE, width: 2 * TILE, height: TILE,
        axis: 'y', speed: 2.1, min: 6 * TILE, max: 10 * TILE, tileType: CEMENT
    });
    movingPlatforms.push({
        x: 240 * TILE, y: 6 * TILE, width: 2 * TILE, height: TILE,
        axis: 'y', speed: 2.1, min: 5 * TILE, max: 9 * TILE, tileType: CEMENT
    });

    platform(grid, 245, 7, 7);
    addCoins(coins, 245, 251, 7);
    addKey(keys, 251, 7);
    addLadder(ladders, 247, 12, 7);

    addKnife(knives, 254, groundRow);
    addKnife(knives, 255, groundRow);
    addKnife(knives, 256, groundRow);

    // SECTION 10: end game hall
    platform(grid, 260, 10, 14);
    addCoins(coins, 261, 273, 10);
    addEnemy(enemies, 266, 10, 261, 273, 0);

    platform(grid, 276, 7, 12);
    addCoins(coins, 276, 287, 7);
    addEnemy(enemies, 281, 7, 276, 287, 1);
    addLadder(ladders, 279, 12, 7);

    blockStack(grid, 290, 12, 2, 2);
    blockStack(grid, 292, 11, 2, 3);
    blockStack(grid, 294, 10, 2, 4);

    platform(grid, 298, 8, 8);
    addCoins(coins, 298, 305, 8);
    addLadder(ladders, 300, 12, 8);

    const door = {
        x: 308 * TILE,
        y: 11.4 * TILE,
        width: 52,
        height: 120,
        col: 308,
        row: 7
    };

    return {
        id: 9,
        name: 'Level 9',
        timerMs: 420000,
        progressUnits: 420,
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
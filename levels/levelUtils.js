// levelUtils.js

export const TILE = 40;

export function makeGrid(rows, cols) {
    return Array.from({ length: rows }, () => new Uint8Array(cols));
}

export function setTile(grid, x, y, value) {
    if (y < 0 || y >= grid.length || x < 0 || x >= grid[0].length) return;
    grid[y][x] = value;
}

export function fillRect(grid, x, y, w, h, value) {
    for (let row = y; row < y + h; row++) {
        for (let col = x; col < x + w; col++) {
            setTile(grid, col, row, value);
        }
    }
}

export function platform(grid, x, y, length, type = 1) {
    for (let i = 0; i < length; i++) {
        setTile(grid, x + i, y, type);
    }
}

export function blockStack(grid, x, y, w, h, value = 2) {
    fillRect(grid, x, y, w, h, value);
}

export function addCoin(coins, col, row, offsetY = 16) {
    coins.push({
        x: col * TILE + TILE * 0.5 - 16,
        y: row * TILE - offsetY
    });
}

export function addCoins(coins, startCol, endCol, row, offsetY = 16, skipCols = []) {
    for (let col = startCol; col <= endCol; col++) {
        if (!skipCols.includes(col)) {
            addCoin(coins, col, row, offsetY);
        }
    }
}

export function addKey(keys, col, row, offsetY = 22) {
    keys.push({
        x: col * TILE + TILE * 0.5 - 16,
        y: row * TILE - offsetY
    });
}

export function addKnife(knives, col, row) {
    knives.push({
        x: col * TILE - 10,
        y: row * TILE - 22
    });
}

export function addLadder(ladders, col, bottomRow, topRow, width = 34, yOffset = -2, extraHeight = 4) {
    ladders.push({
        x: col * TILE + (TILE - width) / 2,
        y: topRow * TILE + yOffset,
        width,
        height: (bottomRow - topRow + 1) * TILE + extraHeight
    });
}

export function addEnemy(enemies, col, row, leftCol, rightCol, type = 0, yOffset = 50) {
    enemies.push({
        x: col * TILE,
        y: row * TILE - yOffset,
        patrolLeft: leftCol * TILE,
        patrolRight: rightCol * TILE,
        type
    });
}

export function carveGap(grid, startCol, width, groundRow) {
    for (let x = startCol; x < startCol + width; x++) {
        for (let y = groundRow; y < grid.length; y++) {
            setTile(grid, x, y, 0);
        }
    }
}

export function fillGroundAndWalls(grid, cols, groundRow, groundValue = 2, wallValue = 2) {
    for (let x = 0; x < cols; x++) {
        setTile(grid, x, groundRow, groundValue);
        setTile(grid, x, groundRow + 1, groundValue);
        setTile(grid, x, groundRow + 2, groundValue);

        if (x === 0 || x === cols - 1) {
            for (let y = 0; y <= groundRow; y++) {
                setTile(grid, x, y, wallValue);
            }
        }
    }
}

export function createLevelCollections(withMovingPlatforms = false) {
    return {
        coins: [],
        keys: [],
        knives: [],
        enemies: [],
        ladders: [],
        ...(withMovingPlatforms ? { movingPlatforms: [] } : {})
    };
}

export function addVerticalMovingPlatformPair(
    movingPlatforms,
    col,
    row,
    speed,
    minRow,
    maxRow,
    frameIndices = [9, 10, 11]
) {
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
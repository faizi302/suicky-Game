const TILE = 40;

export const EMPTY = 0;
export const SHELF = 1;
export const BOOK = 2;
export const METAL = 3;

const FRAME_SHELF = 13;
const FRAME_BOOK_TOP = 7;
const FRAME_BOOK_FILL = 4;
const FRAME_METAL = 10;

let blockFramesCache = null;

function extractFrameRects(img, count = 15) {
    const frameWidth = Math.floor(img.naturalWidth / count);
    const frames = [];

    for (let i = 0; i < count; i++) {
        const sx = i * frameWidth;
        const sw = i === count - 1 ? img.naturalWidth - sx : frameWidth;
        frames.push({ x: sx, y: 0, w: sw, h: img.naturalHeight });
    }

    return frames;
}

function getBlockFrames() {
    if (blockFramesCache) return blockFramesCache;

    const img = document.getElementById('bocks') || document.getElementById('img_blocks');
    if (!img || !img.complete || img.naturalWidth <= 0) return null;

    blockFramesCache = extractFrameRects(img, 15);
    return blockFramesCache;
}

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

function platform(grid, x, y, length) {
    for (let i = 0; i < length; i++) setTile(grid, x + i, y, SHELF);
}

function blockStack(grid, x, y, w, h, value = BOOK) {
    fillRect(grid, x, y, w, h, value);
}

function stairUpRight(grid, startX, startY, steps) {
    for (let i = 0; i < steps; i++) {
        platform(grid, startX + i, startY - i, 1);
    }
}

function addCoin(coins, col, row, offsetY = 16) {
    coins.push({
        x: col * TILE + TILE * 0.5 - 16,
        y: row * TILE - offsetY
    });
}

function addCoins(coins, startCol, endCol, row, offsetY = 16, skipCols = []) {
    for (let col = startCol; col <= endCol; col++) {
        if (skipCols.includes(col)) continue;
        addCoin(coins, col, row, offsetY);
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
    ladders.push({
        x: col * TILE + 4,
        y: topRow * TILE,
        width: 32,
        height: (bottomRow - topRow + 1) * TILE
    });
}

function tileAt(map, x, y) {
    if (y < 0 || y >= map.length || x < 0 || x >= map[0].length) return EMPTY;
    return map[y][x];
}

function frameIndex(tile, x, y, map) {
    if (tile === SHELF) return FRAME_SHELF;
    if (tile === METAL) return FRAME_METAL;
    if (tile === BOOK) {
        const above = tileAt(map, x, y - 1);
        return (above === EMPTY || above === SHELF) ? FRAME_BOOK_TOP : FRAME_BOOK_FILL;
    }
    return FRAME_BOOK_FILL;
}

export function createMap() {
    const groundRow = 13;
    const rows = 17;
    const cols = 96;

    const grid = makeGrid(rows, cols);
    const coins = [];
    const keys = [];
    const knives = [];
    const enemies = [];
    const ladders = [];

    for (let x = 0; x < cols; x++) {
        setTile(grid, x, groundRow, BOOK);
        setTile(grid, x, groundRow + 1, BOOK);
        setTile(grid, x, groundRow + 2, BOOK);
    }

    for (let y = 0; y <= groundRow; y++) {
        setTile(grid, 0, y, BOOK);
        setTile(grid, cols - 1, y, BOOK);
    }

    blockStack(grid, 3, 12, 1, 2);
    stairUpRight(grid, 4, 12, 3);
    platform(grid, 7, 9, 7);
    addCoins(coins, 7, 13, 9);

    addKnife(knives, 16, groundRow);
    addKnife(knives, 18, groundRow);

    enemies.push({
        x: 20 * TILE,
        y: groundRow * TILE - 50,
        patrolLeft: 18 * TILE,
        patrolRight: 24 * TILE,
        type: 0
    });

    platform(grid, 26, 11, 8);
    addCoins(coins, 27, 32, 11);
    blockStack(grid, 26, 12, 1, 2);
    blockStack(grid, 33, 12, 1, 2);

    addLadder(ladders, 34, 12, 8);
    platform(grid, 33, 8, 6);
    addCoins(coins, 34, 38, 8);

    enemies.push({
        x: 36 * TILE,
        y: 8 * TILE - 50,
        patrolLeft: 33 * TILE,
        patrolRight: 39 * TILE,
        type: 1
    });

    platform(grid, 42, 10, 9);
    addCoins(coins, 43, 49, 10);

    blockStack(grid, 42, 11, 1, 3);
    blockStack(grid, 50, 11, 1, 3);

    addLadder(ladders, 53, 12, 6);
    platform(grid, 49, 6, 10);
    addCoins(coins, 50, 57, 6);

    addKey(keys, 55, 6);

    addKnife(knives, 59, groundRow);
    addKnife(knives, 61, groundRow);

    enemies.push({
        x: 58 * TILE,
        y: groundRow * TILE - 50,
        patrolLeft: 56 * TILE,
        patrolRight: 62 * TILE,
        type: 0
    });

    platform(grid, 64, 11, 8);
    addCoins(coins, 64, 71, 11);

    enemies.push({
        x: 67 * TILE,
        y: 11 * TILE - 50,
        patrolLeft: 64 * TILE,
        patrolRight: 72 * TILE,
        type: 1
    });

    addLadder(ladders, 73, 12, 8);
    platform(grid, 71, 8, 6);
    addCoins(coins, 72, 76, 8);

    blockStack(grid, 77, 9, 2, 5);

    addLadder(ladders, 81, 12, 7);
    platform(grid, 80, 7, 8);
    addCoins(coins, 81, 86, 7);

    enemies.push({
        x: 84 * TILE,
        y: 7 * TILE - 50,
        patrolLeft: 80 * TILE,
        patrolRight: 87 * TILE,
        type: 0
    });

    blockStack(grid, 88, 11, 1, 3);
    blockStack(grid, 91, 10, 1, 4);

    blockStack(grid, 89, 12, 1, 2);
    platform(grid, 90, 11, 2);

    const door = {
        x: 92 * TILE,
        y: 12.5 * TILE - 38,
        width: 46,
        height: 70,
        col: 92,
        row: 12
    };

    return {
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

export function drawMap(ctx, map, tileSize, camera, levelData = null, doorOpened = false) {
    const frames = getBlockFrames();
    const img = document.getElementById('bocks') || document.getElementById('img_blocks');

    const visibleCols = Math.ceil(camera.viewW / tileSize);
    const visibleRows = Math.ceil(camera.viewH / tileSize);

    const startCol = Math.max(0, Math.floor(camera.x / tileSize) - 1);
    const endCol = Math.min(map[0].length - 1, startCol + visibleCols + 3);
    const startRow = Math.max(0, Math.floor(camera.y / tileSize) - 1);
    const endRow = Math.min(map.length - 1, startRow + visibleRows + 3);

    for (let y = startRow; y <= endRow; y++) {
        for (let x = startCol; x <= endCol; x++) {
            const tile = map[y][x];
            if (tile === EMPTY) continue;

            const drawX = Math.floor(x * tileSize - camera.x);
            const drawY = Math.floor(y * tileSize - camera.y);

            if (frames && img && img.complete && img.naturalWidth > 0) {
                const frame = frames[frameIndex(tile, x, y, map)] || frames[0];

                if (tile === SHELF) {
                    ctx.drawImage(
                        img,
                        frame.x, frame.y, frame.w, frame.h,
                        drawX - 4, drawY + 1,
                        tileSize + 8, 33
                    );
                } else {
                    ctx.drawImage(
                        img,
                        frame.x, frame.y, frame.w, frame.h,
                        drawX - 3, drawY - 3,
                        tileSize + 6, tileSize + 6
                    );
                }
            } else {
                ctx.fillStyle = tile === SHELF ? '#8b5e3c' : tile === BOOK ? '#6f4524' : '#808890';
                ctx.fillRect(drawX, drawY, tileSize, tileSize);
            }
        }
    }

 if (levelData?.ladders?.length) {
    const ladderImg = document.getElementById('img_ladder');

    for (const ladder of levelData.ladders) {
        const drawX = Math.round(ladder.x - camera.x);
        const drawY = Math.round(ladder.y - camera.y);

        if (ladderImg && ladderImg.complete && ladderImg.naturalWidth > 0) {
            const srcW = ladderImg.naturalWidth;
            const srcH = ladderImg.naturalHeight;

            // source split
            const topH = Math.round(srcH * 0.22);
            const midH = Math.round(srcH * 0.18);
            const botH = Math.round(srcH * 0.22);

            // final ladder look controls
            const destW = 28;          // ladder thinness
            const topDrawH = 18;       // top cap height
            const botDrawH = 18;       // bottom cap height
            const rungDrawH = 11;      // one repeated rung block height
            const rungGap = 1;         // gap between rungs visually
            const sideOffsetX = 2;     // move left/right a little if needed

            const finalX = drawX + ((ladder.width - destW) * 0.5) + sideOffsetX;

            // draw top cap
            ctx.drawImage(
                ladderImg,
                0, 0, srcW, topH,
                finalX,
                drawY,
                destW,
                topDrawH
            );

            // middle repeated section
            const middleStartY = drawY + topDrawH - 2;
            const middleHeight = Math.max(0, ladder.height - topDrawH - botDrawH + 4);

            let y = middleStartY;
            let safe = 0;

            while (y < middleStartY + middleHeight && safe < 200) {
                safe++;

                const remain = middleStartY + middleHeight - y;
                const h = Math.min(rungDrawH, remain);

                ctx.drawImage(
                    ladderImg,
                    0, topH, srcW, midH,
                    finalX,
                    y,
                    destW,
                    h
                );

                y += Math.max(1, rungDrawH - rungGap);
            }

            // draw bottom cap
            ctx.drawImage(
                ladderImg,
                0, srcH - botH, srcW, botH,
                finalX,
                drawY + ladder.height - botDrawH,
                destW,
                botDrawH
            );
        } else {
            ctx.fillStyle = '#9a9a9a';
            ctx.fillRect(drawX, drawY, ladder.width, ladder.height);
        }
    }
}


    if (levelData?.door) {
        const door = levelData.door;
        const doorImg = document.getElementById('img_doors');
        const lockImg = document.getElementById('img_lock');

        const drawX = Math.floor(door.x - camera.x);
        const drawY = Math.floor(door.y - camera.y);

        if (doorImg && doorImg.complete && doorImg.naturalWidth > 0) {
            const frameCount = 12;
            const frameW = Math.floor(doorImg.naturalWidth / frameCount);
            const frameH = doorImg.naturalHeight;
            const currentFrame = doorOpened ? frameCount - 1 : 0;

            ctx.drawImage(
                doorImg,
                currentFrame * frameW, 0, frameW, frameH,
                drawX, drawY, 52, 78
            );
        } else {
            ctx.fillStyle = '#a56a2d';
            ctx.fillRect(drawX, drawY, door.width, door.height);
        }

        if (!doorOpened && lockImg && lockImg.complete && lockImg.naturalWidth > 0) {
            const frameCount = 7;
            const frameW = Math.floor(lockImg.naturalWidth / frameCount);
            const frameH = lockImg.naturalHeight;

            ctx.drawImage(
                lockImg,
                0, 0, frameW, frameH,
                drawX + 12, drawY + 26,
                24, 24
            );
        }
    }
}

export function isSolid(map, col, row) {
    if (row < 0 || row >= map.length || col < 0 || col >= map[0].length) return false;
    return map[row][col] !== EMPTY;
}
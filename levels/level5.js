import {
    TILE,
    makeGrid,
    setTile,
    fillRect,
    platform,
    blockStack,
    addCoin,
    addCoins,
    addKey,
    addKnife,
    addLadder,
    carveGap,
    fillGroundAndWalls,
    createLevelCollections
} from './levelUtils.js';

export function createLevel5Map() {
    const rows = 17;
    const cols = 372;
    const groundRow = 13;

   const grid = makeGrid(rows, cols);
const { coins, keys, knives, enemies, ladders } = createLevelCollections();

fillGroundAndWalls(grid, cols, groundRow);
    blockStack(grid, 3, 12, 1, 2);
    platform(grid, 6, 10, 7);
    addLadder(ladders, 8, 12, 10);
    addCoins(coins, 6, 12, 10);

    carveGap(grid, 16, 5, groundRow);
    platform(grid, 16, 11, 2);
    platform(grid, 19, 9, 2);
    platform(grid, 22, 7, 2);
    platform(grid, 25, 5, 3);
    addCoins(coins, 16, 17, 11);
    addCoins(coins, 19, 20, 9);
    addCoins(coins, 22, 23, 7);
    addCoins(coins, 25, 27, 5);

    addLadder(ladders, 34, 12, 5);
    platform(grid, 32, 5, 12);
    addCoins(coins, 33, 43, 5);
    addKey(keys, 42, 5);

    enemies.push({
        x: 37 * TILE,
        y: 5 * TILE - 50,
        patrolLeft: 33 * TILE,
        patrolRight: 43 * TILE,
        type: 0
    });

    addKnife(knives, 46, groundRow);
    addKnife(knives, 47, groundRow);
    addKnife(knives, 48, groundRow);
    carveGap(grid, 51, 6, groundRow);

    platform(grid, 51, 10, 3);
    platform(grid, 56, 8, 4);
    addCoins(coins, 51, 53, 10);
    addCoins(coins, 56, 59, 8);

    blockStack(grid, 63, 12, 1, 2);
    blockStack(grid, 64, 11, 1, 3);
    blockStack(grid, 65, 10, 1, 4);
    platform(grid, 68, 8, 10);
    addCoins(coins, 69, 77, 8);
    addLadder(ladders, 69, 12, 8);

    enemies.push({
        x: 73 * TILE,
        y: 8 * TILE - 50,
        patrolLeft: 69 * TILE,
        patrolRight: 77 * TILE,
        type: 1
    });

    carveGap(grid, 81, 7, groundRow);
    platform(grid, 81, 11, 2);
    platform(grid, 84, 9, 2);
    platform(grid, 87, 7, 2);
    platform(grid, 90, 5, 2);
    platform(grid, 93, 4, 3);
    addCoins(coins, 81, 82, 11);
    addCoins(coins, 84, 85, 9);
    addCoins(coins, 87, 88, 7);
    addCoins(coins, 90, 91, 5);
    addCoins(coins, 93, 95, 4);

    addLadder(ladders, 101, 12, 6);
    platform(grid, 100, 6, 15);
    addCoins(coins, 101, 114, 6);
    addKey(keys, 113, 6);

    enemies.push({
        x: 107 * TILE,
        y: 4 * TILE - 50,
        patrolLeft: 101 * TILE,
        patrolRight: 114 * TILE,
        type: 0
    });

    addKnife(knives, 118, groundRow);
    addKnife(knives, 119, groundRow);
    addKnife(knives, 120, groundRow);
    carveGap(grid, 123, 5, groundRow);

    platform(grid, 123, 10, 2);
    platform(grid, 126, 8, 2);
    platform(grid, 129, 6, 3);
    addCoins(coins, 123, 124, 10);
    addCoins(coins, 126, 127, 8);
    addCoins(coins, 129, 131, 6);

    blockStack(grid, 135, 12, 1, 2);
    platform(grid, 137, 9, 8);
    addCoins(coins, 138, 144, 9);
    addLadder(ladders, 141, 12, 9);

    platform(grid, 148, 6, 12);
    addCoins(coins, 149, 159, 6);

    enemies.push({
        x: 154 * TILE,
        y: 6 * TILE - 50,
        patrolLeft: 149 * TILE,
        patrolRight: 159 * TILE,
        type: 1
    });

    carveGap(grid, 163, 8, groundRow);
    platform(grid, 163, 11, 2);
    platform(grid, 166, 9, 2);
    platform(grid, 169, 7, 2);
    platform(grid, 172, 5, 2);
    platform(grid, 175, 3, 3);
    addCoins(coins, 163, 164, 11);
    addCoins(coins, 166, 167, 9);
    addCoins(coins, 169, 170, 7);
    addCoins(coins, 172, 173, 5);
    addCoins(coins, 175, 177, 3);

    addLadder(ladders, 183, 12, 6);
    platform(grid, 182, 6, 15);
    addCoins(coins, 183, 196, 6);
    addKey(keys, 195, 6);

    enemies.push({
        x: 189 * TILE,
        y: 3 * TILE - 50,
        patrolLeft: 183 * TILE,
        patrolRight: 196 * TILE,
        type: 0
    });

    addKnife(knives, 200, groundRow);
    addKnife(knives, 201, groundRow);
    addKnife(knives, 202, groundRow);

    carveGap(grid, 205, 6, groundRow);
    platform(grid, 205, 10, 3);
    platform(grid, 210, 8, 3);
    addCoins(coins, 205, 207, 10);
    addCoins(coins, 210, 212, 8);

    blockStack(grid, 216, 12, 1, 2);
    blockStack(grid, 217, 11, 1, 3);
    blockStack(grid, 218, 10, 1, 4);
    blockStack(grid, 219, 9, 1, 5);
    platform(grid, 222, 7, 11);
    addCoins(coins, 223, 232, 7);
    addLadder(ladders, 227, 12, 7);

    enemies.push({
        x: 228 * TILE,
        y: 7 * TILE - 50,
        patrolLeft: 223 * TILE,
        patrolRight: 232 * TILE,
        type: 1
    });

    carveGap(grid, 236, 7, groundRow);
    platform(grid, 236, 11, 2);
    platform(grid, 239, 9, 2);
    platform(grid, 242, 7, 2);
    platform(grid, 245, 5, 2);
    addCoins(coins, 236, 237, 11);
    addCoins(coins, 239, 240, 9);
    addCoins(coins, 242, 243, 7);
    addCoins(coins, 245, 246, 5);

    addLadder(ladders, 253, 12, 5);
    platform(grid, 251, 5, 14);
    addCoins(coins, 252, 264, 5);
    addKey(keys, 263, 5);

    enemies.push({
        x: 257 * TILE,
        y: 5 * TILE - 50,
        patrolLeft: 252 * TILE,
        patrolRight: 264 * TILE,
        type: 0
    });

    addKnife(knives, 268, groundRow);
    addKnife(knives, 269, groundRow);
    carveGap(grid, 272, 5, groundRow);

    platform(grid, 272, 10, 3);
    platform(grid, 277, 8, 4);
    addCoins(coins, 272, 274, 10);
    addCoins(coins, 277, 280, 8);

    blockStack(grid, 284, 12, 1, 2);
    platform(grid, 286, 7, 10);
    addCoins(coins, 287, 295, 7);
    addLadder(ladders, 290, 12, 7);

    platform(grid, 300, 4, 14);
    addCoins(coins, 301, 313, 4);

    enemies.push({
        x: 307 * TILE,
        y: 4 * TILE - 50,
        patrolLeft: 301 * TILE,
        patrolRight: 313 * TILE,
        type: 1
    });

    carveGap(grid, 317, 7, groundRow);
    platform(grid, 317, 11, 2);
    platform(grid, 320, 9, 2);
    platform(grid, 323, 7, 2);
    platform(grid, 326, 5, 2);
    addCoins(coins, 317, 318, 11);
    addCoins(coins, 320, 321, 9);
    addCoins(coins, 323, 324, 7);
    addCoins(coins, 326, 327, 5);

    addLadder(ladders, 333, 12, 5);
    platform(grid, 332, 5, 12);
    addCoins(coins, 333, 343, 5);
    addKey(keys, 342, 5);

    enemies.push({
        x: 337 * TILE,
        y: 5 * TILE - 50,
        patrolLeft: 333 * TILE,
        patrolRight: 343 * TILE,
        type: 0
    });

    addKnife(knives, 347, groundRow);
    addKnife(knives, 348, groundRow);
    addKnife(knives, 349, groundRow);

    blockStack(grid, 354, 12, 2, 1);
    blockStack(grid, 356, 11, 2, 2);
    blockStack(grid, 358, 10, 2, 3);
    platform(grid, 362, 9, 6);
    addCoins(coins, 362, 367, 9);

    const door = {
        x: 365 * TILE,
        y: 11.5 * TILE,
        width: 52,
        height: 120,
        col: 370,
        row: 9
    };

    return {
        id: 5,
        name: 'Level 5',
        timerMs: 310000,
        progressUnits: 250,
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
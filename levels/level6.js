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

export function createLevel6Map() {
    const rows = 17;
    const cols = 408;
    const groundRow = 13;

   const grid = makeGrid(rows, cols);
const { coins, keys, knives, enemies, ladders } = createLevelCollections();

fillGroundAndWalls(grid, cols, groundRow);

    blockStack(grid, 3, 12, 1, 2);
    platform(grid, 6, 10, 6);
    addLadder(ladders, 8, 12, 10);
    addCoins(coins, 6, 11, 10);

    carveGap(grid, 14, 6, groundRow);
    platform(grid, 14, 11, 2);
    platform(grid, 17, 9, 2);
    platform(grid, 20, 7, 2);
    platform(grid, 23, 5, 2);
    platform(grid, 26, 4, 3);
    addCoins(coins, 14, 15, 11);
    addCoins(coins, 17, 18, 9);
    addCoins(coins, 20, 21, 7);
    addCoins(coins, 23, 24, 5);
    addCoins(coins, 26, 28, 4);

    addLadder(ladders, 35, 12, 4);
    platform(grid, 33, 4, 14);
    addCoins(coins, 34, 46, 4);
    addKey(keys, 45, 4);

    enemies.push({
        x: 39 * TILE,
        y: 4 * TILE - 50,
        patrolLeft: 34 * TILE,
        patrolRight: 46 * TILE,
        type: 1
    });

    addKnife(knives, 50, groundRow);
    addKnife(knives, 51, groundRow);
    addKnife(knives, 52, groundRow);
    carveGap(grid, 55, 7, groundRow);

    platform(grid, 55, 10, 3);
    platform(grid, 60, 8, 3);
    platform(grid, 64, 6, 4);
    addCoins(coins, 55, 57, 10);
    addCoins(coins, 60, 62, 8);
    addCoins(coins, 64, 67, 6);

    blockStack(grid, 71, 12, 1, 2);
    blockStack(grid, 72, 11, 1, 3);
    blockStack(grid, 73, 10, 1, 4);
    blockStack(grid, 74, 9, 1, 5);
    platform(grid, 77, 7, 11);
    addCoins(coins, 78, 87, 7);
    addLadder(ladders, 82, 12, 7);

    enemies.push({
        x: 83 * TILE,
        y: 7 * TILE - 50,
        patrolLeft: 78 * TILE,
        patrolRight: 87 * TILE,
        type: 0
    });

    carveGap(grid, 91, 8, groundRow);
    platform(grid, 91, 11, 2);
    platform(grid, 94, 9, 2);
    platform(grid, 97, 7, 2);
    platform(grid, 100, 5, 2);
    platform(grid, 103, 3, 3);
    addCoins(coins, 91, 92, 11);
    addCoins(coins, 94, 95, 9);
    addCoins(coins, 97, 98, 7);
    addCoins(coins, 100, 101, 5);
    addCoins(coins, 103, 105, 3);

    addLadder(ladders, 114, 12, 6);
    platform(grid, 110, 6, 16);
    addCoins(coins, 111, 125, 6);
    addKey(keys, 128, 8);

    enemies.push({
        x: 117 * TILE,
        y: 3 * TILE - 50,
        patrolLeft: 111 * TILE,
        patrolRight: 125 * TILE,
        type: 1
    });

    addKnife(knives, 129, groundRow);
    addKnife(knives, 130, groundRow);
    addKnife(knives, 131, groundRow);

    carveGap(grid, 134, 6, groundRow);
    platform(grid, 134, 10, 2);
    platform(grid, 137, 8, 2);
    platform(grid, 140, 6, 2);
    platform(grid, 143, 4, 3);
    addCoins(coins, 134, 135, 10);
    addCoins(coins, 137, 138, 8);
    addCoins(coins, 140, 141, 6);
    addCoins(coins, 143, 145, 4);

    blockStack(grid, 149, 12, 1, 2);
    platform(grid, 151, 9, 9);
    addCoins(coins, 152, 159, 9);
    addLadder(ladders, 155, 12, 9);

    platform(grid, 163, 6, 12);
    addCoins(coins, 164, 174, 6);

    enemies.push({
        x: 169 * TILE,
        y: 6 * TILE - 50,
        patrolLeft: 164 * TILE,
        patrolRight: 174 * TILE,
        type: 0
    });

    carveGap(grid, 178, 9, groundRow);
    platform(grid, 178, 11, 2);
    platform(grid, 181, 9, 2);
    platform(grid, 184, 7, 2);
    platform(grid, 187, 5, 2);
    platform(grid, 190, 3, 2);
    platform(grid, 193, 8, 8);
    addCoins(coins, 178, 179, 11);
    addCoins(coins, 181, 182, 9);
    addCoins(coins, 184, 185, 7);
    addCoins(coins, 187, 188, 5);
    addCoins(coins, 190, 191, 3);
    addCoins(coins, 193, 195, 8);

    addLadder(ladders, 203, 12, 7);
    platform(grid, 200, 7, 16);
    addCoins(coins, 201, 215, 7);
    addKey(keys, 220, 4);

    enemies.push({
        x: 208 * TILE,
        y: 2 * TILE - 50,
        patrolLeft: 201 * TILE,
        patrolRight: 215 * TILE,
        type: 1
    });

    addKnife(knives, 219, groundRow);
    addKnife(knives, 220, groundRow);
    addKnife(knives, 221, groundRow);

    carveGap(grid, 224, 7, groundRow);
    platform(grid, 224, 10, 3);
    platform(grid, 229, 8, 3);
    addCoins(coins, 224, 226, 10);
    addCoins(coins, 229, 231, 8);

    blockStack(grid, 235, 12, 1, 2);
    blockStack(grid, 236, 11, 1, 3);
    blockStack(grid, 237, 10, 1, 4);
    blockStack(grid, 238, 9, 1, 5);
    platform(grid, 241, 7, 11);
    addCoins(coins, 242, 251, 7);
    addLadder(ladders, 246, 12, 7);

    enemies.push({
        x: 247 * TILE,
        y: 7 * TILE - 50,
        patrolLeft: 242 * TILE,
        patrolRight: 251 * TILE,
        type: 0
    });

    carveGap(grid, 255, 8, groundRow);
    platform(grid, 255, 11, 2);
    platform(grid, 258, 9, 2);
    platform(grid, 261, 7, 2);
    platform(grid, 264, 5, 2);
    platform(grid, 267, 3, 3);
    addCoins(coins, 255, 256, 11);
    addCoins(coins, 258, 259, 9);
    addCoins(coins, 261, 262, 7);
    addCoins(coins, 264, 265, 5);
    addCoins(coins, 267, 269, 3);

    addLadder(ladders, 275, 12, 7);
    platform(grid, 274, 7, 15);
    addCoins(coins, 275, 288, 7);
    addKey(keys, 290, 5);

    enemies.push({
        x: 281 * TILE,
        y: 3 * TILE - 50,
        patrolLeft: 275 * TILE,
        patrolRight: 288 * TILE,
        type: 1
    });

    addKnife(knives, 292, groundRow);
    addKnife(knives, 293, groundRow);
    addKnife(knives, 294, groundRow);

    carveGap(grid, 297, 6, groundRow);
    platform(grid, 297, 10, 3);
    platform(grid, 302, 8, 4);
    addCoins(coins, 297, 299, 10);
    addCoins(coins, 302, 305, 8);

    blockStack(grid, 309, 12, 1, 2);
    platform(grid, 311, 7, 10);
    addCoins(coins, 312, 320, 7);
    addLadder(ladders, 315, 12, 7);

    platform(grid, 325, 4, 15);
    addCoins(coins, 326, 339, 4);

    enemies.push({
        x: 332 * TILE,
        y: 4 * TILE - 50,
        patrolLeft: 326 * TILE,
        patrolRight: 339 * TILE,
        type: 0
    });

    carveGap(grid, 343, 8, groundRow);
    platform(grid, 343, 11, 2);
    platform(grid, 346, 9, 2);
    platform(grid, 349, 7, 2);
    platform(grid, 352, 5, 2);
    addCoins(coins, 343, 344, 11);
    addCoins(coins, 346, 347, 9);
    addCoins(coins, 349, 350, 7);
    addCoins(coins, 352, 353, 5);

    addLadder(ladders, 360, 12, 5);
    platform(grid, 358, 5, 13);
    addCoins(coins, 359, 370, 5);
    addKey(keys, 369, 5);

    enemies.push({
        x: 364 * TILE,
        y: 5 * TILE - 50,
        patrolLeft: 359 * TILE,
        patrolRight: 370 * TILE,
        type: 1
    });

    addKnife(knives, 374, groundRow);
    addKnife(knives, 375, groundRow);
    carveGap(grid, 378, 5, groundRow);

    blockStack(grid, 386, 12, 2, 1);
    blockStack(grid, 388, 11, 2, 2);
    blockStack(grid, 390, 10, 2, 3);
    platform(grid, 394, 9, 7);
    addCoins(coins, 394, 400, 9);

    const door = {
        x: 404 * TILE,
        y: 11.5 * TILE,
        width: 52,
        height: 120,
        col: 406,
        row: 9
    };

    return {
        id: 6,
        name: 'Level 6',
        timerMs: 345000,
        progressUnits: 290,
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
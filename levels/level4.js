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


export function createLevel4Map() {
    const rows = 17;
    const cols = 338;
    const groundRow = 13;

  const grid = makeGrid(rows, cols);
const { coins, keys, knives, enemies, ladders } = createLevelCollections();

fillGroundAndWalls(grid, cols, groundRow);

    blockStack(grid, 3, 12, 1, 2);
    platform(grid, 6, 10, 6);
    addLadder(ladders, 8, 12, 10);
    addCoins(coins, 6, 11, 10);

    carveGap(grid, 14, 5, groundRow);
    platform(grid, 14, 11, 2);
    platform(grid, 17, 9, 2);
    platform(grid, 20, 7, 2);
    platform(grid, 23, 5, 3);
    addCoins(coins, 14, 15, 11);
    addCoins(coins, 17, 18, 9);
    addCoins(coins, 20, 21, 7);
    addCoins(coins, 23, 25, 5);
    addLadder(ladders, 30, 12, 5);

    platform(grid, 29, 5, 12);
    addCoins(coins, 30, 40, 5);
    addKey(keys, 39, 5);

    enemies.push({
        x: 34 * TILE,
        y: 5 * TILE - 50,
        patrolLeft: 30 * TILE,
        patrolRight: 40 * TILE,
        type: 0
    });

    addKnife(knives, 43, groundRow);
    addKnife(knives, 44, groundRow);
    addKnife(knives, 45, groundRow);
    carveGap(grid, 48, 6, groundRow);

    platform(grid, 48, 11, 2);
    platform(grid, 51, 9, 2);
    platform(grid, 54, 7, 2);
    addCoins(coins, 48, 49, 11);
    addCoins(coins, 51, 52, 9);
    addCoins(coins, 54, 55, 7);

    blockStack(grid, 58, 12, 1, 2);
    platform(grid, 60, 8, 8);
    addCoins(coins, 61, 67, 8);
    addLadder(ladders, 66, 12, 8);

    platform(grid, 71, 6, 10);
    addCoins(coins, 72, 80, 6);
    addKey(keys, 79, 6);

    enemies.push({
        x: 75 * TILE,
        y: 6 * TILE - 50,
        patrolLeft: 72 * TILE,
        patrolRight: 80 * TILE,
        type: 1
    });

    carveGap(grid, 84, 4, groundRow);
    platform(grid, 84, 10, 2);
    platform(grid, 88, 8, 3);
    addCoins(coins, 84, 85, 10);
    addCoins(coins, 88, 90, 8);

    addKnife(knives, 93, groundRow);
    addKnife(knives, 94, groundRow);

    blockStack(grid, 97, 11, 1, 3);
    blockStack(grid, 99, 10, 1, 4);
    blockStack(grid, 101, 9, 1, 5);
    platform(grid, 104, 7, 11);
    addCoins(coins, 105, 114, 7);
    addLadder(ladders, 110, 12, 7);

    enemies.push({
        x: 110 * TILE,
        y: 7 * TILE - 50,
        patrolLeft: 105 * TILE,
        patrolRight: 114 * TILE,
        type: 0
    });

    carveGap(grid, 118, 7, groundRow);
    platform(grid, 118, 11, 2);
    platform(grid, 121, 9, 2);
    platform(grid, 124, 7, 2);
    platform(grid, 127, 5, 2);
    platform(grid, 130, 4, 2);
    addCoins(coins, 118, 119, 11);
    addCoins(coins, 121, 122, 9);
    addCoins(coins, 124, 125, 7);
    addCoins(coins, 127, 128, 5);
    addCoins(coins, 130, 131, 4);

    addLadder(ladders, 138, 12, 4);
    platform(grid, 136, 4, 14);
    addCoins(coins, 137, 149, 4);
    addKey(keys, 148, 4);

    enemies.push({
        x: 142 * TILE,
        y: 4 * TILE - 50,
        patrolLeft: 137 * TILE,
        patrolRight: 149 * TILE,
        type: 1
    });

    addKnife(knives, 153, groundRow);
    addKnife(knives, 154, groundRow);
    addKnife(knives, 155, groundRow);
    carveGap(grid, 158, 5, groundRow);

    blockStack(grid, 164, 12, 1, 2);
    platform(grid, 166, 9, 8);
    addCoins(coins, 167, 173, 9);
    addLadder(ladders, 170, 12, 9);

    platform(grid, 177, 6, 10);
    addCoins(coins, 178, 186, 6);

    enemies.push({
        x: 181 * TILE,
        y: 6 * TILE - 50,
        patrolLeft: 178 * TILE,
        patrolRight: 186 * TILE,
        type: 0
    });

    carveGap(grid, 190, 5, groundRow);
    platform(grid, 190, 11, 2);
    platform(grid, 193, 9, 2);
    platform(grid, 196, 7, 2);
    platform(grid, 199, 5, 3);
    addCoins(coins, 190, 191, 11);
    addCoins(coins, 193, 194, 9);
    addCoins(coins, 196, 197, 7);
    addCoins(coins, 199, 201, 5);

    blockStack(grid, 205, 12, 1, 2);
    blockStack(grid, 206, 11, 1, 3);
    blockStack(grid, 207, 10, 1, 4);
    blockStack(grid, 208, 9, 1, 5);

    platform(grid, 211, 7, 11);
    addCoins(coins, 212, 221, 7);
    addLadder(ladders, 216, 12, 7);

    enemies.push({
        x: 217 * TILE,
        y: 7 * TILE - 50,
        patrolLeft: 212 * TILE,
        patrolRight: 221 * TILE,
        type: 1
    });

    addKnife(knives, 224, groundRow);
    addKnife(knives, 225, groundRow);
    addKnife(knives, 226, groundRow);

    carveGap(grid, 230, 6, groundRow);
    platform(grid, 230, 11, 2);
    platform(grid, 233, 9, 2);
    platform(grid, 236, 7, 2);
    platform(grid, 239, 5, 2);
    addCoins(coins, 230, 231, 11);
    addCoins(coins, 233, 234, 9);
    addCoins(coins, 236, 237, 7);
    addCoins(coins, 239, 240, 5);

    // addLadder(ladders, 242, 12, 5);
    platform(grid, 245, 5, 14);
    addCoins(coins, 246, 258, 5);
    addKey(keys, 257, 5);

    enemies.push({
        x: 251 * TILE,
        y: 5 * TILE - 50,
        patrolLeft: 246 * TILE,
        patrolRight: 258 * TILE,
        type: 0
    });

    addKnife(knives, 262, groundRow);
    addKnife(knives, 263, groundRow);
    carveGap(grid, 266, 5, groundRow);

    platform(grid, 266, 10, 3);
    platform(grid, 271, 8, 4);
    addCoins(coins, 266, 268, 10);
    addCoins(coins, 271, 274, 8);

    blockStack(grid, 278, 12, 1, 2);
    platform(grid, 280, 7, 10);
    addCoins(coins, 281, 289, 7);
    addLadder(ladders, 284, 12, 7);

    platform(grid, 294, 5, 12);
    addCoins(coins, 295, 305, 5);

    enemies.push({
        x: 299 * TILE,
        y: 5 * TILE - 50,
        patrolLeft: 295 * TILE,
        patrolRight: 305 * TILE,
        type: 1
    });

    carveGap(grid, 309, 6, groundRow);
    platform(grid, 309, 10, 2);
    platform(grid, 313, 8, 2);
    platform(grid, 317, 6, 3);
    addCoins(coins, 309, 310, 10);
    addCoins(coins, 313, 314, 8);
    addCoins(coins, 317, 319, 6);

    blockStack(grid, 324, 12, 2, 1);
    blockStack(grid, 326, 11, 2, 2);
    blockStack(grid, 328, 10, 2, 3);
    platform(grid, 331, 9, 5);
    addCoins(coins, 331, 335, 9);

    const door = {
        x: 333 * TILE,
        y: 12 * TILE,
        width: 52,
        height: 120,
        col: 337,
        row: 9
    };

    return {
        id: 4,
        name: 'Level 4',
        timerMs: 275000,
        progressUnits: 220,
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
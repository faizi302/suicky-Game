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

export function createLevel3Map() {
    const rows = 17;
    const cols = 292;
    const groundRow = 13;

    const grid = makeGrid(rows, cols);
const { coins, keys, knives, enemies, ladders } = createLevelCollections();

fillGroundAndWalls(grid, cols, groundRow);

    blockStack(grid, 3, 12, 1, 2);
    platform(grid, 6, 10, 7);
    addLadder(ladders, 8, 12, 10);
    addCoins(coins, 6, 12, 10);

    carveGap(grid, 15, 4, groundRow);
    platform(grid, 15, 11, 2);
    platform(grid, 18, 9, 2);
    platform(grid, 21, 7, 3);
    addCoins(coins, 15, 16, 11);
    addCoins(coins, 18, 19, 9);
    addCoins(coins, 21, 23, 7);
    addLadder(ladders, 30, 12, 7);

    platform(grid, 27, 7, 10);
    addCoins(coins, 28, 36, 7);
    addKey(keys, 35, 7);

    enemies.push({
        x: 31 * TILE,
        y: 7 * TILE - 50,
        patrolLeft: 28 * TILE,
        patrolRight: 36 * TILE,
        type: 0
    });

    addKnife(knives, 40, groundRow);
    addKnife(knives, 41, groundRow);
    carveGap(grid, 43, 5, groundRow);

        platform(grid, 45, 11, 3);
    addCoins(coins, 45, 48, 11);

        platform(grid, 38, 8, 8);
    addCoins(coins, 39,45 , 8);
    addKey(keys,46,8);

    blockStack(grid, 48, 12, 1, 2);
    platform(grid, 50, 9, 8);
    addCoins(coins, 51, 57, 9);
    addLadder(ladders, 54, 12, 9);

    platform(grid, 61, 6, 13);
    addCoins(coins, 62, 73, 6);
    addKey(keys, 72, 6);

    enemies.push({
        x: 66 * TILE,
        y: 6 * TILE - 50,
        patrolLeft: 62 * TILE,
        patrolRight: 73 * TILE,
        type: 1
    });

    carveGap(grid, 77, 3, groundRow);
    platform(grid, 77, 10, 3);
    platform(grid, 82, 8, 4);
    addCoins(coins, 77, 79, 10);
    addCoins(coins, 82, 85, 8);

    addKnife(knives, 88, groundRow);
    addKnife(knives, 88.5, groundRow);
    addKnife(knives, 89, groundRow);

    blockStack(grid, 93, 11, 1, 3);
    blockStack(grid, 95, 10, 1, 4);
    blockStack(grid, 97, 9, 1, 5);
    platform(grid, 99, 8, 10);
    addCoins(coins, 100, 108, 8);
    addLadder(ladders, 103, 12, 8);

    enemies.push({
        x: 104 * TILE,
        y: 8 * TILE - 50,
        patrolLeft: 100 * TILE,
        patrolRight: 108 * TILE,
        type: 0
    });

    carveGap(grid, 112, 6, groundRow);
    platform(grid, 112, 11, 2);
    platform(grid, 115, 9, 2);
    platform(grid, 118, 7, 2);
    platform(grid, 121, 5, 3);
    addCoins(coins, 112, 113, 11);
    addCoins(coins, 115, 116, 9);
    addCoins(coins, 118, 119, 7);
    addCoins(coins, 121, 123, 5);

    addLadder(ladders, 134, 12, 5);
    platform(grid, 126, 5, 14);
    addCoins(coins, 127, 139, 5);
    addKey(keys, 138, 5);

    enemies.push({
        x: 132 * TILE,
        y: 5 * TILE - 50,
        patrolLeft: 127 * TILE,
        patrolRight: 139 * TILE,
        type: 1
    });

    addKnife(knives, 143, groundRow);
    addKnife(knives, 145, groundRow);
    carveGap(grid, 147, 4, groundRow);

    platform(grid, 148, 10, 8);
    addCoins(coins, 150, 157, 10);
    
    platform(grid, 162, 7, 10);
    addCoins(coins, 163, 171, 7);
    addLadder(ladders, 162, 15, 7);

    enemies.push({
        x: 166 * TILE,
        y: 7 * TILE - 50,
        patrolLeft: 163 * TILE,
        patrolRight: 171 * TILE,
        type: 0
    });

    blockStack(grid, 175, 12, 1, 2);
    blockStack(grid, 176, 11, 1, 3);
    blockStack(grid, 177, 10, 1, 4);
    blockStack(grid, 178, 9, 1, 5);

    platform(grid, 181, 6, 12);
    addCoins(coins, 182, 192, 6);

    carveGap(grid, 196, 5, groundRow);
    platform(grid, 196, 11, 2);
    platform(grid, 199, 9, 2);
    platform(grid, 202, 7, 2);
    addCoins(coins, 196, 197, 11);
    addCoins(coins, 199, 200, 9);
    addCoins(coins, 202, 203, 7);

    addLadder(ladders, 210, 12, 7);
    platform(grid, 207, 7, 11);
    addCoins(coins, 208, 217, 7);
    addKey(keys, 216, 7);

    enemies.push({
        x: 212 * TILE,
        y: 7 * TILE - 50,
        patrolLeft: 208 * TILE,
        patrolRight: 217 * TILE,
        type: 1
    });

    addKnife(knives, 220, groundRow);
    addKnife(knives, 220.5, groundRow);
    addKnife(knives, 221, groundRow);

    carveGap(grid, 226, 4, groundRow);
    platform(grid, 226, 10, 3);
    platform(grid, 231, 8, 3);
    addCoins(coins, 226, 228, 10);
    addCoins(coins, 231, 233, 8);

    blockStack(grid, 238, 12, 1, 2);
    platform(grid, 240, 8, 8);
    addCoins(coins, 241, 247, 8);
    addLadder(ladders, 244, 12, 8);

    platform(grid, 251, 5, 14);
    addCoins(coins, 252, 264, 5);

    enemies.push({
        x: 258 * TILE,
        y: 5 * TILE - 50,
        patrolLeft: 252 * TILE,
        patrolRight: 264 * TILE,
        type: 0
    });

    addKnife(knives, 268, groundRow);
    addKnife(knives, 269, groundRow);
    carveGap(grid, 272, 5, groundRow);

      platform(grid, 273, 11, 10);
    addCoins(coins, 273, 282, 11);

    blockStack(grid, 278, 12, 2, 1);
    blockStack(grid, 280, 11, 2, 2);
    blockStack(grid, 282, 10, 2, 3);
    platform(grid, 285, 9, 5);
    addCoins(coins, 285, 289, 9);

    const door = {
        x: 286 * TILE,
        y: 12 * TILE,
        width: 52,
        height: 120,
        col: 291,
        row: 9
    };

    return {
        id: 3,
        name: 'Level 3',
        timerMs: 245000,
        progressUnits: 190,
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
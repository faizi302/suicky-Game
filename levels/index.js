import { createMap } from './tileMap.js';
import { createLevel2Map } from './level2.js';
import { createLevel3Map } from './level3.js';
import { createLevel4Map } from './level4.js';
import { createLevel5Map } from './level5.js';
import { createLevel6Map } from './level6.js';
import { createLevel7Map } from './level7.js';
import { createLevel8Map } from './level8.js';

const LEVEL_BUILDERS = {
    1: createMap,
    2: createLevel2Map,
    3: createLevel3Map,
    4: createLevel4Map,
    5: createLevel5Map,
    6: createLevel6Map,
    7: createLevel7Map,
    8: createLevel8Map
};

export function getLevelData(levelId = 1) {
    const safeId = Number(levelId) || 1;
    const builder = LEVEL_BUILDERS[safeId] || createMap;
    const level = builder();

    return {
        id: safeId,
        name: `Level ${safeId}`,
        timerMs: 180000,
        progressUnits: 100,
        ...level
    };
}
/**
 * movingPlateforms.js
 *
 * Utility helpers for moving platforms.
 * Supports vertical and horizontal movement,
 * but your current level9 data uses axis: 'y',
 * so X will remain fixed and only Y will move.
 */

export function initMovingPlatforms(platforms = []) {
    return platforms.map((p) => ({
        ...p,
        _dir: p._dir === -1 ? -1 : 1,
        _baseX: p.x,
        _baseY: p.y
    }));
}

export function updateMovingPlatforms(platforms = [], dt = 16.67) {
    if (!platforms.length) return;

    const step = dt / 16.67;

    for (const p of platforms) {
        if (p._baseX == null) p._baseX = p.x;
        if (p._baseY == null) p._baseY = p.y;
        if (p._dir == null) p._dir = 1;

        if (p.axis === 'x') {
            p.y = p._baseY;

            p.x += p.speed * step * p._dir;

            if (p.x >= p.max) {
                p.x = p.max;
                p._dir = -1;
            }
            if (p.x <= p.min) {
                p.x = p.min;
                p._dir = 1;
            }
        } else {
            // default vertical
            p.x = p._baseX;

            p.y += p.speed * step * p._dir;

            if (p.y >= p.max) {
                p.y = p.max;
                p._dir = -1;
            }
            if (p.y <= p.min) {
                p.y = p.min;
                p._dir = 1;
            }
        }
    }
}
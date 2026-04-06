import { isSolid } from '../levels/tileMap.js';

export function rectsOverlap(ax, ay, aw, ah, bx, by, bw, bh) {
    return ax < bx + bw && ax + aw > bx && ay < by + bh && ay + ah > by;
}

export function resolveMapCollision(entity, map, tileSize) {
    const w = entity.width;
    const h = entity.height;

    // ── HORIZONTAL ─────────────────────────────────────────────
    entity.x += entity.vx;

    let left = Math.floor(entity.x / tileSize);
    let right = Math.floor((entity.x + w - 1) / tileSize);
    let top = Math.floor(entity.y / tileSize);
    let bottom = Math.floor((entity.y + h - 1) / tileSize);

    for (let row = top; row <= bottom; row++) {
        for (let col = left; col <= right; col++) {
            if (!isSolid(map, col, row)) continue;

            const tileLeft = col * tileSize;
            const tileRight = tileLeft + tileSize;

            if (entity.vx > 0) {
                entity.x = tileLeft - w;
                entity.vx = 0;
            } else if (entity.vx < 0) {
                entity.x = tileRight;
                entity.vx = 0;
            }
        }
    }

    // ── VERTICAL ───────────────────────────────────────────────
    entity.y += entity.vy;
    entity.onGround = false;

    left = Math.floor(entity.x / tileSize);
    right = Math.floor((entity.x + w - 1) / tileSize);
    top = Math.floor(entity.y / tileSize);
    bottom = Math.floor((entity.y + h - 1) / tileSize);

    for (let row = top; row <= bottom; row++) {
        for (let col = left; col <= right; col++) {
            if (!isSolid(map, col, row)) continue;

            const tileTop = row * tileSize;
            const tileBottom = tileTop + tileSize;

            if (entity.vy > 0) {
                entity.y = tileTop - h;
                entity.vy = 0;
                entity.onGround = true;
            } else if (entity.vy < 0) {
                entity.y = tileBottom;
                entity.vy = 0;
            }
        }
    }
}
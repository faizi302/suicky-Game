export const GRAVITY = 0.55;
export const MAX_FALL_SPEED = 18;

export function applyGravity(obj) {
    obj.vy += GRAVITY;
    if (obj.vy > MAX_FALL_SPEED) obj.vy = MAX_FALL_SPEED;
}
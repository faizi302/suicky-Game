// camera.js
// Zoom is supplied by game.js via computeZoom() for consistent world-area on all screen sizes.
//
// Y behaviour:
//   - The ONLY hard rule: camera.y can never exceed groundLockedY (bottom is fixed).
//   - Everywhere else Y moves via smooth lerp — no snapping, no feedback loops.
//   - desiredY is computed purely from the player's world position so the
//     threshold never oscillates.

export class Camera {
    constructor(screenW, screenH, options = {}) {
        this.screenW = screenW;
        this.screenH = screenH;

        this.x = 0;
        this.y = 0;

        this.zoom = options.zoom ?? 1.7;

        // ── X follow ──────────────────────────────────────────────
        this.followOffsetX   = options.followOffsetX   ?? 0.36;
        this.deadZoneW       = options.deadZoneW       ?? 100;
        this.followStrengthX = options.followStrengthX ?? 0.18;

        this.minZoom = options.minZoom ?? 1;
        this.maxZoom = options.maxZoom ?? 4;

        // ── Y follow ──────────────────────────────────────────────
        this.followStrengthY = options.followStrengthY ?? 0.10;
        this.groundPadding   = options.groundPadding   ?? 0;

        // topUnlockRow: how many rows from the TOP of the viewport are
        // "safe" — camera starts scrolling up when the player enters them.
        // e.g. 7 means rows 0-6 (7 rows) → camera follows up.
        this.topUnlockRow = options.topUnlockRow ?? 7;
        this.tileSize     = options.tileSize     ?? 40;

        // lockY: true → legacy hard-snap to bottom (unused in new setup).
        this.lockY = options.lockY ?? false;

        this.parallaxX = 0;
        this.parallaxY = 0;

        this._recalculateViewport();
    }

    _recalculateViewport() {
        this.zoom  = Math.max(this.minZoom, Math.min(this.zoom, this.maxZoom));
        this.viewW = this.screenW / this.zoom;
        this.viewH = this.screenH / this.zoom;
    }

    resize(screenW, screenH) {
        this.screenW = screenW;
        this.screenH = screenH;
        this._recalculateViewport();
    }

    setZoom(zoom) {
        this.zoom = zoom;
        this._recalculateViewport();
    }

    getViewport() {
        return { x: this.x, y: this.y, width: this.viewW, height: this.viewH };
    }

    // The one hard Y limit — camera never goes below this.
    _groundLockedY(worldH) {
        const maxY = worldH - this.viewH;
        if (maxY <= 0) return 0;
        return Math.max(0, maxY - this.groundPadding);
    }

    // Only clamps X and the hard bottom limit. Never touches Y above that.
    clamp(worldW, worldH) {
        // X: stay inside world
        const maxX = Math.max(0, worldW - this.viewW);
        this.x = Math.max(0, Math.min(this.x, maxX));

        // Y: only enforce the hard floor (never scroll below ground-locked pos)
        const floorY = this._groundLockedY(worldH);
        if (this.y > floorY) this.y = floorY;   // hard snap only at the very bottom
        if (this.y < 0)      this.y = 0;         // never go above world top

        this.parallaxX = this.x;
        this.parallaxY = this.y;
    }

    follow(target, worldW, worldH, dt = 16.67) {

        // ── X (smooth lerp + dead-zone, unchanged) ────────────────
        const targetCenterX = target.x + target.width * 0.5;
        const desiredX      = targetCenterX - this.viewW * this.followOffsetX;
        const halfDeadZoneW = this.deadZoneW * 0.5;
        let nextX = this.x;
        const dx  = desiredX - this.x;
        if (Math.abs(dx) > halfDeadZoneW) {
            nextX = desiredX - Math.sign(dx) * halfDeadZoneW;
        }
        this.x += (nextX - this.x) * this.followStrengthX;

        // ── Y (smooth lerp, hard-floor only) ──────────────────────
        const floorY = this._groundLockedY(worldH);

        let desiredY;

        if (this.lockY) {
            // Legacy mode: always pin to bottom.
            desiredY = floorY;
        } else {
            // triggerY is a FIXED world-space threshold.
            // It does NOT use camera.y — so it never creates a feedback loop.
            //
            // When the player's Y is above (floorY + topUnlockRow * tileSize),
            // they are visually in the top N rows when the camera is at rest.
            // That is exactly when we want the camera to scroll up.
            const triggerY = floorY + this.topUnlockRow * this.tileSize;

            if (target.y < triggerY) {
                // Player is high up — keep them pinned at topUnlockRow-th row.
                desiredY = target.y - this.topUnlockRow * this.tileSize;
            } else {
                // Player is in the safe lower zone — rest camera at bottom.
                desiredY = floorY;
            }

            // Safety: desiredY must stay in [0, floorY]
            desiredY = Math.max(0, Math.min(desiredY, floorY));
        }

        // One lerp. Always. No branching on direction, no snapping.
        this.y += (desiredY - this.y) * this.followStrengthY;

        // Hard safety net: just the floor & ceiling, never overrides the lerp.
        this.clamp(worldW, worldH);
    }

    worldToScreenX(worldX) { return worldX - this.x; }
    worldToScreenY(worldY) { return worldY - this.y; }

    applyWorldTransform(ctx) {
        ctx.scale(this.zoom, this.zoom);
    }

    resetTransform(ctx) {
        ctx.setTransform(1, 0, 0, 1, 0, 0);
    }
}

export function createCamera(screenW, screenH, options = {}) {
    return new Camera(screenW, screenH, options);
}
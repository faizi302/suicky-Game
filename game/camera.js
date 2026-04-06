// camera.js
// No changes needed to core logic — the zoom is now supplied by game.js
// via computeZoom() which ensures consistent world-area on all screen sizes.

export class Camera {
    constructor(screenW, screenH, options = {}) {
        this.screenW = screenW;
        this.screenH = screenH;

        this.x = 0;
        this.y = 0;

        this.zoom = options.zoom ?? 1.7;

        // X follow
        this.followOffsetX   = options.followOffsetX   ?? 0.36;
        this.deadZoneW       = options.deadZoneW       ?? 100;
        this.followStrengthX = options.followStrengthX ?? 0.18;

        this.minZoom = options.minZoom ?? 1;
        this.maxZoom = options.maxZoom ?? 4;

        // Fixed vertical setup
        this.lockY          = options.lockY          ?? true;
        this.groundPadding  = options.groundPadding  ?? 0;

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
        return {
            x: this.x,
            y: this.y,
            width:  this.viewW,
            height: this.viewH
        };
    }

    _getFixedGroundY(worldH) {
        const maxY = worldH - this.viewH;
        if (maxY <= 0) return maxY;
        return Math.max(0, maxY - this.groundPadding);
    }

    clamp(worldW, worldH) {
        const maxX = Math.max(0, worldW - this.viewW);
        this.x = Math.max(0, Math.min(this.x, maxX));

        if (this.lockY) {
            this.y = this._getFixedGroundY(worldH);
        } else {
            const maxY = worldH - this.viewH;
            if (maxY <= 0) this.y = maxY;
            else this.y = Math.max(0, Math.min(this.y, maxY));
        }

        this.parallaxX = this.x;
        this.parallaxY = this.y;
    }

    follow(target, worldW, worldH, dt = 16.67) {
        // ── X follow ──────────────────────────────────────────────
        const targetCenterX = target.x + target.width * 0.5;
        const desiredX      = targetCenterX - this.viewW * this.followOffsetX;

        const halfDeadZoneW = this.deadZoneW * 0.5;
        let nextX = this.x;
        const dx  = desiredX - this.x;

        if (Math.abs(dx) > halfDeadZoneW) {
            nextX = desiredX - Math.sign(dx) * halfDeadZoneW;
        }

        this.x += (nextX - this.x) * this.followStrengthX;

        // ── Y fixed ───────────────────────────────────────────────
        if (this.lockY) {
            this.y = this._getFixedGroundY(worldH);
        }

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
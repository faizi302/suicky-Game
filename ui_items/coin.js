export default class Coin {
    constructor(x, y, type = 'coin') {
        this.x = x;
        this.y = y;
        this.type = type;
        this.collected = false;
        this.remove = false;
        this.isDangerous = type === 'knife';

        if (type === 'coin') {
            this.width = 28;
            this.height = 28;
        } else if (type === 'key') {
            this.width = 28;
            this.height = 28;
        } else if (type === 'knife') {
            this.width = 42;
            this.height = 42;

            // 🔥 FIX: push image UP so spike tip sits on ground
            this.drawOffsetX = 0;
            this.drawOffsetY = -18;

            // 🔥 FIX: proper collision at spike tip
            this.hitOffsetX = 8;
            this.hitOffsetY = 22;
            this.hitWidth = 26;
            this.hitHeight = 14;
        } else {
            this.width = 28;
            this.height = 28;
        }
    }

    collect() {
        this.collected = true;
        this.remove = true;
    }

    update() {
        // static items only
    }

    getBounds() {
        if (this.type === 'knife') {
            return {
                x: this.x + this.hitOffsetX,
                y: this.y + this.hitOffsetY,
                width: this.hitWidth,
                height: this.hitHeight
            };
        }

        return {
            x: this.x,
            y: this.y,
            width: this.width,
            height: this.height
        };
    }

    draw(ctx, camera) {
        if (this.collected) return;

        const dx = Math.floor(this.x - camera.x);
        const dy = Math.floor(this.y - camera.y);

        if (this.type === 'coin') {
            const img = document.getElementById('img_coin');
            if (img && img.complete && img.naturalWidth > 0) {
                ctx.drawImage(img, dx, dy, this.width, this.height);
            } else {
                ctx.fillStyle = '#ffd700';
                ctx.beginPath();
                ctx.arc(dx + this.width / 2, dy + this.height / 2, this.width / 2, 0, Math.PI * 2);
                ctx.fill();
            }
            return;
        }

        if (this.type === 'key') {
            const img = document.getElementById('img_silver_key');
            if (img && img.complete && img.naturalWidth > 0) {
                ctx.drawImage(img, dx, dy, this.width, this.height);
            } else {
                ctx.fillStyle = '#dddddd';
                ctx.fillRect(dx, dy, this.width, this.height);
            }
            return;
        }

        if (this.type === 'knife') {
            const img = document.getElementById('img_knifes');

            if (img && img.complete && img.naturalWidth > 0) {
                // single image, not sprite sheet
                const srcW = img.naturalWidth;
                const srcH = img.naturalHeight;

                ctx.drawImage(
                    img,
                    0, 0, srcW, srcH,
                    dx + this.drawOffsetX,
                    dy + this.drawOffsetY,
                    this.width,
                    this.height
                );
            } else {
                ctx.fillStyle = '#bcbcbc';
                ctx.fillRect(dx, dy, this.width, this.height);
            }

            // debug collision box if needed
            // const b = this.getBounds();
            // ctx.strokeStyle = 'red';
            // ctx.strokeRect(
            //     Math.floor(b.x - camera.x),
            //     Math.floor(b.y - camera.y),
            //     b.width,
            //     b.height
            // );

            return;
        }
    }
}
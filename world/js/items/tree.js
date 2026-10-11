class Tree {
    constructor(center, size) {
        this.center = center;
        this.size = size;
    }

    draw(ctx) {
        // Shadow on the ground
        this.center.draw(ctx, { size: this.size, color: "rgba(0,0,0,0.25)" });

        // Stacked layers: each one is smaller, lighter and sits a bit higher
        const layers = 4;
        for (let i = 0; i < layers; i++) {
            const t = i / (layers - 1);
            const radius = lerp(this.size / 2, this.size / 5, t);
            const lift = t * this.size * 0.45;
            const r = Math.round(lerp(20, 110, t));
            const g = Math.round(lerp(90, 190, t));
            const b = Math.round(lerp(40, 70, t));

            new Point(this.center.x, this.center.y - lift).draw(ctx, {
                size: radius * 2,
                color: "rgb(" + r + "," + g + "," + b + ")",
            });
        }
    }
}
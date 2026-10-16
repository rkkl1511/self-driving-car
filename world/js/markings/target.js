class Target extends Marking {
    constructor(center, directionVector, width, height) {
        super(center, directionVector, width, height);
        this.type = "target";
    }

    draw(ctx) {
        this.center.draw(ctx, { color: "red", size: this.width * 0.9 });
        this.center.draw(ctx, { color: "white", size: this.width * 0.6 });
        this.center.draw(ctx, { color: "red", size: this.width * 0.3 });
    }
}
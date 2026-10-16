class Stop {
    constructor(center, directionVector, width, height) {
        this.center = center;
        this.directionVector = directionVector;
        this.width = width;
        this.height = height;

        // A short segment along the road, centered on the marking
        this.support = new Segment(
            translate(center, angle(directionVector), height / 2),
            translate(center, angle(directionVector), -height / 2)
        );
        // A rectangle around it (roundness 0 = square corners)
        this.poly = new Envelope(this.support, width, 0).poly;
        // The stop line: one short edge of the rectangle, across the road
        this.border = this.poly.segments[2];
    }

    draw(ctx) {
        this.border.draw(ctx, { width: 5, color: "white" });

        ctx.save();
        ctx.translate(this.center.x, this.center.y);
        ctx.rotate(angle(this.directionVector) - Math.PI / 2);
        ctx.scale(1, 3); // stretch along the road, like real painted text

        ctx.beginPath();
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillStyle = "white";
        ctx.font = "bold " + this.height * 0.3 + "px Arial";
        ctx.fillText("STOP", 0, 1);

        ctx.restore();
    }
}
class Start extends Marking {
    constructor(center, directionVector, width, height) {
        super(center, directionVector, width, height);
        this.type = "start";
    }

    draw(ctx) {
        ctx.save();
        ctx.translate(this.center.x, this.center.y);
        // The arrow is drawn pointing up, so rotate it to face the road direction
        ctx.rotate(angle(this.directionVector) + Math.PI / 2);

        ctx.beginPath();
        ctx.moveTo(0, -this.height / 2);
        ctx.lineTo(this.width / 2, this.height / 2);
        ctx.lineTo(0, this.height * 0.25);
        ctx.lineTo(-this.width / 2, this.height / 2);
        ctx.closePath();
        ctx.fillStyle = "#37b24d";
        ctx.fill();
        ctx.lineWidth = 3;
        ctx.strokeStyle = "white";
        ctx.stroke();

        ctx.restore();
    }
}
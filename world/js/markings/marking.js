class Marking {
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
    }

    // Rebuilds a marking from saved data
    static load(info) {
        const point = new Point(info.center.x, info.center.y);
        const dir = new Point(info.directionVector.x, info.directionVector.y);
        switch (info.type) {
            case "stop":
                return new Stop(point, dir, info.width, info.height);
            case "crossing":
                return new Crossing(point, dir, info.width, info.height);
            case "light":
                return new Light(point, dir, info.width, info.height);
            case "start":
                return new Start(point, dir, info.width, info.height);
            case "target":
                return new Target(point, dir, info.width, info.height);
        }
    }

    draw(ctx) {
        this.poly.draw(ctx);
    }
}
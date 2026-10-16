class Light extends Marking {
    constructor(center, directionVector, width, height) {
        super(center, directionVector, width, height);

        this.state = "off"; // "green", "yellow", "red" or "off"
        this.border = this.poly.segments[0];
        this.type = "light";
    }

    draw(ctx) {
        // A line across the road, centered on the marking
        const perp = perpendicular(this.directionVector);
        const line = new Segment(
            add(this.center, scale(perp, this.width / 2)),
            add(this.center, scale(perp, -this.width / 2))
        );

        const green = lerp2D(line.p1, line.p2, 0.2);
        const yellow = lerp2D(line.p1, line.p2, 0.5);
        const red = lerp2D(line.p1, line.p2, 0.8);

        // Housing: a light outline, then a dark pill on top
        const housing = new Segment(red, green);
        housing.draw(ctx, { width: this.width * 0.36 + 3, color: "#ddd", cap: "round" });
        housing.draw(ctx, { width: this.width * 0.36, color: "#111", cap: "round" });

        // Bulbs: bright when active, dim otherwise
        const size = this.width * 0.26;
        green.draw(ctx, { size, color: this.state === "green" ? "#0f0" : "#060" });
        yellow.draw(ctx, { size, color: this.state === "yellow" ? "#ff0" : "#660" });
        red.draw(ctx, { size, color: this.state === "red" ? "#f00" : "#600" });
    }
}
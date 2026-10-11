class Segment {
    constructor(p1, p2) {
        this.p1 = p1;
        this.p2 = p2;
    }

    equals(seg) {
        return this.includes(seg.p1) && this.includes(seg.p2);
    }

    includes(point) {
        return this.p1.equals(point) || this.p2.equals(point);
    }

    draw(ctx, { width = 2, color = "black", dash = [] } = {}) {
        ctx.beginPath();
        ctx.lineWidth = width;
        ctx.strokeStyle = color;
        ctx.setLineDash(dash);
        ctx.moveTo(this.p1.x, this.p1.y);
        ctx.lineTo(this.p2.x, this.p2.y);
        ctx.stroke();
        ctx.setLineDash([]);
    }
    length() {
        return distance(this.p1, this.p2);
    }

    directionVector() {
        return normalize(subtract(this.p2, this.p1));
    }

    projectPoint(point) {
        const a = subtract(point, this.p1);
        const b = subtract(this.p2, this.p1);
        const normB = normalize(b);
        const scaler = dot(a, normB);
        return {
            point: add(this.p1, scale(normB, scaler)),
            offset: scaler / magnitude(b),
        };
    }

    distanceToPoint(point) {
        const proj = this.projectPoint(point);
        // The closest spot is on the segment itself
        if (proj.offset > 0 && proj.offset < 1) {
            return distance(point, proj.point);
        }
        // Otherwise the closest spot is one of the ends
        return Math.min(distance(point, this.p1), distance(point, this.p2));
    }
}
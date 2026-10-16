// Shortest path along the road graph (Dijkstra).
// Returns a list of points: start, the junctions in between, then the target.
function buildRoute(graph, startPos, startDir, targetPos) {
    const startSeg = getNearestSegment(startPos, graph.segments);
    const targetSeg = getNearestSegment(targetPos, graph.segments);
    if (!startSeg || !targetSeg) {
        return null;
    }

    // Target is further along the same road, in the direction we face
    if (
        startSeg === targetSeg &&
        dot(subtract(targetPos, startPos), startDir) > 0
    ) {
        return [startPos, targetPos];
    }

    // The car leaves its road through the end it is facing
    const facingP2 = dot(subtract(startSeg.p2, startSeg.p1), startDir) > 0;
    const first = facingP2 ? startSeg.p2 : startSeg.p1;

    const dist = new Map();
    const prev = new Map();
    const visited = new Set();
    for (const p of graph.points) {
        dist.set(p, Infinity);
    }
    dist.set(first, distance(startPos, first));

    while (true) {
        // Pick the closest unvisited junction
        let node = null;
        let best = Infinity;
        for (const p of graph.points) {
            if (!visited.has(p) && dist.get(p) < best) {
                best = dist.get(p);
                node = p;
            }
        }
        if (!node) break;
        visited.add(node);

        // Relax every road leaving it
        for (const seg of graph.getSegmentsWithPoint(node)) {
            const other = seg.p1.equals(node) ? seg.p2 : seg.p1;
            const d = dist.get(node) + seg.length();
            if (d < dist.get(other)) {
                dist.set(other, d);
                prev.set(other, node);
            }
        }
    }

    // Enter the target's road through whichever end is cheaper
    let endNode = null;
    let bestTotal = Infinity;
    for (const n of [targetSeg.p1, targetSeg.p2]) {
        const total = dist.get(n) + distance(n, targetPos);
        if (total < bestTotal) {
            bestTotal = total;
            endNode = n;
        }
    }
    if (!endNode || bestTotal === Infinity) {
        return null;
    }

    const path = [];
    for (let n = endNode; n; n = prev.get(n)) {
        path.unshift(n);
    }
    return [startPos, ...path, targetPos];
}

class Route {
    constructor(points) {
        this.points = points;
        this.segments = [];
        this.cumulative = [0];
        for (let i = 0; i < points.length - 1; i++) {
            const seg = new Segment(points[i], points[i + 1]);
            this.segments.push(seg);
            this.cumulative.push(this.cumulative[i] + seg.length());
        }
        this.length = this.cumulative[this.cumulative.length - 1];
    }

    // How far along the route a position is (0 at the start, length at the target)
    progress(pos) {
        let bestDist = Infinity;
        let bestProgress = 0;
        for (let i = 0; i < this.segments.length; i++) {
            const seg = this.segments[i];
            const len = seg.length();
            if (len < 0.001) continue;

            const d = seg.distanceToPoint(pos);
            if (d < bestDist) {
                bestDist = d;
                const t = Math.max(0, Math.min(1, seg.projectPoint(pos).offset));
                bestProgress = this.cumulative[i] + t * len;
            }
        }
        return bestProgress;
    }

    draw(ctx) {
        for (const seg of this.segments) {
            seg.draw(ctx, { width: 4, color: "#ffd43b", dash: [10, 10] });
        }
    }
}
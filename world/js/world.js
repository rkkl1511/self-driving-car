class World {
    constructor(
        graph,
        roadWidth = 80,
        roadRoundness = 10,
        buildingWidth = 100,
        buildingMinLength = 100,
        spacing = 40,
        treeSize = 30,
        treeTries = 10
    ) {
        this.graph = graph;
        this.roadWidth = roadWidth;
        this.roadRoundness = roadRoundness;
        this.buildingWidth = buildingWidth;
        this.buildingMinLength = buildingMinLength;
        this.spacing = spacing;
        this.treeSize = treeSize;
        this.treeTries = treeTries;

        this.envelopes = [];
        this.roadBorders = [];
        this.buildings = [];
        this.trees = [];
        this.markings = [];

        this.generate();
    }

    generate() {
        this.envelopes.length = 0;
        for (const seg of this.graph.segments) {
            this.envelopes.push(
                new Envelope(seg, this.roadWidth, this.roadRoundness)
            );
        }

        this.roadBorders = Polygon.union(this.envelopes.map((e) => e.poly));
        this.buildings = this.#generateBuildings();
        this.trees = this.#generateTrees();
        // Drop markings whose road has been moved or deleted
        for (let i = this.markings.length - 1; i >= 0; i--) {
            const onRoad = this.graph.segments.some(
                (s) => s.distanceToPoint(this.markings[i].center) < this.roadWidth / 2
            );
            if (!onRoad) {
                this.markings.splice(i, 1);
            }
        }
    }

    #generateTrees() {
        const points = [
            ...this.roadBorders.map((s) => [s.p1, s.p2]).flat(),
            ...this.buildings.map((b) => b.poly.points).flat(),
        ];
        if (points.length === 0) {
            return [];
        }

        // Area to scatter trees in: everything built, plus a margin
        const left = Math.min(...points.map((p) => p.x)) - this.treeSize;
        const right = Math.max(...points.map((p) => p.x)) + this.treeSize;
        const top = Math.min(...points.map((p) => p.y)) - this.treeSize;
        const bottom = Math.max(...points.map((p) => p.y)) + this.treeSize;

        const illegalPolys = [
            ...this.buildings.map((b) => b.poly),
            ...this.envelopes.map((e) => e.poly),
        ];

        // Keep the old trees that are still in a valid spot
        const trees = [];
        for (const tree of this.trees) {
            if (this.#isValidTreeSpot(tree.center, illegalPolys, trees)) {
                trees.push(tree);
            }
        }

        // Try to plant new ones at random spots
        for (let i = 0; i < this.treeTries; i++) {
            const p = new Point(
                lerp(left, right, Math.random()),
                lerp(top, bottom, Math.random())
            );
            if (this.#isValidTreeSpot(p, illegalPolys, trees)) {
                trees.push(new Tree(p, this.treeSize));
            }
        }

        // Draw back to front, so trees lower on the screen overlap the ones behind
        trees.sort((a, b) => a.center.y - b.center.y);
        return trees;
    }

    #isValidTreeSpot(p, illegalPolys, trees) {
        let closeToSomething = false;

        for (const poly of illegalPolys) {
            const d = poly.distanceToPoint(p);
            if (d < this.treeSize / 2 || poly.containsPoint(p)) {
                return false; // on or too near a road or building
            }
            if (d < this.treeSize * 2) {
                closeToSomething = true;
            }
        }
        if (!closeToSomething) {
            return false; // too far from the city
        }

        for (const tree of trees) {
            if (distance(tree.center, p) < this.treeSize) {
                return false; // too close to another tree
            }
        }
        return true;
    }

    #generateBuildings() {
        // 1. Guides: the outer edge of roads fattened to leave room for buildings
        const guideEnvelopes = [];
        for (const seg of this.graph.segments) {
            guideEnvelopes.push(
                new Envelope(
                    seg,
                    this.roadWidth + this.buildingWidth + this.spacing * 2,
                    this.roadRoundness
                )
            );
        }
        let guides = Polygon.union(guideEnvelopes.map((e) => e.poly));

        // 2. Keep only guides long enough to hold a building
        guides = guides.filter((g) => g.length() > this.buildingMinLength);

        // 3. Lay out building footprints along each guide
        const supports = [];
        for (const seg of guides) {
            const dir = seg.directionVector();

            let q1 = seg.p1;
            let q2 = add(q1, scale(dir, this.buildingMinLength));
            supports.push(new Segment(q1, q2));

            while (distance(q2, seg.p2) > this.buildingMinLength + this.spacing) {
                q1 = add(q2, scale(dir, this.spacing));
                q2 = add(q1, scale(dir, this.buildingMinLength));
                supports.push(new Segment(q1, q2));
            }
        }

        const bases = supports.map((s) => new Envelope(s, this.buildingWidth));

        // 4. Remove buildings that overlap or crowd each other
        const eps = 0.001;
        for (let i = 0; i < bases.length - 1; i++) {
            for (let j = i + 1; j < bases.length; j++) {
                if (
                    bases[i].poly.intersectsPoly(bases[j].poly) ||
                    bases[i].poly.distanceToPoly(bases[j].poly) < this.spacing - eps
                ) {
                    bases.splice(j, 1);
                    j--;
                }
            }
        }

        return bases;
    }

    draw(ctx) {
        // Road surface
        for (const env of this.envelopes) {
            env.draw(ctx, { fill: "#4a4a4a", stroke: "#4a4a4a", lineWidth: 15 });
        }

        // Clean outer edges of the merged roads
        for (const seg of this.roadBorders) {
            seg.draw(ctx, { color: "white", width: 4 });
        }
        // Road markings
        for (const m of this.markings) {
            m.draw(ctx);
        }

        // Buildings
        for (const b of this.buildings) {
            b.draw(ctx, { fill: "white", stroke: "#888", lineWidth: 2 });
        }

        // Trees
        for (const tree of this.trees) {
            tree.draw(ctx);
        }
    }
}
class World {
    constructor(
        graph,
        roadWidth = 80,
        roadRoundness = 10,
        buildingWidth = 100,
        buildingMinLength = 100,
        spacing = 40
    ) {
        this.graph = graph;
        this.roadWidth = roadWidth;
        this.roadRoundness = roadRoundness;
        this.buildingWidth = buildingWidth;
        this.buildingMinLength = buildingMinLength;
        this.spacing = spacing;

        this.envelopes = [];
        this.roadBorders = [];
        this.buildings = [];

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
            env.draw(ctx, { fill: "#BBB", stroke: "#BBB", lineWidth: 15 });
        }

        // Clean outer edges of the merged roads
        for (const seg of this.roadBorders) {
            seg.draw(ctx, { color: "white", width: 4 });
        }

        // Buildings
        for (const b of this.buildings) {
            b.draw(ctx, { fill: "white", stroke: "#888", lineWidth: 2 });
        }
    }
}
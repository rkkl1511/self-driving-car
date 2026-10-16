class StopEditor {
    constructor(viewport, world) {
        this.viewport = viewport;
        this.world = world;
        this.canvas = viewport.canvas;
        this.ctx = this.canvas.getContext("2d");

        this.mouse = null;
        this.intent = null; // the stop sign that would be placed on click

        this.markings = world.markings;

        this.boundMouseDown = this.#handleMouseDown.bind(this);
        this.boundMouseMove = this.#handleMouseMove.bind(this);
    }

    enable() {
        this.canvas.addEventListener("mousedown", this.boundMouseDown);
        this.canvas.addEventListener("mousemove", this.boundMouseMove);
    }

    disable() {
        this.canvas.removeEventListener("mousedown", this.boundMouseDown);
        this.canvas.removeEventListener("mousemove", this.boundMouseMove);
        this.intent = null;
    }

    #handleMouseMove(evt) {
        this.mouse = this.viewport.getMouse(evt, true);

        // Which road is the mouse over?
        const seg = getNearestSegment(
            this.mouse,
            this.world.graph.segments,
            this.world.roadWidth / 2
        );

        this.intent = null;
        if (seg) {
            // Snap onto the road's center line
            const proj = seg.projectPoint(this.mouse);
            if (proj.offset >= 0 && proj.offset <= 1) {
                this.intent = new Stop(
                    proj.point,
                    seg.directionVector(),
                    this.world.roadWidth / 2,
                    this.world.roadWidth / 2
                );
            }
        }
    }

    #handleMouseDown(evt) {
        // Middle button and Shift+click belong to the viewport (panning)
        if (evt.button === 1 || evt.shiftKey) {
            return;
        }

        // Left click: place the previewed marking
        if (evt.button === 0 && this.intent) {
            this.markings.push(this.intent);
            this.intent = null;
        }

        // Right click: delete the marking under the mouse
        if (evt.button === 2) {
            for (let i = 0; i < this.markings.length; i++) {
                if (this.markings[i].poly.containsPoint(this.mouse)) {
                    this.markings.splice(i, 1);
                    return;
                }
            }
        }
    }

    display() {
        if (this.intent) {
            this.ctx.globalAlpha = 0.5;
            this.intent.draw(this.ctx);
            this.ctx.globalAlpha = 1;
        }
    }
}
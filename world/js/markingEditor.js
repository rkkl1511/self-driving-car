class MarkingEditor {
    constructor(viewport, world, targetSegments) {
        this.viewport = viewport;
        this.world = world;
        this.canvas = viewport.canvas;
        this.ctx = this.canvas.getContext("2d");

        this.mouse = null;
        this.intent = null; // the marking that would be placed on click

        this.targetSegments = targetSegments;
        this.markings = world.markings;

        this.boundMouseDown = this.#handleMouseDown.bind(this);
        this.boundMouseMove = this.#handleMouseMove.bind(this);
    }

    // Subclasses override this to say which marking they create
    createMarking(center, directionVector) {
        return center;
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

        const seg = getNearestSegment(
            this.mouse,
            this.targetSegments,
            this.world.roadWidth / 2
        );

        this.intent = null;
        if (seg) {
            const proj = seg.projectPoint(this.mouse);
            if (proj.offset >= 0 && proj.offset <= 1) {
                this.intent = this.createMarking(proj.point, seg.directionVector());
            }
        }
    }

    #handleMouseDown(evt) {
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
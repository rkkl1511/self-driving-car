class StartEditor extends MarkingEditor {
    constructor(viewport, world) {
        super(viewport, world, world.graph.segments);
        this.flipped = false;
        this.boundKeyDown = this.#handleKeyDown.bind(this);
    }

    enable() {
        super.enable();
        window.addEventListener("keydown", this.boundKeyDown);
    }

    disable() {
        super.disable();
        window.removeEventListener("keydown", this.boundKeyDown);
    }

    #handleKeyDown(evt) {
        // Press F to flip the facing direction
        if (evt.key === "f" || evt.key === "F") {
            this.flipped = !this.flipped;
            if (this.intent) {
                this.intent = new Start(
                    this.intent.center,
                    scale(this.intent.directionVector, -1),
                    this.intent.width,
                    this.intent.height
                );
            }
        }
    }

    createMarking(center, directionVector) {
        const dir = this.flipped ? scale(directionVector, -1) : directionVector;
        return new Start(
            center,
            dir,
            this.world.roadWidth * 0.5,
            this.world.roadWidth * 0.6
        );
    }
}
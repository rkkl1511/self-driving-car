class LightEditor extends MarkingEditor {
    constructor(viewport, world) {
        super(viewport, world, world.graph.segments);
    }

    createMarking(center, directionVector) {
        return new Light(
            center,
            directionVector,
            this.world.roadWidth * 0.7,
            this.world.roadWidth * 0.3
        );
    }
}
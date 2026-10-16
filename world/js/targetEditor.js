class TargetEditor extends MarkingEditor {
    constructor(viewport, world) {
        super(viewport, world, world.graph.segments);
    }

    createMarking(center, directionVector) {
        return new Target(
            center,
            directionVector,
            this.world.roadWidth * 0.5,
            this.world.roadWidth * 0.5
        );
    }
}
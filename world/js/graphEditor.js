class GraphEditor {
    constructor(canvas, graph) {
        this.canvas = canvas;
        this.graph = graph;
        this.ctx = canvas.getContext("2d");

        this.selected = null;
        this.hovered = null;
        this.dragging = false;
        this.mouse = null;

        this.#addEventListeners();
    }

    #addEventListeners() {
        this.canvas.addEventListener("mousedown", this.#handleMouseDown.bind(this));
        this.canvas.addEventListener("mousemove", this.#handleMouseMove.bind(this));
        this.canvas.addEventListener("contextmenu", (evt) => evt.preventDefault());
        window.addEventListener("mouseup", () => (this.dragging = false));
    }

    #updateMouse(evt) {
        this.mouse = new Point(evt.offsetX, evt.offsetY);
        this.hovered = getNearestPoint(this.mouse, this.graph.points, 10);
    }

    #handleMouseDown(evt) {
        this.#updateMouse(evt);

        // Right click: deselect, or delete the hovered point
        if (evt.button === 2) {
            if (this.selected) {
                this.selected = null;
            } else if (this.hovered) {
                this.#removePoint(this.hovered);
            }
            return;
        }

        // Left click
        if (evt.button === 0) {
            if (this.hovered) {
                this.#select(this.hovered);
                this.dragging = true;
                return;
            }
            this.graph.addPoint(this.mouse);
            this.#select(this.mouse);
            this.hovered = this.mouse;
        }
    }

    #handleMouseMove(evt) {
        this.#updateMouse(evt);
        if (this.dragging && this.selected) {
            this.selected.x = this.mouse.x;
            this.selected.y = this.mouse.y;
        }
    }

    #select(point) {
        // If something was already selected, connect it to the new point
        if (this.selected) {
            this.graph.tryAddSegment(new Segment(this.selected, point));
        }
        this.selected = point;
    }

    #removePoint(point) {
        this.graph.removePoint(point);
        this.hovered = null;
        if (this.selected === point) {
            this.selected = null;
        }
    }

    dispose() {
        this.graph.dispose();
        this.selected = null;
        this.hovered = null;
        this.dragging = false;
    }

    display() {
        this.graph.draw(this.ctx);

        if (this.hovered) {
            this.hovered.draw(this.ctx, { fill: true });
        }

        if (this.selected) {
            // Dashed preview line from the selected point to the mouse (or hovered point)
            const intent = this.hovered ? this.hovered : this.mouse;
            new Segment(this.selected, intent).draw(this.ctx, { dash: [3, 3] });
            this.selected.draw(this.ctx, { outline: true });
        }
    }
}
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
resize();
window.addEventListener("resize", resize);

if (typeof WORLD_DATA === "undefined" || !WORLD_DATA) {
    alert("No world found. Open the editor, click Export, and replace saved-world.js with the downloaded file.");
    throw new Error("No exported world");
}

// Rebuild the world from the exported file
const graph = Graph.load(WORLD_DATA.graph);
const world = new World(
    graph,
    WORLD_DATA.roadWidth,
    WORLD_DATA.roadRoundness,
    WORLD_DATA.buildingWidth,
    WORLD_DATA.buildingMinLength,
    WORLD_DATA.spacing,
    50,
    300
);
for (const m of WORLD_DATA.markings) {
    world.markings.push(Marking.load(m));
}

if (graph.segments.length === 0) {
    alert("Your world has no roads. Draw some in the editor first.");
    throw new Error("Empty world");
}

// The car's sensors expect borders as [point, point] pairs
const borders = world.roadBorders.map((s) => [s.p1, s.p2]);

let zoom = 1.5;
let car = createCar();

animate();

function getSpawn() {
    // Use the most recently placed Start marker if there is one
    const starts = world.markings.filter((m) => m instanceof Start);
    if (starts.length > 0) {
        const s = starts[starts.length - 1];
        return {
            pos: s.center,
            angle: Math.atan2(-s.directionVector.x, -s.directionVector.y),
        };
    }
    // Otherwise fall back to the middle of the first road
    const seg = graph.segments[0];
    const dir = seg.directionVector();
    return {
        pos: average(seg.p1, seg.p2),
        angle: Math.atan2(-dir.x, -dir.y),
    };
}

function createCar() {
    const { pos, angle } = getSpawn();
    const car = new Car(pos.x, pos.y, 18, 32, "KEYS", 3);
    car.angle = angle;
    return car;
}

function animate() {
    world.update();
    car.update(borders, []);

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.save();
    // Camera: keep the car in the middle of the screen
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.scale(zoom, zoom);
    ctx.translate(-car.x, -car.y);

    world.draw(ctx);
    car.draw(ctx, true);

    ctx.restore();
    requestAnimationFrame(animate);
}

window.addEventListener("keydown", (evt) => {
    if (evt.key === "r" || evt.key === "R") {
        car = createCar();
    }
});

canvas.addEventListener(
    "wheel",
    (evt) => {
        evt.preventDefault();
        zoom *= evt.deltaY < 0 ? 1.1 : 0.9;
        zoom = Math.max(0.5, Math.min(4, zoom));
    },
    { passive: false }
);
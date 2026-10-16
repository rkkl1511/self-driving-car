const myCanvas = document.getElementById("myCanvas");
myCanvas.width = 600;
myCanvas.height = 600;

const ctx = myCanvas.getContext("2d");

// Load the saved world. Fall back to the older roads-only save if there is one.
const worldString = localStorage.getItem("world");
const worldInfo = worldString ? JSON.parse(worldString) : null;
const oldGraphString = localStorage.getItem("graph");
const graphInfo = worldInfo
    ? worldInfo.graph
    : oldGraphString
        ? JSON.parse(oldGraphString)
        : null;
const graph = graphInfo ? Graph.load(graphInfo) : new Graph();

const viewport = new Viewport(myCanvas);
const world = new World(graph, 60);
if (worldInfo) {
    for (const m of worldInfo.markings) {
        world.markings.push(Marking.load(m));
    }
}

const graphEditor = new GraphEditor(viewport, graph);
const stopEditor = new StopEditor(viewport, world);
const crossingEditor = new CrossingEditor(viewport, world);
const lightEditor = new LightEditor(viewport, world);

const tools = {
    graph: { button: document.getElementById("graphBtn"), editor: graphEditor },
    stop: { button: document.getElementById("stopBtn"), editor: stopEditor },
    crossing: {
        button: document.getElementById("crossingBtn"),
        editor: crossingEditor,
    },
    light: { button: document.getElementById("lightBtn"), editor: lightEditor },
};

let oldGraphHash = graph.hash();

setMode("graph");
animate();

function animate() {
    viewport.reset();

    if (graph.hash() != oldGraphHash) {
        world.generate();
        oldGraphHash = graph.hash();
    }

    world.update();
    world.draw(ctx);
    for (const tool of Object.values(tools)) {
        tool.editor.display();
    }
    requestAnimationFrame(animate);
}

function dispose() {
    graphEditor.dispose();
}

function save() {
    const info = {
        graph: graph,
        markings: world.markings.map((m) => ({
            type: m.type,
            center: m.center,
            directionVector: m.directionVector,
            width: m.width,
            height: m.height,
        })),
    };
    localStorage.setItem("world", JSON.stringify(info));
}

function setMode(mode) {
    disableEditors();
    tools[mode].button.classList.add("active");
    tools[mode].editor.enable();
}

function disableEditors() {
    for (const tool of Object.values(tools)) {
        tool.button.classList.remove("active");
        tool.editor.disable();
    }
}
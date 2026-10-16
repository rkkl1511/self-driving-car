const myCanvas = document.getElementById("myCanvas");
myCanvas.width = 600;
myCanvas.height = 600;

const ctx = myCanvas.getContext("2d");

const graphString = localStorage.getItem("graph");
const graphInfo = graphString ? JSON.parse(graphString) : null;
const graph = graphInfo ? Graph.load(graphInfo) : new Graph();

const viewport = new Viewport(myCanvas);
const world = new World(graph, 60);
const graphEditor = new GraphEditor(viewport, graph);
const stopEditor = new StopEditor(viewport, world);

const tools = {
    graph: { button: document.getElementById("graphBtn"), editor: graphEditor },
    stop: { button: document.getElementById("stopBtn"), editor: stopEditor },
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
    localStorage.setItem("graph", JSON.stringify(graph));
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
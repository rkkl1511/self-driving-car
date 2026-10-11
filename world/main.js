const myCanvas = document.getElementById("myCanvas");
myCanvas.width = 600;
myCanvas.height = 600;

const ctx = myCanvas.getContext("2d");

const graphString = localStorage.getItem("graph");
const graphInfo = graphString ? JSON.parse(graphString) : null;
const graph = graphInfo ? Graph.load(graphInfo) : new Graph();
const graphEditor = new GraphEditor(myCanvas, graph);
const world = new World(graph, 60, 10, 40, 40, 20);

let oldGraphHash = graph.hash();

animate();

function animate() {
    ctx.clearRect(0, 0, myCanvas.width, myCanvas.height);

    if (graph.hash() != oldGraphHash) {
        world.generate();
        oldGraphHash = graph.hash();
    }

    world.draw(ctx);
    graphEditor.display();
    requestAnimationFrame(animate);
}

function dispose() {
    graphEditor.dispose();
}

function save() {
    localStorage.setItem("graph", JSON.stringify(graph));
}
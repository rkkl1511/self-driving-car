const myCanvas = document.getElementById("myCanvas");
myCanvas.width = 600;
myCanvas.height = 600;

const ctx = myCanvas.getContext("2d");

const graph = new Graph();
const graphEditor = new GraphEditor(myCanvas, graph);

animate();

function animate() {
    ctx.clearRect(0, 0, myCanvas.width, myCanvas.height);
    graphEditor.display();
    requestAnimationFrame(animate);
}

function dispose() {
    graphEditor.dispose();
}
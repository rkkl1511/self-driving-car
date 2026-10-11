const canvas = document.getElementById("myCanvas");
canvas.width = 200;

const ctx = canvas.getContext("2d");
const road = new Road(canvas.width / 2, canvas.width * 0.9);

const N = 100;
const STALL_FRAMES = 500; // about 15 seconds without progress ends the generation
const FINISH_Y = -3000; // passing this line also ends the generation

let cars;
let traffic;
let bestCar;
let generation = 1;
let frameCount = 0;
let lastProgressFrame = 0;
let progressY = Infinity;

startGeneration();
animate();

function createTraffic() {
    return [
        new Car(road.getLaneCenter(1), -100, 30, 50, "DUMMY", 2, "red"),
        new Car(road.getLaneCenter(0), -300, 30, 50, "DUMMY", 2, "red"),
        new Car(road.getLaneCenter(2), -300, 30, 50, "DUMMY", 2, "red"),
        new Car(road.getLaneCenter(0), -500, 30, 50, "DUMMY", 2, "red"),
        new Car(road.getLaneCenter(1), -500, 30, 50, "DUMMY", 2, "red"),
        new Car(road.getLaneCenter(1), -700, 30, 50, "DUMMY", 2, "red"),
        new Car(road.getLaneCenter(2), -700, 30, 50, "DUMMY", 2, "red"),
    ];
}

function generateCars(N) {
    const cars = [];
    for (let i = 0; i < N; i++) {
        cars.push(new Car(road.getLaneCenter(1), 100, 30, 50, "AI"));
    }
    return cars;
}

function startGeneration() {
    cars = generateCars(N);
    traffic = createTraffic();
    bestCar = cars[0];

    frameCount = 0;
    lastProgressFrame = 0;
    progressY = Infinity;

    const saved = localStorage.getItem("bestBrain");
    if (saved) {
        for (let i = 0; i < cars.length; i++) {
            cars[i].brain = JSON.parse(saved);
            if (i !== 0) {
                NeuralNetwork.mutate(cars[i].brain, 0.1);
            }
        }
    }
}

function endGeneration() {
    // The furthest car of the whole generation, even if it later crashed
    const furthest = cars.reduce((a, b) => (b.y < a.y ? b : a));
    localStorage.setItem("bestBrain", JSON.stringify(furthest.brain));
    localStorage.setItem("bestDistance", Math.round(100 - furthest.y));

    generation++;
    startGeneration();
}

function save() {
    localStorage.setItem("bestBrain", JSON.stringify(bestCar.brain));
}

function discard() {
    localStorage.removeItem("bestBrain");
    localStorage.removeItem("bestDistance");
    generation = 1;
    startGeneration();
}

function animate() {
    frameCount++;

    for (let i = 0; i < traffic.length; i++) {
        traffic[i].update(road.borders, []);
    }
    for (let i = 0; i < cars.length; i++) {
        cars[i].update(road.borders, traffic);
    }

    const alive = cars.filter((c) => !c.damaged);
    const pool = alive.length > 0 ? alive : cars;
    bestCar = pool.reduce((a, b) => (b.y < a.y ? b : a));

    // Track progress to detect cars that are just hovering
    if (bestCar.y < progressY - 1) {
        progressY = bestCar.y;
        lastProgressFrame = frameCount;
    }

    const stalled = frameCount - lastProgressFrame > STALL_FRAMES;
    const finished = bestCar.y < FINISH_Y;
    if (alive.length === 0 || stalled || finished) {
        endGeneration();
        requestAnimationFrame(animate);
        return;
    }

    document.getElementById("stats").innerHTML =
        "Generation: " + generation + "<br>" +
        "Alive: " + alive.length + " / " + N + "<br>" +
        "Distance: " + Math.round(100 - bestCar.y) + "<br>" +
        "Best ever: " + (localStorage.getItem("bestDistance") || 0);

    canvas.height = window.innerHeight;

    ctx.save();
    ctx.translate(0, -bestCar.y + canvas.height * 0.7);

    road.draw(ctx);
    for (let i = 0; i < traffic.length; i++) {
        traffic[i].draw(ctx);
    }

    ctx.globalAlpha = 0.2;
    for (let i = 0; i < cars.length; i++) {
        cars[i].draw(ctx);
    }
    ctx.globalAlpha = 1;
    bestCar.draw(ctx, true);

    ctx.restore();
    requestAnimationFrame(animate);
}
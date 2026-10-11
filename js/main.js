const canvas = document.getElementById("myCanvas");
canvas.width = 200;

const ctx = canvas.getContext("2d");
const road = new Road(canvas.width / 2, canvas.width * 0.9);

const N = 100;
const cars = generateCars(N);
let bestCar = cars[0];

const traffic = [
    new Car(road.getLaneCenter(1), -100, 30, 50, "DUMMY", 2, "red"),
    new Car(road.getLaneCenter(0), -300, 30, 50, "DUMMY", 2, "red"),
    new Car(road.getLaneCenter(2), -300, 30, 50, "DUMMY", 2, "red"),
    new Car(road.getLaneCenter(0), -500, 30, 50, "DUMMY", 2, "red"),
    new Car(road.getLaneCenter(1), -500, 30, 50, "DUMMY", 2, "red"),
    new Car(road.getLaneCenter(1), -700, 30, 50, "DUMMY", 2, "red"),
    new Car(road.getLaneCenter(2), -700, 30, 50, "DUMMY", 2, "red"),
];

animate();

function generateCars(N) {
    const cars = [];
    for (let i = 0; i < N; i++) {
        cars.push(new Car(road.getLaneCenter(1), 100, 30, 50, "AI"));
    }
    return cars;
}

function animate() {
    for (let i = 0; i < traffic.length; i++) {
        traffic[i].update(road.borders, []);
    }
    for (let i = 0; i < cars.length; i++) {
        cars[i].update(road.borders, traffic);
    }

    // The best car is the one that has gone furthest up the road (smallest y)
    const alive = cars.filter((c) => !c.damaged);
    const pool = alive.length > 0 ? alive : cars;
    bestCar = pool.find((c) => c.y === Math.min(...pool.map((c) => c.y)));

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
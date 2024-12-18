
const gc = document.querySelector("#gameCanvas");
const cwidth = gc.width;
const cheight = gc.height;
const ballRadius = 30;
const ballRadiussq = (2*ballRadius) ** 2
const friction = 0.005;

let balls = [];

function draw() {

    ctx.drawImage(table, 0, 0, cwidth, cheight);

    for (var i = 0; i < balls.length; i++) {
        balls[i]["vx"] -= balls[i]["vx"] * friction;
        balls[i]["vy"] -= balls[i]["vy"] * friction;

        balls[i]["x"] += balls[i]["vx"];
        balls[i]["y"] += balls[i]["vy"];

        if (balls[i]["x"]+ballRadius > cwidth) {
            balls[i]["x"] = 2*cwidth - balls[i]["x"] - 2*ballRadius;
            balls[i]["vx"] *= -1;
        }
        if (balls[i]["y"]+ballRadius > cheight) {
            balls[i]["y"] = 2*cheight - balls[i]["y"] - 2*ballRadius;
            balls[i]["vy"] *= -1;
        }
        if (balls[i]["x"]-ballRadius < 0) {
            balls[i]["x"] = -balls[i]["x"] + 2*ballRadius;
            balls[i]["vx"] *= -1;
        }
        if (balls[i]["y"]-ballRadius < 0) {
            balls[i]["y"] = -balls[i]["y"] + 2*ballRadius;
            balls[i]["vy"] *= -1;
        }

        for (var j = 0; j < balls.length; j++) {
            if (i == j) { continue; }

            if ((balls[i]["x"] - balls[j]["x"])**2 + (balls[i]["y"] - balls[j]["y"])**2 < ballRadiussq) {
                balls[i]["vx"] *= -1;
                balls[i]["vy"] *= -1;
                balls[j]["vx"] *= -1;
                balls[j]["vy"] *= -1;
            }
        }
    }

    for (var i = 0; i < balls.length; i++) {

        ctx.beginPath();
        ctx.arc(balls[i]["x"], balls[i]["y"], ballRadius, 0, 2 * Math.PI, false);
        ctx.fillStyle = 'green';
        ctx.fill();
        ctx.lineWidth = 5;
        ctx.strokeStyle = '#003300';
        ctx.stroke();
    }

    window.requestAnimationFrame(draw);
}

function randInt(a, b) {
    return Math.floor(Math.random() * (b - a) + a);
}

if (gc.getContext) {
    var ctx = gc.getContext("2d");
    var table = new Image();
    table.src = "table.jpg";

    for (var i = 0; i < 8; i++) {
        balls.push({
            "x": randInt(10, cwidth-10),
            "y": randInt(10, cwidth-10),
            "vx": randInt(2, 10),
            "vy": randInt(2, 10),
            });
    }
    // balls.push({"x": 20, "y": 50, "vx": 15, "vy": 8});
    // balls.push({"x": 300, "y": 60, "vx": 4, "vy": 19});

    table.addEventListener("load", () => {
        draw();
    });
}

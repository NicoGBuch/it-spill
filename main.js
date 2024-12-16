
const gc = document.querySelector("#gameCanvas");
const cwidth = gc.width;
const cheight = gc.height;

let balls = [];

function draw() {

    ctx.drawImage(table, 0, 0, cwidth, cheight);

    for (var i = 0; i < balls.length; i++) {

        balls[i]["x"] += 1;
        balls[i]["y"] += 1;

        ctx.beginPath();
        ctx.arc(balls[i]["x"], balls[i]["y"], 40, 0, 2 * Math.PI, false);
        ctx.fillStyle = 'green';
        ctx.fill();
        ctx.lineWidth = 5;
        ctx.strokeStyle = '#003300';
        ctx.stroke();
    }

    window.requestAnimationFrame(draw);
}

if (gc.getContext) {
    var ctx = gc.getContext("2d");
    var table = new Image();
    table.src = "table.jpg";

    // for (var i = 0; i < 32; i++) {
    //     balls.push((0, 50), (300, 20));        
    // }
    balls.push({"x": 20, "y": 50});
    balls.push({"x": 300, "y": 60});

    table.addEventListener("load", () => {
        draw();
    });
}


const gc = document.querySelector("#gameCanvas");
const cwidth = gc.width;
const cheight = gc.height;

function draw() {
    ctx.drawImage(table, 0, 0, cwidth, cheight);

    ctx.beginPath();
    ctx.arc(0, 0, 40, 0, 2 * Math.PI, false);
    ctx.fillStyle = 'green';
    ctx.fill();
    ctx.lineWidth = 5;
    ctx.strokeStyle = '#003300';
    ctx.stroke();
}

if (gc.getContext) {
    var ctx = gc.getContext("2d");
    var table = new Image();
    table.src = "table.jpg";

    table.addEventListener("load", () => {
        draw();
    });
}


const gc = document.querySelector("#gameCanvas");
const gcRect = gc.getBoundingClientRect();
const cwidth = gc.width;
const cheight = gc.height;
const ballRadius = 30;
const ballRadiussq = (2*ballRadius) ** 2
const friction = 0.1;

let balls = [{
    "x": cwidth/2,
    "y": cheight/2,
    "vx": 2,
    "vy": 2,
    }];

let mouseX = 0;
let mouseY = 0;

function onMouse(evt) {
    mouseX = evt.clientX - gcRect.left;
    mouseY = evt.clientY - gcRect.top;
}

function draw() {

    ctx.drawImage(table, 0, 0, cwidth, cheight);

    let vSum = 0;

    for (var i = 0; i < balls.length; i++) {
        const speed = Math.sqrt(balls[i]["vx"] ** 2 + balls[i]["vy"] ** 2);
        if (speed == 0) { continue; }

        balls[i]["vx"] -= friction * balls[i]["vx"] / speed;
        balls[i]["vy"] -= friction * balls[i]["vy"] / speed;

        if (Math.abs(balls[i]["vx"]) < 0.1) { balls[i]["vx"] = 0; }
        if (Math.abs(balls[i]["vy"]) < 0.1) { balls[i]["vy"] = 0; }
        vSum += balls[i]["vx"] + balls[i]["vy"];

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
    }

    if (vSum != 0) {
        for (var i = 0; i < balls.length; i++) {
            for (var j = 0; j < balls.length; j++) {
                if (i == j) { continue; }
    
                const dx = balls[i]["x"] - balls[j]["x"];
                const dy = balls[i]["y"] - balls[j]["y"];
                const distancesq = dx**2 + dy**2;
    
                if (distancesq < ballRadiussq && distancesq != 0) {
                    const distance = Math.sqrt(distancesq);
                    if (distance == 0) { continue; }
    
                    const nx = dx / distance; // Normalisert kollisjonsvektor (x-komponent)
                    const ny = dy / distance; // Normalisert kollisjonsvektor (y-komponent)
                    
                    // Finn den relative hastigheten
                    const dvx = balls[i]["vx"] - balls[j]["vx"];
                    const dvy = balls[i]["vy"] - balls[j]["vy"];
                    
                    // Projiser den relative hastigheten på kollisjonsvektoren
                    const dotProduct = dvx * nx + dvy * ny;
                    
                    // Bare fortsett hvis ballene beveger seg mot hverandre
                    if (dotProduct > 0) continue;
            
                    // Bevaring av bevegelsesmengde (antar samme masse for begge baller)
                    const impulseX = 1 * dotProduct * nx;
                    const impulseY = 1 * dotProduct * ny;
            
                    // Oppdater hastighetene til ballene
                    balls[i]["vx"] -= impulseX;
                    balls[i]["vy"] -= impulseY;
                    balls[j]["vx"] += impulseX;
                    balls[j]["vy"] += impulseY;
            
                    // Separasjon for å unngå overlapping
                    const overlap = 2*ballRadius - distance;
                    const separationX = overlap * nx / 2;
                    const separationY = overlap * ny / 2;
                    
                    balls[i]["x"] -= separationX;
                    balls[i]["y"] -= separationY;
                    balls[j]["x"] += separationX;
                    balls[j]["y"] += separationY;
                }
            }
        }
    }

    for (var i = 0; i < balls.length; i++) {
        ctx.beginPath();
        ctx.arc(balls[i]["x"], balls[i]["y"], ballRadius, 0, 2 * Math.PI, false);

        if (i == 0) { ctx.fillStyle = 'white'; }
        else        { ctx.fillStyle = 'green'; }

        ctx.fill();
        ctx.lineWidth = 5;
        ctx.strokeStyle = '#003300';
        ctx.stroke();
    }

    if (vSum == 0) {
        ctx.rect(mouseX, mouseY, balls[0]['x'] - mouseX, balls[0]['y'] - mouseY);

        ctx.beginPath();
        ctx.arc(mouseX, mouseY, 10, 0, 2 * Math.PI, false);
        ctx.fillStyle = 'white';
        ctx.fill();
        ctx.lineWidth = 2;
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

    table.addEventListener("load", () => {
        draw();
    });
}

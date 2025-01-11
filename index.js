
const gc = document.querySelector("#gameCanvas");

gc.width  = window.innerWidth;
gc.height = window.innerHeight;

const gcRect = gc.getBoundingClientRect();
const cwidth = gc.width;
const cheight = gc.height;
const cpadding = 100;
const maxPixDist = Math.sqrt(cwidth*cwidth + cheight*cheight);

const ballRadius = 20;
const ballCount = 14;
const friction = 0.1;
const timestep = 2;
const cueStrength = 0.1;

const ballRadiussq = (2*ballRadius) ** 2
const ballHitSound = new Audio('ball-hit.mp3');

let balls = [{
    "x": cwidth/2,
    "y": cheight/2,
    "vx": 2,
    "vy": 2,
    "c": "white"
    }];

let mouseX = 0;
let mouseY = 0;
let ctx = undefined;
let gameState = "balls";

function onMouse(evt) {
    mouseX = evt.clientX - gcRect.left;
    mouseY = evt.clientY - gcRect.top;
}

function onMouseDown(evt) {
    if (gameState != 'cue') { return; }

    var cueX = mouseX - balls[0]['x'] - ballRadius/2;
    var cueY = mouseY - balls[0]['y'] - ballRadius/2;

    var distSq = cueX*cueX + cueY*cueY;
    var dist = Math.sqrt(distSq);
    var sigmoid = (1 / (1 + Math.exp(-dist/maxPixDist)));
    cueX *= 1 - (0.05 + 0.95*sigmoid);
    cueY *= 1 - (0.05 + 0.95*sigmoid);

    balls[0]['vx'] -= cueStrength * cueX;
    balls[0]['vy'] -= cueStrength * cueY;

    gameState = 'balls';
}

function updateGame() {
    let vSum = 0;

    for (var i = 0; i < balls.length; i++) {
        const speed = Math.sqrt((balls[i]["vx"]/timestep) ** 2 + (balls[i]["vy"]/timestep) ** 2);
        if (speed == 0) { continue; }

        balls[i]["vx"] -= (friction/timestep) * (balls[i]["vx"]/timestep) / speed;
        balls[i]["vy"] -= (friction/timestep) * (balls[i]["vy"]/timestep) / speed;

        if (Math.abs(balls[i]["vx"]/timestep) < 0.1) { balls[i]["vx"] = 0; }
        if (Math.abs(balls[i]["vy"]/timestep) < 0.1) { balls[i]["vy"] = 0; }
        vSum += balls[i]["vx"] + balls[i]["vy"];

        balls[i]["x"] += balls[i]["vx"] / timestep;
        balls[i]["y"] += balls[i]["vy"] / timestep;

        if (balls[i]["x"]+ballRadius > cwidth-cpadding) {
            balls[i]["x"] = 2*(cwidth-cpadding) - balls[i]["x"] - 2*ballRadius;
            balls[i]["vx"] *= -1;
        }
        if (balls[i]["y"]+ballRadius > cheight-cpadding) {
            balls[i]["y"] = 2*(cheight-cpadding) - balls[i]["y"] - 2*ballRadius;
            balls[i]["vy"] *= -1;
        }
        if (balls[i]["x"]-ballRadius < cpadding) {
            balls[i]["x"] = 2*cpadding - balls[i]["x"] + 2*ballRadius;
            balls[i]["vx"] *= -1;
        }
        if (balls[i]["y"]-ballRadius < cpadding) {
            balls[i]["y"] = 2*cpadding - balls[i]["y"] + 2*ballRadius;
            balls[i]["vy"] *= -1;
        }
    }

    if (vSum == 0) {
        return 0;
    }

    for (var i = 0; i < balls.length; i++) {
        for (var j = 0; j < balls.length; j++) {
            if (i == j) { continue; }

            const dx = balls[i]["x"] - balls[j]["x"];
            const dy = balls[i]["y"] - balls[j]["y"];
            const distancesq = dx**2 + dy**2;

            if (!(distancesq < ballRadiussq && distancesq != 0)) { continue; }

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

            ballHitSound.cloneNode(true).play();
    
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

    return vSum;
}

function draw() {

    ctx.drawImage(tableImg, 0, 0, gc.width, gc.height);

    if (gameState == 'balls') {
        let vSum = 0;
        for (var i = 0; i < timestep; i++) {
            vSum = updateGame();
        }

        if (vSum == 0) {
            gameState = 'cue';
        }
    }

    for (var i = 0; i < balls.length; i++) {
        ctx.beginPath();
        ctx.arc(balls[i]['x'], balls[i]['y'], ballRadius, 0, 2 * Math.PI, false);
        ctx.fillStyle = balls[i]['c'];

        ctx.fill();
        ctx.lineWidth = 5;
        ctx.strokeStyle = '#003300';
        ctx.stroke();
    }

    if (gameState == 'cue') {
        ctx.beginPath();
        ctx.arc(mouseX, mouseY, 5, 0, 2 * Math.PI, false);
        ctx.fillStyle = 'white';
        ctx.fill();
        ctx.lineWidth = 2;
        ctx.strokeStyle = '#003300';
        ctx.stroke();

        var width = cueImg.width/1.5;
        var height = cueImg.height/2;
        var angle = Math.atan((mouseY - balls[0]['y']) / (mouseX - balls[0]['x']));
        angle += Math.PI/2;

        if (mouseX >= balls[0]['x']) {
            angle += Math.PI;
        }

        var cueX = mouseX - balls[0]['x'];
        var cueY = mouseY - balls[0]['y'];

        var distSq = cueX*cueX + cueY*cueY;
        var dist = Math.sqrt(distSq);
        var sigmoid = (1 / (1 + Math.exp(-dist/maxPixDist)));
        cueX *= 1 - (0.05 + 0.95*sigmoid);
        cueY *= 1 - (0.05 + 0.95*sigmoid);

        cueX += balls[0]['x'];
        cueY += balls[0]['y'];

        ctx.translate(cueX, cueY);
        ctx.rotate(angle);
        ctx.drawImage(cueImg, -width/2, ballRadius, width, height);
        ctx.rotate(-angle);
        ctx.translate(-cueX, -cueY);
        
        // ctx.drawImage(cueImg, mouseX, mouseY, 50/2, 520/2);
        // ctx.beginPath();
        // ctx.strokeStyle = "green";
        // ctx.moveTo(mouseX, mouseY);
        // ctx.lineTo(balls[0]['x'], balls[0]['y']);
        // ctx.stroke();
    }

    window.requestAnimationFrame(draw);
}

function randInt(a, b) {
    return Math.floor(Math.random() * (b - a) + a);
}

function startGame() {

    document.querySelector("#gameCanvas").classList.remove("invisible");
    document.querySelector("#introScreen").classList.add("startAnimation");

    if (gc.getContext) {
        ctx = gc.getContext("2d");

        tableImg = new Image();
        tableImg.src = "table.jpg";
    
        cueImg = new Image();
        cueImg.src = "cue.png";
    
        for (var i = 0; i < ballCount; i++) {
            let c = "red";
            if (i >= ballCount/2) { c = "blue"; }
            
            balls.push({
                "x": randInt(10, cwidth-10),
                "y": randInt(10, cwidth-10),
                "vx": randInt(4, 14),
                "vy": randInt(4, 14),
                "c": c,
                });
        }
    
        tableImg.addEventListener("load", () => {
            draw();
        });
    }
}

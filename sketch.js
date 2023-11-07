let cartPos;
let endPos;
let endOldPos;
let stickLength = 200;
let endAcceleration;

let cartWidth = 80;
let cartHeight = 40;
let wheelRadius = 10;

let gravity;

let hasPlayedYet = false;
let playing;
let playButtonPressed = false;
let mouseReleasedAfterLoss = false;

let hoveringTrack = false;

let highscore = 0;

let canvas;

function setup() {
  canvas = createCanvas(innerWidth*0.7, innerHeight*0.7);
  canvas.parent('canvas-parent');
  
  if (localStorage.getItem('highscore') === null) {
    localStorage.setItem('highscore', 0);
  }
}

function windowResized() {
  resizeCanvas(innerWidth*0.7, innerHeight*0.7);
}

function initializeGameplay() {
  playing = false;

  cartPos = createVector(mouseX, height*0.7);
  endPos = createVector(mouseX + (random() < 0.5 ? -10 : 10), height/2 - stickLength);
  endOldPos = endPos.copy();
  
  gravity = createVector(0, 0);

  highscore = getHighscore();
}

function lost() {
  playing = false;
  playButtonPressed = false;
  mouseReleasedAfterLoss = false;

  setHighscore(gravity.y);
}

function draw() {
  background(213, 238, 245);

  if (!hasPlayedYet) {
    background(100, 100, 100, 50);
    textAlign(CENTER, CENTER);
    noStroke();
    fill(0);
    textSize(30);
    text('Tap anywhere to start.', width/2, height/2);
  } else if (!playing) {
    noStroke();
    fill(100, 100, 100, 100);
    rect(0, height/2 - 40, width, 80);
    textAlign(CENTER, CENTER);
    noStroke();
    fill(0, 0, 0, 200);
    textSize(25);
    text('Tap anywhere to play again.', width/2, height/2);
  }

  if (mousePressedInCanvas() && mouseReleasedAfterLoss) { 
    playButtonPressed = true;
    hasPlayedYet = true;
  }

  if (!playing && playButtonPressed) {
    initializeGameplay();
    playing = true;
  }

  if (!mousePressedInCanvas() && !playing) {
    mouseReleasedAfterLoss = true;
  }

  if (!hasPlayedYet) {
    return;
  }

  drawSun();
  
  drawGravityText();
  drawHighscoreText();
  
  drawCartLine();
  drawCart();
  drawStick();
  
  handleNewFrame();
  
  let substeps = 8;
  for (let substep = 0; substep < substeps; substep++) {
    if (playing) {
      handleControls();
    }
    applyConstraints();
    applyVerlet(1/substeps, 0.1);
  }

  if ((endPos.y >= cartPos.y) && playing) {
    lost();
  }

  if (playing) {
    gravity.y += 0.01;
  }
}

function mousePressedInCanvas() {
  return (mouseIsPressed && (mouseX === constrain(mouseX, 0, width)) && (mouseY === constrain(mouseY, 0, height)))
}

function handleNewFrame() {
  endAcceleration = gravity.copy();
}

function applyVerlet(dt, friction) {
  endOldPosCopy = endOldPos.copy();
  endOldPos = endPos.copy();
  endPos = p5.Vector.add(p5.Vector.sub(endPos.mult(2), endOldPosCopy), endAcceleration.mult(dt**2).mult(1 - friction));
}

function handleControls() {
  cartPos.x = lerp(cartPos.x, mouseX, 0.5);
}

function applyConstraints() {  
  cartPos.x = constrain(cartPos.x, cartWidth/2, width - cartWidth/2)
  let stick = p5.Vector.sub(endPos, cartPos);
  stick.setMag(stickLength);
  endPos = p5.Vector.add(cartPos, stick);

  if (!hoveringTrack) {
    if (endPos.y > cartPos.y + cartHeight/2 + wheelRadius) {
      endPos.y = cartPos.y + cartHeight/2 + wheelRadius;
    }
  }
}

function drawGravityText() {
  textAlign(LEFT, TOP);
  textSize(32);
  fill(0);
  noStroke();
  text(`Gravity: ${round(gravity.y, 2)}`, 10, 10);
}

function drawHighscoreText() {
  textAlign(LEFT, TOP);
  textSize(32);
  fill(0);
  noStroke();
  text(`Your best: ${round(max(highscore, gravity.y), 2)}`, 10, 50);
}

function drawCartLine() {
  let strokeThickness = 3;
  
  strokeWeight(strokeThickness);
  stroke(50);
  
  let lineY = cartPos.y + cartHeight/2 + wheelRadius/2 + 8;
  
  if (hoveringTrack) {
    line(0, lineY, width, lineY);
  } else {
    fill(39, 143, 56);
    rect(-strokeThickness, lineY, width + strokeThickness*2, height - lineY + strokeThickness/2);
  }
}

function drawCart() {
  fill(200);
  stroke(0);
  strokeWeight(8);
  circle(cartPos.x - cartWidth/4, cartPos.y + 20, wheelRadius*2);
  circle(cartPos.x + cartWidth/4, cartPos.y + 20, wheelRadius*2);

  noStroke();
  fill(160, 80, 45);
  rect(cartPos.x - cartWidth/2, cartPos.y - cartHeight/2, cartWidth, cartHeight);
}

function drawStick() {
  strokeWeight(10);
  stroke(230, 190, 145);
  line(cartPos.x, cartPos.y, endPos.x, endPos.y);
}

function drawSun() {
  strokeWeight(3);
  stroke(0, 0, 0, 200);
  fill(250, 250, 0, 200);

  let sunCenter = createVector(width - 70, 70);
  
  circle(sunCenter.x, sunCenter.y, 50, 50);

  let totalRays = 10;
  for (let rayI = 0; rayI < totalRays; rayI++) {
    let rayVec = createVector(0, 20 + 3*cos(millis()/400)).setHeading((rayI / totalRays) * 2*PI);
    let rayStart = p5.Vector.normalize(rayVec);
    rayStart.mult(40);
    line(sunCenter.x + rayStart.x, sunCenter.y + rayStart.y, sunCenter.x + rayStart.x + rayVec.x, sunCenter.y + rayStart.y + rayVec.y);
  }
}

function getHighscore() {  
  return localStorage.getItem('highscore');
}

function setHighscore(score) {
  if (score > getHighscore()) {
    localStorage.setItem('highscore', score);
  }
}
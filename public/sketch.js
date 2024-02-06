let colors = [[0, 0, 255], [255, 0, 0]]; // Default colorway
let currentFrame = 0;
const totalFrames = 120;
const diameter = 300;
let generating = false; // Flag to prevent multiple simultaneous requests

function setup() {
  createCanvas(600, 600);
  frameRate(30);
}

function draw() {
  if (!generating) {
    drawGradientCircle();
  }
}

function drawGradientCircle() {
  background(0);
  const center = createVector(width / 2, height / 2);
  let colorStep = 0;

  for (let r = diameter; r > 0; r -= 2) {
    let inter = map(r, 0, diameter, 0, 1);
    let c = lerpColor(color(...colors[0]), color(...colors[1]), inter);
    stroke(c);
    strokeWeight(2);
    noFill();
    ellipse(center.x, center.y, r, r);
  }

  currentFrame++;
  if (currentFrame >= totalFrames) {
    currentFrame = 0; // Reset the frame counter to loop the animation
  }
}

function mousePressed() {
  // Trigger new colorway generation on mouse press
  generateNewColorway();
}

async function generateNewColorway() {
  if (generating) return; // Prevent multiple requests
  generating = true;

  try {
    const response = await fetch('/api/generateArt');
    if (response.ok) {
      const data = await response.json();
      colors = data.colors;
    } else {
      console.error('Failed to fetch new colorway');
    }
  } catch (error) {
    console.error('Error fetching new colorway:', error);
  }

  generating = false;
}

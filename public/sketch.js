// public/sketch.js
let colors = [[0, 0, 255], [255, 0, 0]]; // Default colorway
let currentFrame = 0;
const totalFrames = 120;
const diameter = 300;
let pulse = 0;
const maxPulse = 20;
const pulseSpeed = 0.1;

// For capturing and sending frames to server
let captureFrames = false;
let capturedFrames = [];

function setup() {
  createCanvas(600, 600);
  frameRate(30);
  loadColorway(); // Load initial colorway from the server
}

function draw() {
  // Update pulse and possibly change colors
  pulse += pulseSpeed;
  if (pulse > maxPulse) {
    pulse = 0;
  }

  background(0);
  const pulsateDiam = diameter + pulse; // Adjust diameter based on pulse
  drawGradientCircle(pulsateDiam);

  if (captureFrames) {
    // Add logic to capture frames here for GIF creation
    if (currentFrame < totalFrames) {
      // Capture frame logic
      let canvas = document.getElementById('defaultCanvas0'); // Assuming the ID of the canvas created by p5
      let dataUrl = canvas.toDataURL('image/png');
      capturedFrames.push(dataUrl); // Collect each frame's data URL
    } else {
      // Once all frames are captured, send them to the server
      sendFramesToServer(capturedFrames);
      captureFrames = false; // Stop capturing frames
      currentFrame = 0; // Reset frame count
      capturedFrames = []; // Clear captured frames
    }
  }

  currentFrame = (currentFrame + 1) % totalFrames;
}

function drawGradientCircle(diam) {
  const center = createVector(width / 2, height / 2);
  for (let r = diam / 2; r > 0; r--) {
    const inter = map(r, 0, diam / 2, 0, 1);
    const c = lerpColor(color(...colors[0]), color(...colors[1]), inter);
    noFill();
    stroke(c);
    ellipse(center.x, center.y, r * 2, r * 2);
  }
}

async function loadColorway() {
  // Fetch new colorway from server
  const response = await fetch('/api/generateColor');
  const data = await response.json();
  colors = data.colors;
}

function mousePressed() {
  // Toggle frame capture on mouse press
  captureFrames = !captureFrames;
  if (!captureFrames && capturedFrames.length > 0) {
    sendFramesToServer(capturedFrames); // Send captured frames if stopping capture
    capturedFrames = []; // Clear captured frames
  }
}

async function sendFramesToServer(frames) {
  try {
    const response = await fetch('/api/generateGif', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ frames }),
    });
    if (response.ok) {
      const data = await response.json();
      console.log('Generated GIF URL:', data.url); // Log the URL of the generated GIF
      
      // Dynamically update the meta tags with the new GIF URL
      document.getElementById('fc-frame-image').setAttribute("content", data.url);
      document.getElementById('og-image').setAttribute("content", data.url);
    } else {
      console.error('Failed to send frames');
    }
  } catch (error) {
    console.error('Error sending frames to server:', error);
  }
}

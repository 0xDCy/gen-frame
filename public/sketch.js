// public/sketch.js
let colors = [[0, 0, 255], [255, 0, 0]];
let currentFrame = 0;
const totalFrames = 120;
const diameter = 300;
let pulse = 0;
const maxPulse = diameter / 2;
const pulseSpeed = (diameter / 2) / totalFrames; 

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

function drawGradientCircle() {
  const center = createVector(width / 2, height / 2);
  let maxRadius = diameter / 2;
  
  // Dynamically adjust pulse
  pulse = (pulse + pulseSpeed) % maxRadius;

  for (let r = maxRadius; r > 0; r--) {
    let effectiveRadius = r - pulse;
    effectiveRadius = max(effectiveRadius, 0); // Prevent negative radius
    const inter = map(effectiveRadius, 0, maxRadius, 0, 1);
    const c = lerpColor(color(...colors[0]), color(...colors[1]), inter);
    noFill();
    stroke(c);
    // Draw the circle with the effective radius
    ellipse(center.x, center.y, effectiveRadius * 2, effectiveRadius * 2);
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

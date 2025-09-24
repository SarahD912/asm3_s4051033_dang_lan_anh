let handsWidth = 300; // New variable for hands image width
let handsHeight = 250; // New variable for hands image height
let threadWidth = 150; // New variable for thread image width
let threadHeight = 150; // New variable for thread image height
let circleCount = 7;
let circleDiameter = 100;
let squareVerticalOffset = 150;
let archVerticalOffset = 150;
let wireLength = 300;
let archRadius = 430;

let isDragging = false;
let squareX;
let squareY;

let starIsVisible = false;

// New variable to control rectangle visibility
let rectangleIsVisible = false;

// Variables for the fade effect
let isFading = false;
let fadeStartTime;

// New variable to track the permanent disappearance of UNCHOSEN wires
let otherWiresFaded = false;

// Variable to store the index of the clicked circle
let clickedCircleIndex = -1;

// --- Particle variables ---
let particles = [];
let particleCount = 50;

// An array to hold all images
let assetImages = [];
// Variable for the hands image
let handImage;
// Variable for the thread image
let threadImage;

// Video variables for the noise effect
let noiseVideo;
let isNoiseFadingIn = false;
let noiseFadeStartTime;
let noiseIsPermanent = false;

// An array to hold the custom width and height for each image
let imageDimensions = [];

// Variables for the interactive image
let chosenAssetIndex = -1;
let centralImage;

// The amount to move on each key press
const moveAmount = 20;

// Variable to manage the final state
let finalState = false;

// NEW: Variables for the glowing rectangle
let glowingRectWidth = 80;
let glowingRectHeight = 150;
let glowingRectX;
let glowingRectY;
let initialRectWidth = 80;
let initialRectHeight = 150;
let aspectRatio = initialRectWidth / initialRectHeight;
let glowAmount = 30; // Amount of blur for the glow effect
let glowColor = 'white'; // Color of the glow effect

// NEW: Variables for the typing text effect
let typingText = "As you carefully go through the establishment in your mind, each step must have felt heavy, and sometimes, unsure. But don't worry, even at the worst scenario, when things don't turn out the way you want, you can always do it again, just like how you can always hit the refresh button and go again. \n\nYou can either made the same choice and restart the, why am I choosing this again? or you can choose a new one. Either way, remember, just like this project, you have to walk through everything. \n\nBelieve in yourself and your hands.";
let displayText = "";
let textIndex = 0;
let textSpeed = 50; // Typing speed in milliseconds per character
let typingComplete = false;
let textTriggered = false;

function preload() {
  for (let i = 1; i <= circleCount; i++) {
    let j = i - 1;
    assetImages[j] = loadImage("asset" + i + ".png");
  }
  handImage = loadImage("hands.png");
  threadImage = loadImage("thread.png");
  noiseVideo = createVideo(['noise.mp4']);
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  rectMode(CENTER);
  imageMode(CENTER);
  noStroke();

  squareX = width / 2;
  squareY = height / 2 + squareVerticalOffset;

  for (let i = 0; i < particleCount; i++) {
    particles.push(new Particle());
  }

  for (let i = 0; i < circleCount; i++) {
    imageDimensions[i] = {
      width: circleDiameter,
      height: circleDiameter,
    };
  }

  imageDimensions[0].width = 150;
  imageDimensions[0].height = 150;
  imageDimensions[1].width = 150;
  imageDimensions[1].height = 150;
  imageDimensions[2].width = 150;
  imageDimensions[2].height = 150;
  imageDimensions[3].width = 230;
  imageDimensions[3].height = 120;
  imageDimensions[4].width = 150;
  imageDimensions[4].height = 150;
  imageDimensions[5].width = 150;
  imageDimensions[5].height = 150;
  imageDimensions[6].width = 150;
  imageDimensions[6].height = 150;

  noiseVideo.hide();
  // Add this line to mute the video
  noiseVideo.volume(0);
  

  centralImage = threadImage;

  // NEW: Initialize glowing rectangle position
  glowingRectX = width / 2;
  glowingRectY = height / 2;
}

function draw() {
  background(0);

  // --- 1. Draw the background grid and particles ONLY if NOT in the final state ---
  if (!finalState) {
    drawGrid();
    for (let particle of particles) {
      particle.move();
      particle.checkEdges();
      particle.display();
    }
  }

  // --- 2. Draw interactive circles and red wires ONLY if NOT in the final state ---
  if (!finalState) {
    drawInteractiveElements();
  }

  // --- 3. Draw the noise layer ONLY if NOT in the final state ---
  if ((isNoiseFadingIn || noiseIsPermanent) && !finalState) {
    drawNoise();
  }

  // --- 4. Draw the pop-up rectangle on top of everything else ---
  if (rectangleIsVisible) {
    noStroke();
    let startColor = color(150);
    let endColor = color(0);
    let rectWidth = width;
    let rectHeight = 250;
    for (let i = 0; i < rectWidth; i++) {
      let colorAmount;
      let opacityAmount;
      if (i < rectWidth / 2) {
        colorAmount = map(i, 0, rectWidth / 2, 0, 1);
        opacityAmount = map(i, 0, rectWidth / 2, 0, 1);
      } else {
        colorAmount = map(i, rectWidth / 2, rectWidth, 1, 0);
        opacityAmount = map(i, rectWidth / 2, rectWidth, 1, 0);
      }
      let newColor = lerpColor(startColor, endColor, colorAmount);
      let newOpacity = map(opacityAmount, 0, 1, 0, 255);
      fill(newColor, newOpacity);
      rect(width / 2 - rectWidth / 2 + i, height / 2, 1, rectHeight);
    }
    fill(255);
    textAlign(CENTER, CENTER);
    textSize(50);
    text("Congratulation!", width / 2, height / 2 - 20);
    textSize(20);
    text("You have made your choice. I know it's hard but you can't stop here yet. ", width / 2, height / 2 + 20);
  }

  // --- 5. Draw the glowing rectangle ONLY in the final state
  if (finalState) {
    noStroke();
    fill(255); // Rectangle itself is white
    
    // Apply glow effect
    drawingContext.shadowBlur = glowAmount;
    drawingContext.shadowColor = glowColor;
    
    rect(glowingRectX, glowingRectY, glowingRectWidth, glowingRectHeight);
    
    // Reset shadow properties to avoid affecting other drawing operations
    drawingContext.shadowBlur = 0;
    drawingContext.shadowColor = 'rgba(0,0,0,0)';

    // Draw the two lines
    stroke(255); // Set line color to white
    strokeWeight(2); // Set line thickness
    
    // Line from bottom-left of screen to bottom-left of rectangle
    line(0, height, glowingRectX - glowingRectWidth / 2, glowingRectY + glowingRectHeight / 2);

    // Line from bottom-right of screen to bottom-right of rectangle
    line(width, height, glowingRectX + glowingRectWidth / 2, glowingRectY + glowingRectHeight / 2);

    // NEW: Check if the rectangle covers the screen to trigger the text
    if (glowingRectWidth >= width && glowingRectHeight >= height && !textTriggered) {
      textTriggered = true;
      startTyping();
    }
    
    // NEW: Draw the typing text if it has been triggered
    if (textTriggered) {
      drawTypingText();
    }
  }

  // --- 6. Draw the hands and central image (MOVED TO BE ON TOP) ---
  let currentImageWidth = threadWidth;
  let currentImageHeight = threadHeight;

  if (centralImage !== threadImage) {
    currentImageWidth = imageDimensions[chosenAssetIndex].width;
    currentImageHeight = imageDimensions[chosenAssetIndex].height;
  }

  // Both hands and the central image are drawn at the same position in all states
  image(handImage, squareX, squareY, handsWidth, handsHeight);
  image(centralImage, squareX, squareY, currentImageWidth, currentImageHeight);
}

// NEW: Function to start the typing animation
function startTyping() {
  setInterval(function() {
    if (textIndex < typingText.length) {
      displayText += typingText.charAt(textIndex);
      textIndex++;
    } else {
      typingComplete = true;
    }
  }, textSpeed);
}

// NEW: Function to draw the typing text
function drawTypingText() {
  fill(255);
  rect(width / 2, height / 2, width, height); // Dark rectangle to cover the glowing door
  fill(0);
  textAlign(CENTER, CENTER);
  textSize(24);
  text(displayText, width / 2, height / 2, width * 0.8, height * 0.8);
}

function drawInteractiveElements() {
  let archAngle = radians(180);
  let archCenterX = width / 2;
  let archCenterY = height / 2 + archVerticalOffset;

  let circlePositions = [];
  for (let i = 0; i < circleCount; i++) {
    let angle = i * (archAngle / (circleCount - 1));
    let x = archCenterX - cos(angle) * archRadius;
    let y = archCenterY - sin(angle) * archRadius;
    circlePositions.push({
      x: x,
      y: y,
    });
  }

  let fadeDuration = 2000;
  let timeElapsed = millis() - fadeStartTime;

  for (let i = 0; i < circlePositions.length; i++) {
    let alpha = 255;
    if (isFading && i !== clickedCircleIndex) {
      alpha = map(timeElapsed, 0, fadeDuration, 255, 0);
      alpha = constrain(alpha, 0, 255);
    }
    if (otherWiresFaded && i !== clickedCircleIndex) {
      continue;
    }

    stroke(255, 0, 0, alpha);
    strokeWeight(2);
    noFill();

    let startPoint = createVector(circlePositions[i].x, circlePositions[i].y);
    let endPoint = createVector(squareX, squareY);

    beginShape();
    let nodeCount = 30;

    for (let j = 0; j <= nodeCount; j++) {
      let midPoint = p5.Vector.lerp(startPoint, endPoint, j / nodeCount);
      let curveHeight = sin((j / nodeCount) * PI) * wireLength * 0.2;
      midPoint.y += curveHeight;
      vertex(midPoint.x, midPoint.y);
    }
    endShape();
  }

  if (isFading && timeElapsed >= fadeDuration) {
    isFading = false;
    otherWiresFaded = true;
  }

  noStroke();
  for (let i = 0; i < circlePositions.length; i++) {
    image(
      assetImages[i],
      circlePositions[i].x,
      circlePositions[i].y,
      imageDimensions[i].width,
      imageDimensions[i].height
    );
  }
  
  if (starIsVisible) {
    drawStar(squareX, squareY, 15, 30, 5);
  }
}

function drawNoise() {
  let fadeDuration = 2000;
  let timeElapsed = millis() - noiseFadeStartTime;
  let maxOpacity = 255;
  let alpha;
  if (!noiseIsPermanent) {
    alpha = map(timeElapsed, 0, fadeDuration, 0, maxOpacity);
    alpha = constrain(alpha, 0, maxOpacity);
    if (timeElapsed >= fadeDuration) {
      noiseIsPermanent = true;
    }
  } else {
    alpha = maxOpacity;
  }
  let frame = noiseVideo.get();
  frame.loadPixels();
  let greenScreenColor = color(0, 255, 0);
  let tolerance = 50;
  for (let i = 0; i < frame.pixels.length; i += 4) {
    let r = frame.pixels[i];
    let g = frame.pixels[i + 1];
    let b = frame.pixels[i + 2];
    if (
      abs(r - red(greenScreenColor)) < tolerance &&
      abs(g - green(greenScreenColor)) < tolerance &&
      abs(b - blue(greenScreenColor)) < tolerance
    ) {
      frame.pixels[i + 3] = 0;
    } else {
      let brightness = (r + g + b) / 3;
      frame.pixels[i] = brightness;
      frame.pixels[i + 1] = brightness;
      frame.pixels[i + 2] = brightness;
      frame.pixels[i + 3] = alpha;
    }
  }
  frame.updatePixels();
  image(frame, width / 2, height / 2, width, height);
}

function drawGrid() {
  let gridSpacing = 50;
  stroke(255);
  strokeWeight(1);
  for (let x = 0; x < width; x += gridSpacing) {
    line(x, 0, x, height);
  }
  for (let y = 0; y < height; y += gridSpacing) {
    line(0, y, width, y);
  }
}

function drawStar(x, y, radius1, radius2, npoints) {
  let angle = TWO_PI / npoints;
  let halfAngle = angle / 2.0;
  beginShape();
  for (let a = 0; a < TWO_PI; a += angle) {
    let sx = x + cos(a) * radius2;
    let sy = y + sin(a) * radius2;
    vertex(sx, sy);
    sx = x + cos(a + halfAngle) * radius1;
    sy = y + sin(a + halfAngle) * radius1;
    vertex(sx, sy);
  }
  endShape(CLOSE);
}

function mousePressed() {
  if (
    mouseX > squareX - handsWidth / 2 &&
    mouseX < squareX + handsWidth / 2 &&
    mouseY > squareY - handsHeight / 2 &&
    mouseY < squareY + handsHeight / 2
  ) {
    isDragging = true;
    return;
  }
  if (rectangleIsVisible) {
    let rectY = height / 2;
    let rectHeight = 250;
    if (
      mouseX > 0 &&
      mouseX < width &&
      mouseY > rectY - rectHeight / 2 &&
      mouseY < rectY + rectHeight / 2
    ) {
      rectangleIsVisible = false;
      isNoiseFadingIn = true;
      noiseFadeStartTime = millis();
      noiseVideo.play();
      if (chosenAssetIndex !== -1) {
        centralImage = assetImages[chosenAssetIndex];
      }
      return;
    }
  }
  let archAngle = radians(180);
  let archCenterX = width / 2;
  let archCenterY = height / 2 + archVerticalOffset;
  for (let i = 0; i < circleCount; i++) {
    let angle = i * (archAngle / (circleCount - 1));
    let x = archCenterX - cos(angle) * archRadius;
    let y = archCenterY - sin(angle) * archRadius;
    let d = dist(mouseX, mouseY, x, y);
    if (d < circleDiameter / 2) {
      starIsVisible = true;
      rectangleIsVisible = true;
      isFading = true;
      fadeStartTime = millis();
      clickedCircleIndex = i;
      chosenAssetIndex = i;
      return;
    }
  }
  starIsVisible = false;
  rectangleIsVisible = false;
  if (otherWiresFaded) {
    otherWiresFaded = false;
  }
  chosenAssetIndex = -1;
}

function mouseDragged() {
  if (isDragging) {
    squareX = mouseX;
    squareY = mouseY;
  }
}

function mouseReleased() {
  isDragging = false;
}

function mouseWheel(event) {
  let scaleChange = event.deltaY * -0.5;
  
  glowingRectWidth += scaleChange;
  glowingRectHeight += scaleChange / aspectRatio;

  glowingRectWidth = max(glowingRectWidth, initialRectWidth);
  glowingRectHeight = max(glowingRectHeight, initialRectHeight);
}

function keyPressed() {
  if ((isNoiseFadingIn || noiseIsPermanent) && (key === 'w' || key === 'W')) {
    let newY = squareY - moveAmount;
    // Check if the new position is at or past the top edge
    if (newY <= 0 + handsHeight / 2) {
      // Set to final state
      finalState = true;
      noiseIsPermanent = false;
      isNoiseFadingIn = false;
      // Reposition the hands and chosen image to the new location
      squareY = height - 100; // Near the bottom of the screen
      squareX = width / 2; // Center horizontally
    } else {
      // Move up by the specified amount
      squareY = newY;
    }
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  squareX = width / 2;
  squareY = height / 2 + squareVerticalOffset;
  // NEW: Update glowing rectangle position on resize
  glowingRectX = width / 2;
  glowingRectY = height / 2;
}

class Particle {
  constructor() {
    this.x = random(width);
    this.y = random(height);
    this.vx = random(-2, 2);
    this.vy = random(-2, 2);
    this.color = color(255);
    this.radius = random(5, 15);
  }
  move() {
    this.x += this.vx;
    this.y += this.vy;
  }
  checkEdges() {
    if (this.x < 0 || this.x > width) {
      this.vx *= -1;
    }
    if (this.y < 0 || this.y > height) {
      this.vy *= -1;
    }
  }
  display() {
    fill(this.color);
    noStroke();
    circle(this.x, this.y, this.radius);
  }
}
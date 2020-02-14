// Inspired by Nicky Case and Conway's Game of Life
const states = ["", "🙍🏻‍♂️","🙍🏻‍♀️","🤢","💀","👨‍⚕️"];  // TODO add another human, as well as tree and fire
const humanStates = ["👨‍💼","🙍‍♂"];
const gridSize = 15;
let grid = [];//lookup table of [x][y] = states
let grid = []; //lookup table of [x][y] = states
const diseaseIndex = 3;
const deathIndex = 4;
const normalIndex = [1,2];
const humanIndex = [1,2,5];
const doctorIndex = 5;

const humansPerFrame = 20; // number of humans generated each frame
const doctorsPerFrame = 2;
const diseaseProbability = 0.9; //chance that a new disease appears in each frame

const audioThreshold = 0.00001;
const nyquist = 22050;
var amp, audio, analyzer;

function setup() {
  frameRate(20);
  createCanvas(windowWidth, windowHeight);
  textSize(gridSize);
  stroke(200);
  
  for(let x = 0; x < width; x += gridSize){
    grid[x] = [];
    for(let y = 0; y < height; y += gridSize){
      grid[x][y] = random() > 0.8 ? normalIndex[int(random(normalIndex.length))] : 0;
      //draw grid
      rect(x, y, gridSize, gridSize);
    }
  }
  audio = new p5.AudioIn();
  audio.start();
  
  amp = new p5.Amplitude();
  amp.setInput(audio);
  amp.toggleNormalize(1);
  
  analyzer = new p5.FFT();
  analyzer.setInput(audio);
}

function draw() {
  background(0);
  text(amp.getLevel(), 50, 50);
  
  //clone state
  let previousGrid = grid.map(columns => columns.slice());
  
  grid.forEach((column, indexX) => {
    column.forEach((state, indexY) => {
      //draw emoji
      if(state > 0) { 
        text(states[state], indexX, indexY + gridSize);
      }
      fatality = random();
      stateCounts = countSurroundingStates(previousGrid, indexX,indexY);
      lastState = previousGrid[indexX][indexY];
      if (lastState == deathIndex) {
        // remove death
        grid[indexX][indexY] = 0;
      }
      if(lastState == diseaseIndex){
        if (fatality < 0.5) { // death probability 
          grid[indexX][indexY] = deathIndex;
        } else if (fatality > 0.9) { // survival probability
          grid[indexX][indexY] = normalIndex[int(random(normalIndex.length))];
        } else { 
          propagate(diseaseIndex, humanIndex, indexX, indexY);
        }
      }
      
      // immunization
      if (lastState == doctorIndex) {
        if (fatality > 0.95) {  // self-immunization
          grid[indexX][indexY] = doctorIndex;
        } else {
          persistWithProbability(indexX, indexY, 0.4); // immunize surrounding
        }
      }
    });
  });
  
  //random human generation
  for(let i = 0; i < humansPerFrame; i++){
    indexX = floor(random(width/gridSize)) * gridSize;
    indexY = floor(random(height/gridSize)) * gridSize;
    if (grid[indexX][indexY] == 0) {
      grid[indexX][indexY] = normalIndex[int(random(normalIndex.length))];
    }
  }
  
  // random doctor generation
  spawnStates(doctorIndex, doctorsPerFrame); 
  
  // audio disease
  let level = amp.getLevel();
  if (true) {
    spectrum = analyzer.analyze();
    center = analyzer.getCentroid();
    if(random() < diseaseProbability) {
      indexX = floor((center / nyquist * 2) * (width/gridSize)) * gridSize;
      indexY = floor((1 + level)*height/gridSize*random(-1, 1)) * gridSize;
      grid[indexX][indexY] = diseaseIndex;
    }
  }
  
}

function countSurroundingStates(gridStates, indexX, indexY) {
  stateCount = [0]*states.length;
  if(indexX > 0) {
    //left
    stateCount[gridStates[indexX-gridSize][indexY]] += 1;
  }
  if(indexX < width - gridSize) {
    //right
    stateCount[gridStates[indexX+gridSize][indexY]] += 1;
  }
  if(indexY > 0) {
    //top
    stateCount[gridStates[indexX][indexY-gridSize]] += 1;
  }
  if(indexY < height - gridSize) {
    //bottom
    stateCount[gridStates[indexX][indexY+gridSize]] += 1;
  }
  if(indexX > 0 && indexY > 0) {
    //top left
    stateCount[gridStates[indexX-gridSize][indexY-gridSize]] += 1;
  }
  if(indexX < width-gridSize && indexY > 0) {
    //top right
    stateCount[gridStates[indexX+gridSize][indexY-gridSize]] += 1;
  }
  if(indexX > 0 && indexY < height - gridSize) {
    //bottom left
    stateCount[gridStates[indexX-gridSize][indexY+gridSize]] += 1;
  }
  if(indexX < width-gridSize && indexY < height - gridSize) {
    //bottom right
    stateCount[gridStates[indexX+gridSize][indexY+gridSize]] += 1;
  }
  return stateCount;
}

function propagate(state, targets, indexX, indexY) {
  if(indexX > 0 && targets.includes(grid[indexX-gridSize][indexY])) {
    //left
    grid[indexX-gridSize][indexY] = state;
  }
  if(indexX < width - gridSize && targets.includes(grid[indexX+gridSize][indexY])) {
    //right
    grid[indexX+gridSize][indexY] = state;
  }
  if(indexY > 0 && targets.includes(grid[indexX][indexY-gridSize])) {
    //top
    grid[indexX][indexY-gridSize] = state;
  }
  if(indexY < height - gridSize && targets.includes(grid[indexX][indexY+gridSize])) {
    //bottom
    grid[indexX][indexY+gridSize] = state;
  }
  if(indexX > 0 && indexY > 0 && targets.includes(grid[indexX-gridSize][indexY-gridSize])) {
    //top left
    grid[indexX-gridSize][indexY-gridSize] = state;
  }
  if(indexX < width-gridSize && indexY > 0 && targets.includes(grid[indexX+gridSize][indexY-gridSize])) {
    //top right
    grid[indexX+gridSize][indexY-gridSize] = state;
  }
  if(indexX > 0 && indexY < height - gridSize && targets.includes(grid[indexX-gridSize][indexY+gridSize])) {
    //bottom left
    grid[indexX-gridSize][indexY+gridSize] = state;
  }
  if(indexX < width-gridSize && indexY < height - gridSize && targets.includes(grid[indexX+gridSize][indexY+gridSize])) {
    //bottom right
    grid[indexX+gridSize][indexY+gridSize] = state;
  }
}

// TODO add immunization to surrounding area
function persistWithProbability(indexX, indexY, prob) {
  
}

function spawnStates(state, numStates) {
  for (let i = 0; i < numStates; i++) {
    indexX = floor(random(width/gridSize)) * gridSize;
    indexY = floor(random(height/gridSize)) * gridSize;
    if (grid[indexX][indexY] == 0) { // make sure to spawn in uninhabited grid space
      grid[indexX][indexY] = state;
    }
  }
}

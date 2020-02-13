// Inspired by Nicky Case and Conway's Game of Life
const states = ["", "👨🏻‍⚕️", "💀"];
const humanStates = ["👨‍💼","🙍‍♂️"];
const gridSize = 12;
let grid = [];//lookup table of [x][y] = states

const humansPerFrame = 30;//amount of new tree created in each frame
const diseaseProbability = 0.3;//chance to appear a new fire each frame

function setup() {
  frameRate(30);
  createCanvas(windowWidth, windowHeight);
  textSize(gridSize);
  stroke(200);
  
  for(let x = 0; x < width; x += gridSize){
    grid[x] = [];
    for(let y = 0; y < height; y += gridSize){
      grid[x][y] = random() > 0.8 ? 1 : 0;
      //draw grid
      rect(x, y, gridSize, gridSize);
    }
  }
}

function draw() {
  background(0);
  //clone state
  let previousGrid = grid.map(columns => columns.slice());
  
  grid.forEach((column, indexX) => {
    column.forEach((state, indexY) => {
      
      //draw emoji
      if(state > 0) text(states[state], indexX, indexY + gridSize);
      
      let lastState = previousGrid[indexX][indexY];
      if(lastState == 2){
        propagate(2, [1], indexX, indexY);
        //erase fire
        grid[indexX][indexY] = 0;
      }
      
      stateCounts = countSurroundingStates(indexX,indexY);
    });
  });
  
  //random human generation
  for(let i = 0; i < humansPerFrame; i++){
    indexX = floor(random(width/gridSize)) * gridSize;
    indexY = floor(random(height/gridSize)) * gridSize;
    grid[indexX][indexY] = 1;
  }
  
  //random disease
  if(random() > diseaseProbability){
    indexX = floor(random(width/gridSize)) * gridSize;
    indexY = floor(random(height/gridSize)) * gridSize;
    grid[indexX][indexY] = 2;
  }
}

function countSurroundingStates(indexX,indexY) {
  stateCount = [0]*states.length;
  if(indexX > 0) {
    //left
    stateCount[grid[indexX-gridSize][indexY]] += 1;
  }
  if(indexX < width - gridSize) {
    //right
    stateCount[grid[indexX+gridSize][indexY]] += 1;
  }
  if(indexY > 0) {
    //top
    stateCount[grid[indexX][indexY-gridSize]] += 1;
  }
  if(indexY < height - gridSize) {
    //bottom
    stateCount[grid[indexX][indexY+gridSize]] += 1;
  }
  if(indexX > 0 && indexY > 0) {
    //top left
    stateCount[grid[indexX-gridSize][indexY-gridSize]] += 1;
  }
  if(indexX < width-gridSize && indexY > 0) {
    //top right
    stateCount[grid[indexX+gridSize][indexY-gridSize]] += 1;
  }
  if(indexX > 0 && indexY < height - gridSize) {
    //bottom left
    stateCount[grid[indexX-gridSize][indexY+gridSize]] += 1;
  }
  if(indexX < width-gridSize && indexY < height - gridSize) {
    //bottom right
    stateCount[grid[indexX+gridSize][indexY+gridSize]] += 1;
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

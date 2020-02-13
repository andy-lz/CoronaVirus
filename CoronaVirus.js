// Inspired by Nicky Case and Conway's Game of Life
const states = ["", "👨🏻‍⚕️", "💀"];
const gridSize = 10;
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
    }
  }
}

function draw() {
  background(255);
  
  //clone state
  let previousGrid = grid.map(columns => columns.slice());
  
  grid.forEach((column, indexX) => {
    column.forEach((state, indexY) => {
      //draw grid
      //rect(indexX, indexY, gridSize, gridSize);
      
      //draw emoji
      if(state > 0) text(states[state], indexX, indexY + gridSize);
      
      let lastState = previousGrid[indexX][indexY];
      if(lastState == 2){
        //propagate fire
        if(indexX > 0 && grid[indexX-gridSize][indexY] == 1)
          //left
          grid[indexX-gridSize][indexY] = 2;
        if(indexX < width - gridSize && grid[indexX+gridSize][indexY] == 1)
          //right
          grid[indexX+gridSize][indexY] = 2;
        if(indexY > 0 && grid[indexX][indexY-gridSize] == 1)
          //top
          grid[indexX][indexY-gridSize] = 2;
        if(indexY < height - gridSize && grid[indexX][indexY+gridSize] == 1)
          //bottom
          grid[indexX][indexY+gridSize] = 2;
        if(indexX > 0 && indexY > 0 && grid[indexX-gridSize][indexY-gridSize] == 1)
          //top left
          grid[indexX-gridSize][indexY-gridSize] = 2;
        if(indexX < width-gridSize && indexY > 0 && grid[indexX+gridSize][indexY-gridSize] == 1)
          //top right
          grid[indexX+gridSize][indexY-gridSize] = 2;
        if(indexX > 0 && indexY < height - gridSize && grid[indexX-gridSize][indexY+gridSize] == 1)
          //bottom left
          grid[indexX-gridSize][indexY+gridSize] = 2;
        if(indexX < width-gridSize && indexY < height - gridSize && grid[indexX+gridSize][indexY+gridSize] == 1)
          //bottom right
          grid[indexX+gridSize][indexY+gridSize] = 2;
        
        //erase fire
        grid[indexX][indexY] = 0;
      }
    })
  })
  
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

// Inspired by Conway's Game of Life
const states = ["", "🙍🏻‍♂️","🙍🏻‍♀️","🤢","💀","👨‍⚕️","🚧","💦"];  // TODO add fire?
const humanStates = ["👨‍💼","🙍‍♂"];
const gridSize = 15;
let grid = []; // lookup table of [x][y] = states
const diseaseIndex = 3;
const deathIndex = 4;
const normalIndex = [1,2];
const humanIndex = [1,2,5];
const doctorIndex = 5;
const barrierIndex = 6;
const waterIndex = 7;
const dx = 0.1;

const humansPerFrame = 2; // number of humans generated each frame
const doctorsPerFrame = 1;
const diseaseProbability = 0.9; // chance that a new disease appears in each frame

const audioThreshold = 0.05;
const nyquist = 22050;
var amp, audio, analyzer;

function setup() {
  frameRate(30);
  createCanvas(windowWidth, windowHeight, P2D);
  textSize(gridSize);
  let terrainGrid = [];
  for(let x = 0; x < width; x += gridSize){
    grid[x] = [];
    terrainGrid[x] = [];
    for(let y = 0; y < height; y += gridSize){
      grid[x][y] = random() > 0.8 ? normalIndex[int(random(normalIndex.length))] : 0;
      terrainGrid[x][y] = random() < 0.56 ? 1 : 0;
      //draw grid
      // rect(x, y, gridSize, gridSize);
    }
  }
  proceduralGenerateLand(terrainGrid);
  audio = new p5.AudioIn();
  let myDiv = createDiv('click to start audio'); // need to click to begin receiving mic input
  myDiv.position(0, 0);
  userStartAudio().then(function() {
     audio.start();
     myDiv.remove();
   });
  
  amp = new p5.Amplitude();
  amp.setInput(audio);
  amp.toggleNormalize(1);
  
  analyzer = new p5.FFT();
  analyzer.setInput(audio);
}

function draw() {
  background(0);
  
  // clone state
  let previousGrid = grid.map(columns => columns.slice());
  translate(0,0);
  let humanCount = 0;
  previousGrid.forEach((column, indexX) => {
    column.forEach((state, indexY) => {
      // draw states (emojis)
      if(state > 0) {
        if (state == doctorIndex){
          stroke(200);
        } else {
          stroke(0);
        }
        text(states[state], indexX, indexY + gridSize);
      }
      
      fatality = random();  // death probability 
      let stateCounts = countSurroundingStates(previousGrid, indexX,indexY);
      lastState = previousGrid[indexX][indexY];
      
      if (lastState in humanIndex) { humanCount++; }
      
      if (lastState == 0) {
        let num_normal = 0;
        let num_sick = stateCounts[diseaseIndex];
        let num_docs = stateCounts[doctorIndex];
        normalIndex.forEach(elem => num_normal += stateCounts[elem]);
        if (num_normal >= 5) {  // generate new human 
          grid[indexX][indexY] = normalIndex[int(random(normalIndex.length))];
        } else if (num_sick > 0 && num_docs > 1) {
          grid[indexX][indexY] = barrierIndex;
        }
      }
      if (lastState == deathIndex) {
        // remove death
        grid[indexX][indexY] = 0;
      }
      if(lastState == diseaseIndex){
        if (fatality < 0.3) { 
          grid[indexX][indexY] = deathIndex;
        } else if (fatality > 0.9) { // survival probability
          grid[indexX][indexY] = normalIndex[int(random(normalIndex.length))];
        } else { 
          propagate(diseaseIndex, humanIndex, indexX, indexY);
        }
      }
      if (lastState == doctorIndex) { // doctor's immunization
        if (fatality > 0.5) {  // self-immunization
          grid[indexX][indexY] = doctorIndex;
        }
        persistWithProbability(previousGrid, humanIndex, indexX, indexY, 0.4); // immunize surrounding
      }
    });
  });
  if (humanCount == 0) { clearAll(); } // clear ground
  
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
  if (level > audioThreshold) {
    spectrum = analyzer.analyze();
    center = analyzer.getCentroid();
    for (let i = 0; i < int(level/audioThreshold); i++) {
      if(random() < diseaseProbability) {
        gridX = max(min((center / nyquist * 5+ random(-dx,dx)), 0.99),0.01);
        gridY = max(min((1 + level*random(-1,1))/2, 0.99),0.01);
        indexX = floor(gridX*width/gridSize) * gridSize;
        indexY = floor(gridY*height/gridSize) * gridSize;
        // console.log(indexX,indexY);
        if (grid[indexX][indexY] in humanIndex) {
          grid[indexX][indexY] = diseaseIndex;
        }
      }
    }
  }
  
}

function countSurroundingStates(gridStates, indexX, indexY) {
  let stateCount = new Array(gridStates.length).fill(0);
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
function persistWithProbability(oldGrid, targets, indexX, indexY, prob) {
    if(indexX > 0 && targets.includes(oldGrid[indexX-gridSize][indexY])) {
      if (random() < prob) {
        grid[indexX-gridSize][indexY] = oldGrid[indexX-gridSize][indexY];
      }
    //left
  }
  if(indexX < width - gridSize && targets.includes(oldGrid[indexX+gridSize][indexY])) {
    //right
    if (random() < prob) {
        grid[indexX+gridSize][indexY] = oldGrid[indexX+gridSize][indexY];
    }
  }
  if(indexY > 0 && targets.includes(oldGrid[indexX][indexY-gridSize])) {
    //top
    if (random() < prob) {
      grid[indexX][indexY-gridSize] = oldGrid[indexX][indexY-gridSize];
    }
  }
  if(indexY < height - gridSize && targets.includes(oldGrid[indexX][indexY+gridSize])) {
    //bottom
    if (random() < prob) {
      grid[indexX][indexY+gridSize] = oldGrid[indexX][indexY+gridSize];
    }
  }
  if(indexX > 0 && indexY > 0 && targets.includes(oldGrid[indexX-gridSize][indexY-gridSize])) {
    //top left
    if (random() < prob) {
      grid[indexX-gridSize][indexY-gridSize] = oldGrid[indexX-gridSize][indexY-gridSize];
    }
  }
  if(indexX < width-gridSize && indexY > 0 && targets.includes(oldGrid[indexX+gridSize][indexY-gridSize])) {
    //top right
    if (random() < prob) {
      grid[indexX+gridSize][indexY-gridSize] =oldGrid[indexX+gridSize][indexY-gridSize];
    }
  }
  if(indexX > 0 && indexY < height - gridSize && targets.includes(oldGrid[indexX-gridSize][indexY+gridSize])) {
    //bottom left
    if (random() < prob) {
      grid[indexX-gridSize][indexY+gridSize] = oldGrid[indexX-gridSize][indexY+gridSize];
    }
  }
  if(indexX < width-gridSize && indexY < height - gridSize && targets.includes(oldGrid[indexX+gridSize][indexY+gridSize])) {
    //bottom right
    if (random() < prob) {
      grid[indexX+gridSize][indexY+gridSize] = oldGrid[indexX+gridSize][indexY+gridSize];
    }
  }

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

function clearAll() {
  grid.forEach((column, indexX) => {
    column.forEach((state, indexY) => {
      grid[indexX][indexY] = 0;
    });
  });
}

function proceduralGenerateLand(terrainGrid) {
  let landState = 1;
  let num_changes = 1;
  
  // O(mn^2) procedural land generation
  while (num_changes > 0) {
    num_changes = 0;
    terrainGrid.forEach((column, indexX) => {
      column.forEach((state, indexY) => {
        surroundStates = countSurroundingStates(terrainGrid, indexX, indexY);
        if (state == 0) {
          if (surroundStates[2]>4){
            terrainGrid[indexX][indexY] = 2;
            num_changes++;
          }
        }
        if (state == 1) {
          if (surroundStates[0] >= 1) {
            terrainGrid[indexX][indexY] = 2;
            num_changes++;
          }
        }
        if (state == 2) {
          if (surroundStates[0] > 4) {
            terrainGrid[indexX][indexY] = 0;
            num_changes++;
          } else if (surroundStates[0] == 0){
            terrainGrid[indexX][indexY] = 1;
            num_changes++;
          }
        }
      });
    });
  }
  terrainGrid.forEach((column, indexX) => {
      column.forEach((state, indexY) => {
        if (state == 0) {
          grid[indexX][indexY] = waterIndex;
        }
        if (state == 2) {
          grid[indexX][indexY] = barrierIndex;
        }
      });
    });
 
}



const nyquist = 22050;
const thresholdLength = 40;


class AudioAnalyzer {
  constructor(index) {
    this.index = index;
    this.audio = new p5.AudioIn();
        
    this.amp = new p5.Amplitude();
    this.amp.setInput(this.audio);
    this.amp.toggleNormalize(1);
    this.amp_levels = [];
    
    this.analyzer = new p5.FFT();
    this.analyzer.setInput(this.audio);
    
    this.audioThreshold = 0.05;
  }
  
  start_audio() {
    console.log(this.index);
    this.audio.setSource(this.index);
    console.log(this.audio.getSources());
    this.audio.start();
  }
  
  analyze() {
    this.spectrum = this.analyzer.analyze();
    this.center = this.analyzer.getCentroid();
  }
  
  getLevel() {
    let level = this.amp.getLevel();
    this.amp_levels[this.amp_levels.length] = level;
    if (this.amp_levels.length > thresholdLength) {
      this.amp_levels.shift();
    }
    return level;
  }
  
  getCentroid() {
    this.analyze();
    return this.center;
  }
  
  getLogCentroid() {
    let centroid = this.getCentroid();
    return this.logTransformCentroidRatio(centroid, nyquist);
  }
  
  getLogisticCentroidHuman() {
    let centroid = this.getCentroid();
    return this.logisticTransformCentroidHuman(centroid);
  }
  
  calculateThreshold() {
    return this.averageArray(this.amp_levels);
  }
  
  averageArray(arr) {
    let y = 0;
    let cumsum = arr.map(d=>y+=d);
    return float(y / arr.length);
  }
  
  logTransformCentroidRatio(centroid, nyquist) {
    return log(centroid)/(log(nyquist));
  }
  
  logisticTransformCentroidHuman(centroid) {
  // assuming human centroid is between 1000 - 4000
    return 1/(1+exp(-0.00133*(centroid-2500)));
  }
}

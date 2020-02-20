# CoronaVirus
Disease Visualizer in p5.js -- inspired by Conway's Game of Life and recent events surrounding the CoronaVirus epidemic.

# Warning

This visualizer is microphone-specific -- different microphones pick up different audio spectrums, and thus have different spectral centroids. Tuning is set via the setLogisticWeights() function. 

# Rules

## Land Generation

There are two forms of world generation which must be specified at startup:

  1. _Random world generation_: Specify a noise map of Land and Water.
  
  2. _Image-based world generation_: Use the brightness mapping of a preset image file to specify initial Land and Water mapping
 
Using one of the above world generation seeds, the visualizer forms a procedurally generated, cohesive mapping of Land and Water.

## Infection

The visualizer uses audio input within the AudioAnalyzer class to generate Diseases. In particular, the following rules apply:

  1. _Sudden Noise_: If you make noise that is louder than the average noise one second earlier, then you generate a Disease. The severity (number of generating points) of the Disease is determined by how much louder your noise is than the noises before it.
  
  2. _Timbre_: The location of the Disease is determined by the spectral centroid of your noise (i.e., the "color" or "timbre" of the noise) as well as its loudness. For example, high-pitched screams will cause more Diseases on the right, while lower shouts will cause Diseases on the left. 
  
## People Generation

The visualizer generates Normal Humans and Doctors on every turn based on the following criteria:
  
  1. _4 of a Kind_: If an empty Land space has more than 4 Normal Humans around it, then similar to Conway's Game of Life, we produce another Normal Human in that space.
  
  2. _Doctor Spawn_: We airdrop a Doctor into a random empty Land space every turn, so as to help build quarantine Barriers and immunize Normal Humans (see Survival Rules). 
  
  3. _Repopulation_: We airdrop 2 Normal Humans into a random empty Land space every turn, so as to repopulate areas decimated by the disease.

## Disease

There are several rules governing the survival of Normal Humans and Doctors:
  1. _Spread_: Once infected, a Human spreads the Disease to his/her immediate Human neighbors in the next turn.
  
  2. _Fatality Rate_: With 1/3 probability, a Diseased Human dies in the next turn. With 1/10 probability, a Diseased Human heals and returns to Normal in the next turn.
  
  3. _Immunization_: With 1/2 probability, a healthy Doctor can self-immunize himself before infection, thus halting the spread of the Disease. With 1/3 probability, a Doctor can immunize an immediate neighbor, Diseased or Healthy. 
  
  4. _Barriers_: If 2 Doctors are near an empty Land space, then upon detecting a nearby Diseased Human, they can place a Barrier on the Land in an attempt to halt the Disease's spread. 
  
  5. _Annihilation_: If no Humans are left, then a Nuke clears out the entirety of the world, allowing for new world generation and repopulation. 

## Duplicities

Unfortunately, the world contains several greedy politicians, who seek to gain popularity and promote an image of safety. They do so by knocking down Barriers and throwing Banquets, i.e. public gatherings where Humans are more likely to get sick.

The visualizer uses audio input within a separate AudioAnalyzer class to generate Duplicities. In particular, the following rules apply:

  1. _Sudden Noise_: If you make noise that is louder than the average noise one second earlier, then you generate a Banquet in an empty Land space. The popularity (number of Human neighbors) of the Banquet is determined by how much louder your noise is than the noises before it.
  
  2. _Timbre_: The location of the Banquet is determined by the spectral centroid of your noise (i.e., the "color" or "timbre" of the noise) as well as its loudness. (See Infection Rules)
  
  3. _Infection_: If anyone neighboring a banquet gets infected with a Disease, then ALL banquet neighbors subsequently become infected in the next turn. 

  3. _Barrier Breaking_: If there is a Barrier nearby, the Barrier is removed to cut costs, allowing in Disease.



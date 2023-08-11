// Wait for the window to load before running the code
window.addEventListener("load", function(){
 // Get the canvas element and its 2D rendering context
 const canvas = document.getElementById('canvas1');
 const ctx = canvas.getContext('2d');

 // Set the dimensions of the canvas
 canvas.width = 1280;
 canvas.height = 720;

//this.game does not take a copy of the game object, it points to a space in the memory where the game is stored. Objects in JS are so called reference data types
//can split classes in to seperate folders to make it more moduler
 class Player {
  constructor(game) {
      this.game = game; // Store a reference to the game object
  }
 }

 class Game {
  constructor(canvas) {
      this.canvas = canvas;
      this.width = this.canvas.width;
      this.height = this.canvas.height;
      this.player = new Player(this); // Create a player object associated with this game
  }
 }

 // Create a new instance of the Game class, passing the canvas
 const game = new Game(canvas);
 console.log(game);
 function animate() {

 }
});
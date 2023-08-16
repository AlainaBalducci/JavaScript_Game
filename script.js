// Wait for the window to load before running the code
window.addEventListener("load", function(){
 // Get the canvas element and its 2D rendering context
 const canvas = document.getElementById('canvas1');
 const ctx = canvas.getContext('2d');

 // Set the dimensions of the canvas
 canvas.width = 1280;
 canvas.height = 720;

 //outside methods so these properties only load once
 ctx.fillStyle = 'white';
 ctx.lineWidth = 3;
 ctx.strokeStyle = 'white';
//this.game does not take a copy of the game object, it points to a space in the memory where the game is stored. Objects in JS are so called reference data types
//can split classes in to seperate folders to make it more moduler
 class Player {
  constructor(game) {
      this.game = game; // Store a reference to the game object
      this.collisionX = this.game.width * 0.5;
      this.collisionY = this.game.height * 0.5;
      this.collisionRadius = 30;
  }
  draw(context) {
    context.beginPath();
    context.arc(this.collisionX, this.collisionY, this.collisionRadius, 0, Math.PI * 2); //create circle
    context.save(); //Save and restore methods allow us to apply specific drawing settings only to selective shapes, w/o affecting the rest of the canvas drawings
    context.globalAlpha = 0.5; //use globalalpha property to set opacity of the shapes we are drawing only effects the fill this time.
    context.fill(); 
    context.restore(); //to limit certain canvas settings only specific to draw calls can wrap the drawing code between save() and restore() built in canvas methods 
    context.stroke(); //will not have the opacity set by glabalAlpha
  }
 }

 class Game {
  constructor(canvas) {
      this.canvas = canvas;
      this.width = this.canvas.width;
      this.height = this.canvas.height;
      this.player = new Player(this); // Create a player object associated with this game
      this.mouse = {
       x: this.width * 0.5,
       y: this.height * 0.5,
       pressed: false
      }
      //event listener
      //ES6 arrow functions automatically inherit the reference to 'this' keyword from the parent scope. If we used the function() instead, we would get an error that mouse is not defined.
      canvas.addEventListener('mousedown', (e) => {
       this.mouse.x = e.offsetX;
       this.mouse.y = e.offsetY;
       this.mouse.pressed = true;
      });
      canvas.addEventListener('mouseup', (e) => {
       this.mouse.x = e.offsetX;
       this.mouse.y = e.offsetY;
       this.mouse.pressed = false;
      });
      canvas.addEventListener('mousemove', (e) => {
       this.mouse.x = e.offsetX;
       this.mouse.y = e.offsetY;
       this.mouse.pressed = false;
       //console.log(this.mouse.x);
      });
  }
  render(context) {
   this.player.draw(context);
  }
 }

 // Create a new instance of the Game class, passing the canvas
 const game = new Game(canvas);
 game.render(ctx);
 console.log(game);
 function animate() {

 }
});
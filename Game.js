import { Player } from "./Player.js";
import { Obstacle } from "./Obstacle.js";
import { Egg } from "./Egg.js";
import { Enemy } from "./Enemy.js";

class Game {
 constructor(canvas) {
   this.canvas = canvas;
   this.width = this.canvas.width;
   this.height = this.canvas.height;
   this.topMargin = 260;
   this.debug = true;
   this.player = new Player(this); // Create a player object associated with this game
   this.fps = 70;
   this.timer = 0;
   this.interval = 1000 / this.fps;
   this.eggTimer = 0;
   this.eggInterval = 1000;
   this.numberOfObstacles = 10;
   this.maxEggs = 5;
   this.obstacles = [];
   this.eggs = [];
   this.enemies = [];
   this.hatchlings = [];
   this.particles = [];
   this.gameObjects = [];
   this.score = 0;
   this.winningScore = 20;
   this.gameOver = false;
   this.lostHatchlings = 0;
   this.mouse = {
     x: this.width * 0.5,
     y: this.height * 0.5,
     pressed: false,
   };
   //event listener
   //ES6 arrow functions automatically inherit the reference to 'this' keyword from the parent scope. If we used the function() instead, we would get an error that mouse is not defined.
   canvas.addEventListener("mousedown", (e) => {
     this.mouse.x = e.offsetX;
     this.mouse.y = e.offsetY;
     this.mouse.pressed = true;
   });
   canvas.addEventListener("mouseup", (e) => {
     this.mouse.x = e.offsetX;
     this.mouse.y = e.offsetY;
     this.mouse.pressed = false;
   });
   canvas.addEventListener("mousemove", (e) => {
     if (this.mouse.pressed) {
       this.mouse.x = e.offsetX;
       this.mouse.y = e.offsetY;
     }
   });
   window.addEventListener("keydown", (e) => {
     if (e.key == "d") this.debug = !this.debug;
    else if (e.key == "r") this.restart();
   });
 }
 render(context, deltaTime) {
   if (this.timer > this.interval) {
     //animate next frame
     context.clearRect(0, 0, this.width, this.height);
     this.gameObjects = [
       this.player,
       ...this.eggs,
       ...this.obstacles,
       ...this.enemies,
       ...this.hatchlings,
       ...this.particles,
     ];
     //sort by vertical position with optional argument
     this.gameObjects.sort((a, b) => {
       return a.collisionY - b.collisionY;
     });
     //calling draw() and update() on all gameObjects, so player 1st, eggs 2nd, obstacles 3rd. sort method used above to fix this
     this.gameObjects.forEach((object) => {
       object.draw(context);
       object.update(deltaTime);
     });

     this.timer = 0;
   }
   this.timer += deltaTime;

   //add eggs periodically
   if (this.eggTimer > this.eggInterval && this.eggs.length < this.maxEggs && !this.gameOver) {
     this.addEgg();
     this.eggTimer = 0;
     console.log(this.eggs);
   } else {
     this.eggTimer += deltaTime;
   }

   //draw status text
   context.save();
   context.textAlign = "left";
   context.fillText("Score: " + this.score, 25, 50);
   if (this.debug) {
     context.fillText("Lost: " + this.lostHatchlings, 25, 100);
   }
   context.restore();
   //win or lose message
   if (this.score >= this.winningScore || this.lostHatchlings > 5) {
    this.gameOver = true;
    context.save();
    context.fillStyle = 'rgba(0,0,0,0.5)';
    context.fillRect(0, 0, this.width, this.height);
    context.fillStyle = 'white';
    context.textAlign = 'center';
    //shadow is performance expensive, but since it is between a save and restore it should be ok, set numbers if you want the shadow to be to the right or left based on positive and negative values, and Y vertical position to parent shape
    context.shadowOffsetX = 4;
    context.shadowOffsetY = 4;
    context.shadowColor = 'black';
    let message1;
    let message2;
    if (this.lostHatchlings <= 5) {
     //win
     message1 = "Bullseye!!!"
     message2 = "You bullied the bullies!!!"
    } else {
     //lose
     message1 = "Crap!!!"
     message2 = "You lost " + this.lostHatchlings + " hatchlings, don't be a pushover!!!";
    }
    context.font = '130px Bangers';
    context.fillText(message1, this.width * 0.5, this.height * 0.5 - 20);
    context.font = '40px Bangers';
    context.fillText(message2, this.width * 0.5, this.height * 0.5 + 30);
    context.fillText("Final score " + this.score + ". press 'R' to butt heads again!", this.width * 0.5, this.height * 0.5 + 80);
    context.restore();
   }
 }
 checkCollision(a, b) {
   const dx = a.collisionX - b.collisionX;
   const dy = a.collisionY - b.collisionY;
   const distance = Math.hypot(dy, dx);
   const sumOfRadii = a.collisionRadius + b.collisionRadius;
   return [distance < sumOfRadii, distance, sumOfRadii, dx, dy];
 }
 //can pass this keyword for the expected game paramator because we are in the game class
 addEgg() {
   this.eggs.push(new Egg(this));
 }
 addEnemy() {
   this.enemies.push(new Enemy(this));
 }
 removeGameObjects() {
   this.eggs = this.eggs.filter((object) => !object.markedForDeletion);
   this.hatchlings = this.hatchlings.filter(
     (object) => !object.markedForDeletion
   );
   this.particles = this.particles.filter(
     (object) => !object.markedForDeletion
   );
 }
 restart() {
   this.player.restart();
   this.obstacles = [];
   this.eggs = [];
   this.enemies = [];
   this.hatchlings = [];
   this.particles = [];
   this.mouse = {
     x: this.width * 0.5,
     y: this.height * 0.5,
     pressed: false,
   };
   this.score = 0;
   this.lostHatchlings = 0;
   this.gameOver = false;
   this.init();
 }
 //circle packing (brute force algorithm)
 init() {
   for (let i = 0; i < 5; i++) {
     this.addEnemy();
   }
   let attempts = 0;
   while (this.obstacles.length < this.numberOfObstacles && attempts < 500) {
     let testObstacle = new Obstacle(this);
     let overlap = false;
     this.obstacles.forEach((obstacle) => {
       const dx = testObstacle.collisionX - obstacle.collisionX;
       const dy = testObstacle.collisionY - obstacle.collisionY;
       const distance = Math.hypot(dy, dx);
       const distanceBuffer = 150;
       const sumOfRadii =
         testObstacle.collisionRadius +
         obstacle.collisionRadius +
         distanceBuffer;
       if (distance < sumOfRadii) {
         overlap = true;
       }
     });
     const margin = testObstacle.collisionRadius * 3;
     if (
       !overlap &&
       testObstacle.spriteX > 0 &&
       testObstacle.spriteX < this.width - testObstacle.width &&
       testObstacle.collisionY > this.topMargin + margin &&
       testObstacle.collisionY < this.height - margin
     ) {
       this.obstacles.push(testObstacle);
     }
     attempts++;
   }
 }
}

export { Game };
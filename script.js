// Wait for the window to load before running the code
window.addEventListener("load", function () {
  // Get the canvas element and its 2D rendering context
  const canvas = document.getElementById("canvas1");
  const ctx = canvas.getContext("2d");

  // Set the dimensions of the canvas
  canvas.width = 1280;
  canvas.height = 720;

  //outside methods so these properties only load once
  ctx.fillStyle = "white";
  ctx.lineWidth = 3;
  ctx.strokeStyle = "white";
  //this.game does not take a copy of the game object, it points to a space in the memory where the game is stored. Objects in JS are so called reference data types
  //can split classes in to seperate folders to make it more moduler
  class Player {
    constructor(game) {
      this.game = game; // Store a reference to the game object
      this.collisionX = this.game.width * 0.5;
      this.collisionY = this.game.height * 0.5;
      this.collisionRadius = 30;
      this.speedX = 0;
      this.speedY = 0;
      this.dx = 0;
      this.dy = 0;
      this.speedModifier = 3;
      this.spriteWidth = 255;
      this.spriteHeight = 255;
      this.width = this.spriteWidth;
      this.height = this.spriteHeight;
      this.spriteX;
      this.spriteY;
      this.frameX = 0;
      this.frameY = 0;
      this.image = document.getElementById('bull');
    }
    draw(context) {
     context.drawImage(this.image, this.frameX * this.spriteWidth, this.frameY * this.spriteHeight, this.spriteWidth, this.spriteHeight, this.spriteX, this.spriteY, this.width, this.height);
      context.beginPath();
      context.arc(
        this.collisionX,
        this.collisionY,
        this.collisionRadius,
        0,
        Math.PI * 2
      ); //create circle
      context.save(); //Save and restore methods allow us to apply specific drawing settings only to selective shapes, w/o affecting the rest of the canvas drawings
      context.globalAlpha = 0.5; //use globalalpha property to set opacity of the shapes we are drawing only effects the fill this time.
      context.fill();
      context.restore(); //to limit certain canvas settings only specific to draw calls can wrap the drawing code between save() and restore() built in canvas methods
      context.stroke(); //will not have the opacity set by glabalAlpha
      context.beginPath();
      context.moveTo(this.collisionX, this.collisionY);
      context.lineTo(this.game.mouse.x, this.game.mouse.y);
      context.stroke();
    }
    //using the hypotonuse gives us a constance speed for our player
    update() {
      this.dx = this.game.mouse.x - this.collisionX;
      this.dy = this.game.mouse.y - this.collisionY;
     //sprite animation
     //Math.atan2() returns an angle in radians between the positive x axis and a line, projected from 0, 0 towards a specific point (use here angle from player to mouse cursor)full circle 2pi radians
     const angle = Math.atan2(this.dy, this.dx);
     if (angle < -2.74 || angle > 2.74) this.frameY = 6;
     else if (angle < -1.96) this.frameY = 7;
     else if (angle < -1.17) this.frameY = 0;
     else if (angle < -0.39) this.frameY = 1;
     else if (angle < 0.39) this.frameY = 2;
     else if (angle < 1.17) this.frameY = 3;
     else if (angle < 1.96) this.frameY = 4;
     else if (angle < 2.74) this.frameY = 5;
    

      const distance = Math.hypot(this.dy, this.dx);
      if (distance > this.speedModifier) {
       this.speedX = this.dx / distance || 0;
       this.speedY = this.dy / distance || 0;
      } else { 
       this.speedX = 0;
       this.speedY = 0;
      }
      this.collisionX += this.speedX * this.speedModifier;
      this.collisionY += this.speedY * this.speedModifier;
      this.spriteX = this.collisionX - this.width * 0.5;
      //use -100 to move collision point to bottom of player sprite
      this.spriteY = this.collisionY - this.height * 0.5 -100;
      //collision with obstacles
      this.game.obstacles.forEach(obstacle => {
       //checkCollision returns [(distance < sumOfRadii), distance, sumOfRadii, dx, dy]
       //destructuring assignment: syntax in JS expression that makes it possible to unpack values from arrays, or properties from objects, into distinct variables. Example: let collision = game.checkCollision(this, obstacle)[0]; etc...
       let [collision, distance, sumOfRadii, dx, dy] = this.game.checkCollision(this, obstacle)
       if (collision) {
        //this code pushes player 1 px outside the collision radius of the obstacle in the direction away from the center point 
        //value between -1 and +1
        const unit_x = dx / distance;
        const unit_y = dy / distance;
        this.collisionX = obstacle.collisionX + (sumOfRadii + 1) * unit_x;
        this.collisionY = obstacle.collisionY + (sumOfRadii + 1) * unit_y;
      // console.log(unit_x, unit_y);
       };
      })
    }
  }
  //have access to these properties because of pointing to the game object
  //each sprite is 250px X 250px
  //want collision radius to be close to the base of the sprite where the stone is so can use hard coded value to get where we want (-70)
  class Obstacle {
   constructor(game) {
    this.game = game;
    this.collisionX = Math.random() * this.game.width;
    this.collisionY = Math.random() * this.game.height;
    this.collisionRadius = 60;
    this.image = document.getElementById('obstacles');
    this.spriteWidth = 250;
    this.spriteHeight = 250;
    this.width = this.spriteWidth;
    this.height = this.spriteHeight;
    this.spriteX = this.collisionX - this.width * 0.5;
    this.spriteY = this.collisionY - this.height * 0.5 - 70;
    this.frameX = Math.floor(Math.random() * 4);
    this.frameY = Math.floor(Math.random() * 3);
   }
   draw(context) {
    context.drawImage(this.image, this.frameX * this.spriteWidth, this.frameY * this.spriteHeight, this.spriteWidth, this.spriteHeight, this.spriteX, this.spriteY, this.width, this.height);
    context.beginPath();
    context.arc(
      this.collisionX,
      this.collisionY,
      this.collisionRadius,
      0,
      Math.PI * 2
    ); 
    context.save();
    context.globalAlpha = 0.5; 
    context.fill();
    context.restore(); 
    context.stroke();
   }
  }

  class Game {
    constructor(canvas) {
      this.canvas = canvas;
      this.width = this.canvas.width;
      this.height = this.canvas.height;
      this.topMargin = 260;
      this.player = new Player(this); // Create a player object associated with this game
      this.numberOfObstacles = 10;
      this.obstacles = [];
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
    }
    render(context) {
      this.player.draw(context);
      this.player.update();
      this.obstacles.forEach(obstacle => obstacle.draw(context));
    }
    checkCollision(a, b) {
     const dx = a.collisionX - b.collisionX;
     const dy = a.collisionY - b.collisionY;
     const distance = Math.hypot(dy, dx);
     const sumOfRadii = a.collisionRadius + b.collisionRadius;
     return [(distance < sumOfRadii), distance, sumOfRadii, dx, dy];
    }
    //circle packing (brute force algorithm)
    init() {
      let attempts = 0;
      while (this.obstacles.length < this.numberOfObstacles && attempts < 500) {
       let testObstacle = new Obstacle(this);
       let overlap = false;
       this.obstacles.forEach(obstacle => {
        const dx = testObstacle.collisionX - obstacle.collisionX;
        const dy = testObstacle.collisionY - obstacle.collisionY;
        const distance = Math.hypot(dy, dx);
        const distanceBuffer = 150;
        const sumOfRadii = testObstacle.collisionRadius + obstacle.collisionRadius + distanceBuffer;
        if (distance < sumOfRadii) {
         overlap = true;
        }
       });
       const margin = testObstacle.collisionRadius * 2;
       if (!overlap && testObstacle.spriteX > 0 && testObstacle.spriteX < this.width - testObstacle.width && testObstacle.collisionY > this.topMargin + margin && testObstacle.collisionY < this.height - margin) {
        this.obstacles.push(testObstacle);
       }
        attempts++;
      }
      }
    
  }

  // Create a new instance of the Game class, passing the canvas
  const game = new Game(canvas);
  game.init();
  console.log(game);
  //console.log(game);
  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    game.render(ctx);
    requestAnimationFrame(animate);
  }
  animate();
});

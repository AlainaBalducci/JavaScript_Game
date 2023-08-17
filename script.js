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
  ctx.font = '40px Helvetica';
  ctx.textAlign = 'center';
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
      this.spriteHeight = 256;
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
     if (this.game.debug) {
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
      //horizinatal boundaries
      if (this.collisionX < this.collisionRadius) {
       this.collisionX = this.collisionRadius;
      } else if (this.collisionX > this.game.width - this.collisionRadius) { 
       this.collisionX = this.game.width - this.collisionRadius;
      }
      //vertical boundaries
      if (this.collisionY < this.game.topMargin + this.collisionRadius) {
       this.collisionY = this.game.topMargin + this.collisionRadius;
      } else if (this.collisionY > this.game.height - this.collisionRadius) {
       this.collisionY = this.game.height - this.collisionRadius;
      }
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
    this.collisionRadius = 40;
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
    if (this.game.debug) {
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
   update() {

   }
  }

  class Egg {
   constructor(game) {
    this.game = game;
    this.collisionRadius = 40;
    this.margin = this.collisionRadius * 2;
    this.collisionX = this.margin + (Math.random() * (this.game.width - this.margin * 2));
    this.collisionY = this.game.topMargin + (Math.random() * (this.game.height - this.game.topMargin - this.margin));
    this.collisionRadius = 40;
    this.image = document.getElementById('egg');
    this.spriteWidth = 110;
    this.spriteHeight = 135;
    this.width = this.spriteWidth;
    this.height = this.spriteHeight;
    this.spriteX;
    this.spriteY;
    this.hatchTimer = 0;
    this.hatchInterval = 3000;
    this.markedForDeletion = false;
   }
   draw (context) {
    context.drawImage(this.image, this.spriteX, this.spriteY);
    if (this.game.debug) {
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
    const displayTimer = (this.hatchTimer * 0.001).toFixed(0);
    context.fillText(displayTimer, this.collisionX, this.collisionY - this.collisionRadius * 2.5);
    }
   }
   //spread operator allows us to quickly expand elements in an array into another array
   update(deltaTime) {
    this.spriteX = this.collisionX - this.width * 0.5;
    this.spriteY = this.collisionY - this.height * 0.5 - 30;
    //added enemies so now they can push the eggs around
    //collisions
    let collisionObjects = [this.game.player, ...this.game.obstacles, ...this.game.enemies];
    collisionObjects.forEach(object => {
     let [collision, distance, sumOfRadii, dx, dy] = this.game.checkCollision(this, object);
     if (collision) {
      const unit_x = dx / distance;
      const unit_y = dy / distance;
      this.collisionX = object.collisionX + (sumOfRadii + 1) * unit_x;
      this.collisionY = object.collisionY + (sumOfRadii + 1) * unit_y;
     }
    });
    //hatching
    if (this.hatchTimer > this.hatchInterval) {
     this.game.hatchlings.push(new Larva(this.game, this.collisionX, this.collisionY));
     this.markedForDeletion = true;
     this.game.removeGameObjects();
    } else {
     this.hatchTimer += deltaTime;
    }
   }
  }

  class Larva {
   constructor(game, x, y) {
    this.game = game;
    this.collisionX = x;
    this.collisionY = y;
    this.collisionRadius = 30;
    this.image = document.getElementById('larva');
    this.spriteWidth = 150;
    this.spriteHeight = 150;
    this.width = this.spriteWidth;
    this.height = this.spriteHeight;
    this.spriteX;
    this.spriteY;
    this.speedY = 1 + Math.random();
   }
   draw(context) {
    context.drawImage(this.image, 0, 0, this.spriteWidth, this.spriteHeight, this.spriteX, this.spriteY, this.width, this.height);
    if (this.game.debug) {
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
   update() {
    this.collisionY -= this.speedY;
    this.spriteX = this.collisionX - this.width * 0.5;
    this.spriteY = this.collisionY - this.height * 0.5 - 50;
    //check if the move to safety
    if (this.collisionY < this.game.topMargin) {
     this.markedForDeletion = true;
     this.game.removeGameObjects();
    }
   }
  }

  class Enemy {
   constructor(game) {
    this.game = game;
    this.collisionRadius = 30;
    this.speedX = Math.random() * 3 + 0.5;
    this.image = document.getElementById('toad');
    this.spriteWidth = 140;
    this.spriteHeight = 260;
    this.width = this.spriteWidth;
    this.height = this.spriteHeight;
    this.collisionX = this.game.width + this.width + Math.random() * this.game.width * 0.5;
    this.collisionY = this.game.topMargin + (Math.random() * (this.game.height - this.game.topMargin));
    this.spriteX;
    this.spriteY;
   }
   draw(context) {
    context.drawImage(this.image, this.spriteX, this.spriteY);
    if (this.game.debug) {
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
   update() {
    this.spriteX = this.collisionX - this.width * 0.5;
    this.spriteY = this.collisionY - this.height + 40;
    this.collisionX -= this.speedX;
    if (this.spriteX + this.width < 0) {
     this.collisionX = this.game.width + this.width + Math.random() * this.game.width * 0.5;
     this.collisionY = this.game.topMargin + (Math.random() * (this.game.height - this.game.topMargin));
    }
    let collisionObjects = [this.game.player, ...this.game.obstacles];
    collisionObjects.forEach(object => {
     let [collision, distance, sumOfRadii, dx, dy] = this.game.checkCollision(this, object);
     if (collision) {
      const unit_x = dx / distance;
      const unit_y = dy / distance;
      this.collisionX = object.collisionX + (sumOfRadii + 1) * unit_x;
      this.collisionY = object.collisionY + (sumOfRadii + 1) * unit_y;
     }
    });
   }
  }

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
      this.interval = 1000/this.fps;
      this.eggTimer = 0;
      this.eggInterval = 1000;
      this.numberOfObstacles = 10;
      this.maxEggs = 20;
      this.obstacles = [];
      this.eggs = [];
      this.enemies = [];
      this.hatchlings = [];
      this.gameObjects = [];
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
       if (e.key == 'd') this.debug = !this.debug;
     });
    }
    render(context, deltaTime) {
     if (this.timer > this.interval) {
      //animate next frame
      context.clearRect(0, 0, this.width, this.height)
      this.gameObjects = [this.player, ...this.eggs, ...this.obstacles, ...this.enemies, ...this.hatchlings];
       //sort by vertical position with optional argument
       this.gameObjects.sort((a, b) => {
        return a.collisionY - b.collisionY;
       });
      //calling draw() and update() on all gameObjects, so player 1st, eggs 2nd, obstacles 3rd. sort method used above to fix this
      this.gameObjects.forEach(object => {
       object.draw(context);
       object.update(deltaTime);
      });
     
      this.timer = 0;
     }
      this.timer += deltaTime

      //add eggs periodically
     if (this.eggTimer > this.eggInterval && this.eggs.length < this.maxEggs) {
      this.addEgg();
      this.eggTimer = 0;
      console.log(this.eggs);
     } else {
      this.eggTimer += deltaTime;
     }
      
    }
    checkCollision(a, b) {
     const dx = a.collisionX - b.collisionX;
     const dy = a.collisionY - b.collisionY;
     const distance = Math.hypot(dy, dx);
     const sumOfRadii = a.collisionRadius + b.collisionRadius;
     return [(distance < sumOfRadii), distance, sumOfRadii, dx, dy];
    }
    //can pass this keyword for the expected game paramator because we are in the game class
    addEgg() {
     this.eggs.push(new Egg(this));
    }
    addEnemy() {
     this.enemies.push(new Enemy(this));
    }
    removeGameObjects() {
     this.eggs = this.eggs.filter(object => !object.markedForDeletion);
     this.hatchlings = this.hatchlings.filter(object => !object.markedForDeletion);
    }
    //circle packing (brute force algorithm)
    init() {
     for(let i = 0; i < 3; i++) {
      this.addEnemy();
     }
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
       const margin = testObstacle.collisionRadius * 3;
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
  //requestAnimationFrame() will automatically try to adjust itself to the screen refresh rate, in most cases 60fps, will also auto generate a timestamp
  //deltaTime: is the difference between timeStamp from this animation loop and the timeStamp from the previous animation loop. Game will run similarly on all machines now (used in render method)
  let lastTime = 0;
  function animate(timeStamp) {
    const deltaTime = timeStamp - lastTime;
    lastTime = timeStamp;
    game.render(ctx, deltaTime);
    requestAnimationFrame(animate);
  }
  animate(0);
});

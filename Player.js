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
     this.image = document.getElementById("bull");
   }
   //move player back to original position, sprite image moves with the collision circle
   restart() {
     this.collisionX = this.game.width * 0.5;
     this.collisionY = this.game.height * 0.5;
     this.spriteX = this.collisionX - this.width * 0.5;
     this.spriteY = this.collisionY - this.height * 0.5 - 100;

   }
   draw(context) {
     context.drawImage(
       this.image,
       this.frameX * this.spriteWidth,
       this.frameY * this.spriteHeight,
       this.spriteWidth,
       this.spriteHeight,
       this.spriteX,
       this.spriteY,
       this.width,
       this.height
     );
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
     this.spriteY = this.collisionY - this.height * 0.5 - 100;
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
     this.game.obstacles.forEach((obstacle) => {
       //checkCollision returns [(distance < sumOfRadii), distance, sumOfRadii, dx, dy]
       //destructuring assignment: syntax in JS expression that makes it possible to unpack values from arrays, or properties from objects, into distinct variables. Example: let collision = game.checkCollision(this, obstacle)[0]; etc...
       let [collision, distance, sumOfRadii, dx, dy] =
         this.game.checkCollision(this, obstacle);
       if (collision) {
         //this code pushes player 1 px outside the collision radius of the obstacle in the direction away from the center point
         //value between -1 and +1
         const unit_x = dx / distance;
         const unit_y = dy / distance;
         this.collisionX = obstacle.collisionX + (sumOfRadii + 1) * unit_x;
         this.collisionY = obstacle.collisionY + (sumOfRadii + 1) * unit_y;
         // console.log(unit_x, unit_y);
       }
     });
   }
 }

 export { Player };
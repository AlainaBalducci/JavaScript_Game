//have access to these properties because of pointing to the game object
  //each sprite is 250px X 250px
  //want collision radius to be close to the base of the sprite where the stone is so can use hard coded value to get where we want (-70)
  class Obstacle {
   constructor(game) {
     this.game = game;
     this.collisionX = Math.random() * this.game.width;
     this.collisionY = Math.random() * this.game.height;
     this.collisionRadius = 40;
     this.image = document.getElementById("obstacles");
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
       );
       context.save();
       context.globalAlpha = 0.5;
       context.fill();
       context.restore();
       context.stroke();
     }
   }
   update() {}
 }

 export { Obstacle };
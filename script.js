import { Game } from "./Game.js";

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
  ctx.strokeStyle = "black";
  ctx.font = "40px Bangers";
  ctx.textAlign = "center";



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

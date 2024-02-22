/**@type{HTMLCanvasElement} */

class Game {
  constructor(canvas, context) {
    this.canvas = canvas;
    this.ctx = context;
    this.width = this.canvas.width;
    this.height = this.canvas.height;
    this.baseHeight = 720;
    this.ratio = this.height / this.baseHeight;
    this.sound = new Audio();
    this.gravity;
    this.speed = 0;
    this.minSpeed;
    this.maxSpeed;
    this.background = new Background(this);
    this.player = new Player(this);
    this.obstaclesArray = [];
    this.numOfObstacles = 1;
    this.resize(window.innerWidth, window.innerHeight);
    this.score;
    this.gameOver;
    this.bottomMargin;
    this.timer;
    this.message1;
    this.message2;
    this.smallFont;
    this.largeFont;
    this.eventTimer = 0;
    this.eventInterval = 150;
    this.eventUpdate = false;
    this.touchStartX;
    this.swipeDistance = 50;
    this.debug = false;

    window.addEventListener("resize", (e) => {
      this.resize(e.currentTarget.innerWidth, e.currentTarget.innerHeight);
    });

    //mouse events
    this.canvas.addEventListener("mousedown", (e) => {
      this.player.flap();
    });
    this.canvas.addEventListener("mouseup", (e) => {
      setTimeout(() => {
        this.player.wingsUp();
      }, 50);
    });

    //keyboard events
    window.addEventListener("keydown", (e) => {
      if (e.key === " " || e.key === "Enter") {
        this.player.flap();
      }
      if (e.key === "Shift" || e.key.toLowerCase() === "c") {
        this.player.startCharge();
      }
      if (e.key.toLowerCase() === "r") {
        location.reload();
      }
      if (e.key.toLowerCase() === "d") {
        this.debug = !this.debug;
      }
    });

    window.addEventListener("keyup", (e) => {
      this.player.wingsUp();
    });

    //touch events
    this.canvas.addEventListener("touchstart", (e) => {
      this.player.flap();
      this.touchStartX = e.changedTouches[0].pageX;
    });
    this.canvas.addEventListener("touchmove", (e) => {
      e.preventDefault();
    });
    this.canvas.addEventListener("touchend", (e) => {
      if (e.changedTouches[0].pageX - this.touchStartX > this.swipeDistance) {
        console.log("xxxx");
        this.player.startCharge();
      } else {
        this.player.flap();
        setTimeout(() => {
          this.player.wingsUp();
        }, 50);
      }
    });
    //button controls
    this.startBtn = document.getElementById("startBtn");
    this.fullScreenBtn = document.getElementById("fullScreenBtn");

    this.startBtn.addEventListener("click", (e) => {
      location.reload();
    });
    this.fullScreenBtn.addEventListener("click", (e) => {
      this.toggleFullScreen();
    });
  }
  resize(width, height) {
    this.canvas.width = width;
    this.canvas.height = height;
    this.ctx.textAlign = "right";
    this.ctx.lineWidth = 2;
    this.ctx.strokeStyle = "white";
    this.width = this.canvas.width;
    this.height = this.canvas.height;
    this.ratio = this.height / this.baseHeight;
    this.bottomMargin = Math.floor(50 * this.ratio);
    this.smallFont = Math.ceil(20 * this.ratio);
    this.largeFont = Math.ceil(45 * this.ratio);
    this.ctx.font = this.largeFont + "px Roboto";
    this.gravity = 0.15 * this.ratio;
    this.speed = 2 * this.ratio;
    this.minSpeed = this.speed;
    this.maxSpeed = this.speed * 5;
    this.background.resize();
    this.player.resize();
    this.createObstacles();
    this.obstaclesArray.forEach((obstacle) => {
      obstacle.resize();
    });
    this.score = 0;
    this.gameOver = false;
    this.timer = 0;
  }
  render(deltaTime) {
    if (!this.gameOver) {
      this.timer += deltaTime;
    }
    this.handlePeriodicEvents(deltaTime);
    this.background.draw();
    this.background.update();
    this.drawStatusText();
    this.player.draw();
    this.player.update();
    this.obstaclesArray.forEach((obstacle) => {
      obstacle.update();
      obstacle.draw();
    });
  }
  toggleFullScreen() {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
    } else if (document.exitFullscreen) {
      document.exitFullscreen();
    }
  }
  createObstacles() {
    this.obstaclesArray = [];
    const firstX = this.baseHeight * this.ratio;
    const obstacleSpacing = 600 * this.ratio;
    for (let i = 0; i < this.numOfObstacles; i++) {
      this.obstaclesArray.push(
        new Obstacle(this, firstX + i * obstacleSpacing)
      );
    }
  }
  checkCollision(a, b) {
    let dx = a.collisionX - b.collisionX;
    let dy = a.collisionY - b.collisionY;
    let distance = Math.hypot(dx, dy);
    let sumOfRadii = a.collisionRadius + b.collisionRadius;
    return distance <= sumOfRadii;
  }
  formatTimer() {
    return (this.timer * 0.001).toFixed(2);
  }
  handlePeriodicEvents(deltaTime) {
    if (this.eventTimer < this.eventInterval) {
      this.eventTimer += deltaTime;
      this.eventUpdate = false;
    } else {
      this.eventTimer = this.eventTimer % this.eventInterval;
      this.eventUpdate = true;
    }
  }
  triggerGameOver() {
    if (!this.gameOver) {
      this.gameOver = true;
      if (this.obstaclesArray.length <= 0) {
        this.sound.play(this.sound.win);
      } else {
        this.sound.play(this.sound.lose);
      }
    }
  }
  drawStatusText() {
    this.ctx.save();
    this.ctx.fillText(
      `Score: ${this.score}`,
      this.width - this.smallFont,
      this.largeFont
    );
    this.ctx.textAlign = "left";
    this.ctx.fillText(
      `Timer: ${this.formatTimer()}`,
      this.smallFont,
      this.largeFont
    );
    if (this.gameOver) {
      if (this.player.collided) {
        this.message1 = "Getting Rusty";
        this.message2 = `Collision Time: ${this.formatTimer()} seconds`;
        this.startBtn.classList.add("active");
      } else if (this.obstaclesArray.length <= 0) {
        this.message1 = "You Win Nailed it!";
        this.message2 = `Can you do it faster: ${this.formatTimer()} seconds`;
        this.startBtn.classList.add("active");
      }
      this.ctx.textAlign = "center";
      this.ctx.font = this.largeFont + "px Roboto";
      this.ctx.fillText(
        this.message1,
        this.width * 0.5,
        this.height * 0.5 - this.largeFont,
        this.width
      );
      this.ctx.font = this.smallFont + "px  Roboto";
      this.ctx.fillText(
        this.message2,
        this.width * 0.5,
        this.height * 0.5 - this.smallFont,
        this.innerWidth
      );
      this.ctx.fillText(
        "Press 'R'  or Click S btn to try again! ",
        this.width * 0.5,
        this.height * 0.5,
        this.width
      );
    }
    if (this.player.energy <= this.player.minEnergy) {
      this.ctx.fillStyle = "red";
    } else if (this.player.energy >= this.player.maxEnergy) {
      this.ctx.fillStyle = "green";
    }
    for (let i = 0; i <= this.player.energy; i++) {
      this.ctx.fillRect(
        10,
        this.height - 10 - this.player.barSize * i,
        this.player.barSize * 5,
        this.player.barSize
      );
    }
    this.ctx.restore();
  }
}

window.addEventListener("load", function () {
  const canvas = document.getElementById("canvas1");
  const ctx = canvas.getContext("2d");
  canvas.width = 720;
  canvas.height = 720;

  const game = new Game(canvas, ctx);
  let lastTime = 0;
  function animate(timeStamp) {
    const deltaTime = timeStamp - lastTime;
    lastTime = timeStamp;
    //ctx.clearRect(0, 0, canvas.width, canvas.height);
    game.render(deltaTime);

    requestAnimationFrame(animate);
  }
  animate(0);

  //load function end
});

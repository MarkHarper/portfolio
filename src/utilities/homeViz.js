const PARTICLE_COUNT = 45;
const MIN_DISTANCE = 80;
const SPRING_STRENGTH = 0.0015;

export function background(width, height, canvas) {
  const particles = [];
  const ctx = canvas.getContext("2d");

  const draw = () => {
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const particle = particles[i];
      particle.x += particle.vx;
      particle.y += particle.vy;
      if (particle.x > width) {
        particle.x = 0;
      } else if (particle.x < 0) {
        particle.x = width;
      }
      if (particle.y > height) {
        particle.y = 0;
      } else if (particle.y < 0) {
        particle.y = height;
      }
      particle.update();
    }

    for (let j = 0; j < PARTICLE_COUNT; j++) {
      const partA = particles[j];
      for (let k = j + 1; k < PARTICLE_COUNT; k++) {
        const partB = particles[k];
        const dx = partB.x - partA.x;
        const dy = partB.y - partA.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist <= partB.radius + partA.radius) {
          checkCollision(partA, partB, dx, dy);
        } else if (dist < MIN_DISTANCE) {
          spring(partA, partB, dx, dy, dist);
        }
      }
    }
  };

  const initialize = (width, height) => {
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      let ball;
      if (Math.random() > 0.66) {
        ball = new Ball(ctx, 5);
        ball.mass = 3;
        ball.setFillColor("#26A69A");
        ball.vx = Math.random() * 2 - 1;
        ball.vy = Math.random() * 2 - 1;
      } else {
        ball = new Ball(ctx, 3);
        ball.mass = 2;
        ball.setFillColor("#8BE5DC");
        ball.vx = Math.random() * 4 - 2;
        ball.vy = Math.random() * 4 - 2;
      }
      ball.x = Math.random() * width;
      ball.y = Math.random() * height;
      particles[i] = ball;
    }
    run();
  };

  function spring(partA, partB, dx, dy, dist) {
    const alpha = (255 - 255 * (dist / MIN_DISTANCE)) / 255;
    ctx.beginPath();
    ctx.strokeStyle = "rgba(38, 166, 154, " + alpha + ")";
    ctx.moveTo(partA.x, partA.y);
    ctx.lineTo(partB.x, partB.y);
    ctx.closePath();
    ctx.stroke();
    const ax = dx * SPRING_STRENGTH;
    const ay = dy * SPRING_STRENGTH;
    partA.vx += ax;
    partA.vy += ay;
    partB.vx -= ax;
    partB.vy -= ay;
  }

  function checkCollision(ball0, ball1, dx, dy) {
    const angle = Math.atan2(dy, dx);
    const sine = Math.sin(angle);
    const cosine = Math.cos(angle);
    const pos0 = new Point(0, 0);
    const pos1 = rotate(dx, dy, sine, cosine, true);
    const vel0 = rotate(ball0.vx, ball0.vy, sine, cosine, true);
    const vel1 = rotate(ball1.vx, ball1.vy, sine, cosine, true);
    const vxTotal = vel0.x - vel1.x;
    vel0.x =
      ((ball0.mass - ball1.mass) * vel0.x + 2 * ball1.mass * vel1.x) /
      (ball0.mass + ball1.mass);
    vel1.x = vxTotal + vel0.x;

    const absV = Math.abs(vel0.x) + Math.abs(vel1.x);
    const overlap = ball0.radius + ball1.radius - Math.abs(pos0.x - pos1.x);

    pos0.x += (vel0.x / absV) * overlap;
    pos1.x += (vel1.x / absV) * overlap;

    const pos0F = rotate(pos0.x, pos0.y, sine, cosine, false);
    const pos1F = rotate(pos1.x, pos1.y, sine, cosine, false);

    ball1.x = ball0.x + pos1F.x;
    ball1.y = ball0.y + pos1F.y;
    ball0.x = ball0.x + pos0F.x;
    ball0.y = ball0.y + pos0F.y;

    const vel0F = rotate(vel0.x, vel0.y, sine, cosine, false);
    const vel1F = rotate(vel1.x, vel1.y, sine, cosine, false);
    ball0.vx = vel0F.x;
    ball0.vy = vel0F.y;
    ball1.vx = vel1F.x;
    ball1.vy = vel1F.y;
  }

  function rotate(x, y, sine, cosine, reverse) {
    const point = new Point(0, 0);
    if (reverse) {
      point.x = x * cosine + y * sine;
      point.y = y * cosine - x * sine;
    } else {
      point.x = x * cosine - y * sine;
      point.y = y * cosine + x * sine;
    }
    return point;
  }

  function run() {
    ctx.clearRect(0, 0, width, height);
    draw();
    requestAnimationFrame(run);
  }

  initialize(width, height);
}

function Ball(ctx, radius) {
  this.ctx = ctx;
  this.radius = radius;
  this.scaleX = 1.0;
  this.scaleY = 1.0;
  this.strokeColor = "#FFFFFF";
  this.fillColor = "#FFFFFF";
  this.isStroke = false;
  this.isFill = false;
  this.isRollOver = false;
  this.locked = false;
  this.visible = true;
}

Ball.prototype.update = function () {
  if (!this.visible) {
    return;
  } else {
    this.ctx.beginPath();
    this.ctx.arc(this.x, this.y, this.radius, 0, 2 * Math.PI);
    this.ctx.scale(this.scaleX, this.scaleY);
    this.ctx.closePath();

    if (this.isStroke) {
      this.ctx.strokeStyle = this.strokeColor;
    }

    this.ctx.stroke();

    if (this.isFill) {
      this.ctx.fillStyle = this.fillColor;
      this.ctx.fill();
    }
  }
};

Ball.prototype.setStrokeColor = function (strokeColor) {
  this.strokeColor = strokeColor;
  this.isStroke = true;
};

Ball.prototype.setFillColor = function (fillColor) {
  this.fillColor = fillColor;
  this.isFill = true;
};

Ball.prototype.stopDrag = function () {
  this.locked = false;
};

function Point(x, y) {
  this.x = x;
  this.y = y;
}

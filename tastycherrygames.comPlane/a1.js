(function () {
  const C = {
    transparentBackground: true,
    unityYellow: "#fbc02d",
    unityBlue: "#1e88e5",
    obstacleColor: "#ff6b6b",
    bananaColor: "#ffd54f",
    groundHeight: 6,
    loadText: "Wait up... loading game"
  };

  let canvas, ctx, raf, audio;
  let score = 0, high = +localStorage.lgHS || 0;
  let gameOver = false, run = true, prog = 0, frame = 0;
  let finishAnim = false, finishFrame = 0;

  const ASPECT = 600 / 180;
  let canvasWidth, canvasHeight, scale = 1;

  const G = {
    w: 600, h: 180,
    groundY: 140,
    y: 0, v: 0, g: 0.8, j: -12,
    speed: 5,
    obs: [],
    bananas: []
  };

  const minion = [
    "0011111100",
    "0111111110",
    "1111111111",
    "1100110011",
    "1111111111",
    "0111111110",
    "0011111100"
  ];

  function beep(f = 400, d = 0.05) {
    audio ||= new AudioContext();
    const o = audio.createOscillator();
    const g = audio.createGain();
    o.frequency.value = f;
    g.gain.value = 0.05;
    o.connect(g);
    g.connect(audio.destination);
    o.start();
    o.stop(audio.currentTime + d);
  }

  function spawnObstacle() {
    G.obs.push({ x: G.w + 200, w: 12, offset: Math.random() * 4 });
    if (Math.random() < 0.5)
      G.bananas.push({ x: G.w + 260, y: G.groundY - 38 });
  }

  function reset() {
    G.y = G.v = 0;
    G.speed = 5;
    G.obs = [];
    G.bananas = [];
    score = 0;
    gameOver = false;
    finishAnim = false;
    finishFrame = 0;
    for (let i = 0; i < 3; i++) spawnObstacle();
  }

  function jump() {
    if (gameOver) return reset();
    if (G.y === 0) {
      G.v = G.j;
      beep(600);
    }
  }

  function drawMinion(x, y) {
    const p = 3;

    // minion body
    minion.forEach((r, ry) => {
      [...r].forEach((c, rx) => {
        if (c === "1") {
          ctx.fillStyle = C.unityYellow;
          ctx.fillRect((x + rx * p) * scale, (y + ry * p) * scale, p * scale, p * scale);
        }
      });
    });

    // goggles
    ctx.fillStyle = "#ccc";
    ctx.fillRect(3 * scale * p + x * scale, 3 * p * scale + y * scale, 2 * p * scale, p * scale);
    ctx.fillRect(6 * scale * p + x * scale, 3 * p * scale + y * scale, 2 * p * scale, p * scale);

    // eyes
    ctx.fillStyle = "#000";
    ctx.fillRect(4 * scale * p + x * scale, 4 * p * scale + y * scale, p * scale, p * scale);
    ctx.fillRect(7 * scale * p + x * scale, 4 * p * scale + y * scale, p * scale, p * scale);

    // legs animate
    let leftLegX = 3 * p, rightLegX = 7 * p;
    let legOffset = frame % 20 < 10 ? 0 : 2;
    if (!gameOver && !finishAnim) {
      ctx.fillStyle = C.unityBlue;
      ctx.fillRect((leftLegX + legOffset) * scale + x * scale, (7 * p) * scale + y * scale, 2 * scale, 6 * scale);
      ctx.fillRect((rightLegX + (10 - legOffset - 8)) * scale + x * scale, (7 * p) * scale + y * scale, 2 * scale, 6 * scale);
    } else {
      ctx.fillStyle = C.unityBlue;
      ctx.fillRect((leftLegX) * scale + x * scale, (7 * p) * scale + y * scale, 2 * scale, 6 * scale);
      ctx.fillRect((rightLegX) * scale + x * scale, (7 * p) * scale + y * scale, 2 * scale, 6 * scale);
    }
  }

  function update() {
    if (!run) return;
    frame++;

    if (!finishAnim) {
      G.v += G.g;
      G.y += G.v;
      if (G.y > 0) { G.y = 0; G.v = 0; }

      if (!gameOver) {
        G.obs.forEach(o => o.x -= G.speed);
        G.bananas.forEach(b => b.x -= G.speed);
      }

      if (G.obs[0]?.x < -20 && !gameOver) {
        G.obs.shift();
        spawnObstacle();
        score++;
        G.speed += 0.08;
        beep(300);
      }

      G.obs.forEach(o => {
        if (!gameOver && o.x < 70 && o.x + o.w > 40 && G.y === 0) {
          gameOver = true;
          beep(120, 0.2);
          if (score > high) {
            high = score;
            localStorage.lgHS = high;
          }
        }
      });

      G.bananas = G.bananas.filter(b => {
        if (!gameOver && b.x < 60 && b.x > 40 && G.y > -20) {
          score += 5;
          beep(800);
          return false;
        }
        return b.x > -20;
      });

      if (prog >= 0.98 && !finishAnim) finishAnim = true;

    } else {
      finishFrame++;
      G.y = -Math.sin(finishFrame * 0.1) * 20;
      G.bananas.forEach(b => b.y -= 2);
      if (finishFrame > 50) destroy();
    }
  }

  function draw() {
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);

    if (!C.transparentBackground) {
      ctx.fillStyle = "#111";
      ctx.fillRect(0, 0, canvasWidth, canvasHeight);
    }

    // loading text gradient
    ctx.font = `${16*scale}px monospace`;
    ctx.textAlign = "center";
    ctx.lineWidth = 1*scale;
    const gradient = ctx.createLinearGradient(0, 0, canvasWidth, 0);
    gradient.addColorStop(0, "#ff8c00");
    gradient.addColorStop(1, "#32cd32");
    ctx.fillStyle = gradient;
    ctx.strokeStyle = "#fff";
    ctx.strokeText(`${C.loadText} ${Math.floor(prog*100)}%`, canvasWidth/2, 24*scale);
    ctx.fillText(`${C.loadText} ${Math.floor(prog*100)}%`, canvasWidth/2, 24*scale);

    // ground
    ctx.fillStyle = "#333";
    ctx.fillRect(0, G.groundY*scale, G.w*scale, C.groundHeight*scale);
    ctx.fillStyle = C.unityBlue;
    ctx.fillRect(0, G.groundY*scale, G.w*prog*scale, C.groundHeight*scale);

    drawMinion(40, G.groundY - 24 + G.y);

    G.obs.forEach(o => {
      const bounce = Math.sin(frame * 0.1 + o.offset) * 2;
      ctx.fillStyle = C.obstacleColor;
      ctx.fillRect(o.x*scale, (G.groundY - 16 + bounce)*scale, o.w*scale, 16*scale);
      ctx.strokeStyle = "#800";
      ctx.strokeRect(o.x*scale, (G.groundY - 16 + bounce)*scale, o.w*scale, 16*scale);
    });

    ctx.fillStyle = C.bananaColor;
    G.bananas.forEach(b => ctx.fillRect(b.x*scale, b.y*scale, 6*scale, 10*scale));

    // HUD
    ctx.font = `${14*scale}px monospace`;
    ctx.textAlign = "left";
    ctx.lineWidth = 1*scale;
    ctx.strokeStyle = "#fff";
    ctx.fillStyle = C.unityYellow;
    ctx.strokeText(`Score ${score}`, 10*scale, 16*scale);
    ctx.fillText(`Score ${score}`, 10*scale, 16*scale);
    ctx.strokeText(`Best ${high}`, 10*scale, 32*scale);
    ctx.fillText(`Best ${high}`, 10*scale, 32*scale);

    if (gameOver) {
      ctx.font = `${18*scale}px monospace`;
      ctx.textAlign = "center";
      ctx.lineWidth = 1.5*scale;
      ctx.strokeStyle = "#fff";
      ctx.fillStyle = "#ff5555";
      ctx.strokeText("GAME OVER", canvasWidth/2, 70*scale);
      ctx.fillText("GAME OVER", canvasWidth/2, 70*scale);
      ctx.strokeText("Tap to restart", canvasWidth/2, 90*scale);
      ctx.fillText("Tap to restart", canvasWidth/2, 90*scale);
    }
  }

  function resizeCanvas() {
    canvasWidth = window.innerWidth;
    canvasHeight = canvasWidth / ASPECT;
    if(canvasHeight > window.innerHeight) {
      canvasHeight = window.innerHeight - 40;
      canvasWidth = canvasHeight * ASPECT;
    }
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;
    scale = canvasWidth / G.w;
    canvas.style.left = `${(window.innerWidth - canvasWidth)/2}px`;
    canvas.style.bottom = '20px';
  }

  function loop() {
    update();
    draw();
    raf = requestAnimationFrame(loop);
  }

  function destroy() {
    run = false;
    cancelAnimationFrame(raf);
    canvas?.remove();
    audio?.close();
  }

  canvas = document.createElement("canvas");
  canvas.style.cssText = "position:fixed;bottom:20px;z-index:9999;pointer-events:auto";
  document.body.appendChild(canvas);
  ctx = canvas.getContext("2d");

  window.addEventListener('resize', resizeCanvas);
  resizeCanvas();
  canvas.addEventListener("pointerdown", jump);
  window.addEventListener("keydown", jump);

  reset();
  loop();

  function updateProgressFromDOM() {
    const bar = document.querySelector("#unity-progress-bar-full");
    if (bar) {
      const w = parseFloat(bar.style.width) || 0;
      prog = Math.min(Math.max(w/100, 0), 1);
    }
  }
  setInterval(updateProgressFromDOM, 50);

  window.destroyLoaderGame = destroy;
})();

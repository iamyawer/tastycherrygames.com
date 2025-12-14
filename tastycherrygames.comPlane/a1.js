(function () {
  const mg_2_C = {
    transparentBackground: true,
    unityYellow: "#fbc02d",
    unityBlue: "#1e88e5",
    obstacleColor: "#ff6b6b",
    bananaColor: "#ffd54f",
    groundHeight: 6,
    loadText: "Wait up... loading game"
  };

  let mg_2_canvas, mg_2_ctx, mg_2_raf, mg_2_audio;
  let mg_2_score = 0, mg_2_high = +localStorage.lgHS || 0;
  let mg_2_gameOver = false, mg_2_run = true, mg_2_prog = 0, mg_2_frame = 0;
  let mg_2_finishAnim = false, mg_2_finishFrame = 0;

  const mg_2_ASPECT = 600 / 180;
  let mg_2_canvasWidth, mg_2_canvasHeight, mg_2_scale = 1;

  const mg_2_G = {
    w: 600, h: 180,
    groundY: 140,
    y: 0, v: 0, g: 0.8, j: -12,
    speed: 5,
    obs: [],
    bananas: []
  };

  const mg_2_minion = [
    "0011111100",
    "0111111110",
    "1111111111",
    "1100110011",
    "1111111111",
    "0111111110",
    "0011111100"
  ];

  function mg_2_beep(f = 400, d = 0.05) {
    mg_2_audio ||= new AudioContext();
    const o = mg_2_audio.createOscillator();
    const g = mg_2_audio.createGain();
    o.frequency.value = f;
    g.gain.value = 0.05;
    o.connect(g);
    g.connect(mg_2_audio.destination);
    o.start();
    o.stop(mg_2_audio.currentTime + d);
  }

  function mg_2_spawnObstacle() {
    mg_2_G.obs.push({ x: mg_2_G.w + 200, w: 12, offset: Math.random() * 4 });
    if (Math.random() < 0.5)
      mg_2_G.bananas.push({ x: mg_2_G.w + 260, y: mg_2_G.groundY - 38 });
  }

  function mg_2_reset() {
    mg_2_G.y = mg_2_G.v = 0;
    mg_2_G.speed = 5;
    mg_2_G.obs = [];
    mg_2_G.bananas = [];
    mg_2_score = 0;
    mg_2_gameOver = false;
    mg_2_finishAnim = false;
    mg_2_finishFrame = 0;
    for (let i = 0; i < 3; i++) mg_2_spawnObstacle();
  }

  function mg_2_jump() {
    if (mg_2_gameOver) return mg_2_reset();
    if (mg_2_G.y === 0) {
      mg_2_G.v = mg_2_G.j;
      mg_2_beep(600);
    }
  }

  function mg_2_drawMinion(x, y) {
    const p = 3;

    mg_2_minion.forEach((r, ry) => {
      [...r].forEach((c, rx) => {
        if (c === "1") {
          mg_2_ctx.fillStyle = mg_2_C.unityYellow;
          mg_2_ctx.fillRect((x + rx * p) * mg_2_scale, (y + ry * p) * mg_2_scale, p * mg_2_scale, p * mg_2_scale);
        }
      });
    });

    // Goggles
    mg_2_ctx.fillStyle = "#ccc";
    mg_2_ctx.fillRect(3 * mg_2_scale * p + x * mg_2_scale, 3 * p * mg_2_scale + y * mg_2_scale, 2 * p * mg_2_scale, p * mg_2_scale);
    mg_2_ctx.fillRect(6 * mg_2_scale * p + x * mg_2_scale, 3 * p * mg_2_scale + y * mg_2_scale, 2 * p * mg_2_scale, p * mg_2_scale);

    // Eyes
    mg_2_ctx.fillStyle = "#000";
    mg_2_ctx.fillRect(4 * mg_2_scale * p + x * mg_2_scale, 4 * p * mg_2_scale + y * mg_2_scale, p * mg_2_scale, p * mg_2_scale);
    mg_2_ctx.fillRect(7 * mg_2_scale * p + x * mg_2_scale, 4 * p * mg_2_scale + y * mg_2_scale, p * mg_2_scale, p * mg_2_scale);

    // Legs animate
    let leftLegX = 3 * p, rightLegX = 7 * p;
    let legOffset = mg_2_frame % 20 < 10 ? 0 : 2;
    if (!mg_2_gameOver && !mg_2_finishAnim) {
      mg_2_ctx.fillStyle = mg_2_C.unityBlue;
      mg_2_ctx.fillRect((leftLegX + legOffset) * mg_2_scale + x * mg_2_scale, (7 * p) * mg_2_scale + y * mg_2_scale, 2 * mg_2_scale, 6 * mg_2_scale);
      mg_2_ctx.fillRect((rightLegX + (10 - legOffset - 8)) * mg_2_scale + x * mg_2_scale, (7 * p) * mg_2_scale + y * mg_2_scale, 2 * mg_2_scale, 6 * mg_2_scale);
    } else {
      mg_2_ctx.fillStyle = mg_2_C.unityBlue;
      mg_2_ctx.fillRect((leftLegX) * mg_2_scale + x * mg_2_scale, (7 * p) * mg_2_scale + y * mg_2_scale, 2 * mg_2_scale, 6 * mg_2_scale);
      mg_2_ctx.fillRect((rightLegX) * mg_2_scale + x * mg_2_scale, (7 * p) * mg_2_scale + y * mg_2_scale, 2 * mg_2_scale, 6 * mg_2_scale);
    }
  }

  function mg_2_update() {
    if (!mg_2_run) return;
    mg_2_frame++;

    if (!mg_2_finishAnim) {
      mg_2_G.v += mg_2_G.g;
      mg_2_G.y += mg_2_G.v;
      if (mg_2_G.y > 0) { mg_2_G.y = 0; mg_2_G.v = 0; }

      if (!mg_2_gameOver) {
        mg_2_G.obs.forEach(o => o.x -= mg_2_G.speed);
        mg_2_G.bananas.forEach(b => b.x -= mg_2_G.speed);
      }

      if (mg_2_G.obs[0]?.x < -20 && !mg_2_gameOver) {
        mg_2_G.obs.shift();
        mg_2_spawnObstacle();
        mg_2_score++;
        mg_2_G.speed += 0.08;
        mg_2_beep(300);
      }

      mg_2_G.obs.forEach(o => {
        if (!mg_2_gameOver && o.x < 70 && o.x + o.w > 40 && mg_2_G.y === 0) {
          mg_2_gameOver = true;
          mg_2_beep(120, 0.2);
          if (mg_2_score > mg_2_high) {
            mg_2_high = mg_2_score;
            localStorage.lgHS = mg_2_high;
          }
        }
      });

      mg_2_G.bananas = mg_2_G.bananas.filter(b => {
        if (!mg_2_gameOver && b.x < 60 && b.x > 40 && mg_2_G.y > -20) {
          mg_2_score += 5;
          mg_2_beep(800);
          return false;
        }
        return b.x > -20;
      });

      if (mg_2_prog >= 0.98 && !mg_2_finishAnim) mg_2_finishAnim = true;

    } else {
      mg_2_finishFrame++;
      mg_2_G.y = -Math.sin(mg_2_finishFrame * 0.1) * 20;
      mg_2_G.bananas?.forEach(b => b.y -= 2);
      if (mg_2_finishFrame > 50) mg_2_destroy();
    }
  }

  function mg_2_draw() {
    mg_2_ctx.clearRect(0, 0, mg_2_canvasWidth, mg_2_canvasHeight);

    if (!mg_2_C.transparentBackground) {
      mg_2_ctx.fillStyle = "#111";
      mg_2_ctx.fillRect(0, 0, mg_2_canvasWidth, mg_2_canvasHeight);
    }

    mg_2_ctx.font = `${16*mg_2_scale}px monospace`;
    mg_2_ctx.textAlign = "center";
    mg_2_ctx.lineWidth = 1*mg_2_scale;
    const gradient = mg_2_ctx.createLinearGradient(0, 0, mg_2_canvasWidth, 0);
    gradient.addColorStop(0, "#ff8c00");
    gradient.addColorStop(1, "#32cd32");
    mg_2_ctx.fillStyle = gradient;
    mg_2_ctx.strokeStyle = "#fff";
    mg_2_ctx.strokeText(`${mg_2_C.loadText} ${Math.floor(mg_2_prog*100)}%`, mg_2_canvasWidth/2, 24*mg_2_scale);
    mg_2_ctx.fillText(`${mg_2_C.loadText} ${Math.floor(mg_2_prog*100)}%`, mg_2_canvasWidth/2, 24*mg_2_scale);

    // Ground
    mg_2_ctx.fillStyle = "#333";
    mg_2_ctx.fillRect(0, mg_2_G.groundY*mg_2_scale, mg_2_G.w*mg_2_scale, mg_2_C.groundHeight*mg_2_scale);
    mg_2_ctx.fillStyle = mg_2_C.unityBlue;
    mg_2_ctx.fillRect(0, mg_2_G.groundY*mg_2_scale, mg_2_G.w*mg_2_prog*mg_2_scale, mg_2_C.groundHeight*mg_2_scale);

    mg_2_drawMinion(40, mg_2_G.groundY - 24 + mg_2_G.y);

    mg_2_G.obs.forEach(o => {
      const bounce = Math.sin(mg_2_frame * 0.1 + o.offset) * 2;
      mg_2_ctx.fillStyle = mg_2_C.obstacleColor;
      mg_2_ctx.fillRect(o.x*mg_2_scale, (mg_2_G.groundY - 16 + bounce)*mg_2_scale, o.w*mg_2_scale, 16*mg_2_scale);
      mg_2_ctx.strokeStyle = "#800";
      mg_2_ctx.strokeRect(o.x*mg_2_scale, (mg_2_G.groundY - 16 + bounce)*mg_2_scale, o.w*mg_2_scale, 16*mg_2_scale);
    });

    mg_2_ctx.fillStyle = mg_2_C.bananaColor;
    mg_2_G.bananas.forEach(b => mg_2_ctx.fillRect(b.x*mg_2_scale, b.y*mg_2_scale, 6*mg_2_scale, 10*mg_2_scale));

    // HUD
    mg_2_ctx.font = `${14*mg_2_scale}px monospace`;
    mg_2_ctx.textAlign = "left";
    mg_2_ctx.lineWidth = 1*mg_2_scale;
    mg_2_ctx.strokeStyle = "#fff";
    mg_2_ctx.fillStyle = mg_2_C.unityYellow;
    mg_2_ctx.strokeText(`Score ${mg_2_score}`, 10*mg_2_scale, 16*mg_2_scale);
    mg_2_ctx.fillText(`Score ${mg_2_score}`, 10*mg_2_scale, 16*mg_2_scale);
    mg_2_ctx.strokeText(`Best ${mg_2_high}`, 10*mg_2_scale, 32*mg_2_scale);
    mg_2_ctx.fillText(`Best ${mg_2_high}`, 10*mg_2_scale, 32*mg_2_scale);

    if (mg_2_gameOver) {
      mg_2_ctx.font = `${18*mg_2_scale}px monospace`;
      mg_2_ctx.textAlign = "center";
      mg_2_ctx.lineWidth = 1.5*mg_2_scale;
      mg_2_ctx.strokeStyle = "#fff";
      mg_2_ctx.fillStyle = "#ff5555";
      mg_2_ctx.strokeText("GAME OVER", mg_2_canvasWidth/2, 70*mg_2_scale);
      mg_2_ctx.fillText("GAME OVER", mg_2_canvasWidth/2, 70*mg_2_scale);
      mg_2_ctx.strokeText("Tap to restart", mg_2_canvasWidth/2, 90*mg_2_scale);
      mg_2_ctx.fillText("Tap to restart", mg_2_canvasWidth/2, 90*mg_2_scale);
    }
  }

  function mg_2_resizeCanvas() {
    mg_2_canvasWidth = window.innerWidth;
    mg_2_canvasHeight = mg_2_canvasWidth / mg_2_ASPECT;
    if(mg_2_canvasHeight > window.innerHeight) {
      mg_2_canvasHeight = window.innerHeight - 40;
      mg_2_canvasWidth = mg_2_canvasHeight * mg_2_ASPECT;
    }
    mg_2_canvas.width = mg_2_canvasWidth;
    mg_2_canvas.height = mg_2_canvasHeight;
    mg_2_scale = mg_2_canvasWidth / mg_2_G.w;
    mg_2_canvas.style.left = `${(window.innerWidth - mg_2_canvasWidth)/2}px`;
    mg_2_canvas.style.bottom = '20px';
  }

  function mg_2_loop() {
    mg_2_update();
    mg_2_draw();
    mg_2_raf = requestAnimationFrame(mg_2_loop);
  }

  function mg_2_destroy() {
    mg_2_run = false;
    cancelAnimationFrame(mg_2_raf);
    mg_2_canvas?.remove();
    mg_2_audio?.close();
  }

  mg_2_canvas = document.createElement("canvas");
  mg_2_canvas.style.cssText = "position:fixed;bottom:20px;z-index:9999;pointer-events:auto";
  document.body.appendChild(mg_2_canvas);
  mg_2_ctx = mg_2_canvas.getContext("2d");

  window.addEventListener('resize', mg_2_resizeCanvas);
  mg_2_resizeCanvas();
  mg_2_canvas.addEventListener("pointerdown", mg_2_jump);
  window.addEventListener("keydown", mg_2_jump);

  mg_2_reset();
  mg_2_loop();

  function mg_2_updateProgressFromDOM() {
    const bar = document.querySelector("#unity-progress-bar-full");
    if (bar) {
      const w = parseFloat(bar.style.width) || 0;
      mg_2_prog = Math.min(Math.max(w/100, 0), 1);
    }
  }
  setInterval(mg_2_updateProgressFromDOM, 50);

  window.destroyLoaderGame = mg_2_destroy;
})();

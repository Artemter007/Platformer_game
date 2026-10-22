import { Player } from './player.js';
import { Input } from './input.js';
import { overlaps } from './collision.js';

export const STATE = { READY: 'ready', RUNNING: 'running', PAUSED: 'paused', LOST: 'lost', LEVEL_DONE: 'levelDone', COMPLETE: 'complete' };
const BEST_KEY = 'cat-rescue:best';
const STORY_KEY = 'cat-rescue:story';

const STORY_DATA = [
  { title: 'Записка 1: Побег', text: '«Мяу... Если ты это читаешь, значит, ты нашел мой след. Я не просто так убежал. Я видел сон о магических рыбках. Я отправляюсь на крышу, чтобы найти первую звезду!»' },
  { title: 'Записка 2: Звездный свет', text: '«Здесь так высоко и дует сильный ветер! Я видел странное свечение в старом подвале под городом. Встретимся внизу, но будь осторожен, там темно!»' },
  { title: 'Записка 3: Тайна подземелья', text: '«В подвале сыро и темно, я промок. Но я нашел старую карту. Оказывается, рыбки указывают путь к древнему парку на окраине. Догоняй!»' },
  { title: 'Записка 4: Шепот деревьев', text: '«Деревья в парке рассказали мне легенду. Если собрать всех рыбок и добраться до портала в небе, можно загадать желание. Мне нужна твоя помощь, чтобы открыть портал!»' },
  { title: 'Записка 5: Дом, милый дом', text: '«Ты сделал это! Мы вместе открыли портал. Я загадал желание, чтобы мы всегда были вместе. Спасибо тебе, друг. А теперь... пойдем домой!»' }
];

const LEVELS = [
  // Уровень 1: Двор
  {
    name: 'Двор', theme: 'day', sky: ['#5fb8f5', '#dff3ff'], spawn: { x: 40, y: 444 },
    platforms: [
      { x: 0, y: 490, w: 320, h: 50 }, { x: 440, y: 490, w: 180, h: 50 }, { x: 740, y: 490, w: 220, h: 50 },
      { x: 200, y: 400, w: 110, h: 16 }, { x: 340, y: 310, w: 110, h: 16 }, { x: 520, y: 390, w: 110, h: 16 }, { x: 660, y: 300, w: 110, h: 16 }
    ],
    hazards: [ { x: 320, y: 492, w: 120, h: 48, type: 'water' }, { x: 620, y: 492, w: 120, h: 48, type: 'water' }, { x: 830, y: 470, w: 60, h: 20, type: 'spike' } ],
    items: [ { x: 240, y: 358, w: 26, h: 26 }, { x: 560, y: 348, w: 26, h: 26 }, { x: 700, y: 258, w: 26, h: 26 } ],
    finish: { x: 895, y: 430, w: 46, h: 60 }
  },
  // Уровень 2: Крыша (Ночь, Ветер, Трубы)
  {
    name: 'Крыша', theme: 'roof', sky: ['#0f172a', '#1e293b'], spawn: { x: 40, y: 444 },
    wind: 850, // СИЛЬНЫЙ ВЕТЕР
    platforms: [
      { x: 0, y: 490, w: 220, h: 50 }, { x: 340, y: 490, w: 200, h: 50 }, { x: 660, y: 490, w: 300, h: 50 },
      { x: 120, y: 400, w: 100, h: 16 }, { x: 260, y: 310, w: 100, h: 16 }, { x: 420, y: 400, w: 100, h: 16 },
      { x: 560, y: 310, w: 100, h: 16 }, { x: 740, y: 400, w: 100, h: 16 }
    ],
    hazards: [ { x: 220, y: 492, w: 120, h: 48, type: 'water' }, { x: 540, y: 492, w: 120, h: 48, type: 'water' }, { x: 850, y: 470, w: 50, h: 20, type: 'spike' } ],
    items: [ { x: 155, y: 358, w: 26, h: 26 }, { x: 455, y: 358, w: 26, h: 26 }, { x: 775, y: 358, w: 26, h: 26 } ],
    finish: { x: 905, y: 430, w: 44, h: 60 }
  },
  // Уровень 3: Подвал
  {
    name: 'Подвал', theme: 'basement', sky: ['#111827', '#1f2937'], spawn: { x: 40, y: 444 },
    darkness: true,
    platforms: [
      { x: 0, y: 490, w: 150, h: 50 }, { x: 250, y: 490, w: 150, h: 50 }, { x: 500, y: 490, w: 150, h: 50 }, { x: 750, y: 490, w: 210, h: 50 },
      { x: 100, y: 380, w: 90, h: 16 }, { x: 300, y: 300, w: 90, h: 16 }, { x: 450, y: 380, w: 90, h: 16 },
      { x: 600, y: 280, w: 90, h: 16 }, { x: 750, y: 360, w: 90, h: 16 }
    ],
    hazards: [ 
      { x: 150, y: 492, w: 100, h: 48, type: 'water' }, { x: 400, y: 492, w: 100, h: 48, type: 'water' }, { x: 650, y: 492, w: 100, h: 48, type: 'water' },
      { x: 250, y: 470, w: 40, h: 20, type: 'spike' }, { x: 600, y: 470, w: 40, h: 20, type: 'spike' }
    ],
    items: [ { x: 135, y: 338, w: 26, h: 26 }, { x: 480, y: 338, w: 26, h: 26 }, { x: 780, y: 318, w: 26, h: 26 } ],
    finish: { x: 900, y: 430, w: 50, h: 60 }
  },
  // Уровень 4: Парк (Движущиеся платформы)
  {
    name: 'Парк', theme: 'park', sky: ['#2d6a4f', '#95d5b2'], spawn: { x: 40, y: 444 },
    platforms: [
      { x: 0, y: 490, w: 180, h: 50 }, { x: 280, y: 490, w: 120, h: 50 }, { x: 500, y: 490, w: 120, h: 50 }, { x: 720, y: 490, w: 240, h: 50 },
      { x: 150, y: 380, w: 80, h: 16 }, { x: 450, y: 250, w: 80, h: 16 }, { x: 700, y: 280, w: 80, h: 16 }
    ],
    movingPlatforms: [
      { x: 320, y: 320, w: 80, h: 16, startX: 320, startY: 320, axis: 'x', range: 100, speed: 1.5, dir: 1, dx: 0, dy: 0 },
      { x: 550, y: 350, w: 80, h: 16, startX: 550, startY: 350, axis: 'y', range: 80, speed: 1.2, dir: 1, dx: 0, dy: 0 }
    ],
    hazards: [ { x: 180, y: 492, w: 100, h: 48, type: 'water' }, { x: 400, y: 492, w: 100, h: 48, type: 'water' }, { x: 620, y: 492, w: 100, h: 48, type: 'water' }, { x: 800, y: 470, w: 60, h: 20, type: 'spike' } ],
    items: [ { x: 180, y: 338, w: 26, h: 26 }, { x: 485, y: 208, w: 26, h: 26 }, { x: 735, y: 238, w: 26, h: 26 } ],
    finish: { x: 880, y: 430, w: 60, h: 60 }
  },
  // Уровень 5: Небесный портал
  {
    name: 'Небесный портал', theme: 'sky', sky: ['#4c1d95', '#c084fc'], spawn: { x: 40, y: 444 },
    gravity: 0.6,
    platforms: [
      { x: 0, y: 490, w: 120, h: 50 }, { x: 740, y: 300, w: 220, h: 50 },
      { x: 200, y: 450, w: 100, h: 16 }, { x: 380, y: 400, w: 100, h: 16 }, { x: 560, y: 350, w: 100, h: 16 },
      { x: 100, y: 360, w: 80, h: 16 }, { x: 280, y: 280, w: 80, h: 16 }, { x: 460, y: 230, w: 80, h: 16 }, { x: 600, y: 180, w: 80, h: 16 }
    ],
    hazards: [ { x: 120, y: 492, w: 840, h: 48, type: 'water' }, { x: 800, y: 280, w: 40, h: 20, type: 'spike' } ],
    items: [ { x: 125, y: 318, w: 26, h: 26 }, { x: 315, y: 238, w: 26, h: 26 }, { x: 625, y: 138, w: 26, h: 26 } ],
    finish: { x: 890, y: 240, w: 50, h: 60 }
  }
];

function roundRect(ctx, x, y, w, h, r) {
  const rr = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + rr, y);
  ctx.arcTo(x + w, y, x + w, y + h, rr);
  ctx.arcTo(x + w, y + h, x, y + h, rr);
  ctx.arcTo(x, y + h, x, y, rr);
  ctx.arcTo(x, y, x + w, y, rr);
  ctx.closePath();
}

function loadBest() { try { const raw = localStorage.getItem(BEST_KEY); return raw ? Math.max(0, parseInt(raw, 10) || 0) : 0; } catch (e) { return 0; } }
function saveBest(value) { try { const current = loadBest(); if (value > current) localStorage.setItem(BEST_KEY, String(value)); return Math.max(value, current); } catch (e) { return value; } }
function loadStory() { try { const raw = localStorage.getItem(STORY_KEY); return raw ? JSON.parse(raw) : []; } catch (e) { return []; } }
function saveStory(storyArray) { try { localStorage.setItem(STORY_KEY, JSON.stringify(storyArray)); } catch (e) {} }

export class Game {
  constructor(canvas, ui) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.W = canvas.width;
    this.H = canvas.height;
    this.ui = ui;

    this.input = new Input();
    this.input.bindButtons(document);

    this.player = new Player({ x: 40, y: 444 });
    this.state = STATE.READY;
    this.score = 0;
    this.best = loadBest();
    this.story = loadStory();
    
    this.renderStory();
    this.updateHud();

    this.levelIndex = 0;
    this.time = 0;
    this.lastTime = 0;
    this.particles = [];
    this.rainParticles = [];
    this.hintText = '';
    this.hintTimer = 0;

    this.loadLevel(0);
    this.updateButtons();
    this.showOverlay('Тайна кота-путешественника', 'Соберите 3 рыбки и доберитесь до кота.', 'Начать');

    this.loop = this.loop.bind(this);
    requestAnimationFrame(this.loop);

    this.ui.overlayBtn.addEventListener('click', () => this.onOverlayButton());
    this.ui.btnStart.addEventListener('click', () => this.start());
    this.ui.btnPause.addEventListener('click', () => this.togglePause());
    this.ui.btnRestart.addEventListener('click', () => this.newGame());
    
    this.ui.btnReset.addEventListener('click', () => {
      if (confirm('Вы уверены? Это удалит все найденные записки и рекорд.')) {
        localStorage.removeItem(BEST_KEY);
        localStorage.removeItem(STORY_KEY);
        this.best = 0; this.story = []; this.score = 0;
        this.renderStory(); this.updateHud();
        if (this.ui.storyBadge) this.ui.storyBadge.classList.add('hidden');
        this.newGame();
        alert('Прогресс сброшен!');
      }
    });

    document.addEventListener('visibilitychange', () => {
      if (document.hidden && this.state === STATE.RUNNING) this.pause();
    });
  }

  loadLevel(index) {
    this.levelIndex = index;
    this.level = JSON.parse(JSON.stringify(LEVELS[index]));
    this.level.items.forEach((item) => { item.taken = false; });
    if (this.level.movingPlatforms) {
      this.level.movingPlatforms.forEach(p => { p.x = p.startX; p.y = p.startY; p.dx = 0; p.dy = 0; });
    }
    this.player.reset(this.level.spawn);
    this.particles.length = 0;
    this.rainParticles.length = 0;
    this.hintTimer = 0;
    this.hintText = '';
  }

  newGame() {
    this.score = 0; this.loadLevel(0); this.state = STATE.RUNNING; this.lastTime = 0;
    this.input.clear(); this.hideOverlay(); this.updateHud(); this.updateButtons();
  }

  start() { if (this.state === STATE.RUNNING) return; if (this.state === STATE.PAUSED) { this.resume(); return; } this.newGame(); }
  pause() { if (this.state !== STATE.RUNNING) return; this.state = STATE.PAUSED; this.input.clear(); this.showOverlay('Пауза', 'Игра приостановлена.', 'Продолжить'); this.updateButtons(); }
  resume() { if (this.state !== STATE.PAUSED) return; this.state = STATE.RUNNING; this.lastTime = 0; this.input.clear(); this.hideOverlay(); this.updateButtons(); }
  togglePause() { if (this.state === STATE.RUNNING) this.pause(); else if (this.state === STATE.PAUSED) this.resume(); }
  nextLevel() { if (this.state !== STATE.LEVEL_DONE) return; this.loadLevel(this.levelIndex + 1); this.state = STATE.RUNNING; this.lastTime = 0; this.input.clear(); this.hideOverlay(); this.updateHud(); this.updateButtons(); }

  onOverlayButton() {
    switch (this.state) {
      case STATE.READY: case STATE.LOST: case STATE.COMPLETE: this.newGame(); break;
      case STATE.PAUSED: this.resume(); break;
      case STATE.LEVEL_DONE: this.nextLevel(); break;
    }
  }

  loop(timestamp) {
    requestAnimationFrame(this.loop);
    if (!this.lastTime) this.lastTime = timestamp;
    let dt = (timestamp - this.lastTime) / 1000;
    this.lastTime = timestamp;
    if (!Number.isFinite(dt) || dt < 0) dt = 0;
    if (dt > 0.05) dt = 0.05;

    if (this.state === STATE.RUNNING) this.update(dt);
    else { this.input.consumeJump(); this.time += dt * 0.6; }
    this.render();
  }

  update(dt) {
    this.time += dt;
    if (this.hintTimer > 0) this.hintTimer -= dt;

    if (this.level.movingPlatforms) {
      this.level.movingPlatforms.forEach(p => {
        p.prevX = p.x;
        p.prevY = p.y;
        if (p.axis === 'x') {
          p.x += p.speed * p.dir * 60 * dt;
          if (p.x > p.startX + p.range || p.x < p.startX) p.dir *= -1;
        } else {
          p.y += p.speed * p.dir * 60 * dt;
          if (p.y > p.startY + p.range || p.y < p.startY) p.dir *= -1;
        }
        p.dx = p.x - p.prevX;
        p.dy = p.y - p.prevY;
      });
    }

    const controls = { left: this.input.left, right: this.input.right, jump: this.input.consumeJump() };

    const allPlatforms = [...this.level.platforms];
    if (this.level.movingPlatforms) allPlatforms.push(...this.level.movingPlatforms);

    this.player.update(dt, { platforms: allPlatforms, gravity: this.level.gravity, wind: this.level.wind, movingPlatforms: this.level.movingPlatforms }, controls);
    this.updateParticles(dt);

    for (const item of this.level.items) {
      if (!item.taken && overlaps(this.player, item)) {
        item.taken = true; this.score += 1; this.spawnBurst(item.x + item.w / 2, item.y + item.h / 2); this.updateHud();
      }
    }

    for (const h of this.level.hazards) {
      if (overlaps(this.player, h)) { this.lose(h.type === 'water' ? 'Вы угодили в воду!' : 'Вы наступили на шипы!'); return; }
    }

    if (this.player.y > this.H + 120) { this.lose('Вы упали в пропасть!'); return; }

    const left = this.level.items.filter((i) => !i.taken).length;
    if (overlaps(this.player, this.level.finish)) {
      if (left === 0) this.finishLevel();
      else if (this.hintTimer <= 0) { this.hintText = 'Сначала соберите все рыбки! Осталось: ' + left; this.hintTimer = 2; }
    }
  }

  finishLevel() {
    this.best = saveBest(this.score); this.input.clear();
    const storyPiece = STORY_DATA[this.levelIndex];
    if (!this.story.some(s => s.title === storyPiece.title)) {
      this.story.push(storyPiece); saveStory(this.story); this.renderStory();
      if (this.ui.storyBadge) this.ui.storyBadge.classList.remove('hidden');
    }
    if (this.levelIndex < LEVELS.length - 1) {
      this.state = STATE.LEVEL_DONE;
      this.showOverlay('Уровень пройден!', 'Вы нашли новую записку! Загляните в «Дневник».', 'Следующий уровень');
    } else {
      this.state = STATE.COMPLETE;
      this.showOverlay('Победа!', 'Кот спасён! Вы раскрыли тайну портала.', 'Играть снова');
    }
    this.updateHud(); this.updateButtons();
  }

  lose(reason) {
    this.state = STATE.LOST; this.best = saveBest(this.score); this.input.clear();
    this.showOverlay('Поражение', reason, 'Заново'); this.updateHud(); this.updateButtons();
  }

  updateHud() {
    this.ui.score.textContent = String(this.score);
    this.ui.best.textContent = String(this.best);
    this.ui.level.textContent = (this.levelIndex + 1) + ' / ' + LEVELS.length;
  }

  updateButtons() {
    const running = this.state === STATE.RUNNING; const paused = this.state === STATE.PAUSED;
    this.ui.btnPause.textContent = paused ? 'Продолжить' : 'Пауза';
    this.ui.btnPause.disabled = !(running || paused); this.ui.btnStart.disabled = running || paused;
  }

  showOverlay(title, text, buttonLabel) { this.ui.overlayTitle.textContent = title; this.ui.overlayText.textContent = text; this.ui.overlayBtn.textContent = buttonLabel; this.ui.overlay.hidden = false; }
  hideOverlay() { this.ui.overlay.hidden = true; }

  renderStory() {
    if (!this.ui.storyLog) return;
    if (this.story.length === 0) { this.ui.storyLog.innerHTML = '<p class="journal__empty">Пока здесь пусто.</p>'; return; }
    this.ui.storyLog.innerHTML = '';
    this.story.forEach(entry => {
      const div = document.createElement('div'); div.className = 'story-entry';
      div.innerHTML = `<h3>${entry.title}</h3><p>${entry.text}</p>`; this.ui.storyLog.appendChild(div);
    });
  }

  spawnBurst(x, y) {
    for (let i = 0; i < 12; i++) {
      const a = Math.random() * Math.PI * 2; const speed = 60 + Math.random() * 140;
      this.particles.push({ x, y, vx: Math.cos(a) * speed, vy: Math.sin(a) * speed - 60, life: 0.6, max: 0.6 });
    }
  }

  updateParticles(dt) {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i]; p.life -= dt;
      if (p.life <= 0) { this.particles.splice(i, 1); continue; }
      p.vy += 600 * dt; p.x += p.vx * dt; p.y += p.vy * dt;
    }
    if (this.level.theme === 'basement') {
      if (Math.random() < 0.3) this.rainParticles.push({ x: Math.random() * this.W, y: -10, speed: 300 + Math.random() * 200 });
      for (let i = this.rainParticles.length - 1; i >= 0; i--) {
        const r = this.rainParticles[i]; r.y += r.speed * dt;
        if (r.y > this.H) this.rainParticles.splice(i, 1);
      }
    }
  }

  render() {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.W, this.H);
    this.drawSky(ctx);
    this.drawBackgroundDecor(ctx);
    this.drawPlatforms(ctx);
    this.drawHazards(ctx);
    this.drawItems(ctx);
    this.drawFinish(ctx);
    this.drawParticles(ctx);
    this.drawPlayer(ctx);
    if (this.level.darkness) this.drawDarkness(ctx);
    if (this.level.wind) this.drawWind(ctx);
    this.drawHint(ctx);
  }

  drawSky(ctx) {
    const grad = ctx.createLinearGradient(0, 0, 0, this.H);
    grad.addColorStop(0, this.level.sky[0]); grad.addColorStop(1, this.level.sky[1]);
    ctx.fillStyle = grad; ctx.fillRect(0, 0, this.W, this.H);

    if (this.level.theme === 'night' || this.level.theme === 'roof' || this.level.theme === 'sky') {
      for (let i = 0; i < 46; i++) {
        const x = (i * 197) % this.W; const y = (i * 83) % 300;
        const a = 0.35 + 0.3 * Math.sin(this.time * 2 + i);
        ctx.fillStyle = `rgba(255,255,255,${a.toFixed(3)})`; ctx.fillRect(x, y, 2, 2);
      }
      // Луна
      ctx.fillStyle = '#e2e8f0';
      ctx.beginPath(); ctx.arc(830, 90, 40, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = this.level.sky[0];
      ctx.beginPath(); ctx.arc(815, 80, 34, 0, Math.PI * 2); ctx.fill();
    }
    if (this.level.theme === 'day' || this.level.theme === 'park') {
      ctx.fillStyle = 'rgba(255, 245, 190, 0.35)';
      ctx.beginPath(); ctx.arc(830, 90, 70, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = 'rgba(255, 236, 150, 0.95)';
      ctx.beginPath(); ctx.arc(830, 90, 46, 0, Math.PI * 2); ctx.fill();
    }
  }

  drawBackgroundDecor(ctx) {
    // ДЕКОР ДЛЯ КРЫШИ
    if (this.level.theme === 'roof') {
      // Здания на фоне
      ctx.fillStyle = '#0f172a';
      for(let i=0; i<6; i++) {
        let bw = 100 + (i%2)*40; let bh = 200 + (i%3)*80;
        ctx.fillRect(50 + i*180, this.H - bh, bw, bh);
        // Окна
        ctx.fillStyle = 'rgba(250, 204, 21, 0.2)';
        for(let wx = 10; wx < bw - 20; wx += 30) {
          for(let wy = this.H - bh + 20; wy < this.H - 20; wy += 40) {
            if(Math.random() > 0.3) ctx.fillRect(50 + i*180 + wx, wy, 10, 15);
          }
        }
        ctx.fillStyle = '#0f172a';
      }

      // 1. Кирпичная труба (вместо темного прямоугольника)
      ctx.fillStyle = '#78350f'; // Кирпичный цвет
      ctx.fillRect(700, 320, 50, 170); // Основа трубы
      ctx.fillStyle = '#451a03'; // Темная окантовка
      ctx.fillRect(695, 315, 60, 15); // Верх трубы
      
      // Дым из трубы
      ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
      for(let i=0; i<3; i++) {
        let sx = 725 + Math.sin(this.time + i)*15;
        let sy = 300 - (this.time*30 + i*40) % 150;
        ctx.beginPath(); ctx.arc(sx, sy, 15 + i*8, 0, Math.PI*2); ctx.fill();
      }

      // 2. Тонкая антенна с маячком (справа)
      ctx.strokeStyle = '#475569';
      ctx.lineWidth = 3;
      ctx.beginPath(); ctx.moveTo(880, 490); ctx.lineTo(880, 350); ctx.stroke();
      
      // Сам маячок (красная точка)
      ctx.fillStyle = '#ef4444';
      ctx.beginPath(); 
      ctx.arc(880, 345, 5 + Math.sin(this.time * 8) * 2, 0, Math.PI * 2); 
      ctx.fill();
      
      // Красное свечение вокруг маячка
      ctx.fillStyle = 'rgba(239, 68, 68, 0.2)';
      ctx.beginPath(); ctx.arc(880, 345, 15 + Math.sin(this.time * 8) * 4, 0, Math.PI*2); ctx.fill();
    }

    // ДЕКОР ДЛЯ ПОДВАЛА
    if (this.level.theme === 'basement') {
      ctx.strokeStyle = 'rgba(255,255,255,0.03)'; ctx.lineWidth = 2;
      for (let y = 0; y < this.H; y += 30) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(this.W, y); ctx.stroke();
        for (let x = (y/30 % 2 === 0 ? 0 : 40); x < this.W; x += 80) {
          ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x, y+30); ctx.stroke();
        }
      }
    }

    // ДЕКОР ДЛЯ ПАРКА
    if (this.level.theme === 'park') {
      ctx.fillStyle = 'rgba(20, 80, 40, 0.6)';
      for(let i=0; i<5; i++) {
        ctx.beginPath(); ctx.arc(100 + i*200, 400, 80, 0, Math.PI*2); ctx.fill();
        ctx.fillRect(80 + i*200, 400, 40, 200);
      }
    }

    // ДЕКОР ДЛЯ НЕБЕСНОГО ПОРТАЛА
    if (this.level.theme === 'sky') {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
      for(let i=0; i<6; i++) {
        let ox = (i * 300 + this.time * 10) % (this.W + 200) - 100;
        ctx.beginPath(); ctx.moveTo(ox, 100 + i*50); ctx.lineTo(ox+60, 100 + i*50); ctx.lineTo(ox+30, 130 + i*50); ctx.fill();
      }
    }
  }

  drawDarkness(ctx) {
    ctx.save();
    const cx = this.player.x + this.player.w / 2; const cy = this.player.y + this.player.h / 2;
    const grad = ctx.createRadialGradient(cx, cy, 50, cx, cy, 180);
    grad.addColorStop(0, 'rgba(0,0,0,0)'); grad.addColorStop(1, 'rgba(0,0,0,0.95)');
    ctx.fillStyle = grad; ctx.fillRect(0, 0, this.W, this.H);
    ctx.strokeStyle = 'rgba(150, 200, 255, 0.4)'; ctx.lineWidth = 2;
    this.rainParticles.forEach(r => { ctx.beginPath(); ctx.moveTo(r.x, r.y); ctx.lineTo(r.x, r.y + 10); ctx.stroke(); });
    ctx.restore();
  }

  drawWind(ctx) {
    ctx.strokeStyle = 'rgba(255,255,255,0.3)';
    ctx.lineWidth = 2;
    for (let i = 0; i < 15; i++) {
      let wx = (this.time * 800 + i * 120) % (this.W + 200) - 100;
      let wy = 50 + i * 35;
      ctx.beginPath(); ctx.moveTo(wx, wy); ctx.lineTo(wx + 60 + Math.sin(this.time*5+i)*10, wy); ctx.stroke();
    }
  }

  drawPlatforms(ctx) {
    const allPlats = [...this.level.platforms];
    if (this.level.movingPlatforms) allPlats.push(...this.level.movingPlatforms);

    for (const p of allPlats) {
      const isMoving = this.level.movingPlatforms && this.level.movingPlatforms.some(mp => mp.x === p.x && mp.y === p.y);
      
      if (this.level.theme === 'roof') {
        // ДЕКОР ПЛАТФОРМЫ КРЫШИ (Черепица)
        ctx.fillStyle = '#78350f';
        ctx.fillRect(p.x, p.y, p.w, p.h);
        ctx.strokeStyle = '#451a03'; ctx.lineWidth = 2;
        for(let tx = p.x; tx < p.x + p.w; tx += 20) {
          for(let ty = p.y; ty < p.y + p.h; ty += 12) {
            ctx.strokeRect(tx, ty, 20, 12);
          }
        }
        ctx.fillStyle = '#92400e'; ctx.fillRect(p.x, p.y, p.w, 4);
      } 
      else if (this.level.theme === 'sky') {
        ctx.fillStyle = '#4c1d95'; roundRect(ctx, p.x, p.y, p.w, p.h, 8); ctx.fill();
        ctx.strokeStyle = '#c084fc'; ctx.lineWidth = 2; ctx.stroke();
      } 
      else if (this.level.theme === 'basement') {
        ctx.fillStyle = '#374151'; ctx.fillRect(p.x, p.y, p.w, p.h);
        ctx.fillStyle = '#4b5563'; ctx.fillRect(p.x, p.y, p.w, 4);
      } 
      else if (this.level.theme === 'park') {
        ctx.fillStyle = '#5c3a21'; roundRect(ctx, p.x, p.y, p.w, p.h, 6); ctx.fill();
        if (isMoving) { ctx.fillStyle = '#84cc16'; ctx.fillRect(p.x, p.y, p.w, 4); } 
      } 
      else {
        if (p.h >= 40) {
          ctx.fillStyle = '#6a4a2f'; ctx.fillRect(p.x, p.y, p.w, p.h);
          ctx.fillStyle = '#4caf50'; ctx.fillRect(p.x, p.y, p.w, 12);
        } else {
          ctx.fillStyle = '#8a5a33'; roundRect(ctx, p.x, p.y, p.w, p.h, 6); ctx.fill();
          ctx.fillStyle = '#c98f52'; roundRect(ctx, p.x, p.y, p.w, 7, 5); ctx.fill();
        }
      }
      if (isMoving) {
        ctx.fillStyle = 'rgba(255,255,255,0.6)';
        ctx.beginPath(); ctx.arc(p.x + p.w/2, p.y + p.h/2, 4, 0, Math.PI*2); ctx.fill();
      }
    }
  }

  drawHazards(ctx) {
    for (const h of this.level.hazards) {
      if (h.type === 'water') {
        ctx.fillStyle = this.level.theme === 'sky' ? 'rgba(192, 132, 252, 0.4)' : 'rgba(40, 120, 200, 0.85)';
        ctx.beginPath(); ctx.moveTo(h.x, h.y + h.h);
        for (let x = 0; x <= h.w; x += 10) {
          ctx.lineTo(h.x + x, h.y + Math.sin(x / 22 + this.time * 3) * 4);
        }
        ctx.lineTo(h.x + h.w, h.y + h.h); ctx.closePath(); ctx.fill();
      } else if (h.type === 'spike') {
        const n = Math.max(2, Math.round(h.w / 20)); const step = h.w / n;
        ctx.fillStyle = '#9aa3b2';
        for (let i = 0; i < n; i++) {
          ctx.beginPath(); ctx.moveTo(h.x + i * step, h.y + h.h);
          ctx.lineTo(h.x + i * step + step / 2, h.y); ctx.lineTo(h.x + (i + 1) * step, h.y + h.h);
          ctx.closePath(); ctx.fill();
        }
      }
    }
  }

  drawItems(ctx) {
    for (const item of this.level.items) {
      if (item.taken) continue;
      const bob = Math.sin(this.time * 3 + item.x * 0.1) * 4;
      const cx = item.x + item.w / 2; const cy = item.y + item.h / 2 + bob;
      ctx.fillStyle = 'rgba(255, 220, 90, 0.22)'; ctx.beginPath(); ctx.arc(cx, cy, 20, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#e8813a'; ctx.beginPath(); ctx.moveTo(cx - 9, cy); ctx.lineTo(cx - 20, cy - 9); ctx.lineTo(cx - 20, cy + 9); ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#ffb347'; ctx.beginPath(); ctx.ellipse(cx, cy, 12, 8, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#27304a'; ctx.beginPath(); ctx.arc(cx + 5, cy - 2, 1.8, 0, Math.PI * 2); ctx.fill();
    }
  }

  drawFinish(ctx) {
    const f = this.level.finish; const cx = f.x + f.w / 2; const base = f.y + f.h;
    const bob = Math.sin(this.time * 2) * 2; const pulse = 0.5 + 0.5 * Math.sin(this.time * 3);
    const glowColor = this.level.theme === 'sky' ? '192, 132, 252' : '255, 209, 102';
    ctx.fillStyle = `rgba(${glowColor}, ${(0.12 + pulse * 0.12).toFixed(3)})`;
    ctx.beginPath(); ctx.arc(cx, base - 36, 46 + pulse * 6, 0, Math.PI * 2); ctx.fill();

    ctx.save(); ctx.translate(cx, base + bob);
    ctx.strokeStyle = '#d98b3a'; ctx.lineWidth = 6; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(12, -16); ctx.quadraticCurveTo(32, -20, 24, -42); ctx.stroke();
    ctx.fillStyle = '#f0a04b';
    ctx.beginPath(); ctx.ellipse(0, -18, 17, 18, 0, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(0, -44, 14, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.moveTo(-12, -52); ctx.lineTo(-6, -66); ctx.lineTo(0, -52); ctx.closePath(); ctx.fill();
    ctx.beginPath(); ctx.moveTo(12, -52); ctx.lineTo(6, -66); ctx.lineTo(0, -52); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#2b2f4a'; ctx.beginPath(); ctx.ellipse(-5, -46, 2.5, 3.5, 0, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(5, -46, 2.5, 3.5, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#e8637a'; ctx.beginPath(); ctx.moveTo(0, -39); ctx.lineTo(-3, -36); ctx.lineTo(3, -36); ctx.closePath(); ctx.fill();
    ctx.restore();
  }

  drawPlayer(ctx) {
    const p = this.player; const cx = p.x + p.w / 2; const bottom = p.y + p.h;
    const walking = p.onGround && Math.abs(p.vx) > 20; const swing = walking ? Math.sin(this.time * 18) * 4 : 0;
    const lift = p.onGround ? 0 : -2;

    ctx.save(); ctx.translate(cx, bottom + lift);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.16)'; ctx.beginPath(); ctx.ellipse(0, 2, 17, 5, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#27304a'; ctx.fillRect(-10, -13, 8, 13 + swing); ctx.fillRect(2, -13, 8, 13 - swing);
    ctx.fillStyle = '#ff8a3d'; roundRect(ctx, -13, -34, 26, 23, 7); ctx.fill();
    ctx.fillStyle = '#ffd9b3'; ctx.fillRect(-17, -30, 5, 13); ctx.fillRect(12, -30, 5, 13);
    ctx.beginPath(); ctx.arc(0, -40, 10, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#3a2a1f'; ctx.beginPath(); ctx.arc(0, -43, 10, Math.PI, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#27304a'; ctx.beginPath(); ctx.arc(p.facing * 2 - 3, -39, 1.7, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(p.facing * 2 + 3, -39, 1.7, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  }

  drawParticles(ctx) {
    for (const p of this.particles) {
      const a = Math.max(0, p.life / p.max);
      ctx.globalAlpha = a; ctx.fillStyle = '#ffd166';
      ctx.beginPath(); ctx.arc(p.x, p.y, 4 * a + 1, 0, Math.PI * 2); ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  drawHint(ctx) {
    if (this.hintTimer <= 0) return;
    ctx.globalAlpha = Math.min(1, this.hintTimer);
    ctx.font = 'bold 20px system-ui, sans-serif';
    const w = ctx.measureText(this.hintText).width + 36;
    ctx.fillStyle = 'rgba(12, 18, 34, 0.85)';
    roundRect(ctx, (this.W - w) / 2, 24, w, 44, 12); ctx.fill();
    ctx.fillStyle = '#ffd166'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(this.hintText, this.W / 2, 46);
    ctx.globalAlpha = 1; ctx.textAlign = 'start'; ctx.textBaseline = 'alphabetic';
  }
}
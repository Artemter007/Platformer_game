import { Game } from './game.js';

const game = new Game(document.getElementById('game'), {
  score: document.getElementById('score'),
  best: document.getElementById('best'),
  level: document.getElementById('level'),
  overlay: document.getElementById('overlay'),
  overlayTitle: document.getElementById('overlay-title'),
  overlayText: document.getElementById('overlay-text'),
  overlayBtn: document.getElementById('overlay-btn'),
  btnStart: document.getElementById('btn-start'),
  btnPause: document.getElementById('btn-pause'),
  btnRestart: document.getElementById('btn-restart'),
  storyLog: document.getElementById('story-log'),
  storyBadge: document.getElementById('story-badge'),
  btnReset: document.getElementById('btn-reset-progress') // Новая кнопка
});

const tabBtns = document.querySelectorAll('.tab-btn');
const views = document.querySelectorAll('.view');

tabBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    tabBtns.forEach(b => b.classList.remove('active'));
    views.forEach(v => v.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById(btn.dataset.tab).classList.add('active');
    
    if (btn.dataset.tab === 'story-view' && game.ui.storyBadge) {
      game.ui.storyBadge.classList.add('hidden');
    }
  });
});

window.game = game;
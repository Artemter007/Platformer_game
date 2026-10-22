const KEY_MAP = {
  ArrowLeft: 'left',
  KeyA: 'left',
  ArrowRight: 'right',
  KeyD: 'right',
  Space: 'jump',
  KeyW: 'jump',
  ArrowUp: 'jump'
};

export class Input {
  constructor() {
    this.left = false;
    this.right = false;
    this.jumpHeld = false;
    this.jumpQueued = false;

    this.onKeyDown = (e) => {
      const action = KEY_MAP[e.code];
      if (!action) return;
      e.preventDefault(); // страница не прокручивается во время игры

      if (action === 'jump') {
        if (!e.repeat) this.jumpQueued = true; // прыжок только по нажатию
        this.jumpHeld = true;
      } else {
        this[action] = true;
      }
    };

    this.onKeyUp = (e) => {
      const action = KEY_MAP[e.code];
      if (!action) return;
      e.preventDefault();
      if (action === 'jump') this.jumpHeld = false;
      else this[action] = false;
    };

    this.onBlur = () => this.clear();

    window.addEventListener('keydown', this.onKeyDown);
    window.addEventListener('keyup', this.onKeyUp);
    window.addEventListener('blur', this.onBlur);
  }

  // Экранные кнопки для телефона (с поддержкой удержания)
  bindButtons(root = document) {
    root.querySelectorAll('[data-action]').forEach((btn) => {
      const action = btn.dataset.action;

      const press = (e) => {
        e.preventDefault();
        btn.classList.add('is-active');
        if (action === 'jump') {
          this.jumpQueued = true;
          this.jumpHeld = true;
        } else {
          this[action] = true;
        }
        if (e.pointerId !== undefined && btn.setPointerCapture) {
          try { btn.setPointerCapture(e.pointerId); } catch (err) { /* ignore */ }
        }
      };

      const release = () => {
        btn.classList.remove('is-active');
        if (action === 'jump') this.jumpHeld = false;
        else this[action] = false;
      };

      btn.addEventListener('pointerdown', press);
      btn.addEventListener('pointerup', release);
      btn.addEventListener('pointercancel', release);
      btn.addEventListener('pointerleave', release);
      btn.addEventListener('contextmenu', (e) => e.preventDefault());
    });
  }

  consumeJump() {
    const queued = this.jumpQueued;
    this.jumpQueued = false;
    return queued;
  }

  clear() {
    this.left = false;
    this.right = false;
    this.jumpHeld = false;
    this.jumpQueued = false;
    document.querySelectorAll('[data-action].is-active')
      .forEach((el) => el.classList.remove('is-active'));
  }
}
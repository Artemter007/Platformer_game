import { moveHorizontal, moveVertical } from './collision.js';

const SPEED = 270;
const ACCEL = 2400;
const AIR_ACCEL = 1600;
const FRICTION = 2600;
const JUMP_SPEED = 700;
const MAX_FALL = 1150;
const COYOTE = 0.09;
const STEP = 1 / 120;

export class Player {
  constructor(spawn) {
    this.w = 34;
    this.h = 46;
    this.reset(spawn);
  }

  reset(spawn) {
    this.x = spawn.x;
    this.y = spawn.y;
    this.vx = 0;
    this.vy = 0;
    this.onGround = false;
    this.facing = 1;
    this.coyote = 0;
  }

  update(dt, level, controls) {
    // ФИКС ПЛАТФОРМ: Если мы стоим на движущейся платформе, двигаем игрока вместе с ней
    if (this.onGround && level.movingPlatforms) {
      for (const p of level.movingPlatforms) {
        // Проверяем, стоим ли мы ровно на этой платформе
        if (Math.abs((this.y + this.h) - p.y) < 4 && 
            this.x + this.w > p.x && 
            this.x < p.x + p.w) {
          // Переносим игрока на смещение платформы
          this.x += p.dx || 0;
          this.y += p.dy || 0;
          break;
        }
      }
    }

    const steps = Math.max(1, Math.ceil(dt / STEP));
    const sdt = dt / steps;
    
    const gravityMultiplier = level.gravity || 1;
    const windForce = level.wind || 0;

    for (let i = 0; i < steps; i++) {
      this.step(sdt, level.platforms, controls, i === 0, gravityMultiplier, windForce);
    }
  }

  step(dt, platforms, controls, firstSubstep, gravityMultiplier, windForce) {
    const dir = (controls.right ? 1 : 0) - (controls.left ? 1 : 0);
    const accel = this.onGround ? ACCEL : AIR_ACCEL;

    if (dir !== 0) {
      this.vx += dir * accel * dt;
      if (Math.abs(this.vx) > SPEED) this.vx = Math.sign(this.vx) * SPEED;
      this.facing = dir;
    } else {
      const f = (this.onGround ? FRICTION : FRICTION * 0.4) * dt;
      if (Math.abs(this.vx) <= f) this.vx = 0;
      else this.vx -= Math.sign(this.vx) * f;
    }

    // ФИКС ВЕТРА: Применяем ветер ПОСЛЕ трения, чтобы он мог сдвинуть игрока, даже если тот стоит
    this.vx += windForce * dt;

    if (this.coyote > 0) this.coyote -= dt;
    if (firstSubstep && controls.jump && this.coyote > 0) {
      this.vy = -JUMP_SPEED;
      this.coyote = 0;
      this.onGround = false;
    }

    this.vy += 2000 * gravityMultiplier * dt;
    if (this.vy > MAX_FALL) this.vy = MAX_FALL;

    moveHorizontal(this, this.vx * dt, platforms);
    const grounded = moveVertical(this, this.vy * dt, platforms);

    this.onGround = grounded;
    if (grounded) this.coyote = COYOTE;
  }
}
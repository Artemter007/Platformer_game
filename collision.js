// Проверка пересечения двух прямоугольников (AABB)
export function overlaps(a, b) {
  return (
    a.x < b.x + b.w &&
    a.x + a.w > b.x &&
    a.y < b.y + b.h &&
    a.y + a.h > b.y
  );
}

// Движение по X с разрешением столкновений
export function moveHorizontal(body, dx, solids) {
  if (dx === 0) return;
  body.x += dx;

  for (const s of solids) {
    if (!overlaps(body, s)) continue;
    if (dx > 0) body.x = s.x - body.w;
    else body.x = s.x + s.w;
    body.vx = 0;
  }
}

// Движение по Y. Возвращает true, если тело стоит на опоре
export function moveVertical(body, dy, solids) {
  if (dy === 0) return false;
  body.y += dy;

  let grounded = false;
  for (const s of solids) {
    if (!overlaps(body, s)) continue;
    if (dy > 0) {
      body.y = s.y - body.h;
      body.vy = 0;
      grounded = true;
    } else {
      body.y = s.y + s.h;
      body.vy = 0;
    }
  }
  return grounded;
}
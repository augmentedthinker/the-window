const TAU = Math.PI * 2;
const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

function ellipse(ctx, x, y, rx, ry, angle = 0) {
  ctx.beginPath();
  ctx.ellipse(x, y, Math.max(0, rx), Math.max(0, ry), angle, 0, TAU);
}

function drawAbstract(ctx, shot, time, level, bands, theme, width, height) {
  const middle = width / 2;
  const center = height / 2;
  const scale = height / 540;
  const { ink, cool, hot, warm } = theme;
  const glow = ctx.createRadialGradient(middle, center, 0, middle, center, width * .63);
  glow.addColorStop(0, ink[1]);
  glow.addColorStop(1, ink[0]);
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, width, height);
  for (let i = 0; i < 154; i++) {
    const x = ((i * 173.17 + 61.83) % 973) / 973 * width;
    const y = ((i * 137.37 + 13.7) % 541) / 541 * height;
    ctx.globalAlpha = .11 + .26 * ((i % 13) / 13) + .08 * Math.sin(time * 2 + i);
    ctx.fillStyle = i % 5 ? cool : warm;
    const size = (i % 11 === 0 ? 2.2 : 1.05) * scale;
    ctx.fillRect(x, y, size, size);
  }
  ctx.globalAlpha = 1;
  if (shot.effect === 'spectrum') {
    ctx.save();
    ctx.translate(middle, center);
    const spacing = Math.min(width / 29, 28 * scale);
    const barWidth = spacing * .48;
    for (let i = 0; i < 24; i++) {
      const length = height * (.01 + bands[i] * .30);
      const x = (i - 11.5) * spacing;
      const field = ctx.createLinearGradient(0, -length, 0, length);
      field.addColorStop(0, i % 4 === 0 ? warm : cool);
      field.addColorStop(.5, hot);
      field.addColorStop(1, cool);
      ctx.fillStyle = field;
      ctx.beginPath();
      ctx.roundRect(x - barWidth / 2, -length, barWidth, length * 2, barWidth / 2);
      ctx.fill();
      ctx.globalAlpha = .36;
      ctx.fillStyle = warm;
      ctx.fillRect(x - scale, -length - 12 * scale, 2 * scale, 2 * scale);
      ctx.globalAlpha = 1;
    }
    ctx.restore();
    return;
  }
  if (shot.effect === 'ribbon') {
    const span = width * .81;
    for (let strand = 0; strand < 11; strand++) {
      ctx.strokeStyle = [cool, hot, warm][strand % 3];
      ctx.globalAlpha = .29 + strand * .051;
      ctx.lineWidth = (strand % 3 === 0 ? 2.2 : 1.2) * scale;
      ctx.beginPath();
      for (let i = 0; i <= 180; i++) {
        const f = i / 180;
        const envelope = Math.sin(Math.PI * f) ** .75;
        const band = bands[Math.floor(f * 23)];
        const y = center + (strand - 5) * height * .032 +
          Math.sin(f * TAU * 1.62 - time * 2.2 + strand * .32) * envelope * height * (.075 + level * .11) +
          Math.sin(f * TAU * 5.4 + time * 4.05 + strand * .59) * envelope * height * band * .067;
       const x = middle - span / 2 + span * f;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
    return;
  }
  const unit = Math.min(width, height);
  const ellipseAngle = -.34 + Math.sin(time * .6) * .21;
  for (let ring = 0; ring < 13; ring++) {
    const band = bands[ring + 2];
    const radius = unit * (.076 + ring * .032 + level * .028 + band * .016);
    ellipse(ctx, middle, center, radius * 1.19, radius * .63, ellipseAngle);
    ctx.lineWidth = (ring % 4 === 0 ? 2.0 : 1.0) * scale;
    ctx.strokeStyle = [cool, hot, warm][ring % 3];
    ctx.globalAlpha = .37 + band * .60;
    ctx.stroke();
    const orbit = time * (.57 + ring * .08) + ring * 1.78;
    const dx = Math.cos(orbit) * radius * 1.19;
    const dy = Math.sin(orbit) * radius * .63;
    ellipse(ctx, middle + dx * Math.cos(ellipseAngle) - dy * Math.sin(ellipseAngle),
      center + dx * Math.sin(ellipseAngle) + dy * Math.cos(ellipseAngle), (2.1 + band * 3) * scale, (2.1 + band * 3) * scale);
    ctx.fillStyle = ring % 3 ? cool : warm;
    ctx.fill();
  }
  ctx.globalAlpha = .77 + level * .23;
  ctx.fillStyle = warm;
  ellipse(ctx, middle, center, (4 + 10 * level) * scale, (4 + 10 * level) * scale);
  ctx.fill();
  ctx.globalAlpha = 1;
}

function drawPlate(ctx, image, shot, local, level, bands, theme, width, height) {
  const progress = clamp(local / shot.duration, 0, 1);
  let zoom = 1;
  if (shot.motion === 'in') zoom += .075 * progress;
  if (shot.motion === 'out') zoom += .075 * (1 - progress);
  if (shot.motion === 'left' || shot.motion === 'right') zoom = 1.075;
  let focus = shot.focus || { x: .5, y: .5 };
  if (shot.camera) {
    const { from, to } = shot.camera;
    const t = progress * progress * (3 - 2 * progress);
    zoom = from.zoom + (to.zoom - from.zoom) * t;
    focus = { x: from.x + (to.x - from.x) * t, y: from.y + (to.y - from.y) * t };
  }
  const fit = Math.max(width / (image.naturalWidth || image.videoWidth), height / (image.naturalHeight || image.videoHeight)) * zoom;
  const drawnWidth = (image.naturalWidth || image.videoWidth) * fit;
  const drawnHeight = (image.naturalHeight || image.videoHeight) * fit;
  const x = !shot.camera && ['left', 'right'].includes(shot.motion)
    ? (width - drawnWidth) * (shot.motion === 'left' ? 1 - progress : progress)
    : clamp(width * .5 - drawnWidth * focus.x, width - drawnWidth, 0);
  const y = clamp(height * .5 - drawnHeight * focus.y, height - drawnHeight, 0);
  ctx.drawImage(image, x, y, drawnWidth, drawnHeight);

  if (!shot.instrument) return;
  const [u, v, a, b] = shot.instrument;
  const cx = x + drawnWidth * u;
  const cy = y + drawnHeight * v;
  const rx = drawnWidth * a;
  const ry = drawnHeight * b;
  if (shot.effect === 'cone') {
    ellipse(ctx, cx, cy, rx, ry);
    ctx.save();
    ctx.clip();
    const flex = 1 + .102 * Math.max(...bands.slice(0, 4));
    ctx.translate(cx, cy);
    ctx.scale(flex, flex);
    ctx.translate(-cx, -cy);
    ctx.drawImage(image, x, y, drawnWidth, drawnHeight);
    ctx.restore();
    return;
  }
  if (shot.effect !== 'receiver') return;
  ctx.save();
  ctx.beginPath();
  ctx.rect(cx - rx, cy - ry, 2 * rx, 2 * ry);
  ctx.clip();
  for (let i = 0; i < 24; i++) {
    const step = 2 * rx / 25;
    const bar = ry * (.11 + 1.65 * bands[i]);
    ctx.globalAlpha = .45 + bands[i] * .55;
    ctx.fillStyle = i < 8 ? theme.warm : i < 16 ? theme.cool : theme.hot;
    ctx.fillRect(cx - rx + (i + .65) * step, cy + ry * .84 - bar, Math.max(1, step * .54), bar);
  }
  ctx.restore();
}

export function frameAt(project, canvas, shot, image, time, local, sample) {
  const ctx = canvas.getContext('2d');
  const { width, height } = canvas;
  const { theme } = project;
  const [level, ...bands] = sample ?? Array(25).fill(0);
  ctx.fillStyle = theme.ink[0];
  ctx.fillRect(0, 0, width, height);
  if (!shot) return;
  if (shot.kind === 'Abstract') {
    drawAbstract(ctx, shot, time, level, bands, theme, width, height);
  } else if (image?.naturalWidth || image?.videoWidth) {
    drawPlate(ctx, image, shot, local, level, bands, theme, width, height);
  } else {
    ctx.fillStyle = theme.cool;
    ctx.font = '18px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText(shot.media ? 'Media unavailable' : 'Choose media for this scene', width / 2, height / 2);
  }
  const fade = Math.min(1, shot.fadeIn ? local / shot.fadeIn : 1, shot.fadeOut ? (shot.duration - local) / shot.fadeOut : 1);
  if (fade < 1) {
    ctx.globalAlpha = 1 - clamp(fade, 0, 1);
    ctx.fillStyle = theme.ink[0];
    ctx.fillRect(0, 0, width, height);
    ctx.globalAlpha = 1;
  }
}

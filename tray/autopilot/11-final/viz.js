// Song 2 renderers, shared by the cut preview (cut-a11.html) and the clip capture for the editor.
// draw(c, W, H, id, s, t, ctx): id is E1–E3 (environmental: Terry's images, regions in env/regions.js)
// or X1–X3 (abstract); s = signals for this frame {bass, mid, high, rms, bands[32], wave[32]}; t = song seconds.
// ctx = {imgs:{E1,E2,E3}, R: ENV_REGIONS, hits:[s], beats:[s], bg: true|false (false = transparent, for overlays)}.
window.SONG2_VIZ = (() => {
  const INK = '#1f1e1e', BONE = '#ede7d1', EMBER = '#e8892c';
  const since = (arr, t) => { let lo = 0, hi = arr.length - 1, r = -1; while (lo <= hi) { const m = (lo + hi) >> 1; if (arr[m] <= t) { r = m; lo = m + 1; } else hi = m - 1; } return r < 0 ? 99 : t - arr[r]; };
  function env(c, W, H, id, s, t, x) {
    const im = x.imgs[id], r = x.R && x.R[id]; if (!im || !im.naturalWidth || !r) return;
    c.drawImage(im, 0, 0, W, H);
    if (id === 'E1') {
      const cx = r.x * W, cy = r.y * H, rad = r.r * H, k = 1 + s.bass * .09 + (since(x.hits, t) < .12 ? .03 : 0);
      c.save(); c.beginPath(); c.arc(cx, cy, rad, 0, 7); c.clip(); c.translate(cx, cy); c.scale(k, k); c.translate(-cx, -cy); c.drawImage(im, 0, 0, W, H); c.restore();
      const g = c.createRadialGradient(cx, cy, rad * .2, cx, cy, rad * 1.6); g.addColorStop(0, `rgba(232,137,44,${.12 + .35 * s.rms})`); g.addColorStop(1, 'rgba(232,137,44,0)');
      c.globalCompositeOperation = 'screen'; c.fillStyle = g; c.fillRect(0, 0, W, H); c.globalCompositeOperation = 'source-over';
    } else if (id === 'E2') {
      const cx = r.x * W, cy = r.y * H, a = .15 + .6 * s.mid + .2 * s.rms + (Math.sin(t * 37) * .04 * s.high);
      const g = c.createRadialGradient(cx, cy, 4, cx, cy, r.h * H * (1.2 + 1.6 * s.rms)); g.addColorStop(0, `rgba(255,190,110,${Math.min(.95, a)})`); g.addColorStop(.35, `rgba(232,137,44,${a * .5})`); g.addColorStop(1, 'rgba(232,137,44,0)');
      c.globalCompositeOperation = 'screen'; c.fillStyle = g; c.fillRect(0, 0, W, H); c.globalCompositeOperation = 'source-over';
    } else if (id === 'E3') {
      const groups = [[0, 4], [4, 9], [9, 16], [16, 24], [24, 32]];
      r.gauges.forEach((gg, i) => { const [a0, a1] = groups[i], v = s.bands.slice(a0, a1).reduce((p, q) => p + q, 0) / (a1 - a0);
        const cx = gg.x * W, cy = gg.y * H, rad = gg.r * H, ang = Math.PI * (.75 + 1.5 * v);
        c.beginPath(); c.arc(cx, cy, rad * .82, 0, 7); c.fillStyle = 'rgba(237,231,209,.92)'; c.fill();
        c.strokeStyle = INK; c.lineWidth = Math.max(2, rad * .05); c.beginPath(); c.moveTo(cx, cy); c.lineTo(cx + Math.cos(ang) * rad * .72, cy + Math.sin(ang) * rad * .72); c.stroke();
        c.fillStyle = v > .8 ? EMBER : INK; c.beginPath(); c.arc(cx, cy, rad * .08, 0, 7); c.fill(); });
    }
  }
  function abs(c, W, H, id, s, t, x) {
    if (x.bg !== false) { c.fillStyle = BONE; c.fillRect(0, 0, W, H); }
    if (id === 'X1') {
      for (let i = x.hits.length - 1; i >= 0; i--) { const dt = t - x.hits[i]; if (dt < 0) continue; if (dt > 3) break;
        const rad = 40 * W / 1280 + dt * 380 * W / 1280; c.strokeStyle = `rgba(31,30,30,${1 - dt / 3})`; c.lineWidth = (2 + s.bass * 7) * W / 1280; c.beginPath(); c.ellipse(W / 2, H / 2, rad, rad * .55, 0, 0, 7); c.stroke(); }
      if (s.rms > .82) { c.strokeStyle = EMBER; c.lineWidth = 4; c.beginPath(); c.ellipse(W / 2, H / 2, (60 + 40 * s.bass) * W / 1280, (33 + 22 * s.bass) * W / 1280, 0, 0, 7); c.stroke(); }
      if (x.bg !== false) { c.fillStyle = INK; c.beginPath(); c.arc(W / 2, H / 2, (10 + 14 * s.bass) * W / 1280, 0, 7); c.fill(); }
    } else if (id === 'X2') {
      const cw = W / 32; c.strokeStyle = INK; c.lineWidth = 1.4;
      s.bands.forEach((v, i) => { const h = v * H * .85, x0 = i * cw + 4, x1 = x0 + cw - 8, gap = Math.max(4, 16 - v * 12);
        c.beginPath(); for (let y = H - h; y < H; y += gap) { c.moveTo(x0, y); c.lineTo(x1, y + gap * 1.6); if (v > .5) { c.moveTo(x1, y); c.lineTo(x0, y + gap * 1.6); } } c.stroke(); });
      if (since(x.beats, t) < .1) { c.fillStyle = EMBER; c.fillRect(0, H - 8, W, 8); }
    } else if (id === 'X3') {  // ink waveform on bone paper, lit by an ember glow (redrawn from black after the critique)
      const g = c.createRadialGradient(W / 2, H / 2, 10, W / 2, H / 2, (120 + 520 * s.rms) * W / 1280); g.addColorStop(0, `rgba(232,137,44,${.25 + .45 * s.mid})`); g.addColorStop(1, 'rgba(232,137,44,0)'); c.fillStyle = g; c.fillRect(0, 0, W, H);
      const w = s.wave, pts = w.map((v, i) => [i / (w.length - 1) * W, H / 2 + v * H * (.45 + .6 * s.bass)]);
      c.strokeStyle = INK; c.lineWidth = 3 * W / 1280; c.lineJoin = 'round'; c.beginPath(); c.moveTo(...pts[0]);
      for (let i = 1; i < pts.length - 1; i++) { const mx = (pts[i][0] + pts[i + 1][0]) / 2, my = (pts[i][1] + pts[i + 1][1]) / 2; c.quadraticCurveTo(pts[i][0], pts[i][1], mx, my); }
      c.lineTo(...pts[pts.length - 1]); c.stroke();
    }
  }
  return { draw: (c, W, H, id, s, t, x) => (id[0] === 'E' ? env : abs)(c, W, H, id, s, t, x) };
})();

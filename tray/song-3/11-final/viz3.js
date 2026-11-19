// Song 3 (Every Other Note) renderers, shared by the cut preview and the clip capture.
// draw(c, W, H, id, s, t, x): s = signals {bass, mid, high, rms, bands[32], wave[32]}; t = song seconds.
// x = {sig(t), beats:[s], hits:[s], imgs:{id: Image}}.
// Ids: K1 kotekan (two interlocking rows of bronze keys), K2 perforated screen rosette, K3 the seam,
//      D:<front>:<behind> double exposure of two plates (front lit through behind), L:<plate> plate with lamp flicker.
window.SONG3_VIZ = (() => {
  const INDIGO = '#141B3A', AMBER = [232, 163, 61], VERM = [200, 69, 43], TURQ = [43, 163, 154], SAFF = [240, 190, 70], BRONZE = [140, 106, 58];
  const rgba = (c, a) => `rgba(${c[0]},${c[1]},${c[2]},${a})`;
  const since = (arr, t) => { let lo = 0, hi = arr.length - 1, r = -1; while (lo <= hi) { const m = (lo + hi) >> 1; if (arr[m] <= t) { r = m; lo = m + 1; } else hi = m - 1; } return r; };
  const k = W => W / 1280;
  function screen(c, W, H, s, dim = 1) {  // the amber cloth screen with a lamp behind it
    const g = c.createRadialGradient(W * .5, H * .48, 20, W * .5, H * .5, W * (.55 + .12 * s.rms));
    g.addColorStop(0, rgba(AMBER, .95 * dim)); g.addColorStop(.55, rgba([180, 110, 40], .75 * dim)); g.addColorStop(1, INDIGO);
    c.fillStyle = INDIGO; c.fillRect(0, 0, W, H); c.fillStyle = g; c.fillRect(0, 0, W, H);
  }
  // interlocking notes: eighth-note grid from the beats; even subdivisions = her (top), odd = his (bottom)
  function notes(t, x, back = 3.2) {
    const out = [], b = x.beats, i0 = since(b, t - back);
    for (let i = Math.max(0, i0); i < b.length && b[i] <= t; i++) {
      const nxt = b[i + 1] ?? b[i] + .49;
      for (let h = 0; h < 2; h++) {
        const tt = b[i] + h * (nxt - b[i]) / 2; if (tt > t || tt < t - back) continue;
        const s = x.sig(tt); let w = 0, sum = 0; for (let j = 4; j < 26; j++) { w += s.bands[j] * j; sum += s.bands[j]; }
        const cen = sum ? (w / sum - 4) / 22 : .5, pat = [0, 2, 1, 3][(i * 2 + h) % 4];
        out.push({ t: tt, row: h, key: (Math.round(cen * 9) + pat) % 8, v: .35 + .65 * s.rms });
      }
    }
    return out;
  }
  function K1(c, W, H, s, t, x) {
    screen(c, W, H, s); const K = k(W);
    const kw = W * .085, x0 = W * .16, rows = [H * .22, H * .78], ns = notes(t, x);
    const lit = [new Array(8).fill(0), new Array(8).fill(0)];
    for (const n of ns) { const a = Math.max(0, 1 - (t - n.t) / .6) * n.v; lit[n.row][n.key] = Math.max(lit[n.row][n.key], a); }
    for (let r = 0; r < 2; r++) for (let i = 0; i < 8; i++) {
      const cx = x0 + (i + (r ? .5 : 0)) * kw, cy = rows[r], L = lit[r][i], col = r ? VERM : TURQ, kh = H * .15;
      if (L > .02) { const gg = c.createRadialGradient(cx, cy, 2, cx, cy, kw * 1.2); gg.addColorStop(0, rgba(col, Math.min(.9, L))); gg.addColorStop(1, rgba(col, 0)); c.fillStyle = gg; c.fillRect(cx - kw * 1.3, cy - kw * 1.3, kw * 2.6, kw * 2.6); }
      c.fillStyle = 'rgba(38,20,12,.95)'; c.beginPath(); c.roundRect(cx - kw * .38, cy - kh / 2, kw * .76, kh, 6 * K); c.fill();
      for (let j = 0; j < 5; j++) { const hy = cy - kh * .36 + j * kh * .18; c.fillStyle = L > .05 ? rgba(col, .45 + .55 * L) : rgba(AMBER, .55 + .3 * s.rms);  // the perforations
        c.beginPath(); c.ellipse(cx, hy, kw * .13, kh * .045, 0, 0, 7); c.fill(); }
    }
    // the seam: each struck note is written onto one line that scrolls left; her notes and his make one melody
    const sx = n => W * .9 - (t - n.t) * W * .24, sy = n => H / 2 + (3.5 - n.key) * H * .03;
    const pts = ns.map(n => [sx(n), sy(n), n]).filter(q => q[0] > W * .04);
    if (pts.length > 1) { c.lineWidth = 4 * K; c.strokeStyle = 'rgba(38,20,12,.85)'; c.lineJoin = 'round'; c.beginPath(); c.moveTo(pts[0][0], pts[0][1]);
      for (let j = 1; j < pts.length - 1; j++) c.quadraticCurveTo(pts[j][0], pts[j][1], (pts[j][0] + pts[j + 1][0]) / 2, (pts[j][1] + pts[j + 1][1]) / 2);
      c.lineTo(pts[pts.length - 1][0], pts[pts.length - 1][1]); c.stroke(); }
    for (const [px, py, n] of pts) { const a = Math.max(.35, 1 - (t - n.t) / 3.2), r0 = (6 + 10 * Math.max(0, 1 - (t - n.t) / .4)) * K;
      c.fillStyle = 'rgba(38,20,12,.9)'; c.beginPath(); c.arc(px, py, r0 + 2 * K, 0, 7); c.fill();
      c.fillStyle = rgba(n.row ? VERM : TURQ, a); c.beginPath(); c.arc(px, py, r0, 0, 7); c.fill(); }
    const hi = since(x.hits, t), dt = hi < 0 ? 9 : t - x.hits[hi];  // the gong
    if (dt < 2) { c.strokeStyle = rgba([38, 20, 12], .5 * (1 - dt / 2)); c.lineWidth = 3 * K; c.beginPath(); c.arc(W / 2, H / 2, (60 + 520 * dt) * K, 0, 7); c.stroke(); }
    vignette(c, W, H);
  }
  function vignette(c, W, H) { const g = c.createRadialGradient(W / 2, H / 2, H * .35, W / 2, H / 2, W * .62); g.addColorStop(0, 'rgba(13,18,38,0)'); g.addColorStop(1, 'rgba(13,18,38,.85)'); c.fillStyle = g; c.fillRect(0, 0, W, H); }
  function K2(c, W, H, s, t, x) {  // a perforated cut-leather rosette in front of the lamp; rings turn in alternate directions
    screen(c, W, H, s); const K = k(W), cx = W / 2, cy = H / 2, R = H * (.36 + .04 * s.bass);
    c.fillStyle = 'rgba(38,20,12,.96)'; c.beginPath(); c.arc(cx, cy, R, 0, 7); c.fill();
    const bi = since(x.beats, t), hi = since(x.hits, t), hit = hi < 0 ? 9 : t - x.hits[hi];
    for (let r = 1; r <= 6; r++) {
      const rad = R * r / 6.6, n = 6 + r * 6, dir = r % 2 ? 1 : -1, rot = dir * (t * (.05 + .25 * s.mid) + (bi % 2 === r % 2 ? .02 : 0));
      const on = r === 6 && hit < .5, col = r % 2 ? TURQ : VERM, hs = (2.2 + r * .6 + (on ? 2 : 0)) * K;
      for (let j = 0; j < n; j++) { const a = rot + j * 2 * Math.PI / n, px = cx + Math.cos(a) * rad, py = cy + Math.sin(a) * rad;
        c.fillStyle = on ? rgba(SAFF, 1) : (j % 3 === 0 ? rgba(col, .8 + .2 * s.rms) : rgba(AMBER, .7 + .3 * s.rms));
        c.beginPath(); c.ellipse(px, py, hs * 1.8, hs, a, 0, 7); c.fill(); }
    }
    c.fillStyle = rgba(SAFF, .6 + .4 * s.bass); c.beginPath(); c.arc(cx, cy, (8 + 10 * s.bass) * K, 0, 7); c.fill();
  }
  function K3(c, W, H, s, t, x) {  // the seam: her colour from the left, his from the right, a third colour where they meet
    screen(c, W, H, s, .8); const bi = Math.max(0, since(x.beats, t)), bt = t - (x.beats[bi] ?? 0), pulse = Math.max(0, 1 - bt / .35);
    const side = (fromLeft, col, boost) => {  // smooth cut-leather edge, one point per band
      const P = []; for (let i = 0; i <= 32; i++) { const v = s.bands[Math.min(31, fromLeft ? i : 31 - i)] ?? 0, ext = W * (.3 + .32 * v + .08 * boost); P.push([fromLeft ? ext : W - ext, i / 32 * H]); }
      c.fillStyle = rgba(col, .62); c.strokeStyle = 'rgba(38,20,12,.9)'; c.lineWidth = 5 * k(W); c.beginPath(); c.moveTo(fromLeft ? 0 : W, 0); c.lineTo(P[0][0], P[0][1]);
      for (let j = 1; j < P.length - 1; j++) c.quadraticCurveTo(P[j][0], P[j][1], (P[j][0] + P[j + 1][0]) / 2, (P[j][1] + P[j + 1][1]) / 2);
      c.lineTo(P[32][0], H); c.lineTo(fromLeft ? 0 : W, H); c.closePath(); c.fill(); c.stroke();
      c.fillStyle = 'rgba(38,20,12,.55)'; for (let j = 1; j < 32; j += 2) { const [px, py] = P[j], ix = px + (fromLeft ? -1 : 1) * 26 * k(W); c.beginPath(); c.arc(ix, py, 5 * k(W), 0, 7); c.fill(); }
    };
    side(true, TURQ, bi % 2 ? 0 : pulse); c.globalCompositeOperation = 'multiply'; side(false, VERM, bi % 2 ? pulse : 0); c.globalCompositeOperation = 'source-over';
    c.strokeStyle = rgba(SAFF, .5 + .5 * s.rms); c.lineWidth = 2 * k(W); c.beginPath(); c.moveTo(W / 2, 0); c.lineTo(W / 2, H); c.stroke();
    const hi = since(x.hits, t), dt = hi < 0 ? 9 : t - x.hits[hi];  // a gong hit ripples out from the seam (Antigravity's idea)
    if (dt < 1.5) for (const d of [-1, 1]) { const rx = W / 2 + d * dt * W * .35; c.strokeStyle = rgba(SAFF, .7 * (1 - dt / 1.5)); c.lineWidth = 3 * k(W); c.beginPath(); c.moveTo(rx, 0); c.lineTo(rx, H); c.stroke(); }
    vignette(c, W, H);
  }
  function lamp(c, W, H, s, t) {  // a slow, uneven lamp flicker laid over a front plate
    const f = .5 + .5 * Math.sin(t * 7.3) * Math.sin(t * 3.1 + 1), a = .08 + .14 * s.rms + .05 * f;
    const g = c.createRadialGradient(W * .5, H * .45, 10, W * .5, H * .5, W * .7); g.addColorStop(0, rgba(AMBER, a)); g.addColorStop(1, 'rgba(20,27,58,' + (.18 - .1 * s.rms) + ')');
    c.globalCompositeOperation = 'soft-light'; c.fillStyle = g; c.fillRect(0, 0, W, H); c.globalCompositeOperation = 'source-over';
  }
  function cover(c, im, W, H, z, ox, oy) { if (!im || !im.naturalWidth) return; const sc = Math.max(W / im.naturalWidth, H / im.naturalHeight) * z, w = im.naturalWidth * sc, h = im.naturalHeight * sc; c.drawImage(im, (W - w) / 2 + ox, (H - h) / 2 + oy, w, h); }
  function D(c, W, H, s, t, x, a, b, p) {  // double exposure: the story on the screen with the makers' hands showing through
    cover(c, x.imgs[a], W, H, 1.06 + .05 * p, -W * .02 * p, 0);
    c.globalAlpha = .28 + .2 * s.rms; c.globalCompositeOperation = 'screen'; cover(c, x.imgs[b], W, H, 1.12 - .05 * p, W * .02 * p, 0);
    c.globalAlpha = 1; c.globalCompositeOperation = 'source-over'; lamp(c, W, H, s, t);
  }
  function draw(c, W, H, id, s, t, x, p = 0) {
    if (id === 'K1') return K1(c, W, H, s, t, x);
    if (id === 'K2') return K2(c, W, H, s, t, x);
    if (id === 'K3') return K3(c, W, H, s, t, x);
    if (id.startsWith('D:')) { const [, a, b] = id.split(':'); return D(c, W, H, s, t, x, a, b, p); }
  }
  function cold(c, W, H, p) { const a = Math.min(1, p * 2.2);
    c.globalCompositeOperation = 'saturation'; c.fillStyle = `rgba(128,128,128,${.85 * a})`; c.fillRect(0, 0, W, H);
    c.globalCompositeOperation = 'multiply'; c.fillStyle = `rgba(${Math.round(255 - 165 * a)},${Math.round(255 - 140 * a)},${Math.round(255 - 70 * a)},1)`; c.fillRect(0, 0, W, H);
    c.globalCompositeOperation = 'source-over'; }
  return { draw, lamp, cover, cold };
})();

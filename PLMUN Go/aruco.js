/* PLMUN Go · tiny square-marker detector (ArUco 5x5 style, no libraries).
   detect(imageData) -> [{ id, corners:[{x,y}...4 in marker order TL,TR,BR,BL], err }]
   A marker is a black square border + 5x5 white/black cells, printed on a white sheet. */
(function (g) {
  'use strict';

  function popcount(v) { var c = 0; while (v) { c += v & 1; v >>>= 1; } return c; }

  function squareToQuad(p) {            // (0,0)->p0 (1,0)->p1 (1,1)->p2 (0,1)->p3
    var x0 = p[0].x, y0 = p[0].y, x1 = p[1].x, y1 = p[1].y, x2 = p[2].x, y2 = p[2].y, x3 = p[3].x, y3 = p[3].y;
    var dx1 = x1 - x2, dx2 = x3 - x2, dy1 = y1 - y2, dy2 = y3 - y2, sx = x0 - x1 + x2 - x3, sy = y0 - y1 + y2 - y3;
    var a, b, c, d, e, f, gg, h;
    if (Math.abs(sx) < 1e-9 && Math.abs(sy) < 1e-9) {
      a = x1 - x0; b = x2 - x1; c = x0; d = y1 - y0; e = y2 - y1; f = y0; gg = 0; h = 0;
    } else {
      var den = dx1 * dy2 - dx2 * dy1;
      gg = (sx * dy2 - dx2 * sy) / den; h = (dx1 * sy - sx * dy1) / den;
      a = x1 - x0 + gg * x1; b = x3 - x0 + h * x3; c = x0; d = y1 - y0 + gg * y1; e = y3 - y0 + h * y3; f = y0;
    }
    return [a, b, c, d, e, f, gg, h];
  }
  function applyH(H, u, v) { var w = H[6] * u + H[7] * v + 1; return { x: (H[0] * u + H[1] * v + H[2]) / w, y: (H[3] * u + H[4] * v + H[5]) / w }; }

  function hull(pts) {                   // monotone chain, pts = [[x,y],...]
    pts.sort(function (a, b) { return a[0] - b[0] || a[1] - b[1]; });
    var n = pts.length; if (n < 3) return pts;
    function cross(o, a, b) { return (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]); }
    var lo = [], i;
    for (i = 0; i < n; i++) { while (lo.length >= 2 && cross(lo[lo.length - 2], lo[lo.length - 1], pts[i]) <= 0) lo.pop(); lo.push(pts[i]); }
    var up = [];
    for (i = n - 1; i >= 0; i--) { while (up.length >= 2 && cross(up[up.length - 2], up[up.length - 1], pts[i]) <= 0) up.pop(); up.push(pts[i]); }
    lo.pop(); up.pop();
    return lo.concat(up);
  }
  function triArea(a, b, c) { return Math.abs((b[0] - a[0]) * (c[1] - a[1]) - (c[0] - a[0]) * (b[1] - a[1])) / 2; }
  function reduceTo4(h) {
    h = h.slice();
    while (h.length > 4) {
      var best = 0, ba = 1e18, n = h.length;
      for (var i = 0; i < n; i++) { var a = triArea(h[(i + n - 1) % n], h[i], h[(i + 1) % n]); if (a < ba) { ba = a; best = i; } }
      h.splice(best, 1);
    }
    return h;
  }
  function polyArea(p) { var s = 0, n = p.length; for (var i = 0; i < n; i++) { var j = (i + 1) % n; s += p[i][0] * p[j][1] - p[j][0] * p[i][1]; } return s / 2; }
  function dist(a, b) { return Math.hypot(a[0] - b[0], a[1] - b[1]); }


  /* sharpen the corners: fit a straight line to the boundary points along each side, then intersect neighbours */
  function refine(q, pts) {
    var lines = [], i, j;
    for (i = 0; i < 4; i++) {
      var A = q[i], B = q[(i + 1) % 4], dx = B[0] - A[0], dy = B[1] - A[1], L = Math.hypot(dx, dy);
      if (L < 1) return q;
      var nx = -dy / L, ny = dx / L, sel = [];
      for (j = 0; j < pts.length; j++) {
        var px = pts[j][0] - A[0], py = pts[j][1] - A[1], t = (px * dx + py * dy) / (L * L), d = px * nx + py * ny;
        if (t > 0.12 && t < 0.88 && Math.abs(d) < Math.max(2.5, L * 0.04)) sel.push(pts[j]);
      }
      if (sel.length < 6) return q;
      var mx = 0, my = 0; sel.forEach(function (p) { mx += p[0]; my += p[1]; }); mx /= sel.length; my /= sel.length;
      var sxx = 0, sxy = 0, syy = 0; sel.forEach(function (p) { var a = p[0] - mx, b = p[1] - my; sxx += a * a; sxy += a * b; syy += b * b; });
      var th = 0.5 * Math.atan2(2 * sxy, sxx - syy);
      lines.push({ x: mx, y: my, dx: Math.cos(th), dy: Math.sin(th) });
    }
    var out = [];
    for (i = 0; i < 4; i++) {
      var l1 = lines[(i + 3) % 4], l2 = lines[i], den = l1.dx * l2.dy - l1.dy * l2.dx;
      if (Math.abs(den) < 1e-6) return q;
      var t = ((l2.x - l1.x) * l2.dy - (l2.y - l1.y) * l2.dx) / den;
      var P = [l1.x + t * l1.dx, l1.y + t * l1.dy];
      if (Math.hypot(P[0] - q[i][0], P[1] - q[i][1]) > Math.max(6, Math.hypot(q[i][0] - q[(i + 1) % 4][0], q[i][1] - q[(i + 1) % 4][1]) * 0.15)) return q;
      out.push(P);
    }
    return out;
  }

  function Detector(codes, nValid) {
    this.N = 5;
    this.nValid = nValid || codes.length;
    this.table = [];                       // {id, rot, code}
    var N = this.N;
    for (var id = 0; id < this.nValid; id++) {
      var grid = [], k;
      for (k = 0; k < N * N; k++) grid.push((codes[id] >>> (N * N - 1 - k)) & 1);
      for (var r = 0; r < 4; r++) {
        this.table.push({ id: id, rot: r, code: gridToCode(grid, N) });
        grid = rotCW(grid, N);
      }
    }
  }
  function gridToCode(grid, N) { var v = 0; for (var i = 0; i < N * N; i++) v = (v * 2) + grid[i]; return v >>> 0; }
  function rotCW(grid, N) { var out = new Array(N * N); for (var y = 0; y < N; y++) for (var x = 0; x < N; x++) out[x * N + (N - 1 - y)] = grid[y * N + x]; return out; }

  Detector.prototype.match = function (code) {
    var best = 99, second = 99, bi = -1, t = this.table;
    for (var i = 0; i < t.length; i++) {
      var d = popcount((t[i].code ^ code) >>> 0);
      if (d < best) { if (bi >= 0 && t[bi].id !== t[i].id) second = best; best = d; bi = i; }
      else if (d < second && t[i].id !== t[bi].id) second = d;
    }
    if (best <= 2 && second - best >= 2) return { id: t[bi].id, rot: t[bi].rot, err: best };
    return null;
  };

  /* one pass at the resolution of the given grayscale image */
  Detector.prototype.pass = function (gray, w, h) {
    var N = this.N, out = [];
    // ---- adaptive threshold with a big window (integral image) ----
    var win = Math.max(15, ((w / 6) | 0) | 1), half = win >> 1;
    var integ = new Float64Array((w + 1) * (h + 1)), x, y;
    for (y = 0; y < h; y++) {
      var rowSum = 0;
      for (x = 0; x < w; x++) { rowSum += gray[y * w + x]; integ[(y + 1) * (w + 1) + x + 1] = integ[y * (w + 1) + x + 1] + rowSum; }
    }
    var bin = new Uint8Array(w * h);
    for (y = 0; y < h; y++) {
      var y0 = Math.max(0, y - half), y1 = Math.min(h, y + half + 1);
      for (x = 0; x < w; x++) {
        var x0 = Math.max(0, x - half), x1 = Math.min(w, x + half + 1);
        var s = integ[y1 * (w + 1) + x1] - integ[y0 * (w + 1) + x1] - integ[y1 * (w + 1) + x0] + integ[y0 * (w + 1) + x0];
        var mean = s / ((x1 - x0) * (y1 - y0));
        bin[y * w + x] = gray[y * w + x] < mean * 0.8 - 6 ? 1 : 0;
      }
    }
    // ---- connected dark components ----
    var seen = new Uint8Array(w * h), stack = new Int32Array(w * h), minA = Math.max(120, (w * h) / 6000);
    for (var p0 = 0; p0 < w * h; p0++) {
      if (!bin[p0] || seen[p0]) continue;
      var head = 0, tail = 0; stack[tail++] = p0; seen[p0] = 1;
      var minX = w, maxX = 0, minY = h, maxY = 0;
      while (head < tail) {
        var p = stack[head++], px = p % w, py = (p / w) | 0;
        if (px < minX) minX = px; if (px > maxX) maxX = px; if (py < minY) minY = py; if (py > maxY) maxY = py;
        if (px > 0 && bin[p - 1] && !seen[p - 1]) { seen[p - 1] = 1; stack[tail++] = p - 1; }
        if (px < w - 1 && bin[p + 1] && !seen[p + 1]) { seen[p + 1] = 1; stack[tail++] = p + 1; }
        if (py > 0 && bin[p - w] && !seen[p - w]) { seen[p - w] = 1; stack[tail++] = p - w; }
        if (py < h - 1 && bin[p + w] && !seen[p + w]) { seen[p + w] = 1; stack[tail++] = p + w; }
      }
      var area = tail;
      if (area < minA || area > w * h * 0.8) continue;
      var bw = maxX - minX + 1, bh = maxY - minY + 1;
      if (bw < 14 || bh < 14 || minX <= 1 || minY <= 1 || maxX >= w - 2 || maxY >= h - 2) continue;
      if (bw / bh > 4 || bh / bw > 4) continue;
      // boundary points
      var pts = [];
      for (var i = 0; i < tail; i++) {
        var q = stack[i], qx = q % w, qy = (q / w) | 0;
        if (!bin[q - 1] || !bin[q + 1] || !bin[q - w] || !bin[q + w]) pts.push([qx, qy]);
      }
      var hl = hull(pts);
      if (hl.length < 4) continue;
      var quad = reduceTo4(hl), qa = Math.abs(polyArea(quad)), ha = Math.abs(polyArea(hl));
      if (qa < 300 || qa / ha < 0.9) continue;
      if (area / qa < 0.3) continue;
      var ok = true;
      for (var e = 0; e < 4; e++) { var L = dist(quad[e], quad[(e + 1) % 4]); if (L < 14) ok = false; }
      if (!ok) continue;
      if (polyArea(quad) < 0) quad.reverse();       // clockwise on screen
      quad = refine(quad, pts);
      var c = quad.map(function (a) { return { x: a[0], y: a[1] }; });
      var r = this.decode(gray, w, h, c);
      if (r) out.push(r);
    }
    return out;
  };

  Detector.prototype.decode = function (gray, w, h, c) {
    var N = this.N, cells = N + 2, H = squareToQuad(c), vals = new Array(cells * cells), cy, cx, sy, sx;
    for (cy = 0; cy < cells; cy++) for (cx = 0; cx < cells; cx++) {
      var sum = 0, n = 0;
      for (sy = 0; sy < 3; sy++) for (sx = 0; sx < 3; sx++) {
        var u = (cx + 0.25 + sx * 0.25) / cells, v = (cy + 0.25 + sy * 0.25) / cells, pt = applyH(H, u, v);
        var ix = Math.round(pt.x), iy = Math.round(pt.y);
        if (ix < 0 || iy < 0 || ix >= w || iy >= h) return null;
        sum += gray[iy * w + ix]; n++;
      }
      vals[cy * cells + cx] = sum / n;
    }
    var mn = 255, mx = 0, i;
    for (i = 0; i < vals.length; i++) { if (vals[i] < mn) mn = vals[i]; if (vals[i] > mx) mx = vals[i]; }
    if (mx - mn < 40) return null;
    var thr = (mn + mx) / 2, badBorder = 0;
    for (cy = 0; cy < cells; cy++) for (cx = 0; cx < cells; cx++) {
      if (cy === 0 || cx === 0 || cy === cells - 1 || cx === cells - 1) { if (vals[cy * cells + cx] > thr) badBorder++; }
    }
    if (badBorder > 3) return null;
    var code = 0;
    for (cy = 1; cy <= N; cy++) for (cx = 1; cx <= N; cx++) code = (code * 2) + (vals[cy * cells + cx] > thr ? 1 : 0);
    var m = this.match(code >>> 0);
    if (!m) return null;
    var corners = [];
    for (i = 0; i < 4; i++) corners.push(c[(m.rot + i) % 4]);
    return { id: m.id, corners: corners, err: m.err };
  };

  /* imageData: {data(RGBA), width, height}. maxW = working width. */
  Detector.prototype.detect = function (imageData, maxW) {
    var W = imageData.width, Hh = imageData.height, d = imageData.data, i;
    var gray = new Uint8Array(W * Hh);
    for (i = 0; i < W * Hh; i++) gray[i] = (d[i * 4] * 77 + d[i * 4 + 1] * 150 + d[i * 4 + 2] * 29) >> 8;
    var res = this.pass(gray, W, Hh);
    if (!res.length && W >= 160) {         // big / close markers: look again at half size
      var w2 = W >> 1, h2 = Hh >> 1, g2 = new Uint8Array(w2 * h2), x, y;
      for (y = 0; y < h2; y++) for (x = 0; x < w2; x++) {
        var a = y * 2 * W + x * 2;
        g2[y * w2 + x] = (gray[a] + gray[a + 1] + gray[a + W] + gray[a + W + 1]) >> 2;
      }
      res = this.pass(g2, w2, h2);
      res.forEach(function (r) { r.corners = r.corners.map(function (p) { return { x: p.x * 2, y: p.y * 2 }; }); });
    }
    return res;
  };

  g.PLMunMarker = { Detector: Detector, squareToQuad: squareToQuad, applyH: applyH };
})(window);
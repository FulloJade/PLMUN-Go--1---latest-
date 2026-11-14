/* ==========================================================================
   PLMUN GO: ENHANCEMENTS (home page only)
   Load it AFTER directions.js:   <script src="enhancements.js"></script>

   1. "You are here"  - set your current spot (QR code or picker). Directions
                        then start from there automatically.
   2. Typo-friendly search - "clinc" -> "clinic", with a "Showing results for" note.
   3. Voice input     - mic button: speak your question.
   4. Helpful? 👍 👎   - plus a usage log you can download (for your testing / defense).
                        Open  index.html?log  to see the download button.
   ========================================================================== */
(function () {
  'use strict';

  var KEY_HERE = 'plmun-here';
  var KEY_LOG = 'plmun-log';

  var store = {
    get: function (k) { try { return window.localStorage.getItem(k); } catch (e) { return null; } },
    set: function (k, v) { try { window.localStorage.setItem(k, v); } catch (e) { /* private mode */ } },
    del: function (k) { try { window.localStorage.removeItem(k); } catch (e) { } }
  };
  var $ = function (s, r) { return (r || document).querySelector(s); };
  function el(tag, cls, html) { var e = document.createElement(tag); if (cls) e.className = cls; if (html !== undefined) e.innerHTML = html; return e; }
  function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }

  document.addEventListener('DOMContentLoaded', function () {
    var input = $('#user-input'), send = $('#send-button'), out = $('#ai-response');
    if (!input || !send || !out) return;           // not the home page
    var R = window.PLMunRoute;                       // set by directions.js

    var pendingQuery = '';
    var lastEntry = null;

    /* ================= 1. YOU ARE HERE ================= */
    function roomById(id) { return R && R.rooms ? R.rooms[id] : null; }

    function findRoom(name) {
      if (!R || !R.rooms || !name) return null;
      var exact = R.rooms.filter(function (r) { return r.name === name; })[0];
      return exact || R.resolve(name);
    }

    function getHere() { return findRoom(store.get(KEY_HERE)); }

    var pill = el('div', 'here-pill'); pill.hidden = true;
    document.body.appendChild(pill);

    var modal = el('div', 'here-modal'); modal.hidden = true;
    modal.innerHTML =
      '<div class="here-box" role="dialog" aria-label="Set your location">' +
      '<h3>📍 Where are you right now?</h3>' +
      '<p>Pick the place nearest to you. Directions will start from here.</p>' +
      '<select id="here-select"></select>' +
      '<div class="here-actions"><button type="button" class="here-save">Set my location</button>' +
      '<button type="button" class="here-cancel">Cancel</button></div></div>';
    document.body.appendChild(modal);
    var hereSel = $('#here-select', modal);

    function fillPicker() {
      if (!R || !R.rooms) return;
      var groups = {}, order = [];
      R.rooms.forEach(function (r) {
        if (!groups[r.buildingName]) { groups[r.buildingName] = []; order.push(r.buildingName); }
        groups[r.buildingName].push(r);
      });
      var html = '<option value="">Choose a place…</option>';
      order.forEach(function (b) {
        html += '<optgroup label="' + esc(b) + '">';
        groups[b].forEach(function (r) { html += '<option value="' + r.id + '">' + esc(r.name) + (r.floor ? ' · ' + r.floor + 'F' : '') + '</option>'; });
        html += '</optgroup>';
      });
      hereSel.innerHTML = html;
    }

    function paintPill() {
      var h = getHere();
      pill.hidden = false;
      if (h) {
        pill.innerHTML = '<span class="here-dot"></span><span class="here-text"><small>You are here</small><b>' + esc(h.name) + '</b></span>' +
          '<button type="button" class="here-change">Change</button><button type="button" class="here-x" aria-label="Clear location">✕</button>';
      } else {
        pill.innerHTML = '<span class="here-dot off"></span><span class="here-text"><small>Location</small><b>Not set</b></span>' +
          '<button type="button" class="here-change">Set</button>';
      }
    }

    function setHere(room) {
      store.set(KEY_HERE, room.name);
      paintPill();
      var f = document.getElementById('route-from');
      if (f) { f.value = String(room.id); f.dispatchEvent(new Event('change')); }
    }

    pill.addEventListener('click', function (e) {
      if (e.target.closest('.here-change')) { fillPicker(); modal.hidden = false; }
      if (e.target.closest('.here-x')) { store.del(KEY_HERE); paintPill(); }
    });
    modal.addEventListener('click', function (e) {
      if (e.target === modal || e.target.closest('.here-cancel')) modal.hidden = true;
      if (e.target.closest('.here-save')) {
        var r = roomById(parseInt(hereSel.value, 10));
        if (r) { setHere(r); modal.hidden = true; }
      }
    });

    // QR codes open  index.html?at=Records%20Office   -> sets the location, then cleans the address bar
    (function readQr() {
      var at = null;
      try { at = new URLSearchParams(window.location.search).get('at'); } catch (e) { }
      if (!at) return;
      var r = findRoom(at);
      if (r) setHere(r);
      try {
        var u = new URL(window.location.href);
        u.searchParams.delete('at');
        window.history.replaceState(null, '', u.pathname + (u.search || '') + u.hash);
      } catch (e) { }
    })();

    if (R && R.rooms) paintPill();

    /* ================= 2. TYPO-FRIENDLY SEARCH ================= */
    var EXTRA_WORDS = ('clinic library registrar cashier treasury cafeteria canteen restroom comfort president admission admissions ' +
      'gymnasium laboratory laboratories faculty dean guidance counseling psychology radio theater student council affairs ' +
      'bonifacio mabini rizal pilar heroes hall computer information technology finance accounting secretary lounge ' +
      'medicine anatomy physics chemistry biology publication chorale discipline prefect directions').split(' ');
    var COMMON = ('where there their here what when which want need would could should going about please thanks thank have from ' +
      'with this that them then than room floor first second third fourth fifth building office offices campus school').split(' ');
    var vocab = {};
    EXTRA_WORDS.forEach(function (w) { vocab[w] = 1; });
    if (R && R.rooms) R.rooms.forEach(function (r) { r.norm.split(' ').forEach(function (w) { if (w.length > 3) vocab[w] = 1; }); });
    COMMON.forEach(function (w) { vocab[w] = 1; });
    var vocabList = Object.keys(vocab);

    function dist(a, b, max) {
      if (Math.abs(a.length - b.length) > max) return max + 1;
      var prev = [], i, j;
      for (j = 0; j <= b.length; j++) prev[j] = j;
      for (i = 1; i <= a.length; i++) {
        var cur = [i], min = i;
        for (j = 1; j <= b.length; j++) {
          cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
          if (cur[j] < min) min = cur[j];
        }
        if (min > max) return max + 1;
        prev = cur;
      }
      return prev[b.length];
    }

    var changed = [];
    function fixTypos(q) {
      changed = [];
      return q.replace(/[a-z]{5,}/gi, function (word) {
        var w = word.toLowerCase();
        if (vocab[w]) return word;
        var max = w.length >= 8 ? 2 : 1, best = null, bestD = max + 1, tie = false;
        vocabList.forEach(function (v) {
          if (COMMON.indexOf(v) !== -1) return;       // never "correct" into everyday words
          var d = dist(w, v, max);
          if (d < bestD) { bestD = d; best = v; tie = false; } else if (d === bestD) { tie = true; }
        });
        if (best && !tie && bestD <= max) { changed.push(best); return best; }
        return word;
      });
    }

    var note = el('div', 'did-you-mean'); note.hidden = true;
    var bar = $('.ai-search-bar');
    if (bar && bar.parentNode) bar.parentNode.insertBefore(note, bar.nextSibling);
    function showNote(html) { note.innerHTML = html; note.hidden = false; }
    function hideNote() { note.hidden = true; }

    /* ================= runs before your existing handlers ================= */
    function beforeAsk() {
      var q = input.value.trim();
      if (!q) return;
      pendingQuery = q;
      hideNote();

      var fixed = fixTypos(q);
      if (fixed !== q) { input.value = fixed; showNote('Showing results for <b>' + esc(changed.join(', ')) + '</b>'); }

      // "how do I get to the AVR" with no start point -> start from "You are here"
      var here = getHere();
      if (here && R && R.parse) {
        var p = R.parse(input.value);
        if (p.looksLikeRoute && !p.from && p.to) input.value = 'from ' + here.name + ' to ' + p.to;
      }
    }
    send.addEventListener('click', beforeAsk, true);          // capture = runs first
    input.addEventListener('keypress', function (e) { if (e.key === 'Enter') beforeAsk(); }, true);
    var clear = $('#clear-btn');
    if (clear) clear.addEventListener('click', function () { hideNote(); if (fb) fb.hidden = true; });

    /* ================= 3. VOICE INPUT ================= */
    var SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SR && bar) {
      var mic = el('button', 'mic-btn', '🎤');
      mic.type = 'button'; mic.title = 'Speak your question'; mic.setAttribute('aria-label', 'Speak your question');
      var anchor = clear || send;
      bar.insertBefore(mic, anchor);
      bar.classList.add('has-mic');
      var rec = null, listening = false;

      mic.addEventListener('click', function () {
        if (listening && rec) { rec.stop(); return; }
        if (window.speechSynthesis) window.speechSynthesis.cancel();   // stop talking before listening
        rec = new SR();
        rec.lang = 'en-PH';
        rec.interimResults = false;
        rec.maxAlternatives = 1;
        rec.onstart = function () { listening = true; mic.classList.add('listening'); showNote('🎤 Listening… speak now'); };
        rec.onresult = function (ev) {
          var text = ev.results[0][0].transcript;
          input.value = text;
          hideNote();
          send.click();
        };
        rec.onerror = function (ev) {
          var msg = ev.error === 'not-allowed' ? 'Microphone is blocked. Allow it in the browser address bar.' : 'Sorry, I did not catch that. Try again.';
          showNote(msg);
        };
        rec.onend = function () { listening = false; mic.classList.remove('listening'); };
        try { rec.start(); } catch (e) { /* already started */ }
      });
    }

    /* ================= 4. HELPFUL? + USAGE LOG ================= */
    function loadLog() { try { return JSON.parse(store.get(KEY_LOG) || '[]'); } catch (e) { return []; } }
    function saveLog(arr) { store.set(KEY_LOG, JSON.stringify(arr.slice(-500))); }

    var fb = el('div', 'fb-row', 'Was this helpful? <button type="button" data-v="1" aria-label="Helpful">👍</button><button type="button" data-v="0" aria-label="Not helpful">👎</button><span class="fb-thanks"></span>');
    fb.hidden = true;
    var side = $('.ai-text-side');
    if (side) side.appendChild(fb);

    fb.addEventListener('click', function (e) {
      var b = e.target.closest('button[data-v]');
      if (!b || !lastEntry) return;
      var log = loadLog();
      var idx = log.length - 1;
      if (idx >= 0 && log[idx].t === lastEntry.t) { log[idx].helpful = b.getAttribute('data-v') === '1'; saveLog(log); }
      fb.querySelector('.fb-thanks').textContent = b.getAttribute('data-v') === '1' ? 'Thanks! 😊' : 'Thanks, we will improve it.';
      fb.classList.add('done');
    });

    var timer = null;
    new MutationObserver(function () {
      clearTimeout(timer);
      timer = setTimeout(function () {
        var text = (out.innerText || '').replace(/\s+/g, ' ').trim();
        if (!text || /^Hello!/.test(text) || !pendingQuery) return;
        var found = !/^❓|could not find|don't have information|I do not have/i.test(text);
        lastEntry = { t: new Date().toISOString(), q: pendingQuery, a: text.slice(0, 160), found: found, helpful: null };
        var log = loadLog(); log.push(lastEntry); saveLog(log);
        pendingQuery = '';
        fb.classList.remove('done'); fb.querySelector('.fb-thanks').textContent = '';
        fb.hidden = false;
        refreshLogButton();
      }, 300);
    }).observe(out, { childList: true, subtree: true, characterData: true });

    function csv() {
      var rows = [['time', 'question', 'answer', 'found', 'helpful']];
      loadLog().forEach(function (r) { rows.push([r.t, r.q, r.a, r.found ? 'yes' : 'no', r.helpful === null ? '' : (r.helpful ? 'yes' : 'no')]); });
      return rows.map(function (r) { return r.map(function (c) { return '"' + String(c).replace(/"/g, '""') + '"'; }).join(','); }).join('\n');
    }
    function download() {
      var blob = new Blob([csv()], { type: 'text/csv' });
      var a = document.createElement('a');
      a.href = URL.createObjectURL(blob); a.download = 'plmun-go-usage-log.csv';
      document.body.appendChild(a); a.click(); a.remove();
    }

    var logBtn = null;
    function refreshLogButton() {
      if (!logBtn) return;
      var log = loadLog(), found = log.filter(function (r) { return r.found; }).length;
      var rated = log.filter(function (r) { return r.helpful !== null; }), good = rated.filter(function (r) { return r.helpful; }).length;
      logBtn.innerHTML = '⬇ Usage log: ' + log.length + ' questions · ' + (log.length ? Math.round(found / log.length * 100) : 0) + '% answered' +
        (rated.length ? ' · ' + Math.round(good / rated.length * 100) + '% helpful' : '');
    }
    if (/[?&]log\b/.test(window.location.search)) {
      logBtn = el('button', 'log-btn'); logBtn.type = 'button';
      logBtn.addEventListener('click', download);
      document.body.appendChild(logBtn);
      refreshLogButton();
    }

    window.PLMunPlus = { exportCSV: csv, download: download, setHere: function (name) { var r = findRoom(name); if (r) setHere(r); return !!r; }, getHere: getHere };
  });
})();
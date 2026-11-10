/* ==========================================================================
   PLMUN GO: DIRECTIONS (index page only)

   What it does
   - Reads every office/room from the "University Office Directory" on the page,
     so the route data can never go out of date with the directory.
   - Understands sentences like
       "I'm at the clinic and I want to go to the AVR"
       "from the library to the registrar"
       "how do I get to the president's office"
   - Adds a "Directions" button next to Pause / Mute. It opens a panel where you
     pick From and To and get numbered steps (also read aloud, unless muted).
   - Highlights the start and end buildings on the campus map.
   - Adds a small route button to every room in the directory.

   IMPORTANT: the directory does not say where the stairs are or how the
   buildings connect, so the steps are built from FLOORS and BUILDINGS only.
   To make them more precise, fill in LANDMARKS below (one sentence per
   building, e.g. "the stairs beside the clinic").
   ========================================================================== */
(function () {
  'use strict';

  /* ---- 1. EDIT ME: real landmarks that only your team knows ---------------- */
  var LANDMARKS = {
    // Key = the first word of the building name (Mabini, Bonifacio, Del Pilar, Rizal)
    // Example:  Bonifacio: 'the main stairwell beside the lobby',
    Mabini: '',
    Bonifacio: '',
    'Del Pilar': '',
    Rizal: ''
  };

  /* ---- 2. Words people use for rooms ---------------------------------------- */
  var ALIASES = {
    avr: 'audio visual room',
    'a v r': 'audio visual room',
    cr: 'comfort room',
    restroom: 'comfort room',
    toilet: 'comfort room',
    bathroom: 'comfort room',
    washroom: 'comfort room',
    clinic: 'medical dental clinic',
    nurse: 'medical dental clinic',
    dentist: 'medical dental clinic',
    admission: 'university admission center',
    admissions: 'university admission center',
    registrar: 'university registrar',
    cashier: 'treasury office',
    treasury: 'treasury office',
    guidance: 'guidance counseling',
    osa: 'office of student affairs',
    usc: 'university student council',
    ict: 'information communication technology',
    library: 'university library',
    president: 'university president',
    hr: 'human resource',
    gym: 'university gymnasium',
    gymnasium: 'university gymnasium',
    'comp lab': 'computer laboratories',
    'computer lab': 'computer laboratories',
    cba: 'cba faculty',
    cas: 'cas faculty',
    cte: 'cte faculty',
    citcs: 'citcs faculty',
    ccj: 'ccj faculty',
    rotc: 'reserve officers training corps',
    lounge: 'students lounge'
  };

  var STOP = { the: 1, a: 1, an: 1, of: 1, and: 1, to: 1, in: 1, at: 1, on: 1, my: 1, our: 1, room: 1,
    office: 1, please: 1, now: 1, here: 1, there: 1, is: 1, it: 1, me: 1, i: 1, floor: 1, building: 1 };

  var FLOOR_WORDS = ['', 'First', 'Second', 'Third', 'Fourth', 'Fifth', 'Sixth'];

  /* ---- 3. Build the room list from the directory on the page --------------- */
  var rooms = [];
  var buildings = {};

  function clean(s) { return (s || '').replace(/\s+/g, ' ').trim(); }

  function buildingKey(headerText) {
    // "Del Pilar Building (Building 3)" -> "Del Pilar"
    return clean(headerText.replace(/\(.*?\)/g, '').replace(/building/i, ''));
  }

  function floorNumber(label) {
    var l = label.toLowerCase();
    for (var i = 1; i < FLOOR_WORDS.length; i++) {
      if (l.indexOf(FLOOR_WORDS[i].toLowerCase()) === 0) return i;
    }
    var m = l.match(/(\d+)/);
    return m ? parseInt(m[1], 10) : 1;
  }

  function ownText(el) {
    var out = '';
    el.childNodes.forEach(function (n) { if (n.nodeType === 3) out += n.textContent; });
    return clean(out);
  }

  function readDirectory() {
    document.querySelectorAll('.building-card').forEach(function (card) {
      var header = card.querySelector('.building-header');
      if (!header) return;
      var fullName = clean(ownText(header));
      var key = buildingKey(fullName);
      buildings[key] = { key: key, name: fullName.replace(/\(.*?\)/g, '').trim() };
      card.querySelectorAll('.building-content details').forEach(function (d) {
        var sum = d.querySelector('summary');
        if (!sum) return;
        var floorLabel = clean(sum.textContent);
        var floor = floorNumber(floorLabel);
        d.querySelectorAll('li').forEach(function (li) {
          var name = ownText(li);
          if (!name) return;
          rooms.push({
            id: rooms.length,
            name: name,
            building: key,
            buildingName: buildings[key].name,
            floor: floor,
            floorLabel: floorLabel,
            li: li,
            norm: normalize(name + ' ' + key)
          });
        });
      });
    });

    // Places the directory does not list as offices but the assistant already knows
    rooms.push({
      id: rooms.length, name: 'Comfort Room / Restroom', building: 'Bonifacio',
      buildingName: 'Bonifacio Building', floor: 1, floorLabel: 'First Floor',
      norm: normalize('comfort room restroom toilet bathroom Bonifacio')
    });
    buildings['Gymnasium'] = { key: 'Gymnasium', name: 'University Gymnasium', outdoor: true };
    rooms.push({
      id: rooms.length, name: 'University Gymnasium', building: 'Gymnasium',
      buildingName: 'University Gymnasium', floor: 1, floorLabel: 'Ground level',
      norm: normalize('university gymnasium gym')
    });
  }

  /* ---- 4. Matching ---------------------------------------------------------- */
  function normalize(s) {
    return (s || '').toLowerCase().replace(/['’]s\b/g, '').replace(/[^a-z0-9 ]+/g, ' ').replace(/\s+/g, ' ').trim();
  }

  function tokens(s) {
    return normalize(s).split(' ').filter(function (t) { return t.length > 1 && !STOP[t]; });
  }

  function resolve(phrase) {
    var p = normalize(phrase);
    if (!p) return null;
    // aliases: whole phrase first, then any alias word inside it
    var expanded = p;
    Object.keys(ALIASES).forEach(function (k) {
      if (new RegExp('(^| )' + k + '( |$)').test(p)) expanded += ' ' + ALIASES[k];
    });
    var toks = tokens(expanded);
    if (!toks.length) return null;
    var best = null, bestScore = 0;
    rooms.forEach(function (r) {
      var words = r.norm.split(' ');
      var score = 0;
      toks.forEach(function (t) {
        for (var i = 0; i < words.length; i++) {
          var w = words[i];
          if (w === t) { score += 2; return; }
          if (t.length >= 3 && (w.indexOf(t) === 0 || (w.length >= 3 && t.indexOf(w) === 0))) { score += 1; return; }
        }
      });
      // prefer shorter, more specific names when scores tie
      score = score - r.norm.length / 1000;
      if (score > bestScore) { bestScore = score; best = r; }
    });
    return bestScore >= 1 ? best : null;
  }

  /* ---- 5. Understanding the sentence --------------------------------------- */
  function trimPhrase(s) {
    return clean((s || '')
      .replace(/\b(please|thanks|thank you|po|now|right now|from here)\b/g, ' ')
      .replace(/[?!.,;]+$/g, ''));
  }

  function parseQuery(raw) {
    var q = ' ' + raw.toLowerCase().replace(/[’]/g, "'") + ' ';
    var from = null, to = null, m;

    // "from X to Y"
    m = q.match(/\bfrom\s+(?:the\s+)?(.+?)\s+to\s+(?:the\s+)?(.+?)\s*[?.!]?\s*$/);
    if (m) { from = m[1]; to = m[2]; }

    // "how do I get to Y from X"
    if (!to) {
      m = q.match(/\b(?:get|go|walk|head|going|reach)\s+to\s+(?:the\s+)?(.+?)\s+from\s+(?:the\s+)?(.+?)\s*[?.!]?\s*$/);
      if (m) { to = m[1]; from = m[2]; }
    }

    // "I'm at/in/on X ..."
    if (!from) {
      m = q.match(/\b(?:i'?m|i am|we'?re|we are|currently)\s+(?:currently\s+)?(?:at|in|on|near|inside|outside|by|beside)\s+(?:the\s+)?(.+?)(?=\s*(?:,|\.|;|!|\?|\band\b|\bbut\b|\bnow\b|\bhow\b|\bi\b|\bwant\b|\bneed\b|\bwhere\b|$))/);
      if (m) from = m[1];
    }

    // destination
    if (!to) {
      m = q.match(/\b(?:want|need|wanna|would like|trying|have|gotta|going|supposed)\s+to\s+(?:go\s+to|get\s+to|head\s+to|reach|walk\s+to|find|visit|be\s+(?:at|in))?\s*(?:the\s+)?(.+?)\s*[?.!]?\s*$/);
      if (m) to = m[1];
    }
    if (!to) {
      m = q.match(/\b(?:directions?|route|way|path|navigate|walk|go|get|head)\s+(?:to|towards)\s+(?:the\s+)?(.+?)\s*[?.!]?\s*$/);
      if (m) to = m[1];
    }
    if (!to) {
      m = q.match(/\bhow\s+(?:do|can|should|to)\s+(?:i\s+)?(?:get|go|reach)\s+(?:to\s+)?(?:the\s+)?(.+?)\s*[?.!]?\s*$/);
      if (m) to = m[1];
    }

    var isRouteWord = /\b(direction|directions|route|how do i (get|go)|how to (get|go)|how can i (get|go)|want to go|need to go|going to|navigate|way to|path to|from\b.+\bto\b)/.test(q);
    return { from: trimPhrase(from), to: trimPhrase(to), looksLikeRoute: isRouteWord || (!!from && !!to) };
  }

  /* ---- 6. Making the steps -------------------------------------------------- */
  function floorWord(n) { return (FLOOR_WORDS[n] || n + 'th') + ' floor'; }
  function plural(n, w) { return n + ' ' + w + (n === 1 ? '' : 's'); }
  function landmark(key) { return LANDMARKS[key] ? ' (' + LANDMARKS[key] + ')' : ''; }

  function mapLeft(key) {
    var pin = Array.prototype.find.call(document.querySelectorAll('.map-pin'), function (p) {
      return (p.getAttribute('data-title') || '').toLowerCase().indexOf(key.toLowerCase()) !== -1;
    });
    if (!pin) return null;
    var v = parseFloat(pin.style.left);
    return isNaN(v) ? null : v;
  }

  function mapHint(a, b) {
    var la = mapLeft(a), lb = mapLeft(b);
    if (la === null || lb === null) return '';
    var d = lb - la;
    if (Math.abs(d) < 8) return ' It is close by on the map.';
    return d > 0 ? ' On the campus map it is toward the right.' : ' On the campus map it is toward the left.';
  }

  function stairsStep(key, from, to) {
    var diff = Math.abs(to - from);
    var dir = to > from ? 'up' : 'down';
    return 'Take the stairs' + landmark(key) + ' ' + dir + ' ' + plural(diff, 'floor') + ' to the ' + floorWord(to) + '.';
  }

  function buildRoute(a, b) {
    var steps = [];
    var summary;

    if (a.id === b.id) {
      return { summary: 'You are already there.', steps: [{ i: 'fa-circle-check', t: 'You picked the same place for both. Choose a different destination.' }] };
    }

    steps.push({ i: 'fa-location-dot', t: 'Start at <b>' + esc(a.name) + '</b> (' + esc(a.buildingName) + ', ' + floorWord(a.floor) + ').' });

    if (a.building === b.building && !buildings[a.building].outdoor) {
      // ----- same building: never go outside
      if (a.floor === b.floor) {
        steps.push({ i: 'fa-person-walking', t: 'Stay on the ' + floorWord(a.floor) + ' and walk along the corridor to <b>' + esc(b.name) + '</b>.' });
        summary = 'Same building, same floor. No stairs needed.';
      } else {
        steps.push({ i: 'fa-stairs', t: stairsStep(a.building, a.floor, b.floor) });
        steps.push({ i: 'fa-person-walking', t: 'Walk along the corridor to <b>' + esc(b.name) + '</b>.' });
        var n = Math.abs(b.floor - a.floor);
        summary = 'Same building. Go ' + (b.floor > a.floor ? 'up ' : 'down ') + plural(n, 'floor') + '. You never need to go outside.';
      }
    } else {
      // ----- different buildings: down to ground, across the quadrangle, up again
      var total = 0;
      if (!buildings[a.building].outdoor) {
        if (a.floor > 1) {
          steps.push({ i: 'fa-stairs', t: stairsStep(a.building, a.floor, 1).replace('First floor', 'ground floor') });
          total += a.floor - 1;
        }
        steps.push({ i: 'fa-door-open', t: 'Exit <b>' + esc(a.buildingName) + '</b> and step out to the Campus Quadrangle.' });
      }
      var hint = buildings[b.building].outdoor ? '' : mapHint(a.building, b.building);
      steps.push({ i: 'fa-person-walking', t: 'Walk across the campus to <b>' + esc(b.buildingName) + '</b>.' + hint });
      if (!buildings[b.building].outdoor) {
        steps.push({ i: 'fa-door-open', t: 'Enter <b>' + esc(b.buildingName) + '</b> on the ground floor.' });
        if (b.floor > 1) {
          steps.push({ i: 'fa-stairs', t: stairsStep(b.building, 1, b.floor) });
          total += b.floor - 1;
        }
        steps.push({ i: 'fa-person-walking', t: 'Walk along the corridor to <b>' + esc(b.name) + '</b>.' });
      }
      summary = 'Different buildings. Use the ground floor to cross over' + (total ? ', ' + plural(total, 'flight') + ' of stairs in total.' : '.');
    }

    steps.push({ i: 'fa-flag-checkered', t: 'You have arrived at <b>' + esc(b.name) + '</b>.' });
    return { summary: summary, steps: steps };
  }

  function esc(s) {
    return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; });
  }
  function plain(html) { return html.replace(/<[^>]+>/g, '').replace(/&amp;/g, '&'); }

  /* ---- 7. The panel --------------------------------------------------------- */
  var panel, fromSel, toSel, stepsBox, summaryBox, readBtn, dirBtn;
  var lastQuery = '';
  var lastRoute = null;

  function roomOptions(selectedId) {
    var html = '<option value="">Choose a place…</option>';
    Object.keys(buildings).forEach(function (key) {
      var list = rooms.filter(function (r) { return r.building === key; });
      if (!list.length) return;
      html += '<optgroup label="' + esc(buildings[key].name) + '">';
      list.forEach(function (r) {
        html += '<option value="' + r.id + '"' + (r.id === selectedId ? ' selected' : '') + '>' +
          esc(r.name) + (buildings[key].outdoor ? '' : ' · ' + r.floor + 'F') + '</option>';
      });
      html += '</optgroup>';
    });
    return html;
  }

  function buildPanel() {
    var card = document.querySelector('.ai-card-wrapper');
    var resultBox = document.querySelector('.ai-result-box');
    // Change this line in directions.js:
    var voiceRow = document.getElementById('ai-controls-row') || (document.getElementById('read-aloud-btn') ? document.getElementById('read-aloud-btn').parentElement : null);
    if (!card || !resultBox) return false;
    // Directions button next to Pause / Mute
    dirBtn = document.createElement('button');
    dirBtn.type = 'button';
    dirBtn.id = 'directions-btn';
    dirBtn.className = 'send-btn';
    dirBtn.setAttribute('aria-expanded', 'false');
    dirBtn.innerHTML = '<i class="fa-solid fa-route"></i> Directions';
    if (voiceRow) {
      voiceRow.style.display = 'flex';
      voiceRow.style.justifyContent = 'flex-start';
      voiceRow.style.gap = '12px';
      voiceRow.style.flexWrap = 'wrap';
      voiceRow.insertBefore(dirBtn, voiceRow.firstChild);
    }

    panel = document.createElement('div');
    panel.id = 'route-panel';
    panel.className = 'route-panel';
    panel.hidden = true;
    panel.innerHTML =
      '<div class="route-head"><h3><i class="fa-solid fa-route"></i> Campus Directions</h3>' +
      '<button type="button" class="route-close" aria-label="Close directions"><i class="fa-solid fa-xmark"></i></button></div>' +
      '<div class="route-form">' +
      '<label>From<select id="route-from"></select></label>' +
      '<button type="button" class="route-swap" title="Swap start and destination" aria-label="Swap"><i class="fa-solid fa-right-left"></i></button>' +
      '<label>To<select id="route-to"></select></label>' +
      '</div>' +
      '<div class="route-actions"><button type="button" class="route-go"><i class="fa-solid fa-diamond-turn-right"></i> Show route</button>' +
      '<button type="button" class="route-read"><i class="fa-solid fa-volume-high"></i> Read aloud</button></div>' +
      '<p class="route-summary" id="route-summary" hidden></p>' +
      '<ol class="route-steps" id="route-steps"></ol>' +
      '<p class="route-note">Based on the campus office directory (buildings and floors). Follow the signs on each floor if something looks different.</p>';
    resultBox.parentNode.insertBefore(panel, resultBox.nextSibling);

    fromSel = panel.querySelector('#route-from');
    toSel = panel.querySelector('#route-to');
    stepsBox = panel.querySelector('#route-steps');
    summaryBox = panel.querySelector('#route-summary');
    readBtn = panel.querySelector('.route-read');
    fromSel.innerHTML = roomOptions();
    toSel.innerHTML = roomOptions();

    dirBtn.addEventListener('click', function () {
      if (panel.hidden) {
        openPanel();
        if (!toSel.value && lastQuery) {
          var guess = resolve(lastQuery.replace(/^(where|what|how).*?\b(is|are)\b/, ''));
          if (guess) toSel.value = String(guess.id);
        }
      } else {
        closePanel();
      }
    });
    panel.querySelector('.route-close').addEventListener('click', closePanel);
    panel.querySelector('.route-go').addEventListener('click', showRouteFromSelects);
    panel.querySelector('.route-swap').addEventListener('click', function () {
      var t = fromSel.value; fromSel.value = toSel.value; toSel.value = t;
      if (fromSel.value && toSel.value) showRouteFromSelects();
    });
    readBtn.addEventListener('click', readAloud);
    fromSel.addEventListener('change', function () { if (fromSel.value && toSel.value) showRouteFromSelects(); });
    toSel.addEventListener('change', function () { if (fromSel.value && toSel.value) showRouteFromSelects(); });

    var clear = document.getElementById('clear-btn');
    if (clear) clear.addEventListener('click', function () { reset(); });
    return true;
  }

  function openPanel() {
    panel.hidden = false;
    dirBtn.setAttribute('aria-expanded', 'true');
    dirBtn.classList.add('is-open');
  }
  function closePanel() {
    panel.hidden = true;
    dirBtn.setAttribute('aria-expanded', 'false');
    dirBtn.classList.remove('is-open');
  }
  function reset() {
    if (!panel) return;
    closePanel();
    fromSel.value = ''; toSel.value = '';
    stepsBox.innerHTML = ''; summaryBox.hidden = true;
    lastRoute = null; lastQuery = '';
    highlightPins(null, null);
  }

  function showRouteFromSelects() {
    var a = rooms[parseInt(fromSel.value, 10)];
    var b = rooms[parseInt(toSel.value, 10)];
    if (!a || !b) {
      stepsBox.innerHTML = '';
      summaryBox.hidden = false;
      summaryBox.textContent = 'Pick where you are and where you want to go.';
      return;
    }
    showRoute(a, b);
  }

  function showRoute(a, b) {
    openPanel();
    fromSel.value = String(a.id);
    toSel.value = String(b.id);
    var r = buildRoute(a, b);
    lastRoute = r;
    summaryBox.hidden = false;
    summaryBox.textContent = a.name + ' → ' + b.name + '. ' + r.summary;
    stepsBox.innerHTML = r.steps.map(function (s, i) {
      return '<li style="animation-delay:' + (i * 70) + 'ms"><span class="route-ico"><i class="fa-solid ' + s.i + '"></i></span><span>' + s.t + '</span></li>';
    }).join('');
    highlightPins(a.building, b.building);
    return r;
  }

  function highlightPins(fromKey, toKey) {
    document.querySelectorAll('.map-pin').forEach(function (p) {
      var t = (p.getAttribute('data-title') || '').toLowerCase();
      p.classList.remove('route-from', 'route-to');
      if (fromKey && t.indexOf(fromKey.toLowerCase()) !== -1) p.classList.add('route-from');
      if (toKey && t.indexOf(toKey.toLowerCase()) !== -1) p.classList.add('route-to');
    });
  }

  function isMuted() {
    var m = document.getElementById('mute-btn');
    return !!(m && /unmute/i.test(m.textContent));
  }

  function speak(text) {
    if (!('speechSynthesis' in window) || isMuted()) return;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(new SpeechSynthesisUtterance(text));
  }

  function readAloud() {
    if (!lastRoute) return;
    if (isMuted()) {
      readBtn.innerHTML = '<i class="fa-solid fa-volume-xmark"></i> Unmute to listen';
      setTimeout(function () { readBtn.innerHTML = '<i class="fa-solid fa-volume-high"></i> Read aloud'; }, 2200);
      return;
    }
    speak(lastRoute.steps.map(function (s) { return plain(s.t); }).join(' '));
  }

  /* ---- 8. Hook used by the AI box ------------------------------------------ */
  function say(text) {
    var out = document.getElementById('ai-response');
    if (out) out.textContent = text;
    var img = document.getElementById('ai-image');
    if (img) img.innerHTML = '';
  }

  // Returns true when it handled the question (so the old logic stops).
  function handle(rawQuery) {
    if (!panel) return false;
    lastQuery = rawQuery;
    var p = parseQuery(rawQuery);
    if (!p.looksLikeRoute) return false;

    var b = p.to ? resolve(p.to) : null;
    var a = p.from ? resolve(p.from) : null;

    if (p.to && !b) {
      say('I could not find "' + p.to + '" in the campus directory. Try another name, or pick it from the Directions list.');
      openPanel();
      return true;
    }
    if (p.from && !a) {
      say('I could not find "' + p.from + '" in the campus directory. Pick your starting point from the list.');
      openPanel();
      if (b) toSel.value = String(b.id);
      return true;
    }
    if (!b) return false; // not really a route question

    if (!a) {
      say('Sure! Where are you right now? Choose your starting point and I will show the route to ' + b.name + '.');
      speak('Where are you right now? Choose your starting point.');
      openPanel();
      toSel.value = String(b.id);
      fromSel.focus();
      return true;
    }

    var r = showRoute(a, b);
    say('🧭 ' + a.name + ' → ' + b.name + '. ' + r.summary + ' Steps are below.');
    speak(a.name.replace(/&/g, 'and') + ' to ' + b.name.replace(/&/g, 'and') + '. ' + r.summary);
    return true;
  }

  // For "where is the AVR?" style questions the old keyword list does not know.
  function locate(rawQuery) {
    if (!panel) return false;
    var r = resolve(rawQuery.replace(/^(where|what|which|show|find)\b.*?\b(is|are|me)\b/, ''));
    if (!r) return false;
    var where = buildings[r.building].outdoor ? r.buildingName : r.floorLabel + ', ' + r.buildingName;
    say('📍 ' + r.name + ': ' + where + '. Tap Directions to see how to get there.');
    speak(r.name.replace(/&/g, 'and') + ': ' + where + '.');
    toSel.value = String(r.id);
    return true;
  }

  /* ---- 9. Route button on every room in the directory ---------------------- */
  function addDirectoryButtons() {
    rooms.forEach(function (r) {
      if (!r.li) return;
      if (r.li.querySelector(':scope > ul')) return; // groups like "Heroes Hall"
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'dir-go';
      b.title = 'Get directions to ' + r.name;
      b.setAttribute('aria-label', 'Get directions to ' + r.name);
      b.innerHTML = '<i class="fa-solid fa-route"></i>';
      b.addEventListener('click', function (e) {
        e.stopPropagation();
        openPanel();
        toSel.value = String(r.id);
        if (fromSel.value) showRouteFromSelects();
        var ask = document.getElementById('ask');
        if (ask) ask.scrollIntoView({ behavior: 'smooth', block: 'start' });
        say('Directions to ' + r.name + '. Choose where you are starting from.');
        if (!fromSel.value) fromSel.focus({ preventScroll: true });
      });
      r.li.appendChild(b);
    });
  }

  /* ---- start ---------------------------------------------------------------- */
  document.addEventListener('DOMContentLoaded', function () {
    readDirectory();
    if (!rooms.length) return;
    if (!buildPanel()) return;
    addDirectoryButtons();
    window.PLMunRoute = { handle: handle, locate: locate, resolve: resolve, parse: parseQuery, route: buildRoute, rooms: rooms };
  });
})();
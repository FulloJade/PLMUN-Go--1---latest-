/* ==========================================================================
   PLMUN GO: INTERACTIVE FEATURES FOR EVERY PAGE

   One file, loaded after script.js on each page. It only ADDS behaviour to
   markup that already exists (it never rewrites your content), and every
   block checks that its page elements exist first, so it is safe everywhere.

   Everywhere ......... cards fade in as you scroll, back-to-top button,
                        click a photo to enlarge it (arrow keys + Esc work)
   About / Student /
   Campus Life ........ "On this page" chips that follow you and highlight
                        the section you are reading
   Programs ........... live search + filter by college
   News ............... live search + filter by category
   Admissions ......... tick off the application steps with a progress bar
   Organization ....... collapsible cards
   Student ............ "Find it on campus" links into the office directory
   Campus Life ........ "Show on map" links that open the pin on the home map
   Home ............... opens the directory / map pin when arriving from those links
   ========================================================================== */
(function () {
  'use strict';

  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var norm = function (s) { return (s || '').toLowerCase().replace(/\s+/g, ' ').trim(); };
  var store = {
    get: function (k) { try { return window.localStorage.getItem(k); } catch (e) { return null; } },
    set: function (k, v) { try { window.localStorage.setItem(k, v); } catch (e) { /* private mode */ } }
  };
  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------------------------------------------------------------- reveal */
  function initReveal() {
    var sel = '.support-card,.scholar-item,.timeline-item,.mv-card,.value-card,.org-card,.college-card,' +
      '.special-card,.news-item-card,.featured-news-card,.facility-text-card,.flow-step,.accordion-item,' +
      '.equal-item,.official-portal-banner,.tuition-callout,.values-banner,.governance-banner,' +
      '.campus-experience-banner,.info-card,.stat-box,.adm-intro,.prog-intro,.news-intro,.cl-intro';
    var els = $$(sel);
    if (!els.length || reduceMotion || !('IntersectionObserver' in window)) return;
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('reveal-in'); io.unobserve(en.target); }
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -30px 0px' });
    els.forEach(function (el, i) {
      el.classList.add('reveal');
      el.style.transitionDelay = ((i % 4) * 60) + 'ms';
      io.observe(el);
    });
  }

  /* ----------------------------------------------------------- back to top */
  function initBackToTop() {
    var b = document.createElement('button');
    b.type = 'button';
    b.className = 'to-top';
    b.setAttribute('aria-label', 'Back to top');
    b.innerHTML = '<i class="fa-solid fa-arrow-up"></i>';
    document.body.appendChild(b);
    var onScroll = function () { b.classList.toggle('show', window.scrollY > 500); };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    b.addEventListener('click', function () { window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' }); });
  }

  /* -------------------------------------------------------------- lightbox */
  function initLightbox() {
    var imgs = $$('.equal-item img, .auto-slide img, .single-slide img, .map-section img, .campus-map-img');
    if (!imgs.length) return;
    var box = document.createElement('div');
    box.className = 'lb';
    box.hidden = true;
    box.setAttribute('role', 'dialog');
    box.setAttribute('aria-label', 'Photo viewer');
    box.innerHTML =
      '<button type="button" class="lb-btn lb-close" aria-label="Close"><i class="fa-solid fa-xmark"></i></button>' +
      '<button type="button" class="lb-btn lb-prev" aria-label="Previous photo"><i class="fa-solid fa-chevron-left"></i></button>' +
      '<figure><img alt=""><figcaption></figcaption></figure>' +
      '<button type="button" class="lb-btn lb-next" aria-label="Next photo"><i class="fa-solid fa-chevron-right"></i></button>';
    document.body.appendChild(box);
    var big = $('img', box), cap = $('figcaption', box);
    var idx = 0;
    var group = imgs;

    function show(i) {
      idx = (i + group.length) % group.length;
      big.src = group[idx].currentSrc || group[idx].src;
      big.alt = group[idx].alt || '';
      cap.textContent = (group[idx].alt || '') + (group.length > 1 ? '  (' + (idx + 1) + ' / ' + group.length + ')' : '');
    }
    function open(i) {
      show(i);
      box.hidden = false;
      document.body.classList.add('lb-open');
      $('.lb-close', box).focus();
    }
    function close() {
      box.hidden = true;
      document.body.classList.remove('lb-open');
    }
    imgs.forEach(function (im, i) {
      im.classList.add('zoomable');
      im.setAttribute('tabindex', '0');
      im.addEventListener('click', function () { open(i); });
      im.addEventListener('keydown', function (e) { if (e.key === 'Enter') open(i); });
    });
    $('.lb-close', box).addEventListener('click', close);
    $('.lb-prev', box).addEventListener('click', function () { show(idx - 1); });
    $('.lb-next', box).addEventListener('click', function () { show(idx + 1); });
    box.addEventListener('click', function (e) { if (e.target === box) close(); });
    document.addEventListener('keydown', function (e) {
      if (box.hidden) return;
      if (e.key === 'Escape') close();
      if (e.key === 'ArrowLeft') show(idx - 1);
      if (e.key === 'ArrowRight') show(idx + 1);
    });
  }

  /* ------------------------------------------------- "On this page" chips */
  function initPageChips() {
    var config = null;
    if ($('.about-hero')) config = [['Our Journey', '.history-section'], ['Vision & Mission', '.mv-section'], ['Core Values', '.values-section']];
    else if ($('.student-hero')) config = [['Academic Support', '.student-section', 0], ['Scholarships', '.student-section', 1], ['Photos', '.student-section', 2], ['Campus Experience', '.campus-experience-banner']];
    else if ($('.facility-text-grid')) config = [['Facilities', '.cl-section', 0], ['Gallery', '.cl-section', 1], ['Student Governance', '.governance-banner']];
    if (!config) return;

    var targets = [];
    config.forEach(function (c) {
      var el = $$(c[1])[c[2] || 0];
      if (el) targets.push({ label: c[0], el: el });
    });
    if (targets.length < 2) return;

    var bar = document.createElement('nav');
    bar.className = 'page-chips';
    bar.setAttribute('aria-label', 'On this page');
    targets.forEach(function (t, i) {
      var a = document.createElement('button');
      a.type = 'button';
      a.textContent = t.label;
      a.addEventListener('click', function () {
        var y = t.el.getBoundingClientRect().top + window.scrollY - 140;
        window.scrollTo({ top: y, behavior: reduceMotion ? 'auto' : 'smooth' });
      });
      t.btn = a;
      bar.appendChild(a);
    });

    var main = $('main') || $('.wrapper');
    var first = $('main > *') || main.firstChild;
    main.insertBefore(bar, first);

    function spy() {
      var current = targets[0];
      targets.forEach(function (t) { if (t.el.getBoundingClientRect().top < 220) current = t; });
      // at the very bottom the last section may be too short to reach the top
      if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4) current = targets[targets.length - 1];
      targets.forEach(function (t) { t.btn.classList.toggle('is-active', t === current); });
    }
    window.addEventListener('scroll', spy, { passive: true });
    spy();
  }

  /* --------------------------------------------------- shared filter toolbar */
  function makeToolbar(placeholder, chipLabels, onChange) {
    var bar = document.createElement('div');
    bar.className = 'filter-bar';
    bar.innerHTML =
      '<div class="filter-search"><i class="fa-solid fa-magnifying-glass"></i>' +
      '<input type="search" placeholder="' + placeholder + '" aria-label="' + placeholder + '" autocomplete="off">' +
      '<button type="button" class="filter-clear" hidden aria-label="Clear search"><i class="fa-solid fa-xmark"></i></button></div>' +
      '<div class="filter-chips" role="group" aria-label="Filter"></div>' +
      '<p class="filter-count" aria-live="polite"></p>';
    var input = $('input', bar), clear = $('.filter-clear', bar), chipsBox = $('.filter-chips', bar), count = $('.filter-count', bar);
    var active = 'All';
    ['All'].concat(chipLabels).forEach(function (label) {
      var c = document.createElement('button');
      c.type = 'button';
      c.className = 'chip' + (label === 'All' ? ' is-active' : '');
      c.textContent = label;
      c.addEventListener('click', function () {
        active = label;
        $$('.chip', chipsBox).forEach(function (x) { x.classList.toggle('is-active', x === c); });
        fire();
      });
      chipsBox.appendChild(c);
    });
    function fire() {
      clear.hidden = input.value === '';
      onChange(norm(input.value), active, count);
    }
    input.addEventListener('input', fire);
    clear.addEventListener('click', function () { input.value = ''; fire(); input.focus(); });
    input.addEventListener('keydown', function (e) { if (e.key === 'Escape') { input.value = ''; fire(); } });
    return { el: bar, fire: fire };
  }

  /* --------------------------------------------------------------- Programs */
  function initPrograms() {
    var grid = $('.college-grid');
    if (!grid) return;
    var items = [];
    $$('.college-card').forEach(function (c) {
      var h = ($('h4', c) || {}).textContent || '';
      var m = h.match(/\(([A-Za-z]+)\)/);
      items.push({ el: c, tag: m ? m[1] : h.trim() });
    });
    $$('.special-card').forEach(function (c) {
      items.push({ el: c, tag: c.classList.contains('grad-card') ? 'Graduate' : 'Special' });
    });
    var tags = [];
    items.forEach(function (i) { if (tags.indexOf(i.tag) === -1) tags.push(i.tag); });

    var tb = makeToolbar('Search a program (e.g. nursing, IT, education)', tags, function (q, active, count) {
      var shown = 0;
      items.forEach(function (i) {
        var ok = (active === 'All' || i.tag === active) && (!q || norm(i.el.textContent).indexOf(q) !== -1);
        i.el.classList.toggle('filter-hidden', !ok);
        if (ok) shown++;
      });
      var row = $('.split-programs-row');
      if (row) row.classList.toggle('filter-hidden', !items.some(function (i) { return !i.el.classList.contains('filter-hidden') && row.contains(i.el); }));
      var section = grid.closest('.prog-section');
      if (section) section.classList.toggle('filter-hidden', !items.some(function (i) { return !i.el.classList.contains('filter-hidden') && grid.contains(i.el); }));
      count.textContent = shown ? shown + (shown === 1 ? ' result' : ' results') : 'No programs match. Try a different word.';
      count.classList.toggle('is-empty', !shown);
    });
    var intro = $('.prog-intro');
    intro.parentNode.insertBefore(tb.el, intro.nextSibling);
    tb.fire();
  }

  /* ------------------------------------------------------------------- News */
  function initNews() {
    var cards = $$('.featured-news-card, .news-item-card');
    if (!cards.length) return;
    var cats = [];
    cards.forEach(function (c) {
      var p = $('.category-pill', c);
      c._cat = p ? p.textContent.replace(/\s+/g, ' ').trim() : '';
      if (c._cat && cats.indexOf(c._cat) === -1) cats.push(c._cat);
    });
    var tb = makeToolbar('Search news (e.g. research, award, 2024)', cats, function (q, active, count) {
      var shown = 0;
      cards.forEach(function (c) {
        var ok = (active === 'All' || c._cat === active) && (!q || norm(c.textContent).indexOf(q) !== -1);
        c.classList.toggle('filter-hidden', !ok);
        if (ok) shown++;
      });
      count.textContent = shown ? shown + (shown === 1 ? ' story' : ' stories') : 'No stories match. Try a different word.';
      count.classList.toggle('is-empty', !shown);
    });
    var intro = $('.news-intro');
    intro.parentNode.insertBefore(tb.el, intro.nextSibling);
    tb.fire();
  }

  /* -------------------------------------------------------------- Admissions */
  function initAdmissions() {
    var steps = $$('.flow-step');
    var chart = $('.process-flowchart');
    if (!steps.length || !chart) return;
    var KEY = 'plmun-adm-steps';
    var done = {};
    try { done = JSON.parse(store.get(KEY) || '{}') || {}; } catch (e) { done = {}; }

    var bar = document.createElement('div');
    bar.className = 'progress-card';
    bar.innerHTML =
      '<div class="progress-top"><strong id="adm-progress-text"></strong>' +
      '<button type="button" class="progress-reset">Reset</button></div>' +
      '<div class="progress-track" role="progressbar" aria-valuemin="0" aria-valuemax="' + steps.length + '"><span></span></div>' +
      '<p>Tap a step when you finish it. Your progress is saved on this device.</p>';
    chart.parentNode.insertBefore(bar, chart);
    var fill = $('.progress-track span', bar), text = $('#adm-progress-text', bar), track = $('.progress-track', bar);

    function paint() {
      var n = 0;
      steps.forEach(function (s, i) {
        var on = !!done[i];
        s.classList.toggle('is-done', on);
        s.setAttribute('aria-pressed', String(on));
        var num = $('.step-number', s);
        if (num) num.innerHTML = on ? '<i class="fa-solid fa-check"></i>' : String(i + 1);
        if (on) n++;
      });
      fill.style.width = (n / steps.length * 100) + '%';
      track.setAttribute('aria-valuenow', String(n));
      text.textContent = n === steps.length ? 'All steps done. You are ready to enroll!' : n + ' of ' + steps.length + ' steps done';
      store.set(KEY, JSON.stringify(done));
    }
    steps.forEach(function (s, i) {
      s.classList.add('is-clickable');
      s.setAttribute('role', 'button');
      s.setAttribute('tabindex', '0');
      function toggle() { done[i] = !done[i]; paint(); }
      s.addEventListener('click', toggle);
      s.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(); } });
    });
    $('.progress-reset', bar).addEventListener('click', function () { done = {}; paint(); });
    paint();
  }

  /* ----------------------------------------------------------- Organization */
  function initOrganization() {
    var cards = $$('.org-card');
    if (!cards.length) return;
    cards.forEach(function (c) {
      var h = $('h2', c);
      if (!h) return;
      h.classList.add('org-toggle');
      h.setAttribute('role', 'button');
      h.setAttribute('tabindex', '0');
      h.setAttribute('aria-expanded', 'true');
      function toggle() {
        var collapsed = c.classList.toggle('is-collapsed');
        h.setAttribute('aria-expanded', String(!collapsed));
      }
      h.addEventListener('click', toggle);
      h.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(); } });
    });
    var lis = $$('.styled-org-list li');
    lis.forEach(function (li) {
      li.classList.add('is-pickable');
      li.addEventListener('click', function () {
        var on = li.classList.contains('is-picked');
        lis.forEach(function (x) { x.classList.remove('is-picked'); });
        if (!on) li.classList.add('is-picked');
      });
    });
  }

  /* ------------------------------------------- cross-page links (Student etc.) */
  function addLink(card, href, label, icon) {
    var a = document.createElement('a');
    a.className = 'card-link';
    a.href = href;
    a.innerHTML = label + ' <i class="fa-solid ' + icon + '"></i>';
    card.appendChild(a);
  }

  function initStudentLinks() {
    var map = { 'guidance': 'Guidance', 'internship': 'Internship', 'library': 'Library' };
    $$('.support-card').forEach(function (c) {
      var t = norm(($('h3', c) || {}).textContent);
      Object.keys(map).forEach(function (k) {
        if (t.indexOf(k) === 0) addLink(c, 'index.html?search=' + encodeURIComponent(map[k]) + '#directory', 'Find it on campus', 'fa-location-arrow');
      });
    });
    $$('.scholar-item .scholar-details').forEach(function (d) {
      addLink(d, 'admissions.html', 'How to apply', 'fa-arrow-right');
    });
  }

  function initCampusLifeLinks() {
    $$('.facility-text-card').forEach(function (c) {
      var name = norm(($('h4', c) || {}).textContent);
      var pinKey = ['bonifacio', 'del pilar', 'mabini', 'rizal'].filter(function (k) { return name.indexOf(k) === 0; })[0];
      if (pinKey) addLink(c, 'index.html?pin=' + encodeURIComponent(pinKey) + '#campus-map', 'Show on map', 'fa-map-pin');
    });
  }

  /* -------------------------------------------- arriving on the home page */
  function initHomeArrivals() {
    var params = new URLSearchParams(window.location.search);
    var search = params.get('search');
    var pin = params.get('pin');

    if (search) {
      var input = $('#directory-search');
      if (input) {
        input.value = search;
        input.dispatchEvent(new Event('input', { bubbles: true }));
        var sec = $('.office-directory-section');
        if (sec) setTimeout(function () { sec.scrollIntoView({ behavior: 'smooth', block: 'start' }); }, 250);
      }
    }
    if (pin) {
      var target = $$('.map-pin').filter(function (p) {
        return norm(p.getAttribute('data-title')).indexOf(norm(pin)) !== -1;
      })[0];
      if (target) {
        var sec2 = $('#campus-map');
        if (sec2) setTimeout(function () { sec2.scrollIntoView({ behavior: 'smooth', block: 'start' }); }, 250);
        setTimeout(function () {
          target.classList.add('pin-flash');
          target.dispatchEvent(new Event('mouseenter'));
        }, 900);
        setTimeout(function () { target.classList.remove('pin-flash'); }, 6000);
      }
    }
  }

  /* ----------------------------------------------------------------- start */
  document.addEventListener('DOMContentLoaded', function () {
    var parts = [initReveal, initBackToTop, initLightbox, initPageChips, initPrograms, initNews,
      initAdmissions, initOrganization, initStudentLinks, initCampusLifeLinks, initHomeArrivals];
    parts.forEach(function (fn) {
      try { fn(); } catch (e) { if (window.console) console.warn('interactive.js:', fn.name, e); }
    });
  });
})();
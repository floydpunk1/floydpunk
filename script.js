/* phoenix. — behaviour: water flow, routing, guestbook */
(function () {
  'use strict';

/* =========================================================
     1. the water: blobs that drift on their own and flow
        toward the cursor with heavy easing, so they feel
        like light moving through liquid, not objects
        chasing the pointer.
     ========================================================= */

var blobs = [
    { el: document.getElementById('blob-1'), x: 0,  y: 0,   speed: 0.030, spread: 1.4, drift: 0.00014, phase: 0.0 },
    { el: document.getElementById('blob-2'), x: 0,  y: 0,   speed: 0.018, spread: 2.0, drift: 0.00010, phase: 2.1 },
    { el: document.getElementById('blob-3'), x: 0,  y: 0,   speed: 0.045, spread: 1.0, drift: 0.00020, phase: 4.2 }
  ];

var mouse = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

window.addEventListener('pointermove', function (e) {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
  }, { passive: true });

function flow(now) {
    if (!reduced) {
      // convert cursor to a -1..1 space relative to viewport centre
      var cx = mouse.x / window.innerWidth - 0.5;
      var cy = mouse.y / window.innerHeight - 0.5;

blobs.forEach(function (b) {
        // where this blob "wants" to be: cursor pulled outward
        // by its own spread, plus a slow circular idle drift
        var targetX = cx * b.spread
                    + Math.cos(now * b.drift + b.phase) * 0.22;
        var targetY = cy * b.spread
                    + Math.sin(now * b.drift * 1.3 + b.phase) * 0.22;

// ease toward the target — the "water" lag
        b.x += (targetX - b.x) * b.speed;
        b.y += (targetY - b.y) * b.speed;

var tx = (b.x * 100 + 50);   // to percentage of viewport
        var ty = (b.y * 100 + 50);

b.el.style.transform =
          'translate(' + (tx - 23) + 'vmax, ' + (ty - 23) + 'vmax)';
      });
    }
    requestAnimationFrame(flow);
  }

// place blobs sensibly before the first frame
  blobs.forEach(function (b) {
    b.x = (Math.random() - 0.5) * 0.6;
    b.y = (Math.random() - 0.5) * 0.6;
  });

requestAnimationFrame(flow);

/* =========================================================
     2. hash-based section navigation
     ========================================================= */

var sections = document.querySelectorAll('.panel');
  var navLinks = document.querySelectorAll('.glass-nav a');

function showSection(id) {
    var found = false;
    sections.forEach(function (s) {
      var match = s.id === id;
      s.classList.toggle('active', match);
      if (match) found = true;
    });
    if (!found) { showSection('home'); return; }
    navLinks.forEach(function (a) {
      a.classList.toggle('active', a.getAttribute('href') === '#' + id);
    });
  }

function route() {
    showSection((location.hash || '#home').slice(1));
  }

window.addEventListener('hashchange', route);
  route();

/* =========================================================
     3. clock, visit counter, last-updated
     ========================================================= */

var clock = document.getElementById('clock');
  var DAYS = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
  var MONTHS = ['Jan','Feb','Mar','Apr','May','Jun',
                'Jul','Aug','Sep','Oct','Nov','Dec'];

function pad(n) { return n < 10 ? '0' + n : '' + n; }

function tick() {
    var d = new Date();
    clock.textContent = DAYS[d.getDay()] + ' ' + pad(d.getDate()) + ' '
      + MONTHS[d.getMonth()] + ' · ' + pad(d.getHours()) + ':'
      + pad(d.getMinutes()) + ':' + pad(d.getSeconds());
  }
  tick();
  setInterval(tick, 1000);

var counter = document.getElementById('counter');
  var visits = parseInt(localStorage.getItem('ph_visits') || '0', 10) + 1;
  localStorage.setItem('ph_visits', visits);
  counter.textContent = ('000000' + visits).slice(-6);

var modified = document.getElementById('last-modified');
  if (document.lastModified) {
    modified.textContent = new Date(document.lastModified).toDateString();
  }

/* =========================================================
     4. guestbook (localStorage only)
     ========================================================= */

var form = document.getElementById('guestbook-form');
  var list = document.getElementById('guestbook-entries');
  var emptyNote = document.getElementById('guestbook-empty');

function escapeText(t) {
    var el = document.createElement('div');
    el.textContent = t;
    return el.innerHTML;
  }

function loadEntries() {
    try { return JSON.parse(localStorage.getItem('ph_guestbook') || '[]'); }
    catch (e) { return []; }
  }

function render() {
    var entries = loadEntries();
    list.innerHTML = '';
    emptyNote.style.display = entries.length ? 'none' : 'block';
    entries.slice().reverse().forEach(function (e) {
      var li = document.createElement('li');
      li.innerHTML = '<span class="who">' + escapeText(e.name) + '</span>'
        + '<span class="when">' + escapeText(e.when) + '</span><br>'
        + escapeText(e.message);
      list.appendChild(li);
    });
  }

form.addEventListener('submit', function (ev) {
    ev.preventDefault();
    var name = document.getElementById('gb-name').value.trim();
    var message = document.getElementById('gb-message').value.trim();
    if (!name || !message) return;

var entries = loadEntries();
    entries.push({
      name: name,
      message: message,
      when: new Date().toLocaleDateString()
    });
    localStorage.setItem('ph_guestbook', JSON.stringify(entries));
    form.reset();
    render();
  });

render();
})();

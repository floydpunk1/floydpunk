/* Homepage — water glows, albums, routing, optional custom cursor */
(function () {
  'use strict';

/* =========================================================
     1. water — two glows easing toward the cursor.
        transform-only animation = cheap on weak machines.
     ========================================================= */

var glowA = document.getElementById('glow-a');
  var glowB = document.getElementById('glow-b');
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

var mx = window.innerWidth / 2, my = window.innerHeight / 2;
  var ax = 0, ay = 0, bx = 0, by = 0;   // current glow positions

window.addEventListener('pointermove', function (e) {
    mx = e.clientX; my = e.clientY;
  }, { passive: true });

function flow() {
    if (!reduced) {
      // each glow lags differently, like two currents
      ax += (mx - ax) * 0.035;
      ay += (my - ay) * 0.035;
      bx += (mx - bx) * 0.015;
      by += (my - by) * 0.015;

glowA.style.transform = 'translate(' + (ax - 15) + 'px,' + (ay - 15) + 'px)';
      glowB.style.transform = 'translate(' + (bx * 0.6 - 30) + 'px,' + (by * 0.6 - 30) + 'px)';
    }
    requestAnimationFrame(flow);
  }
  requestAnimationFrame(flow);

/* =========================================================
     2. albums — edit ONLY this list to manage your gallery.
        cover: image path (or "" for an automatic placeholder)
        href:  where the album opens (page or external host)
        Everything renders itself; no HTML editing needed.
     ========================================================= */

var ALBUMS = [
    { slug: 'ocs',      title: 'Original Characters', note: '12 drawings', cover: '', href: 'albums/ocs.html' },
    { slug: 'sketches', title: 'Sketchbook',           note: 'wips',       cover: '', href: 'albums/sketches.html' },
    { slug: 'fanart',   title: 'Fan Art',              note: '6 drawings',  cover: '', href: 'albums/fanart.html' }
    // add more albums by copying a line — the grid reflows itself
  ];

var grid = document.getElementById('albums');

ALBUMS.forEach(function (a) {
    var card = document.createElement('a');
    card.className = 'album';
    card.href = a.href;
    card.target = '_blank';               // opens in a new tab
    card.rel = 'noopener noreferrer';

var cover = document.createElement('div');
    cover.className = 'cover';

if (a.cover) {
      var img = document.createElement('img');
      img.src = a.cover;
      img.alt = a.title;
      img.loading = 'lazy';
      img.onerror = function () {
        cover.innerHTML = '<span>' + a.title.charAt(0) + '</span>';
      };
      cover.appendChild(img);
    } else {
      cover.innerHTML = '<span>' + a.title.charAt(0) + '</span>';
    }

var meta = document.createElement('div');
    meta.className = 'meta';
    meta.innerHTML = '<b>' + a.title + '</b><small>' + a.note + '</small>';

card.appendChild(cover);
    card.appendChild(meta);
    grid.appendChild(card);
  });

/* =========================================================
     3. every external link on the page opens in a new tab
        (covers links you add to the HTML later, too)
     ========================================================= */

document.querySelectorAll('main a[href^="http"]').forEach(function (a) {
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
  });

/* =========================================================
     4. hash routing
     ========================================================= */

var sections = document.querySelectorAll('.panel');
  var navLinks = document.querySelectorAll('.nav a');

function route() {
    var id = (location.hash || '#home').slice(1);
    var found = false;
    sections.forEach(function (s) {
      var match = s.id === id;
      s.classList.toggle('active', match);
      if (match) found = true;
    });
    if (!found) { route.call(null, location.hash = '#home'); return; }
    navLinks.forEach(function (a) {
      a.classList.toggle('active', a.getAttribute('href') === '#' + id);
    });
  }

window.addEventListener('hashchange', route);
  route();

/* =========================================================
     5. optional custom cursor — flip USE_CUSTOM_CURSOR to
        true to enable. A soft ring follows the pointer and
        your normal cursor hides. Ignored on touch devices.
     ========================================================= */

var USE_CUSTOM_CURSOR = false;

if (USE_CUSTOM_CURSOR && window.matchMedia('(pointer: fine)').matches) {
    document.body.classList.add('custom-cursor');

var ring = document.createElement('div');
    ring.id = 'cursor';
    document.body.appendChild(ring);

var cx = 0, cy = 0;
    window.addEventListener('pointermove', function (e) {
      cx = e.clientX; cy = e.clientY;
    }, { passive: true });

(function follow() {
      var rx = parseFloat(ring.style.transform.match(/-?[\d.]+/g) || [0])[0] || 0;
      // ease toward pointer
      rx += (cx - rx) * 0.2;
      var ry = (parseFloat(ring.dataset.ry || '0')) + (cy - parseFloat(ring.dataset.ry || '0')) * 0.2;
      ring.dataset.ry = ry;
      ring.style.transform = 'translate(' + rx + 'px,' + ry + 'px)';
      requestAnimationFrame(follow);
    })();
  }
})();

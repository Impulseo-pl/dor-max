// Dor-Max - menu, wejścia sekcji, pływający nagłówek, przełącznik prac, licznik dema
(function () {
  // mobilne menu
  var toggle = document.querySelector('.nav-toggle');
  var links = document.querySelector('.fhead .nav-links');
  if (toggle && links) {
    toggle.setAttribute('aria-expanded', 'false');
    toggle.addEventListener('click', function () {
      var open = links.classList.toggle('open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    links.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () { links.classList.remove('open'); toggle.setAttribute('aria-expanded', 'false'); });
    });
  }

  // wejścia sekcji
  var els = document.querySelectorAll('.reveal');
  if (!('IntersectionObserver' in window) || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    els.forEach(function (el) { el.classList.add('in'); });
  } else {
    var io = new IntersectionObserver(function (wpisy) {
      wpisy.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    els.forEach(function (el) {
      var r = el.getBoundingClientRect();
      if (r.top < window.innerHeight * 0.95 && r.bottom > 0) el.classList.add('in');
      else io.observe(el);
    });
    // bezpiecznik: nic nie może zostać niewidoczne
    setTimeout(function () { els.forEach(function (el) { var r = el.getBoundingClientRect(); if (r.top < window.innerHeight && r.bottom > 0) el.classList.add('in'); }); }, 1800);
  }

  // pływający nagłówek na stronie głównej: wjeżdża po zejściu z pierwszego ekranu
  var head = document.querySelector('.is-home .fhead');
  var hero = document.querySelector('.hero');
  if (head && hero) {
    var tick = false;
    var upd = function () { head.classList.toggle('show', window.scrollY > hero.offsetHeight * 0.6); tick = false; };
    window.addEventListener('scroll', function () { if (!tick) { tick = true; requestAnimationFrame(upd); } }, { passive: true });
    upd();
  }

  // przełącznik prac w ciemnej sekcji
  var tabs = document.querySelectorAll('.job-tab');
  if (tabs.length) {
    var img = document.querySelector('.job-view img');
    var chip = document.querySelector('.job-view .chip');
    var cap = document.querySelector('.job-cap .c-t');
    var cnt = document.querySelector('.job-cap .c-n');
    var card = document.querySelector('.job-card');
    if (img && !tabs[0].dataset.src) tabs[0].dataset.src = img.getAttribute('src');
    tabs.forEach(function (t, i) {
      t.addEventListener('click', function () {
        tabs.forEach(function (x) { x.classList.remove('on'); x.setAttribute('aria-pressed', 'false'); });
        t.classList.add('on'); t.setAttribute('aria-pressed', 'true');
        var d = t.dataset;
        img.classList.add('fade');
        var nowy = new Image();
        nowy.onload = function () { img.src = d.src; img.alt = d.alt; img.classList.remove('fade'); };
        nowy.src = d.src;
        chip.textContent = 'Praca /0' + (i + 1);
        cap.textContent = d.cap;
        cnt.textContent = '0' + (i + 1) + ' / 0' + tabs.length;
        card.querySelector('.ttl').textContent = 'Praca /0' + (i + 1) + ' · ' + d.name;
        ['teren', 'sprzet', 'zakres', 'porzadek'].forEach(function (k) {
          var el = card.querySelector('[data-k="' + k + '"]');
          if (el) el.textContent = d[k];
        });
      });
    });
  }
})();

// okno na nieruchome zdjęcie: tło włączamy dopiero, gdy sekcja jest blisko ekranu
(function () {
  var s = document.querySelectorAll('.stopklatka');
  if (!s.length) return;
  if (!('IntersectionObserver' in window)) { s.forEach(function (el) { el.classList.add('on'); }); return; }
  var io = new IntersectionObserver(function (w) { w.forEach(function (e) { e.target.classList.toggle('on', e.isIntersecting); }); }, { rootMargin: '200px 0px' });
  s.forEach(function (el) { io.observe(el); });
})();

// LICZNIK WAŻNOŚCI DEMA (K. 09.08): wjeżdża po zejściu z pierwszego ekranu
(function () {
  var el = document.querySelector('.demo-wazne');
  if (!el || !el.getAttribute('data-do')) return;
  var koniec = new Date(el.getAttribute('data-do') + 'T23:59:59');
  if (isNaN(koniec)) return;
  var txt = el.querySelector('.dw-txt') || el;
  var dwa = function (n) { return (n < 10 ? '0' : '') + n; };
  var cykl = parseInt(el.getAttribute('data-cykl') || '0', 10);
  function tyka() {
    var teraz = new Date(), ms = koniec - teraz;
    while (ms <= 0 && cykl > 0) { koniec = new Date(koniec.getTime() + cykl * 86400000); ms = koniec - teraz; }
    if (ms <= 0) { txt.innerHTML = 'Wersja pokazowa wygasła'; el.classList.add('is-koniec'); return false; }
    var s = Math.floor(ms / 1000), d = Math.floor(s / 86400);
    var g = Math.floor((s % 86400) / 3600), m = Math.floor((s % 3600) / 60), sek = s % 60;
    var zegar = dwa(g) + ':' + dwa(m) + ':' + dwa(sek);
    txt.innerHTML = d > 0
      ? 'Wersja pokazowa · <b>' + d + ' dni</b> <span class="dw-zeg">' + zegar + '</span>'
      : 'Wersja pokazowa · <b class="dw-pilne">' + zegar + '</b>';
    el.classList.toggle('is-pilne', d === 0);
    return true;
  }
  if (tyka() !== false) setInterval(tyka, 1000);
  el.hidden = false;
  var tick = false;
  function stan() { el.classList.toggle('is-on', (window.scrollY || 0) > window.innerHeight * 0.55); tick = false; }
  window.addEventListener('scroll', function () { if (tick) return; tick = true; requestAnimationFrame(stan); }, { passive: true });
  stan();
})();

// DOLNY PASEK NA KOMÓRCE: chowa się przy stopce i sekcji z przyciskami (lekcja 13.08.2026)
(function () {
  try {
    var pasek = document.querySelector('.sticky-call');
    if (!pasek || !('IntersectionObserver' in window)) return;
    var cele = document.querySelectorAll('footer, .cta');
    var widoczne = 0;
    var io = new IntersectionObserver(function (wpisy) {
      wpisy.forEach(function (w) { widoczne += w.isIntersecting ? 1 : -1; });
      if (widoczne < 0) widoczne = 0;
      pasek.classList.toggle('schowany', widoczne > 0);
    }, { threshold: 0.01 });
    cele.forEach(function (el) { io.observe(el); });
  } catch (e) {}
})();

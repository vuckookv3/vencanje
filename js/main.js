/* =================================================================
   Jelena, Marko i Sofija — 08.11.2026.
   Vanilla JS, bez zavisnosti. Podaci se čitaju iz js/config.js.
   ================================================================= */
(function () {
  'use strict';

  var C = window.CONFIG || {};
  var $  = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var START = new Date(C.startsAt);
  var END   = new Date(C.endsAt);

  /* ---------------------------------------------------------------
     1. Pomoćne funkcije
     --------------------------------------------------------------- */
  function telHref(num) { return 'tel:' + String(num).replace(/[^\d+]/g, ''); }
  /* Namerno bez ?body= — prefil teksta se razlikuje na iOS-u i Androidu,
     a pogrešan format ume da pokvari primaoca. Ovako se svuda otvara
     nova poruka sa upisanim brojem.                                    */
  function smsHref(num) { return 'sms:' + String(num).replace(/[^\d+]/g, ''); }
  function digits(num)  { return String(num).replace(/\D/g, ''); }

  function srDate(iso) {                       // 2026-10-20 -> 20.10.2026.
    var p = String(iso).slice(0, 10).split('-');
    return p[2].replace(/^0/, '') + '.' + p[1].replace(/^0/, '') + '.' + p[0] + '.';
  }

  /* Prisvojno: Sofija -> Sofijin, Marko -> Markov. */
  function possessive(name) {
    var last = name.slice(-1).toLowerCase();
    if (last === 'a') return name.slice(0, -1) + 'in';
    if (last === 'o' || last === 'e') return name.slice(0, -1) + 'ov';
    return name + 'ov';
  }

  function cityShort() {
    return String(C.venue.city || '').replace(/^\d+\s*/, '');
  }

  /* ---------------------------------------------------------------
     2. Ubacivanje podataka iz config.js u HTML
     --------------------------------------------------------------- */
  function fillConfig() {
    var v = C.venue || {};
    var values = {
      'venue-name':    v.name,
      'venue-address': v.address,
      'venue-city':    v.city,
      'venue-short':   v.name + ', ' + cityShort(),
      'deadline':      srDate(C.rsvpDeadline)
    };

    $$('[data-cfg]').forEach(function (el) {
      var val = values[el.getAttribute('data-cfg')];
      if (val) el.textContent = val;
    });

    var q = encodeURIComponent(v.mapQuery || (v.name + ' ' + v.address + ' ' + v.city));
    var links = {
      'map-google': 'https://www.google.com/maps/search/?api=1&query=' + q
    };
    $$('[data-cfg-href]').forEach(function (el) {
      var href = links[el.getAttribute('data-cfg-href')];
      if (href) el.setAttribute('href', href);
    });

    // kontakti u tekstu FAQ-a
    var inline = $('[data-cfg="contacts-inline"]');
    if (inline && C.contacts) {
      inline.innerHTML = C.contacts.map(function (c) {
        return '<a href="' + telHref(c.phone) + '">' + c.name + '</a>';
      }).join(' i ');
    }
  }

  /* ---------------------------------------------------------------
     3. Navigacija
     --------------------------------------------------------------- */
  function initNav() {
    var nav = $('#nav'), toggle = $('#navToggle'), menu = $('#navMenu');
    if (!nav) return;
    var lastY = window.scrollY, open = false;

    function setOpen(state) {
      open = state;
      nav.classList.toggle('is-open', state);
      document.body.classList.toggle('is-locked', state);
      toggle.setAttribute('aria-expanded', state ? 'true' : 'false');
      toggle.querySelector('.nav__toggle-text').textContent = state ? 'Zatvori' : 'Meni';
      if (state) nav.classList.remove('is-hidden');
    }

    toggle.addEventListener('click', function () { setOpen(!open); });

    menu.addEventListener('click', function (e) {
      if (e.target.closest('a')) setOpen(false);
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && open) { setOpen(false); toggle.focus(); }
    });

    window.addEventListener('resize', function () {
      if (open && window.innerWidth >= 1024) setOpen(false);
    });

    var pending = false;
    window.addEventListener('scroll', function () {
      if (pending) return;
      pending = true;
      requestAnimationFrame(function () {
        var y = window.scrollY;
        nav.classList.toggle('is-solid', y > 40);
        if (!open) nav.classList.toggle('is-hidden', y > lastY && y > 400);
        lastY = y;
        pending = false;
      });
    }, { passive: true });
  }

  /* ---------------------------------------------------------------
     4. Hero: slova imena + ispisivanje monograma
     --------------------------------------------------------------- */
  function initHero() {
    var hero = $('#hero'), title = $('[data-split]'), mono = $('.monogram');
    if (!hero) return;

    if (title) {
      var i = 0;
      title.innerHTML = title.textContent.trim().split(/\s+/).map(function (word) {
        var chars = word.split('').map(function (ch) {
          return '<span class="ch" style="--i:' + (i++) + '">' + ch + '</span>';
        }).join('');
        return '<span class="word">' + chars + '</span>';
      }).join(' ');
    }

    function play() {
      hero.classList.add('is-ready');
      if (mono) mono.classList.add('is-drawn');
    }

    if (reduced) { play(); return; }
    var done = false;
    var go = function () { if (!done) { done = true; requestAnimationFrame(play); } };
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(go);
    setTimeout(go, 1200);                       // sigurnosna mreža
  }

  /* ---------------------------------------------------------------
     5. Otkrivanje sekcija pri skrolovanju
     --------------------------------------------------------------- */
  function initReveal() {
    var items = $$('[data-reveal]');
    if (reduced || !('IntersectionObserver' in window)) {
      items.forEach(function (el) { el.classList.add('is-in'); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        e.target.classList.add('is-in');
        io.unobserve(e.target);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.12 });

    items.forEach(function (el) {
      var d = el.getAttribute('data-reveal-delay');
      if (d) el.style.setProperty('--d', d);
      io.observe(el);
    });
  }

  /* ---------------------------------------------------------------
     6. Paralaks na foto-trakama
     --------------------------------------------------------------- */
  function initParallax() {
    var bands = $$('[data-parallax]');
    if (reduced || !bands.length) return;

    var pending = false;
    function update() {
      var vh = window.innerHeight;
      var factor = window.innerWidth < 768 ? 0.06 : 0.10;
      bands.forEach(function (band) {
        var r = band.getBoundingClientRect();
        if (r.bottom < -80 || r.top > vh + 80) return;
        var media = band.querySelector('.band__media');
        if (!media) return;
        var progress = (r.top + r.height / 2 - vh / 2) / vh;   // ~ -1 .. 1
        var shift = -progress * factor * r.height;
        media.style.transform = 'translate3d(0,' + shift.toFixed(1) + 'px,0)';
      });
      pending = false;
    }
    function onScroll() {
      if (pending) return;
      pending = true;
      requestAnimationFrame(update);
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    update();
  }

  /* ---------------------------------------------------------------
     7. Odbrojavanje
     --------------------------------------------------------------- */
  function initCountdown() {
    var grid = $('#countdown'), done = $('#countdownDone');
    if (!grid) return;
    var cells = {
      days:    $('[data-cd="days"]', grid),
      hours:   $('[data-cd="hours"]', grid),
      minutes: $('[data-cd="minutes"]', grid),
      seconds: $('[data-cd="seconds"]', grid)
    };
    var timer = null;

    function setNum(el, value) {
      if (!el || el.textContent === value) return;
      if (reduced) { el.textContent = value; return; }
      el.classList.add('is-tick');
      setTimeout(function () {
        el.textContent = value;
        el.classList.remove('is-tick');
      }, 220);
    }

    function pad(n) { return n < 10 ? '0' + n : String(n); }

    function tick() {
      var diff = START.getTime() - Date.now();
      if (diff <= 0) {
        stop();
        grid.hidden = true;
        if (done) done.hidden = false;
        return;
      }
      var s = Math.floor(diff / 1000);
      setNum(cells.days,    String(Math.floor(s / 86400)));
      setNum(cells.hours,   pad(Math.floor(s % 86400 / 3600)));
      setNum(cells.minutes, pad(Math.floor(s % 3600 / 60)));
      setNum(cells.seconds, pad(s % 60));
    }

    function start() { if (!timer) { tick(); timer = setInterval(tick, 1000); } }
    function stop()  { if (timer) { clearInterval(timer); timer = null; } }

    document.addEventListener('visibilitychange', function () {
      document.hidden ? stop() : start();
    });
    start();
  }

  /* ---------------------------------------------------------------
     8. Dodaj u kalendar (.ics + Google)
     --------------------------------------------------------------- */
  function initCalendar() {
    var v = C.venue || {};
    var title = C.couple.bride + ', ' + C.couple.groom + ' i ' + C.couple.child +
                ' — venčanje i ' + possessive(C.couple.child) + ' prvi rođendan';
    var where = v.name + ', ' + v.address + ', ' + v.city;
    var details = '15:00 skup zvanica\n16:00 građansko venčanje';

    function stamp(d) {
      return d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
    }
    var range = stamp(START) + '/' + stamp(END);

    var gcal = 'https://calendar.google.com/calendar/render?action=TEMPLATE' +
      '&text=' + encodeURIComponent(title) +
      '&dates=' + range +
      '&details=' + encodeURIComponent(details) +
      '&location=' + encodeURIComponent(where);

    /* .ics se NE generiše u JS-u. Ranije je bio blob + download atribut, ali
       iOS to samo snimi u Fajlove i nikad ne ponudi Kalendar. Sada je to
       pravi fajl (vencanje.ics) koji server šalje kao text/calendar — tada
       Safari na iPhone-u odmah otvori sheet za dodavanje u kalendar.
       Putanja stoji u HTML-u, pa je ovde ne treba postavljati.            */
    $$('[data-cal-google]').forEach(function (a) { a.href = gcal; });

    // padajući meni
    $$('[data-cal]').forEach(function (wrap) {
      var btn = wrap.querySelector('button'), menu = wrap.querySelector('.cal__menu');
      btn.addEventListener('click', function (e) {
        e.stopPropagation();
        var open = !menu.hidden;
        closeAll();
        if (open) return;
        menu.hidden = false;
        btn.setAttribute('aria-expanded', 'true');
      });
      menu.addEventListener('click', function () { setTimeout(closeAll, 60); });
    });

    function closeAll() {
      $$('[data-cal]').forEach(function (w) {
        w.querySelector('.cal__menu').hidden = true;
        w.querySelector('button').setAttribute('aria-expanded', 'false');
      });
    }
    document.addEventListener('click', closeAll);
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeAll(); });
  }

  /* ---------------------------------------------------------------
     9. Smeštaj (kartice iz config.js)
     --------------------------------------------------------------- */
  function initHotels() {
    var box = $('#hotels');
    if (!box || !C.hotels) return;
    box.innerHTML = C.hotels.map(function (h, idx) {
      var map = 'https://www.google.com/maps/search/?api=1&query=' +
                encodeURIComponent(h.mapQuery || h.name + ' Kraljevo');
      var call = h.phone
        ? '<a href="' + telHref(h.phone) + '"><span>Pozovi</span></a>'
        : '';
      return '<article class="card" data-reveal data-reveal-delay="' + idx + '">' +
               '<h3 class="card__name">' + h.name + '</h3>' +
               '<p class="card__note">' + (h.note || '') + '</p>' +
               '<div class="card__actions">' + call +
                 '<a href="' + map + '" target="_blank" rel="noopener"><span>Mapa</span></a>' +
               '</div>' +
             '</article>';
    }).join('');
  }

  /* ---------------------------------------------------------------
     10. Kontakt dugmići ispod forme
     --------------------------------------------------------------- */
  function initContacts() {
    var box = $('#contactButtons');
    if (!box || !C.contacts) return;
    box.innerHTML = C.contacts.map(function (c) {
      var d = digits(c.phone);                        // 381600000000
      return '<div class="contact">' +
               '<p class="contact__name">' + c.name + '</p>' +
               '<p class="contact__num"><a href="' + telHref(c.phone) + '">' + c.phone + '</a></p>' +
               '<div class="contact__links">' +
                 '<a href="' + smsHref(c.phone) + '">SMS</a>' +
                 '<a href="viber://chat?number=%2B' + d + '">Viber</a>' +
                 '<a href="https://wa.me/' + d + '" target="_blank" rel="noopener">WhatsApp</a>' +
               '</div>' +
             '</div>';
    }).join('');
  }

  /* ---------------------------------------------------------------
     11. Mapa se učitava na klik + kopiranje adrese
     --------------------------------------------------------------- */
  function initMap() {
    var holder = $('[data-map]');
    if (holder) {
      var done = false;

      var loadMap = function () {
        if (done) return;
        done = true;
        var v = C.venue || {};
        var q = encodeURIComponent(v.mapQuery || v.name);
        var f = document.createElement('iframe');
        // hl=sr-Latn -> nazivi ulica latinicom (sa `sr` Google vraća ćirilicu)
        f.src = 'https://www.google.com/maps?q=' + q + '&output=embed&hl=sr-Latn';
        f.title = 'Mapa: ' + v.name;
        f.loading = 'lazy';
        f.referrerPolicy = 'no-referrer-when-downgrade';
        f.setAttribute('allowfullscreen', '');
        f.addEventListener('load', function () { holder.classList.add('is-loaded'); });
        holder.appendChild(f);   // ne brišemo poruku — mapa se preliva preko nje
      };

      /* Mapa je ~800 KB, pa se ne učitava odmah sa stranom nego kada se
         sekcija „Lokacija" približi ekranu. rootMargin daje glavu prednosti
         da je mapa već tu kada gost stigne do nje.                        */
      if ('IntersectionObserver' in window) {
        var mapIO = new IntersectionObserver(function (entries) {
          for (var i = 0; i < entries.length; i++) {
            if (entries[i].isIntersecting) { loadMap(); mapIO.disconnect(); return; }
          }
        }, { rootMargin: '500px 0px' });
        mapIO.observe(holder);
      } else {
        loadMap();
      }
    }

    var copy = $('[data-copy-address]');
    if (copy) {
      copy.addEventListener('click', function () {
        var v = C.venue || {};
        var text = v.name + ', ' + v.address + ', ' + v.city;
        var ok = function () { toast('Adresa je kopirana'); };
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(text).then(ok, function () { legacyCopy(text, ok); });
        } else {
          legacyCopy(text, ok);
        }
      });
    }
  }

  function legacyCopy(text, done) {
    var ta = document.createElement('textarea');
    ta.value = text;
    ta.setAttribute('readonly', '');
    ta.style.cssText = 'position:fixed;top:-1000px;opacity:0';
    document.body.appendChild(ta);
    ta.select();
    try { document.execCommand('copy'); done(); }
    catch (e) { toast('Kopiranje nije uspelo'); }
    document.body.removeChild(ta);
  }

  var toastTimer = null;
  function toast(msg) {
    var el = $('#toast');
    if (!el) {
      el = document.createElement('div');
      el.id = 'toast';
      el.className = 'toast';
      el.setAttribute('role', 'status');
      document.body.appendChild(el);
    }
    el.textContent = msg;
    el.classList.add('is-on');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { el.classList.remove('is-on'); }, 2600);
  }

  /* ---------------------------------------------------------------
     12. RSVP forma
     --------------------------------------------------------------- */
  var STORE = 'jms-rsvp-2026';

  function initRsvp() {
    var form = $('#rsvpForm');
    if (!form) return;
    var status  = $('#rsvpStatus');
    var submit  = $('#rsvpSubmit');
    var already = $('#rsvpAlready');
    var again   = $('#rsvpAgain');
    var gosti   = $('#gostiField');
    var errIme  = $('[data-err="ime"]');

    /* već potvrđeno? */
    var saved = null;
    try { saved = JSON.parse(localStorage.getItem(STORE)); } catch (e) { /* nema veze */ }
    if (saved && saved.ime) {
      form.hidden = true;
      already.hidden = false;
    }
    if (again) {
      again.addEventListener('click', function () {
        try { localStorage.removeItem(STORE); } catch (e) {}
        already.hidden = true;
        form.hidden = false;
        $('#ime').focus();
      });
    }

    /* „Ne mogu" sakriva broj gostiju */
    $$('input[name="dolazak"]', form).forEach(function (radio) {
      radio.addEventListener('change', function () {
        gosti.classList.toggle('is-collapsed', radio.value === 'Ne mogu' && radio.checked);
      });
    });

    function setStatus(msg, kind) {
      status.textContent = msg;
      status.className = 'form__status' + (kind ? ' is-' + kind : '');
    }

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      errIme.textContent = '';
      $('#ime').removeAttribute('aria-invalid');
      setStatus('', '');

      var ime = $('#ime').value.trim();
      if (ime.length < 3) {
        errIme.textContent = 'Molimo upišite ime i prezime.';
        $('#ime').setAttribute('aria-invalid', 'true');
        $('#ime').focus();
        return;
      }

      var dolazak = (form.querySelector('input[name="dolazak"]:checked') || {}).value || 'Dolazim';
      var coming  = dolazak === 'Dolazim';

      /* zamka za botove — tiho "uspeh", ništa se ne šalje */
      if ($('#website').value) { showSuccess(coming, ime, dolazak, true); return; }

      var payload = {
        ime: ime,
        dolazak: dolazak,
        gosti: coming ? $('#gosti').value : '0',
        poslato: new Date().toISOString()
      };

      submit.classList.add('is-loading');
      setStatus('Šaljem…', '');

      send(payload).then(function () {
        submit.classList.remove('is-loading');
        showSuccess(coming, ime, dolazak);
      }, function () {
        submit.classList.remove('is-loading');
        setStatus('Slanje nije uspelo. Molimo pokušajte ponovo ili nas pozovite — brojevi su ispod.', 'err');
      });
    });

    function showSuccess(coming, ime, dolazak, silent) {
      setStatus(coming
        ? 'Hvala! Zabeležili smo Vas. Vidimo se 8. novembra.'
        : 'Hvala što ste nam javili. Biće nam žao što Vas nema.', 'ok');
      if (silent) return;
      try {
        localStorage.setItem(STORE, JSON.stringify({ ime: ime, dolazak: dolazak, at: Date.now() }));
      } catch (e) { /* privatni režim — nema veze */ }
      setTimeout(function () {
        form.hidden = true;
        already.hidden = false;
      }, 2600);
    }
  }

  function send(payload) {
    var url = C.rsvpEndpoint;

    /* demo režim: nema endpointa — ispiši u konzolu i prijavi uspeh */
    if (!url) {
      console.info('[RSVP demo] Nema CONFIG.rsvpEndpoint — podaci NISU poslati:', payload);
      return new Promise(function (res) { setTimeout(res, 550); });
    }

    var body = JSON.stringify(payload);
    var opts = { method: 'POST', body: body, headers: { 'Content-Type': 'text/plain;charset=utf-8' } };

    /* text/plain = "simple request" → nema CORS preflight-a koji Apps Script ne voli */
    return fetch(url, opts).catch(function () {
      /* rezerva: pošalji naslepo (red ipak stigne u tabelu) */
      return fetch(url, {
        method: 'POST', mode: 'no-cors', body: body,
        headers: { 'Content-Type': 'text/plain;charset=utf-8' }
      });
    });
  }

  /* ---------------------------------------------------------------
     Start
     --------------------------------------------------------------- */
  function boot() {
    fillConfig();
    initNav();
    initHero();
    initHotels();
    initContacts();
    initReveal();          // posle generisanih kartica
    initParallax();
    initCountdown();
    initCalendar();
    initMap();
    initRsvp();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();

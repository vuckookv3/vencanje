(function () {
  'use strict';

  var C = window.CONFIG || {};
  var $  = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  var START = new Date(C.startsAt);
  var END   = new Date(C.endsAt);

  function telHref(num) { return 'tel:' + String(num).replace(/[^\d+]/g, ''); }

  function smsHref(num) { return 'sms:' + String(num).replace(/[^\d+]/g, ''); }
  function digits(num)  { return String(num).replace(/\D/g, ''); }

  function srDate(iso) {
    var p = String(iso).slice(0, 10).split('-');
    return p[2].replace(/^0/, '') + '.' + p[1].replace(/^0/, '') + '.' + p[0] + '.';
  }

  function possessive(name) {
    var last = name.slice(-1).toLowerCase();
    if (last === 'a') return name.slice(0, -1) + 'in';
    if (last === 'o' || last === 'e') return name.slice(0, -1) + 'ov';
    return name + 'ov';
  }

  function cityShort() {
    return String(C.venue.city || '').replace(/^\d+\s*/, '');
  }

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

    var inline = $('[data-cfg="contacts-inline"]');
    if (inline && C.contacts) {
      inline.innerHTML = C.contacts.map(function (c) {
        return '<a href="' + telHref(c.phone) + '">' + c.name + '</a>';
      }).join(' i ');
    }
  }

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

  function prepareHero() {
    var title = $('[data-split]');
    if (!title) return;
    var i = 0;
    title.innerHTML = title.textContent.trim().split(/\s+/).map(function (word) {
      var chars = word.split('').map(function (ch) {
        return '<span class="ch" style="--i:' + (i++) + '">' + ch + '</span>';
      }).join('');
      return '<span class="word">' + chars + '</span>';
    }).join(' ');
  }

  function playHero() {

    var hero = $('#hero'), mono = $('.hero .monogram');
    if (!hero) return;

    function play() {
      hero.classList.add('is-ready');
      if (mono) mono.classList.add('is-drawn');
    }

    var done = false;
    var go = function () { if (!done) { done = true; requestAnimationFrame(play); } };
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(go);
    setTimeout(go, 1200);
  }

  function initReveal() {
    var items = $$('[data-reveal]');
    if (!('IntersectionObserver' in window)) {
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

  function initParallax() {
    var bands = $$('[data-parallax]');
    if (!bands.length) return;

    var pending = false;
    function update() {
      var vh = window.innerHeight;
      var factor = window.innerWidth < 768 ? 0.06 : 0.10;
      bands.forEach(function (band) {
        var r = band.getBoundingClientRect();
        if (r.bottom < -80 || r.top > vh + 80) return;
        var media = band.querySelector('.band__media');
        if (!media) return;
        var progress = (r.top + r.height / 2 - vh / 2) / vh;
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

    $$('[data-cal-google]').forEach(function (a) { a.href = gcal; });
  }

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

  function initContacts() {
    var box = $('#contactButtons');
    if (!box || !C.contacts) return;
    box.innerHTML = C.contacts.map(function (c) {
      var d = digits(c.phone);
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

        f.src = 'https://www.google.com/maps?q=' + q + '&output=embed&hl=sr-Latn';
        f.title = 'Mapa: ' + v.name;
        f.loading = 'lazy';
        f.referrerPolicy = 'no-referrer-when-downgrade';
        f.setAttribute('allowfullscreen', '');
        f.addEventListener('load', function () { holder.classList.add('is-loaded'); });
        holder.appendChild(f);
      };

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

    var saved = null;
    try { saved = JSON.parse(localStorage.getItem(STORE)); } catch (e) {   }
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
      } catch (e) {   }
      setTimeout(function () {
        form.hidden = true;
        already.hidden = false;
      }, 2600);
    }
  }

  function send(payload) {
    var url = C.rsvpEndpoint;

    if (!url) {
      console.info('[RSVP demo] Nema CONFIG.rsvpEndpoint — podaci NISU poslati:', payload);
      return new Promise(function (res) { setTimeout(res, 550); });
    }

    var body = JSON.stringify(payload);
    var opts = { method: 'POST', body: body, headers: { 'Content-Type': 'text/plain;charset=utf-8' } };

    return fetch(url, opts).catch(function () {

      return fetch(url, {
        method: 'POST', mode: 'no-cors', body: body,
        headers: { 'Content-Type': 'text/plain;charset=utf-8' }
      });
    });
  }

  function initRsvpBar() {
    var bar = $('#rsvpBar'), program = $('#program'), rsvp = $('#rsvp');
    if (!bar || !program || !rsvp) return;

    try {
      var saved = JSON.parse(localStorage.getItem(STORE));
      if (saved && saved.ime) return;
    } catch (e) {   }

    function docTop(el) { return el.getBoundingClientRect().top + window.scrollY; }

    var pending = false;
    function update() {
      var y = window.scrollY, vh = window.innerHeight;

      var pastIntro   = y + vh * 0.65 > docTop(program);
      var reachedForm = y + vh > docTop(rsvp) + 120;
      var on = pastIntro && !reachedForm;
      bar.classList.toggle('is-on', on);

      document.body.classList.toggle('has-bar', on);
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

  var VOL = 0.3;
  var introVideo = null, bgm = null, soundBtn = null, soundOn = false;

  function initIntro() {
    introVideo = $('#introVideo');
    if (!introVideo) return;
  }

  function paintSound() {
    if (!soundBtn) return;
    soundBtn.setAttribute('aria-pressed', soundOn ? 'true' : 'false');
    soundBtn.setAttribute('aria-label', soundOn ? 'Isključi muziku' : 'Uključi muziku');
  }

  function rampTo(target, ms) {
    if (!bgm) return;
    var from = bgm.volume, t0 = Date.now();
    (function step() {
      var k = Math.min(1, (Date.now() - t0) / ms);
      bgm.volume = from + (target - from) * k;
      if (k < 1) requestAnimationFrame(step);
    })();
  }

  function playMusic() {
    if (!bgm) return;
    bgm.volume = 0;
    var p = bgm.play();
    soundOn = true;
    paintSound();
    if (p && p.then) {
      p.then(function () { rampTo(VOL, 1200); })
       .catch(function () { soundOn = false; paintSound(); });
    } else {
      rampTo(VOL, 1200);
    }
  }

  function stopMusic() {
    if (!bgm) return;
    bgm.pause();
    soundOn = false;
    paintSound();
  }

  function startMedia(withSound) {
    if (introVideo) {
      introVideo.muted = true;
      var v = introVideo.play();
      if (v && v['catch']) v['catch'](function () {});
    }
    if (withSound) playMusic();
  }

  function initSound() {
    bgm = $('#bgm');
    soundBtn = $('#soundToggle');
    if (!bgm || !soundBtn) return;

    bgm.volume = 0;
    paintSound();

    soundBtn.addEventListener('click', function () {
      if (soundOn) stopMusic(); else playMusic();
    });

    document.addEventListener('visibilitychange', function () {
      if (!bgm) return;
      if (document.hidden) { bgm.pause(); return; }
      if (soundOn) {
        var p = bgm.play();
        if (p && p['catch']) p['catch'](function () {});
      }
    });
  }

  function initEnvelope(done) {
    var env = $('#envelope'), key = $('#envOpen'), envVideo = $('#envVideo');

    var EXIT_MS = 1500;
    var LEAD_S = 0.5;

    function drop() {
      if (env && env.parentNode) env.parentNode.removeChild(env);
      if (key && key.parentNode) key.parentNode.removeChild(key);
    }

    if (!env || !key) {
      drop();
      done();
      initIntroNudge();
      return;
    }

    key.checked = false;

    document.body.classList.add('is-envelope', 'is-locked');

    env.style.animation = 'none';

    if (introVideo) introVideo.pause();
    if (envVideo) { envVideo.pause(); envVideo.currentTime = 0; }

    if ('scrollRestoration' in history) history.scrollRestoration = 'manual';

    if (location.hash && history.replaceState) {
      history.replaceState(null, '', location.pathname + location.search);
    }

    var opened = false, exiting = false, finished = false;

    window.scrollTo(0, 0);

    window.addEventListener('load', function () {
      if (!exiting) window.scrollTo(0, 0);
    });

    function exit() {
      if (exiting) return;
      exiting = true;
      window.scrollTo(0, 0);
      env.classList.add('is-exiting');
      document.body.classList.remove('is-envelope');
      done();
      setTimeout(finish, EXIT_MS);
    }

    function finish() {
      if (finished) return;
      finished = true;
      if ('scrollRestoration' in history) history.scrollRestoration = 'auto';
      document.body.classList.remove('is-envelope', 'is-locked');
      drop();
      initIntroNudge();
    }

    function open() {
      if (opened) return;
      opened = true;
      startMedia(true);
      if (envVideo) {
        var e = envVideo.play();
        if (e && e['catch']) e['catch'](function () {});
      }

      var lead = (envVideo && envVideo.duration ? envVideo.duration : 2.77) - LEAD_S;
      setTimeout(exit, lead * 1000 + 900);
    }

    key.addEventListener('change', function () { if (key.checked) open(); });

    if (envVideo) {
      envVideo.addEventListener('timeupdate', function () {
        if (envVideo.duration && envVideo.duration - envVideo.currentTime <= LEAD_S) exit();
      });
      envVideo.addEventListener('ended', exit);
    }
  }

  var SCROLL_MIN = 900, SCROLL_MAX = 2400, SCROLL_PER_PX = 0.45;

  function targetY(el) {
    var root = document.documentElement;
    var pad = parseFloat(getComputedStyle(root).scrollPaddingTop) || 0;
    var max = document.body.scrollHeight - window.innerHeight;
    var y = el.getBoundingClientRect().top + window.scrollY - pad;
    return Math.max(0, Math.min(Math.round(y), max));
  }

  function easeInOut(t) {
    return t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  }

  function glideTo(to) {
    var root = document.documentElement;
    var from = window.scrollY;
    var dist = to - from;
    if (!dist) return;
    var ms = Math.min(SCROLL_MAX, Math.max(SCROLL_MIN, Math.abs(dist) * SCROLL_PER_PX));
    var t0 = null, stopped = false;

    var prev = root.style.scrollBehavior;
    root.style.scrollBehavior = 'auto';

    function stop() { stopped = true; }
    var opts = { passive: true };
    window.addEventListener('wheel', stop, opts);
    window.addEventListener('touchstart', stop, opts);
    window.addEventListener('keydown', stop);

    function end() {
      root.style.scrollBehavior = prev;
      window.removeEventListener('wheel', stop);
      window.removeEventListener('touchstart', stop);
      window.removeEventListener('keydown', stop);
    }

    function step(now) {
      if (stopped) return end();
      if (t0 === null) t0 = now;
      var p = Math.min((now - t0) / ms, 1);
      window.scrollTo(0, from + dist * easeInOut(p));
      if (p < 1) requestAnimationFrame(step); else end();
    }
    requestAnimationFrame(step);
  }

  function initSlowScroll() {
    var links = $$('a[data-scroll-slow]');
    if (!links.length) return;

    links.forEach(function (a) {
      a.addEventListener('click', function (e) {
        var id = a.getAttribute('href');
        var target = id && id.charAt(0) === '#' && $(id);
        if (!target) return;
        e.preventDefault();
        glideTo(targetY(target));

        if (history.pushState) history.pushState(null, '', id);
      });
    });
  }

  var NUDGE_MS = 8000;
  var NUDGE_KEY = 'jms-intro-nudge';

  function nudgeDone() {
    try { sessionStorage.setItem(NUDGE_KEY, '1'); } catch (e) {   }
  }

  function initIntroNudge() {
    var hero = $('#hero');
    if (!hero) return;
    try { if (sessionStorage.getItem(NUDGE_KEY)) return; } catch (e) {}

    var timer = null;
    var events = ['wheel', 'touchstart', 'keydown', 'click', 'scroll'];

    function off() {
      events.forEach(function (n) { window.removeEventListener(n, cancel); });
    }

    function cancel() {
      clearTimeout(timer);
      off();
      nudgeDone();
    }
    events.forEach(function (n) {
      window.addEventListener(n, cancel, { passive: true });
    });

    timer = setTimeout(function () {
      off();
      if (window.scrollY > 4) return nudgeDone();
      nudgeDone();
      glideTo(targetY(hero));
    }, NUDGE_MS);
  }

  function boot() {
    fillConfig();
    initNav();
    prepareHero();
    initIntro();
    initHotels();
    initContacts();
    initReveal();
    initParallax();
    initCountdown();
    initCalendar();
    initMap();
    initRsvp();
    initRsvpBar();
    initSlowScroll();
    initSound();
    initEnvelope(playHero);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();

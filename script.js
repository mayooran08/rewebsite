(function () {
  var nav = document.querySelector('.nav');
  var links = document.getElementById('links');
  var burger = document.getElementById('burger');

  // remember the chosen language for the root redirect
  document.querySelectorAll('.lang').forEach(function (a) {
    a.addEventListener('click', function () {
      try { localStorage.setItem('lang', a.getAttribute('data-lang')); } catch (e) {}
    });
  });
  try { localStorage.setItem('lang', document.documentElement.lang); } catch (e) {}

  if (burger && links) {
    burger.addEventListener('click', function () {
      var open = links.classList.toggle('open');
      burger.setAttribute('aria-expanded', open);
    });
    links.addEventListener('click', function (e) {
      if (e.target.tagName === 'A') links.classList.remove('open');
    });
  }

  if (nav) {
    window.addEventListener('scroll', function () {
      nav.classList.toggle('scrolled', window.scrollY > 10);
    }, { passive: true });
  }

  // contact / valuation forms (Web3Forms)
  document.querySelectorAll('.js-form').forEach(function (form) {
    var status = form.querySelector('.status');
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      status.className = 'status';
      status.textContent = form.getAttribute('data-sending');
      fetch(form.action, { method: 'POST', headers: { Accept: 'application/json' }, body: new FormData(form) })
        .then(function (r) { return r.json(); })
        .then(function (d) {
          if (d.success) {
            status.className = 'status ok';
            status.textContent = form.getAttribute('data-ok');
            form.reset();
            if (form.hasAttribute('data-steps')) {
              form.classList.add('done');
              status.setAttribute('tabindex', '-1');
              status.focus();
            }
          } else { throw new Error('failed'); }
        })
        .catch(function () {
          status.className = 'status err';
          status.textContent = form.getAttribute('data-err');
        });
    });
  });

  // Evaluation form: turns the three groups into steps. Without this script all groups simply show at once.
  document.querySelectorAll('.js-form[data-steps]').forEach(function (form) {
    var groups = [].slice.call(form.querySelectorAll('fieldset[data-step]'));
    if (groups.length < 2) return;
    var current = 0;
    form.classList.add('is-stepped');

    var progress = document.createElement('div');
    progress.className = 'step-progress';
    progress.innerHTML = '<p class="step-label" aria-live="polite"></p><div class="step-bar"><span></span></div>';
    form.insertBefore(progress, groups[0]);
    var label = progress.querySelector('.step-label');
    var bar = progress.querySelector('.step-bar span');

    function makeButton(cls, text, onClick) {
      var b = document.createElement('button');
      b.type = 'button';
      b.className = cls;
      b.textContent = text;
      b.addEventListener('click', onClick);
      return b;
    }

    // check only the fields of the visible step; show the browser's own message for the first problem
    function stepIsValid(group) {
      var fields = group.querySelectorAll('input, select, textarea');
      for (var k = 0; k < fields.length; k++) {
        if (!fields[k].checkValidity()) { fields[k].reportValidity(); fields[k].focus(); return false; }
      }
      return true;
    }

    function show(n, moveFocus) {
      current = n;
      groups.forEach(function (g, k) { g.hidden = k !== n; });
      label.textContent = form.getAttribute('data-step-label')
        .replace('{n}', n + 1).replace('{t}', groups.length).replace('{name}', groups[n].getAttribute('data-step-name'));
      bar.style.width = (((n + 1) / groups.length) * 100) + '%';
      if (moveFocus) {
        var first = groups[n].querySelector('input:not([type="hidden"]), select, textarea');
        if (first) first.focus();
      }
    }

    groups.forEach(function (group, idx) {
      var nav = document.createElement('div');
      nav.className = 'step-nav';
      if (idx > 0) nav.appendChild(makeButton('btn-text', form.getAttribute('data-back'), function () { show(idx - 1, true); }));
      if (idx < groups.length - 1) {
        nav.appendChild(makeButton('btn', form.getAttribute('data-next'), function () { if (stepIsValid(group)) show(idx + 1, true); }));
      } else {
        var submit = group.querySelector('button[type="submit"]');
        if (submit) nav.appendChild(submit);
      }
      group.appendChild(nav);
    });

    // Enter moves to the next step instead of sending early
    form.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' && e.target.tagName !== 'TEXTAREA' && current < groups.length - 1) {
        e.preventDefault();
        if (stepIsValid(groups[current])) show(current + 1, true);
      }
    });

    show(0, false);
  });
  // testimonials, loaded from /data/testimonials.json (edited by the admin)
  function renderTestimonials(box, items) {
    var lang = document.documentElement.lang === 'fr' ? 'fr' : 'en';
    var list = box.querySelector('[data-testimonial-list]');
    var empty = box.querySelector('[data-testimonial-empty]');
    var mode = box.getAttribute('data-testimonials');
    var max = parseInt(box.getAttribute('data-max') || '0', 10);

    var shown = items.filter(function (t) {
      if (!t || t.published === false) return false;
      if (mode === 'featured' && t.featured !== true) return false;
      return !!(t['quote_' + lang] || t.quote_en || t.quote_fr);
    });
    if (max > 0) shown = shown.slice(0, max);

    if (!shown.length) {
      if (mode === 'featured') { box.hidden = true; } else if (empty) { empty.hidden = false; }
      return;
    }
    if (empty) empty.hidden = true;
    list.textContent = '';
    shown.forEach(function (t) {
      var fig = document.createElement('figure');
      fig.className = 'testimonial';

      var rating = Math.round(Number(t.rating));
      if (rating >= 1 && rating <= 5) {
        var stars = document.createElement('div');
        stars.className = 'stars';
        stars.setAttribute('role', 'img');
        stars.setAttribute('aria-label', rating + ' / 5');
        stars.textContent = '★★★★★'.slice(0, rating) + '☆☆☆☆☆'.slice(0, 5 - rating);
        fig.appendChild(stars);
      }

      var q = document.createElement('blockquote');
      var text = t['quote_' + lang] || t.quote_en || t.quote_fr;
      var clamp = parseInt(box.getAttribute('data-clamp') || '0', 10);
      if (clamp && text.length > clamp) text = text.slice(0, clamp).replace(/\s+\S*$/, '') + '…';
      q.textContent = text;
      fig.appendChild(q);

      var cap = document.createElement('figcaption');
      var who = [t.name, t.city].filter(Boolean).join(', ');
      var strong = document.createElement('strong');
      strong.textContent = who;
      cap.appendChild(strong);
      if (t.date) {
        var d = document.createElement('span');
        d.textContent = ' · ' + t.date;
        cap.appendChild(d);
      }
      fig.appendChild(cap);
      list.appendChild(fig);
    });
    box.hidden = false;
  }

  document.querySelectorAll('[data-testimonials]').forEach(function (box) {
    fetch('/data/testimonials.json', { cache: 'no-cache' })
      .then(function (r) { if (!r.ok) throw new Error('http ' + r.status); return r.json(); })
      .then(function (items) { renderTestimonials(box, Array.isArray(items) ? items : []); })
      .catch(function () {
        if (box.getAttribute('data-testimonials') === 'featured') box.hidden = true;
        else { var e = box.querySelector('[data-testimonial-empty]'); if (e) e.hidden = false; }
      });
  });

  // Quick evaluation form on the home page: hand the address to the full form inside the browser
  // (sessionStorage), so personal details are not placed in the web address.
  document.querySelectorAll('.quick-eval').forEach(function (form) {
    form.addEventListener('submit', function (e) {
      var field = form.querySelector('[name="address"]');
      try {
        sessionStorage.setItem('evalAddress', field.value.slice(0, 300));
        e.preventDefault();
        location.href = form.getAttribute('action');
      } catch (err) { /* storage blocked: the form falls back to a normal GET with ?address= */ }
    });
  });

  // On the evaluation page, fill the address that was typed on the home page
  try {
    var saved = sessionStorage.getItem('evalAddress');
    var addr = saved || new URLSearchParams(location.search).get('address');
    var addrField = addr && document.querySelector('.js-form [name="address"]');
    if (addrField && !addrField.value) addrField.value = addr.slice(0, 300);
    if (saved) sessionStorage.removeItem('evalAddress');
  } catch (e) {}
})();

/* Cookie notice (Tawk.to live chat): shown on a visitor's first visit and again after 30 days.
   Nothing is loaded or stored until the visitor accepts. The choice is kept in localStorage. */
(function () {
  var launch = document.querySelector('.chat-launch');
  var box = document.getElementById('chat-consent');
  if (!launch || !box) return;
  var KEY = 'cookieChoice';
  var DAYS = 30;
  var started = false;

  try { localStorage.removeItem('chatConsent'); sessionStorage.removeItem(KEY); } catch (e) {}

  window.Tawk_API = window.Tawk_API || {};
  window.Tawk_LoadStart = new Date();
  window.Tawk_API.customStyle = {
    visibility: {
      desktop: { position: 'br', xOffset: 18, yOffset: 18 },
      mobile: { position: 'br', xOffset: 10, yOffset: 78 }
    }
  };

  function start() {
    if (started) return;
    started = true;
    launch.hidden = true;
    box.hidden = true;
    var s = document.createElement('script');
    s.async = true;
    s.src = 'https://embed.tawk.to/6ae7bb7026050d3c3477c6d5/1k6cj8bt6';
    s.charset = 'UTF-8';
    s.setAttribute('crossorigin', '*');
    document.head.appendChild(s);
  }
  function remember(v) {
    try { localStorage.setItem(KEY, JSON.stringify({ v: v, t: Date.now() })); } catch (e) {}
  }
  function recall() {
    try {
      var o = JSON.parse(localStorage.getItem(KEY));
      if (o && (o.v === 'yes' || o.v === 'no') && Date.now() - o.t < DAYS * 864e5) return o.v;
      localStorage.removeItem(KEY);
    } catch (e) {}
    return null;
  }
  function decline() {
    remember('no');
    box.hidden = true;
    launch.hidden = false;
    launch.setAttribute('aria-expanded', 'false');
  }

  var choice = recall();
  if (choice === 'yes') {
    if (document.readyState === 'complete') start(); else window.addEventListener('load', start);
  } else if (choice === 'no') {
    launch.hidden = false;
  } else {
    setTimeout(function () { box.hidden = false; }, 700);
  }

  function panel(name) {
    var all = box.querySelectorAll('[data-cc]');
    for (var i = 0; i < all.length; i++) all[i].hidden = all[i].getAttribute('data-cc') !== name;
  }
  function openBox() {
    panel('main');
    box.hidden = false;
    launch.setAttribute('aria-expanded', 'true');
    box.querySelector('[data-chat-ok]').focus();
  }
  var chatBox = box.querySelector('[data-cc-chat]');

  launch.addEventListener('click', openBox);
  box.querySelector('[data-chat-ok]').addEventListener('click', function () { remember('yes'); start(); });
  box.querySelector('[data-chat-no]').addEventListener('click', decline);
  box.querySelector('[data-cc-open]').addEventListener('click', function () {
    chatBox.checked = recall() === 'yes';
    panel('prefs');
    chatBox.focus();
  });
  box.querySelector('[data-cc-back]').addEventListener('click', function () { panel('main'); });
  box.querySelector('[data-cc-save]').addEventListener('click', function () {
    if (chatBox.checked) { remember('yes'); start(); } else decline();
  });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !box.hidden) decline(); });
})();

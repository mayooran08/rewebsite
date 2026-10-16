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
          } else { throw new Error('failed'); }
        })
        .catch(function () {
          status.className = 'status err';
          status.textContent = form.getAttribute('data-err');
        });
    });
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
      q.textContent = t['quote_' + lang] || t.quote_en || t.quote_fr;
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

  // scroll reveal
  var targets = document.querySelectorAll('.card, .about > div, .val-inner > *, .contact > *, .section h2, .steps li, .about-page > *');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
      });
    }, { threshold: 0.12 });
    targets.forEach(function (el) { el.classList.add('reveal'); io.observe(el); });
  }
})();

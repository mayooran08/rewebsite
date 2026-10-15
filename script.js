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

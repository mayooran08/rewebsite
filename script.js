(function () {
  var html = document.documentElement;
  var langBtn = document.getElementById('lang');
  var links = document.getElementById('links');
  var burger = document.getElementById('burger');
  var form = document.getElementById('form');
  var status = document.getElementById('status');
  var msgs = {
    en: { sending: 'Sending…', ok: 'Thank you! Your message was sent.', err: 'Something went wrong. Please call 514 570-2152.' },
    fr: { sending: 'Envoi…', ok: 'Merci ! Votre message a été envoyé.', err: 'Une erreur est survenue. Veuillez appeler le 514 570-2152.' }
  };

  function setLang(lang) {
    html.lang = lang;
    document.querySelectorAll('[data-en]').forEach(function (el) {
      var t = el.getAttribute('data-' + lang);
      if (t !== null) el.textContent = t;
    });
    langBtn.textContent = lang === 'en' ? 'FR' : 'EN';
    try { localStorage.setItem('lang', lang); } catch (e) {}
  }

  var saved = 'en';
  try { saved = localStorage.getItem('lang') || ((navigator.language || '').slice(0, 2) === 'fr' ? 'fr' : 'en'); } catch (e) {}
  if (saved === 'fr') setLang('fr');

  langBtn.addEventListener('click', function () {
    setLang(html.lang === 'en' ? 'fr' : 'en');
  });

  burger.addEventListener('click', function () {
    var open = links.classList.toggle('open');
    burger.setAttribute('aria-expanded', open);
  });
  links.addEventListener('click', function (e) {
    if (e.target.tagName === 'A') links.classList.remove('open');
  });

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var m = msgs[html.lang] || msgs.en;
    status.className = 'status';
    status.textContent = m.sending;
    fetch(form.action, { method: 'POST', headers: { Accept: 'application/json' }, body: new FormData(form) })
      .then(function (r) { return r.json(); })
      .then(function (d) {
        if (d.success) { status.className = 'status ok'; status.textContent = m.ok; form.reset(); }
        else throw new Error('failed');
      })
      .catch(function () { status.className = 'status err'; status.textContent = m.err; });
  });

  document.getElementById('year').textContent = new Date().getFullYear();
})();

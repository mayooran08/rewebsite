// Generates the bilingual multi-page site into the repo root.
// Run: node tools/build.mjs
import { mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const SITE = 'https://gevithakunaratnam.ca';
const KEY = 'bf96f6c2-df22-4371-a191-958c660c935b';
const LANGS = ['en', 'fr'];
const TODAY = new Date().toISOString().slice(0, 10);

const PAGES = {
  home:       { slug: { en: '', fr: '' } },
  about:      { slug: { en: 'about', fr: 'a-propos' } },
  buy:        { slug: { en: 'buy', fr: 'acheter' } },
  sell:       { slug: { en: 'sell', fr: 'vendre' } },
  commercial: { slug: { en: 'commercial', fr: 'commercial' } },
  valuation:  { slug: { en: 'valuation', fr: 'evaluation' } },
  contact:    { slug: { en: 'contact', fr: 'contact' } },
};

// Social links: paste the real page URLs here, then run `node tools/build.mjs`.
const SOCIAL = {
  facebook: '', // e.g. 'https://www.facebook.com/yourpage'
  google: '',   // e.g. 'https://g.page/yourbusiness' (Google Business Profile)
};
const ICON = {
  facebook: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>',
  google: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"/></svg>',
};
const socialLinks = (l) => ['facebook', 'google'].map((k) => {
  const label = k === 'facebook' ? 'Facebook' : (l === 'en' ? 'Google reviews / profile' : 'Google (avis / profil)');
  const href = SOCIAL[k] || '#';
  const ext = SOCIAL[k] ? ' target="_blank" rel="noopener noreferrer"' : ' aria-disabled="true" tabindex="-1"';
  return `<a class="social-link${SOCIAL[k] ? '' : ' pending'}" href="${href}"${ext} aria-label="${label}" title="${label}">${ICON[k]}<span>${k === 'facebook' ? 'Facebook' : 'Google'}</span></a>`;
}).join('');

// Photos live in assets/photos as <name>-520/-900 in .webp and .jpg
const ALT = {
  blacksuit: { en: 'Gevitha Kunaratnam, real estate broker in Laval, in a black blazer', fr: 'Gevitha Kunaratnam, courtière immobilière à Laval, en blazer noir' },
  'blue-chair': { en: 'Gevitha Kunaratnam smiling, seated, in a navy blazer', fr: 'Gevitha Kunaratnam souriante, assise, en blazer marine' },
  'green-sofa': { en: 'Gevitha Kunaratnam in a green suit, seated with her laptop and phone', fr: 'Gevitha Kunaratnam en tailleur vert, assise avec son ordinateur et son téléphone' },
  'on-phone': { en: 'Gevitha Kunaratnam smiling while on a phone call', fr: 'Gevitha Kunaratnam souriante au téléphone' },
};
const pic = (n, l, { cls = '', eager = false, decorative = false, sizes = '(max-width: 860px) 80vw, 400px' } = {}) => {
  const alt = decorative ? '' : ALT[n][l];
  const base = `/assets/photos/${n}`;
  return `<picture><source type="image/webp" srcset="${base}-520.webp 520w, ${base}-900.webp 900w" sizes="${sizes}"><img${cls ? ` class="${cls}"` : ''} src="${base}-900.jpg" srcset="${base}-520.jpg 520w, ${base}-900.jpg 900w" sizes="${sizes}" alt="${alt}" width="900" height="1350" ${eager ? 'fetchpriority="high"' : 'loading="lazy" decoding="async"'}></picture>`;
};

const url = (l, id) => `/${l}/${PAGES[id].slug[l]}${PAGES[id].slug[l] ? '/' : ''}`;

const NAV = [
  ['about', { en: 'About', fr: 'À propos' }],
  ['buy', { en: 'Buy', fr: 'Acheter' }],
  ['sell', { en: 'Sell', fr: 'Vendre' }],
  ['commercial', { en: 'Commercial', fr: 'Commercial' }],
  ['valuation', { en: 'Evaluation', fr: 'Évaluation' }],
];

const T = {
  contactBtn: { en: 'Contact me', fr: 'Me contacter' },
  appt: { en: 'Get an appointment', fr: 'Prendre rendez-vous' },
  langs: { en: 'Languages spoken', fr: 'Langues parlées' },
  langList: { en: 'Tamil · French · English', fr: 'Tamoul · Français · Anglais' },
  indep: { en: 'Each RE/MAX office is independently owned and operated.', fr: 'Chaque bureau RE/MAX est détenu et exploité de façon indépendante.' },
  home: { en: 'Home', fr: 'Accueil' },
  explore: { en: 'Explore', fr: 'Explorer' },
  learn: { en: 'Learn more', fr: 'En savoir plus' },
  cell: { en: 'Cell', fr: 'Cell.' },
  office: { en: 'Office', fr: 'Bur.' },
  fax: { en: 'Fax', fr: 'Téléc.' },
  menu: { en: 'Menu', fr: 'Menu' },
};
const t = (k, l) => T[k][l];

/* ---------- shared chunks ---------- */

function head(l, id, title, desc) {
  const twin = (x) => SITE + url(x, id);
  const ld = {
    '@context': 'https://schema.org',
    '@type': 'RealEstateAgent',
    name: 'Gevitha Kunaratnam',
    url: SITE + '/',
    image: SITE + '/assets/photos/blacksuit-900.jpg',
    telephone: '+1-514-570-2152',
    description: desc,
    knowsLanguage: ['en', 'fr', 'ta'],
    areaServed: { '@type': 'City', name: 'Laval, Quebec' },
    address: {
      '@type': 'PostalAddress',
      streetAddress: '830, boul. Curé-Labelle',
      addressLocality: 'Laval',
      addressRegion: 'QC',
      postalCode: 'H7V 2V3',
      addressCountry: 'CA',
    },
    parentOrganization: { '@type': 'Organization', name: 'RE/MAX 2000 INC.' },
  };
  return `<!doctype html>
<html lang="${l}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${title}</title>
<meta name="description" content="${desc}">
<link rel="canonical" href="${twin(l)}">
<link rel="alternate" hreflang="en" href="${twin('en')}">
<link rel="alternate" hreflang="fr" href="${twin('fr')}">
<link rel="alternate" hreflang="x-default" href="${SITE}/">
<meta name="theme-color" content="#0b1220">
<meta property="og:type" content="website">
<meta property="og:site_name" content="Gevitha Kunaratnam">
<meta property="og:title" content="${title}">
<meta property="og:description" content="${desc}">
<meta property="og:url" content="${twin(l)}">
<meta property="og:image" content="${SITE}/assets/photos/blacksuit-900.jpg">
<meta property="og:locale" content="${l === 'fr' ? 'fr_CA' : 'en_CA'}">
<meta name="twitter:card" content="summary">
<link rel="icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'%3E%3Crect width='64' height='64' rx='14' fill='%230b1220'/%3E%3Ctext x='32' y='43' font-family='Georgia,serif' font-size='34' font-weight='700' text-anchor='middle' fill='%23c9a24b'%3EGK%3C/text%3E%3C/svg%3E">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Playfair+Display:wght@500;600;700&display=swap" rel="stylesheet">
<link rel="stylesheet" href="/style.css">
<script type="application/ld+json">${JSON.stringify(ld)}</script>
</head>
<body>
`;
}

function header(l, id) {
  const other = l === 'en' ? 'fr' : 'en';
  const links = NAV.map(([p, label]) =>
    `<a href="${url(l, p)}"${p === id ? ' aria-current="page"' : ''}>${label[l]}</a>`).join('\n      ');
  return `<header class="nav" id="top">
  <div class="wrap nav-inner">
    <a href="${url(l, 'home')}" class="brand">Gevitha <span>Kunaratnam</span></a>
    <nav class="links" id="links" aria-label="Main">
      ${links}
      <a href="${url(l, 'contact')}" class="btn btn-sm"${id === 'contact' ? ' aria-current="page"' : ''}>${t('contactBtn', l)}</a>
      <a class="lang" href="${url(other, id)}" hreflang="${other}" lang="${other}" data-lang="${other}" aria-label="${other === 'fr' ? 'Version française' : 'English version'}">${other.toUpperCase()}</a>
    </nav>
    <button class="burger" id="burger" aria-label="${t('menu', l)}" aria-expanded="false"><span></span><span></span><span></span></button>
  </div>
</header>
`;
}

function footer(l) {
  const foot = ['about', 'buy', 'sell', 'commercial', 'valuation', 'contact']
    .map((p) => {
      const nav = NAV.find((n) => n[0] === p);
      const label = nav ? nav[1][l] : t('contactBtn', l);
      return `<li><a href="${url(l, p)}">${label}</a></li>`;
    }).join('');
  return `<footer class="footer">
  <div class="wrap foot-cols">
    <div>
      <p class="foot-brand">Gevitha <span>Kunaratnam</span></p>
      <p class="small">${l === 'en' ? 'Residential &amp; commercial real estate broker' : 'Courtière immobilière résidentielle et commerciale'}<br>RE/MAX 2000 INC.</p>
    </div>
    <div>
      <p class="foot-h">${t('explore', l)}</p>
      <ul class="foot-links">${foot}</ul>
    </div>
    <div>
      <p class="foot-h">Contact</p>
      <p class="small">830, boul. Curé-Labelle<br>Laval (Chomedey), Québec H7V 2V3<br>
      <a href="tel:+15145702152">514 570-2152</a> · <a href="tel:+14506822000">450 682-2000</a></p>
      <div class="social social-foot">${socialLinks(l)}</div>
    </div>
  </div>
  <div class="wrap foot-bottom">
    <p>© <span id="year">${new Date().getFullYear()}</span> Gevitha Kunaratnam · RE/MAX 2000 INC.</p>
    <p class="small">${t('indep', l)}</p>
  </div>
</footer>
<script src="/script.js"></script>
</body>
</html>
`;
}

function pageHero(l, h1, lead, crumb, photo) {
  return `<section class="page-hero${photo ? ' has-photo' : ''}">
  <div class="wrap">
    <div>
      <p class="crumbs"><a href="${url(l, 'home')}">${t('home', l)}</a> / ${crumb}</p>
      <h1>${h1}</h1>
      <p class="lead">${lead}</p>
    </div>${photo ? `
    <div class="page-hero-photo">${pic(photo, l, { decorative: true, sizes: '240px' })}</div>` : ''}
  </div>
</section>
`;
}

function ctaBand(l, title, text, btnLabel, target) {
  return `<section class="section valuation">
  <div class="wrap val-inner">
    <div><h2>${title}</h2><p>${text}</p></div>
    <a href="${url(l, target)}" class="btn btn-gold">${btnLabel}</a>
  </div>
</section>
`;
}

function contactInfo(l) {
  return `<address>
  <strong>RE/MAX 2000 INC.</strong><br>
  830, boul. Curé-Labelle<br>
  Laval (Chomedey), Québec H7V 2V3
</address>
<ul class="phones">
  <li><span>${t('cell', l)}</span> <a href="tel:+15145702152">514 570-2152</a></li>
  <li><span>${t('office', l)}</span> <a href="tel:+14506822000">450 682-2000</a></li>
  <li><span>${t('fax', l)}</span> 450 682-2242</li>
</ul>
<p><a class="textlink" href="https://www.google.com/maps/search/?api=1&amp;query=830+boul+Cur%C3%A9-Labelle+Laval+QC+H7V+2V3" target="_blank" rel="noopener">${l === 'en' ? 'View on Google Maps' : 'Voir sur Google Maps'} →</a></p>`;
}

function form(l, kind) {
  const F = {
    name: { en: 'Name', fr: 'Nom' },
    email: { en: 'Email', fr: 'Courriel' },
    phone: { en: 'Phone', fr: 'Téléphone' },
    msg: { en: 'Message (optional)', fr: 'Message (facultatif)' },
    addr: { en: 'Property address', fr: 'Adresse de la propriété' },
    type: { en: 'Property type', fr: 'Type de propriété' },
    reason: { en: 'Reason for evaluation', fr: "Raison de l'évaluation" },
    consent: { en: 'I agree to be contacted about my request.', fr: "J'accepte d'être contactée au sujet de ma demande." },
    send: { en: kind === 'valuation' ? 'Request my evaluation' : 'Send', fr: kind === 'valuation' ? 'Demander mon évaluation' : 'Envoyer' },
  };
  const types = l === 'en'
    ? ['House', 'Condo', 'Plex (duplex, triplex…)', 'Commercial', 'Land', 'Other']
    : ['Maison', 'Condo', 'Plex (duplex, triplex…)', 'Commercial', 'Terrain', 'Autre'];
  const reasons = l === 'en'
    ? ['Planning to sell soon', 'Thinking about selling', 'Just curious', 'Refinancing or estate']
    : ['Je prévois vendre bientôt', 'Je songe à vendre', 'Simple curiosité', 'Refinancement ou succession'];
  const opts = (a) => a.map((o) => `<option>${o}</option>`).join('');
  const extra = kind === 'valuation' ? `
  <label><span>${F.addr[l]}</span><input type="text" name="address" required autocomplete="street-address"></label>
  <label><span>${F.type[l]}</span><select name="property_type">${opts(types)}</select></label>
  <label><span>${F.reason[l]}</span><select name="reason">${opts(reasons)}</select></label>` : '';
  return `<form class="form js-form" action="https://api.web3forms.com/submit" method="POST"
  data-sending="${l === 'en' ? 'Sending…' : 'Envoi…'}"
  data-ok="${l === 'en' ? 'Thank you! Your message was sent.' : 'Merci ! Votre message a été envoyé.'}"
  data-err="${l === 'en' ? 'Something went wrong. Please call 514 570-2152.' : 'Une erreur est survenue. Veuillez appeler le 514 570-2152.'}">
  <input type="hidden" name="access_key" value="${KEY}">
  <input type="hidden" name="subject" value="${kind === 'valuation' ? 'Evaluation request' : 'New message'} from gevithakunaratnam.ca (${l.toUpperCase()})">
  <input type="hidden" name="from_name" value="gevithakunaratnam.ca">
  <input type="checkbox" name="botcheck" class="hp" style="display:none" tabindex="-1" autocomplete="off" aria-hidden="true">
  <label><span>${F.name[l]}</span><input type="text" name="name" required autocomplete="name"></label>
  <label><span>${F.email[l]}</span><input type="email" name="email" required autocomplete="email"></label>
  <label><span>${F.phone[l]}</span><input type="tel" name="phone" autocomplete="tel"></label>${extra}
  <label><span>${F.msg[l]}</span><textarea name="message" rows="4"></textarea></label>
  <label class="check"><input type="checkbox" name="consent" required><span>${F.consent[l]}</span></label>
  <button type="submit" class="btn">${F.send[l]}</button>
  <p class="status" role="status"></p>
</form>`;
}

function steps(items) {
  return `<ol class="steps">${items.map(([h, p]) => `<li><strong>${h}</strong>${p}</li>`).join('')}</ol>`;
}
function faq(items) {
  return `<div class="faq">${items.map(([q, a]) => `<details><summary>${q}</summary><p>${a}</p></details>`).join('')}</div>`;
}

/* ---------- page bodies ---------- */

const META = {
  home: {
    title: { en: 'Gevitha Kunaratnam | Real Estate Broker in Laval | RE/MAX 2000', fr: 'Gevitha Kunaratnam | Courtière immobilière à Laval | RE/MAX 2000' },
    desc: { en: 'Gevitha Kunaratnam, residential and commercial real estate broker at RE/MAX 2000 in Laval (Chomedey). Service in English, French and Tamil.', fr: 'Gevitha Kunaratnam, courtière immobilière résidentielle et commerciale chez RE/MAX 2000 à Laval (Chomedey). Service en français, anglais et tamoul.' },
  },
  about: {
    title: { en: 'About Gevitha Kunaratnam | Real Estate Broker, Laval', fr: 'À propos de Gevitha Kunaratnam | Courtière immobilière, Laval' },
    desc: { en: 'Meet Gevitha Kunaratnam, a Laval real estate broker serving buyers, sellers and business owners in English, French and Tamil.', fr: 'Faites connaissance avec Gevitha Kunaratnam, courtière immobilière à Laval au service des acheteurs, vendeurs et entrepreneurs en français, anglais et tamoul.' },
  },
  buy: {
    title: { en: 'Buy a Home in Laval | Gevitha Kunaratnam, RE/MAX 2000', fr: 'Acheter une propriété à Laval | Gevitha Kunaratnam, RE/MAX 2000' },
    desc: { en: 'Buying a home in Laval? Get targeted search, visits, offer strategy and negotiation with broker Gevitha Kunaratnam.', fr: 'Acheter une propriété à Laval ? Recherche ciblée, visites, stratégie d’offre et négociation avec la courtière Gevitha Kunaratnam.' },
  },
  sell: {
    title: { en: 'Sell Your Property in Laval | Gevitha Kunaratnam, RE/MAX 2000', fr: 'Vendre votre propriété à Laval | Gevitha Kunaratnam, RE/MAX 2000' },
    desc: { en: 'Sell your Laval property with accurate pricing, professional marketing and clear guidance from broker Gevitha Kunaratnam.', fr: 'Vendez votre propriété à Laval avec un juste prix, une mise en marché professionnelle et un accompagnement clair avec la courtière Gevitha Kunaratnam.' },
  },
  commercial: {
    title: { en: 'Commercial Real Estate in Laval | Gevitha Kunaratnam', fr: 'Immobilier commercial à Laval | Gevitha Kunaratnam' },
    desc: { en: 'Buy, sell or lease commercial space and income properties in Laval with broker Gevitha Kunaratnam, RE/MAX 2000.', fr: 'Achetez, vendez ou louez un local commercial ou un immeuble à revenus à Laval avec la courtière Gevitha Kunaratnam, RE/MAX 2000.' },
  },
  valuation: {
    title: { en: 'Free Property Evaluation in Laval | Gevitha Kunaratnam', fr: 'Évaluation gratuite de propriété à Laval | Gevitha Kunaratnam' },
    desc: { en: 'Request a free, no-obligation estimate of your property’s value in Laval from broker Gevitha Kunaratnam.', fr: 'Demandez une estimation gratuite et sans engagement de la valeur de votre propriété à Laval auprès de la courtière Gevitha Kunaratnam.' },
  },
  contact: {
    title: { en: 'Contact Gevitha Kunaratnam | Real Estate Broker, Laval', fr: 'Contacter Gevitha Kunaratnam | Courtière immobilière, Laval' },
    desc: { en: 'Contact Gevitha Kunaratnam at RE/MAX 2000, 830 boul. Curé-Labelle, Laval. Call 514 570-2152 or send a message.', fr: 'Contactez Gevitha Kunaratnam chez RE/MAX 2000, 830 boul. Curé-Labelle, Laval. Appelez au 514 570-2152 ou envoyez un message.' },
  },
};

const BODY = {
  home(l) {
    const E = l === 'en';
    const card = (id, icon, h, p) => `<article class="card">
          <div class="icon">${icon}</div>
          <h3>${h}</h3>
          <p>${p}</p>
          <a class="card-link" href="${url(l, id)}">${t('learn', l)} →</a>
        </article>`;
    const I = {
      home: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 10.5 12 3l9 7.5"/><path d="M5 9.5V21h14V9.5"/><path d="M10 21v-6h4v6"/></svg>',
      dollar: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2v20"/><path d="M17 6.5C16 5 14.3 4.5 12 4.5c-2.8 0-4.5 1.3-4.5 3.2 0 4.3 9.5 2 9.5 6.6 0 2-1.9 3.4-5 3.4-2.4 0-4.2-.7-5.2-2.2"/></svg>',
      building: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 21V4a1 1 0 0 1 1-1h9a1 1 0 0 1 1 1v17"/><path d="M15 9h4a1 1 0 0 1 1 1v11"/><path d="M2 21h20"/><path d="M8 7h3M8 11h3M8 15h3"/></svg>',
    };
    return `<section class="hero">
  <div class="wrap hero-inner">
    <div class="hero-text">
      <p class="eyebrow">${E ? 'Residential &amp; Commercial Real Estate Broker · Laval' : 'Courtière immobilière résidentielle et commerciale · Laval'}</p>
      <h1>Gevitha<br>Kunaratnam</h1>
      <p class="sub">${E ? 'Guiding you home, and guiding your business, with care, clarity and local expertise in Laval and beyond.' : 'Je vous guide vers votre chez-soi et votre commerce avec soin, clarté et expertise locale à Laval et ailleurs.'}</p>
      <div class="cta">
        <a href="${url(l, 'contact')}" class="btn">${t('appt', l)}</a>
        <a href="tel:+15145702152" class="btn btn-ghost">514 570-2152</a>
      </div>
      <p class="brokerage">RE/MAX 2000 INC.</p>
    </div>
    <div class="hero-photo">
      ${pic('blacksuit', l, { eager: true })}
    </div>
  </div>
</section>
<section class="languages"><div class="wrap"><p>${t('langs', l)} <strong>${t('langList', l)}</strong></p></div></section>

<section class="section" id="about">
  <div class="wrap about">
    <div>
      <p class="eyebrow dark">${E ? 'About me' : 'À propos de moi'}</p>
      <h2>${E ? 'From passion to profession' : 'De la passion à la profession'}</h2>
      <div class="about-img">${pic('blue-chair', l, { sizes: '(max-width: 860px) 80vw, 380px' })}</div>
    </div>
    <div class="about-text">
      <p>${E ? 'Buying or selling a property is one of the biggest decisions you will make. I am here to make it clear, calm and successful, from the first conversation to the day you get your keys.' : 'Acheter ou vendre une propriété est l’une des plus grandes décisions de votre vie. Je suis là pour que ce soit clair, serein et réussi, de la première conversation jusqu’à la remise des clés.'}</p>
      <p>${E ? 'I listen first, then advise honestly. You get transparent communication, strong negotiation and a personal approach, in English, French or Tamil.' : 'J’écoute d’abord, puis je conseille avec honnêteté. Vous bénéficiez d’une communication transparente, d’une négociation solide et d’une approche personnalisée, en français, en anglais ou en tamoul.'}</p>
      <p><a class="textlink" href="${url(l, 'about')}">${E ? 'More about me' : 'En savoir plus sur moi'} →</a></p>
    </div>
  </div>
</section>

<section class="section alt" id="services">
  <div class="wrap">
    <p class="eyebrow dark center">${E ? 'Real estate expertise' : 'Expertise immobilière'}</p>
    <h2 class="center">${E ? 'How I can help' : 'Comment je peux vous aider'}</h2>
    <div class="cards">
      ${card('buy', I.home, E ? 'Buying a home' : 'Acheter une propriété', E ? 'Targeted search, visits, offer strategy and negotiation until you have the right home at the right price.' : 'Recherche ciblée, visites, stratégie d’offre et négociation jusqu’à la propriété idéale au bon prix.')}
      ${card('sell', I.dollar, E ? 'Selling your property' : 'Vendre votre propriété', E ? 'Accurate pricing, professional marketing and guidance through every step to sell with confidence.' : 'Établissement du juste prix, mise en marché professionnelle et accompagnement à chaque étape pour vendre en toute confiance.')}
      ${card('commercial', I.building, E ? 'Commercial real estate' : 'Immobilier commercial', E ? 'Support for business owners and investors looking to buy, sell or lease commercial space.' : 'Soutien aux propriétaires d’entreprise et aux investisseurs qui souhaitent acheter, vendre ou louer un local commercial.')}
    </div>
  </div>
</section>
${ctaBand(l, E ? 'Do you know the value of your property?' : 'Connaissez-vous la valeur de votre propriété ?', E ? 'Get a free, no-obligation estimate based on your neighbourhood and recent market activity.' : 'Obtenez une estimation gratuite et sans engagement, basée sur votre quartier et l’activité récente du marché.', E ? 'Request an evaluation' : 'Demander une évaluation', 'valuation')}`;
  },

  about(l) {
    const E = l === 'en';
    return `${pageHero(l, E ? 'About Gevitha Kunaratnam' : 'À propos de Gevitha Kunaratnam', E ? 'A Laval real estate broker who listens first and advises honestly.' : 'Une courtière immobilière de Laval qui écoute d’abord et conseille avec honnêteté.', E ? 'About' : 'À propos')}
<section class="section">
  <div class="wrap about-page">
    ${pic('green-sofa', l, { cls: 'about-photo', sizes: '(max-width: 860px) 80vw, 380px' })}
    <div class="prose">
      <!-- TODO: replace with Gevitha's own story -->
      <p>${E ? 'Buying or selling a property is one of the biggest decisions you will make. I am here to make it clear, calm and successful, from the first conversation to the day you get your keys.' : 'Acheter ou vendre une propriété est l’une des plus grandes décisions de votre vie. Je suis là pour que ce soit clair, serein et réussi, de la première conversation jusqu’à la remise des clés.'}</p>
      <p>${E ? 'As a residential and commercial broker with RE/MAX 2000 in Laval (Chomedey), I help families, first-time buyers, investors and business owners find the right property and the right deal.' : 'Courtière résidentielle et commerciale chez RE/MAX 2000 à Laval (Chomedey), j’accompagne les familles, les premiers acheteurs, les investisseurs et les entrepreneurs vers la bonne propriété et la bonne transaction.'}</p>
      <p>${E ? 'I speak English, French and Tamil, so you can make decisions comfortably in the language you prefer.' : 'Je parle français, anglais et tamoul, pour que vous preniez vos décisions en toute confiance dans la langue de votre choix.'}</p>
      <h2>${E ? 'What you can expect' : 'Ce que vous pouvez attendre'}</h2>
      <ul class="ticks">
        <li>${E ? 'Honest advice, even when it is not what you hoped to hear' : 'Des conseils honnêtes, même quand ce n’est pas ce que vous espériez entendre'}</li>
        <li>${E ? 'Clear, quick communication at every step' : 'Une communication claire et rapide à chaque étape'}</li>
        <li>${E ? 'Strong negotiation on your behalf' : 'Une négociation solide en votre nom'}</li>
        <li>${E ? 'Service in English, French or Tamil' : 'Un service en français, en anglais ou en tamoul'}</li>
      </ul>
      <p><a href="${url(l, 'contact')}" class="btn">${t('appt', l)}</a></p>
    </div>
  </div>
</section>`;
  },

  buy(l) {
    const E = l === 'en';
    return `${pageHero(l, E ? 'Buy a home in Laval' : 'Acheter une propriété à Laval', E ? 'From your first budget conversation to the day you receive your keys.' : 'De la première discussion sur votre budget jusqu’à la remise des clés.', E ? 'Buy' : 'Acheter', 'blue-chair')}
<section class="section">
  <div class="wrap prose">
    <p>${E ? 'The right home is a mix of price, location and lifestyle. I help you define what matters, search the market in Laval and nearby areas, and negotiate so you buy with confidence.' : 'La bonne propriété est un équilibre entre prix, emplacement et mode de vie. Je vous aide à définir vos priorités, à explorer le marché de Laval et des environs, et à négocier pour acheter en toute confiance.'}</p>
    <h2>${E ? 'How buying works' : 'Le processus d’achat'}</h2>
    ${steps(E ? [
      ['Define your needs and budget', 'We talk about your goals, timeline and budget, and I recommend getting a mortgage pre-approval.'],
      ['Search and visits', 'I set up a targeted search, alert you to new listings and organise visits.'],
      ['Offer and negotiation', 'We prepare a promise to purchase and negotiate price and conditions.'],
      ['Inspection and financing', 'Building inspection, mortgage confirmation and other conditions are completed.'],
      ['Notary and keys', 'You sign at the notary’s office, pay the transfer duties (“welcome tax”) and receive your keys.'],
    ] : [
      ['Définir vos besoins et votre budget', 'Nous discutons de vos objectifs, de votre échéancier et de votre budget, et je recommande une préapprobation hypothécaire.'],
      ['Recherche et visites', 'Je mets en place une recherche ciblée, je vous avise des nouvelles inscriptions et j’organise les visites.'],
      ['Offre et négociation', 'Nous préparons une promesse d’achat et négocions le prix et les conditions.'],
      ['Inspection et financement', 'L’inspection du bâtiment, la confirmation du prêt et les autres conditions sont complétées.'],
      ['Notaire et remise des clés', 'Vous signez chez le notaire, payez les droits de mutation (« taxe de bienvenue ») et recevez vos clés.'],
    ])}
    <h2>${E ? 'Common questions' : 'Questions fréquentes'}</h2>
    ${faq(E ? [
      ['Do I need a mortgage pre-approval first?', 'It is strongly recommended. It confirms your budget and shows sellers you are serious.'],
      ['Is there a cost to work with a buyer’s broker?', 'Let’s discuss this during our first meeting so everything is clear from the start.'],
    ] : [
      ['Dois-je obtenir une préapprobation hypothécaire d’abord ?', 'C’est fortement recommandé. Elle confirme votre budget et montre aux vendeurs que vous êtes sérieux.'],
      ['Y a-t-il des frais pour travailler avec une courtière acheteur ?', 'Nous en discuterons lors de notre première rencontre afin que tout soit clair dès le départ.'],
    ])}
  </div>
</section>
${ctaBand(l, E ? 'Ready to start your search?' : 'Prêt à commencer votre recherche ?', E ? 'Tell me what you are looking for and I will take it from there.' : 'Dites-moi ce que vous cherchez et je m’occupe du reste.', t('contactBtn', l), 'contact')}`;
  },

  sell(l) {
    const E = l === 'en';
    return `${pageHero(l, E ? 'Sell your property in Laval' : 'Vendre votre propriété à Laval', E ? 'Accurate pricing, strong marketing and clear guidance, so you sell with confidence.' : 'Un juste prix, une mise en marché solide et un accompagnement clair pour vendre en toute confiance.', E ? 'Sell' : 'Vendre', 'blacksuit')}
<section class="section">
  <div class="wrap prose">
    <p>${E ? 'A successful sale starts with the right price and a plan. I analyse your neighbourhood and recent sales, prepare your property for the market and manage offers so you get the best result.' : 'Une vente réussie commence par le bon prix et un plan. J’analyse votre quartier et les ventes récentes, je prépare votre propriété pour le marché et je gère les offres afin que vous obteniez le meilleur résultat.'}</p>
    <h2>${E ? 'How selling works' : 'Le processus de vente'}</h2>
    ${steps(E ? [
      ['Evaluation', 'A market-based estimate of your property’s value, free and with no obligation.'],
      ['Preparation and pricing', 'Advice on presentation and a pricing strategy that fits your goals and timeline.'],
      ['Marketing', 'Professional photos, a detailed listing and exposure to buyers and other brokers.'],
      ['Visits and offers', 'I coordinate showings, review every offer with you and negotiate on your behalf.'],
      ['Closing', 'We finalise conditions and you sign at the notary’s office.'],
    ] : [
      ['Évaluation', 'Une estimation de la valeur de votre propriété basée sur le marché, gratuite et sans engagement.'],
      ['Préparation et prix', 'Des conseils de présentation et une stratégie de prix adaptée à vos objectifs et à votre échéancier.'],
      ['Mise en marché', 'Photos professionnelles, fiche détaillée et visibilité auprès des acheteurs et des autres courtiers.'],
      ['Visites et offres', 'Je coordonne les visites, j’analyse chaque offre avec vous et je négocie en votre nom.'],
      ['Clôture', 'Nous finalisons les conditions et vous signez chez le notaire.'],
    ])}
    <h2>${E ? 'Common questions' : 'Questions fréquentes'}</h2>
    ${faq(E ? [
      ['How do I know what my property is worth?', 'Start with a free evaluation. I compare recent sales and current listings near you.'],
      ['When is the best time to sell?', 'It depends on your goals and your local market. We can review timing together.'],
    ] : [
      ['Comment connaître la valeur de ma propriété ?', 'Commencez par une évaluation gratuite. Je compare les ventes récentes et les inscriptions actuelles près de chez vous.'],
      ['Quel est le meilleur moment pour vendre ?', 'Cela dépend de vos objectifs et du marché local. Nous pouvons évaluer le moment ensemble.'],
    ])}
  </div>
</section>
${ctaBand(l, E ? 'Curious what your property is worth?' : 'Curieux de connaître la valeur de votre propriété ?', E ? 'Request a free evaluation. It takes two minutes.' : 'Demandez une évaluation gratuite. Cela prend deux minutes.', E ? 'Request an evaluation' : 'Demander une évaluation', 'valuation')}`;
  },

  commercial(l) {
    const E = l === 'en';
    return `${pageHero(l, E ? 'Commercial real estate in Laval' : 'Immobilier commercial à Laval', E ? 'Support for business owners and investors who want to buy, sell or lease.' : 'Soutien aux propriétaires d’entreprise et aux investisseurs qui souhaitent acheter, vendre ou louer.', 'Commercial', 'green-sofa')}
<section class="section">
  <div class="wrap prose">
    <p>${E ? 'Whether you are moving your business, expanding or building an investment portfolio, you need a broker who understands both the numbers and the neighbourhood.' : 'Que vous déménagiez votre entreprise, que vous vous agrandissiez ou que vous bâtissiez un portefeuille de placements, vous avez besoin d’une courtière qui comprend à la fois les chiffres et le quartier.'}</p>
    <h2>${E ? 'What I help with' : 'Mes services'}</h2>
    <ul class="ticks">
      <li>${E ? 'Buying or selling retail, office and industrial space' : 'Achat ou vente de locaux commerciaux, de bureaux et industriels'}</li>
      <li>${E ? 'Leasing space for your business' : 'Location de locaux pour votre entreprise'}</li>
      <li>${E ? 'Income properties and investment opportunities' : 'Immeubles à revenus et occasions de placement'}</li>
      <li>${E ? 'Market analysis and negotiation of terms' : 'Analyse du marché et négociation des conditions'}</li>
    </ul>
    <h2>${E ? 'A clear approach' : 'Une approche claire'}</h2>
    ${steps(E ? [
      ['Understand your project', 'Goals, budget, location needs and timeline.'],
      ['Search or marketing', 'Targeted search for buyers and tenants, or professional marketing of your property.'],
      ['Analysis and negotiation', 'We review the numbers and negotiate the best terms.'],
      ['Closing', 'I coordinate with notaries, lenders and other professionals through to completion.'],
    ] : [
      ['Comprendre votre projet', 'Objectifs, budget, besoins d’emplacement et échéancier.'],
      ['Recherche ou mise en marché', 'Recherche ciblée pour acheteurs et locataires, ou mise en marché professionnelle de votre propriété.'],
      ['Analyse et négociation', 'Nous examinons les chiffres et négocions les meilleures conditions.'],
      ['Clôture', 'Je coordonne avec les notaires, les prêteurs et les autres professionnels jusqu’à la conclusion.'],
    ])}
  </div>
</section>
${ctaBand(l, E ? 'Talk about your commercial project' : 'Parlons de votre projet commercial', E ? 'Tell me what you need and I will follow up quickly.' : 'Dites-moi ce dont vous avez besoin et je vous répondrai rapidement.', t('contactBtn', l), 'contact')}`;
  },

  valuation(l) {
    const E = l === 'en';
    return `${pageHero(l, E ? 'Free property evaluation' : 'Évaluation gratuite de propriété', E ? 'Do you know the value of your property? Get a free, no-obligation estimate.' : 'Connaissez-vous la valeur de votre propriété ? Obtenez une estimation gratuite et sans engagement.', E ? 'Evaluation' : 'Évaluation', 'on-phone')}
<section class="section">
  <div class="wrap contact">
    <div class="prose">
      <h2>${E ? 'How it works' : 'Comment ça fonctionne'}</h2>
      <p>${E ? 'Send me a few details about your property. I compare recent sales and current listings in your neighbourhood, then contact you with an estimate and next steps.' : 'Envoyez-moi quelques détails sur votre propriété. Je compare les ventes récentes et les inscriptions actuelles de votre quartier, puis je vous contacte avec une estimation et les prochaines étapes.'}</p>
      <ul class="ticks">
        <li>${E ? 'Free and with no obligation' : 'Gratuit et sans engagement'}</li>
        <li>${E ? 'Based on your neighbourhood and recent market activity' : 'Basée sur votre quartier et l’activité récente du marché'}</li>
        <li>${E ? 'Reply in English, French or Tamil' : 'Réponse en français, en anglais ou en tamoul'}</li>
      </ul>
    </div>
    ${form(l, 'valuation')}
  </div>
</section>`;
  },

  contact(l) {
    const E = l === 'en';
    return `${pageHero(l, E ? 'Contact me' : 'Me contacter', E ? 'Let’s talk about your project. I usually reply quickly.' : 'Parlons de votre projet. Je réponds habituellement rapidement.', 'Contact')}
<section class="section">
  <div class="wrap contact">
    <div class="contact-info">
      <h2>${E ? 'Get in touch' : 'Me joindre'}</h2>
      ${contactInfo(l)}
      <h3 class="social-h">${E ? 'Social networks' : 'Réseaux sociaux'}</h3>
      <p class="social-note">${E ? 'Follow me and see what clients say.' : 'Suivez-moi et lisez ce que disent mes clients.'}</p>
      <div class="social">${socialLinks(l)}</div>
      <div class="contact-img">${pic('on-phone', l, { sizes: '(max-width: 860px) 80vw, 320px' })}</div>
    </div>
    ${form(l, 'contact')}
  </div>
</section>`;
  },
};

/* ---------- write files ---------- */

const write = (rel, content) => {
  const p = join(ROOT, rel);
  mkdirSync(dirname(p), { recursive: true });
  writeFileSync(p, content);
};

for (const l of LANGS) rmSync(join(ROOT, l), { recursive: true, force: true });

for (const l of LANGS) {
  for (const id of Object.keys(PAGES)) {
    const m = META[id];
    const html = head(l, id, m.title[l], m.desc[l]) + header(l, id) + '<main>\n' + BODY[id](l) + '\n</main>\n' + footer(l);
    write(`${l}${url(l, id).slice(l.length + 1)}index.html`, html);
  }
}

// root: language chooser (x-default)
write('index.html', `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Gevitha Kunaratnam | Real Estate Broker in Laval · Courtière immobilière à Laval</title>
<meta name="description" content="Gevitha Kunaratnam, real estate broker at RE/MAX 2000 in Laval. Courtière immobilière à Laval. English · Français.">
<link rel="canonical" href="${SITE}/">
<link rel="alternate" hreflang="en" href="${SITE}/en/">
<link rel="alternate" hreflang="fr" href="${SITE}/fr/">
<link rel="alternate" hreflang="x-default" href="${SITE}/">
<meta name="theme-color" content="#0b1220">
<link rel="stylesheet" href="/style.css">
<script>
(function(){try{
  var s=localStorage.getItem('lang');
  var l=s||((navigator.language||'').slice(0,2)==='fr'?'fr':'en');
  if(l!=='fr'&&l!=='en')l='en';
  location.replace('/'+l+'/');
}catch(e){}})();
</script>
</head>
<body class="chooser">
<main class="choose">
  <div>
    <h1>Gevitha <span>Kunaratnam</span></h1>
    <p>Real Estate Broker · Courtière immobilière<br>RE/MAX 2000 · Laval</p>
    <p class="cta center-cta"><a class="btn" href="/en/" hreflang="en">English</a> <a class="btn btn-ghost" href="/fr/" hreflang="fr">Français</a></p>
  </div>
</main>
</body>
</html>
`);

write('404.html', `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Page not found · Page introuvable</title>
<meta name="robots" content="noindex">
<link rel="stylesheet" href="/style.css">
</head>
<body class="chooser">
<main class="choose">
  <div>
    <h1>404</h1>
    <p>Page not found · Page introuvable</p>
    <p class="cta center-cta"><a class="btn" href="/en/">Home</a> <a class="btn btn-ghost" href="/fr/">Accueil</a></p>
  </div>
</main>
</body>
</html>
`);

const urls = [];
for (const id of Object.keys(PAGES)) {
  urls.push(`  <url>
    <loc>${SITE}${url('en', id)}</loc>
    <lastmod>${TODAY}</lastmod>
    <xhtml:link rel="alternate" hreflang="en" href="${SITE}${url('en', id)}"/>
    <xhtml:link rel="alternate" hreflang="fr" href="${SITE}${url('fr', id)}"/>
  </url>`);
  urls.push(`  <url>
    <loc>${SITE}${url('fr', id)}</loc>
    <lastmod>${TODAY}</lastmod>
    <xhtml:link rel="alternate" hreflang="en" href="${SITE}${url('en', id)}"/>
    <xhtml:link rel="alternate" hreflang="fr" href="${SITE}${url('fr', id)}"/>
  </url>`);
}
write('sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${urls.join('\n')}
</urlset>
`);
write('robots.txt', `User-agent: *\nAllow: /\n\nSitemap: ${SITE}/sitemap.xml\n`);

console.log('Built', LANGS.length * Object.keys(PAGES).length, 'pages + root, 404, sitemap, robots');

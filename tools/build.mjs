// Generates the bilingual multi-page site into the repo root.
// Run: node tools/build.mjs
import { mkdirSync, writeFileSync, rmSync, readFileSync, readdirSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { marked } from './vendor/marked.esm.js';
import yaml from './vendor/js-yaml.mjs';

// `node tools/build.mjs --drafts` also builds unpublished posts (local preview only, never commit that output)
const INCLUDE_DRAFTS = process.argv.includes('--drafts');

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
  testimonials: { slug: { en: 'testimonials', fr: 'temoignages' } },
  blog:       { slug: { en: 'blog', fr: 'blogue' } },
};

// Social links: paste the real page URLs here, then run `node tools/build.mjs`.
const SOCIAL = {
  facebook: 'https://www.facebook.com/gevitha.kunaratnam/',
  instagram: 'https://www.instagram.com/gevithakunaratnam/',
  linkedin: 'https://ca.linkedin.com/in/gevitha-kunaratnam-48060b24a',
  google: '',   // e.g. 'https://g.page/yourbusiness' (Google Business Profile). Empty = button hidden.
};
const SOCIAL_ORDER = ['facebook', 'instagram', 'linkedin', 'google'];
const SOCIAL_LABEL = {
  facebook: { en: 'Facebook', fr: 'Facebook' },
  instagram: { en: 'Instagram', fr: 'Instagram' },
  linkedin: { en: 'LinkedIn', fr: 'LinkedIn' },
  google: { en: 'Google', fr: 'Google' },
};
const ICON = {
  facebook: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>',
  google: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"/></svg>',
};
ICON.instagram = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z"/></svg>';
ICON.linkedin = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>';
const socialLinks = (l) => SOCIAL_ORDER.filter((k) => SOCIAL[k]).map((k) => {
  const label = SOCIAL_LABEL[k][l];
  return `<a class="social-link" href="${SOCIAL[k]}" target="_blank" rel="noopener noreferrer" aria-label="${label}" title="${label}">${ICON[k]}<span>${label}</span></a>`;
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
  ['testimonials', { en: 'Testimonials', fr: 'Témoignages' }],
  ['blog', { en: 'Blog', fr: 'Blogue' }],
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

function head(l, id, title, desc, opts = {}) {
  const self = opts.canonical || url(l, id);
  const alts = opts.alternates || { en: url('en', id), fr: url('fr', id) };
  const ogImage = opts.image || '/assets/photos/blacksuit-900.jpg';
  const ogType = opts.ogType || 'website';
  const ld = opts.ld || {
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
    sameAs: SOCIAL_ORDER.map((k) => SOCIAL[k]).filter(Boolean),
  };
  return `<!doctype html>
<html lang="${l}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${title}</title>
<meta name="description" content="${desc}">
<link rel="canonical" href="${SITE}${self}">
${Object.entries(alts).map(([k, p]) => `<link rel="alternate" hreflang="${k}" href="${SITE}${p}">`).join('\n')}
${alts.en && alts.fr ? `<link rel="alternate" hreflang="x-default" href="${SITE}/">` : ''}
<meta name="theme-color" content="#0b1220">
<link rel="alternate" type="application/rss+xml" title="${l === 'en' ? 'Blog' : 'Blogue'} · Gevitha Kunaratnam" href="/${l}/${BLOG_SLUG[l]}/feed.xml">
<meta property="og:type" content="${ogType}">
<meta property="og:site_name" content="Gevitha Kunaratnam">
<meta property="og:title" content="${title}">
<meta property="og:description" content="${desc}">
<meta property="og:url" content="${SITE}${self}">
<meta property="og:image" content="${SITE}${ogImage}">
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

function header(l, id, twinHref) {
  const other = l === 'en' ? 'fr' : 'en';
  const links = NAV.map(([p, label]) =>
    `<a href="${url(l, p)}"${p === id ? ' aria-current="page"' : ''}>${label[l]}</a>`).join('\n      ');
  return `<header class="nav" id="top">
  <div class="wrap nav-inner">
    <a href="${url(l, 'home')}" class="brand">Gevitha <span>Kunaratnam</span></a>
    <nav class="links" id="links" aria-label="Main">
      ${links}
      <a href="${url(l, 'contact')}" class="btn btn-sm"${id === 'contact' ? ' aria-current="page"' : ''}>${t('contactBtn', l)}</a>
      <a class="lang" href="${twinHref || url(other, id)}" hreflang="${other}" lang="${other}" data-lang="${other}" aria-label="${other === 'fr' ? 'Version française' : 'English version'}">${other.toUpperCase()}</a>
    </nav>
    <button class="burger" id="burger" aria-label="${t('menu', l)}" aria-expanded="false"><span></span><span></span><span></span></button>
  </div>
</header>
`;
}

function footer(l) {
  const foot = ['about', 'buy', 'sell', 'commercial', 'valuation', 'testimonials', 'blog', 'contact']
    .map((p) => {
      const nav = NAV.find((n) => n[0] === p);
      const label = nav ? nav[1][l] : p === 'testimonials' ? (l === 'en' ? 'Testimonials' : 'Témoignages') : t('contactBtn', l);
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

/* ---------- RE/MAX programs (home page) ---------- */

const PROGRAMS = [
  {
    logo: 'tranquilli-t',
    name: 'Tranquilli-T',
    href: { en: 'https://www.remax-quebec.com/en/tranquilli-t', fr: 'https://www.remax-quebec.com/fr/tranquilli-t' },
    title: { en: 'Peace of mind assured', fr: 'La tranquillité d’esprit assurée' },
    text: {
      en: 'A protection offered at no extra charge by participating RE/MAX brokers on eligible residential transactions, including legal assistance.',
      fr: 'Une protection offerte sans frais supplémentaires par les courtiers RE/MAX participants pour les transactions résidentielles admissibles, incluant l’assistance juridique.',
    },
  },
  {
    logo: 'integri-t',
    name: 'Intégri-T',
    href: { en: 'https://www.remax-quebec.com/en/integri-t', fr: 'https://www.remax-quebec.com/fr/integri-t' },
    title: { en: 'A key solution against latent defects', fr: 'Une solution clé contre les vices cachés' },
    text: {
      en: 'A guarantee offered with GBQ that protects buyers against hidden defects for three years after the deed of purchase. It must be taken before signing at the notary.',
      fr: 'Une garantie offerte avec GBQ qui protège l’acheteur contre les vices cachés pendant trois ans après l’acte d’achat. Elle doit être souscrite avant la signature chez le notaire.',
    },
  },
  {
    logo: 'discounts',
    name: { en: 'My RE/MAX Discounts', fr: 'Mes rabais RE/MAX' },
    href: { en: 'https://www.remax-quebec.com/en/my-remax-discounts', fr: 'https://www.remax-quebec.com/fr/mes-rabais-remax' },
    title: { en: 'Exclusive discounts for RE/MAX clients', fr: 'Des rabais exclusifs pour les clients RE/MAX' },
    text: {
      en: 'With Mes rabais RE/MAX, save money with exclusive discounts from partner merchants.',
      fr: 'Avec Mes rabais RE/MAX, économisez grâce à des rabais exclusifs offerts par des marchands partenaires.',
    },
  },
];

function programs(l) {
  const E = l === 'en';
  const cards = PROGRAMS.map((p) => {
    const name = typeof p.name === 'string' ? p.name : p.name[l];
    return `<article class="program">
        <div class="program-logo"><img src="/assets/logos/${p.logo}-${l}.svg" alt="${name}" loading="lazy" decoding="async"></div>
        <div class="program-body">
          <h3>${p.title[l]}</h3>
          <p>${p.text[l]}</p>
          <a class="btn" href="${p.href[l]}" target="_blank" rel="noopener noreferrer">${t('learn', l)}<span class="sr-only"> ${name}</span></a>
        </div>
      </article>`;
  }).join('\n      ');
  return `<section class="section alt programs" id="programs">
  <div class="wrap programs-inner">
    <div class="programs-intro">
      <h2>${E ? 'My RE/MAX programs and protections' : 'Mes programmes et protections RE/MAX'}</h2>
      <p>${E ? 'Buying or selling a property is a pivotal moment in your life. As your broker at RE/MAX 2000, I can offer programs designed to bring extra protection and peace of mind to your transaction.' : 'Acheter ou vendre une propriété est un moment décisif de votre vie. Comme courtière chez RE/MAX 2000, je peux vous offrir des programmes conçus pour ajouter protection et tranquillité d’esprit à votre transaction.'}</p>
      <p class="small-note">${E ? 'Eligibility and conditions apply. See the official RE/MAX Québec page of each program for details.' : 'Des conditions d’admissibilité s’appliquent. Consultez la page officielle RE/MAX Québec de chaque programme pour les détails.'}</p>
      <a href="${url(l, 'contact')}" class="btn">${t('contactBtn', l)}</a>
    </div>
    <div class="program-list">
      ${cards}
    </div>
  </div>
</section>`;
}

/* ---------- bio (both versions are Gevitha's own texts, one per language) ---------- */

const BIO = {
  fr: [
    "Depuis toujours, j’ai été animée par le désir d’aider les gens, de bâtir des relations humaines authentiques et de contribuer positivement à leur qualité de vie. C’est cette passion qui m’a d’abord menée vers le domaine de la santé, où j’ai exercé pendant 10 ans comme hygiéniste dentaire.",
    "Cette expérience m’a permis de développer des qualités qui me définissent encore aujourd’hui : l’écoute, l’empathie, la rigueur, le souci du détail et, surtout, l’importance de bâtir des relations de confiance durables. Au fil des années, j’ai eu le privilège de fidéliser une clientèle qui revenait spécialement pour la qualité de mes services et mon approche personnalisée.",
    "Aujourd’hui, en tant que courtière immobilière résidentielle et commerciale chez RE/MAX 2000, je poursuis cette même mission, mais d’une manière différente : accompagner les gens dans leurs projets de vie et les aider à prendre des décisions importantes pour leur avenir et leur patrimoine.",
    "Je combine mon approche humaine avec une vision stratégique de l’immobilier, en accordant une grande importance à l’analyse du marché, à la négociation, au marketing et à la protection des intérêts de mes clients. Je crois qu’une transaction réussie repose autant sur une bonne stratégie que sur une relation de confiance et une communication transparente.",
    "Ma philosophie est simple : chaque projet immobilier mérite la même attention, la même rigueur et le même engagement que s’il s’agissait du mien ou de celui d’un membre de ma famille. Mes conseils et mes recommandations sont toujours guidés par la sincérité, l’honnêteté et le désir de vous aider à faire les meilleurs choix possibles.",
    "Passionnée par l’innovation, j’intègre également les nouvelles technologies et les outils d’intelligence artificielle à mon travail afin d’explorer des stratégies créatives, de mettre les propriétés en valeur et d’offrir un service moderne et personnalisé.",
    "Pour moi, l’immobilier va bien au-delà de l’achat ou de la vente d’une propriété. C’est avant tout une relation humaine, une responsabilité professionnelle et un engagement sincère envers la réussite de vos projets.",
  ],
  en: [
    "Helping people has always been a big part of who I am. I genuinely enjoy connecting with people, building relationships, and knowing that I can make a positive difference in their lives.",
    "Before starting my career in real estate, I spent 10 years working as a dental hygienist. During those years, I learned that providing great service goes beyond simply doing your job well. It’s about listening, understanding people’s needs, paying attention to the little details, and most importantly, earning their trust. I was fortunate to build lasting relationships with clients who continued coming back because they felt comfortable, valued, and well taken care of.",
    "Today, as a Residential and Commercial Real Estate Broker with RE/MAX 2000, I bring that same passion and dedication to real estate.",
    "Whether you’re buying your first home, selling a property, or making an investment, I understand that these are important decisions, both financially and personally. My goal is to make sure you feel informed, confident, and supported every step of the way.",
    "I believe in being honest, straightforward, and always putting my clients’ best interests first. I take the time to understand what matters most to you, and I combine that personal approach with market knowledge, strong negotiation skills, and thoughtful marketing strategies to help you achieve the best possible outcome.",
    "One thing I always believe in is treating my clients the way I would want my own family to be treated. If I wouldn’t recommend something to someone close to me, I wouldn’t recommend it to you either. Your trust means a lot to me, and I never take that responsibility lightly.",
    "I’m also someone who loves learning, exploring new ideas, and finding better ways to do things. That’s why I embrace technology, including artificial intelligence, to bring fresh ideas, creative marketing, and innovative solutions to my real estate business.",
    "At the end of the day, real estate is not just about properties or transactions. It’s about people, their goals, their families, and their future.",
    "And being part of that journey is what makes my work truly meaningful to me.",
  ],
};
// which paragraph is shown as the highlighted quote, and which two appear on the home page
const BIO_QUOTE = { fr: 4, en: 5 };
const BIO_HOME = { fr: [0, 6], en: [0, 7] };

/* ---------- testimonials (content comes from data/testimonials.json at runtime) ---------- */

function testimonialStrip(l) {
  const E = l === 'en';
  return `<section class="section" id="clients-say" data-testimonials="featured" data-max="3" hidden>
  <div class="wrap">
    <p class="eyebrow dark center">${E ? 'Client testimonials' : 'Témoignages de clients'}</p>
    <h2 class="center">${E ? 'What clients say' : 'Ce que disent mes clients'}</h2>
    <div class="testimonial-grid" data-testimonial-list></div>
    <p class="center"><a class="textlink" href="${url(l, 'testimonials')}">${E ? 'Read all testimonials' : 'Lire tous les témoignages'} →</a></p>
  </div>
</section>`;
}

/* ---------- blog (Markdown files in content/blog/<lang>/, edited with Pages CMS) ---------- */

const BLOG_SLUG = { en: 'blog', fr: 'blogue' };
const blogPath = (l, slug) => `/${l}/${BLOG_SLUG[l]}/${slug}/`;
const esc = (s) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const fmtDate = (iso, l) =>
  new Date(iso + 'T12:00:00Z').toLocaleDateString(l === 'fr' ? 'fr-CA' : 'en-CA', { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' });
const assetPath = (p) => (!p ? '' : /^(https?:)?\/\//.test(p) || p.startsWith('/') ? p : '/' + p);

marked.use({
  gfm: true,
  renderer: {
    link({ href, title, tokens }) {
      const external = /^https?:\/\//i.test(href) && !href.startsWith(SITE);
      return `<a href="${esc(href)}"${title ? ` title="${esc(title)}"` : ''}${external ? ' target="_blank" rel="noopener noreferrer"' : ''}>${this.parser.parseInline(tokens)}</a>`;
    },
    image({ href, title, text }) {
      return `<img src="${esc(href)}" alt="${esc(text)}"${title ? ` title="${esc(title)}"` : ''} loading="lazy" decoding="async">`;
    },
    heading({ tokens, depth }) {
      const d = Math.min(Math.max(depth, 2), 4); // the page title is the only h1
      return `<h${d}>${this.parser.parseInline(tokens)}</h${d}>\n`;
    },
  },
});

function parsePost(l, file) {
  const raw = readFileSync(join(ROOT, 'content', 'blog', l, file), 'utf8').replace(/^﻿/, '');
  const m = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  if (!m) { console.warn(`blog: skipped ${l}/${file} (no front matter)`); return null; }
  const fm = yaml.load(m[1]) || {};
  const date = fm.date instanceof Date ? fm.date.toISOString().slice(0, 10) : String(fm.date || '').slice(0, 10);
  if (!fm.title || !/^\d{4}-\d{2}-\d{2}$/.test(date)) { console.warn(`blog: skipped ${l}/${file} (needs a title and a date)`); return null; }
  const published = fm.published === true;
  if (!published && !INCLUDE_DRAFTS) return null;
  const body = m[2].trim();
  return {
    lang: l,
    slug: file.replace(/\.md$/, ''),
    title: String(fm.title),
    date,
    // the summary is plain text: drop Markdown marks (*, `, [text](url)) an author may have typed
    summary: String(fm.summary || '').replace(/\[([^\]]+)\]\([^)]*\)/g, '$1').replace(/[*`]/g, '').replace(/\s+/g, ' ').trim(),
    image: assetPath(fm.image ? String(fm.image) : ''),
    imageAlt: String(fm.image_alt || ''),
    pair: fm.pair ? String(fm.pair).trim().toLowerCase() : '', // same word in the EN and FR post links them as translations
    published,
    html: marked.parse(body),
    minutes: Math.max(1, Math.round(body.split(/\s+/).filter(Boolean).length / 200)),
  };
}

const POSTS = { en: [], fr: [] };
for (const l of LANGS) {
  const dir = join(ROOT, 'content', 'blog', l);
  if (!existsSync(dir)) continue;
  for (const f of readdirSync(dir).filter((x) => x.endsWith('.md'))) {
    const p = parsePost(l, f);
    if (p) POSTS[l].push(p);
  }
  POSTS[l].sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));
}

// the same article in the other language, if both posts share the same "pair" word
const twinOf = (p) => {
  if (!p.pair) return undefined;
  return POSTS[p.lang === 'en' ? 'fr' : 'en'].find((x) => x.pair === p.pair);
};

function postCard(p, l) {
  const E = l === 'en';
  const href = blogPath(l, p.slug);
  return `<article class="post-card">
      ${p.image ? `<a class="post-card-img" href="${href}" tabindex="-1" aria-hidden="true"><img src="${esc(p.image)}" alt="" loading="lazy" decoding="async"></a>` : ''}
      <div class="post-card-body">
        <p class="post-meta">${fmtDate(p.date, l)}${p.published ? '' : ` · <span class="draft-tag">${E ? 'Draft preview' : 'Aperçu du brouillon'}</span>`}</p>
        <h3><a href="${href}">${esc(p.title)}</a></h3>
        ${p.summary ? `<p>${esc(p.summary)}</p>` : ''}
        <a class="card-link" href="${href}">${E ? 'Read more' : 'Lire la suite'} →</a>
      </div>
    </article>`;
}

function blogStrip(l) {
  const list = POSTS[l].slice(0, 3);
  if (!list.length) return '';
  const E = l === 'en';
  return `<section class="section alt" id="blog-latest">
  <div class="wrap">
    <p class="eyebrow dark center">${E ? 'Blog' : 'Blogue'}</p>
    <h2 class="center">${E ? 'Latest articles' : 'Derniers articles'}</h2>
    <div class="post-grid">
      ${list.map((p) => postCard(p, l)).join('\n      ')}
    </div>
    <p class="center"><a class="textlink" href="${url(l, 'blog')}">${E ? 'All articles' : 'Tous les articles'} →</a></p>
  </div>
</section>`;
}

function buildPost(p) {
  const l = p.lang, E = l === 'en', o = E ? 'fr' : 'en';
  const self = blogPath(l, p.slug);
  const tw = twinOf(p);
  const alternates = { [l]: self };
  if (tw) alternates[o] = blogPath(o, tw.slug);
  const image = p.image || '/assets/photos/blacksuit-900.jpg';
  const abs = (u) => (/^https?:/.test(u) ? u : SITE + u);
  const ld = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: p.title,
    description: p.summary || p.title,
    datePublished: p.date,
    dateModified: p.date,
    inLanguage: l,
    mainEntityOfPage: SITE + self,
    image: abs(image),
    author: { '@type': 'Person', name: 'Gevitha Kunaratnam', url: SITE + '/' },
  };
  const blogLabel = E ? 'Blog' : 'Blogue';
  const body = `<section class="page-hero">
  <div class="wrap">
    <div>
      <p class="crumbs"><a href="${url(l, 'home')}">${t('home', l)}</a> / <a href="${url(l, 'blog')}">${blogLabel}</a></p>
      <h1>${esc(p.title)}</h1>
      <p class="lead">${fmtDate(p.date, l)} · ${p.minutes} ${E ? 'min read' : 'min de lecture'}</p>
    </div>
  </div>
</section>
<section class="section">
  <div class="wrap article">
    ${p.published ? '' : `<p class="draft-banner">${E ? 'Draft preview. This article is not published.' : 'Aperçu du brouillon. Cet article n’est pas publié.'}</p>`}
    ${p.image ? `<figure class="cover"><img src="${esc(p.image)}" alt="${esc(p.imageAlt)}" decoding="async"></figure>` : ''}
    <div class="prose">
      ${p.html}
    </div>
    <p class="post-back"><a class="textlink" href="${url(l, 'blog')}">← ${E ? 'All articles' : 'Tous les articles'}</a></p>
  </div>
</section>
${ctaBand(l, E ? 'Have a question about your project?' : 'Une question sur votre projet ?', E ? 'Tell me what you need and I will follow up quickly.' : 'Dites-moi ce dont vous avez besoin et je vous répondrai rapidement.', t('contactBtn', l), 'contact')}`;
  const title = `${esc(p.title)} | Gevitha Kunaratnam`;
  const html = head(l, 'blog', title, esc(p.summary || p.title), { canonical: self, alternates, image, ogType: 'article', ld })
    + header(l, 'blog', tw ? blogPath(o, tw.slug) : url(o, 'blog')) + '<main>\n' + body + '\n</main>\n' + footer(l);
  return { path: `${l}/${BLOG_SLUG[l]}/${p.slug}/index.html`, html };
}

/* ---------- page bodies ---------- */

const META = {
  home: {
    title: { en: 'Gevitha Kunaratnam | Real Estate Broker in Laval | RE/MAX 2000', fr: 'Gevitha Kunaratnam | Courtière immobilière à Laval | RE/MAX 2000' },
    desc: { en: 'Gevitha Kunaratnam, residential and commercial real estate broker at RE/MAX 2000 in Laval (Chomedey). Service in English, French and Tamil.', fr: 'Gevitha Kunaratnam, courtière immobilière résidentielle et commerciale chez RE/MAX 2000 à Laval (Chomedey). Service en français, anglais et tamoul.' },
  },
  about: {
    title: { en: 'About Gevitha Kunaratnam | Real Estate Broker, Laval', fr: 'À propos de Gevitha Kunaratnam | Courtière immobilière, Laval' },
    desc: { en: 'Meet Gevitha Kunaratnam: a former dental hygienist turned residential and commercial real estate broker at RE/MAX 2000. Service in English, French and Tamil.', fr: 'Faites connaissance avec Gevitha Kunaratnam : ancienne hygiéniste dentaire devenue courtière immobilière résidentielle et commerciale chez RE/MAX 2000. Service en français, anglais et tamoul.' },
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
  testimonials: {
    title: { en: 'Client Testimonials | Gevitha Kunaratnam, Real Estate Broker', fr: 'Témoignages de clients | Gevitha Kunaratnam, courtière immobilière' },
    desc: { en: 'Read what buyers and sellers say about working with real estate broker Gevitha Kunaratnam, RE/MAX 2000.', fr: 'Lisez ce que disent acheteurs et vendeurs au sujet de leur expérience avec la courtière immobilière Gevitha Kunaratnam, RE/MAX 2000.' },
  },
  blog: {
    title: { en: 'Blog | Gevitha Kunaratnam, Real Estate Broker', fr: 'Blogue | Gevitha Kunaratnam, courtière immobilière' },
    desc: { en: 'Articles and advice on buying, selling and investing in real estate, by broker Gevitha Kunaratnam.', fr: 'Articles et conseils pour acheter, vendre et investir en immobilier, par la courtière Gevitha Kunaratnam.' },
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
      <p class="eyebrow">${E ? 'Residential &amp; Commercial Real Estate Broker' : 'Courtière immobilière résidentielle et commerciale'}</p>
      <h1>Gevitha<br>Kunaratnam</h1>
      <p class="sub">${E ? 'Honest advice. A strategic mindset. The same care I’d give my own family.' : 'Des conseils honnêtes. Une vision stratégique. Le même soin que j’offrirais à ma propre famille.'}</p>
      <div class="cta">
        <a href="${url(l, 'contact')}" class="btn">${t('appt', l)}</a>
        <a href="tel:+15145702152" class="btn btn-ghost">514 570-2152</a>
      </div>
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
      <p>${BIO[l][BIO_HOME[l][0]]}</p>
      <p>${BIO[l][BIO_HOME[l][1]]}</p>
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
${testimonialStrip(l)}
${blogStrip(l)}
${ctaBand(l, E ? 'Do you know the value of your property?' : 'Connaissez-vous la valeur de votre propriété ?', E ? 'Get a free, no-obligation estimate based on your neighbourhood and recent market activity.' : 'Obtenez une estimation gratuite et sans engagement, basée sur votre quartier et l’activité récente du marché.', E ? 'Request an evaluation' : 'Demander une évaluation', 'valuation')}

${programs(l)}`;
  },

  about(l) {
    const E = l === 'en';
    return `${pageHero(l, E ? 'About Gevitha Kunaratnam' : 'À propos de Gevitha Kunaratnam', E ? 'From dental hygienist to real estate broker: a human approach with a strategic vision.' : 'De l’hygiène dentaire à l’immobilier : une approche humaine, une vision stratégique.', E ? 'About' : 'À propos')}
<section class="section">
  <div class="wrap about-page">
    ${pic('green-sofa', l, { cls: 'about-photo', sizes: '(max-width: 860px) 80vw, 380px' })}
    <div class="prose">
      <h2>${E ? 'About me' : 'À propos de moi'}</h2>
      ${BIO[l].map((p, i) => `<p${i === BIO_QUOTE[l] ? ' class="pullquote"' : ''}>${p}</p>`).join('\n      ')}
      <p class="langs-line">${t('langs', l)} <strong>${t('langList', l)}</strong></p>
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
      <p class="social-note">${E ? 'Follow me on social media.' : 'Suivez-moi sur les réseaux sociaux.'}</p>
      <div class="social">${socialLinks(l)}</div>
      <div class="contact-img">${pic('on-phone', l, { sizes: '(max-width: 860px) 80vw, 320px' })}</div>
    </div>
    ${form(l, 'contact')}
  </div>
</section>`;
  },

  testimonials(l) {
    const E = l === 'en';
    return `${pageHero(l, E ? 'Client testimonials' : 'Témoignages de clients', E ? 'What buyers and sellers say about working together.' : 'Ce que disent acheteurs et vendeurs au sujet de notre collaboration.', E ? 'Testimonials' : 'Témoignages')}
<section class="section">
  <div class="wrap">
    <div id="testimonials-page" data-testimonials="all">
      <div class="testimonial-grid" data-testimonial-list></div>
      <p class="testimonial-empty" data-testimonial-empty hidden>${E ? 'Client testimonials will appear here soon.' : 'Les témoignages de clients apparaîtront bientôt ici.'}</p>
      <noscript><p class="testimonial-empty">${E ? 'Please enable JavaScript to see the testimonials.' : 'Veuillez activer JavaScript pour voir les témoignages.'}</p></noscript>
    </div>
  </div>
</section>
${ctaBand(l, E ? 'Ready to start your own story?' : 'Prêt à écrire votre propre histoire ?', E ? 'Tell me about your project and I will take it from there.' : 'Parlez-moi de votre projet et je m’occupe du reste.', t('contactBtn', l), 'contact')}`;
  },

  blog(l) {
    const E = l === 'en';
    const list = POSTS[l];
    return `${pageHero(l, E ? 'Blog' : 'Blogue', E ? 'Advice and news on buying, selling and investing in real estate.' : 'Conseils et actualités pour acheter, vendre et investir en immobilier.', E ? 'Blog' : 'Blogue')}
<section class="section">
  <div class="wrap">
    ${list.length
      ? `<div class="post-grid">\n      ${list.map((p) => postCard(p, l)).join('\n      ')}\n    </div>`
      : `<p class="testimonial-empty">${E ? 'Articles are coming soon.' : 'Les articles arrivent bientôt.'}</p>`}
    <div class="follow">
      <h2>${E ? 'Follow the blog' : 'Suivre le blogue'}</h2>
      <p>${E ? 'Get new articles as soon as they are published.' : 'Recevez les nouveaux articles dès leur publication.'}</p>
      <div class="social">
        <a class="social-link" href="${url(l, 'blog')}feed.xml" aria-label="RSS"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 11a9 9 0 0 1 9 9M4 4a16 16 0 0 1 16 16" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/><circle cx="5.5" cy="18.5" r="2" /></svg><span>RSS</span></a>
        ${socialLinks(l)}
      </div>
    </div>
  </div>
</section>
${ctaBand(l, E ? 'Have a question about your project?' : 'Une question sur votre projet ?', E ? 'Tell me what you need and I will follow up quickly.' : 'Dites-moi ce dont vous avez besoin et je vous répondrai rapidement.', t('contactBtn', l), 'contact')}`;
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

for (const l of LANGS) {
  for (const p of POSTS[l]) {
    const b = buildPost(p);
    write(b.path, b.html);
  }
}

// RSS feeds (published posts only, never drafts)
const xmlEsc = (s) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
for (const l of LANGS) {
  const items = POSTS[l].filter((p) => p.published).slice(0, 20).map((p) => `    <item>
      <title>${xmlEsc(p.title)}</title>
      <link>${SITE}${blogPath(l, p.slug)}</link>
      <guid isPermaLink="true">${SITE}${blogPath(l, p.slug)}</guid>
      <pubDate>${new Date(p.date + 'T12:00:00Z').toUTCString()}</pubDate>
      <description>${xmlEsc(p.summary || p.title)}</description>
    </item>`).join('\n');
  write(`${l}/${BLOG_SLUG[l]}/feed.xml`, `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>${l === 'en' ? 'Blog' : 'Blogue'} · Gevitha Kunaratnam</title>
    <link>${SITE}${url(l, 'blog')}</link>
    <description>${xmlEsc(META.blog.desc[l])}</description>
    <language>${l === 'fr' ? 'fr-ca' : 'en-ca'}</language>
${items}
  </channel>
</rss>
`);
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
for (const l of LANGS) {
  for (const p of POSTS[l]) {
    if (!p.published) continue; // drafts never go in the sitemap
    const tw = twinOf(p);
    const o = l === 'en' ? 'fr' : 'en';
    const alt = [`    <xhtml:link rel="alternate" hreflang="${l}" href="${SITE}${blogPath(l, p.slug)}"/>`];
    if (tw && tw.published) alt.push(`    <xhtml:link rel="alternate" hreflang="${o}" href="${SITE}${blogPath(o, tw.slug)}"/>`);
    urls.push(`  <url>
    <loc>${SITE}${blogPath(l, p.slug)}</loc>
    <lastmod>${p.date}</lastmod>
${alt.join('\n')}
  </url>`);
  }
}
write('sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${urls.join('\n')}
</urlset>
`);
write('robots.txt', `User-agent: *\nAllow: /\n\nSitemap: ${SITE}/sitemap.xml\n`);

const nPosts = LANGS.reduce((n, l) => n + POSTS[l].length, 0);
console.log('Built', LANGS.length * Object.keys(PAGES).length, 'pages +', nPosts, 'blog posts' + (INCLUDE_DRAFTS ? ' (drafts included)' : '') + ', root, 404, sitemap, robots');

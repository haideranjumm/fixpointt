// Builds dist/: German page (/) and English page (/en/), pre-rendered, with SEO tags, sitemap and robots.txt.
const fs = require('fs'), path = require('path');
const { JSDOM } = require('jsdom');
const p = (...a) => path.join(__dirname, ...a);
const need = ['content.json', 'src/head.html', 'src/template.html', 'src/runtime.js', 'src/content.js', 'src/defaults.json', 'public/admin/index.html'];
const missing = need.filter((f) => !fs.existsSync(p(f)));
if (missing.length) { console.error('Missing files: ' + missing.join(', ') + '. Upload them to the repository, keeping the folder names.'); process.exit(1); }
const r = (f) => fs.readFileSync(p(f), 'utf8');
const fill = (t, d) => { for (const [k, v] of Object.entries(d)) { if (!(k in t)) t[k] = JSON.parse(JSON.stringify(v)); else if (v && typeof v === 'object' && !Array.isArray(v) && t[k] && typeof t[k] === 'object') fill(t[k], v); } return t; };
const DATA = fill(JSON.parse(r('content.json')), JSON.parse(r('src/defaults.json')));
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const SITE = String(DATA.seo.site || 'https://fixpoint.li').replace(/\/+$/, '');
const tel = String(DATA.phone).replace(/[^+\d]/g, '');
const dataScript = 'const DATA = ' + JSON.stringify(DATA).replace(/</g, '\\u003c') + ';';
const seo = (lang) => {
  const t = DATA.T[lang], url = SITE + (lang === 'en' ? '/en/' : '/');
  const ld = {
    '@context': 'https://schema.org', '@type': 'LocalBusiness', '@id': SITE + '/#business', name: 'FixPoint', url: SITE + '/', telephone: tel, email: DATA.email,
    description: t.metaDesc, image: SITE + '/og.png', knowsLanguage: ['de', 'en'],
    address: { '@type': 'PostalAddress', addressLocality: 'Eschen', addressCountry: 'LI' },
    areaServed: [{ '@type': 'Country', name: 'Liechtenstein' }, { '@type': 'City', name: 'Sargans' }, { '@type': 'City', name: 'Buchs SG' }],
    makesOffer: (t.svc || []).map((s) => ({ '@type': 'Offer', itemOffered: { '@type': 'Service', name: s.a, description: s.b } }))
  };
  return `<title>${esc(t.metaTitle)}</title>
<meta name="description" content="${esc(t.metaDesc)}">
<link rel="canonical" href="${url}">
<link rel="alternate" hreflang="de" href="${SITE}/">
<link rel="alternate" hreflang="en" href="${SITE}/en/">
<link rel="alternate" hreflang="x-default" href="${SITE}/">
<meta property="og:type" content="website">
<meta property="og:site_name" content="FixPoint">
<meta property="og:title" content="${esc(t.ogTitle)}">
<meta property="og:description" content="${esc(t.metaDesc)}">
<meta property="og:url" content="${url}">
<meta property="og:image" content="${SITE}/og.png">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="${esc(t.heroAlt)}">
<meta name="twitter:card" content="summary_large_image">
<link rel="apple-touch-icon" href="/apple-touch-icon.png">${DATA.seo.gsc ? `\n<meta name="google-site-verification" content="${esc(DATA.seo.gsc)}">` : ''}
<script type="application/ld+json">${JSON.stringify(ld).replace(/</g, '\\u003c')}</script>`;
};
const page = (app, lang) => `<!doctype html>
<html lang="${lang}">
<head>
${r('src/head.html')}
${seo(lang)}
</head>
<body>
<div id="app">${app}</div>
<noscript><p style="padding:24px;color:#fff;background:#0A0E14">FixPoint – ${esc(DATA.T[lang].metaTitle)}. ${lang === 'en' ? 'Phone / WhatsApp' : 'Telefon / WhatsApp'}: <a href="tel:${esc(tel)}">${esc(DATA.phone)}</a></p></noscript>
<template id="tpl">
${r('src/template.html')}
</template>
<script>${r('src/runtime.js')}</script>
<script>
${dataScript}
${r('src/content.js')}
window.__mount(Component);
</script>
</body>
</html>`;
const prerender = async (lang) => {
  const dom = new JSDOM(page('', lang), { runScripts: 'dangerously', pretendToBeVisual: true });
  await new Promise((res) => setTimeout(res, 50));
  const app = dom.window.document.getElementById('app').innerHTML;
  if (!app.includes('FixPoint') || app.includes('{{')) throw new Error('Pre-render failed (' + lang + '): check content.json for mistakes');
  return page(app, lang);
};
(async () => {
  const de = await prerender('de'), en = await prerender('en');
  fs.rmSync(p('dist'), { recursive: true, force: true });
  fs.mkdirSync(p('dist/en'), { recursive: true });
  if (fs.existsSync(p('public'))) fs.cpSync(p('public'), p('dist'), { recursive: true });
  fs.writeFileSync(p('dist/index.html'), de);
  fs.writeFileSync(p('dist/en/index.html'), en);
  fs.writeFileSync(p('dist/content.json'), JSON.stringify(DATA));
  fs.writeFileSync(p('dist/robots.txt'), `User-agent: *\nAllow: /\nDisallow: /api/\n\nSitemap: ${SITE}/sitemap.xml\n`);
  const day = new Date().toISOString().slice(0, 10);
  const alt = `<xhtml:link rel="alternate" hreflang="de" href="${SITE}/"/><xhtml:link rel="alternate" hreflang="en" href="${SITE}/en/"/><xhtml:link rel="alternate" hreflang="x-default" href="${SITE}/"/>`;
  fs.writeFileSync(p('dist/sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n<url><loc>${SITE}/</loc><lastmod>${day}</lastmod>${alt}</url>\n<url><loc>${SITE}/en/</loc><lastmod>${day}</lastmod>${alt}</url>\n</urlset>\n`);
  console.log('Built dist/ (de + en)');
})().catch((e) => { console.error(e.message); process.exit(1); });

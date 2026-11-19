// Builds dist/: pre-rendered index.html from content.json, plus static pages and the admin.
const fs = require('fs'), path = require('path');
const { JSDOM } = require('jsdom');
const p = (...a) => path.join(__dirname, ...a);
const need = ['content.json', 'src/head.html', 'src/template.html', 'src/runtime.js', 'src/content.js', 'public/admin/index.html'];
const missing = need.filter((f) => !fs.existsSync(p(f)));
if (missing.length) { console.error('Missing files: ' + missing.join(', ') + '. Upload them to the repository, keeping the folder names.'); process.exit(1); }
const r = (f) => fs.readFileSync(p(f), 'utf8');
const DATA = JSON.parse(r('content.json'));
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const tel = String(DATA.phone).replace(/[^+\d]/g, '');
const dataScript = 'const DATA = ' + JSON.stringify(DATA).replace(/</g, '\\u003c') + ';';
const page = (app) => `<!doctype html>
<html lang="de">
<head>
${r('src/head.html')}
</head>
<body>
<div id="app">${app}</div>
<noscript><p style="padding:24px;color:#fff;background:#0A0E14">FixPoint – Handy &amp; PC Reparatur. Telefon / WhatsApp: <a href="tel:${esc(tel)}">${esc(DATA.phone)}</a></p></noscript>
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
(async () => {
  const dom = new JSDOM(page(''), { runScripts: 'dangerously', pretendToBeVisual: true });
  await new Promise((res) => setTimeout(res, 50));
  const app = dom.window.document.getElementById('app').innerHTML;
  if (!app.includes('FixPoint') || app.includes('{{')) throw new Error('Pre-render failed: check content.json for mistakes');
  fs.rmSync(p('dist'), { recursive: true, force: true });
  fs.mkdirSync(p('dist'));
  if (fs.existsSync(p('public'))) fs.cpSync(p('public'), p('dist'), { recursive: true });
  fs.writeFileSync(p('dist/index.html'), page(app));
  fs.writeFileSync(p('dist/content.json'), JSON.stringify(DATA));
  console.log('Built dist/ (' + app.length + ' bytes pre-rendered)');
})().catch((e) => { console.error(e.message); process.exit(1); });

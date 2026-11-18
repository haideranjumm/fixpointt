// Builds dist/index.html: pre-renders the page (for search engines) and copies the static pages.
// Works whether the files sit in the folders src/ and public/ or all together in the main folder.
const fs = require('fs'), path = require('path');
const { JSDOM } = require('jsdom');
const find = (name) => ['src/' + name, 'public/' + name, name].map((p) => path.join(__dirname, p)).find((p) => fs.existsSync(p));
const need = ['head.html', 'template.html', 'runtime.js', 'content.js'];
const missing = need.filter((n) => !find(n));
if (missing.length) {
  console.error('Missing files: ' + missing.join(', ') + '. Upload them to the repository (in the folder src/ or in the main folder).');
  process.exit(1);
}
const r = (n) => fs.readFileSync(find(n), 'utf8');
const head = r('head.html'), markup = r('template.html'), runtime = r('runtime.js'), content = r('content.js');
const phone = (content.match(/PHONE = '([^']+)'/) || [])[1] || '';
const page = (app) => `<!doctype html>
<html lang="de">
<head>
${head}
</head>
<body>
<div id="app">${app}</div>
<noscript><p style="padding:24px;color:#fff;background:#0A0E14">FixPoint – Handy &amp; PC Reparatur. Telefon / WhatsApp: <a href="tel:${phone.replace(/[^+\d]/g, '')}">${phone}</a></p></noscript>
<template id="tpl">
${markup}
</template>
<script>${runtime}</script>
<script>
${content}
window.__mount(Component);
</script>
</body>
</html>`;
(async () => {
  const dom = new JSDOM(page(''), { runScripts: 'dangerously', pretendToBeVisual: true });
  await new Promise((res) => setTimeout(res, 50));
  const app = dom.window.document.getElementById('app').innerHTML;
  if (!app.includes('FixPoint') || app.includes('{{')) throw new Error('Pre-render failed: check content.js for typos');
  fs.rmSync(path.join(__dirname, 'dist'), { recursive: true, force: true });
  fs.mkdirSync(path.join(__dirname, 'dist'));
  fs.writeFileSync(path.join(__dirname, 'dist/index.html'), page(app));
  for (const f of ['impressum.html', 'datenschutz.html', 'robots.txt', 'sitemap.xml']) {
    const p = find(f);
    if (p) fs.copyFileSync(p, path.join(__dirname, 'dist', f)); else console.warn('Warning: ' + f + ' not found, skipped');
  }
  console.log('Built dist/index.html (' + app.length + ' bytes pre-rendered)');
})().catch((e) => { console.error(e.message); process.exit(1); });

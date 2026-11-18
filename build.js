// Builds dist/index.html: pre-renders the page (for search engines) and copies public/ files.
const fs = require('fs'), path = require('path');
const { JSDOM } = require('jsdom');
const r = (f) => fs.readFileSync(path.join(__dirname, 'src', f), 'utf8');
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
  if (!app.includes('FixPoint') || app.includes('{{')) throw new Error('Pre-render failed: check src/content.js for typos');
  fs.rmSync('dist', { recursive: true, force: true });
  fs.mkdirSync('dist');
  fs.writeFileSync('dist/index.html', page(app));
  for (const f of fs.readdirSync('public')) fs.copyFileSync(path.join('public', f), path.join('dist', f));
  console.log('Built dist/index.html (' + app.length + ' bytes pre-rendered)');
})().catch((e) => { console.error(e.message); process.exit(1); });

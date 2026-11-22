// Vercel serverless function: saves content.json to GitHub after a password check.
const crypto = require('crypto');
const sha = (s) => crypto.createHash('sha256').update(String(s)).digest();
const same = (a, b) => crypto.timingSafeEqual(sha(a), sha(b));
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function check(v, depth = 0) {
  if (depth > 6) throw new Error('Content too deeply nested');
  if (typeof v === 'string') { if (v.length > 1500) throw new Error('A text is too long'); return; }
  if (typeof v === 'number') { if (!Number.isFinite(v) || v < 0 || v > 100000) throw new Error('A number is out of range'); return; }
  if (Array.isArray(v)) { if (v.length > 200) throw new Error('A list is too long'); v.forEach((x) => check(x, depth + 1)); return; }
  if (v && typeof v === 'object') { Object.entries(v).forEach(([k, x]) => { if (k.length > 120) throw new Error('A key is too long'); check(x, depth + 1); }); return; }
  throw new Error('Only text, lists and objects are allowed');
}
function validate(c) {
  if (!c || typeof c !== 'object') throw new Error('Invalid content');
  for (const k of ['phone', 'places', 'fix', 'devices', 'T']) if (!(k in c)) throw new Error('Missing section: ' + k);
  if (typeof c.phone !== 'string' || !/^[+\d][\d\s()-]{5,25}$/.test(c.phone)) throw new Error('Phone number looks invalid');
  if ('email' in c && (typeof c.email !== 'string' || !/^[^\s@<>"']+@[^\s@<>"']+\.[^\s@<>"']+$/.test(c.email))) throw new Error('Email address looks invalid');
  if (!Array.isArray(c.places) || !c.places.every((p) => typeof p === 'string')) throw new Error('Areas must be a list of names');
  if (!c.T.de || !c.T.en || JSON.stringify(Object.keys(c.T.de).sort()) !== JSON.stringify(Object.keys(c.T.en).sort())) throw new Error('German and English texts must have the same fields');
  if ('est' in c && (!c.est || typeof c.est !== 'object')) throw new Error('Estimates are invalid');
  for (const d of Object.values(c.devices)) if (!d.l || !d.f || !d.b) throw new Error('A device is incomplete');
  check(c);
  if (JSON.stringify(c).length > 150000) throw new Error('Content too large');
}

module.exports = async (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const { ADMIN_PASSWORD, GITHUB_TOKEN, GITHUB_REPO, GITHUB_BRANCH = 'main' } = process.env;
  if (!ADMIN_PASSWORD || !GITHUB_TOKEN || !GITHUB_REPO) return res.status(500).json({ error: 'Not configured: set ADMIN_PASSWORD, GITHUB_TOKEN and GITHUB_REPO in Vercel, then redeploy.' });
  let body = req.body;
  if (typeof body === 'string') { try { body = JSON.parse(body); } catch (e) { body = null; } }
  if (!body || typeof body.password !== 'string' || !same(body.password, ADMIN_PASSWORD)) { await sleep(800); return res.status(401).json({ error: 'Wrong password' }); }
  try { validate(body.content); } catch (e) { return res.status(400).json({ error: e.message }); }
  const url = `https://api.github.com/repos/${GITHUB_REPO}/contents/content.json`;
  const headers = { Authorization: `Bearer ${GITHUB_TOKEN}`, Accept: 'application/vnd.github+json', 'X-GitHub-Api-Version': '2022-11-28', 'User-Agent': 'fixpoint-admin' };
  try {
    const cur = await fetch(`${url}?ref=${encodeURIComponent(GITHUB_BRANCH)}`, { headers });
    let sha1;
    if (cur.ok) sha1 = (await cur.json()).sha; else if (cur.status !== 404) return res.status(502).json({ error: 'GitHub read failed (' + cur.status + '). Check the token and repository name.' });
    const put = await fetch(url, { method: 'PUT', headers: { ...headers, 'Content-Type': 'application/json' }, body: JSON.stringify({ message: 'Update site content via admin', content: Buffer.from(JSON.stringify(body.content, null, 2) + '\n').toString('base64'), branch: GITHUB_BRANCH, ...(sha1 ? { sha: sha1 } : {}) }) });
    if (!put.ok) return res.status(502).json({ error: 'GitHub save failed (' + put.status + '). The token needs Contents: read and write.' });
    return res.status(200).json({ ok: true });
  } catch (e) { return res.status(502).json({ error: 'Could not reach GitHub' }); }
};
module.exports.validate = validate;

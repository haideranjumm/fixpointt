// App logic. All texts, prices, models and areas live in content.json (edit it in /admin).
const FIX = DATA.fix, DEV = DATA.devices, PLACES = DATA.places, T = DATA.T, PHONE = DATA.phone;
class Component extends DCLogic {
constructor(props) { super(props); this.state = { lang: document.documentElement.getAttribute('lang') === 'en' ? 'en' : 'de', dev: null, brand: null, model: null, sel: {}, where: 'li', express: false }; }
renderVals() {
const s = this.state, L = s.lang === 'en' ? 1 : 0, t = T[s.lang];
const on = 'background:#3EE6C3;color:#04211C;border-color:#3EE6C3', off = '';
const DEVON = 'border-color:#3EE6C3;box-shadow:inset 0 1px 0 #ffffff20,0 0 0 1px #3EE6C3,0 0 26px #3EE6C340;background:linear-gradient(180deg,#1B2A33,#0E1A1C)', TGON = 'border-color:#3EE6C3;box-shadow:0 0 0 1px #3EE6C340,0 0 20px #3EE6C320', LEDON = 'background:#3EE6C3;box-shadow:0 0 10px #3EE6C3', LEDOFF = '', KNON = 'transform:translateX(18px)';
const d = s.dev ? DEV[s.dev] : null;
const ml = d && s.brand ? d.b[s.brand] : [];
const devs = Object.keys(DEV).map((k) => ({ label: DEV[k].l[L], isPhone: k === 'phone', isTablet: k === 'tablet', isLaptop: k === 'laptop', isPc: k === 'pc', st: s.dev === k ? DEVON : off, ic: '#3EE6C3', led: s.dev === k ? LEDON : LEDOFF, pick: () => this.setState({ dev: k, brand: null, model: null, sel: {} }) }));
const brands = d ? Object.keys(d.b).map((b) => ({ label: b, st: s.brand === b ? on : off, pick: () => this.setState({ brand: b, model: null }) })) : [];
const tr = (m) => (m && L ? m.replace('Serie', 'series') : m);
const models = ml.map((m) => ({ label: tr(m), st: s.model === m ? on : off, pick: () => this.setState({ model: m }) }));
const E = DATA.est || {}, ED = (s.dev && E[s.dev]) || {}, X = E.extra || {};
const fixes = d ? d.f.map((k) => ({ label: FIX[k][L], px: ED[k] != null ? 'CHF ' + ED[k] : '', aria: String(!!s.sel[k]), st: s.sel[k] ? TGON : off, led: s.sel[k] ? LEDON : LEDOFF, kn: s.sel[k] ? KNON : '', pick: () => this.setState((p) => ({ sel: { ...p.sel, [k]: !p.sel[k] } })) })) : [];
const fx = d ? d.f.filter((k) => s.sel[k]).map((k) => FIX[k][L]).join(', ') : '';
const picked = d ? d.f.filter((k) => s.sel[k]) : [];
const trav = s.where === 'far' ? (X.far || 0) : 0, exp = s.express ? (X.express || 0) : 0;
const total = picked.reduce((n, k) => n + (ED[k] || 0), 0) + trav + exp;
const lit = total > 0 ? Math.max(1, Math.min(24, Math.round((total / 600) * 24))) : 0;
const segs = Array.from({ length: 24 }, (_, i) => ({ st: i < lit ? 'background:' + (i < 16 ? '#3EE6C3' : '#8B7CFF') + ';box-shadow:0 0 8px ' + (i < 16 ? '#3EE6C390' : '#8B7CFF90') : '' }));
const farLabel = t.whereFar + (X.far ? ' (+CHF ' + X.far + ')' : '');
const wheres = [{ label: t.whereLi, st: s.where === 'li' ? on : off, pick: () => this.setState({ where: 'li' }) }, { label: farLabel, st: s.where === 'far' ? on : off, pick: () => this.setState({ where: 'far' }) }];
const extra = `${t.lW}: ${s.where === 'far' ? farLabel : t.whereLi}${s.express ? '\n' + t.express : ''}\n${t.estH}: ${t.from} CHF ${total}`;
const brandsAll = [...new Set(Object.values(DEV).flatMap((x) => Object.keys(x.b)).filter((b) => !/Other|Andere/.test(b)))];
const marq = [...brandsAll, ...brandsAll].map((n) => ({ n }));
const na = t.h1a.split(' ').filter(Boolean).length;
const h1w = (t.h1a + ' ' + t.h1b).split(' ').filter(Boolean).map((w, i) => ({ t: w, cls: i >= na ? 'gt' : '', d: (0.1 + i * 0.08).toFixed(2) + 's' }));
const svc = t.svc.map((x, i) => ({ a: x.a, b: x.b, i0: i === 0, i1: i === 1, i2: i === 2, i3: i === 3, i4: i === 4, i5: i === 5 }));
const ready = s.dev && s.brand && fx;
const parts = ready ? [d.l[L], s.brand, tr(s.model), fx].filter(Boolean) : [];
const msg = ready ? `${t.hi}\n${t.lD}: ${d.l[L]}\n${t.lB}: ${s.brand}\n${s.model ? t.lM + ': ' + tr(s.model) + '\n' : ''}${t.lF}: ${fx}\n${extra}` : t.hi;
const num = PHONE.replace(/[^\d]/g, '');
return {
t, devs, brands, models, fixes, PHONE, places: PLACES.map((n) => ({ n })),
h1w, svc, farLabel, EMAIL: DATA.email, mailBase: 'mailto:' + DATA.email, hasDev: !!s.dev, stepFix: models.length > 0 ? 4 : 3, stepWhere: (models.length > 0 ? 4 : 3) + 1, wheres, segs, marq, estText: total > 0 ? `${t.from} CHF ${total}` : '—', expAria: String(s.express), expSt: s.express ? TGON : '', expLed: s.express ? LEDON : LEDOFF, expKn: s.express ? KNON : '', expPrice: X.express || 0, toggleExp: () => this.setState((p) => ({ express: !p.express })), hasModels: models.length > 0, summary: ready ? parts.join(' · ') : t.none,
waLink: `https://wa.me/${num}?text=${encodeURIComponent(msg)}`, waBase: `https://wa.me/${num}`, telLink: `tel:+${num}`,
deSt: s.lang === 'de' ? 'background:#3EE6C3;color:#04211C' : 'background:transparent;color:#E8EEF5',
enSt: s.lang === 'en' ? 'background:#3EE6C3;color:#04211C' : 'background:transparent;color:#E8EEF5',
setDe: () => this.setState({ lang: 'de' }), setEn: () => this.setState({ lang: 'en' })
};
}
}

document.addEventListener('pointermove', (e) => {
  const rs = document.documentElement.style;
  rs.setProperty('--px', e.clientX + 'px');
  rs.setProperty('--py', e.clientY + 'px');
  const t = e.target.closest && e.target.closest('.card,.dev');
  if (!t) return;
  const r = t.getBoundingClientRect();
  t.style.setProperty('--mx', e.clientX - r.left + 'px');
  t.style.setProperty('--my', e.clientY - r.top + 'px');
}, { passive: true });

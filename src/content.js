// App logic. All texts, prices, models and areas live in content.json (edit it in /admin).
const FIX = DATA.fix, DEV = DATA.devices, PLACES = DATA.places, T = DATA.T, PHONE = DATA.phone;
class Component extends DCLogic {
constructor(props) { super(props); this.state = { lang: 'de', dev: null, brand: null, model: null, sel: {} }; }
renderVals() {
const s = this.state, L = s.lang === 'en' ? 1 : 0, t = T[s.lang];
const on = 'background:#3EE6C3;color:#04211C;border-color:#3EE6C3', off = '';
const d = s.dev ? DEV[s.dev] : null;
const ml = d && s.brand ? d.b[s.brand] : [];
const devs = Object.keys(DEV).map((k) => ({ label: DEV[k].l[L], isPhone: k === 'phone', isTablet: k === 'tablet', isLaptop: k === 'laptop', isPc: k === 'pc', st: s.dev === k ? on : off, ic: s.dev === k ? '#04211C' : '#3EE6C3', pick: () => this.setState({ dev: k, brand: null, model: null, sel: {} }) }));
const brands = d ? Object.keys(d.b).map((b) => ({ label: b, st: s.brand === b ? on : off, pick: () => this.setState({ brand: b, model: null }) })) : [];
const tr = (m) => (m && L ? m.replace('Serie', 'series') : m);
const models = ml.map((m) => ({ label: tr(m), st: s.model === m ? on : off, pick: () => this.setState({ model: m }) }));
const fixes = d ? d.f.map((k) => ({ label: FIX[k][L], st: s.sel[k] ? on : off, pick: () => this.setState((p) => ({ sel: { ...p.sel, [k]: !p.sel[k] } })) })) : [];
const fx = d ? d.f.filter((k) => s.sel[k]).map((k) => FIX[k][L]).join(', ') : '';
const ready = s.dev && s.brand && fx;
const parts = ready ? [d.l[L], s.brand, tr(s.model), fx].filter(Boolean) : [];
const msg = ready ? `${t.hi}\n${t.lD}: ${d.l[L]}\n${t.lB}: ${s.brand}\n${s.model ? t.lM + ': ' + tr(s.model) + '\n' : ''}${t.lF}: ${fx}` : t.hi;
const num = PHONE.replace(/[^\d]/g, '');
return {
t, devs, brands, models, fixes, PHONE, places: PLACES.map((n) => ({ n })),
hasDev: !!s.dev, stepFix: models.length > 0 ? 4 : 3, hasModels: models.length > 0, summary: ready ? parts.join(' · ') : t.none,
waLink: `https://wa.me/${num}?text=${encodeURIComponent(msg)}`, waBase: `https://wa.me/${num}`, telLink: `tel:+${num}`,
deSt: s.lang === 'de' ? 'background:#3EE6C3;color:#04211C' : 'background:transparent',
enSt: s.lang === 'en' ? 'background:#3EE6C3;color:#04211C' : 'background:transparent',
setDe: () => this.setState({ lang: 'de' }), setEn: () => this.setState({ lang: 'en' })
};
}
}

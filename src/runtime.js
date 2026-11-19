(function () {
  const HOLE = /\{\{\s*([\w.$]+)\s*\}\}/g, ONE = /^\s*\{\{\s*([\w.$]+)\s*\}\}\s*$/;
  const get = (p, sc) => p.split('.').reduce((o, k) => (o == null ? o : o[k]), sc);
  const sub = (s, sc) => s.replace(HOLE, (m, p) => { const v = get(p, sc); return v == null || typeof v === 'function' ? '' : v; });
  function proc(node, sc) {
    if (node.nodeType === 3) { node.nodeValue = sub(node.nodeValue, sc); return [node]; }
    if (node.nodeType !== 1) return [node];
    const tag = node.tagName.toLowerCase(), out = [];
    if (tag === 'sc-for') {
      const list = get(node.getAttribute('list').match(ONE)[1], sc) || [], as = node.getAttribute('as');
      list.forEach((item) => { const s = Object.create(sc); s[as] = item; node.childNodes.forEach((c) => out.push(...proc(c.cloneNode(true), s))); });
      return out;
    }
    if (tag === 'sc-if') {
      if (!get(node.getAttribute('value').match(ONE)[1], sc)) return [];
      node.childNodes.forEach((c) => out.push(...proc(c.cloneNode(true), sc)));
      return out;
    }
    for (const a of [...node.attributes]) {
      if (a.name.startsWith('hint-')) { node.removeAttribute(a.name); continue; }
      if (!a.value.includes('{{')) continue;
      const one = a.value.match(ONE);
      if (a.name.startsWith('on') && one) { node['__' + a.name.slice(2)] = get(one[1], sc); node.removeAttribute(a.name); }
      else node.setAttribute(a.name, sub(a.value, sc));
    }
    const kids = [...node.childNodes]; node.textContent = '';
    kids.forEach((c) => proc(c, sc).forEach((n) => node.appendChild(n)));
    return [node];
  }
  function morphKids(o, n) {
    const oc = [...o.childNodes], nc = [...n.childNodes];
    nc.forEach((c, i) => {
      const x = oc[i];
      if (!x) o.appendChild(c);
      else if (x.nodeType !== c.nodeType || x.nodeName !== c.nodeName) o.replaceChild(c, x);
      else morph(x, c);
    });
    for (let i = oc.length - 1; i >= nc.length; i--) o.removeChild(oc[i]);
  }
  function morph(o, n) {
    if (o.nodeType !== 1) { if (o.nodeValue !== n.nodeValue) o.nodeValue = n.nodeValue; return; }
    for (const a of [...o.attributes]) if (!n.hasAttribute(a.name)) o.removeAttribute(a.name);
    for (const a of [...n.attributes]) if (o.getAttribute(a.name) !== a.value) o.setAttribute(a.name, a.value);
    o.__click = n.__click;
    morphKids(o, n);
  }
  let comp, pending = false;
  window.DCLogic = class {
    constructor(p) { this.props = p || {}; this.state = {}; }
    setState(u) {
      this.state = { ...this.state, ...(typeof u === 'function' ? u(this.state) : u) };
      if (!pending) { pending = true; Promise.resolve().then(() => { pending = false; render(); }); }
    }
  };
  function render() {
    const root = document.getElementById('app'), vals = comp.renderVals();
    const holder = document.createElement('div');
    [...document.getElementById('tpl').content.cloneNode(true).childNodes].forEach((c) => proc(c, vals).forEach((n) => holder.appendChild(n)));
    morphKids(root, holder);
    document.documentElement.lang = comp.state.lang || 'de';
  }
  window.__mount = function (C) {
    comp = new C({});
    const root = document.getElementById('app');
    root.addEventListener('click', (e) => { for (let el = e.target; el && el !== root; el = el.parentNode) if (el.__click) { el.__click(e); return; } });
    render();
  };
})();

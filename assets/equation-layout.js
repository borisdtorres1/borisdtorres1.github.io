(() => {
  'use strict';
  const formulas = [...document.querySelectorAll('.formula-scroll')];
  const measurements = new WeakMap();
  const originals = new WeakMap();
  const mathNamespace = 'http://www.w3.org/1998/Math/MathML';

  function wrapLongFormula(math, nodes) {
    const candidates = nodes.map((node, index) => ({ node, index })).filter(({ node, index }) =>
      index > 2 && index < nodes.length - 2 && node.localName === 'mo' &&
      ['+', '−', ','].includes(node.textContent));
    if (!candidates.length) return;
    const bounds = math.getBoundingClientRect();
    const interval = nodes[0]?.textContent === '[';
    const comma = interval && candidates.find(item => item.node.textContent === ',');
    const chosen = comma || candidates.reduce((best, item) => {
      const distance = Math.abs(item.node.getBoundingClientRect().left - bounds.left - bounds.width / 2);
      return !best || distance < best.distance ? { ...item, distance } : best;
    }, null);
    const split = chosen.index + (comma ? 1 : 0);
    const table = document.createElementNS(mathNamespace, 'mtable');
    table.setAttribute('columnalign', 'left');
    table.setAttribute('rowspacing', '.5em');
    for (const line of [nodes.slice(0, split), nodes.slice(split)]) {
      const row = document.createElementNS(mathNamespace, 'mtr');
      const cell = document.createElementNS(mathNamespace, 'mtd');
      cell.append(...line);
      row.append(cell);
      table.append(row);
    }
    math.replaceChildren(table);
  }

  function fitFormula(container, force = false) {
    const math = container.querySelector('math');
    if (!math) return;
    const available = container.getBoundingClientRect().width;
    if (available <= 0) return;
    const baseSize = window.matchMedia('(max-width: 650px)').matches ? 20 : 22;
    const key = available.toFixed(1) + ':' + baseSize;
    if (!force && measurements.get(container) === key) return;
    measurements.set(container, key);
    if (!originals.has(math)) {
      originals.set(math, { row: math.firstElementChild, nodes: [...math.firstElementChild.children] });
    }
    const original = originals.get(math);
    original.row.replaceChildren(...original.nodes);
    math.replaceChildren(original.row);
    math.style.fontSize = baseSize + 'px';
    let natural = math.getBoundingClientRect().width;
    if (natural > available && baseSize * available / natural < 16) {
      wrapLongFormula(math, original.nodes);
      natural = math.getBoundingClientRect().width;
    }
    if (natural > available) {
      const fitted = Math.floor(baseSize * available / natural * 10) / 10;
      math.style.fontSize = fitted + 'px';
    }
  }

  function fitAll(force = false) { formulas.forEach(container => fitFormula(container, force)); }
  fitAll();
  window.addEventListener('resize', () => fitAll());
  window.addEventListener('load', () => fitAll(true));
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => fitAll(true));
  if (window.ResizeObserver) {
    const observer = new ResizeObserver(entries => entries.forEach(entry => fitFormula(entry.target)));
    formulas.forEach(container => observer.observe(container));
  }
})();

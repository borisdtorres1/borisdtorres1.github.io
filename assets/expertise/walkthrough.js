(() => {
  'use strict';
  const data = JSON.parse(document.getElementById('expertise-data').textContent);
  const steps = [...document.querySelectorAll('.research-step')];
  steps.slice(0, -1).forEach(step => {
    const rail = document.createElement('span');
    rail.className = 'timeline-rail';
    rail.setAttribute('aria-hidden', 'true');
    step.prepend(rail);
  });
  function alignTimeline() {
    steps.slice(0, -1).forEach((step, index) => {
      const marker = step.querySelector('.timeline-marker').getBoundingClientRect();
      const next = steps[index + 1].querySelector('.timeline-marker').getBoundingClientRect();
      const box = step.getBoundingClientRect();
      const rail = step.querySelector('.timeline-rail');
      rail.style.top = (marker.top + marker.height / 2 - box.top) + 'px';
      rail.style.height = (next.top + next.height / 2 - marker.top - marker.height / 2) + 'px';
    });
  }
  alignTimeline();
  window.addEventListener('resize', alignTimeline);
  window.addEventListener('load', alignTimeline);
  if (window.ResizeObserver) new ResizeObserver(alignTimeline).observe(document.querySelector('.research-timeline'));

  const modelChoice = document.getElementById('model-choice');
  function showModel() {
    const model = data.models[modelChoice.value];
    document.getElementById('model-result').textContent =
      model.percent_association.toFixed(1) + '% higher fitted wages for one SD more expertise';
    document.getElementById('model-fit').textContent =
      (model.weighted ? 'The employment-weighted' : 'The unweighted') +
      ' model has R² = ' + model.r_squared.toFixed(3) +
      '. The sample stays at ' + model.n.toLocaleString('en-US') + ' occupations.';
  }
  modelChoice.addEventListener('change', showModel);
  showModel();

  const search = document.getElementById('occupation-search');
  const body = document.getElementById('occupation-rows');
  const previous = document.getElementById('previous-page');
  const next = document.getElementById('next-page');
  const all = [...data.occupations];
  const sortButtons = [...document.querySelectorAll('[data-sort-key]')];
  const sortLabels = {title: 'occupation', expertise: 'expertise', wage: 'mean wage', employment: 'employment'};
  let sortKey = 'title';
  let sortDirection = 'ascending';
  const pageSize = 10;
  let page = 0;
  function directionLabel(key, direction) {
    return key === 'title'
      ? (direction === 'ascending' ? 'A to Z' : 'Z to A')
      : (direction === 'ascending' ? 'Low to high' : 'High to low');
  }
  function updateSortHeaders() {
    sortButtons.forEach(button => {
      const key = button.dataset.sortKey;
      const active = key === sortKey;
      button.closest('th').setAttribute('aria-sort', active ? sortDirection : 'none');
      const icon = button.querySelector('.sort-indicator');
      if (!icon.firstElementChild) {
        icon.innerHTML = '<svg viewBox="0 0 14 18" aria-hidden="true" focusable="false"><path class="ascending-mark" d="M7 2 12 7H2Z" fill="currentColor"/><path class="descending-mark" d="m7 16 5-5H2Z" fill="currentColor"/></svg>';
      }
      button.title = active
        ? 'Sorted ' + directionLabel(key, sortDirection).toLowerCase() + '. Click to reverse.'
        : 'Click to sort by ' + sortLabels[key] + '.';
      const nextDirection = active && sortDirection === 'descending' ? 'ascending'
        : active ? 'descending' : key === 'title' ? 'ascending' : 'descending';
      button.setAttribute('aria-label', 'Sort by ' + sortLabels[key] + ', ' + directionLabel(key, nextDirection).toLowerCase());
    });
  }
  function render() {
    const query = search.value.trim().toLocaleLowerCase();
    const matches = all.filter(row => (row.title + ' ' + row.soc).toLocaleLowerCase().includes(query));
    const direction = sortDirection === 'ascending' ? 1 : -1;
    matches.sort((a, b) => {
      const difference = sortKey === 'title'
        ? a.title.localeCompare(b.title, 'en') : a[sortKey] - b[sortKey];
      return direction * difference || a.title.localeCompare(b.title, 'en') || a.soc.localeCompare(b.soc);
    });
    page = Math.min(page, Math.max(0, Math.ceil(matches.length / pageSize) - 1));
    body.replaceChildren();
    const start = page * pageSize;
    matches.slice(start, start + pageSize).forEach(row => {
      const tr = document.createElement('tr');
      const title = document.createElement('th');
      title.scope = 'row';
      title.textContent = row.title;
      const code = document.createElement('small');
      code.textContent = row.soc + (row.converted ? ' · Annual-pay equivalent' : '');
      code.style.display = 'block';
      title.append(code);
      tr.append(title);
      [row.expertise.toFixed(2), row.wage.toFixed(2), row.employment.toLocaleString('en-US')].forEach(value => {
        const td = document.createElement('td');
        td.textContent = value;
        tr.append(td);
      });
      body.append(tr);
    });
    if (!matches.length) {
      const tr = document.createElement('tr');
      const td = document.createElement('td');
      td.colSpan = 4;
      td.textContent = 'No occupations match. Try a shorter title or a SOC code.';
      tr.append(td);
      body.append(tr);
    }
    document.getElementById('explorer-status').textContent = matches.length
      ? 'Showing ' + (start + 1) + '–' + Math.min(start + pageSize, matches.length) + ' of ' + matches.length + ' occupations. Sorted by ' + sortLabels[sortKey] + ', ' + directionLabel(sortKey, sortDirection).toLowerCase() + '.'
      : 'No matching occupations.';
    previous.disabled = page === 0;
    next.disabled = start + pageSize >= matches.length;
    updateSortHeaders();
    alignTimeline();
  }
  sortButtons.forEach(button => button.addEventListener('click', () => {
    const key = button.dataset.sortKey;
    sortDirection = key === sortKey
      ? (sortDirection === 'ascending' ? 'descending' : 'ascending')
      : key === 'title' ? 'ascending' : 'descending';
    sortKey = key;
    page = 0;
    render();
  }));
  search.addEventListener('input', () => { page = 0; render(); });
  document.getElementById('clear-search').addEventListener('click', () => { search.value = ''; page = 0; render(); search.focus(); });
  previous.addEventListener('click', () => { page--; render(); });
  next.addEventListener('click', () => { page++; render(); });
  render();
})();

// Keep source footnote previews inside the viewport.
(() => {
  document.querySelectorAll('.citation').forEach(citation => {
    const link = citation.querySelector('a');
    const preview = citation.querySelector('.citation-preview');
    function place() {
      citation.classList.remove('preview-dismissed');
      const r = link.getBoundingClientRect();
      const p = preview.getBoundingClientRect();
      preview.style.left = Math.max(16, Math.min(r.left, window.innerWidth - p.width - 16)) + 'px';
      preview.style.top = (r.bottom + p.height + 16 <= window.innerHeight ? r.bottom : Math.max(8, r.top - p.height)) + 'px';
    }
    citation.addEventListener('pointerenter', place);
    citation.addEventListener('focusin', place);
    citation.addEventListener('pointerleave', () => citation.classList.remove('preview-dismissed'));
    citation.addEventListener('focusout', () => citation.classList.remove('preview-dismissed'));
    link.addEventListener('click', () => citation.classList.add('preview-dismissed'));
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape') document.querySelectorAll('.citation').forEach(c => c.classList.add('preview-dismissed'));
  });
})();

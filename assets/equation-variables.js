(() => {
  'use strict';

  const definitions = {
    "rating-scale": {
      "title": "Why Divide by 100?",
      "origin": null,
      "meaning": "Dividing expresses the rating gap in hundreds of Elo points. A gap of 100 becomes 1, and a gap of 200 becomes 2. It does not turn the gap into a percentage or change which team is stronger.",
      "calculation": "The number 100 is a convenient choice of scale, not an estimated value. It lets the later conversion describe the goal difference associated with a 100 point Elo advantage."
    },
    "G": {
      "title": "Goals Scored",
      "origin": null,
      "meaning": "The number of goals scored by a club in the match.",
      "calculation": ""
    },
    "Y": {
      "title": "Actual Home Goal Difference",
      "origin": 1,
      "meaning": "Home goals minus away goals. Positive means a home win, negative means an away win, and zero means a draw.",
      "calculation": ""
    },
    "Y-hat": {
      "title": "Predicted Home Goal Difference",
      "origin": 9,
      "meaning": "The goal difference predicted by the model, rather than the score that actually happened. The hat marks an estimated value.",
      "calculation": ""
    },
    "E": {
      "title": "ClubElo Rating",
      "origin": null,
      "meaning": "A number describing a club’s strength before the match. A higher rating suggests a stronger team.",
      "calculation": "Taken from the rating valid on the day before kickoff, so it does not already include the result of the match being studied."
    },
    "d": {
      "title": "Pre-Match Rating Gap",
      "origin": 2,
      "meaning": "The home team’s Elo rating minus the away team’s rating, divided by 100. A value of 1 means a 100 point advantage for the home team.",
      "calculation": ""
    },
    "alpha": {
      "title": "Season Starting Level",
      "origin": 3,
      "meaning": "The expected home goal difference when the opponents have the same Elo rating. Each league and season gets its own starting level.",
      "calculation": "Estimated from the match results using OLS, together with the conversion from rating points into goals."
    },
    "beta": {
      "title": "Rating Points into Goals",
      "origin": 3,
      "meaning": "How much the expected goal difference changes when the home team’s Elo advantage increases by 100 points.",
      "calculation": "Estimated using OLS separately for each league, using all seasons kept in the study."
    },
    "beta-hat": {
      "title": "Estimated Rating to Goals Conversion",
      "origin": 3,
      "meaning": "The estimated change in goal difference associated with a 100 point increase in the home team’s Elo advantage. The hat marks an estimate.",
      "calculation": "Estimated using OLS from the match results, with one conversion for each league."
    },
    "u": {
      "title": "Unexplained Part of the First Comparison",
      "origin": 3,
      "meaning": "The part of a match’s goal difference not explained by the season starting level and Elo rating gap.",
      "calculation": ""
    },
    "R": {
      "title": "Elo-Adjusted Goal Difference",
      "origin": 4,
      "meaning": "The observed goal difference after subtracting the part associated with the teams’ Elo rating gap.",
      "calculation": ""
    },
    "a": {
      "title": "Remaining Club Strength",
      "origin": 5,
      "meaning": "The club’s strength after the Elo adjustment. The same value applies when that club plays at home or away during one season.",
      "calculation": ""
    },
    "a-hat": {
      "title": "Estimated Remaining Club Strength",
      "origin": 5,
      "meaning": "The part of a club’s strength that the rating adjustment may have missed. It applies both at home and away in that season. The hat marks an estimate.",
      "calculation": ""
    },
    "h": {
      "title": "Total Club Home Effect",
      "origin": 5,
      "meaning": "The additional goal margin associated with a club playing at home, after allowing for Elo and remaining team strength.",
      "calculation": ""
    },
    "h-hat": {
      "title": "Estimated Total Club Home Advantage",
      "origin": 5,
      "meaning": "The club’s estimated benefit from playing at home in one season. It includes the league’s usual home advantage and any extra advantage for that club.",
      "calculation": ""
    },
    "epsilon": {
      "title": "What the Seasonal Comparison Does Not Explain",
      "origin": 5,
      "meaning": "The part of an adjusted match result that remains unexplained after accounting for the teams’ remaining strength and the home club’s advantage.",
      "calculation": ""
    },
    "N": {
      "title": "Number of Retained Clubs",
      "origin": null,
      "meaning": "The number of clubs kept in the dataset for the league and season being analysed.",
      "calculation": ""
    },
    "mu-hat": {
      "title": "The League’s Usual Home Advantage",
      "origin": 7,
      "meaning": "The average estimated home advantage across the clubs kept in the study for this league and season. Every club counts equally.",
      "calculation": ""
    },
    "r-hat": {
      "title": "Home Advantage Above or Below Average",
      "origin": 8,
      "meaning": "The club’s home advantage minus the league’s average that season. Positive means the club gains more than average from playing at home. Negative means it gains less.",
      "calculation": ""
    },
    "H": {
      "title": "Adjusted Home Total",
      "origin": 10,
      "meaning": "The sum of a club’s adjusted goal differences across its home matches. The star identifies a total built from Elo-adjusted scores.",
      "calculation": ""
    },
    "A": {
      "title": "Adjusted Away Total",
      "origin": 11,
      "meaning": "The sum of a club’s adjusted away margins, viewed from that club’s perspective. The star identifies a total built from Elo-adjusted scores.",
      "calculation": ""
    },
    "SE": {
      "title": "Uncertainty Around the Estimate",
      "origin": 15,
      "meaning": "The standard error describes how much the estimate could vary with different match results. A larger value makes the uncertainty range wider. HC3 is the method used to calculate it.",
      "calculation": ""
    },
    "m": {
      "title": "Match Label",
      "origin": null,
      "meaning": "Identifies the match being considered. A small m ties a score, rating gap, or adjusted margin to that match.",
      "calculation": ""
    },
    "i": {
      "title": "Club Label i",
      "origin": null,
      "meaning": "In match equations, i is the home club. In sums and club totals, it labels the club being considered or added.",
      "calculation": ""
    },
    "j": {
      "title": "Away Club Label",
      "origin": null,
      "meaning": "Identifies the away club in the match. This is a match role, not a permanent label for a particular club.",
      "calculation": ""
    },
    "league": {
      "title": "League Label",
      "origin": null,
      "meaning": "The small ℓ identifies the league, such as the Premier League or Bundesliga.",
      "calculation": ""
    },
    "s": {
      "title": "Season Label",
      "origin": null,
      "meaning": "Identifies the season, such as 2012/13. Combined with the league label, it identifies one league in one season.",
      "calculation": ""
    },
    "sum": {
      "title": "Add the Values Together",
      "origin": null,
      "meaning": "The ∑ symbol means add up the values described by the labels below and above it.",
      "calculation": ""
    },
    "multiplier": {
      "title": "Why 1.96 Appears Here",
      "origin": null,
      "meaning": "The interval extends 1.96 standard errors in each direction from the estimate. This is the usual multiplier for an approximate 95% confidence interval.",
      "calculation": "This is a standard statistical choice under the method’s assumptions, not a number estimated from the football results."
    }
  };

  const triggers = [...document.querySelectorAll('math [data-variable]')];
  if (!triggers.length) return;
  const popup = document.createElement('div');
  popup.id = 'variable-popover';
  popup.className = 'variable-popover';
  popup.hidden = true;
  popup.setAttribute('role', 'dialog');
  popup.setAttribute('aria-labelledby', 'variable-title');
  popup.innerHTML = '<button type="button" class="variable-close" aria-label="Close variable explanation">Close</button><p class="variable-kicker">Inside the Formula</p><h3 id="variable-title"></h3><p id="variable-meaning"></p><p id="variable-calculation"></p><a class="variable-origin" href="#"></a>';
  document.body.append(popup);
  const closeButton = popup.querySelector('button');
  const title = popup.querySelector('h3');
  const meaning = popup.querySelector('#variable-meaning');
  const calculation = popup.querySelector('#variable-calculation');
  const originLink = popup.querySelector('a');
  let current = null;
  let timer = null;
  let pinned = false;
  let returningFocus = false;

  function clearTimer() { if (timer !== null) { clearTimeout(timer); timer = null; } }
  function close(restoreFocus = false) {
    clearTimer();
    const previous = current;
    if (previous) previous.setAttribute('aria-expanded', 'false');
    current = null;
    pinned = false;
    popup.hidden = true;
    if (restoreFocus && previous) {
      returningFocus = true;
      previous.focus({ preventScroll: true });
      returningFocus = false;
    }
  }
  function position() {
    if (!current || popup.hidden) return;
    const r = current.getBoundingClientRect();
    const p = popup.getBoundingClientRect();
    const gap = 7;
    const left = Math.max(12, Math.min(r.left, window.innerWidth - p.width - 12));
    const top = r.bottom + gap + p.height <= window.innerHeight - 12
      ? r.bottom + gap
      : Math.max(12, r.top - p.height - gap);
    popup.style.left = left + 'px';
    popup.style.top = top + 'px';
  }
  function open(trigger, pin = false, focus = false) {
    const definition = definitions[trigger.dataset.variable];
    if (!definition) return;
    if (pinned && current !== trigger && !pin) return;
    clearTimer();
    if (current && current !== trigger) current.setAttribute('aria-expanded', 'false');
    current = trigger;
    pinned = pin || pinned;
    title.textContent = definition.title;
    meaning.textContent = definition.meaning;
    calculation.textContent = definition.calculation;
    calculation.hidden = !definition.calculation;
    const equation = Number(trigger.closest('.formula-block').id.replace('equation-', ''));
    originLink.hidden = !Number.isInteger(definition.origin) || definition.origin >= equation;
    if (!originLink.hidden) {
      originLink.href = '#equation-' + definition.origin;
      originLink.textContent = 'Go to Equation ' + definition.origin;
    } else {
      originLink.removeAttribute('href');
      originLink.textContent = '';
    }
    popup.hidden = false;
    trigger.setAttribute('aria-expanded', 'true');
    position();
    if (focus) closeButton.focus({ preventScroll: true });
  }
  function scheduleClose() {
    clearTimer();
    if (pinned) return;
    timer = setTimeout(() => {
      if (popup.matches(':hover') || popup.contains(document.activeElement)) return;
      if (current && (current.matches(':hover') || current === document.activeElement)) return;
      close();
    }, 180);
  }

  triggers.forEach(trigger => {
    const definition = definitions[trigger.dataset.variable];
    if (!definition) return;
    trigger.setAttribute('tabindex', '0');
    trigger.setAttribute('role', 'button');
    trigger.setAttribute('aria-label', definition.title + '. Show explanation.');
    trigger.setAttribute('aria-haspopup', 'dialog');
    trigger.setAttribute('aria-controls', popup.id);
    trigger.setAttribute('aria-expanded', 'false');
    trigger.addEventListener('pointerenter', () => open(trigger));
    trigger.addEventListener('pointerleave', scheduleClose);
    trigger.addEventListener('focus', () => { if (!returningFocus) open(trigger); });
    trigger.addEventListener('blur', scheduleClose);
    trigger.addEventListener('click', event => { event.stopPropagation(); open(trigger, true, true); });
    trigger.addEventListener('keydown', event => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault(); event.stopPropagation(); open(trigger, true, true);
      }
    });
  });
  popup.addEventListener('pointerenter', clearTimer);
  popup.addEventListener('pointerleave', scheduleClose);
  popup.addEventListener('focusin', clearTimer);
  popup.addEventListener('focusout', scheduleClose);
  closeButton.addEventListener('click', () => close(true));
  originLink.addEventListener('click', event => {
    event.preventDefault();
    const target = document.querySelector(originLink.getAttribute('href'));
    close();
    if (!target) return;
    const region = target.querySelector('.formula-scroll');
    if (region) region.focus({ preventScroll: true });
    target.scrollIntoView({ behavior: 'auto', block: 'start' });
  });
  document.addEventListener('pointerdown', event => {
    if (!popup.hidden && !popup.contains(event.target) && !(current && current.contains(event.target))) close();
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && !popup.hidden) { event.preventDefault(); close(popup.contains(document.activeElement)); }
  });
  document.addEventListener('scroll', () => { if (!popup.hidden) { if (pinned) position(); else close(); } }, true);
  window.addEventListener('resize', position);
})();

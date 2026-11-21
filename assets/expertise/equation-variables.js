(() => {
  'use strict';

  const definitions = {
  "index-word": {
    "title": "w: Which Word?",
    "origin": null,
    "meaning": "The subscript w identifies the word being scored. In f_w it selects that word’s frequency, and in s_w it selects the score for the same word.",
    "calculation": "For example, choosing the word “payment” means using its lookup frequency and calculating its word score."
  },
  "index-task": {
    "title": "t: Which Task?",
    "origin": null,
    "meaning": "The subscript t identifies one task statement. T_t is that task’s mean score, and K_t is the number of retained word occurrences in that task.",
    "calculation": "Each O*NET task statement is scored separately before its score is averaged with the other tasks for the occupation."
  },
  "index-occurrence": {
    "title": "k: Which Word Occurrence?",
    "origin": null,
    "meaning": "The index k identifies a retained word occurrence within a task. The sum runs from k = 1 through k = K_t.",
    "calculation": "In the cashier example, k = 1 is “receive,” k = 2 is “payment,” and so on. A repeated word occurrence counts again."
  },
  "index-occupation": {
    "title": "j: Which Occupation?",
    "origin": null,
    "meaning": "The subscript j identifies one six-digit SOC occupation in the final sample. Its expertise, wage, and unexplained wage component all use the same j.",
    "calculation": "There is one regression observation per SOC occupation. The baseline contains 752 occupations."
  },
  "subscript-score": {
    "title": "Q: Which Variable’s Spread?",
    "origin": null,
    "meaning": "The Q in the subscript of σ_Q identifies the variable whose standard deviation is being calculated: the raw occupation score Q.",
    "calculation": "This is the sample standard deviation of raw scores across occupations, rather than the standard deviation of wages."
  },
  "log-base": {
    "title": "10: The Logarithm’s Base",
    "origin": null,
    "meaning": "The subscript 10 means a base-10 logarithm. log₁₀(10) = 1 and log₁₀(100) = 2.",
    "calculation": "A tenfold increase in f_w + 1 adds one to the logarithm. The outside multiplier then turns that into ten score points."
  },
  "score-multiplier": {
    "title": "Why Multiply by 10?",
    "origin": null,
    "meaning": "Multiplying by 10 sets the score’s units. A one-unit difference on the base-10 log scale becomes a ten-point difference on the score scale.",
    "calculation": "It is a fixed scaling choice in the class lookup, rather than a coefficient estimated from wages."
  },
  "frequency-offset": {
    "title": "Why Add 1 to Frequency?",
    "origin": null,
    "meaning": "Adding 1 makes the quantity inside the logarithm positive even when frequency is zero. log₁₀(0 + 1) = 0, while log₁₀(0) is undefined.",
    "calculation": "The +1 also changes distances between low-frequency words, so it is part of the score construction, not simply a change of units. Unmatched words still follow the separate score-of-35 rule."
  },
  "score-offset": {
    "title": "Why Add 4?",
    "origin": null,
    "meaning": "Adding 4 moves the log-frequency scale upward before multiplying by 10. It therefore adds 40 points to every score calculated by this formula.",
    "calculation": "This sets the starting level of the class lookup scale. For a frequency of zero, the complete formula gives 10 × (log₁₀(1) + 4) = 40. The constant is not estimated from the wage data."
  },
  "sum-start": {
    "title": "1: Where the Sum Starts",
    "origin": null,
    "meaning": "The sum starts at the first retained word occurrence, k = 1, and continues through the last occurrence, k = K_t.",
    "calculation": "This 1 is a counting starting point. K_t tells the calculation how many word occurrences to include."
  },
  "word-score": {
    "title": "Word Frequency Score",
    "meaning": "A higher score means a word is more frequent in the SUBTLEX reference. Lower scores point toward rarer vocabulary.",
    "origin": 1,
    "calculation": ""
  },
  "frequency": {
    "title": "Frequency per Million Words",
    "meaning": "The word frequency reported by SUBTLEX, expressed per million words.",
    "origin": null,
    "calculation": ""
  },
  "task-score": {
    "title": "Mean Task Score",
    "meaning": "The average frequency score of the retained word occurrences in a task.",
    "origin": 2,
    "calculation": ""
  },
  "word-count": {
    "title": "Number of Retained Words",
    "meaning": "The number of word occurrences kept in the cleaned task. Repeated occurrences count again.",
    "origin": null,
    "calculation": ""
  },
  "raw-score": {
    "title": "Raw Occupation Score",
    "meaning": "The task-frequency score after averaging tasks within titles and titles within a SOC occupation.",
    "origin": 3,
    "calculation": ""
  },
  "expertise": {
    "title": "Standardized Expertise",
    "meaning": "The raw occupation score, centered and scaled using the final sample, then reversed so higher means more specialized vocabulary.",
    "origin": 3,
    "calculation": ""
  },
  "score-sd": {
    "title": "Sample Standard Deviation",
    "meaning": "The unweighted sample standard deviation of raw scores across the final SOC sample, using n minus 1 in its denominator.",
    "origin": null,
    "calculation": ""
  },
  "wage": {
    "title": "Occupation Mean Wage",
    "meaning": "Published mean hourly wage, or annual mean pay divided by 2,080 when an hourly mean is unavailable.",
    "origin": 4,
    "calculation": ""
  },
  "log-wage": {
    "title": "Log Mean Wage",
    "meaning": "The natural log of the occupation mean wage. It compresses large wage values and expresses proportional wage differences on an additive scale.",
    "origin": 4,
    "calculation": "For example, doubling pay from $10 to $20 or from $20 to $40 adds the same amount to log wages: ln(2). A fitted log-wage difference can be converted to a percentage using 100 × (exp(β) − 1)."
  },
  "intercept": {
    "title": "Starting Wage Level",
    "meaning": "The fitted log wage when standardized expertise is zero, meaning expertise is at the sample average.",
    "origin": 5,
    "calculation": "Estimated together with the expertise coefficient using the occupation data."
  },
  "slope": {
    "title": "Expertise–Wage Slope",
    "meaning": "The fitted log-wage difference associated with one standard deviation more measured expertise.",
    "origin": 5,
    "calculation": "Estimated from the data. It describes an association, not a causal return to changing a worker’s expertise."
  },
  "error": {
    "title": "Unexplained Wage Variation",
    "meaning": "Differences in log wages that the bivariate relationship does not explain.",
    "origin": null,
    "calculation": ""
  },
  "natural-log": {
    "title": "Why Use the Natural Log?",
    "origin": 4,
    "meaning": "The natural log compresses the wage scale and makes proportional differences easier to compare.",
    "calculation": "Doubling pay from $10 to $20 or from $20 to $40 adds ln(2) to log wages. A regression coefficient in log points converts to a percentage as 100 × (exp(β) − 1)."
  },
  "reverse-sign": {
    "title": "Why the Minus Sign?",
    "origin": 3,
    "meaning": "The raw frequency score is lower for less common vocabulary. The minus sign reverses that direction so higher final scores mean greater measured expertise.",
    "calculation": "Standardizing alone changes the units but keeps the direction. Multiplying by −1 is what reverses the scale."
  },
  "mean-score": {
    "title": "Average Raw Occupation Score",
    "origin": 3,
    "meaning": "The unweighted average raw score across the final SOC occupation sample.",
    "calculation": "Subtracting this mean centers the expertise measure at zero before dividing by the sample standard deviation and reversing its sign."
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

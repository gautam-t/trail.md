/* Resume parser mock — client-side only, no server.
 *
 * Flow: pick a role -> drop a PDF -> extract its text layer with PDF.js ->
 * keyword-match against the role's required skills -> render score + gaps.
 * The file is read as an ArrayBuffer in the page; nothing is uploaded.
 */

/* ---------------------------------------------------------------- data ---- */

/* Each skill has the name we display and the strings we look for. Aliases are
   matched as whole words (see buildMatcher), so "react" won't fire on
   "reactive". Keep aliases specific: a bare "go" or "less" matches prose. */
const SKILLS = [
  { name: 'JavaScript',        aliases: ['javascript', 'js', 'es6', 'ecmascript'] },
  { name: 'TypeScript',        aliases: ['typescript', 'ts'] },
  { name: 'React',             aliases: ['react', 'react.js', 'reactjs'] },
  { name: 'Next.js',           aliases: ['next.js', 'nextjs'] },
  { name: 'Vue',               aliases: ['vue', 'vue.js', 'vuejs'] },
  { name: 'HTML',              aliases: ['html', 'html5'] },
  { name: 'CSS',               aliases: ['css', 'css3', 'scss', 'sass'] },
  { name: 'Responsive design', aliases: ['responsive', 'mobile-first', 'media queries'] },
  { name: 'Accessibility',     aliases: ['accessibility', 'a11y', 'wcag', 'aria'] },
  { name: 'Node.js',           aliases: ['node.js', 'nodejs', 'node'] },
  { name: 'Express',           aliases: ['express', 'express.js'] },
  { name: 'REST APIs',         aliases: ['rest', 'restful', 'rest api', 'rest apis'] },
  { name: 'GraphQL',           aliases: ['graphql', 'apollo'] },
  { name: 'SQL',               aliases: ['sql', 'postgres', 'postgresql', 'mysql'] },
  { name: 'MongoDB',           aliases: ['mongodb', 'mongo', 'mongoose'] },
  { name: 'Python',            aliases: ['python', 'django', 'flask', 'fastapi'] },
  { name: 'Java',              aliases: ['java', 'spring', 'spring boot'] },
  { name: 'Go',                aliases: ['golang'] },
  { name: 'Testing',           aliases: ['jest', 'vitest', 'mocha', 'cypress', 'playwright', 'unit test', 'testing'] },
  { name: 'CI/CD',             aliases: ['ci/cd', 'ci cd', 'github actions', 'jenkins', 'circleci', 'pipeline'] },
  { name: 'Docker',            aliases: ['docker', 'container'] },
  { name: 'Kubernetes',        aliases: ['kubernetes', 'k8s'] },
  { name: 'AWS',               aliases: ['aws', 'amazon web services', 'ec2', 's3', 'lambda'] },
  { name: 'Git',               aliases: ['git', 'github', 'gitlab', 'version control'] },
  { name: 'Design tooling',    aliases: ['figma', 'sketch', 'adobe xd', 'photoshop'] },
  { name: 'Webpack/Vite',      aliases: ['webpack', 'vite', 'rollup', 'bundler', 'babel'] },
];

/* What each role is graded on. Score = matched required / total required.
   Skills detected but not required show up as bonus skills. */
const ROLES = {
  frontend: {
    label: 'Frontend Engineer',
    required: ['JavaScript', 'TypeScript', 'React', 'HTML', 'CSS', 'Responsive design',
               'Accessibility', 'REST APIs', 'Testing', 'Git', 'Webpack/Vite', 'Next.js'],
  },
  backend: {
    label: 'Backend Engineer',
    required: ['Node.js', 'Express', 'REST APIs', 'SQL', 'MongoDB', 'Testing', 'Git',
               'CI/CD', 'Docker', 'AWS', 'Python', 'GraphQL'],
  },
  fullstack: {
    label: 'Full-stack Developer',
    required: ['JavaScript', 'TypeScript', 'React', 'HTML', 'CSS', 'Node.js', 'Express',
               'REST APIs', 'SQL', 'Testing', 'Git', 'Docker'],
  },
};

/* Enough text to exercise the sample button without a PDF to hand. */
const SAMPLE_TEXT = `
Jane Doe — Frontend Developer
jane@example.com | github.com/janedoe

Summary
Product-minded frontend developer with 4 years building React applications.
Comfortable owning a feature from Figma designs through to deployment.

Experience
Frontend Developer, Northwind (2022–present)
- Rebuilt the checkout flow in React and TypeScript, cutting bundle size by 30%
- Wrote component tests with Jest and end-to-end coverage in Cypress


- Ran builds on Vite and shipped via GitHub Actions

Junior Developer, Acme (2020-2022)
- Maintained a REST API in Node.js and Express backed by PostgreSQL
- Used Git for version control across a team of six

Skills
JavaScript, TypeScript, React, HTML5, CSS3, Sass, Jest, Cypress, Git, Vite,
Figma, REST APIs, Node.js, PostgreSQL
`;

/* ------------------------------------------------------------- matching --- */

/* Turn an alias into a regex that only matches whole tokens. Instead of a
   lookbehind, consume one non-word char (or the string start) before the
   alias and reject any word char straight after it. */
function buildMatcher(alias) {
  const escaped = alias.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return new RegExp(`(?:^|[^a-z0-9+#])${escaped}(?![a-z0-9+#])`, 'i');
}

const MATCHERS = SKILLS.map(skill => ({
  name: skill.name,
  patterns: skill.aliases.map(buildMatcher),
}));

function detectSkills(rawText) {
  // PDF text layers break lines mid-phrase; collapse all whitespace to single
  // spaces so "unit\ntest" still matches the alias "unit test".
  const haystack = rawText.replace(/\s+/g, ' ');
  return MATCHERS
    .filter(matcher => matcher.patterns.some(re => re.test(haystack)))
    .map(matcher => matcher.name);
}

/* --------------------------------------------------------------- parsing -- */

async function extractText(file) {
  if (typeof pdfjsLib === 'undefined') {
    throw new Error('The PDF engine did not load — check your connection, or use the sample resume.');
  }

  const buffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: buffer }).promise;

  let text = '';
  for (let pageNo = 1; pageNo <= pdf.numPages; pageNo++) {
    const page = await pdf.getPage(pageNo);
    const content = await page.getTextContent();
    text += content.items.map(item => item.str).join(' ') + '\n';
  }
  return text;
}

/* ------------------------------------------------------------- animation -- */

/* Count the dial up to its target. --score stays a unitless number; the CSS
   multiplies it by 1% itself. */
function animateDial(ringEl, valueEl, target) {
  const render = value => {
    ringEl.style.setProperty('--score', value);
    valueEl.innerHTML = `${Math.round(value)}<span class="score-unit">%</span>`;
  };

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    render(target);
    return;
  }

  const duration = 750;
  const start = performance.now();
  const step = now => {
    const t = Math.min((now - start) / duration, 1);
    render(target * (1 - Math.pow(1 - t, 3)));   // ease-out cubic
    if (t < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}

/* ------------------------------------------------------------------- ui --- */

const els = {
  role: document.getElementById('role'),
  dropzone: document.getElementById('dropzone'),
  file: document.getElementById('file'),
  sample: document.getElementById('sample'),
  status: document.getElementById('status'),
  results: document.getElementById('results'),
  ring: document.getElementById('ring'),
  score: document.getElementById('out-score'),
  verdict: document.getElementById('out-verdict'),
  filename: document.getElementById('out-filename'),
  sub: document.getElementById('out-sub'),
  note: document.getElementById('out-note'),
  presentList: document.getElementById('out-present'),
  missingList: document.getElementById('out-missing'),
  presentPill: document.getElementById('out-present-pill'),
  missingPill: document.getElementById('out-missing-pill'),
  presentCount: document.getElementById('out-present-count'),
  missingCount: document.getElementById('out-missing-count'),
  presentBar: document.getElementById('bar-present'),
  missingBar: document.getElementById('bar-missing'),
  hint: document.getElementById('out-hint'),
  again: document.getElementById('again'),
};

function setStatus(message, isError = false) {
  if (!message) {
    els.status.hidden = true;
    els.status.textContent = '';
    return;
  }
  els.status.hidden = false;
  els.status.textContent = message;
  els.status.classList.toggle('is-error', isError);
}

function fillChips(listEl, names, kind, emptyMessage) {
  listEl.innerHTML = '';
  if (!names.length) {
    const li = document.createElement('li');
    li.className = 'chip chip-empty';
    li.textContent = emptyMessage;
    listEl.appendChild(li);
    return;
  }
  for (const name of names) {
    const li = document.createElement('li');
    li.className = `chip chip-${kind}`;
    li.textContent = name;    // textContent, not innerHTML: these names come
    listEl.appendChild(li);   // from text we did not write
  }
}

function scoreVerdict(pct) {
  if (pct >= 80) return { text: 'Strong match', cls: 'badge-good' };
  if (pct >= 60) return { text: 'Good match', cls: 'badge-good' };
  if (pct >= 40) return { text: 'Partial match', cls: 'badge-mid' };
  return { text: 'Weak match', cls: 'badge-bad' };
}

function render({ filename, roleKey, text }) {
  // Kept so the role dropdown can re-score the same parse.
  els.lastText = text;
  els.lastFilename = filename;

  const role = ROLES[roleKey] || ROLES.frontend;
  const detected = detectSkills(text);

  const present = role.required.filter(name => detected.includes(name));
  const missing = role.required.filter(name => !detected.includes(name));
  const bonus = detected.filter(name => !role.required.includes(name));

  const pct = Math.round((present.length / role.required.length) * 100);
  const verdict = scoreVerdict(pct);

  els.filename.textContent = filename;
  els.sub.textContent = `Scored against ${role.label}`;

  animateDial(els.ring, els.score, pct);

  els.verdict.textContent = verdict.text;
  els.verdict.className = `badge ${verdict.cls}`;

  const bonusNote = bonus.length
    ? ` Plus ${bonus.length} bonus skill${bonus.length === 1 ? '' : 's'} outside the role.`
    : '';
  els.note.textContent =
    `${present.length} of ${role.required.length} required skills found — ` +
    `${pct}% coverage.${bonusNote}`;

  els.presentPill.textContent = `${present.length} found`;
  els.missingPill.textContent = `${missing.length} gap${missing.length === 1 ? '' : 's'}`;
  els.presentCount.textContent = present.length;
  els.missingCount.textContent = missing.length;

  els.presentBar.style.setProperty('--pct', pct);
  els.missingBar.style.setProperty('--pct', 100 - pct);

  fillChips(els.presentList, present, 'present', 'No required skills matched yet.');
  fillChips(els.missingList, missing, 'missing', 'Nothing missing — full coverage.');

  els.hint.textContent = bonus.length
    ? `Bonus skills found: ${bonus.join(', ')}.`
    : 'Add the missing skills to the resume to raise the score.';

  els.results.hidden = false;
}

/* --------------------------------------------------------------- handlers - */

async function handleFile(file) {
  if (!file) return;

  if (file.type && file.type !== 'application/pdf') {
    setStatus(`"${file.name}" is not a PDF. Export the resume as PDF and try again.`, true);
    return;
  }
  if (file.size > 10 * 1024 * 1024) {
    setStatus('That file is over 10 MB — try a smaller export.', true);
    return;
  }

  setStatus(`Reading ${file.name}…`);

  try {
    const text = await extractText(file);

    if (text.replace(/\s/g, '').length < 40) {
      // Most common cause: a scanned or image-only PDF, which has no text layer.
      setStatus('No text found in that PDF — it looks scanned. Try a text-based export.', true);
      els.results.hidden = true;
      return;
    }

    setStatus('');
    render({ filename: file.name, roleKey: els.role.value, text });
    els.results.scrollIntoView({ behavior: 'smooth', block: 'start' });
  } catch (err) {
    console.error(err);
    setStatus(err.message || 'Could not read that PDF.', true);
    els.results.hidden = true;
  }
}

els.dropzone.addEventListener('click', () => els.file.click());

els.dropzone.addEventListener('keydown', event => {
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault();
    els.file.click();
  }
});

els.file.addEventListener('change', event => {
  handleFile(event.target.files[0]);
  event.target.value = '';    // so re-picking the same file fires again
});

['dragenter', 'dragover'].forEach(type => {
  els.dropzone.addEventListener(type, event => {
    event.preventDefault();
    els.dropzone.classList.add('is-over');
  });
});

['dragleave', 'drop'].forEach(type => {
  els.dropzone.addEventListener(type, event => {
    event.preventDefault();
    els.dropzone.classList.remove('is-over');
  });
});

els.dropzone.addEventListener('drop', event => {
  handleFile(event.dataTransfer && event.dataTransfer.files[0]);
});

els.sample.addEventListener('click', () => {
  setStatus('');
  render({ filename: 'sample-resume.pdf', roleKey: els.role.value, text: SAMPLE_TEXT });
  els.results.scrollIntoView({ behavior: 'smooth', block: 'start' });
});

// Re-score the same text against a different role, without re-uploading.
els.role.addEventListener('change', () => {
  if (!els.results.hidden && els.lastText) {
    render({ filename: els.lastFilename, roleKey: els.role.value, text: els.lastText });
  }
});

els.again.addEventListener('click', () => {
  els.results.hidden = true;
  setStatus('');
  document.getElementById('upload').scrollIntoView({ behavior: 'smooth', block: 'center' });
});

/* ------------------------------------------------------------------ init -- */

if (typeof pdfjsLib !== 'undefined') {
  pdfjsLib.GlobalWorkerOptions.workerSrc =
    'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
} else {
  setStatus('PDF engine unavailable — the sample resume still works.', true);
}

import { SKILLS, ROLES } from './skills.js';

/* Build a regex that only matches a whole token. Instead of a lookbehind,
   consume one non-word char (or the string start) before the alias and reject
   any word char straight after it. */
function buildMatcher(alias) {
  const escaped = alias.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return new RegExp(`(?:^|[^a-z0-9+#])${escaped}(?![a-z0-9+#])`, 'i');
}

const MATCHERS = SKILLS.map(skill => ({
  name: skill.name,
  patterns: skill.aliases.map(buildMatcher),
}));

/* Returns the names of every skill mentioned in `rawText`. */
export function detectSkills(rawText) {
  // PDF text layers break lines mid-phrase; collapse whitespace to single
  // spaces first so "unit\ntest" still matches the alias "unit test".
  const haystack = rawText.replace(/\s+/g, ' ');
  return MATCHERS
    .filter(matcher => matcher.patterns.some(re => re.test(haystack)))
    .map(matcher => matcher.name);
}

/* The whole scoring step, kept as a pure function so it can be unit tested or
   swapped for a real parser later without touching any UI code. */
export function scoreResume(text, roleKey) {
  const role = ROLES[roleKey] ?? ROLES.frontend;
  const detected = detectSkills(text);

  const present = role.required.filter(name => detected.includes(name));
  const missing = role.required.filter(name => !detected.includes(name));
  const bonus = detected.filter(name => !role.required.includes(name));

  const pct = Math.round((present.length / role.required.length) * 100);

  return { role, present, missing, bonus, pct };
}

/* Thresholds live here rather than in a component so the wording is easy to
   change in one place. */
export function verdictFor(pct) {
  if (pct >= 80) return { text: 'Strong match', tone: 'good' };
  if (pct >= 60) return { text: 'Good match', tone: 'good' };
  if (pct >= 40) return { text: 'Partial match', tone: 'warn' };
  return { text: 'Weak match', tone: 'bad' };
}

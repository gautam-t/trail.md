import ScoreDial from './ScoreDial.jsx';
import SkillChips from './SkillChips.jsx';
import { verdictFor } from '../match.js';

export default function ResultsPanel({ result, onReset }) {
  const { filename, role, present, missing, bonus, pct } = result;
  const verdict = verdictFor(pct);

  return (
    <section className="results">

      <article className="card">
        <div className="result-head">
          <div className="file-meta">
            <span className="file-name">{filename}</span>
            <span className="file-sub">Scored against {role.label}</span>
          </div>
          <span className={`badge badge-${verdict.tone}`}>{verdict.text}</span>
        </div>

        <div className="score">
          <ScoreDial value={pct} />
          <div className="score-copy">
            <p className="score-label">Overall match score</p>
            <p className="score-note">
              {present.length} of {role.required.length} required skills found
              {' — '}{pct}% coverage.
              {bonus.length > 0 && (
                <> Plus {bonus.length} bonus skill{bonus.length === 1 ? '' : 's'} outside the role.</>
              )}
            </p>
          </div>
        </div>

        <div className="meters">
          <Meter label="Skills present" value={present.length} pct={pct} tone="present" />
          <Meter label="Skills missing" value={missing.length} pct={100 - pct} tone="missing" />
        </div>
      </article>

      <article className="card">
        <div className="skills-head">
          <h2 className="card-title">Skills present</h2>
          <span className="pill pill-present">{present.length} found</span>
        </div>
        <SkillChips
          names={present}
          kind="present"
          emptyMessage="No required skills matched yet."
        />
      </article>

      <article className="card">
        <div className="skills-head">
          <h2 className="card-title">Skills missing</h2>
          <span className="pill pill-missing">
            {missing.length} gap{missing.length === 1 ? '' : 's'}
          </span>
        </div>
        <SkillChips
          names={missing}
          kind="missing"
          emptyMessage="Nothing missing — full coverage."
        />
        <p className="hint">
          {bonus.length > 0
            ? `Bonus skills found: ${bonus.join(', ')}.`
            : 'Add the missing skills to the resume to raise the score.'}
        </p>
      </article>

      <div className="results-actions">
        <button className="btn btn-primary" type="button" onClick={onReset}>
          Score another resume
        </button>
      </div>

    </section>
  );
}

function Meter({ label, value, pct, tone }) {
  return (
    <div className="meter">
      <div className="meter-head">
        <span>{label}</span>
        <span className="meter-count">{value}</span>
      </div>
      <div className="meter-track">
        <div className={`meter-fill fill-${tone}`} style={{ '--pct': pct }} />
      </div>
    </div>
  );
}

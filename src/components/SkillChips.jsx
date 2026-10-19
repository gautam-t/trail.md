/* One row of skill pills. `kind` is "present" or "missing" and only picks the
   chip colour. */
export default function SkillChips({ names, kind, emptyMessage }) {
  if (!names.length) {
    return (
      <ul className="chips">
        <li className="chip chip-empty">{emptyMessage}</li>
      </ul>
    );
  }

  return (
    <ul className="chips">
      {names.map(name => (
        // React escapes text children, so resume text can't inject markup here.
        <li key={name} className={`chip chip-${kind}`}>{name}</li>
      ))}
    </ul>
  );
}

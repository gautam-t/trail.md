import { useRef, useState } from 'react';
import { ROLES } from '../skills.js';

export default function UploadPanel({
  roleKey, onRoleChange, onFile, onSample, status, busy,
}) {
  const inputRef = useRef(null);
  const [isOver, setIsOver] = useState(false);

  function handleDrop(event) {
    event.preventDefault();
    setIsOver(false);
    onFile(event.dataTransfer?.files?.[0]);
  }

  return (
    <section className="panel" id="upload">
      <div className="panel-row">
        <label className="field">
          <span className="field-label">Target role</span>
          <select
            className="select"
            value={roleKey}
            disabled={busy}
            onChange={event => onRoleChange(event.target.value)}
          >
            {Object.entries(ROLES).map(([key, role]) => (
              <option key={key} value={key}>{role.label}</option>
            ))}
          </select>
        </label>
      </div>

      <div
        className={`dropzone${isOver ? ' is-over' : ''}`}
        tabIndex={0}
        role="button"
        aria-label="Upload a resume PDF"
        onClick={() => inputRef.current?.click()}
        onKeyDown={event => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            inputRef.current?.click();
          }
        }}
        onDragEnter={event => { event.preventDefault(); setIsOver(true); }}
        onDragOver={event => { event.preventDefault(); setIsOver(true); }}
        onDragLeave={event => { event.preventDefault(); setIsOver(false); }}
        onDrop={handleDrop}
      >
        <span className="dropzone-icon">&uarr;</span>
        <span className="dropzone-label">Drag a PDF here, or click to browse</span>
        <span className="dropzone-hint">
          PDF only &middot; up to 10 MB &middot; stays on your machine
        </span>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="application/pdf,.pdf"
        hidden
        onChange={event => {
          onFile(event.target.files[0]);
          // Clear it, so re-picking the same file fires change again.
          event.target.value = '';
        }}
      />

      <p className="alt-action">
        No PDF handy?{' '}
        <button className="btn-link" type="button" onClick={onSample}>
          Try a sample resume
        </button>
      </p>

      {status && (
        <p className={`status${status.isError ? ' is-error' : ''}`} role="status" aria-live="polite">
          {status.message}
        </p>
      )}
    </section>
  );
}

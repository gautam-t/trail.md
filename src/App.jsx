import { useState } from 'react';
import UploadPanel from './components/UploadPanel.jsx';
import ResultsPanel from './components/ResultsPanel.jsx';
import { scoreResume } from './match.js';
import { extractText } from './pdf.js';
import { SAMPLE_TEXT } from './skills.js';

export default function App() {
  const [roleKey, setRoleKey] = useState('frontend');
  const [source, setSource] = useState(null);      // { text, filename }
  const [result, setResult] = useState(null);      // scoreResume() output + filename
  const [status, setStatus] = useState(null);      // { message, isError }
  const [busy, setBusy] = useState(false);

  /* Every path that produces a result goes through here, so the shape of
     `result` is defined in exactly one place. */
  function score(text, filename, key = roleKey) {
    setResult({ filename, ...scoreResume(text, key) });
  }

  async function handleFile(file) {
    if (!file) return;
    setBusy(true);
    setStatus({ message: `Reading ${file.name}…`, isError: false });
    try {
      const text = await extractText(file);
      setSource({ text, filename: file.name });
      score(text, file.name);
      setStatus(null);
    } catch (err) {
      setResult(null);
      setStatus({ message: err.message, isError: true });
    } finally {
      setBusy(false);
    }
  }

  function handleSample() {
    setSource({ text: SAMPLE_TEXT, filename: 'sample-resume.pdf' });
    score(SAMPLE_TEXT, 'sample-resume.pdf');
    setStatus(null);
  }

  /* Changing the role re-scores the text we already parsed, so the learner
     does not have to upload the file again. */
  function handleRoleChange(next) {
    setRoleKey(next);
    if (source) score(source.text, source.filename, next);
  }

  function handleReset() {
    setResult(null);
    setSource(null);
    setStatus(null);
    document.getElementById('upload')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  return (
    <>
      <header className="topbar">
        <div className="brand">
          <span className="brand-mark">RP</span>
          <span className="brand-name">Resume Parser</span>
        </div>
        <a className="btn btn-ghost" href="#upload">Upload resume</a>
      </header>

      <main>
        <section className="hero">
          <p className="eyebrow">Runs entirely in your browser</p>
          <h1 className="hero-title">
            Drop in a resume.<br />
            See the skills you&rsquo;re missing.
          </h1>
          <p className="hero-sub">
            Pick the role you&rsquo;re applying for, upload a PDF, and get a match
            score broken down into the skills present and the gaps worth closing.
          </p>
        </section>

        <UploadPanel
          roleKey={roleKey}
          onRoleChange={handleRoleChange}
          onFile={handleFile}
          onSample={handleSample}
          status={status}
          busy={busy}
        />

        {result && <ResultsPanel result={result} onReset={handleReset} />}
      </main>

      <footer className="foot">
        Parsed locally with PDF.js &middot; no file leaves the page
      </footer>
    </>
  );
}

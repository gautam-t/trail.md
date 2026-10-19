import { useEffect, useState } from 'react';

/* The score dial. The ring itself is pure CSS — a conic-gradient painted to
   --score percent with an ::after disc punched through the middle. React only
   animates the number. */
export default function ScoreDial({ value }) {
  const [shown, setShown] = useState(value);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setShown(value);
      return;
    }

    let frame = 0;
    const duration = 750;
    const start = performance.now();

    const step = now => {
      const t = Math.min((now - start) / duration, 1);
      setShown(value * (1 - Math.pow(1 - t, 3)));   // ease-out cubic
      if (t < 1) frame = requestAnimationFrame(step);
    };
    frame = requestAnimationFrame(step);

    return () => cancelAnimationFrame(frame);
  }, [value]);

  return (
    <div className="score-ring" style={{ '--score': shown }}>
      <span className="score-value">
        {Math.round(shown)}
        <span className="score-unit">%</span>
      </span>
    </div>
  );
}

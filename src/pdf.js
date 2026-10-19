import * as pdfjsLib from 'pdfjs-dist';
// The worker is a separate file pdf.js runs off the main thread. Vite's `?url`
// import resolves it to a real URL at build time, so the path works in dev and
// in a production build without a CDN.
import workerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url';

pdfjsLib.GlobalWorkerOptions.workerSrc = workerUrl;

export const MAX_BYTES = 10 * 1024 * 1024;

/* Pull the text layer out of a PDF File and hand back one string.
   Throws a TypeError-ish Error with a readable message on bad input, so the
   caller can show err.message directly. */
export async function extractText(file) {
  if (file.type && file.type !== 'application/pdf') {
    throw new Error(`"${file.name}" is not a PDF. Export the resume as PDF and try again.`);
  }
  if (file.size > MAX_BYTES) {
    throw new Error('That file is over 10 MB — try a smaller export.');
  }

  const buffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: buffer }).promise;

  let text = '';
  for (let pageNo = 1; pageNo <= pdf.numPages; pageNo++) {
    const page = await pdf.getPage(pageNo);
    const content = await page.getTextContent();
    text += content.items.map(item => item.str).join(' ') + '\n';
  }

  // A scanned PDF is images only, so it yields a text layer with nothing in
  // it. Catching that here gives a useful message instead of a 0% score.
  if (text.replace(/\s/g, '').length < 40) {
    throw new Error('No text found in that PDF — it looks scanned. Try a text-based export.');
  }

  return text;
}

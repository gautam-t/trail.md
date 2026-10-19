/* Skill dictionary and the roles a resume can be graded against.
 *
 * Each skill has the name shown in the UI and the strings we look for. Aliases
 * are matched as whole words (see match.js), so "react" won't fire on
 * "reactive". Keep aliases specific: a bare "go" or "less" matches prose. */

export const SKILLS = [
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

/* Score = matched required / total required. Anything detected but not
   required is reported as a bonus skill instead of counting toward the score. */
export const ROLES = {
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

/* The sample resume, so the app can be exercised without a PDF to hand. */
export const SAMPLE_TEXT = `Jane Doe — Frontend Developer
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
Figma, REST APIs, Node.js, PostgreSQL`;

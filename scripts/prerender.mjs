/* Runs after `vite build`. Bakes the page content into dist so it can be read
   without running JavaScript:
     - dist/index.html  gets the full static page + JSON-LD structured data
     - dist/llms.txt    plain-markdown version for AI assistants
     - dist/robots.txt, dist/sitemap.xml
   Everything is generated from src/data/content.jsx, the same data the app
   renders, so the two can never drift apart. */
import { createServer } from 'vite';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { readFile, writeFile } from 'node:fs/promises';

const SITE = 'https://hani.so';
const abs = (p) => (p.startsWith('http') ? p : SITE + p);

const vite = await createServer({ server: { middlewareMode: true }, appType: 'custom', logLevel: 'error' });
let StaticPage, things, profile, personalInfo;
try {
  ({ default: StaticPage } = await vite.ssrLoadModule('/src/StaticPage.jsx'));
  ({ things, profile } = await vite.ssrLoadModule('/src/data/content.jsx'));
  ({ personalInfo } = await vite.ssrLoadModule('/src/data/portfolioData.js'));
} finally {
  await vite.close();
}

const decode = (s) =>
  s.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#x27;/g, "'");
/* titles are JSX (they contain highlight spans); flatten them to plain text */
const text = (node) =>
  typeof node === 'string' ? node : decode(renderToStaticMarkup(node).replace(/<[^>]+>/g, '')).replace(/\s+/g, ' ').trim();
const noDot = (s) => s.replace(/\.$/, '');
const photosOf = (t) => [...(t.image ? [t.image] : []), ...(t.images || [])];

/* ---------- llms.txt ---------- */
const today = new Date().toISOString().slice(0, 10);
const md = [];
md.push(`# ${profile.name}`, '', `> ${profile.summary}`, '');
md.push(
  `This is the plain-text version of ${SITE}/, Hani Zaidi's personal portfolio. It contains everything on the page, including descriptions of the images. Last built: ${today}.`,
  '',
  '## Quick facts',
  '',
  `- Name: ${profile.name}`,
  `- School: ${profile.school} (OTHS), Grade 12`,
  `- Location: ${profile.location}`,
  `- Languages: ${profile.languages.join(', ')}`,
  `- Website: ${SITE}/`,
  `- Email: ${personalInfo.email}`,
  `- GitHub: ${personalInfo.social.github}`,
  `- LinkedIn: ${personalInfo.social.linkedin}`,
  `- Instagram: ${personalInfo.social.instagram}`,
  '',
);
const entryMd = (t, level) => {
  md.push(`${'#'.repeat(level)} ${text(t.title)}`, '');
  for (const p of t.body || []) md.push(p, '');
  for (const c of t.children || []) entryMd(c, level + 1);
  if (t.recommendations) md.push(`Resume and recommendation letters are private. Email ${personalInfo.email} for an access code.`, '');
  if (t.contact) md.push(`Email ${personalInfo.email}, or use the contact form at ${SITE}/.`, '');
  for (const ph of photosOf(t)) md.push(`- Image (${abs(ph.src)}): ${noDot(ph.alt)}.${ph.caption ? ` Caption: ${ph.caption}` : ''}`);
  if (photosOf(t).length) md.push('');
  if (t.link) md.push(`Link: [${t.link.label}](${t.link.href})`, '');
};
things.forEach((t) => entryMd(t, 2));
const llms = md.join('\n').replace(/\n{3,}/g, '\n\n').trim() + '\n';

/* ---------- JSON-LD ---------- */
const find = (needle) => things.find((t) => text(t.title).includes(needle));
const desc = (needle) => (find(needle)?.body || []).join(' ');
const person = {
  '@type': 'Person',
  '@id': `${SITE}/#hani`,
  name: profile.name,
  url: `${SITE}/`,
  image: abs(profile.photo.src),
  email: `mailto:${personalInfo.email}`,
  description: profile.summary,
  jobTitle: 'Software Engineer (co-op)',
  worksFor: { '@type': 'Organization', name: 'Precision e-Business Group', description: desc('Precision e-Business') },
  alumniOf: { '@type': 'HighSchool', name: profile.school },
  homeLocation: { '@type': 'Place', name: profile.location },
  knowsLanguage: profile.languages,
  award: ['Best Beginner Hack, 1st place in the Aramco Americas track, Hack the North 2026', 'Honor Roll, Oakville Trafalgar High School'],
  hasCredential: (find('Certified in')?.children || []).map((c) => ({
    '@type': 'EducationalOccupationalCredential',
    name: c.title,
    description: c.body.join(' '),
  })),
  sameAs: Object.values(personalInfo.social),
};
const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'ProfilePage',
      '@id': `${SITE}/`,
      url: `${SITE}/`,
      name: profile.name,
      inLanguage: 'en',
      dateModified: new Date().toISOString(),
      mainEntity: { '@id': person['@id'] },
    },
    person,
    {
      '@type': 'Organization',
      '@id': 'https://valantir.app/#org',
      name: 'Valantir',
      url: 'https://valantir.app',
      description: desc('Valantir'),
      founder: { '@id': person['@id'] },
    },
    {
      '@type': 'SoftwareApplication',
      name: 'Providence',
      url: 'https://devpost.com/software/providence-tn6m4h',
      applicationCategory: 'DeveloperApplication',
      description: desc('Hack the North'),
      author: { '@id': person['@id'] },
    },
    {
      '@type': 'ItemList',
      name: `What ${profile.name} has done`,
      itemListElement: things
        .filter((t) => t.body || t.children)
        .map((t, i) => ({
          '@type': 'ListItem',
          position: i + 1,
          name: text(t.title),
          description: [...(t.body || []), ...(t.children || []).map((c) => `${c.title}: ${c.body.join(' ')}`)].join(' '),
          ...(photosOf(t).length ? { image: photosOf(t).map((ph) => ({ '@type': 'ImageObject', contentUrl: abs(ph.src), description: ph.alt })) } : {}),
          ...(t.link ? { url: t.link.href } : {}),
        })),
    },
  ],
};

/* ---------- write ---------- */
const htmlPath = 'dist/index.html';
let html = await readFile(htmlPath, 'utf8');
for (const marker of ['<!--prerender:head-->', '<!--prerender:body-->']) {
  if (!html.includes(marker)) throw new Error(`prerender: ${marker} missing from ${htmlPath}`);
}
const ld = JSON.stringify(jsonLd).replace(/</g, '\\u003c');
html = html
  .replace('<!--prerender:head-->', `<script type="application/ld+json">${ld}</script>`)
  .replace('<!--prerender:body-->', renderToStaticMarkup(createElement(StaticPage)));
await writeFile(htmlPath, html);
await writeFile('dist/llms.txt', llms);
await writeFile(
  'dist/robots.txt',
  `# hani.so welcomes search engines and AI assistants.\n# A plain-text version of the site is at ${SITE}/llms.txt\nUser-agent: *\nAllow: /\n\nSitemap: ${SITE}/sitemap.xml\n`,
);
await writeFile(
  'dist/sitemap.xml',
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n  <url><loc>${SITE}/</loc><lastmod>${today}</lastmod></url>\n</urlset>\n`,
);
console.log(`prerender: index.html ${html.length} bytes, llms.txt ${llms.length} bytes`);

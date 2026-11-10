/* Static, script-free version of the whole page. scripts/prerender.mjs
   renders this into index.html at build time so crawlers, AI assistants and
   browsers without JavaScript get every word and every image description.
   Browsers with JavaScript never show it: they get the animated app. */
import { things, profile } from './data/content.jsx';
import { personalInfo } from './data/portfolioData';

// eslint-disable-next-line no-unused-vars -- Tag is used as a JSX element
function Entry({ t, Tag = 'h2' }) {
  const photos = [...(t.image ? [t.image] : []), ...(t.images || [])];
  return (
    <section className="static-item">
      <Tag>{t.title}</Tag>
      {t.body?.map((p, i) => <p key={i}>{p}</p>)}
      {t.children?.map((c, i) => <Entry key={i} t={c} Tag="h3" />)}
      {t.recommendations && (
        <p>
          My resume and recommendation letters from teachers and people I’ve worked with are private.{' '}
          <a href={`mailto:${personalInfo.email}`}>Email me</a> for an access code.
        </p>
      )}
      {t.contact && (
        <p>
          Email me at <a href={`mailto:${personalInfo.email}`}>{personalInfo.email}</a>.
        </p>
      )}
      {photos.map((ph) => (
        <figure key={ph.src}>
          <img src={ph.src} alt={ph.alt} loading="lazy" />
          <figcaption>{ph.caption ? `${ph.caption} ` : ''}Image: {ph.alt.replace(/\.$/, '')}.</figcaption>
        </figure>
      ))}
      {t.link && (
        <p>
          <a href={t.link.href}>{t.link.label}</a>
        </p>
      )}
    </section>
  );
}

export default function StaticPage() {
  return (
    <main className="page static-page">
      <header className="hero">
        <img className="avatar" src={profile.photo.src} alt={profile.photo.alt} />
        <h1 className="name">{profile.name}</h1>
      </header>
      <p className="static-summary">{profile.summary}</p>
      {things.map((t, i) => <Entry key={i} t={t} />)}
      <footer className="static-item">
        <h2>Links</h2>
        <ul>
          <li><a href={`mailto:${personalInfo.email}`}>Email: {personalInfo.email}</a></li>
          <li><a href={personalInfo.social.github} rel="me">GitHub</a></li>
          <li><a href={personalInfo.social.linkedin} rel="me">LinkedIn</a></li>
          <li><a href={personalInfo.social.instagram} rel="me">Instagram</a></li>
          <li><a href="/llms.txt">Plain-text version of this page (llms.txt)</a></li>
        </ul>
      </footer>
    </main>
  );
}

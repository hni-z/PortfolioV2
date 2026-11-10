import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Github, Linkedin, Instagram, ChevronDown, Loader2 } from 'lucide-react';
import { personalInfo } from './data/portfolioData';
import { things, asset } from './data/content.jsx';

const EASE = [0.22, 1, 0.36, 1];
const FORMSPREE_ID = (import.meta.env.VITE_FORMSPREE_ID || '').trim();

/* Resume + letters are served as AES-256-GCM ciphertext (see
   scripts/encrypt-private.mjs). The access code is the decryption password —
   it never leaves the browser, and the plaintext PDFs never exist on the
   server. A wrong code fails the GCM auth tag, so decryption just throws.
   The encrypted blobs are public but useless without the code. */
const PRIVATE_DIR = '/assets/private';

const b64ToBytes = (s) => Uint8Array.from(atob(s), (c) => c.charCodeAt(0));

async function deriveKey(password, salt, iterations) {
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(password),
    'PBKDF2',
    false,
    ['deriveKey'],
  );
  return crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt, iterations, hash: 'SHA-256' },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['decrypt'],
  );
}

/* Fetch the manifest, derive the key from the code, then download + decrypt
   every file. Throws if the code is wrong (GCM tag mismatch) or files are
   missing. Returns [{ label, filename, url }] with in-memory blob URLs. */
async function unlockPrivateFiles(code) {
  const res = await fetch(`${PRIVATE_DIR}/manifest.json`, { cache: 'no-store' });
  if (!res.ok) throw new Error('manifest unavailable');
  const manifest = await res.json();
  const key = await deriveKey(code, b64ToBytes(manifest.salt), manifest.iterations);

  return Promise.all(
    manifest.files.map(async (f) => {
      const enc = await fetch(`${PRIVATE_DIR}/${f.name}`, { cache: 'no-store' });
      if (!enc.ok) throw new Error(`missing ${f.name}`);
      const cipher = await enc.arrayBuffer();
      const plain = await crypto.subtle.decrypt(
        { name: 'AES-GCM', iv: b64ToBytes(f.iv) },
        key,
        cipher,
      );
      const url = URL.createObjectURL(new Blob([plain], { type: f.type || 'application/pdf' }));
      return { label: f.label, filename: f.filename, url };
    }),
  );
}

const socials = [
  { label: 'Email', href: `mailto:${personalInfo.email}`, Icon: Mail },
  { label: 'GitHub', href: personalInfo.social.github, Icon: Github },
  { label: 'LinkedIn', href: personalInfo.social.linkedin, Icon: Linkedin },
  { label: 'Instagram', href: personalInfo.social.instagram, Icon: Instagram },
];

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07, delayChildren: 0.12 } },
};
const itemV = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE } },
};

/* image with graceful placeholder if not uploaded yet */
function Figure({ src, alt }) {
  const [ok, setOk] = useState(true);
  return (
    <div className="figure">
      {ok ? (
        <img src={src} alt={alt} loading="lazy" onError={() => setOk(false)} />
      ) : (
        <div className="ph" role="img" aria-label={alt}>{alt}</div>
      )}
    </div>
  );
}

function Body({ body, image, images, link }) {
  return (
    <div className="body">
      {body?.map((p, i) => <p key={i}>{p}</p>)}
      {image && <Figure src={image.src} alt={image.alt} />}
      {images && (
        <div className="photo-gallery">
          {images.map((photo) => (
            <figure key={photo.src}>
              <a href={photo.src} target="_blank" rel="noopener noreferrer" aria-label={`View full image: ${photo.alt}`}>
                <img
                  src={photo.src}
                  alt={photo.alt}
                  loading="lazy"
                  style={{ objectFit: photo.contain ? 'contain' : 'cover', objectPosition: photo.position }}
                />
              </a>
              <figcaption>{photo.caption}</figcaption>
            </figure>
          ))}
        </div>
      )}
      {link && (
        <a className="link" href={link.href} target="_blank" rel="noopener noreferrer">
          {link.Icon && <link.Icon size={16} strokeWidth={1.75} />}
          {link.label} {!link.Icon && '↗'}
        </a>
      )}
    </div>
  );
}

function ContactForm() {
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [status, setStatus] = useState(null); // null | 'sending' | 'ok' | 'err'

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    setStatus('sending');
    try {
      if (FORMSPREE_ID) {
        const res = await fetch(`https://formspree.io/f/${FORMSPREE_ID}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          body: JSON.stringify(form),
        });
        if (!res.ok) throw new Error('send failed');
      } else {
        const body = encodeURIComponent(`From: ${form.name} <${form.email}>\n\n${form.message}`);
        window.location.href = `mailto:${personalInfo.email}?subject=${encodeURIComponent('Hello from your site')}&body=${body}`;
      }
      setStatus('ok');
      setForm({ name: '', email: '', message: '' });
    } catch {
      setStatus('err');
    }
  };

  return (
    <form className="form" onSubmit={onSubmit}>
      <input name="name" value={form.name} onChange={onChange} placeholder="Your name" required />
      <input type="email" name="email" value={form.email} onChange={onChange} placeholder="Your email" required />
      <textarea name="message" value={form.message} onChange={onChange} placeholder="Say hi..." required />
      <button type="submit" disabled={status === 'sending'}>
        {status === 'sending' ? <Loader2 size={16} className="spin" /> : 'Send'}
      </button>
      {status === 'ok' && <div className="status">Sent! I’ll get back to you soon.</div>}
      {status === 'err' && <div className="status">Something went wrong. Use the direct link below.</div>}
      <div className="status">
        or email me directly:{' '}
        <a className="mail-link" href={`mailto:${personalInfo.email}`}>{personalInfo.email}</a>
      </div>
    </form>
  );
}

function Recommendations() {
  const [code, setCode] = useState('');
  const [status, setStatus] = useState('idle'); // idle | working | error | done
  const [files, setFiles] = useState([]);
  const [copied, setCopied] = useState(false);

  const onEmail = (e) => {
    if (navigator.clipboard) {
      e.preventDefault();
      navigator.clipboard.writeText(personalInfo.email).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 1800);
        window.location.href = `mailto:${personalInfo.email}`;
      });
    }
  };

  // revoke the in-memory blob URLs when they're replaced or the view unmounts
  useEffect(() => () => files.forEach((f) => URL.revokeObjectURL(f.url)), [files]);

  const onSubmit = async (e) => {
    e.preventDefault();
    const entered = code.trim();
    if (!entered) return;
    setStatus('working');
    try {
      const unlocked = await unlockPrivateFiles(entered);
      setFiles(unlocked);
      setStatus('done');
    } catch {
      // wrong code (GCM tag fails) or files unavailable — same message either way
      setStatus('error');
    }
  };

  if (status === 'done') {
    return (
      <div className="body">
        <p>Thanks for the interest. Here’s my resume and letters.</p>
        <div className="letters">
          {files.map((f, i) => (
            <a
              key={i}
              className="link"
              href={f.url}
              target="_blank"
              rel="noopener noreferrer"
              download={f.filename}
            >
              {f.label} ↗
            </a>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="body">
      <p>My resume and a few letters from teachers and people I’ve worked with. They’re private, so enter the access code I shared to open them.</p>
      <form className="form" onSubmit={onSubmit}>
        <input
          name="code"
          value={code}
          onChange={(e) => { setCode(e.target.value); if (status === 'error') setStatus('idle'); }}
          placeholder="Access code"
          required
        />
        <button type="submit" disabled={status === 'working'}>
          {status === 'working' ? <Loader2 size={16} className="spin" /> : 'Unlock'}
        </button>
        {status === 'error' && (
          <div className="status">
            That code isn’t right.{' '}
            <a className="mail-link" href={`mailto:${personalInfo.email}`} onClick={onEmail}>
              {copied ? 'Copied ✓' : 'Email me'}
            </a> for access.
          </div>
        )}
      </form>
    </div>
  );
}

function Disclosure({ title, small, isOpen, onToggle, children }) {
  return (
    <div className={`item${isOpen ? ' open' : ''}`}>
      <div className={`pill${small ? ' pill-sm' : ''}`}>
        <span className="pill-title">{title}</span>
        <button
          className="chev-btn"
          aria-expanded={isOpen}
          aria-label={isOpen ? 'Collapse' : 'Expand'}
          onClick={onToggle}
        >
          <ChevronDown className="chev" size={small ? 15 : 17} strokeWidth={2.75} aria-hidden="true" />
        </button>
      </div>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.5, ease: EASE }}
            style={{ overflow: 'hidden' }}
          >
            <div className="detail-inner">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* nested single-open accordion for certifications */
function CertList({ items }) {
  const [open, setOpen] = useState(null);
  return (
    <div className="cert-list">
      {items.map((c, j) => (
        <Disclosure
          key={j}
          small
          title={c.title}
          isOpen={open === j}
          onToggle={() => setOpen(open === j ? null : j)}
        >
          <Body body={c.body} />
        </Disclosure>
      ))}
    </div>
  );
}

function App() {
  const [open, setOpen] = useState(null); // single-open at the top level
  const [copied, setCopied] = useState(false);

  const onEmail = (e) => {
    if (navigator.clipboard) {
      e.preventDefault();
      navigator.clipboard.writeText(personalInfo.email).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 1800);
        window.location.href = `mailto:${personalInfo.email}`;
      });
    }
  };

  return (
    <div className="page">
      <motion.header
        className="hero"
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: EASE }}
      >
        <img className="avatar" src={asset('/assets/profile-2026.jpg')} alt="Hani Zaidi" />
        <h1 className="name">Hani Zaidi</h1>
      </motion.header>

      <motion.div className="list" variants={container} initial="hidden" animate="show">
        {things.map((t, i) => (
          <motion.div className="item-wrap" variants={itemV} key={i}>
            <Disclosure
              title={t.title}
              isOpen={open === i}
              onToggle={() => setOpen(open === i ? null : i)}
            >
              {t.contact ? (
                <ContactForm />
              ) : t.recommendations ? (
                <Recommendations />
              ) : t.children ? (
                <CertList items={t.children} />
              ) : (
                <Body body={t.body} image={t.image} images={t.images} link={t.link} />
              )}
            </Disclosure>
          </motion.div>
        ))}
      </motion.div>

      <motion.div
        className="footer"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.9, duration: 0.8, ease: EASE }}
      >
        <div className="icons">
          {socials.map(({ label, href, Icon }) => {
            const isMail = href.startsWith('mailto:');
            return (
              <a
                key={label}
                className="icon"
                href={href}
                aria-label={label}
                onClick={isMail ? onEmail : undefined}
                {...(isMail ? {} : { target: '_blank', rel: 'noopener noreferrer' })}
              >
                <Icon size={20} strokeWidth={1.75} />
              </a>
            );
          })}
        </div>
        <div className="note">
          {copied ? 'email copied to clipboard ✓' : <>made with love - hani.so © {new Date().getFullYear()}</>}
        </div>
      </motion.div>
    </div>
  );
}

export default App;

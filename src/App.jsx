import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Github, Linkedin, Instagram, ChevronDown, Loader2 } from 'lucide-react';
import { personalInfo } from './data/portfolioData';

const EASE = [0.22, 1, 0.36, 1];
/* bump this whenever an image is swapped — it busts browser + CDN cache so
   every visitor loads the new file instead of an old cached copy */
const ASSET_V = '3';
const asset = (path) => `${path}?v=${ASSET_V}`;
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

/* highlighted place name */
const Hl = ({ children }) => <span className="hl">{children}</span>;

/* page content. body is the dropdown text, children is a nested
   dropdown, image shows in the dropdown, contact swaps in the form */
const things = [
  {
    title: <>Software Engineer @ <Hl>Precision e-Business Group</Hl></>,
    body: [
      'Co-op placement on the engineering team at Precision e-Business Group, a B2B SaaS company in Burlington.',
      'I write production code that real customers depend on, building and shipping features in a professional codebase alongside full-time developers.',
    ],
    image: { src: asset('/assets/work/precision-1.jpg'), alt: 'Precision e-Business Group' },
  },
  {
    title: <>Founder of <Hl>Valantir</Hl></>,
    body: [
      'Valantir matches high school students with local volunteer opportunities, turning every hour into real experience, references, and resume-worthy skills. I founded it.',
      'We already have over 500 local organizations registered, connecting students with volunteer opportunities in their communities.',
      'Valantir has received over 30 organization reviews and collaborated with the PMC on student outreach.',
      'Built full-stack with Next.js, React, and a Postgres database.',
    ],
    link: { label: 'valantir.app', href: 'https://valantir.app' },
    image: { src: asset('/assets/projects/valantir-1.png'), alt: 'Valantir' },
  },
  {
    title: <>Business Lead @ <Hl>FRC 1334 Robotics</Hl></>,
    body: [
      'I run sponsorships, outreach, pitch writing, and team strategy, making the team look professional and presenting our progress clearly.',
      'I led our team to raising over $70,000 in funding.',
    ],
    image: { src: asset('/assets/experience/robotics-1.png'), alt: 'FRC 1334 Robotics' },
  },
  {
    title: <>Founder of the <Hl>Oakville Trafalgar Bike Club</Hl></>,
    body: [
      "Started the club to get more students riding and training with real structure. We've ridden to Niagara (115 km) and Toronto (40 km), and run collaborations with other clubs and schools.",
      'On June 26th, 2026 we’re hosting a community ride with the Town of Oakville, giving away free gear.',
    ],
    link: { label: '@othsbikeclub', href: 'https://www.instagram.com/othsbikeclub', Icon: Instagram },
    image: { src: asset('/assets/experience/bikeclub-1.png'), alt: 'OTHS Bike Club' },
  },
  {
    title: <>Built an <Hl>ESP32 Wi-Fi vending machine</Hl></>,
    body: [
      'A working vending machine on an ESP32 with a keypad, I2C LCD, and three servos, built for my computer engineering elective.',
      'Users join a peer-to-peer network, register and log in, then dispense a product from the pinpad. Built in two weeks.',
    ],
    image: { src: asset('/assets/projects/christmas.jpg'), alt: 'ESP32 vending machine' },
  },
  {
    title: <>Leadership with the <Hl>Halton Police PEACE</Hl> youth program</>,
    body: [
      'Took part in Halton Regional Police’s PEACE youth program, a leadership and community-engagement initiative that brings students together with officers.',
      'Worked on outreach and community activities, building confidence, teamwork, and a real sense of responsibility.',
    ],
    image: { src: asset('/assets/experience/volunteer-1.png'), alt: 'Halton Police PEACE youth program' },
  },
  {
    title: <>I founded the <Hl>FinTech club at OTHS</Hl></>,
    body: [
      'I founded and run OTHS\'s fintech club, building a community of like-minded people who care about business, finance, and technology.',
    ],
    link: { label: 'variance.gg', href: 'https://variance.gg' },
    image: { src: asset('/assets/experience/fintech-1.jpg'), alt: 'Fintech Club' },
  },
  {
    title: <><Hl>Honor Roll</Hl> student at OTHS</>,
    body: ['98% Grade 11 semester 2 GPA, strong resulst while balancing everything outside of class.'],
  },
  {
    title: <>Certified in <Hl>first aid</Hl>, <Hl>IT</Hl> & <Hl>track racing</Hl></>,
    children: [
      { title: 'Standard First Aid & CPR/AED', body: ['Current certification in first aid and CPR/AED response.'] },
      { title: 'Cisco IT Essentials 8', body: ['Cisco’s certification in computer hardware and IT fundamentals.'] },
      { title: 'Microsoft Office Specialist (MOS)', body: ['Certified Microsoft Office Specialist.'] },
      { title: 'Track Racing Certification', body: ['Completed at the Mattamy National Cycling Centre.'] },
    ],
  },
  {
    title: <>Volunteered in <Hl>healthcare</Hl>, <Hl>community</Hl>, <Hl>STEM</Hl> & <Hl>tutoring</Hl></>,
    body: [
      'Volunteered at the Nipissing Medical Clinic supporting patients and staff, at Oakville STEM Tutoring helping younger students with math and science, and at the Birch Glen Food Bank packing and handing out food to families.',
      'Learned to be dependable, communicate clearly, and help without needing supervision.',
    ],
  },
  {
    title: <>Speaks <Hl>6 languages</Hl></>,
    body: [
      'English, French, Arabic, Urdu, Hindi, and Punjabi. Switching between them makes it easy to connect with all kinds of people.',
    ],
  },
  {
    title: <>Programmer @ <Hl>EmpowerED</Hl></>,
    body: [
      'EmpowerED is a student-run initiative helping people experiencing homelessness get back on their feet, connecting them to legal support, resources, and a real path forward.',
      'I build the software for this wonderful initiative.',
    ],
    image: { src: asset('/assets/projects/empowered-1.jpg'), alt: 'EmpowerED' },
  },
  {
    title: <>See my <Hl>resume &amp; recommendation letters</Hl></>,
    recommendations: true,
  },
  {
    title: 'Get in touch',
    contact: true,
  },
];

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

function Body({ body, image, link }) {
  return (
    <div className="body">
      {body?.map((p, i) => <p key={i}>{p}</p>)}
      {image && <Figure src={image.src} alt={image.alt} />}
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
            <a className="mail-link" href={`mailto:${personalInfo.email}`}>Email me</a> for access.
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
                <Body body={t.body} image={t.image} link={t.link} />
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

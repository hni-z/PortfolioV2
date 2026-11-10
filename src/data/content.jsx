/* All page content lives here so the React app, the static HTML that
   crawlers and AI assistants read, and /llms.txt are generated from one
   source (see scripts/prerender.mjs). `alt` on images is a full description
   of what the picture shows: it is what non-visual readers get. */
/* eslint-disable react-refresh/only-export-components -- data module */
import { Instagram } from 'lucide-react';

/* bump this whenever an image is swapped — it busts browser + CDN cache so
   every visitor loads the new file instead of an old cached copy */
export const ASSET_V = '3';
export const asset = (path) => `${path}?v=${ASSET_V}`;

/* highlighted place name */
export const Hl = ({ children }) => <span className="hl">{children}</span>;

/* page content. body is the dropdown text, children is a nested
   dropdown, image shows in the dropdown, contact swaps in the form */
export const things = [
  {
    title: <>Winner @ <Hl>Hack the North 2026</Hl></>,
    body: [
      'My first hackathon, my first win, at Hack the North 2026: Canada’s largest and most prestigious hackathon.',
      'Our team took 1st place in the Aramco Americas track, winning Best Beginner Hack with Providence.',
      'Providence connects AI agents across computers so they can share context, hand off tasks, and use the tools on each device. We built interfaces for the web, iPhone, Apple Watch, and Meta Quest.',
      'It all happened over my birthday weekend, which made the win even more memorable.',
    ],
    link: { label: 'See Providence on Devpost', href: 'https://devpost.com/software/providence-tn6m4h' },
    images: [
      { src: asset('/assets/projects/providence-demo-2026.png'), alt: 'Three laptops running Providence on a folding table in a classroom at Hack the North 2026, with a Meta Quest headset, a phone and headphones beside them', caption: 'Providence running across three laptops at Hack the North.', position: '50% 68%' },
      { src: asset('/assets/projects/providence-artwork-2026.jpeg'), alt: 'Providence logo, a white origami-style bird on a black background, above the name Providence and the slogan: The constant behind every agent.', caption: 'The project we built for Hack the North 2026.', contain: true },
    ],
  },
  {
    title: <>Software Engineer @ <Hl>Precision e-Business Group</Hl></>,
    body: [
      'Co-op placement on the engineering team at Precision e-Business Group, a B2B SaaS company in Burlington.',
      'I write production code that real customers depend on, building and shipping features in a professional codebase alongside full-time developers.',
    ],
    image: { src: asset('/assets/work/precision-1.jpg'), alt: 'Precision e-Business Group logo: a globe wrapped in a green and blue letter e, ringed by gold stars' },
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
    image: { src: asset('/assets/projects/valantir-1.png'), alt: 'Valantir slide reading: A platform connecting students to volunteer opportunities. It shows the Valantir smiley-face logo and a group photo of eight people in front of a presentation screen, captioned Hani Zaidi, Founder' },
  },
  {
    title: <>Business Lead @ <Hl>FRC 1334 Robotics</Hl></>,
    body: [
      'I run sponsorships, outreach, pitch writing, and team strategy, making the team look professional and presenting our progress clearly.',
      'I led our team to raising over $70,000 in funding.',
    ],
    image: { src: asset('/assets/experience/robotics-1.png'), alt: 'FRC 1334 Robotics collage: Hani Zaidi working at a laptop, labelled Hani, Business Lead; Hani holding up a team T-shirt at a FIRST Robotics event; and the team’s red and black competition robot in the workshop' },
  },
  {
    title: <>Founder of the <Hl>Oakville Trafalgar Bike Club</Hl></>,
    body: [
      "Started the club to get more students riding and training with real structure. We've ridden to Niagara (115 km) and Toronto (40 km), and run collaborations with other clubs and schools.",
      'On June 26th, 2026 we’re hosting a community ride with the Town of Oakville, giving away free gear.',
    ],
    link: { label: '@othsbikeclub', href: 'https://www.instagram.com/othsbikeclub', Icon: Instagram },
    image: { src: asset('/assets/experience/bikeclub-1.png'), alt: 'Hani Zaidi and three other students giving thumbs up around a road bike at the OTHS Bike Club booth, under the heading Bike Club @ Club Fair' },
  },
  {
    title: <>Built an <Hl>ESP32 Wi-Fi vending machine</Hl></>,
    body: [
      'A working vending machine on an ESP32 with a keypad, I2C LCD, and three servos, built for my computer engineering elective.',
      'Users join a peer-to-peer network, register and log in, then dispense a product from the pinpad. Built in two weeks.',
    ],
    image: { src: asset('/assets/projects/christmas.jpg'), alt: 'The ESP32 vending machine: a cardboard cabinet with a blue LCD reading Connect to WiFi: VendingMachine and a 4x4 keypad, next to an inside view of the ESP32 wired up on a breadboard' },
  },
  {
    title: <>Leadership with the <Hl>Halton Police PEACE</Hl> youth program</>,
    body: [
      'Took part in Halton Regional Police’s PEACE youth program, a leadership and community-engagement initiative that brings students together with officers.',
      'Worked on outreach and community activities, building confidence, teamwork, and a real sense of responsibility.',
    ],
    image: { src: asset('/assets/experience/volunteer-1.png'), alt: 'Halton Police PEACE youth program collage: a black police command truck at night, and Hani Zaidi sitting in the driver’s seat of a police vehicle beside its mounted computer' },
  },
  {
    title: <>I founded the <Hl>FinTech club at OTHS</Hl></>,
    body: [
      'I founded and run OTHS\'s fintech club, building a community of like-minded people who care about business, finance, and technology.',
    ],
    link: { label: 'variance.gg', href: 'https://variance.gg' },
    image: { src: asset('/assets/experience/fintech-1.jpg'), alt: 'Fintech Club collage: a monitor showing the variance website, a profile card reading hani@variance.gg, Business & Partnerships, and a card defining the Fintech Club as an OTHS student club run under variance.gg, building projects at the intersection of business, finance and technology' },
  },
  {
    title: <><Hl>Honor Roll</Hl> student at OTHS</>,
    body: ['98% Grade 11 semester 2 GPA, strong results while balancing everything outside of class.'],
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
    image: { src: asset('/assets/projects/empowered-1.jpg'), alt: 'EmpowerED banner in pink with the tagline: Educating. Empowering. Elevating. Side text reads Serving Communities and Financial Education' },
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


/* Plain facts about Hani used for the static page, JSON-LD and llms.txt.
   Keep these in step with the entries above. */
export const profile = {
  name: 'Hani Zaidi',
  url: 'https://hani.so/',
  photo: { src: asset('/assets/profile-2026.jpg'), alt: 'Portrait of Hani Zaidi smiling, wearing glasses and a navy T-shirt, with high-rise buildings behind him' },
  summary:
    'Hani Zaidi is a Grade 12 student at Oakville Trafalgar High School (OTHS) in Oakville, Ontario, a co-op Software Engineer at Precision e-Business Group, and the founder of Valantir, a platform that matches high school students with local volunteer opportunities. He won Best Beginner Hack (1st place, Aramco Americas track) at Hack the North 2026 with Providence.',
  school: 'Oakville Trafalgar High School',
  location: 'Oakville, Ontario, Canada',
  languages: ['English', 'French', 'Arabic', 'Urdu', 'Hindi', 'Punjabi'],
};

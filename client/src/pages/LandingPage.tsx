import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import HeroDashboardPreview from '../components/HeroDashboardPreview'
import {
  ArrowRight, CheckCircle, BarChart2,
  BookOpen, Zap, Award, ChevronRight, Users, TrendingUp,
  Shield, Clock, Star
} from 'lucide-react'

// ── DATA ──────────────────────────────────────────────────────────────────────

const NAV_LINKS = [
  { label: 'How it works', href: '#how-it-works' },
  { label: 'Subjects',     href: '#subjects'     },
  { label: 'Certificates', href: '#certificates' },
]

const STATS = [
  { value: '8+',   label: 'CS Subjects'          },
  { value: '80%',  label: 'Mastery threshold'     },
  { value: '3',    label: 'AI agents at work'     },
  { value: '100%', label: 'Personalized for you'  },
]

const STEPS = [
  {
    number: '01',
    title: 'Tell us about yourself',
    desc:  'Share your education level, current knowledge, interests, and learning goals in a short onboarding flow.',
  },
  {
    number: '02',
    title: 'Take a diagnostic assessment',
    desc:  'A focused set of questions helps us identify exactly where you stand — no guessing, no one-size-fits-all.',
  },
  {
    number: '03',
    title: 'Learn your way',
    desc:  'The platform adapts content, difficulty, examples, and explanations in real time as it understands how you learn.',
  },
  {
    number: '04',
    title: 'Earn a verified certificate',
    desc:  'Demonstrate true mastery and receive a blockchain-verified certificate that anyone can instantly verify.',
  },
]

const FEATURES = [
  {
    icon:  <BarChart2 className="w-5 h-5" />,
    color: 'text-brand-600 bg-brand-50',
    title: 'Behaviour-driven adaptation',
    desc:  'Every correct answer, mistake, hint, and pause is recorded. The system continuously refines its model of you.',
  },
  {
    icon:  <BookOpen className="w-5 h-5" />,
    color: 'text-violet-600 bg-violet-50',
    title: 'Interest-based examples',
    desc:  'Into railways? Graph algorithms are taught with stations and routes. Into gaming? With game maps and levels.',
  },
  {
    icon:  <Zap className="w-5 h-5" />,
    color: 'text-amber-600 bg-amber-50',
    title: 'AI-generated practice',
    desc:  'Practice questions are generated for your current level, topic, and mistake patterns — never generic.',
  },
  {
    icon:  <TrendingUp className="w-5 h-5" />,
    color: 'text-emerald-600 bg-emerald-50',
    title: 'Real mastery tracking',
    desc:  'Progress is measured by demonstrated understanding, not clicks. You earn every step forward.',
  },
  {
    icon:  <Award className="w-5 h-5" />,
    color: 'text-rose-600 bg-rose-50',
    title: 'Blockchain certificates',
    desc:  'Certificates are anchored on-chain. Any employer or institution can verify authenticity instantly.',
  },
  {
    icon:  <Users className="w-5 h-5" />,
    color: 'text-indigo-600 bg-indigo-50',
    title: 'Built for undergrads',
    desc:  'Focused on technical CS subjects — DSA, OOP, Web Dev, AI/ML, DBMS, OS, and Computer Networks.',
  },
]

const SUBJECTS = [
  { name: 'Data Structures & Algorithms', tag: 'Core',    color: 'bg-brand-50 border-brand-200 text-navy-800'   },
  { name: 'Object-Oriented Programming',  tag: 'Core',    color: 'bg-brand-50 border-brand-200 text-navy-800'   },
  { name: 'Web Development',              tag: 'Popular', color: 'bg-violet-50 border-violet-200 text-navy-800' },
  { name: 'Artificial Intelligence / ML', tag: 'Popular', color: 'bg-violet-50 border-violet-200 text-navy-800' },
  { name: 'Data Science',                 tag: '',        color: 'bg-navy-50 border-navy-200 text-navy-700'     },
  { name: 'Database Management Systems',  tag: '',        color: 'bg-navy-50 border-navy-200 text-navy-700'     },
  { name: 'Operating Systems',            tag: '',        color: 'bg-navy-50 border-navy-200 text-navy-700'     },
  { name: 'Computer Networks',            tag: '',        color: 'bg-navy-50 border-navy-200 text-navy-700'     },
]

const TESTIMONIALS = [
  {
    text: 'I struggled with graph algorithms for months. DecentraLearn used railway examples and I finally got it.',
    name: 'Arjun S.', role: 'B.Tech CSE, 2nd Year',
    stars: 5,
  },
  {
    text: 'The diagnostic test immediately knew I was weak at trees. It focused there and my mastery went from 40% to 82%.',
    name: 'Priya M.', role: 'B.Tech IT, 3rd Year',
    stars: 5,
  },
  {
    text: 'Not just another course platform. It actually adapts. The blockchain-verified certificate is a great touch.',
    name: 'Rahul K.', role: 'B.Tech ECE, Final Year',
    stars: 5,
  },
]

// ── COMPONENT ─────────────────────────────────────────────────────────────────

export default function LandingPage() {
  const { user } = useAuth()

  return (
    <div className="min-h-screen bg-white text-navy-900">

      {/* ── NAVBAR ───────────────────────────────────────────────── */}
      <header className="fixed top-0 inset-x-0 z-50 bg-white border-b border-navy-200">
        <nav className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center flex-shrink-0">
            <img
              src="/logo.png"
              alt="DecentralLearn"
              className="h-10 w-auto object-contain"
            />
          </Link>

          <div className="hidden md:flex items-center gap-7">
            {NAV_LINKS.map(l => (
              <a key={l.href} href={l.href} className="nav-link">
                {l.label}
              </a>
            ))}
          </div>

          <div className="flex items-center gap-2">
            {user ? (
              <Link to="/dashboard" className="btn-primary">
                Dashboard <ChevronRight className="w-4 h-4" />
              </Link>
            ) : (
              <>
                <Link to="/login" className="btn-ghost hidden sm:inline-flex">Log in</Link>
                <Link to="/signup" className="btn-primary">Get started</Link>
              </>
            )}
          </div>
        </nav>
      </header>

      {/* ── HERO ──────────────────────────────────────────────────── */}
      <section className="pt-28 pb-20 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div>
              <div className="section-label mb-5">AI-Powered Adaptive Learning</div>
              <h1 className="text-4xl md:text-[44px] font-extrabold leading-[1.15] tracking-tight text-navy-900 mb-5">
                The learning platform<br />that adapts{' '}
                <span className="text-brand-600">to you.</span>
              </h1>
              <p className="text-navy-500 text-base leading-relaxed mb-8 max-w-md">
                DecentraLearn studies how you learn, what you know, and what interests you —
                then builds a fully personalized path through every topic, in real time.
              </p>
              <div className="flex flex-col sm:flex-row items-start gap-3 mb-10">
                <Link to="/signup" id="hero-cta-signup" className="btn-primary text-base px-7 py-3">
                  Start learning free <ArrowRight className="w-4 h-4" />
                </Link>
                <a href="#how-it-works" className="btn-secondary text-base px-7 py-3">
                  See how it works
                </a>
              </div>
              <div className="flex items-center gap-5 flex-wrap">
                <div className="flex items-center gap-1.5 text-sm text-navy-500">
                  <Shield className="w-4 h-4 text-brand-500" />
                  No credit card required
                </div>
                <div className="flex items-center gap-1.5 text-sm text-navy-500">
                  <CheckCircle className="w-4 h-4 text-emerald-500" />
                  Free to get started
                </div>
                <div className="flex items-center gap-1.5 text-sm text-navy-500">
                  <Clock className="w-4 h-4 text-amber-500" />
                  Learn at your own pace
                </div>
              </div>
            </div>

            <div className="hidden md:flex items-center justify-center py-8 px-4">
              <HeroDashboardPreview />
            </div>
          </div>
        </div>
      </section>

      {/* ── STATS BAR ─────────────────────────────────────────────── */}
      <section className="border-y border-navy-200 bg-navy-50">
        <div className="max-w-5xl mx-auto px-6 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {STATS.map(s => (
              <div key={s.label} className="text-center">
                <div className="text-3xl font-extrabold text-brand-600 mb-1">{s.value}</div>
                <div className="text-xs text-navy-500 font-medium">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ──────────────────────────────────────────── */}
      <section id="how-it-works" className="py-20 px-6 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <div className="section-label mb-4">How it works</div>
            <h2 className="section-heading">From onboarding to certified mastery</h2>
            <p className="text-navy-500 mt-3 max-w-xl mx-auto text-sm">
              A structured, intelligent journey — designed to understand you first, then teach you your way.
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-5">
            {STEPS.map((step, i) => (
              <div
                key={i}
                className="flex gap-5 p-6 rounded-xl border border-navy-200 bg-white hover:border-brand-200 hover:shadow-card transition-all duration-200"
              >
                <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-brand-50 border border-brand-100 flex items-center justify-center">
                  <span className="text-sm font-bold text-brand-600">{step.number}</span>
                </div>
                <div>
                  <h3 className="font-semibold text-navy-900 mb-1.5">{step.title}</h3>
                  <p className="text-sm text-navy-500 leading-relaxed">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PERSONALIZATION EXAMPLE ───────────────────────────────── */}
      <section className="py-20 px-6 bg-navy-50 border-y border-navy-200">
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-2 gap-14 items-center">
            <div>
              <div className="section-label mb-4">Personalization in action</div>
              <h2 className="section-heading mb-4">
                Same concept.<br />Completely different experience.
              </h2>
              <p className="text-navy-500 text-sm leading-relaxed mb-6">
                Two students learning Graph Algorithms receive the same academic content
                — but examples, explanations, and practice questions are built around what they care about.
              </p>
              <ul className="space-y-2.5">
                {[
                  'Interest-driven analogies and real-world examples',
                  'Difficulty adapts automatically to your performance',
                  'Revision triggered when you make repeated mistakes',
                  'Faster progression when you consistently excel',
                ].map(item => (
                  <li key={item} className="flex items-start gap-2.5 text-sm text-navy-700">
                    <CheckCircle className="w-4 h-4 text-brand-500 flex-shrink-0 mt-0.5" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-4">
              <div className="bg-white border border-navy-200 rounded-xl p-5 shadow-card">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-base">🚂</span>
                  <span className="text-xs font-semibold bg-brand-50 text-brand-700 border border-brand-100 px-2.5 py-0.5 rounded-full">
                    Student A · Interested in Railways
                  </span>
                </div>
                <p className="text-sm text-navy-700 leading-relaxed">
                  <span className="font-medium">Stations</span> → Nodes &nbsp;·&nbsp;
                  <span className="font-medium">Tracks</span> → Edges &nbsp;·&nbsp;
                  <span className="font-medium">Travel time</span> → Weights &nbsp;·&nbsp;
                  <span className="font-medium text-brand-600">Fastest route → Shortest Path</span>
                </p>
              </div>

              <div className="bg-white border border-navy-200 rounded-xl p-5 shadow-card">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-base">🎮</span>
                  <span className="text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-100 px-2.5 py-0.5 rounded-full">
                    Student B · Interested in Gaming
                  </span>
                </div>
                <p className="text-sm text-navy-700 leading-relaxed">
                  <span className="font-medium">Locations</span> → Nodes &nbsp;·&nbsp;
                  <span className="font-medium">Movement paths</span> → Edges &nbsp;·&nbsp;
                  <span className="font-medium">Cost</span> → Weights &nbsp;·&nbsp;
                  <span className="font-medium text-emerald-600">Optimal route → Shortest Path</span>
                </p>
              </div>

              <p className="text-xs text-navy-400 text-center pt-1">Same topic. Personalized to their world.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── FEATURES ──────────────────────────────────────────────── */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <div className="section-label mb-4">Platform features</div>
            <h2 className="section-heading">Built for how students actually learn</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {FEATURES.map((f, i) => (
              <div
                key={i}
                className="p-5 rounded-xl border border-navy-200 bg-white hover:border-brand-200 hover:shadow-card transition-all duration-200"
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${f.color}`}>
                  {f.icon}
                </div>
                <h3 className="font-semibold text-navy-900 text-sm mb-1.5">{f.title}</h3>
                <p className="text-xs text-navy-500 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SUBJECTS ──────────────────────────────────────────────── */}
      <section id="subjects" className="py-20 px-6 bg-navy-50 border-y border-navy-200">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <div className="section-label mb-4">Subjects</div>
            <h2 className="section-heading">Core CS subjects for undergrads</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {SUBJECTS.map((subject, i) => (
              <div
                key={i}
                className={`flex items-center justify-between px-4 py-3.5 rounded-xl border text-sm font-medium ${subject.color}`}
              >
                <span>{subject.name}</span>
                {subject.tag && (
                  <span className="ml-2 text-[10px] font-semibold text-brand-600 bg-brand-100 rounded-full px-2 py-0.5 flex-shrink-0">
                    {subject.tag}
                  </span>
                )}
              </div>
            ))}
          </div>
          <p className="text-xs text-navy-400 mt-5 text-center">
            MVP focuses deeply on DSA. Additional subjects follow the same adaptive model.
          </p>
        </div>
      </section>

      {/* ── CERTIFICATES ──────────────────────────────────────────── */}
      <section id="certificates" className="py-20 px-6 bg-white">
        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-14 items-center">
          <div>
            <div className="section-label mb-4">Certification</div>
            <h2 className="section-heading mb-4">Certificates that actually mean something</h2>
            <p className="text-navy-500 text-sm leading-relaxed mb-5">
              You receive a certificate only after demonstrating genuine mastery — not just clicking through content.
              Every certificate is recorded on-chain so it can be verified by anyone, anywhere.
            </p>
            <ul className="space-y-2.5 mb-7">
              {[
                'Mastery ≥ 80% required before certificate generation',
                'Blockchain-anchored for tamper-proof verification',
                'Public verification page — shareable with employers',
              ].map(item => (
                <li key={item} className="flex items-start gap-2.5 text-sm text-navy-700">
                  <CheckCircle className="w-4 h-4 text-brand-500 flex-shrink-0 mt-0.5" />
                  {item}
                </li>
              ))}
            </ul>
            <Link
              to="/verify/demo"
              className="inline-flex items-center gap-2 text-sm font-medium text-brand-600 hover:text-brand-700 transition-colors"
            >
              Try the verification page <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="bg-white border border-navy-200 rounded-2xl shadow-card-md overflow-hidden">
            <div className="h-1.5 bg-brand-600" />
            <div className="px-8 py-8 text-center space-y-3">
              <div className="flex justify-center mb-5">
                <div className="w-14 h-14 rounded-2xl bg-brand-50 border border-brand-100 flex items-center justify-center">
                  <Award className="w-7 h-7 text-brand-600" />
                </div>
              </div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-navy-400">Certificate of Mastery</p>
              <p className="text-navy-500 text-sm">This certifies that</p>
              <p className="text-xl font-bold text-navy-900">Aditya Nikam</p>
              <p className="text-navy-500 text-sm">has demonstrated mastery of</p>
              <p className="text-base font-bold text-brand-600">Data Structures &amp; Algorithms</p>
              <div className="pt-4 border-t border-navy-100 space-y-2">
                <div className="flex items-center justify-between text-xs text-navy-500">
                  <span>Mastery Score</span>
                  <span className="font-bold text-navy-800">85%</span>
                </div>
                <div className="flex items-center justify-between text-xs text-navy-500">
                  <span>Certificate ID</span>
                  <span className="font-mono text-navy-700">CERT-DSA-2026-00125</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-navy-500">Status</span>
                  <span className="text-emerald-600 font-semibold flex items-center gap-1">
                    <CheckCircle className="w-3.5 h-3.5" /> Blockchain verified
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ──────────────────────────────────────────── */}
      <section className="py-20 px-6 bg-navy-50 border-y border-navy-200">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <div className="section-label mb-4">Student stories</div>
            <h2 className="section-heading">What students are saying</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-5">
            {TESTIMONIALS.map((t, i) => (
              <div key={i} className="bg-white border border-navy-200 rounded-xl p-6 shadow-card">
                <div className="flex gap-0.5 mb-4">
                  {Array.from({ length: t.stars }).map((_, j) => (
                    <Star key={j} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-sm text-navy-700 leading-relaxed mb-5 italic">"{t.text}"</p>
                <div>
                  <p className="text-sm font-semibold text-navy-900">{t.name}</p>
                  <p className="text-xs text-navy-400 mt-0.5">{t.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ───────────────────────────────────────────────────── */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="section-heading mb-4">
            Ready to learn the way<br />you actually learn?
          </h2>
          <p className="text-navy-500 text-sm mb-8 max-w-md mx-auto leading-relaxed">
            Create a free account and start your personalized academic journey today.
            No credit card. No commitment.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link to="/signup" id="footer-cta-signup" className="btn-primary text-base px-8 py-3">
              Get started — it's free <ArrowRight className="w-4 h-4" />
            </Link>
            <a href="#how-it-works" className="btn-secondary text-base px-8 py-3">
              Learn more
            </a>
          </div>
        </div>
      </section>

      {/* ── FOOTER ────────────────────────────────────────────────── */}
      <footer className="border-t border-navy-200 bg-navy-50 py-8 px-6">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <img
              src="/favicon-icon.png"
              alt="DecentralLearn icon"
              className="h-7 w-7 object-contain"
            />
            <span className="text-sm font-bold text-navy-800">DecentralLearn</span>
            <span className="text-xs text-navy-400 ml-1">· AI-Powered Adaptive Learning</span>
          </div>
          <p className="text-xs text-navy-400">© 2026 DecentraLearn. All rights reserved.</p>
          <Link to="/verify/demo" className="text-xs text-brand-600 hover:text-brand-700 font-medium transition-colors">
            Verify a certificate →
          </Link>
        </div>
      </footer>

    </div>
  )
}

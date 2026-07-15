import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Check, Star, Building2, Users, Award, TrendingUp, Shield, Zap } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import PassLogo from '@/components/PassLogo';
import { CREDIT_PACKAGES, CORPORATE_BUNDLES, formatKES, COURSE_THUMBNAILS } from '@/lib/brand';
import { useReveal } from '@/hooks/use-reveal';

const JACE_LOGO = 'https://media.base44.com/images/public/6a552d72363fc33d755650fa/37194d884_ChatGPTImageJul16202612_49_01AM.png';

const LOGOS = ['Safaricom', 'KCB Bank', 'Equity Bank', 'EABL', 'Deloitte EA', 'KPMG'];

export default function Home() {
  const [courses, setCourses] = useState([]);

  useEffect(() => {
    base44.entities.Course.filter({ is_published: true }, 'order', 8)
      .then(setCourses).catch(() => {});
  }, []);

  const featured = courses.slice(0, 6);

  // reveal refs
  const coursesRef  = useReveal({ stagger: true, base: 90 });
  const pricingRef  = useReveal({ stagger: true, base: 90 });
  const corpRef     = useReveal();
  const testiRef    = useReveal({ stagger: true, base: 90 });
  const ctaRef      = useReveal();
  const heroTextRef = useReveal();

  return (
    <div className="min-h-screen bg-background" style={{ scrollBehavior: 'smooth' }}>
      {/* Nav */}
      <nav className="sticky top-0 z-50 border-b border-border/60 bg-card/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 lg:px-8">
          <PassLogo className="text-2xl" />
          <div className="hidden items-center gap-8 md:flex">
            <a href="#courses" className="text-sm font-medium text-muted-foreground hover:text-secondary">Courses</a>
            <a href="#pricing" className="text-sm font-medium text-muted-foreground hover:text-secondary">Pricing</a>
            <a href="#corporate" className="text-sm font-medium text-muted-foreground hover:text-secondary">For Teams</a>
            <a href="#testimonials" className="text-sm font-medium text-muted-foreground hover:text-secondary">Reviews</a>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/login" className="text-sm font-semibold text-secondary hover:text-primary">Log in</Link>
            <Link to="/register" className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90">Get Started</Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-secondary via-primary to-secondary" />
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 20% 30%, #2E6FE8 0%, transparent 40%), radial-gradient(circle at 80% 70%, #F5A623 0%, transparent 35%)' }} />
        <div className="relative mx-auto max-w-7xl px-4 py-20 lg:px-8 lg:py-28">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div ref={heroTextRef} className="reveal text-center lg:text-left">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-sm font-medium text-white/90 backdrop-blur">
                <span className="h-2 w-2 rounded-full bg-gold" /> East Africa's premium soft-skills platform
              </span>
              <h1 className="mt-6 font-heading text-4xl font-extrabold leading-tight text-white lg:text-6xl text-balance">
                Master the Skills.<br /><span className="text-gold">Lead the Room.</span>
              </h1>
              <p className="mx-auto mt-6 max-w-lg text-lg text-white/70 lg:mx-0">
                Negotiation. Leadership. Communication. The professional skills that move careers forward — taught the PASS way, with certificates that mean something.
              </p>
              <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row lg:justify-start">
                <Link to="/register" className="inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3.5 text-sm font-bold text-secondary shadow-lift transition-transform hover:scale-105">
                  Start Learning Free <ArrowRight size={16} />
                </Link>
                <a href="#courses" className="inline-flex items-center gap-2 rounded-xl border border-white/30 px-6 py-3.5 text-sm font-bold text-white transition-colors hover:bg-white/10">
                  Browse Courses
                </a>
              </div>
              <div className="mt-10 flex items-center justify-center gap-6 lg:justify-start">
                <div>
                  <p className="font-heading text-2xl font-bold text-white">8</p>
                  <p className="text-xs text-white/50">Expert courses</p>
                </div>
                <div className="h-8 w-px bg-white/20" />
                <div>
                  <p className="font-heading text-2xl font-bold text-white">70%+</p>
                  <p className="text-xs text-white/50">Pass benchmark</p>
                </div>
                <div className="h-8 w-px bg-white/20" />
                <div>
                  <p className="font-heading text-2xl font-bold text-white">12 mo</p>
                  <p className="text-xs text-white/50">Credit validity</p>
                </div>
              </div>
            </div>

            <div className="relative hidden lg:block">
              <div className="absolute -inset-4 rounded-3xl bg-white/5 backdrop-blur" />
              <img src="https://media.base44.com/images/public/6a552d72363fc33d755650fa/fc6ed300c_image.png" alt="PASS Learning professionals" className="relative rounded-2xl shadow-lift object-cover" />
              <div className="absolute -bottom-6 -left-6 w-64 rounded-2xl border border-border bg-card p-4 shadow-lift">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100"><Award className="text-green-600" size={20} /></div>
                  <div>
                    <p className="text-sm font-bold text-secondary">Certificate Earned</p>
                    <p className="text-xs text-muted-foreground">Negotiation Skills</p>
                  </div>
                </div>
                <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-muted">
                  <div className="h-full rounded-full bg-accent" style={{ width: '100%' }} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Trusted-by MARQUEE ── */}
      <section className="border-b border-border bg-card py-8">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <p className="text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-6">
            Trusted by professionals across East Africa's leading organisations
          </p>
          <div className="marquee-mask">
            <div className="marquee-track">
              {/* render twice for seamless loop */}
              {[...LOGOS, ...LOGOS].map((c, i) => (
                <span key={i} className="font-heading text-lg font-bold text-muted-foreground/60 whitespace-nowrap">{c}</span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Courses preview */}
      <section id="courses" className="py-20">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <div className="text-center">
            <span className="text-sm font-semibold uppercase tracking-wider text-accent">Course Catalogue</span>
            <h2 className="mt-2 font-heading text-3xl font-bold text-secondary lg:text-4xl">Skills that get you promoted</h2>
            <p className="mx-auto mt-3 max-w-xl text-muted-foreground">Eight focused courses, each ending in a certification quiz. Unlock what you need, when you need it.</p>
          </div>

          <div ref={coursesRef} className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((course) => (
              <div key={course.id} className="reveal group overflow-hidden rounded-2xl border border-border bg-card shadow-card transition-all hover:shadow-lift hover:-translate-y-1">
                <div className="relative h-44 overflow-hidden">
                  <img src={course.thumbnail} alt={course.title} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                  <div className="absolute inset-0 bg-gradient-to-t from-secondary/60 to-transparent" />
                  {course.category && <span className="absolute bottom-3 left-3 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-secondary">{course.category}</span>}
                </div>
                <div className="p-5">
                  <h3 className="font-heading text-lg font-bold text-secondary">{course.title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{course.subtitle || course.description}</p>
                  <div className="mt-4 flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">{course.duration_minutes} min · {course.module_count} modules</span>
                    <span className="inline-flex items-center gap-1 text-sm font-semibold text-accent">1 credit <Zap size={13} className="text-gold" /></span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-10 text-center">
            <Link to="/register" className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-bold text-primary-foreground hover:bg-primary/90">
              View full catalogue <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <div className="text-center">
            <span className="text-sm font-semibold uppercase tracking-wider text-accent">Credits & Pricing</span>
            <h2 className="mt-2 font-heading text-3xl font-bold text-secondary lg:text-4xl">One credit unlocks one course</h2>
            <p className="mx-auto mt-3 max-w-xl text-muted-foreground">Buy credits in bundles and save. Credits are valid for 12 months — learn at your pace.</p>
          </div>

          <div ref={pricingRef} className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {CREDIT_PACKAGES.map(pkg => (
              <div key={pkg.id} className={`reveal relative flex flex-col rounded-2xl border-2 p-6 ${pkg.popular ? 'border-gold bg-card shadow-lift' : 'border-border bg-card shadow-card'}`}>
                {pkg.popular && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gold px-4 py-1 text-xs font-bold text-secondary">★ Most Popular</span>
                )}
                <h3 className="font-heading text-lg font-bold text-secondary">{pkg.name}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{pkg.description}</p>
                <div className="mt-4">
                  <span className="font-heading text-3xl font-extrabold text-secondary">{pkg.credits}</span>
                  <span className="text-sm text-muted-foreground"> credits</span>
                </div>
                <p className="mt-2 text-2xl font-bold text-primary">{formatKES(pkg.price)}</p>
                <Link to="/register" className={`mt-5 rounded-lg py-2.5 text-center text-sm font-bold transition-colors ${pkg.popular ? 'bg-gold text-secondary hover:bg-gold/90' : 'bg-primary text-primary-foreground hover:bg-primary/90'}`}>
                  Get Started
                </Link>
              </div>
            ))}
          </div>
          <p className="mt-6 text-center text-sm text-muted-foreground">Pay via M-Pesa or card · Credits valid 12 months</p>
        </div>
      </section>

      {/* Corporate */}
      <section id="corporate" className="bg-secondary py-20">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <div ref={corpRef} className="reveal grid items-center gap-12 lg:grid-cols-2">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-sm font-medium text-white/90">
                <Building2 size={15} /> For HR & L&D Teams
              </span>
              <h2 className="mt-5 font-heading text-3xl font-bold text-white lg:text-4xl">Upskill your entire team</h2>
              <p className="mt-4 text-white/70">Bulk credits at team rates. Invite employees, allocate credits, and track progress with a corporate dashboard that shows exactly who's learning, who's certified, and where the gaps are.</p>
              <div className="mt-8 space-y-3">
                {['Bulk-invite employees by email', 'Allocate credits to individuals', 'Track progress, scores & certificates', 'Export team reports'].map(f => (
                  <div key={f} className="flex items-center gap-3">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gold/20"><Check size={14} className="text-gold" /></span>
                    <span className="text-sm text-white/90">{f}</span>
                  </div>
                ))}
              </div>
              <Link to="/register" className="mt-8 inline-flex items-center gap-2 rounded-xl bg-gold px-6 py-3 text-sm font-bold text-secondary hover:bg-gold/90">
                Talk to our team <ArrowRight size={16} />
              </Link>
            </div>
            <div className="grid gap-4">
              {CORPORATE_BUNDLES.map(b => (
                <div key={b.id} className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-heading text-xl font-bold text-white">{b.name}</h3>
                      <p className="mt-1 text-sm text-white/60">{b.users} users × {b.creditsPerUser} credits each</p>
                    </div>
                    <div className="text-right">
                      <p className="font-heading text-2xl font-bold text-gold">{formatKES(b.price)}</p>
                      <p className="text-xs text-white/50">{b.users * b.creditsPerUser} total credits</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-20">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <div className="text-center">
            <span className="text-sm font-semibold uppercase tracking-wider text-accent">Learner Stories</span>
            <h2 className="mt-2 font-heading text-3xl font-bold text-secondary lg:text-4xl">Real results from real professionals</h2>
          </div>
          <div ref={testiRef} className="mt-12 grid gap-6 md:grid-cols-3">
            {[
              { name: 'Amara Odhiambo', role: 'Procurement Lead, Safaricom', text: 'The Negotiation Skills course changed how I approach every vendor conversation. I closed a deal 18% under budget the week after finishing.', initials: 'AO' },
              { name: 'David Mwangi', role: 'Team Lead, KCB Bank', text: 'Leadership Essentials gave me a framework I actually use daily. My team noticed the difference within a month.', initials: 'DM' },
              { name: 'Faith Njeri', role: 'HR Business Partner, EABL', text: 'We rolled PASS out to 40 managers. The corporate dashboard makes reporting to the board effortless.', initials: 'FN' },
            ].map(t => (
              <div key={t.name} className="reveal rounded-2xl border border-border bg-card p-6 shadow-card">
                <div className="flex gap-0.5 text-gold">{Array(5).fill().map((_, i) => <Star key={i} size={16} fill="currentColor" />)}</div>
                <p className="mt-4 text-sm leading-relaxed text-foreground">"{t.text}"</p>
                <div className="mt-5 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">{t.initials}</div>
                  <div>
                    <p className="text-sm font-bold text-secondary">{t.name}</p>
                    <p className="text-xs text-muted-foreground">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-4 pb-20 lg:px-8">
        <div ref={ctaRef} className="reveal mx-auto max-w-5xl overflow-hidden rounded-3xl bg-gradient-to-br from-primary to-secondary px-6 py-14 text-center shadow-lift lg:px-12">
          <Shield className="mx-auto text-gold" size={40} />
          <h2 className="mt-4 font-heading text-3xl font-bold text-white lg:text-4xl">Your next promotion starts here</h2>
          <p className="mx-auto mt-3 max-w-md text-white/70">Join East Africa's professionals learning the skills that actually move careers forward.</p>
          <Link to="/register" className="mt-8 inline-flex items-center gap-2 rounded-xl bg-white px-8 py-3.5 text-sm font-bold text-secondary transition-transform hover:scale-105">
            Create your free account <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-card">
        <div className="mx-auto max-w-7xl px-4 py-12 lg:px-8">
          <div className="grid gap-8 md:grid-cols-4">
            <div className="md:col-span-2">
              <PassLogo className="text-2xl" />
              <p className="mt-3 max-w-xs text-sm text-muted-foreground">Premium soft-skills training for East African professionals. A PASS (Parikshit Advisory & Strategy Services) product.</p>
              <p className="mt-3 text-xs text-muted-foreground">Nairobi, Kenya</p>
            </div>
            <div>
              <h4 className="text-sm font-bold text-secondary">Platform</h4>
              <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                <li><a href="#courses" className="hover:text-secondary">Courses</a></li>
                <li><a href="#pricing" className="hover:text-secondary">Pricing</a></li>
                <li><a href="#corporate" className="hover:text-secondary">For Teams</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-bold text-secondary">Company</h4>
              <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-secondary">About PASS</a></li>
                <li><a href="#" className="hover:text-secondary">Contact</a></li>
                <li><a href="#" className="hover:text-secondary">Privacy</a></li>
              </ul>
            </div>
          </div>

          {/* Bottom row */}
          <div className="mt-10 border-t border-border pt-6 flex flex-col items-center gap-3 sm:flex-row sm:justify-between">
            <p className="text-xs text-muted-foreground text-center sm:text-left">
              © 2026 PASS (Parikshit Advisory & Strategy Services). All rights reserved.
            </p>
            <a
              href="https://jacestudio.framer.website"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 group"
            >
              <span className="text-xs text-muted-foreground/70">Built &amp; powered by</span>
              <img
                src={JACE_LOGO}
                alt="Jace Studio"
                className="h-6 w-auto object-contain opacity-70 transition-opacity duration-200 group-hover:opacity-100"
              />
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
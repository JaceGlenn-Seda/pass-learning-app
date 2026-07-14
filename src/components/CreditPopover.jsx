import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Coins, X, ChevronRight, ChevronLeft, Sparkles } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { formatKES } from '@/lib/brand';

/* ================================================================
   1) CREDIT POPOVER
================================================================ */
export function CreditPopover({ balance = 0 }) {
  const [open, setOpen] = useState(false);
  const [lastTx, setLastTx] = useState(null);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return;
    base44.entities.CreditTransaction.filter({}, '-created_date', 1)
      .then(r => setLastTx(r[0] || null)).catch(() => {});
    const close = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, [open]);

  return (
    <div className="relative" ref={ref} data-tour="credits">
      <button onClick={() => setOpen(o => !o)}
        className="flex items-center gap-1.5 rounded-full border border-gold/40 bg-gold/10 px-3.5 py-1.5 text-sm font-bold text-secondary transition-transform hover:scale-[1.03] active:scale-95">
        <Coins size={14} className="text-gold" />
        {balance} credits
      </button>

      {open && (
        <div className="absolute right-0 top-full z-50 mt-2 w-72 rounded-2xl border border-border bg-white p-4 shadow-xl">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gold/15">
              <Coins size={20} className="text-gold" />
            </div>
            <div>
              <p className="font-heading text-2xl font-extrabold leading-none text-secondary">{balance}</p>
              <p className="text-xs text-muted-foreground">credits available</p>
            </div>
          </div>

          <p className="mt-3 rounded-lg bg-muted/60 px-3 py-2 text-[11px] leading-relaxed text-muted-foreground">
            1 credit = 1 course · credits are valid for 12 months
          </p>

          {lastTx && (
            <div className="mt-3 border-t border-border pt-3">
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                {lastTx.type === 'spend' ? 'Last used' : 'Last purchase'}
              </p>
              <p className="mt-1 text-xs font-semibold text-secondary">
                {lastTx.type === 'spend'
                  ? `1 credit on ${lastTx.package_name}`
                  : `${lastTx.package_name} · ${lastTx.credits} credits${lastTx.amount_kes ? ` · ${formatKES(lastTx.amount_kes)}` : ''}`}
              </p>
              <p className="mt-0.5 text-[11px] text-muted-foreground">
                {new Date(lastTx.created_date).toLocaleDateString('en-KE', { day: 'numeric', month: 'short', year: 'numeric' })}
              </p>
            </div>
          )}

          <Link to="/credits" onClick={() => setOpen(false)}
            className="mt-3 flex items-center justify-center gap-1 rounded-lg bg-primary py-2 text-xs font-bold text-primary-foreground transition-transform hover:bg-primary/90 active:scale-[0.98]">
            Buy more credits <ChevronRight size={13} />
          </Link>
        </div>
      )}
    </div>
  );
}

/* ================================================================
   2) ONBOARDING TOUR — 9 steps, first login only
================================================================ */
const TOUR_STEPS = [
  { target: null, title: 'Welcome to PASS Learning 🎉',
    text: "Let's take a quick 60-second tour of your growth journey. You can skip anytime." },
  { target: 'credits', title: 'Your learning currency',
    text: '1 credit unlocks 1 full course. Tap this pill anytime to check your balance and last purchase.' },
  { target: 'notifications', title: 'We celebrate with you',
    text: "Milestones, certificates, gentle nudges when a course misses you — they all land here." },
  { target: 'stepper', title: 'Your journey at a glance',
    text: 'Your active course lives here — every module, every checkpoint, one glance.' },
  { target: 'continue', title: 'Never lose your place',
    text: 'Life gets busy. This card always takes you back to exactly where you stopped.' },
  { target: 'deliverables', title: 'Assessments live here',
    text: 'Pending quizzes appear here. Score 70% or above and the certificate is yours.' },
  { target: 'nav-catalogue', title: 'Explore the catalogue',
    text: 'Browse every PASS course and unlock any of them with a single credit.' },
  { target: 'nav-certificates', title: 'Proof of your growth',
    text: 'Every completed course earns a verifiable PASS certificate — downloadable and LinkedIn-ready.' },
  { target: null, title: "You're all set! 🚀", isFinal: true,
    text: 'Your first course is waiting. Go make your goals happen.' },
];

export function OnboardingTour({ user }) {
  const [step, setStep] = useState(-1);
  const [rect, setRect] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) return;
    const doneLocal = localStorage.getItem('pass_onboarded') === '1';
    if (!user.onboarded && !doneLocal) setStep(0);
  }, [user]);

  useEffect(() => {
    if (step < 0) return;
    const t = TOUR_STEPS[step]?.target;
    if (!t) { setRect(null); return; }
    const el = document.querySelector(`[data-tour="${t}"]`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      const update = () => setRect(el.getBoundingClientRect());
      setTimeout(update, 300); // wait for scroll
      window.addEventListener('resize', update);
      return () => window.removeEventListener('resize', update);
    }
    setRect(null);
  }, [step]);

  const finish = async (goCatalogue = false) => {
    setStep(-1);
    localStorage.setItem('pass_onboarded', '1');
    base44.auth.updateMe({ onboarded: true }).catch(() => {});
    if (goCatalogue) navigate('/catalogue');
  };

  if (step < 0) return null;
  const s = TOUR_STEPS[step];
  const isCentered = !s.target || !rect;

  const tipStyle = isCentered ? {} : (() => {
    const below = rect.bottom + 12;
    const flip = below + 200 > window.innerHeight;
    return {
      position: 'fixed',
      top: flip ? Math.max(12, rect.top - 210) : below,
      left: Math.min(Math.max(12, rect.left + rect.width / 2 - 150), window.innerWidth - 312),
    };
  })();

  return (
    <div className="fixed inset-0 z-[100]">
      {/* Dimmed overlay */}
      <div className="absolute inset-0 bg-black/55 transition-all duration-300"
        style={!isCentered && rect ? {
          clipPath: `polygon(0 0, 100% 0, 100% 100%, 0 100%,
            0 ${rect.top - 6}px,
            ${rect.left - 6}px ${rect.top - 6}px,
            ${rect.left - 6}px ${rect.bottom + 6}px,
            ${rect.right + 6}px ${rect.bottom + 6}px,
            ${rect.right + 6}px ${rect.top - 6}px,
            0 ${rect.top - 6}px)`,
        } : {}} />

      {/* Spotlight ring */}
      {!isCentered && rect && (
        <div className="pointer-events-none absolute rounded-xl ring-2 ring-gold ring-offset-2 transition-all duration-300"
          style={{ top: rect.top - 6, left: rect.left - 6, width: rect.width + 12, height: rect.height + 12 }} />
      )}

      {/* Tooltip card */}
      <div style={tipStyle}
        className={`w-[300px] rounded-2xl bg-white p-5 shadow-2xl
          ${isCentered ? 'absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2' : ''}`}>
        <div className="flex items-start justify-between">
          <p className="flex items-center gap-1.5 font-heading text-base font-bold text-secondary">
            {(s.isFinal || step === 0) && <Sparkles size={16} className="text-gold" />}
            {s.title}
          </p>
          <button onClick={() => finish()} className="text-muted-foreground hover:text-secondary"><X size={15} /></button>
        </div>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{s.text}</p>

        {/* Progress dots */}
        <div className="mt-4 flex items-center gap-1.5">
          {TOUR_STEPS.map((_, i) => (
            <span key={i} className={`h-1.5 rounded-full transition-all ${i === step ? 'w-5 bg-primary' : 'w-1.5 bg-muted'}`} />
          ))}
          <span className="ml-auto text-[11px] font-semibold text-muted-foreground">{step + 1} of {TOUR_STEPS.length}</span>
        </div>

        {/* Controls */}
        <div className="mt-4 flex items-center justify-between">
          {s.isFinal ? (
            <button onClick={() => finish(true)}
              className="w-full rounded-lg bg-primary py-2.5 text-sm font-bold text-primary-foreground transition-transform active:scale-[0.98]">
              Start Learning →
            </button>
          ) : (
            <>
              <button onClick={() => finish()} className="text-xs font-semibold text-muted-foreground hover:text-secondary">Skip tour</button>
              <div className="flex items-center gap-2">
                {step > 0 && (
                  <button onClick={() => setStep(step - 1)}
                    className="flex items-center gap-1 rounded-lg border border-border px-3 py-1.5 text-xs font-bold text-secondary hover:bg-muted">
                    <ChevronLeft size={13} /> Back
                  </button>
                )}
                <button onClick={() => setStep(step + 1)}
                  className="flex items-center gap-1 rounded-lg bg-primary px-4 py-1.5 text-xs font-bold text-primary-foreground transition-transform active:scale-95">
                  Next <ChevronRight size={13} />
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
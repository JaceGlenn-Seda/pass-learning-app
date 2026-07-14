// ============================================================
// PASS Learning App — Dashboard (ALX-inspired redesign)
// ============================================================
import React, { useState, useEffect } from 'react';
import { Link, useOutletContext } from 'react-router-dom';
import {
  CheckCircle2, Circle, Play, ListChecks, Sparkles, TrendingUp,
  Clock, ChevronRight, BookOpen,
} from 'lucide-react';
import { base44 } from '@/api/base44Client';

const greeting = () => {
  const h = new Date().getHours();
  return h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening';
};

export default function Dashboard() {
  const { user, refreshUser } = useOutletContext() || {};
  const [courses, setCourses] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const [cs, es] = await Promise.all([
        base44.entities.Course.filter({ is_published: true }, 'order', 50),
        base44.entities.Enrollment.filter({ created_by_id: user.id }, '-updated_date', 50),
      ]);
      setCourses(cs);
      setEnrollments(es);

      // New user onboarding
      if (!user.credit_balance && cs.length > 0) {
        await base44.auth.updateMe({ credit_balance: 3 });
        const firstCourse = cs[0];
        const alreadyEnrolled = es.some(en => en.course_id === firstCourse.id);
        if (!alreadyEnrolled) {
          await base44.entities.Enrollment.create({
            course_id: firstCourse.id,
            course_title: firstCourse.title,
            course_thumbnail: firstCourse.thumbnail,
            unlocked: true, progress: 0, completed_module_ids: [], status: 'in_progress',
          });
        }
        base44.integrations.Core.SendEmail({
          to: user.email,
          subject: 'Welcome to PASS Learning 🎉',
          body: `Hi ${user.full_name || 'there'},\n\nWelcome to PASS Learning! You've been given 3 starter credits.\n\nBrowse the catalogue: https://pass.learning/catalogue\n\nHappy learning,\nThe PASS Team`,
        }).catch(() => {});
        refreshUser?.();
      }

      const activeEnr = es.find(e => e.unlocked && e.status !== 'completed') || es[0];
      if (activeEnr) {
        const mods = await base44.entities.Module.filter({ course_id: activeEnr.course_id }, 'order', 50);
        setModules(mods);
      }
      setLoading(false);
    })();
  }, [user]);

  if (loading) return <div className="flex h-64 items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-4 border-muted border-t-primary" /></div>;

  const firstName = (user?.full_name || 'Learner').split(' ')[0];
  const active = enrollments.find(e => e.unlocked && e.status !== 'completed');
  const activeCourse = active && courses.find(c => c.id === active.course_id);
  const completedIds = active?.completed_module_ids || [];
  const currentIdx = Math.min(completedIds.length, Math.max(0, modules.length - 1));
  const nextQuiz = modules.find(m => m.module_type === 'quiz' && !completedIds.includes(m.id));

  const unlocked = enrollments.filter(e => e.unlocked);
  const overallPct = unlocked.length ? Math.round(unlocked.reduce((a, e) => a + (e.progress || 0), 0) / unlocked.length) : 0;
  const scores = enrollments.filter(e => e.quiz_score != null);
  const avgScore = scores.length ? Math.round(scores.reduce((a, e) => a + e.quiz_score, 0) / scores.length) : 0;
  const recentlyActive = enrollments.some(e => (Date.now() - new Date(e.updated_date)) / 86400000 < 7);
  const lastBusy = [...unlocked].sort((a, b) => new Date(b.updated_date) - new Date(a.updated_date))[0];

  const enrolledIds = enrollments.map(e => e.course_id);
  const recommended = courses.find(c => !enrolledIds.includes(c.id));
  const lowest = [...scores].sort((a, b) => a.quiz_score - b.quiz_score)[0];
  const reason = lowest
    ? `Since you scored ${lowest.quiz_score}% in ${lowest.course_title}, this strengthens adjacent skills.`
    : 'A great next step on your soft-skills journey.';

  return (
    <div className="mx-auto max-w-6xl space-y-6 animate-fade-in">
      {/* GREETING */}
      <div>
        <h1 className="font-heading text-2xl font-bold text-secondary lg:text-3xl">
          {greeting()}, {firstName} <span className="inline-block">👋</span>
        </h1>
      </div>

      {/* MODULE STEPPER */}
      {activeCourse && modules.length > 0 && (
        <div data-tour="stepper" className="rounded-2xl border border-border bg-card p-4 shadow-card">
          <p className="mb-3 text-xs font-bold uppercase tracking-wider text-muted-foreground">{activeCourse.title} — your journey</p>
          <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-thin">
            {modules.map((m, i) => {
              const done = completedIds.includes(m.id);
              const current = i === currentIdx && !done;
              return (
                <React.Fragment key={m.id}>
                  {i > 0 && <div className={`h-px w-6 shrink-0 ${done || current ? 'bg-primary/40' : 'bg-border'}`} />}
                  <Link to={`/course/${activeCourse.id}`}
                    className={`flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition-colors
                      ${done ? 'text-green-600 hover:bg-green-50' : current ? 'bg-accent/10 text-primary' : 'pointer-events-none text-muted-foreground/60'}`}>
                    {done
                      ? <CheckCircle2 size={15} className="text-green-600" />
                      : <Circle size={15} className={current ? 'text-primary' : 'text-muted-foreground/40'} />}
                    <span className="max-w-[140px] truncate">{m.title}</span>
                  </Link>
                </React.Fragment>
              );
            })}
          </div>
        </div>
      )}

      {/* CONTINUE + DELIVERABLES */}
      <div className="grid gap-6 lg:grid-cols-[1.8fr_1fr]">
        {/* Continue where you left off */}
        <div data-tour="continue" className="rounded-2xl border border-border bg-card p-5 shadow-card">
          <p className="text-sm font-bold text-primary">Continue where you left off</p>
          {activeCourse ? (
            <>
              <h2 className="mt-1 font-heading text-lg font-bold text-secondary">{activeCourse.title}</h2>
              <div className="relative mt-4 h-48 overflow-hidden rounded-xl lg:h-56">
                <img src={activeCourse.thumbnail} alt=""
                  onError={e => { e.currentTarget.style.display = 'none'; }}
                  className="h-full w-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-tr from-secondary via-secondary/70 to-primary/40" />
                <div className="absolute inset-0 flex flex-col justify-center p-6">
                  <p className="text-xs font-bold uppercase tracking-widest text-gold">Module {currentIdx + 1} of {modules.length}</p>
                  <h3 className="mt-1 max-w-md font-heading text-2xl font-extrabold text-white lg:text-3xl">
                    {modules[currentIdx]?.title || 'Keep going'}
                  </h3>
                </div>
              </div>
              <Link to={`/course/${activeCourse.id}`}
                className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-primary py-3 text-sm font-bold text-primary-foreground transition-transform hover:bg-primary/90 active:scale-[0.99]">
                <Play size={15} fill="currentColor" /> Resume
              </Link>
            </>
          ) : (
            <div className="flex flex-col items-center py-10 text-center">
              <BookOpen size={32} className="text-muted-foreground/50" />
              <p className="mt-3 text-sm text-muted-foreground">No active course yet — unlock one from the catalogue.</p>
              <Link to="/catalogue" className="mt-4 rounded-lg bg-primary px-6 py-2.5 text-sm font-bold text-primary-foreground">Browse Catalogue</Link>
            </div>
          )}
        </div>

        {/* Immediate deliverables */}
        <div data-tour="deliverables" className="rounded-2xl border border-border bg-card p-5 shadow-card">
          <p className="text-sm font-bold text-primary">Your immediate deliverables</p>
          {nextQuiz ? (
            <div className="mt-5 flex items-start gap-4">
              <Ring pct={active?.progress || 0} />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold leading-snug text-secondary">{nextQuiz.title}</p>
                <p className="mt-1 text-xs text-muted-foreground">Questions: {(nextQuiz.quiz_questions || []).length} · pass {nextQuiz.passing_score || 70}%</p>
                <Link to={`/course/${active.course_id}`}
                  className="mt-3 inline-block w-full rounded-lg border-2 border-primary py-2 text-center text-sm font-bold text-primary transition-colors hover:bg-primary hover:text-primary-foreground">
                  Start
                </Link>
              </div>
            </div>
          ) : (
            <div className="mt-6 flex flex-col items-center text-center">
              <ListChecks size={26} className="text-muted-foreground/50" />
              <p className="mt-2 text-xs text-muted-foreground">No assessments pending. Keep learning to unlock your next quiz.</p>
            </div>
          )}
        </div>
      </div>

      {/* BOTTOM TRIO */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* You were busy with */}
        <div className="rounded-2xl border border-border bg-card p-5 shadow-card">
          <p className="text-sm font-bold text-primary">You were busy with</p>
          {lastBusy ? (
            <>
              <h3 className="mt-2 font-heading text-base font-bold text-secondary">{lastBusy.course_title}</h3>
              <p className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
                <Clock size={13} /> Last activity: {new Date(lastBusy.updated_date).toLocaleDateString('en-KE', { day: 'numeric', month: 'short' })}
              </p>
              <p className="mt-3 text-xs font-semibold text-secondary">Modules completed: {(lastBusy.completed_module_ids || []).length}</p>
              <Bar pct={lastBusy.progress || 0} />
            </>
          ) : <p className="mt-3 text-xs text-muted-foreground">Your activity will appear here.</p>}
        </div>

        {/* Overall progress */}
        <div className="rounded-2xl border border-border bg-card p-5 shadow-card">
          <p className="text-sm font-bold text-primary">Your overall progress</p>
          <h3 className="mt-2 font-heading text-2xl font-extrabold text-secondary">Score: {avgScore}%</h3>
          <p className="mt-1 text-xs text-muted-foreground">Average across all assessments</p>
          <div className="mt-3 flex items-center justify-between text-xs">
            <span className="font-semibold text-secondary">Overall: {overallPct}%</span>
            <span className={`rounded-full px-2 py-0.5 font-bold ${recentlyActive ? 'bg-green-100 text-green-700' : 'bg-gold/15 text-gold'}`}>
              {recentlyActive ? "You're on track" : "Let's get moving"}
            </span>
          </div>
          <Bar pct={overallPct} />
          <Link to="/quizzes" className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-primary hover:underline">
            See score details <ChevronRight size={13} />
          </Link>
        </div>

        {/* Up next — AI recommendation */}
        <div className="rounded-2xl bg-gradient-to-br from-secondary to-primary p-5 text-white shadow-card">
          <p className="flex items-center gap-1.5 text-sm font-bold text-gold"><Sparkles size={14} /> Up next for you</p>
          {recommended ? (
            <>
              <h3 className="mt-2 font-heading text-base font-bold">{recommended.title}</h3>
              <p className="mt-1.5 text-xs leading-relaxed text-white/70">{reason}</p>
              <Link to="/catalogue"
                className="mt-4 inline-block rounded-lg bg-white px-5 py-2 text-sm font-bold text-secondary transition-transform hover:scale-[1.03]">
                Explore Course
              </Link>
            </>
          ) : (
            <p className="mt-3 flex items-center gap-1.5 text-xs text-white/70">
              <TrendingUp size={14} /> You're enrolled in every course — full mastery mode! 🏆
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function Ring({ pct }) {
  const r = 22, c = 2 * Math.PI * r;
  return (
    <div className="relative shrink-0">
      <svg width="56" height="56" viewBox="0 0 56 56" className="-rotate-90">
        <circle cx="28" cy="28" r={r} fill="none" stroke="#E8EDF7" strokeWidth="5" />
        <circle cx="28" cy="28" r={r} fill="none" stroke="#2E6FE8" strokeWidth="5"
          strokeDasharray={c} strokeDashoffset={c - (pct / 100) * c} strokeLinecap="round" />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center text-xs font-extrabold text-secondary">{pct}%</span>
    </div>
  );
}

const Bar = ({ pct }) => (
  <div className="mt-2 h-2 overflow-hidden rounded-full bg-muted">
    <div className="h-full rounded-full bg-primary transition-all duration-700" style={{ width: `${pct}%` }} />
  </div>
);
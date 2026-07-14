// ============================================================
// PASS Learning App — CoursePlayer (Udemy-style redesign)
// ============================================================
import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link, useOutletContext } from 'react-router-dom';
import {
  CheckCircle2, ChevronRight, ChevronLeft, Play, Lock, Award,
  X, Check, RefreshCw, PanelRightOpen, Share2, Sparkles, Send,
  FileText, Video, ListChecks, ChevronDown, StickyNote,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { base44 } from '@/api/base44Client';
import { useToast } from '@/components/ui/use-toast';
import PassLogo from '@/components/PassLogo';
import { generateCertificateId } from '@/lib/brand';

const typeIcon = (t) => (t === 'video' ? Video : t === 'slides' ? FileText : ListChecks);

export default function CoursePlayer() {
  const { id } = useParams();
  const { user, refreshUser } = useOutletContext() || {};
  const { toast } = useToast();

  const [course, setCourse] = useState(null);
  const [modules, setModules] = useState([]);
  const [enrollment, setEnrollment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeIdx, setActiveIdx] = useState(0);
  const [quizState, setQuizState] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [sideTab, setSideTab] = useState('content');
  const [bottomTab, setBottomTab] = useState('overview');
  const [progressOpen, setProgressOpen] = useState(false);

  useEffect(() => {
    Promise.all([
      base44.entities.Course.get(id),
      base44.entities.Module.filter({ course_id: id }, 'order', 50),
      base44.entities.Enrollment.filter({ course_id: id, created_by_id: user?.id }, '-updated_date', 5),
    ]).then(([c, m, e]) => {
      setCourse(c);
      setModules(m);
      const en = e[0];
      setEnrollment(en);
      if (en?.current_module_id) {
        const i = m.findIndex(x => x.id === en.current_module_id);
        if (i >= 0) setActiveIdx(i);
      }
    }).finally(() => setLoading(false));
  }, [id]);

  const active = modules[activeIdx];
  const completedIds = enrollment?.completed_module_ids || [];
  const progress = modules.length ? Math.round((completedIds.length / modules.length) * 100) : 0;

  const sections = [
    { title: 'Section 1: Learning Modules', items: modules.filter(m => m.module_type !== 'quiz') },
    { title: 'Section 2: Assessment & Certification', items: modules.filter(m => m.module_type === 'quiz') },
  ].filter(s => s.items.length);

  const persistCompletion = async (ids, idx) => {
    const prog = Math.round((ids.length / modules.length) * 100);
    const nextId = idx + 1 < modules.length ? modules[idx + 1].id : null;
    const updated = await base44.entities.Enrollment.update(enrollment.id, {
      completed_module_ids: ids, progress: prog, current_module_id: nextId,
    });
    setEnrollment(updated);
  };

  const toggleComplete = async (mod) => {
    if (!enrollment) return;
    const ids = completedIds.includes(mod.id)
      ? completedIds.filter(x => x !== mod.id)
      : [...completedIds, mod.id];
    await persistCompletion(ids, modules.findIndex(m => m.id === mod.id));
  };

  const completeAndContinue = async () => {
    if (!active || active.module_type === 'quiz') return;
    const ids = completedIds.includes(active.id) ? completedIds : [...completedIds, active.id];
    await persistCompletion(ids, activeIdx);
    if (activeIdx + 1 < modules.length) { setActiveIdx(activeIdx + 1); setQuizState(null); }
    toast({ title: 'Module completed ✓', description: 'Great work! Moving to the next module.' });
  };

  const submitQuiz = async (answers) => {
    const qs = active.quiz_questions || [];
    let correct = 0;
    qs.forEach((q, i) => { if (answers[i] === q.correct_index) correct++; });
    const score = Math.round((correct / qs.length) * 100);
    const passed = score >= (active.passing_score || 70);
    if (passed) {
      const ids = completedIds.includes(active.id) ? completedIds : [...completedIds, active.id];
      await base44.entities.Enrollment.update(enrollment.id, {
        completed_module_ids: ids, progress: 100, quiz_score: score,
        status: 'completed', completed_date: new Date().toISOString(),
      });
      const certId = generateCertificateId();
      await base44.entities.Certificate.create({
        learner_name: user?.full_name || 'Learner', course_id: id, course_title: course.title,
        score, certificate_id: certId, issue_date: new Date().toISOString().slice(0, 10),
      });
      base44.entities.Notification.create({
        title: '🎉 Course Completed!', type: 'milestone', action_url: '/certificates',
        message: `You completed ${course.title} with ${score}%. Your certificate is ready.`,
      }).catch(() => {});
      confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 }, colors: ['#1B3A8C', '#2E6FE8', '#F5A623', '#E63946'] });
      base44.integrations.Core.SendEmail({
        to: user?.email,
        subject: 'Your PASS Certificate is ready 🏅',
        body: `Hi ${user?.full_name || 'there'},\n\nCongratulations! You completed <strong>${course.title}</strong> with a score of <strong>${score}%</strong>.\n\nView your certificate: https://pass.learning/certificates\n\nWell done,\nThe PASS Team`,
      }).catch(() => {});
      setQuizState({ score, passed, correct, total: qs.length, certificateId: certId });
      refreshUser?.();
    } else {
      setQuizState({ score, passed, correct, total: qs.length });
    }
  };

  if (loading) return <div className="flex h-64 items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-4 border-muted border-t-primary" /></div>;
  if (!course) return <div className="p-8 text-center text-muted-foreground">Course not found.</div>;
  if (!enrollment?.unlocked) return (
    <div className="mx-auto max-w-md py-20 text-center">
      <Lock className="mx-auto text-muted-foreground" size={40} />
      <h2 className="mt-4 font-heading text-xl font-bold text-secondary">This course is locked</h2>
      <p className="mt-2 text-sm text-muted-foreground">Unlock it with 1 credit from the catalogue.</p>
      <Link to="/catalogue" className="mt-5 inline-block rounded-lg bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground">Go to Catalogue</Link>
    </div>
  );

  return (
    <div className="-m-4 flex min-h-screen flex-col bg-white lg:-m-8">
      {/* DARK COURSE HEADER */}
      <header className="flex items-center gap-4 bg-secondary px-4 py-3 text-white lg:px-6">
        <Link to="/dashboard"><PassLogo light className="text-lg" /></Link>
        <div className="hidden h-6 w-px bg-white/20 sm:block" />
        <h1 className="flex-1 truncate text-sm font-semibold sm:text-base">{course.title}</h1>
        <div className="relative">
          <button onClick={() => setProgressOpen(o => !o)} className="flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-medium hover:bg-white/10">
            <ProgressRing pct={progress} />
            <span className="hidden sm:inline">Your progress</span>
            <ChevronDown size={14} />
          </button>
          {progressOpen && (
            <div className="absolute right-0 top-full z-50 mt-2 w-56 rounded-xl border border-border bg-white p-4 text-secondary shadow-xl">
              <p className="text-sm font-bold">{completedIds.length} of {modules.length} complete.</p>
              <p className="mt-1 text-xs text-muted-foreground">Finish the course to earn your PASS certificate.</p>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-muted"><div className="h-full rounded-full bg-primary transition-all duration-500" style={{ width: `${progress}%` }} /></div>
            </div>
          )}
        </div>
        <button
          onClick={() => { navigator.clipboard?.writeText(window.location.href); toast({ title: 'Link copied' }); }}
          className="flex items-center gap-1.5 rounded-lg border border-white/30 px-3 py-1.5 text-sm font-medium hover:bg-white/10">
          <Share2 size={14} /><span className="hidden sm:inline">Share</span>
        </button>
        {!sidebarOpen && (
          <button onClick={() => setSidebarOpen(true)} className="rounded-lg border border-white/30 p-1.5 hover:bg-white/10" title="Open course content">
            <PanelRightOpen size={16} />
          </button>
        )}
      </header>

      {/* BODY */}
      <div className="flex flex-1 overflow-hidden">
        {/* LEFT: STAGE + TABS */}
        <div className="flex-1 overflow-y-auto">
          <div className="border-b border-border bg-secondary/5">
            {active?.module_type === 'video' && <VideoStage module={active} />}
            {active?.module_type === 'slides' && <SlidesStage module={active} />}
            {active?.module_type === 'quiz' && (
              <QuizStage module={active} quizState={quizState} onSubmit={submitQuiz} onRetry={() => setQuizState(null)} />
            )}
          </div>

          {/* Bottom nav bar */}
          <div className="flex items-center justify-between border-b border-border px-4 py-3 lg:px-6">
            <button onClick={() => { setActiveIdx(Math.max(0, activeIdx - 1)); setQuizState(null); }} disabled={activeIdx === 0}
              className="flex items-center gap-1 rounded-lg border border-border px-4 py-2 text-sm font-semibold text-secondary transition-transform active:scale-95 disabled:opacity-40 hover:bg-muted">
              <ChevronLeft size={16} /> Previous
            </button>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Module {activeIdx + 1} of {modules.length}</p>
            {active?.module_type !== 'quiz' ? (
              <button onClick={completeAndContinue}
                className="flex items-center gap-2 rounded-lg bg-primary px-5 py-2 text-sm font-bold text-primary-foreground transition-transform hover:bg-primary/90 active:scale-95">
                Complete &amp; Continue <ChevronRight size={16} />
              </button>
            ) : <div className="w-[172px]" />}
          </div>

          {/* Udemy-style tab bar */}
          <div className="px-4 lg:px-6">
            <div className="flex gap-6 border-b border-border">
              {[['overview', 'Overview'], ['notes', 'Notes'], ['qa', 'Q&A'], ['reviews', 'Reviews']].map(([k, label]) => (
                <button key={k} onClick={() => setBottomTab(k)}
                  className={`border-b-2 py-3 text-sm font-semibold transition-colors ${bottomTab === k ? 'border-primary text-secondary' : 'border-transparent text-muted-foreground hover:text-secondary'}`}>
                  {label}
                </button>
              ))}
            </div>
            <div className="py-6">
              {bottomTab === 'overview' && <OverviewTab course={course} modules={modules} />}
              {bottomTab === 'notes' && <NotesTab courseId={id} module={active} />}
              {bottomTab === 'qa' && <EmptyTab icon={ListChecks} text="Q&A is coming soon. For now, ask the AI Assistant →" />}
              {bottomTab === 'reviews' && <EmptyTab icon={Award} text="Reviews open after your first cohort completes the course." />}
            </div>
          </div>
        </div>

        {/* RIGHT: SIDEBAR */}
        {sidebarOpen && (
          <aside className="flex w-[340px] shrink-0 flex-col border-l border-border bg-white">
            <div className="flex items-center border-b border-border">
              <button onClick={() => setSideTab('content')}
                className={`flex-1 py-3 text-sm font-bold ${sideTab === 'content' ? 'border-b-2 border-primary text-secondary' : 'text-muted-foreground'}`}>
                Course content
              </button>
              <button onClick={() => setSideTab('ai')}
                className={`flex flex-1 items-center justify-center gap-1 py-3 text-sm font-bold ${sideTab === 'ai' ? 'border-b-2 border-primary text-secondary' : 'text-muted-foreground'}`}>
                <Sparkles size={14} className="text-gold" /> AI Assistant
              </button>
              <button onClick={() => setSidebarOpen(false)} className="px-3 text-muted-foreground hover:text-secondary"><X size={16} /></button>
            </div>
            {sideTab === 'content'
              ? <CurriculumTab sections={sections} modules={modules} activeIdx={activeIdx} completedIds={completedIds}
                  onSelect={(i) => { setActiveIdx(i); setQuizState(null); }} onToggle={toggleComplete} />
              : <AIAssistant course={course} modules={modules} active={active} />}
          </aside>
        )}
      </div>
    </div>
  );
}

// ============ SUB-COMPONENTS ============

function ProgressRing({ pct }) {
  const r = 10, c = 2 * Math.PI * r;
  return (
    <svg width="26" height="26" viewBox="0 0 26 26" className="-rotate-90">
      <circle cx="13" cy="13" r={r} fill="none" stroke="rgba(255,255,255,.25)" strokeWidth="3" />
      <circle cx="13" cy="13" r={r} fill="none" stroke="#F5A623" strokeWidth="3"
        strokeDasharray={c} strokeDashoffset={c - (pct / 100) * c} strokeLinecap="round" />
    </svg>
  );
}

function CurriculumTab({ sections, modules, activeIdx, completedIds, onSelect, onToggle }) {
  const [open, setOpen] = useState(() => sections.map(() => true));
  return (
    <div className="flex-1 overflow-y-auto">
      {sections.map((sec, si) => {
        const done = sec.items.filter(m => completedIds.includes(m.id)).length;
        const mins = sec.items.reduce((a, m) => a + (m.duration_minutes || 10), 0);
        return (
          <div key={si} className="border-b border-border">
            <button onClick={() => setOpen(o => o.map((v, i) => i === si ? !v : v))}
              className="flex w-full items-center justify-between bg-muted/50 px-4 py-3 text-left">
              <div>
                <p className="text-sm font-bold text-secondary">{sec.title}</p>
                <p className="text-xs text-muted-foreground">{done} / {sec.items.length} | {mins}min</p>
              </div>
              <ChevronDown size={16} className={`text-muted-foreground transition-transform ${open[si] ? 'rotate-180' : ''}`} />
            </button>
            {open[si] && sec.items.map((mod) => {
              const gi = modules.findIndex(m => m.id === mod.id);
              const Icon = typeIcon(mod.module_type);
              const isDone = completedIds.includes(mod.id);
              return (
                <div key={mod.id} onClick={() => onSelect(gi)}
                  className={`flex cursor-pointer items-start gap-3 px-4 py-3 transition-colors ${gi === activeIdx ? 'bg-accent/10' : 'hover:bg-muted/50'}`}>
                  <button onClick={(e) => { e.stopPropagation(); onToggle(mod); }}
                    className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-sm border transition-colors ${isDone ? 'border-primary bg-primary text-white' : 'border-muted-foreground/40 bg-white'}`}>
                    {isDone && <Check size={11} strokeWidth={3} />}
                  </button>
                  <div className="min-w-0">
                    <p className="text-sm font-medium leading-snug text-secondary">{gi + 1}. {mod.title}</p>
                    <p className="mt-0.5 flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Icon size={12} /> {mod.module_type === 'quiz' ? 'Quiz' : mod.module_type === 'slides' ? 'Slides' : 'Video'} · {mod.duration_minutes || 10}min
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}

function AIAssistant({ course, modules, active }) {
  const [msgs, setMsgs] = useState([{ role: 'ai', text: `Hi! I'm your PASS AI Tutor 👋 Ask me anything about "${course.title}" — I know every module.` }]);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const endRef = useRef(null);
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [msgs]);

  const ask = async (q) => {
    if (!q.trim() || busy) return;
    setMsgs(m => [...m, { role: 'user', text: q }]);
    setInput('');
    setBusy(true);
    try {
      const context = modules.map(m => `${m.title}: ${m.summary || ''}`).join('\n');
      const res = await base44.integrations.Core.InvokeLLM({
        prompt: `You are the PASS AI Tutor for the course "${course.title}" by Parikshit Trivedi. Course modules:\n${context}\n\nCurrent module: ${active?.title}. Answer concisely, practically, grounded in the course content, with an encouraging professional tone.\n\nLearner question: ${q}`,
      });
      const answer = typeof res === 'string' ? res : (res?.response || res?.text || 'Let me get back to you on that.');
      setMsgs(m => [...m, { role: 'ai', text: answer }]);
    } catch {
      setMsgs(m => [...m, { role: 'ai', text: 'I had trouble answering that — please try again.' }]);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <div className="flex-1 space-y-3 overflow-y-auto p-4">
        {msgs.map((m, i) => (
          <div key={i} className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${m.role === 'ai' ? 'bg-muted text-secondary' : 'ml-auto bg-primary text-primary-foreground'}`}>{m.text}</div>
        ))}
        {busy && <div className="flex gap-1 rounded-2xl bg-muted px-4 py-3 w-fit"><Dot /><Dot d="150ms" /><Dot d="300ms" /></div>}
        <div ref={endRef} />
      </div>
      <div className="flex flex-wrap gap-1.5 px-4 pb-2">
        {['Summarise this module', 'Give me a real-world example', 'Quiz me on this lesson'].map(s => (
          <button key={s} onClick={() => ask(s)} className="rounded-full border border-border px-3 py-1 text-xs font-medium text-secondary hover:bg-muted">{s}</button>
        ))}
      </div>
      <div className="flex items-center gap-2 border-t border-border p-3">
        <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && ask(input)}
          placeholder="Ask about this course…" className="flex-1 rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-primary" />
        <button onClick={() => ask(input)} className="rounded-lg bg-primary p-2 text-primary-foreground transition-transform active:scale-95"><Send size={16} /></button>
      </div>
    </div>
  );
}

const Dot = ({ d = '0ms' }) => <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground" style={{ animationDelay: d }} />;

function OverviewTab({ course, modules }) {
  return (
    <div className="max-w-2xl space-y-5">
      <div>
        <h3 className="font-heading text-lg font-bold text-secondary">About this course</h3>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{course.description}</p>
      </div>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[['Instructor', course.instructor || 'Parikshit Trivedi'], ['Level', course.level], ['Duration', `${course.duration_minutes} min`], ['Modules', modules.length]].map(([k, v]) => (
          <div key={k} className="rounded-xl border border-border p-3"><p className="text-xs text-muted-foreground">{k}</p><p className="mt-0.5 text-sm font-bold text-secondary">{v}</p></div>
        ))}
      </div>
      <div>
        <h4 className="text-sm font-bold text-secondary">What you'll learn</h4>
        <ul className="mt-2 grid gap-2 sm:grid-cols-2">
          {modules.filter(m => m.module_type !== 'quiz').map(m => (
            <li key={m.id} className="flex items-start gap-2 text-sm text-muted-foreground"><CheckCircle2 size={15} className="mt-0.5 shrink-0 text-primary" /> {m.title}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function NotesTab({ courseId, module: mod }) {
  const key = `pass_note_${courseId}_${mod?.id}`;
  const [note, setNote] = useState(() => localStorage.getItem(key) || '');
  useEffect(() => { setNote(localStorage.getItem(`pass_note_${courseId}_${mod?.id}`) || ''); }, [courseId, mod?.id]);
  return (
    <div className="max-w-2xl">
      <div className="mb-2 flex items-center gap-2 text-sm font-bold text-secondary"><StickyNote size={15} className="text-gold" /> Notes for: {mod?.title}</div>
      <textarea value={note} onChange={e => { setNote(e.target.value); localStorage.setItem(key, e.target.value); }}
        rows={6} placeholder="Write your key takeaways from this module…"
        className="w-full rounded-xl border border-border p-3 text-sm outline-none focus:border-primary" />
      <p className="mt-1 text-xs text-muted-foreground">Saved automatically ✓</p>
    </div>
  );
}

const EmptyTab = ({ icon: Icon, text }) => (
  <div className="flex flex-col items-center py-10 text-center text-muted-foreground">
    <Icon size={28} className="mb-3 opacity-50" /><p className="text-sm">{text}</p>
  </div>
);

function VideoStage({ module: mod }) {
  return (
    <div>
      {mod.video_url ? (
        <div className="aspect-video w-full bg-secondary">
          {mod.video_provider === 'youtube' || mod.video_url.includes('youtube') || mod.video_url.includes('youtu.be')
            ? <iframe className="h-full w-full" src={mod.video_url} title={mod.title} frameBorder="0" allowFullScreen />
            : <video src={mod.video_url} controls className="h-full w-full" />}
        </div>
      ) : (
        <div className="flex aspect-video w-full items-center justify-center bg-gradient-to-br from-secondary to-primary">
          <div className="text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-white/15 backdrop-blur">
              <Play className="ml-1 text-white" size={28} fill="white" />
            </div>
            <p className="mt-4 text-sm font-medium text-white/80">{mod.title}</p>
            <p className="text-xs text-white/50">Video lesson</p>
          </div>
        </div>
      )}
    </div>
  );
}

function SlidesStage({ module: mod }) {
  const [i, setI] = useState(0);
  const slides = mod.slides || [];
  useEffect(() => setI(0), [mod.id]);
  const s = slides[i];
  if (!s) return <div className="p-8 text-center text-muted-foreground">No slides in this module.</div>;
  return (
    <div>
      <div className="relative flex aspect-video items-center bg-gradient-to-br from-secondary via-primary to-secondary p-8">
        <span className="absolute right-4 top-4 rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-white/70">Slide {i + 1} / {slides.length}</span>
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-heading text-2xl font-bold text-white lg:text-3xl">{s.title}</h2>
          <ul className="mt-6 space-y-3 text-left">
            {s.bullets?.map((b, j) => (
              <li key={j} className="flex items-start gap-3 text-white/90"><span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-gold" /><span className="text-sm lg:text-base">{b}</span></li>
            ))}
          </ul>
        </div>
      </div>
      <div className="flex items-center justify-between border-t border-border bg-white p-3 px-4">
        <button onClick={() => setI(Math.max(0, i - 1))} disabled={i === 0} className="flex items-center gap-1 rounded-lg border border-border px-4 py-2 text-sm font-medium text-secondary disabled:opacity-40 hover:bg-muted"><ChevronLeft size={15} /> Prev slide</button>
        <button onClick={() => setI(Math.min(slides.length - 1, i + 1))} disabled={i === slides.length - 1} className="flex items-center gap-1 rounded-lg border border-border px-4 py-2 text-sm font-medium text-secondary disabled:opacity-40 hover:bg-muted">Next slide <ChevronRight size={15} /></button>
      </div>
    </div>
  );
}

function QuizStage({ module: mod, quizState, onSubmit, onRetry }) {
  const qs = mod.quiz_questions || [];
  const [answers, setAnswers] = useState({});
  if (quizState) {
    return (
      <div className="flex aspect-video flex-col items-center justify-center bg-gradient-to-br from-secondary to-primary p-8 text-center text-white">
        <div className="text-5xl">{quizState.passed ? '🎉' : '📚'}</div>
        <h2 className="mt-4 font-heading text-2xl font-bold">You scored {quizState.score}%</h2>
        <p className="mt-1 text-sm text-white/70">{quizState.correct} of {quizState.total} correct · pass mark {mod.passing_score || 70}%</p>
        {quizState.passed ? (
          <Link to="/certificates" className="mt-6 flex items-center gap-2 rounded-lg bg-gold px-6 py-3 text-sm font-bold text-secondary transition-transform hover:scale-105"><Award size={16} /> View My Certificate</Link>
        ) : (
          <button onClick={onRetry} className="mt-6 flex items-center gap-2 rounded-lg bg-white px-6 py-3 text-sm font-bold text-secondary transition-transform hover:scale-105"><RefreshCw size={15} /> Retry Quiz</button>
        )}
      </div>
    );
  }
  return (
    <div className="mx-auto max-w-2xl p-6">
      <p className="text-xs font-bold uppercase tracking-widest text-accent">✨ AI-generated assessment</p>
      <h2 className="mt-1 font-heading text-xl font-bold text-secondary">{mod.title}</h2>
      <div className="mt-5 space-y-6">
        {qs.map((q, qi) => (
          <div key={qi}>
            <p className="text-sm font-bold text-secondary">{qi + 1}. {q.question}</p>
            <div className="mt-2 space-y-2">
              {q.options.map((o, oi) => (
                <button key={oi} onClick={() => setAnswers(a => ({ ...a, [qi]: oi }))}
                  className={`block w-full rounded-lg border px-4 py-2.5 text-left text-sm transition-colors ${answers[qi] === oi ? 'border-primary bg-accent/10 font-semibold text-secondary' : 'border-border text-muted-foreground hover:bg-muted/50'}`}>
                  {o}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
      <button onClick={() => onSubmit(answers)} disabled={Object.keys(answers).length < qs.length}
        className="mt-6 w-full rounded-lg bg-primary py-3 text-sm font-bold text-primary-foreground transition-transform active:scale-[0.99] disabled:opacity-40">
        Submit Assessment
      </button>
    </div>
  );
}
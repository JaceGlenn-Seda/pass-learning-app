import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate, useOutletContext } from 'react-router-dom';
import {
  CheckCircle2, Circle, ChevronRight, ChevronLeft, Play, Lock,
  Award, FileText, Video, ListChecks, X, Check, RefreshCw
} from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useToast } from '@/components/ui/use-toast';
import PassLogo from '@/components/PassLogo';
import { generateCertificateId } from '@/lib/brand';

export default function CoursePlayer() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, refreshUser } = useOutletContext() || {};
  const { toast } = useToast();
  const [course, setCourse] = useState(null);
  const [modules, setModules] = useState([]);
  const [enrollment, setEnrollment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeModuleIdx, setActiveModuleIdx] = useState(0);
  const [quizState, setQuizState] = useState(null);

  useEffect(() => {
    Promise.all([
      base44.entities.Course.get(id),
      base44.entities.Module.filter({ course_id: id }, 'order', 50),
      base44.entities.Enrollment.filter({ course_id: id }, '-updated_date', 5),
    ]).then(([c, m, e]) => {
      setCourse(c);
      setModules(m);
      const en = e[0];
      setEnrollment(en);
      if (en && en.current_module_id) {
        const idx = m.findIndex(mod => mod.id === en.current_module_id);
        if (idx >= 0) setActiveModuleIdx(idx);
      }
    }).finally(() => setLoading(false));
  }, [id]);

  const activeModule = modules[activeModuleIdx];
  const completedIds = enrollment?.completed_module_ids || [];

  const markModuleComplete = async (moduleId) => {
    if (!enrollment) return;
    const newCompleted = completedIds.includes(moduleId) ? completedIds : [...completedIds, moduleId];
    const progress = Math.round((newCompleted.length / modules.length) * 100);
    const nextIdx = activeModuleIdx + 1;
    const nextModuleId = nextIdx < modules.length ? modules[nextIdx].id : null;
    const isLast = nextIdx >= modules.length;
    const updated = await base44.entities.Enrollment.update(enrollment.id, {
      completed_module_ids: newCompleted,
      progress,
      current_module_id: nextModuleId,
      status: isLast && progress >= 100 ? enrollment.status : enrollment.status,
    });
    setEnrollment(updated);
    if (nextIdx < modules.length) {
      setActiveModuleIdx(nextIdx);
      setQuizState(null);
    }
    return progress;
  };

  const handleCompleteAndContinue = async () => {
    if (activeModule?.module_type === 'quiz') return;
    await markModuleComplete(activeModule.id);
    toast({ title: 'Module completed', description: 'Great work! Moving to the next module.' });
  };

  const submitQuiz = async (answers) => {
    const questions = activeModule.quiz_questions || [];
    let correct = 0;
    questions.forEach((q, i) => {
      if (answers[i] === q.correct_index) correct++;
    });
    const score = Math.round((correct / questions.length) * 100);
    const passed = score >= (activeModule.passing_score || 70);

    // Save quiz score
    const newCompleted = completedIds.includes(activeModule.id) ? completedIds : [...completedIds, activeModule.id];
    const progress = Math.round((newCompleted.length / modules.length) * 100);
    const isCourseComplete = progress >= 100;
    const updated = await base44.entities.Enrollment.update(enrollment.id, {
      completed_module_ids: newCompleted,
      progress,
      quiz_score: score,
      status: passed && isCourseComplete ? 'completed' : enrollment.status,
      completed_date: passed && isCourseComplete ? new Date().toISOString() : enrollment.completed_date,
    });
    setEnrollment(updated);

    if (passed && isCourseComplete) {
      // Generate certificate
      const certId = generateCertificateId();
      await base44.entities.Certificate.create({
        learner_name: user?.full_name || user?.email || 'Learner',
        course_id: course.id,
        course_title: course.title,
        score,
        certificate_id: certId,
        issue_date: new Date().toISOString().slice(0, 10),
      });
      await base44.entities.Notification.create({
        title: '🎉 Course Completed!',
        message: `You completed ${course.title} with a score of ${score}%. Your certificate is ready.`,
        type: 'milestone',
        action_url: '/certificates',
      });
      setQuizState({ score, passed, correct, total: questions.length, certificateId: certId });
    } else {
      setQuizState({ score, passed, correct, total: questions.length });
    }
  };

  if (loading) {
    return <div className="flex h-64 items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-4 border-muted border-t-primary" /></div>;
  }

  if (!course) {
    return <div className="p-8 text-center text-muted-foreground">Course not found.</div>;
  }

  if (!enrollment?.unlocked) {
    return (
      <div className="mx-auto max-w-md py-20 text-center">
        <Lock className="mx-auto text-muted-foreground" size={40} />
        <h2 className="mt-4 font-heading text-xl font-bold text-secondary">This course is locked</h2>
        <p className="mt-2 text-sm text-muted-foreground">Unlock it with 1 credit from the catalogue.</p>
        <Link to="/catalogue" className="mt-5 inline-block rounded-lg bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground">Go to Catalogue</Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl animate-fade-in">
      {/* Header */}
      <div className="mb-5 flex items-center gap-2 text-sm">
        <Link to="/my-courses" className="text-muted-foreground hover:text-secondary">My Courses</Link>
        <ChevronRight size={14} className="text-muted-foreground" />
        <span className="font-semibold text-secondary">{course.title}</span>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        {/* Main content stage */}
        <div>
          <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-card">
            {activeModule?.module_type === 'video' && <VideoStage module={activeModule} />}
            {activeModule?.module_type === 'slides' && <SlidesStage module={activeModule} />}
            {activeModule?.module_type === 'quiz' && (
              <QuizStage
                module={activeModule}
                quizState={quizState}
                onSubmit={submitQuiz}
                onRetry={() => setQuizState(null)}
                certificateId={quizState?.certificateId}
              />
            )}
          </div>

          {/* Module info */}
          <div className="mt-5 flex items-center justify-between rounded-xl border border-border bg-card p-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-accent">Module {activeModuleIdx + 1} of {modules.length}</p>
              <h2 className="font-heading text-lg font-bold text-secondary">{activeModule?.title}</h2>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => { setActiveModuleIdx(Math.max(0, activeModuleIdx - 1)); setQuizState(null); }}
                disabled={activeModuleIdx === 0}
                className="rounded-lg border border-border p-2.5 text-secondary disabled:opacity-40 hover:bg-muted"
              >
                <ChevronLeft size={18} />
              </button>
              {activeModule?.module_type !== 'quiz' && (
                <button
                  onClick={handleCompleteAndContinue}
                  className="flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground hover:bg-primary/90"
                >
                  Complete & Continue <ChevronRight size={16} />
                </button>
              )}
            </div>
          </div>

          {/* Progress bar */}
          <div className="mt-4">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Course Progress</span>
              <span>{enrollment.progress || 0}%</span>
            </div>
            <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-muted">
              <div className="h-full rounded-full bg-accent transition-all duration-500" style={{ width: `${enrollment.progress || 0}%` }} />
            </div>
          </div>
        </div>

        {/* Curriculum sidebar */}
        <div className="rounded-2xl border border-border bg-card shadow-card">
          <div className="border-b border-border p-4">
            <h3 className="font-heading text-sm font-bold text-secondary">Curriculum</h3>
            <p className="text-xs text-muted-foreground">{modules.length} modules</p>
          </div>
          <div className="max-h-[600px] overflow-y-auto scrollbar-thin">
            {modules.map((mod, idx) => {
              const isComplete = completedIds.includes(mod.id);
              const isActive = idx === activeModuleIdx;
              const Icon = mod.module_type === 'video' ? Video : mod.module_type === 'slides' ? FileText : ListChecks;
              return (
                <button
                  key={mod.id}
                  onClick={() => { setActiveModuleIdx(idx); setQuizState(null); }}
                  className={`flex w-full items-start gap-3 border-b border-border p-3 text-left transition-colors ${isActive ? 'bg-primary/5' : 'hover:bg-muted/50'}`}
                >
                  {isComplete ? (
                    <CheckCircle2 className="mt-0.5 shrink-0 text-green-600" size={18} />
                  ) : (
                    <Circle className="mt-0.5 shrink-0 text-muted-foreground" size={18} />
                  )}
                  <div className="min-w-0 flex-1">
                    <p className={`text-sm font-medium ${isActive ? 'text-primary' : 'text-secondary'}`}>{mod.title}</p>
                    <div className="mt-0.5 flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Icon size={12} />
                      <span className="capitalize">{mod.module_type}</span>
                      <span>· {mod.duration_minutes} min</span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

function VideoStage({ module: mod }) {
  return (
    <div>
      {mod.video_url ? (
        <div className="aspect-video w-full bg-secondary">
          {mod.video_provider === 'youtube' || mod.video_url.includes('youtube') || mod.video_url.includes('youtu.be') ? (
            <iframe className="h-full w-full" src={mod.video_url} title={mod.title} frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />
          ) : (
            <video src={mod.video_url} controls className="h-full w-full" />
          )}
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
      <div className="p-5">
        <h2 className="font-heading text-xl font-bold text-secondary">{mod.title}</h2>
        {mod.summary && <p className="mt-2 text-sm text-muted-foreground">{mod.summary}</p>}
      </div>
    </div>
  );
}

function SlidesStage({ module: mod }) {
  const [slideIdx, setSlideIdx] = useState(0);
  const slides = mod.slides || [];
  const slide = slides[slideIdx];

  if (!slide) {
    return <div className="p-8 text-center text-muted-foreground">No slides in this module.</div>;
  }

  return (
    <div>
      <div className="relative flex min-h-[340px] items-center bg-gradient-to-br from-secondary via-primary to-secondary p-8 lg:min-h-[400px]">
        <div className="absolute top-4 right-4 rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-white/70">
          Slide {slideIdx + 1} / {slides.length}
        </div>
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-heading text-2xl font-bold text-white lg:text-3xl text-balance">{slide.title}</h2>
          <ul className="mt-6 space-y-3 text-left">
            {slide.bullets?.map((b, i) => (
              <li key={i} className="flex items-start gap-3 text-white/90">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-gold" />
                <span className="text-sm lg:text-base">{b}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="flex items-center justify-between p-4">
        <button
          onClick={() => setSlideIdx(Math.max(0, slideIdx - 1))}
          disabled={slideIdx === 0}
          className="flex items-center gap-1 rounded-lg border border-border px-4 py-2 text-sm font-medium text-secondary disabled:opacity-40 hover:bg-muted"
        >
          <ChevronLeft size={16} /> Previous
        </button>
        <span className="text-xs text-muted-foreground">{mod.title}</span>
        <button
          onClick={() => setSlideIdx(Math.min(slides.length - 1, slideIdx + 1))}
          disabled={slideIdx === slides.length - 1}
          className="flex items-center gap-1 rounded-lg border border-border px-4 py-2 text-sm font-medium text-secondary disabled:opacity-40 hover:bg-muted"
        >
          Next <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}

function QuizStage({ module: mod, quizState, onSubmit, onRetry, certificateId }) {
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);

  const questions = mod.quiz_questions || [];

  if (quizState) {
    return (
      <div className="p-6 lg:p-10">
        <div className="mx-auto max-w-md text-center">
          {quizState.passed ? (
            <>
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                <Award className="text-green-600" size={32} />
              </div>
              <h2 className="mt-4 font-heading text-2xl font-bold text-secondary">Congratulations! 🎉</h2>
              <p className="mt-2 text-muted-foreground">You scored <span className="font-bold text-green-600">{quizState.score}%</span> ({quizState.correct}/{quizState.total} correct)</p>
              {quizState.certificateId && (
                <div className="mt-6 space-y-3">
                  <p className="text-sm font-medium text-secondary">Your certificate is ready!</p>
                  <Link to="/certificates" className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-bold text-primary-foreground hover:bg-primary/90">
                    <Award size={16} /> View My Certificate
                  </Link>
                </div>
              )}
            </>
          ) : (
            <>
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
                <X className="text-destructive" size={32} />
              </div>
              <h2 className="mt-4 font-heading text-2xl font-bold text-secondary">Not quite there yet</h2>
              <p className="mt-2 text-muted-foreground">You scored <span className="font-bold text-destructive">{quizState.score}%</span> ({quizState.correct}/{quizState.total} correct). You need 70% to pass.</p>
              <button onClick={onRetry} className="mt-6 inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-bold text-primary-foreground hover:bg-primary/90">
                <RefreshCw size={16} /> Try Again
              </button>
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8">
      <div className="flex items-center gap-2">
        <ListChecks className="text-accent" size={22} />
        <h2 className="font-heading text-xl font-bold text-secondary">{mod.title}</h2>
      </div>
      <span className="mt-1 inline-block rounded-full bg-accent/10 px-3 py-1 text-xs font-medium text-accent">AI-generated from course content</span>

      <div className="mt-6 space-y-6">
        {questions.map((q, qi) => {
          const selected = answers[qi];
          const showResult = submitted;
          return (
            <div key={qi} className="rounded-xl border border-border p-4">
              <p className="font-medium text-secondary">{qi + 1}. {q.question}</p>
              <div className="mt-3 space-y-2">
                {q.options.map((opt, oi) => {
                  const isSelected = selected === oi;
                  const isCorrect = oi === q.correct_index;
                  let cls = 'border-border bg-card hover:bg-muted/50';
                  if (showResult && isCorrect) cls = 'border-green-500 bg-green-50';
                  else if (showResult && isSelected && !isCorrect) cls = 'border-destructive bg-destructive/5';
                  else if (isSelected) cls = 'border-accent bg-accent/5';
                  return (
                    <button
                      key={oi}
                      onClick={() => !submitted && setAnswers({ ...answers, [qi]: oi })}
                      className={`flex w-full items-center gap-3 rounded-lg border p-3 text-left text-sm transition-colors ${cls}`}
                    >
                      <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-xs font-bold ${isSelected ? 'border-accent bg-accent text-white' : 'border-border'}`}>
                        {String.fromCharCode(65 + oi)}
                      </span>
                      <span className="flex-1">{opt}</span>
                      {showResult && isCorrect && <Check size={16} className="text-green-600" />}
                      {showResult && isSelected && !isCorrect && <X size={16} className="text-destructive" />}
                    </button>
                  );
                })}
              </div>
              {showResult && selected !== q.correct_index && q.explanation && (
                <p className="mt-2 text-xs text-muted-foreground">💡 {q.explanation}</p>
              )}
            </div>
          );
        })}
      </div>

      {!submitted ? (
        <button
          onClick={() => {
            if (Object.keys(answers).length < questions.length) return;
            setSubmitted(true);
            setTimeout(() => onSubmit(answers), 600);
          }}
          disabled={Object.keys(answers).length < questions.length}
          className="mt-6 w-full rounded-lg bg-primary py-3 text-sm font-bold text-primary-foreground disabled:opacity-50 hover:bg-primary/90"
        >
          Submit Quiz
        </button>
      ) : (
        <p className="mt-6 text-center text-sm text-muted-foreground">Calculating your score...</p>
      )}
    </div>
  );
}
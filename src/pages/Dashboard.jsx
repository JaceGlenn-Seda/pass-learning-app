import React, { useState, useEffect } from 'react';
import { Link, useOutletContext } from 'react-router-dom';
import { BookOpen, Award, Clock, TrendingUp, Sparkles, ArrowRight, Coins } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import CourseCard from '@/components/CourseCard';

export default function Dashboard() {
  const { user, refreshUser } = useOutletContext() || {};
  const [enrollments, setEnrollments] = useState([]);
  const [certificates, setCertificates] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    Promise.all([
      base44.entities.Enrollment.filter({}, '-updated_date', 50),
      base44.entities.Certificate.filter({}, '-created_date', 50),
      base44.entities.Course.filter({ is_published: true }, 'order', 8),
    ]).then(async ([e, c, co]) => {
      setEnrollments(e);
      setCertificates(c);
      setCourses(co);

      // New user: grant 3 welcome credits and unlock first course
      if (!user.credit_balance && co.length > 0) {
        await base44.auth.updateMe({ credit_balance: 3 });
        const firstCourse = co[0];
        const alreadyEnrolled = e.some(en => en.course_id === firstCourse.id);
        if (!alreadyEnrolled) {
          const enrollment = await base44.entities.Enrollment.create({
            course_id: firstCourse.id,
            course_title: firstCourse.title,
            course_thumbnail: firstCourse.thumbnail,
            unlocked: true,
            progress: 0,
            completed_module_ids: [],
            status: 'in_progress',
          });
          setEnrollments([enrollment]);
        }
        refreshUser?.();
      }
    }).finally(() => setLoading(false));
  }, [user]);

  const inProgress = enrollments.filter(e => e.status === 'in_progress');
  const completed = enrollments.filter(e => e.status === 'completed');
  const totalHours = enrollments.reduce((sum, e) => sum + (e.learning_hours || 0), 0);
  const scores = enrollments.filter(e => e.quiz_score != null).map(e => e.quiz_score);
  const avgScore = scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;
  const balance = user?.credit_balance || 0;

  // AI recommendation
  const recommendation = (() => {
    const completedTitles = new Set(completed.map(e => e.course_title));
    const notStarted = courses.filter(c => !enrollments.some(e => e.course_id === c.id));
    if (completed.length > 0 && notStarted.length > 0) {
      const lowest = completed.sort((a, b) => (a.quiz_score || 0) - (b.quiz_score || 0))[0];
      return { course: notStarted[0], reason: `Since you scored ${lowest.quiz_score}% in ${lowest.course_title}, we recommend strengthening adjacent skills.` };
    }
    if (notStarted.length > 0) return { course: notStarted[0], reason: 'A great place to start your soft-skills journey.' };
    return null;
  })();

  const handleUnlock = (course) => {
    window.location.href = `/catalogue`;
  };

  if (loading) {
    return <div className="flex h-64 items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-4 border-muted border-t-primary" /></div>;
  }

  const stats = [
    { label: 'In Progress', value: inProgress.length, icon: BookOpen, color: 'text-accent', bg: 'bg-accent/10' },
    { label: 'Completed', value: completed.length, icon: Award, color: 'text-green-600', bg: 'bg-green-50' },
    { label: 'Learning Hours', value: totalHours, icon: Clock, color: 'text-gold', bg: 'bg-gold/10' },
    { label: 'Avg. Quiz Score', value: avgScore + '%', icon: TrendingUp, color: 'text-primary', bg: 'bg-primary/10' },
  ];

  return (
    <div className="mx-auto max-w-6xl space-y-8 animate-fade-in">
      <div>
        <p className="text-sm text-muted-foreground">Welcome back,</p>
        <h1 className="font-heading text-2xl font-bold text-secondary lg:text-3xl">{user?.full_name || 'Learner'} 👋</h1>
      </div>

      {/* AI Recommendation banner */}
      {recommendation && (
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary to-secondary p-6 shadow-lift">
          <div className="absolute right-0 top-0 h-32 w-32 rounded-full bg-gold/20 blur-2xl" />
          <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gold/20"><Sparkles className="text-gold" size={20} /></div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-gold">AI Recommendation</p>
                <h3 className="mt-1 font-heading text-lg font-bold text-white">{recommendation.course.title}</h3>
                <p className="mt-1 max-w-md text-sm text-white/70">{recommendation.reason}</p>
              </div>
            </div>
            <Link to={`/catalogue`} className="shrink-0 rounded-lg bg-white px-5 py-2.5 text-sm font-bold text-secondary hover:bg-white/90">
              Explore Course
            </Link>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map(s => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="rounded-2xl border border-border bg-card p-5 shadow-card">
              <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${s.bg}`}><Icon className={s.color} size={20} /></div>
              <p className="mt-3 font-heading text-2xl font-bold text-secondary">{s.value}</p>
              <p className="text-xs text-muted-foreground">{s.label}</p>
            </div>
          );
        })}
      </div>

      {/* In progress */}
      {inProgress.length > 0 && (
        <div>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-heading text-xl font-bold text-secondary">Continue Learning</h2>
            <Link to="/my-courses" className="text-sm font-semibold text-accent hover:underline">View all</Link>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {inProgress.slice(0, 3).map(en => {
              const course = courses.find(c => c.id === en.course_id);
              if (!course) return null;
              return <CourseCard key={en.id} course={course} enrollment={en} />;
            })}
          </div>
        </div>
      )}

      {/* Empty state */}
      {enrollments.length === 0 && (
        <div className="rounded-2xl border border-dashed border-border bg-card p-10 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary/10"><BookOpen className="text-primary" size={26} /></div>
          <h3 className="mt-4 font-heading text-lg font-bold text-secondary">Start your learning journey</h3>
          <p className="mx-auto mt-1 max-w-sm text-sm text-muted-foreground">Browse our catalogue and unlock your first course with a credit.</p>
          <Link to="/catalogue" className="mt-5 inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground hover:bg-primary/90">
            Browse Courses <ArrowRight size={15} />
          </Link>
        </div>
      )}

      {/* Recently completed */}
      {completed.length > 0 && (
        <div>
          <h2 className="mb-4 font-heading text-xl font-bold text-secondary">Completed Courses</h2>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {completed.slice(0, 3).map(en => {
              const course = courses.find(c => c.id === en.course_id);
              if (!course) return null;
              return <CourseCard key={en.id} course={course} enrollment={en} />;
            })}
          </div>
        </div>
      )}

      {/* Credits nudge */}
      {balance === 0 && (
        <div className="flex items-center justify-between rounded-2xl border border-gold/40 bg-gold/5 p-5">
          <div className="flex items-center gap-3">
            <Coins className="text-gold" size={24} />
            <div>
              <p className="font-semibold text-secondary">You're out of credits</p>
              <p className="text-sm text-muted-foreground">Top up to unlock your next course.</p>
            </div>
          </div>
          <Link to="/credits" className="rounded-lg bg-gold px-5 py-2.5 text-sm font-bold text-secondary hover:bg-gold/90">Buy Credits</Link>
        </div>
      )}
    </div>
  );
}
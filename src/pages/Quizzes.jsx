import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ClipboardList, Award, ArrowRight } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function Quizzes() {
  const [enrollments, setEnrollments] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      base44.entities.Enrollment.filter({}, '-updated_date', 50),
      base44.entities.Course.filter({ is_published: true }, 'order', 50),
    ]).then(([e, c]) => { setEnrollments(e); setCourses(c); }).finally(() => setLoading(false));
  }, []);

  const withScore = enrollments.filter(e => e.quiz_score != null);
  const avgScore = withScore.length ? Math.round(withScore.reduce((a, e) => a + e.quiz_score, 0) / withScore.length) : 0;

  if (loading) return <div className="flex h-64 items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-4 border-muted border-t-primary" /></div>;

  return (
    <div className="mx-auto max-w-5xl space-y-6 animate-fade-in">
      <div>
        <h1 className="font-heading text-2xl font-bold text-secondary lg:text-3xl">Quizzes & Scores</h1>
        <p className="mt-1 text-sm text-muted-foreground">AI-generated quizzes at the end of each course. Pass with 70% to earn your certificate.</p>
      </div>

      {withScore.length > 0 && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-border bg-card p-5 shadow-card">
            <p className="text-xs text-muted-foreground">Quizzes Taken</p>
            <p className="mt-1 font-heading text-2xl font-bold text-secondary">{withScore.length}</p>
          </div>
          <div className="rounded-2xl border border-border bg-card p-5 shadow-card">
            <p className="text-xs text-muted-foreground">Average Score</p>
            <p className="mt-1 font-heading text-2xl font-bold text-primary">{avgScore}%</p>
          </div>
          <div className="rounded-2xl border border-border bg-card p-5 shadow-card">
            <p className="text-xs text-muted-foreground">Passed (≥70%)</p>
            <p className="mt-1 font-heading text-2xl font-bold text-green-600">{withScore.filter(e => e.quiz_score >= 70).length}</p>
          </div>
        </div>
      )}

      <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-card">
        {withScore.length === 0 ? (
          <div className="p-12 text-center">
            <ClipboardList className="mx-auto text-muted-foreground" size={32} />
            <p className="mt-3 font-medium text-secondary">No quiz attempts yet</p>
            <p className="mt-1 text-sm text-muted-foreground">Complete a course to take its final quiz.</p>
            <Link to="/catalogue" className="mt-4 inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground hover:bg-primary/90">
              Browse Courses <ArrowRight size={15} />
            </Link>
          </div>
        ) : withScore.map(en => {
          const course = courses.find(c => c.id === en.course_id);
          const passed = en.quiz_score >= 70;
          return (
            <div key={en.id} className="flex items-center justify-between border-b border-border p-4 last:border-0">
              <div className="flex items-center gap-3">
                {course?.thumbnail && <img src={course.thumbnail} alt="" className="h-10 w-10 rounded-lg object-cover" />}
                <div>
                  <p className="text-sm font-medium text-secondary">{en.course_title}</p>
                  <p className="text-xs text-muted-foreground">{passed ? 'Passed' : 'Below passing'}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className={`font-heading text-lg font-bold ${passed ? 'text-green-600' : 'text-destructive'}`}>{en.quiz_score}%</span>
                {passed && <Link to="/certificates" className="rounded-lg border border-border p-2 text-secondary hover:bg-muted"><Award size={16} /></Link>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
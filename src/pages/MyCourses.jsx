import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Compass, ArrowRight } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import CourseCard from '@/components/CourseCard';

export default function MyCourses() {
  const [enrollments, setEnrollments] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('in_progress');

  useEffect(() => {
    Promise.all([
      base44.entities.Enrollment.filter({}, '-updated_date', 50),
      base44.entities.Course.filter({ is_published: true }, 'order', 50),
    ]).then(([e, c]) => { setEnrollments(e); setCourses(c); }).finally(() => setLoading(false));
  }, []);

  const filtered = enrollments.filter(e => tab === 'in_progress' ? e.status === 'in_progress' : e.status === 'completed');

  if (loading) return <div className="flex h-64 items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-4 border-muted border-t-primary" /></div>;

  return (
    <div className="mx-auto max-w-6xl space-y-6 animate-fade-in">
      <div>
        <h1 className="font-heading text-2xl font-bold text-secondary lg:text-3xl">My Courses</h1>
        <p className="mt-1 text-sm text-muted-foreground">Pick up where you left off.</p>
      </div>

      <div className="flex gap-2">
        {[
          { key: 'in_progress', label: 'In Progress' },
          { key: 'completed', label: 'Completed' },
        ].map(t => (
          <button key={t.key} onClick={() => setTab(t.key)} className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${tab === t.key ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-muted/70'}`}>
            {t.label} ({enrollments.filter(e => e.status === t.key).length})
          </button>
        ))}
      </div>

      {filtered.length > 0 ? (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map(en => {
            const course = courses.find(c => c.id === en.course_id);
            if (!course) return null;
            return <CourseCard key={en.id} course={course} enrollment={en} />;
          })}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-border p-12 text-center">
          <BookOpen className="mx-auto text-muted-foreground" size={32} />
          <p className="mt-3 font-medium text-secondary">{tab === 'in_progress' ? 'No courses in progress' : 'No completed courses yet'}</p>
          <Link to="/catalogue" className="mt-4 inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground hover:bg-primary/90">
            <Compass size={15} /> Browse Catalogue <ArrowRight size={15} />
          </Link>
        </div>
      )}
    </div>
  );
}
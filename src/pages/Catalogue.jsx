import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Search, Lock } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import CourseCard from '@/components/CourseCard';
import { useToast } from '@/components/ui/use-toast';
import confetti from 'canvas-confetti';

export default function Catalogue() {
  const { user, refreshUser } = useOutletContext() || {};
  const { toast } = useToast();
  const [courses, setCourses] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [unlocking, setUnlocking] = useState(null);

  useEffect(() => {
    if (!user) return;
    Promise.all([
      base44.entities.Course.filter({ is_published: true }, 'order', 50),
      base44.entities.Enrollment.filter({ created_by_id: user.id }, '-updated_date', 50),
    ]).then(([c, e]) => {
      setCourses(c);
      setEnrollments(e);
    }).finally(() => setLoading(false));
  }, []);

  const categories = ['All', ...Array.from(new Set(courses.map(c => c.category)))];
  const balance = user?.credit_balance || 0;

  const filtered = courses.filter(c => {
    const matchSearch = c.title.toLowerCase().includes(search.toLowerCase()) || (c.description || '').toLowerCase().includes(search.toLowerCase());
    const matchCat = category === 'All' || c.category === category;
    return matchSearch && matchCat;
  });

  const handleUnlock = async (course) => {
    if (balance < 1) {
      toast({ title: 'Not enough credits', description: 'You need at least 1 credit to unlock a course.', variant: 'destructive' });
      return;
    }
    setUnlocking(course.id);
    try {
      await base44.entities.CreditTransaction.create({
        type: 'spend',
        credits: 1,
        payment_method: 'grant',
        package_name: course.title,
        status: 'completed',
        reference: 'UNLOCK-' + course.id,
      });
      const newBalance = balance - 1;
      await base44.auth.updateMe({ credit_balance: newBalance });
      await base44.entities.Enrollment.create({
        course_id: course.id,
        course_title: course.title,
        course_thumbnail: course.thumbnail,
        unlocked: true,
        progress: 0,
        completed_module_ids: [],
        status: 'in_progress',
      });
      await base44.entities.Notification.create({
        title: 'Course Unlocked 🎉',
        message: `You've unlocked "${course.title}". Start learning now!`,
        type: 'milestone',
        action_url: `/course/${course.id}`,
      });
      refreshUser();
      setEnrollments(await base44.entities.Enrollment.filter({ created_by_id: user.id }, '-updated_date', 50));
      confetti({ particleCount: 90, spread: 70, origin: { y: 0.7 }, colors: ['#1B3A8C', '#2E6FE8', '#F5A623', '#E63946'] });
      toast({ title: 'Course unlocked! 🎉', description: `${course.title} is now in your learning path.` });
      base44.integrations.Core.SendEmail({
        to: user.email,
        subject: `You've unlocked ${course.title} 🚀`,
        body: `Hi ${user.full_name || 'there'},\n\nGreat news — you've just unlocked <strong>${course.title}</strong> on PASS Learning!\n\nLog in now to start your learning journey: https://pass.learning/course/${course.id}\n\nKeep growing,\nThe PASS Team`,
      }).catch(() => {});
    } catch (err) {
      toast({ title: 'Something went wrong', description: err.message, variant: 'destructive' });
    } finally {
      setUnlocking(null);
    }
  };

  if (loading) {
    return <div className="flex h-64 items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-4 border-muted border-t-primary" /></div>;
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6 animate-fade-in">
      <div>
        <h1 className="font-heading text-2xl font-bold text-secondary lg:text-3xl">Course Catalogue</h1>
        <p className="mt-1 text-sm text-muted-foreground">Unlock any course with 1 credit. You have <span className="font-semibold text-secondary">{balance}</span> credits.</p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search courses..."
            className="w-full rounded-lg border border-input bg-card py-2.5 pl-10 pr-4 text-sm outline-none focus:ring-2 focus:ring-accent/30"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-thin">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition-colors ${category === cat ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-muted/70'}`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map(course => {
          const enrollment = enrollments.find(e => e.course_id === course.id);
          return (
            <CourseCard
              key={course.id}
              course={course}
              enrollment={enrollment}
              onUnlock={handleUnlock}
              unlocking={unlocking === course.id}
            />
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="rounded-2xl border border-dashed border-border p-12 text-center text-muted-foreground">No courses match your search.</div>
      )}
    </div>
  );
}
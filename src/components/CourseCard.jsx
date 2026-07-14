import React from 'react';
import { Link } from 'react-router-dom';
import { Lock, Clock, Layers, CheckCircle2 } from 'lucide-react';
import PassLogo from './PassLogo';

export default function CourseCard({ course, enrollment, onUnlock, unlocking }) {
  const isUnlocked = enrollment?.unlocked;
  const isCompleted = enrollment?.status === 'completed';
  const progress = enrollment?.progress || 0;

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-card transition-all duration-300 hover:shadow-lift hover:-translate-y-1">
      <div className="relative h-40 overflow-hidden bg-gradient-to-br from-secondary to-primary">
        <img
          src={course.thumbnail}
          alt={course.title}
          onError={(e) => { e.currentTarget.style.display = 'none'; }}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-secondary/70 via-secondary/10 to-transparent" />
        {isCompleted && (
          <span className="absolute top-3 right-3 inline-flex items-center gap-1 rounded-full bg-green-600 px-2.5 py-1 text-xs font-semibold text-white shadow">
            <CheckCircle2 size={13} /> Completed
          </span>
        )}
        {course.level && (
          <span className="absolute top-3 left-3 rounded-full bg-white/90 px-2.5 py-1 text-xs font-semibold text-secondary">
            {course.level}
          </span>
        )}
        <div className="absolute bottom-3 left-3 right-3">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-white/80">{course.category}</span>
        </div>
      </div>

      <div className="flex flex-1 flex-col p-4">
        <h3 className="font-heading text-base font-bold text-secondary leading-snug">{course.title}</h3>
        <p className="mt-1 text-sm text-muted-foreground line-clamp-2 flex-1">{course.subtitle || course.description}</p>

        <div className="mt-3 flex items-center gap-3 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1"><Layers size={13} /> {course.module_count || 0} modules</span>
          <span className="inline-flex items-center gap-1"><Clock size={13} /> {course.duration_minutes || 0} min</span>
        </div>

        {isUnlocked ? (
          <div className="mt-4">
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
              <div className="h-full rounded-full bg-accent transition-all duration-500" style={{ width: `${progress}%` }} />
            </div>
            <Link to={`/course/${course.id}`} className="mt-3 block w-full rounded-lg bg-primary py-2.5 text-center text-sm font-semibold text-primary-foreground transition-all hover:bg-primary/90 active:scale-95">
              {progress > 0 ? 'Continue Learning' : 'Start Course'}
            </Link>
          </div>
        ) : (
          <button
            onClick={() => onUnlock && onUnlock(course)}
            disabled={unlocking}
            className="mt-4 flex w-full items-center justify-center gap-1.5 rounded-lg border border-gold/50 bg-gold/10 py-2.5 text-sm font-semibold text-secondary transition-all hover:bg-gold/20 active:scale-95 disabled:opacity-60"
          >
            <Lock size={14} /> Unlock with 1 credit
          </button>
        )}
      </div>
    </div>
  );
}
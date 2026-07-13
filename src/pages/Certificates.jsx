import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Award, Download, ArrowRight } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function Certificates() {
  const [certs, setCerts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    base44.entities.Certificate.filter({}, '-created_date', 50).then(setCerts).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex h-64 items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-4 border-muted border-t-primary" /></div>;

  return (
    <div className="mx-auto max-w-5xl space-y-6 animate-fade-in">
      <div>
        <h1 className="font-heading text-2xl font-bold text-secondary lg:text-3xl">My Certificates</h1>
        <p className="mt-1 text-sm text-muted-foreground">Earned by passing each course's final quiz with 70% or higher.</p>
      </div>

      {certs.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border p-12 text-center">
          <Award className="mx-auto text-muted-foreground" size={32} />
          <p className="mt-3 font-medium text-secondary">No certificates yet</p>
          <p className="mt-1 text-sm text-muted-foreground">Complete a course and pass the quiz to earn your first certificate.</p>
          <Link to="/catalogue" className="mt-4 inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground hover:bg-primary/90">
            Browse Courses <ArrowRight size={15} />
          </Link>
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2">
          {certs.map(cert => (
            <div key={cert.id} className="overflow-hidden rounded-2xl border-2 border-primary bg-card shadow-card">
              <div className="border-b-2 border-gold p-5">
                <div className="flex items-center justify-between">
                  <div className="font-heading text-lg font-extrabold text-secondary">●PASS</div>
                  <span className="rounded-full bg-green-100 px-2.5 py-1 text-xs font-bold text-green-700">{cert.score}%</span>
                </div>
                <p className="mt-3 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Certificate of Completion</p>
                <p className="font-display text-xl italic text-secondary">{cert.learner_name}</p>
                <p className="mt-2 text-sm font-bold text-primary">{cert.course_title}</p>
              </div>
              <div className="flex items-center justify-between p-4">
                <div>
                  <p className="font-mono text-xs font-bold text-secondary">{cert.certificate_id}</p>
                  <p className="text-[10px] text-muted-foreground">{cert.issue_date ? new Date(cert.issue_date).toLocaleDateString('en-KE', { day: 'numeric', month: 'short', year: 'numeric' }) : ''}</p>
                </div>
                <Link to={`/certificate/${cert.id}`} className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-xs font-bold text-primary-foreground hover:bg-primary/90">
                  <Download size={13} /> View & Download
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
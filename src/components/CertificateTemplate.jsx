import React from 'react';
import PassLogo from './PassLogo';

export default function CertificateTemplate({ certificate }) {
  const date = certificate.issue_date ? new Date(certificate.issue_date).toLocaleDateString('en-KE', { day: 'numeric', month: 'long', year: 'numeric' }) : '';
  return (
    <div className="relative mx-auto w-full max-w-3xl">
      {/* Outer blue border */}
      <div className="rounded-2xl border-[6px] border-primary bg-card p-3 shadow-lift">
        {/* Gold inner frame */}
        <div className="rounded-lg border-2 border-gold p-6 lg:p-10">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-border pb-4">
            <PassLogo className="text-xl" />
            <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Certificate of Completion</span>
          </div>

          {/* Body */}
          <div className="py-8 text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">This certifies that</p>
            <p className="mt-3 font-display text-3xl italic text-secondary lg:text-4xl">{certificate.learner_name}</p>
            <p className="mt-4 text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">has successfully completed</p>
            <p className="mt-3 font-heading text-xl font-bold text-primary lg:text-2xl">{certificate.course_title}</p>

            {/* Seal */}
            <div className="mt-6 flex justify-center">
              <div className="relative flex h-20 w-20 items-center justify-center rounded-full border-2 border-gold bg-gold/10">
                <div className="absolute inset-1 rounded-full border border-gold/40" />
                <div className="text-center">
                  <p className="font-heading text-lg font-bold text-gold leading-none">{certificate.score}%</p>
                  <p className="text-[8px] uppercase text-muted-foreground">Score</p>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-end justify-between border-t border-border pt-4">
            <div className="text-left">
              <p className="font-display text-sm italic text-secondary">Parikshit Trivedi</p>
              <p className="text-[10px] text-muted-foreground">CEO, PASS</p>
              <div className="mt-1 h-px w-32 bg-border" />
              <p className="mt-1 text-[10px] uppercase tracking-wider text-muted-foreground">Signature</p>
            </div>
            <div className="text-center">
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Date Issued</p>
              <p className="text-sm font-medium text-secondary">{date}</p>
            </div>
            <div className="text-right">
              <p className="font-mono text-sm font-bold text-secondary">{certificate.certificate_id}</p>
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Certificate ID</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
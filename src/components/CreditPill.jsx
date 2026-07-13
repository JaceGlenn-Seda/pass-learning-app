import React from 'react';

export default function CreditPill({ balance }) {
  return (
    <div className="inline-flex items-center gap-1.5 rounded-full bg-gold/15 border border-gold/40 px-3 py-1.5 text-sm font-semibold text-secondary">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="9" fill="#F5A623" />
        <text x="12" y="16" textAnchor="middle" fontSize="11" fontWeight="700" fill="#0E1F4D">P</text>
      </svg>
      <span>{balance ?? 0}</span>
      <span className="text-muted-foreground font-normal text-xs">credits</span>
    </div>
  );
}
import React from 'react';

export default function PassLogo({ className = '', showDot = true, light = false }) {
  return (
    <div className={`flex items-center gap-0 font-heading font-extrabold tracking-tight ${className}`}>
      {showDot && <span className="text-destructive text-[0.9em] mr-[1px]">●</span>}
      <span className={light ? 'text-white' : 'text-secondary'}>PASS</span>
    </div>
  );
}
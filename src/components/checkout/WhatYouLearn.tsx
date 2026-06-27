"use client";

interface WhatYouLearnProps {
  items: string[];
}

export function WhatYouLearn({ items }: WhatYouLearnProps) {
  if (!items.length) return null;

  return (
    <div className="glass rounded-2xl p-6">
      <h3 className="text-lg font-bold text-white mb-4">What You&apos;ll Learn</h3>
      <div className="grid sm:grid-cols-2 gap-3">
        {items.map((item, i) => (
          <div key={i} className="flex items-start gap-3 text-sm text-white/80">
            <span className="text-gold shrink-0 mt-0.5">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </span>
            {item}
          </div>
        ))}
      </div>
    </div>
  );
}

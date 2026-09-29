import React from 'react';

export default function SkeletonLoader({ count = 8 }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {Array.from({ length: count }).map((_, idx) => (
        <div key={idx} className="glass-card p-3 rounded-2xl flex flex-col gap-3">
          <div className="w-full aspect-[4/3] skeleton rounded-xl" />
          <div className="h-4 w-3/4 skeleton rounded" />
          <div className="h-3 w-1/2 skeleton rounded" />
          <div className="flex items-center justify-between pt-2 border-t border-[var(--border-color)]">
            <div className="h-5 w-20 skeleton rounded" />
            <div className="h-8 w-8 skeleton rounded-full" />
          </div>
        </div>
      ))}
    </div>
  );
}

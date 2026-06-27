"use client";

import { Accordion } from "@/components/ui/Accordion";
import type { CourseModule } from "@/types/database";

interface CurriculumPreviewProps {
  modules: CourseModule[];
}

export function CurriculumPreview({ modules }: CurriculumPreviewProps) {
  if (!modules.length) return null;

  const items = modules.map((mod) => ({
    title: mod.title,
    subtitle: `${mod.lessons.length} lessons`,
    content: (
      <div className="space-y-2">
        {mod.lessons.map((lesson, i) => (
          <div key={i} className="flex items-center justify-between py-1.5">
            <div className="flex items-center gap-2 text-sm">
              {lesson.is_locked ? (
                <svg className="w-4 h-4 text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              ) : lesson.is_preview ? (
                <span className="text-gold text-xs font-medium px-1.5 py-0.5 rounded bg-gold/10">FREE</span>
              ) : (
                <svg className="w-4 h-4 text-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              )}
              <span className={lesson.is_locked ? "text-muted" : "text-white/80"}>{lesson.title}</span>
            </div>
            <span className="text-xs text-muted">{lesson.duration}</span>
          </div>
        ))}
      </div>
    ),
  }));

  return (
    <div className="glass rounded-2xl p-6">
      <h3 className="text-lg font-bold text-white mb-4">Course Curriculum</h3>
      <Accordion items={items} allowMultiple />
    </div>
  );
}

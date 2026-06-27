"use client";

import type { Course } from "@/types/database";
import { formatCurrency } from "@/lib/utils";

interface CourseHeroSectionProps {
  course: Course;
}

export function CourseHeroSection({ course }: CourseHeroSectionProps) {
  return (
    <div className="glass rounded-2xl overflow-hidden">
      {course.thumbnail_url && (
        <div className="relative aspect-video bg-surface overflow-hidden">
          <img
            src={course.thumbnail_url}
            alt={course.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
        </div>
      )}
      <div className="p-6 space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <span className="text-xs uppercase tracking-wider text-gold font-medium">{course.category || course.stack_id}</span>
            <h1 className="text-2xl font-bold text-white mt-1">{course.title}</h1>
            {course.subtitle && (
              <p className="text-muted mt-1">{course.subtitle}</p>
            )}
          </div>
          {course.icon && <span className="text-3xl">{course.icon}</span>}
        </div>

        {course.short_description && (
          <p className="text-sm text-muted leading-relaxed">{course.short_description}</p>
        )}

        <div className="flex flex-wrap gap-3 text-xs text-muted">
          {course.duration && (
            <span className="glass rounded-lg px-3 py-1.5 flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5 text-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {course.duration}
            </span>
          )}
          {course.skill_level && (
            <span className="glass rounded-lg px-3 py-1.5 flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5 text-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              {course.skill_level}
            </span>
          )}
          <span className="glass rounded-lg px-3 py-1.5 flex items-center gap-1.5">
            <svg className="w-3.5 h-3.5 text-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {course.language}
          </span>
        </div>

        <div className="flex items-center gap-4 text-xs text-muted pt-2 border-t border-white/5">
          {course.average_rating > 0 && (
            <span className="flex items-center gap-1">
              <span className="text-gold">★</span>
              {course.average_rating.toFixed(1)}
              <span>({course.total_reviews} reviews)</span>
            </span>
          )}
          <span>{course.students_enrolled.toLocaleString()} students</span>
          {course.last_updated && <span>Updated {new Date(course.last_updated).toLocaleDateString()}</span>}
        </div>
      </div>
    </div>
  );
}

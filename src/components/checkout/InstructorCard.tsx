"use client";

import type { Course } from "@/types/database";

interface InstructorCardProps {
  course: Course;
}

export function InstructorCard({ course }: InstructorCardProps) {
  if (!course.instructor_name) return null;

  return (
    <div className="glass rounded-2xl p-6">
      <h3 className="text-sm font-semibold text-white/60 uppercase tracking-wider mb-4">Instructor</h3>
      <div className="flex items-start gap-4">
        {course.instructor_avatar ? (
          <img
            src={course.instructor_avatar}
            alt={course.instructor_name}
            className="w-16 h-16 rounded-xl object-cover"
          />
        ) : (
          <div className="w-16 h-16 rounded-xl bg-gold/20 flex items-center justify-center text-gold text-2xl font-bold">
            {course.instructor_name.charAt(0)}
          </div>
        )}
        <div className="space-y-1">
          <h4 className="text-white font-semibold">{course.instructor_name}</h4>
          {course.instructor_title && (
            <p className="text-muted text-sm">{course.instructor_title}</p>
          )}
          {course.instructor_bio && (
            <p className="text-muted text-xs leading-relaxed mt-2">{course.instructor_bio}</p>
          )}
          <div className="flex flex-wrap gap-3 text-xs text-muted pt-2">
            {course.instructor_experience > 0 && (
              <span>{course.instructor_experience}+ years</span>
            )}
            {course.instructor_students && (
              <span>{course.instructor_students} students</span>
            )}
            {course.instructor_courses > 0 && (
              <span>{course.instructor_courses} courses</span>
            )}
            {course.instructor_rating > 0 && (
              <span className="text-gold">★ {course.instructor_rating.toFixed(1)}</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";

interface CourseIncludesProps {
  items: string[];
}

const includeIcons: Record<string, string> = {
  "Lifetime access": "∞",
  Certificate: "🏆",
  "Source code": "📁",
  Assignments: "📝",
  "Real-world projects": "🚀",
  "Coding exercises": "💻",
  "Downloadable resources": "📥",
  "Community access": "👥",
  "Discord access": "💬",
  "Future updates": "🔄",
  "Mobile learning": "📱",
  Quizzes: "📊",
};

export function CourseIncludes({ items }: CourseIncludesProps) {
  if (!items.length) return null;

  return (
    <div className="glass rounded-2xl p-6">
      <h3 className="text-lg font-bold text-white mb-4">What&apos;s Included</h3>
      <div className="grid sm:grid-cols-2 gap-3">
        {items.map((item, i) => (
          <div key={i} className="flex items-center gap-3 text-sm text-white/70">
            <span className="w-8 h-8 rounded-lg bg-gold/10 flex items-center justify-center text-sm shrink-0">
              {includeIcons[item] || "✓"}
            </span>
            {item}
          </div>
        ))}
      </div>
    </div>
  );
}

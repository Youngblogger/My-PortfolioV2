"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { PageLoader } from "@/components/ui/LoadingSpinner";
import { formatDate } from "@/lib/utils";
import { api } from "@/lib/api";
import type { EnrollmentData, CourseData, ProfileData } from "@/lib/api";

export default function DashboardPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [enrollments, setEnrollments] = useState<EnrollmentData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function load() {
      try {
        const token = api.getToken();
        if (!token) {
          router.push("/auth/login?redirect=/academy/dashboard");
          return;
        }

        const data = await api.getDashboard();
        if (!mounted) return;
        setProfile(data.profile);
        setEnrollments(data.enrollments || []);
      } catch {
        router.push("/auth/login?redirect=/academy/dashboard");
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => { mounted = false; };
  }, [router]);

  if (loading) return <PageLoader />;

  return (
    <div className="min-h-screen py-20 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white">
              Welcome back{profile?.full_name ? `, ${profile.full_name.split(" ")[0]}` : ""} <span aria-hidden="true">👋</span>
            </h1>
            <p className="text-muted mt-1">Your learning journey continues here.</p>
          </div>
          <Link href="/academy">
            <Button variant="secondary">Browse Courses</Button>
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Enrolled Courses", value: enrollments.length.toString() },
            { label: "In Progress", value: enrollments.filter((e) => e.status === "active" && e.progress < 100).length.toString() },
            { label: "Completed", value: enrollments.filter((e) => e.status === "completed" || e.progress >= 100).length.toString() },
            { label: "Certificates", value: enrollments.filter((e) => e.certificate_url != null).length.toString() },
          ].map((stat) => (
            <div key={stat.label} className="glass rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-gold">{stat.value}</div>
              <div className="text-xs text-muted mt-1">{stat.label}</div>
            </div>
          ))}
        </div>

        <h2 className="text-xl font-bold text-white mb-4">My Courses</h2>

        {enrollments.length === 0 ? (
          <div className="glass rounded-2xl p-12 text-center">
            <div className="text-4xl mb-4" aria-hidden="true">📚</div>
            <h3 className="text-lg font-bold text-white mb-2">No Enrollments Yet</h3>
            <p className="text-muted text-sm mb-6">Start your learning journey by enrolling in a course.</p>
            <Link href="/academy">
              <Button>Browse Courses</Button>
            </Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {enrollments.map((enrollment) => (
              <motion.div
                key={enrollment.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass rounded-2xl p-5 hover:border-gold/20 transition-all duration-300"
              >
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-white font-semibold text-sm">
                    {enrollment.course?.title || "Course"}
                  </h3>
                  <Badge variant={enrollment.status === "active" ? "success" : "info"}>
                    {enrollment.status}
                  </Badge>
                </div>

                <div className="mb-3">
                  <div className="flex justify-between text-xs text-muted mb-1">
                    <span>Progress</span>
                    <span>{enrollment.progress}%</span>
                  </div>
                  <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gold rounded-full transition-all duration-500"
                      style={{ width: `${enrollment.progress}%` }}
                    />
                  </div>
                </div>

                <div className="text-xs text-muted mb-4">
                  Enrolled {formatDate(enrollment.created_at)}
                </div>

                <div className="flex gap-2">
                  <Link href={`/academy/${enrollment.course?.stack_id || enrollment.course_id}`} className="flex-1">
                    <Button variant="primary" size="sm" fullWidth>Continue</Button>
                  </Link>
                  <Link href={`/academy/enrollment/${enrollment.id}`}>
                    <Button variant="ghost" size="sm">Details</Button>
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {profile && (
          <div className="mt-12 glass rounded-2xl p-6">
            <h2 className="text-lg font-bold text-white mb-4">Account Settings</h2>
            <div className="grid sm:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted">Name:</span>
                <span className="text-white ml-2">{profile.full_name || "Not set"}</span>
              </div>
              <div>
                <span className="text-muted">Email:</span>
                <span className="text-white ml-2">{profile.email}</span>
              </div>
              <div>
                <span className="text-muted">Phone:</span>
                <span className="text-white ml-2">{profile.phone || "Not set"}</span>
              </div>
              <div>
                <span className="text-muted">Country:</span>
                <span className="text-white ml-2">{profile.country || "Not set"}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

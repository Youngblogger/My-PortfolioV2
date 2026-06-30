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
import type { EnrollmentData, CourseData, ProfileData, ServiceOrderListItem } from "@/lib/api";

export default function DashboardPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [enrollments, setEnrollments] = useState<EnrollmentData[]>([]);
  const [serviceOrders, setServiceOrders] = useState<ServiceOrderListItem[]>([]);
  const [activeTab, setActiveTab] = useState<"courses" | "projects">("courses");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function load() {
      try {
        const [dashData, ordersData] = await Promise.all([
          api.getDashboard(),
          api.getServiceOrders().catch(() => ({ data: [] })),
        ]);
        if (!mounted) return;
        setProfile(dashData.profile);
        setEnrollments(dashData.enrollments || []);
        setServiceOrders(ordersData.data || []);
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
          <div className="flex gap-3">
            <Link href="/academy">
              <Button variant="secondary">Browse Courses</Button>
            </Link>
            <Link href="/hire">
              <Button variant="primary">Start a Project</Button>
            </Link>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-8 border-b border-white/10 pb-4">
          {[
            { id: "courses" as const, label: "My Courses", count: enrollments.length },
            { id: "projects" as const, label: "My Projects", count: serviceOrders.length },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`text-sm font-medium transition-colors ${
                activeTab === tab.id ? "text-gold" : "text-muted hover:text-white"
              }`}
            >
              {tab.label} ({tab.count})
            </button>
          ))}
        </div>

        {activeTab === "courses" && (
        <div>
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
        </div>
        )}

        {activeTab === "projects" && (
        <div>
        {serviceOrders.length === 0 ? (
          <div className="space-y-4">
            <div className="glass rounded-2xl p-12 text-center">
              <div className="text-4xl mb-4" aria-hidden="true">🚀</div>
              <h3 className="text-lg font-bold text-white mb-2">No Projects Yet</h3>
              <p className="text-muted text-sm mb-6">Start your first project with us.</p>
              <Link href="/hire">
                <Button>Start a Project</Button>
              </Link>
            </div>
            <Link
              href="/hire"
              className="block glass rounded-2xl p-6 hover:border-gold/20 transition-all duration-300 group"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-gold/10 flex items-center justify-center text-2xl shrink-0">
                  📞
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-white font-semibold text-sm group-hover:text-gold transition-colors">
                    Book a Service
                  </h4>
                  <p className="text-xs text-muted mt-0.5">
                    Explore our services and start building your next project.
                  </p>
                </div>
                <span className="text-gold text-lg" aria-hidden="true">→</span>
              </div>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {serviceOrders.map((order) => (
              <Link key={order.id} href={`/hire/project/${order.id}`}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="glass rounded-2xl p-5 hover:border-gold/20 transition-all duration-300 cursor-pointer"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="min-w-0 flex-1">
                      <h3 className="text-white font-semibold truncate">
                        {order.project_name || order.project}
                      </h3>
                      <p className="text-xs text-muted mt-0.5 font-mono">#{order.order_number}</p>
                      <p className="text-xs text-muted mt-0.5">
                        {order.service} — {order.project} ({order.package})
                      </p>
                    </div>
                    <Badge variant={order.status === "active" ? "success" : order.status === "pending_payment" ? "gold" : order.status === "completed" ? "success" : "info"}>
                      {order.status === "pending_payment" ? "Pending Payment" : order.status}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gold font-semibold">₦{order.total_ngn.toLocaleString()}</span>
                    <span className="text-xs text-muted">{formatDate(order.created_at)}</span>
                  </div>
                </motion.div>
              </Link>
            ))}
          </div>
        )}
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

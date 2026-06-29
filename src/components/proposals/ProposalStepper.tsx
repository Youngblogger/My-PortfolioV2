"use client";

import { motion } from "framer-motion";

interface ProposalStepperProps {
  status: string;
}

const steps = [
  { key: "draft", label: "Draft" },
  { key: "sent", label: "Sent" },
  { key: "viewed", label: "Viewed" },
  { key: "final", label: "Decision" },
];

const decisionVariants = ["approved", "rejected"];

function getStepStatus(current: string, stepKey: string): "completed" | "current" | "future" {
  const order = ["draft", "sent", "viewed"];
  if (decisionVariants.includes(current)) return "completed";

  const currentIdx = order.indexOf(current);
  const stepIdx = order.indexOf(stepKey);

  if (stepKey === "final") return "future";
  if (stepIdx < currentIdx) return "completed";
  if (stepIdx === currentIdx) return "current";
  return "future";
}

export function ProposalStepper({ status }: ProposalStepperProps) {
  const currentStatus = status.toLowerCase();

  return (
    <div className="flex items-center gap-0">
      {steps.map((step, index) => {
        const stepStatus = getStepStatus(currentStatus, step.key);
        const isCompleted = stepStatus === "completed";
        const isCurrent = stepStatus === "current";
        const decisionLabel = currentStatus === "approved" ? "Approved" : currentStatus === "rejected" ? "Rejected" : "Approved / Rejected";

        return (
          <div key={step.key} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center">
              <motion.div
                animate={
                  isCurrent
                    ? { scale: [1, 1.15, 1], boxShadow: ["0 0 0px rgba(212,175,55,0)", "0 0 20px rgba(212,175,55,0.4)", "0 0 0px rgba(212,175,55,0)"] }
                    : {}
                }
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                className={`
                  w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold border-2
                  transition-all duration-300
                  ${isCompleted ? "bg-green-500/20 border-green-400 text-green-400" : ""}
                  ${isCurrent ? "bg-gold/20 border-gold text-gold" : ""}
                  ${stepStatus === "future" ? "bg-white/5 border-white/10 text-muted" : ""}
                `}
              >
                {isCompleted ? (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  index + 1
                )}
              </motion.div>
              <span
                className={`
                  text-[10px] mt-1.5 whitespace-nowrap font-medium transition-colors
                  ${isCompleted ? "text-green-400" : ""}
                  ${isCurrent ? "text-gold" : ""}
                  ${stepStatus === "future" ? "text-muted" : ""}
                `}
              >
                {step.key === "final" ? decisionLabel : step.label}
              </span>
            </div>

            {index < steps.length - 1 && (
              <div className="flex-1 h-px mx-2 relative top-[-10px]">
                <div
                  className={`h-full transition-all duration-500 ${
                    isCompleted || (step.key === "viewed" && decisionVariants.includes(currentStatus))
                      ? "bg-green-400/50"
                      : "bg-white/10"
                  }`}
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

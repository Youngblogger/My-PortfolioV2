"use client";

import { useId } from "react";

interface CheckboxProps {
  label: string | React.ReactNode;
  checked: boolean;
  onChange: (checked: boolean) => void;
  error?: string;
  id?: string;
}

export function Checkbox({ label, checked, onChange, error, id }: CheckboxProps) {
  const generatedId = useId();
  const checkboxId = id || generatedId;

  return (
    <div className="space-y-1">
      <label htmlFor={checkboxId} className="flex items-start gap-3 cursor-pointer group">
        <div className="relative mt-0.5">
          <input
            type="checkbox"
            id={checkboxId}
            checked={checked}
            onChange={(e) => onChange(e.target.checked)}
            className="sr-only"
          />
          <div className={`
            w-5 h-5 rounded-md border-2 flex items-center justify-center
            transition-all duration-200
            ${checked ? "bg-[#5B4CF0] border-[#5B4CF0]" : "border-[#ECEFF5] group-hover:border-[#98A2B3]"}
          `}>
            {checked && (
              <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            )}
          </div>
        </div>
        <span className="text-sm transition-colors" style={{ color: checked ? "#101828" : "#667085" }}>
          {label}
        </span>
      </label>
      {error && <p className="text-red-400 text-xs ml-8">{error}</p>}
    </div>
  );
}
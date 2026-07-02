"use client";

import { forwardRef } from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, className = "", id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, "-");

    return (
      <div className="space-y-1.5">
        {label && (
          <label htmlFor={inputId} className="block text-sm font-medium" style={{ color: "#101828" }}>
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={`
            w-full px-4 py-3 rounded-xl
            bg-white border border-[#ECEFF5]
            text-[#101828] placeholder:text-[#98A2B3]/50
            focus:outline-none focus:border-[#5B4CF0]/50 focus:ring-1 focus:ring-[#5B4CF0]/20
            transition-all duration-300
            ${error ? "border-red-500/50 focus:border-red-500 focus:ring-red-500/20" : ""}
            ${className}
          `}
          {...props}
        />
        {error && <p className="text-red-400 text-xs mt-1">{error}</p>}
        {hint && !error && <p className="text-xs mt-1" style={{ color: "#98A2B3" }}>{hint}</p>}
      </div>
    );
  }
);

Input.displayName = "Input";

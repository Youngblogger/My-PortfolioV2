"use client";

import { createContext, useContext, useState, useCallback, type ReactNode } from "react";

interface BookingState {
  service: { id: string; slug: string; title: string } | null;
  projectType: { id: string; slug: string; title: string } | null;
  package: { id: string; slug: string; name: string; price_ngn: number; price_usd: number } | null;
  addOns: { id: string; name: string; price_ngn: number; price_usd: number }[];
  billing: Record<string, string>;
  projectName: string;
  projectDescription: string;
  preferredStartDate: string;
  referenceLinks: string[];
  paymentGateway: string;
  paymentType: "full" | "deposit";
}

interface BookingContextType {
  state: BookingState;
  setService: (s: { id: string; slug: string; title: string }) => void;
  setProjectType: (pt: { id: string; slug: string; title: string }) => void;
  setPackage: (pkg: { id: string; slug: string; name: string; price_ngn: number; price_usd: number }) => void;
  toggleAddOn: (addOn: { id: string; name: string; price_ngn: number; price_usd: number }) => void;
  setBilling: (b: Record<string, string>) => void;
  setProjectName: (n: string) => void;
  setProjectDescription: (d: string) => void;
  setPreferredStartDate: (d: string) => void;
  setReferenceLinks: (links: string[]) => void;
  setPaymentGateway: (g: string) => void;
  setPaymentType: (t: "full" | "deposit") => void;
  reset: () => void;
}

const initialState: BookingState = {
  service: null,
  projectType: null,
  package: null,
  addOns: [],
  billing: {},
  projectName: "",
  projectDescription: "",
  preferredStartDate: "",
  referenceLinks: [],
  paymentGateway: "paystack",
  paymentType: "full",
};

const BookingContext = createContext<BookingContextType | undefined>(undefined);

export function BookingProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<BookingState>(initialState);

  const setService = useCallback((s: { id: string; slug: string; title: string }) => {
    setState((prev) => ({ ...prev, service: s, projectType: null, package: null, addOns: [] }));
  }, []);

  const setProjectType = useCallback((pt: { id: string; slug: string; title: string }) => {
    setState((prev) => ({ ...prev, projectType: pt, package: null, addOns: [] }));
  }, []);

  const setPackage = useCallback((pkg: { id: string; slug: string; name: string; price_ngn: number; price_usd: number }) => {
    setState((prev) => ({ ...prev, package: pkg }));
  }, []);

  const toggleAddOn = useCallback((addOn: { id: string; name: string; price_ngn: number; price_usd: number }) => {
    setState((prev) => {
      const exists = prev.addOns.find((a) => a.id === addOn.id);
      if (exists) {
        return { ...prev, addOns: prev.addOns.filter((a) => a.id !== addOn.id) };
      }
      return { ...prev, addOns: [...prev.addOns, addOn] };
    });
  }, []);

  const setBilling = useCallback((b: Record<string, string>) => setState((prev) => ({ ...prev, billing: b })), []);
  const setProjectName = useCallback((n: string) => setState((prev) => ({ ...prev, projectName: n })), []);
  const setProjectDescription = useCallback((d: string) => setState((prev) => ({ ...prev, projectDescription: d })), []);
  const setPreferredStartDate = useCallback((d: string) => setState((prev) => ({ ...prev, preferredStartDate: d })), []);
  const setReferenceLinks = useCallback((links: string[]) => setState((prev) => ({ ...prev, referenceLinks: links })), []);
  const setPaymentGateway = useCallback((g: string) => setState((prev) => ({ ...prev, paymentGateway: g })), []);
  const setPaymentType = useCallback((t: "full" | "deposit") => setState((prev) => ({ ...prev, paymentType: t })), []);
  const reset = useCallback(() => setState(initialState), []);

  return (
    <BookingContext.Provider
      value={{
        state,
        setService,
        setProjectType,
        setPackage,
        toggleAddOn,
        setBilling,
        setProjectName,
        setProjectDescription,
        setPreferredStartDate,
        setReferenceLinks,
        setPaymentGateway,
        setPaymentType,
        reset,
      }}
    >
      {children}
    </BookingContext.Provider>
  );
}

export function useBooking() {
  const ctx = useContext(BookingContext);
  if (!ctx) throw new Error("useBooking must be used within BookingProvider");
  return ctx;
}

"use client";

import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";

interface BillingFormData {
  full_name: string;
  email: string;
  phone: string;
  country: string;
  state: string;
  city: string;
  address?: string;
  company?: string;
  tax_id?: string;
}

interface BillingFormProps {
  data: BillingFormData;
  onChange: (field: keyof BillingFormData, value: string) => void;
  errors?: Partial<Record<keyof BillingFormData, string>>;
}

const countries = [
  { value: "NG", label: "Nigeria" },
  { value: "US", label: "United States" },
  { value: "GB", label: "United Kingdom" },
  { value: "CA", label: "Canada" },
  { value: "GH", label: "Ghana" },
  { value: "KE", label: "Kenya" },
  { value: "ZA", label: "South Africa" },
  { value: "EG", label: "Egypt" },
];

export function BillingForm({ data, onChange, errors = {} }: BillingFormProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-bold text-white">Billing Information</h3>
      <div className="grid sm:grid-cols-2 gap-4">
        <Input
          label="Full Name"
          value={data.full_name}
          onChange={(e) => onChange("full_name", e.target.value)}
          error={errors.full_name}
          required
        />
        <Input
          label="Email"
          type="email"
          value={data.email}
          onChange={(e) => onChange("email", e.target.value)}
          error={errors.email}
          required
        />
        <Input
          label="Phone Number"
          type="tel"
          value={data.phone}
          onChange={(e) => onChange("phone", e.target.value)}
          error={errors.phone}
          required
        />
        <Select
          label="Country"
          value={data.country}
          onChange={(e) => onChange("country", e.target.value)}
          options={countries}
          placeholder="Select country"
          error={errors.country}
        />
        <Input
          label="State"
          value={data.state}
          onChange={(e) => onChange("state", e.target.value)}
          error={errors.state}
        />
        <Input
          label="City"
          value={data.city}
          onChange={(e) => onChange("city", e.target.value)}
          error={errors.city}
        />
      </div>
      <Input
        label="Address (Optional)"
        value={data.address || ""}
        onChange={(e) => onChange("address", e.target.value)}
      />
      <div className="grid sm:grid-cols-2 gap-4">
        <Input
          label="Company (Optional)"
          value={data.company || ""}
          onChange={(e) => onChange("company", e.target.value)}
        />
        <Input
          label="Tax ID (Optional)"
          value={data.tax_id || ""}
          onChange={(e) => onChange("tax_id", e.target.value)}
        />
      </div>
    </div>
  );
}

export type { BillingFormData };

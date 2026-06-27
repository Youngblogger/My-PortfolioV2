"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { PageLoader } from "@/components/ui/LoadingSpinner";

export default function EnrollPage() {
  const params = useParams();
  const router = useRouter();

  useEffect(() => {
    if (params.stack) {
      router.replace(`/academy/checkout/${params.stack}`);
    } else {
      router.replace("/academy");
    }
  }, [params.stack, router]);

  return <PageLoader />;
}
"use client";

import { useRouter, useSearchParams } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { StudyStatsPeriod } from "@/types";

const PERIOD_OPTIONS: { value: StudyStatsPeriod; label: string }[] = [
  { value: "week", label: "Week" },
  { value: "month", label: "Month" },
  { value: "year", label: "Year" },
  { value: "all", label: "All time" },
];

export function AnalyticsPeriodSelector({
  period,
}: {
  period: StudyStatsPeriod;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleValueChange = (value: StudyStatsPeriod) => {
    const params = new URLSearchParams(searchParams);
    params.set("period", value);
    router.push(`/dashboard/analytics?${params.toString()}`);
  };

  return (
    <Select value={period} onValueChange={handleValueChange}>
      <SelectTrigger className="w-32 bg-background">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {PERIOD_OPTIONS.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

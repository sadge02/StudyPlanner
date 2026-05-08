"use client";

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { StudyStatsPeriod, StudyTimeTrend } from "@/types";

type StudyTimeTrendChartProps = {
  data: StudyTimeTrend[];
  period: StudyStatsPeriod;
};

const PERIOD_COPY: Record<StudyStatsPeriod, string> = {
  week: "Daily study time over the last 7 days.",
  month: "Weekly study time over the last 30 days.",
  year: "Monthly study time over the last 12 months.",
  all: "Monthly study time across all tracked sessions.",
};

function formatHours(hours: number) {
  return `${hours.toLocaleString(undefined, {
    maximumFractionDigits: 1,
  })}h`;
}

export function StudyTimeTrendChart({
  data,
  period,
}: StudyTimeTrendChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Study Time Trends</CardTitle>
        <CardDescription>{PERIOD_COPY[period]}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 8, right: 12, left: 0, bottom: 8 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis
                dataKey="label"
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 12 }}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tickFormatter={formatHours}
                tick={{ fontSize: 12 }}
              />
              <Tooltip
                formatter={(value, name) => [
                  formatHours(Number(value)),
                  name === "durationHours" ? "Study time" : name,
                ]}
                contentStyle={{
                  background: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                }}
              />
              <Line
                type="monotone"
                dataKey="durationHours"
                stroke="#2563eb"
                strokeWidth={3}
                dot={{ r: 4, strokeWidth: 2 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

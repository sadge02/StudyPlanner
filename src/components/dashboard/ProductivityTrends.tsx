"use client";

const mockData = [
  { day: "M", value: 3 },
  { day: "T", value: 5 },
  { day: "W", value: 2 },
  { day: "T", value: 8 },
  { day: "F", value: 6 },
  { day: "S", value: 1 },
  { day: "S", value: 0 },
];

const max = Math.max(...mockData.map((d) => d.value));

const ProductivityTrends = () => {
  return (
    <div className="rounded-xl border bg-card p-4 flex flex-col gap-3">
      <span className="font-semibold">Productivity Trends</span>
      <div className="flex items-end gap-1 h-20">
        {mockData.map((d, i) => (
          <div key={i} className="flex flex-col items-center gap-1 flex-1">
            <div
              className="w-full rounded-sm bg-primary/20 transition-all"
              style={{
                height: d.value === 0 ? "4px" : `${(d.value / max) * 64}px`,
                backgroundColor:
                  d.value === max ? "hsl(var(--primary))" : undefined,
              }}
            />
            <span className="text-xs text-muted-foreground">{d.day}</span>
          </div>
        ))}
      </div>
      <div className="flex items-baseline gap-2">
        <span className="text-3xl font-bold">28</span>
        <span className="text-sm text-green-500 font-medium">+12%</span>
        <span className="text-xs text-muted-foreground ml-auto">
          tasks done
        </span>
      </div>
    </div>
  );
};

export default ProductivityTrends;

"use client";

import { useNextClass } from "@/hooks/useNextClass";
import { useRouter } from "next/navigation";
import { GraduationCap, MapPin, Clock } from "lucide-react";
import { Button } from "../ui/button";

const NextClassBanner = () => {
  const { event, timeRemaining } = useNextClass();
  const router = useRouter();

  if (!event) {
    return (
      <div className="rounded-xl bg-muted p-4 flex flex-col gap-1">
        <p className="text-xs text-muted-foreground uppercase font-semibold tracking-wide">
          Next Class
        </p>
        <p className="text-sm text-muted-foreground">
          No upcoming classes today
        </p>
      </div>
    );
  }

  const subjectColor = event.subject?.color ?? "#3b82f6";

  return (
    <div
      className="rounded-xl p-4 flex flex-col gap-3 text-white cursor-pointer"
      style={{ backgroundColor: subjectColor }}
      onClick={() => router.push("/dashboard/calendar")}
    >
      <div className="flex items-center gap-2">
        <GraduationCap size={14} className="opacity-80" />
        <p className="text-xs uppercase font-semibold tracking-wide opacity-80">
          Next Class
        </p>
      </div>

      <div>
        <p className="text-xl font-bold">{event.title}</p>
        {event.description && (
          <p className="text-sm opacity-80 mt-0.5">{event.description}</p>
        )}
      </div>

      <div className="flex items-center gap-4 text-sm">
        <div className="flex items-center gap-1 opacity-90">
          <Clock size={14} />
          {new Date(event.startTime).toLocaleTimeString("en-GB", {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </div>
        <div className="flex items-center gap-1 opacity-90">
          <MapPin size={14} />
          {timeRemaining}
        </div>
      </div>

      <Button
        size="sm"
        className="w-full bg-white/20 hover:bg-white/30 text-white border-none mt-1"
        onClick={(e) => {
          e.stopPropagation();
          router.push("/dashboard/calendar");
        }}
      >
        Get Directions
      </Button>
    </div>
  );
};

export default NextClassBanner;

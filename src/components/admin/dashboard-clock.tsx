"use client";

import { useEffect, useState } from "react";
import { CalendarDays, Clock3 } from "lucide-react";

function parts(date: Date) {
  const timeParts = new Intl.DateTimeFormat("en-IN", {
    timeZone: "Asia/Kolkata",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  }).formatToParts(date);
  const clock = ["hour", "minute", "second"]
    .map((type) => timeParts.find((part) => part.type === type)?.value)
    .filter(Boolean)
    .join(":");
  return {
    time: clock,
    period:
      timeParts
        .find((part) => part.type === "dayPeriod")
        ?.value.toUpperCase() ?? "",
    date: new Intl.DateTimeFormat("en-IN", {
      timeZone: "Asia/Kolkata",
      weekday: "long",
      day: "2-digit",
      month: "long",
      year: "numeric",
    }).format(date),
  };
}

export function DashboardClock() {
  const [now, setNow] = useState<{
    time: string;
    period: string;
    date: string;
  } | null>(null);
  useEffect(() => {
    const update = () => setNow(parts(new Date()));
    update();
    const timer = window.setInterval(update, 1000);
    return () => window.clearInterval(timer);
  }, []);
  return (
    <div className="dashboard-clock-open w-full text-white">
      <div className="flex flex-wrap items-center justify-between gap-x-5 gap-y-2">
        <span className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[.2em] text-cyan-100">
          <Clock3 size={13} aria-hidden="true" /> Local time
        </span>
        <span className="text-[9px] font-bold uppercase tracking-[.16em] text-emerald-200">
          IST / UTC+05:30
        </span>
      </div>
      <time
        className="mt-3 flex min-h-11 items-baseline gap-3 text-white"
        dateTime={now ? `${now.time} ${now.period}` : undefined}
      >
        <strong className="tabular text-[38px] font-bold leading-none tracking-[-.025em] sm:text-[44px]">
          {now?.time ?? "--:--:--"}
        </strong>
        <span className="text-[11px] font-bold tracking-[.18em] text-cyan-100">
          {now?.period}
        </span>
      </time>
      <span className="mt-2 flex min-h-5 items-center gap-2 text-[11px] font-medium text-blue-100">
        <CalendarDays size={13} className="text-cyan-200" aria-hidden="true" />
        {now?.date ?? "Loading local date"}
      </span>
    </div>
  );
}

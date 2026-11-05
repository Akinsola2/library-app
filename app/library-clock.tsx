"use client";

import { useEffect, useState } from "react";
import Icon from "@/app/ui-icon";

export default function LibraryClock() {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    const updateTime = () => setNow(new Date());
    updateTime();
    const intervalId = window.setInterval(updateTime, 30_000);
    return () => window.clearInterval(intervalId);
  }, []);

  const date = now
    ? new Intl.DateTimeFormat("en", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      }).format(now)
    : "Loading date…";
  const time = now
    ? new Intl.DateTimeFormat("en", {
        hour: "numeric",
        minute: "2-digit",
      }).format(now)
    : "—";

  return (
    <div className="header-clock" aria-label="Current local date and time">
      <Icon className="header-clock-icon" name="calendar" />
      <span>{date}</span>
      <span className="clock-divider" aria-hidden="true" />
      <Icon className="header-clock-icon" name="clock" />
      <time dateTime={now?.toISOString()}>{time}</time>
    </div>
  );
}

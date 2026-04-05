"use client";

/**
 * hooks/use-countdown.ts
 *
 * Live countdown to a target date.
 * Used on poll cards to show "Ends in 2h 34m".
 *
 * Usage:
 *   const { label, isExpired } = useCountdown(poll.endTime);
 */

import { useEffect, useState } from "react";

type CountdownResult = {
  label: string;    // e.g. "2h 34m" or "Ended"
  isExpired: boolean;
};

export function useCountdown(target: Date | string): CountdownResult {
  const targetDate = new Date(target);

  const calc = (): CountdownResult => {
    const diff = targetDate.getTime() - Date.now();
    if (diff <= 0) return { label: "Ended", isExpired: true };

    const totalSeconds = Math.floor(diff / 1000);
    const days    = Math.floor(totalSeconds / 86400);
    const hours   = Math.floor((totalSeconds % 86400) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    if (days > 0)   return { label: `${days}d ${hours}h`,      isExpired: false };
    if (hours > 0)  return { label: `${hours}h ${minutes}m`,   isExpired: false };
    if (minutes > 0)return { label: `${minutes}m ${seconds}s`, isExpired: false };
    return           { label: `${seconds}s`,                    isExpired: false };
  };

  const [result, setResult] = useState<CountdownResult>(calc);

  useEffect(() => {
    const interval = setInterval(() => setResult(calc()), 1000);
    return () => clearInterval(interval);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [targetDate.getTime()]);

  return result;
}
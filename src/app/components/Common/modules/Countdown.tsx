"use client";

import { useEffect, useState } from "react";
import { CountdownProps } from "../types/common.types";


export default function Countdown({ endTime, dict }: CountdownProps) {
  const [timeLeft, setTimeLeft] = useState<string>("");

  useEffect(() => {
    const calculateTimeLeft = () => {
      const endTimestamp = parseInt(endTime) * 1000;
      const now = Date.now();
      const difference = endTimestamp - now;

      if (difference <= 0) {
        setTimeLeft(dict?.countdown_ended || "ENDED");
        return;
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((difference / (1000 * 60)) % 60);
      const seconds = Math.floor((difference / 1000) % 60);

      const d = dict?.countdown_days || "d";
      const h = dict?.countdown_hours || "h";
      const m = dict?.countdown_minutes || "m";
      const s = dict?.countdown_seconds || "s";

      if (days > 0) {
        setTimeLeft(`${days}${d} ${hours}${h} ${minutes}${m}`);
      } else if (hours > 0) {
        setTimeLeft(`${hours}${h} ${minutes}${m} ${seconds}${s}`);
      } else if (minutes > 0) {
        setTimeLeft(`${minutes}${m} ${seconds}${s}`);
      } else {
        setTimeLeft(`${seconds}${s}`);
      }
    };

    calculateTimeLeft();
    const interval = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(interval);
  }, [endTime, dict]);

  return <span>{timeLeft || dict?.countdown_loading || "Loading..."}</span>;
}
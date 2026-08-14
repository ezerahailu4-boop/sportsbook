"use client";

import { useEffect, useState } from "react";
import type { NormalizedEvent } from "@/services/odds/odds-normalizer";

export function useLiveStream() {
  const [events, setEvents] = useState<NormalizedEvent[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isDemo, setIsDemo] = useState(true);

  useEffect(() => {
    let eventSource: EventSource | null = null;
    let isSubscribed = true;

    try {
      eventSource = new EventSource("/api/live/stream");

      eventSource.onopen = () => {
        if (isSubscribed) setIsConnected(true);
      };

      eventSource.onmessage = (e) => {
        if (!isSubscribed) return;
        try {
          const parsed = JSON.parse(e.data);
          if (parsed.events) {
            setEvents(parsed.events);
          }
          if (typeof parsed.demoMode === "boolean") {
            setIsDemo(parsed.demoMode);
          }
        } catch {
          // ignore non-json heartbeats
        }
      };

      eventSource.onerror = () => {
        if (isSubscribed) setIsConnected(false);
      };
    } catch (err) {
      console.error("SSE connection error:", err);
    }

    return () => {
      isSubscribed = false;
      if (eventSource) {
        eventSource.close();
      }
    };
  }, []);

  return { events, isConnected, isDemo };
}

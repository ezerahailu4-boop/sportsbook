import { getLiveEvents } from "@/services/odds/odds.service";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const encoder = new TextEncoder();

  const customStream = new ReadableStream({
    async start(controller) {
      let isClosed = false;

      req.signal.addEventListener("abort", () => {
        isClosed = true;
      });

      // Send initial data immediately
      try {
        const { events, demoMode } = await getLiveEvents();
        const initialPayload = JSON.stringify({ type: "INITIAL_STATE", events, demoMode, timestamp: Date.now() });
        controller.enqueue(encoder.encode(`data: ${initialPayload}\n\n`));
      } catch (err) {
        console.error("SSE initial fetch error:", err);
      }

      // Heartbeat & live ticker intervals
      const interval = setInterval(async () => {
        if (isClosed) {
          clearInterval(interval);
          return;
        }

        try {
          const { events, demoMode } = await getLiveEvents();
          const payload = JSON.stringify({
            type: "TICK",
            events,
            demoMode,
            timestamp: Date.now(),
          });
          controller.enqueue(encoder.encode(`data: ${payload}\n\n`));
        } catch (err) {
          if (!isClosed) {
            controller.enqueue(encoder.encode(`: heartbeat\n\n`));
          }
        }
      }, 5000);

      req.signal.addEventListener("abort", () => {
        clearInterval(interval);
      });
    },
  });

  return new Response(customStream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}

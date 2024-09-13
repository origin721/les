// server.ts
import { serve } from "https://deno.land/std@0.202.0/http/server.ts";

async function handleSSERequest(req: Request) {
  const body = new ReadableStream({
    start(controller) {
      const interval = setInterval(() => {
        const message = `data: ${JSON.stringify({ time: new Date() })}\n\n`;
        controller.enqueue(new TextEncoder().encode(message));
      }, 1000);

      req.signal.addEventListener("abort", () => {
        clearInterval(interval);
        controller.close();
      });
    },
  });

  return new Response(body, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      "Connection": "keep-alive",
    },
  });
}

serve((req) => {
  if (req.url === "/events") {
    return handleSSERequest(req);
  }
  return new Response("Hello, World!", { status: 200 });
});

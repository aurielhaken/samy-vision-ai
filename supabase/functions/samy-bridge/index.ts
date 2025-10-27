// Samy Bridge - Cloud WebSocket (Edge Function)
// Simple broadcast server to replace local Node bridge
// Sends initial idle state, echoes messages to all clients

// deno-lint-ignore no-explicit-any
const clients = new Set<WebSocket>();

export const handler = (req: Request): Response | Promise<Response> => {
  const upgrade = req.headers.get("upgrade") || "";
  if (upgrade.toLowerCase() !== "websocket") {
    return new Response("Expected WebSocket connection", { status: 400 });
  }

  const { socket, response } = Deno.upgradeWebSocket(req);

  socket.onopen = () => {
    clients.add(socket);
    try {
      socket.send(JSON.stringify({ type: "idle", emotion: "calm" }));
    } catch (_) {}
  };

  socket.onmessage = (event) => {
    try {
      const message = JSON.parse(event.data as string);
      // Broadcast to all connected clients
      const payload = JSON.stringify(message);
      for (const client of clients) {
        try {
          client.send(payload);
        } catch (_) {}
      }

      // Auto return to idle after a speak event
      if (message?.type === "speak") {
        const text: string = message.text ?? "";
        const duration = Math.max(text.length * 50, 1000);
        setTimeout(() => {
          const idle = JSON.stringify({ type: "idle" });
          for (const client of clients) {
            try {
              client.send(idle);
            } catch (_) {}
          }
        }, duration);
      }
    } catch (_err) {
      // Ignore malformed messages
    }
  };

  socket.onclose = () => {
    clients.delete(socket);
  };

  socket.onerror = () => {
    try { socket.close(); } catch (_) {}
    clients.delete(socket);
  };

  return response;
};

// Deno serve
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
serve(handler);

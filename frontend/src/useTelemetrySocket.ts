import { useEffect } from "react";
import { useTelemetryStore } from "./store/telemetryStore";
import type { Telemetry, WsMessage } from "./types/telemetry";

function websocketUrl(): string {
  const configuredUrl = import.meta.env.VITE_BACKEND_WS_URL as string | undefined;
  if (configuredUrl) {
    return configuredUrl;
  }

  const protocol = window.location.protocol === "https:" ? "wss" : "ws";
  const host = (import.meta.env.VITE_BACKEND_HOST as string | undefined) || window.location.hostname || "127.0.0.1";
  const port = (import.meta.env.VITE_BACKEND_PORT as string | undefined) || "8000";
  return `${protocol}://${host}:${port}/ws/telemetry`;
}

export function useTelemetrySocket(): void {
  const setConnected = useTelemetryStore((state) => state.setConnected);
  const setSender = useTelemetryStore((state) => state.setSender);
  const pushTelemetry = useTelemetryStore((state) => state.pushTelemetry);

  useEffect(() => {
    let socket: WebSocket | null = null;
    let reconnectTimer = 0;
    let closedByReact = false;

    const connect = () => {
      socket = new WebSocket(websocketUrl());

      const send = (message: WsMessage) => {
        if (socket?.readyState === WebSocket.OPEN) {
          socket.send(JSON.stringify(message));
        }
      };

      socket.addEventListener("open", () => {
        setConnected(true);
        setSender(send);
        send({ type: "set_parameters", payload: useTelemetryStore.getState().parameters });
      });

      socket.addEventListener("message", (event) => {
        const telemetry = JSON.parse(event.data) as Telemetry;
        pushTelemetry(telemetry);
      });

      socket.addEventListener("close", () => {
        setConnected(false);
        setSender(null);
        if (!closedByReact) {
          reconnectTimer = window.setTimeout(connect, 1200);
        }
      });

      socket.addEventListener("error", () => {
        socket?.close();
      });
    };

    connect();

    return () => {
      closedByReact = true;
      window.clearTimeout(reconnectTimer);
      socket?.close();
    };
  }, [pushTelemetry, setConnected, setSender]);
}

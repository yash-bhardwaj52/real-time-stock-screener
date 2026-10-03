"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export type ConnectionStatus =
  | "connected"
  | "reconnecting"
  | "disconnected";

export interface PriceUpdate {
  symbol: string;
  price: number;
  changePercent: number;
  changeAbsolute: number;
  volume: number;
  timestamp: number;
}

interface WebSocketMessage {
  type: "connection" | "price_update";
  message?: string;
  symbol?: string;
  price?: number;
  changePercent?: number;
  changeAbsolute?: number;
  volume?: number;
  timestamp?: number;
}

interface UseWebSocketOptions {
  url?: string;
  enabled?: boolean;
  onUpdates?: (
    updates: PriceUpdate[],
  ) => void;
}

const DEFAULT_URL =
  "ws://localhost:3001";

const MAX_RECONNECT_ATTEMPTS = 5;

const RECONNECT_DELAYS = [
  1000,
  2000,
  4000,
  8000,
  16000,
];

export function useWebSocket({
  url = DEFAULT_URL,
  enabled = true,
  onUpdates,
}: UseWebSocketOptions = {}) {
  const [status, setStatus] =
    useState<ConnectionStatus>(
      "disconnected",
    );

  const socketRef =
    useRef<WebSocket | null>(null);

  const reconnectTimerRef =
    useRef<ReturnType<
      typeof setTimeout
    > | null>(null);

  const animationFrameRef =
    useRef<number | null>(null);

  const reconnectAttemptRef =
    useRef(0);

  const pendingUpdatesRef =
    useRef<PriceUpdate[]>([]);

  const manuallyClosedRef =
    useRef(false);

  const onUpdatesRef =
    useRef(onUpdates);

  useEffect(() => {
    onUpdatesRef.current =
      onUpdates;
  }, [onUpdates]);

  const processBatchedUpdates =
    useCallback(() => {
      animationFrameRef.current =
        null;

      if (
        pendingUpdatesRef.current
          .length === 0
      ) {
        return;
      }

      const updates = [
        ...pendingUpdatesRef.current,
      ];

      pendingUpdatesRef.current = [];

      onUpdatesRef.current?.(
        updates,
      );
    }, []);

  const queueUpdate = useCallback(
    (update: PriceUpdate) => {
      pendingUpdatesRef.current.push(
        update,
      );

      if (
        animationFrameRef.current ===
        null
      ) {
        animationFrameRef.current =
          requestAnimationFrame(
            processBatchedUpdates,
          );
      }
    },
    [processBatchedUpdates],
  );

  const clearReconnectTimer =
    useCallback(() => {
      if (
        reconnectTimerRef.current !==
        null
      ) {
        clearTimeout(
          reconnectTimerRef.current,
        );

        reconnectTimerRef.current =
          null;
      }
    }, []);

  const connect = useCallback(() => {
    if (!enabled) {
      return;
    }

    clearReconnectTimer();

    if (
      socketRef.current?.readyState ===
        WebSocket.OPEN ||
      socketRef.current?.readyState ===
        WebSocket.CONNECTING
    ) {
      return;
    }

    setStatus(
      reconnectAttemptRef.current > 0
        ? "reconnecting"
        : "disconnected",
    );

    const socket = new WebSocket(url);

    socketRef.current = socket;

    socket.onopen = () => {
      reconnectAttemptRef.current = 0;

      setStatus("connected");

      console.log(
        "WebSocket connected",
      );
    };

    socket.onmessage = (event) => {
      try {
        const message =
          JSON.parse(
            event.data,
          ) as WebSocketMessage;

        if (
          message.type !==
            "price_update" ||
          !message.symbol ||
          typeof message.price !==
            "number" ||
          typeof message.changePercent !==
            "number" ||
          typeof message.changeAbsolute !==
            "number" ||
          typeof message.volume !==
            "number" ||
          typeof message.timestamp !==
            "number"
        ) {
          return;
        }

        queueUpdate({
          symbol:
            message.symbol,
          price: message.price,
          changePercent:
            message.changePercent,
          changeAbsolute:
            message.changeAbsolute,
          volume: message.volume,
          timestamp:
            message.timestamp,
        });
      } catch (error) {
        console.error(
          "Failed to parse WebSocket message:",
          error,
        );
      }
    };

    socket.onclose = () => {
      socketRef.current = null;

      if (
        manuallyClosedRef.current
      ) {
        setStatus("disconnected");
        return;
      }

      const attempt =
        reconnectAttemptRef.current;

      if (
        attempt >=
        MAX_RECONNECT_ATTEMPTS
      ) {
        setStatus("disconnected");

        console.log(
          "Maximum WebSocket reconnect attempts reached.",
        );

        return;
      }

      const delay =
        RECONNECT_DELAYS[
          attempt
        ] ?? 16000;

      reconnectAttemptRef.current =
        attempt + 1;

      setStatus("reconnecting");

      console.log(
        `WebSocket reconnecting in ${
          delay / 1000
        }s...`,
      );

      reconnectTimerRef.current =
        setTimeout(() => {
          connect();
        }, delay);
    };

    socket.onerror = (error) => {
      console.error(
        "WebSocket error:",
        error,
      );
    };
  }, [
    clearReconnectTimer,
    enabled,
    queueUpdate,
    url,
  ]);

  const disconnect =
    useCallback(() => {
      manuallyClosedRef.current =
        true;

      clearReconnectTimer();

      if (
        animationFrameRef.current !==
        null
      ) {
        cancelAnimationFrame(
          animationFrameRef.current,
        );

        animationFrameRef.current =
          null;
      }

      pendingUpdatesRef.current = [];

      if (
        socketRef.current
      ) {
        socketRef.current.close();
        socketRef.current = null;
      }

      setStatus("disconnected");
    }, [clearReconnectTimer]);

  useEffect(() => {
    if (!enabled) {
      disconnect();
      return;
    }

    manuallyClosedRef.current =
      false;

    connect();

    return () => {
      manuallyClosedRef.current =
        true;

      clearReconnectTimer();

      if (
        animationFrameRef.current !==
        null
      ) {
        cancelAnimationFrame(
          animationFrameRef.current,
        );

        animationFrameRef.current =
          null;
      }

      pendingUpdatesRef.current = [];

      socketRef.current?.close();

      socketRef.current = null;
    };
  }, [
    clearReconnectTimer,
    connect,
    disconnect,
    enabled,
  ]);

  return {
    status,
    connect,
    disconnect,
  };
}
import {
  act,
  renderHook,
} from "@testing-library/react";
import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";

import {
  useWebSocket,
  type PriceUpdate,
} from "./useWebSocket";

class MockWebSocket {
  static CONNECTING = 0;
  static OPEN = 1;
  static CLOSING = 2;
  static CLOSED = 3;

  static instances: MockWebSocket[] = [];

  readyState = MockWebSocket.CONNECTING;

  onopen:
    | (() => void)
    | null = null;

  onmessage:
    | ((event: MessageEvent) => void)
    | null = null;

  onclose:
    | (() => void)
    | null = null;

  onerror:
    | ((error: Event) => void)
    | null = null;

  close = vi.fn(() => {
    this.readyState =
      MockWebSocket.CLOSED;

    this.onclose?.();
  });

  send = vi.fn();

  constructor(
    public url: string,
  ) {
    MockWebSocket.instances.push(
      this,
    );
  }

  open() {
    this.readyState =
      MockWebSocket.OPEN;

    this.onopen?.();
  }

  receive(data: unknown) {
    this.onmessage?.(
      new MessageEvent("message", {
        data:
          typeof data === "string"
            ? data
            : JSON.stringify(data),
      }),
    );
  }

  disconnect() {
    this.readyState =
      MockWebSocket.CLOSED;

    this.onclose?.();
  }

  error() {
    this.onerror?.(
      new Event("error"),
    );
  }

  static latest() {
    return MockWebSocket.instances[
      MockWebSocket.instances.length - 1
    ];
  }
}

const createPriceUpdate = (
  overrides: Partial<PriceUpdate> = {},
): PriceUpdate => ({
  symbol: "RELIANCE",
  price: 2500,
  changePercent: 1.25,
  changeAbsolute: 30,
  volume: 150000,
  timestamp: 123456789,
  ...overrides,
});

describe(
  "useWebSocket - Task 5.5",
  () => {
    beforeEach(() => {
      vi.useFakeTimers();

      MockWebSocket.instances = [];

      vi.stubGlobal(
        "WebSocket",
        MockWebSocket,
      );

      vi.stubGlobal(
        "requestAnimationFrame",
        (callback: FrameRequestCallback) =>
          window.setTimeout(
            () =>
              callback(
                performance.now(),
              ),
            16,
          ),
      );

      vi.stubGlobal(
        "cancelAnimationFrame",
        (id: number) => {
          window.clearTimeout(id);
        },
      );
    });

    afterEach(() => {
      vi.clearAllTimers();
      vi.useRealTimers();
      vi.unstubAllGlobals();
    });

    it(
      "1. establishes a WebSocket connection",
      () => {
        const { result } =
          renderHook(() =>
            useWebSocket({
              url:
                "ws://test:3001",
            }),
          );

        expect(
          MockWebSocket.instances,
        ).toHaveLength(1);

        expect(
          MockWebSocket.latest().url,
        ).toBe(
          "ws://test:3001",
        );

        expect(
          result.current.status,
        ).toBe("disconnected");
      },
    );

    it(
      "2. changes status to connected after WebSocket opens",
      () => {
        const { result } =
          renderHook(() =>
            useWebSocket(),
          );

        act(() => {
          MockWebSocket.latest().open();
        });

        expect(
          result.current.status,
        ).toBe("connected");
      },
    );

    it(
      "3. tears down the WebSocket connection",
      () => {
        const { result } =
          renderHook(() =>
            useWebSocket(),
          );

        const socket =
          MockWebSocket.latest();

        act(() => {
          socket.open();
          result.current.disconnect();
        });

        expect(
          socket.close,
        ).toHaveBeenCalledTimes(1);

        expect(
          result.current.status,
        ).toBe("disconnected");
      },
    );

    it(
      "4. reconnects after an unexpected disconnection",
      () => {
        renderHook(() =>
          useWebSocket(),
        );

        const firstSocket =
          MockWebSocket.latest();

        act(() => {
          firstSocket.open();
        });

        act(() => {
          firstSocket.disconnect();
        });

        expect(
          MockWebSocket.instances,
        ).toHaveLength(1);

        expect(
          firstSocket.readyState,
        ).toBe(
          MockWebSocket.CLOSED,
        );

        act(() => {
          vi.advanceTimersByTime(
            999,
          );
        });

        expect(
          MockWebSocket.instances,
        ).toHaveLength(1);

        act(() => {
          vi.advanceTimersByTime(
            1,
          );
        });

        expect(
          MockWebSocket.instances,
        ).toHaveLength(2);
      },
    );

    it(
      "5. uses exponential backoff for reconnect attempts",
      () => {
        const { result } =
          renderHook(() =>
            useWebSocket(),
          );

        const first =
          MockWebSocket.latest();

        act(() => {
          first.disconnect();
        });

        expect(
          result.current.status,
        ).toBe("reconnecting");

        act(() => {
          vi.advanceTimersByTime(
            1000,
          );
        });

        expect(
          MockWebSocket.instances,
        ).toHaveLength(2);

        const second =
          MockWebSocket.latest();

        act(() => {
          second.disconnect();
        });

        act(() => {
          vi.advanceTimersByTime(
            1999,
          );
        });

        expect(
          MockWebSocket.instances,
        ).toHaveLength(2);

        act(() => {
          vi.advanceTimersByTime(
            1,
          );
        });

        expect(
          MockWebSocket.instances,
        ).toHaveLength(3);
      },
    );

    it(
      "6. processes multiple price updates in one animation frame",
      () => {
        const updates: PriceUpdate[] =
          [];

        renderHook(() =>
          useWebSocket({
            onUpdates: (
              received,
            ) => {
              updates.push(
                ...received,
              );
            },
          }),
        );

        const socket =
          MockWebSocket.latest();

        act(() => {
          socket.receive({
            type: "price_update",
            ...createPriceUpdate({
              symbol: "RELIANCE",
              price: 2500,
            }),
          });

          socket.receive({
            type: "price_update",
            ...createPriceUpdate({
              symbol: "TCS",
              price: 3500,
            }),
          });
        });

        expect(updates).toHaveLength(0);

        act(() => {
          vi.advanceTimersByTime(
            16,
          );
        });

        expect(updates).toHaveLength(2);

        expect(
          updates[0].symbol,
        ).toBe("RELIANCE");

        expect(
          updates[1].symbol,
        ).toBe("TCS");
      },
    );

    it(
      "7. ignores invalid WebSocket messages",
      () => {
        const onUpdates =
          vi.fn();

        renderHook(() =>
          useWebSocket({
            onUpdates,
          }),
        );

        const socket =
          MockWebSocket.latest();

        act(() => {
          socket.receive({
            type: "price_update",
            symbol: "RELIANCE",
            price: "invalid",
          });
        });

        act(() => {
          vi.advanceTimersByTime(
            16,
          );
        });

        expect(
          onUpdates,
        ).not.toHaveBeenCalled();
      },
    );

    it(
      "8. ignores non-price WebSocket messages",
      () => {
        const onUpdates =
          vi.fn();

        renderHook(() =>
          useWebSocket({
            onUpdates,
          }),
        );

        const socket =
          MockWebSocket.latest();

        act(() => {
          socket.receive({
            type: "connection",
            message:
              "Connected successfully",
          });
        });

        act(() => {
          vi.advanceTimersByTime(
            16,
          );
        });

        expect(
          onUpdates,
        ).not.toHaveBeenCalled();
      },
    );

    it(
      "9. handles malformed JSON without crashing",
      () => {
        const onUpdates =
          vi.fn();

        renderHook(() =>
          useWebSocket({
            onUpdates,
          }),
        );

        const socket =
          MockWebSocket.latest();

        const consoleSpy =
          vi
            .spyOn(
              console,
              "error",
            )
            .mockImplementation(
              () => {},
            );

        act(() => {
          socket.receive(
            "{invalid-json}",
          );
        });

        expect(
          consoleSpy,
        ).toHaveBeenCalled();

        expect(
          onUpdates,
        ).not.toHaveBeenCalled();

        consoleSpy.mockRestore();
      },
    );

    it(
      "10. disconnects and prevents further reconnects",
      () => {
        const { result } =
          renderHook(() =>
            useWebSocket(),
          );

          MockWebSocket.latest();

        act(() => {
          result.current.disconnect();
        });

        const countBefore =
          MockWebSocket.instances
            .length;

        act(() => {
          vi.advanceTimersByTime(
            20000,
          );
        });

        expect(
          MockWebSocket.instances,
        ).toHaveLength(
          countBefore,
        );

        expect(
          result.current.status,
        ).toBe("disconnected");
      },
    );

    it(
      "11. disables the connection when enabled becomes false",
      () => {
        const {
          result,
          rerender,
        } = renderHook(
          ({ enabled }) =>
            useWebSocket({
              enabled,
            }),
          {
            initialProps: {
              enabled: true,
            },
          },
        );

        const socket =
          MockWebSocket.latest();

        act(() => {
          socket.open();
        });

        expect(
          result.current.status,
        ).toBe("connected");

        act(() => {
          rerender({
            enabled: false,
          });
        });

        expect(
          socket.close,
        ).toHaveBeenCalled();

        expect(
          result.current.status,
        ).toBe("disconnected");
      },
    );

    it(
      "12. reconnects when enabled is restored",
      () => {
        const {
          result,
          rerender,
        } = renderHook(
          ({ enabled }) =>
            useWebSocket({
              enabled,
            }),
          {
            initialProps: {
              enabled: false,
            },
          },
        );

        expect(
          MockWebSocket.instances,
        ).toHaveLength(0);

        act(() => {
          rerender({
            enabled: true,
          });
        });

        expect(
          MockWebSocket.instances,
        ).toHaveLength(1);

        expect(
          result.current.status,
        ).toBe("disconnected");
      },
    );
  },
);
import { WebSocketServer, WebSocket } from "ws";

import {
  createPriceUpdate,
  simulateSectorMovement,
} from "./priceSimulator";

import { generateMockStocks } from "../src/lib/mockDataGenerator";

import type { Stock } from "../src/types/stock";

const PORT = 3001;

// Generate the initial stock universe.
const stocks: Stock[] = generateMockStocks(5000);

// Keep the latest state of every stock in memory.
const stockState = new Map<string, Stock>(
  stocks.map((stock) => [
    stock.symbol,
    { ...stock },
  ]),
);

// Track all connected WebSocket clients.
const clients = new Set<WebSocket>();

// Create the WebSocket server.
const server = new WebSocketServer({
  port: PORT,
});

console.log(
  `WebSocket server running on ws://localhost:${PORT}`,
);

// Handle a new client connection.
server.on("connection", (socket) => {
  clients.add(socket);

  console.log(
    `Client connected. Active clients: ${clients.size}`,
  );

  // Send a connection confirmation.
  socket.send(
    JSON.stringify({
      type: "connection",
      message:
        "Connected to Real-Time Stock Screener WebSocket",
      timestamp: Date.now(),
    }),
  );

  // Remove disconnected clients.
  socket.on("close", () => {
    clients.delete(socket);

    console.log(
      `Client disconnected. Active clients: ${clients.size}`,
    );
  });

  // Handle client errors.
  socket.on("error", (error) => {
    console.error(
      "WebSocket client error:",
      error,
    );

    clients.delete(socket);
  });
});

/**
 * Sends a message to every connected client.
 */
function broadcast(message: unknown): void {
  const payload = JSON.stringify(message);

 for (const client of Array.from(clients)) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(payload);
    }
  }
}

/**
 * Generates and broadcasts a new price
 * for every stock.
 */
function updatePrices(): void {
  const currentStocks: Stock[] =
    Array.from(stockState.values());

  // Stocks belonging to the same sector
  // receive correlated movement.
  const priceUpdates =
    simulateSectorMovement(
      currentStocks,
      0.6,
    );

for (const [symbol, newPrice] of Array.from(
  priceUpdates.entries(),
))  {
    const stock = stockState.get(symbol);

    if (!stock) {
      continue;
    }

    const update = createPriceUpdate(
      stock,
      newPrice,
    );

    const updatedStock: Stock = {
      ...stock,

      lastPrice: update.price,

      changePercent:
        update.changePercent,

      changeAbsolute:
        update.changeAbsolute,

      volume: update.volume,
    };

    // Store the latest stock state.
    stockState.set(
      symbol,
      updatedStock,
    );

    // Send update to every connected client.
    broadcast({
      type: "price_update",
      ...update,
    });
  }

  console.log(
    `Broadcasted ${priceUpdates.size} price updates to ${clients.size} client(s)`,
  );
}

/**
 * Random update interval between
 * approximately 1.5 and 2.5 seconds.
 */
function getRandomUpdateDelay(): number {
  const minimum = 1500;
  const maximum = 2500;

  return (
    Math.floor(
      Math.random() *
        (maximum - minimum + 1),
    ) + minimum
  );
}

/**
 * Schedule the next market update.
 */
function scheduleNextUpdate(): void {
  const delay =
    getRandomUpdateDelay();

  setTimeout(() => {
    updatePrices();
    scheduleNextUpdate();
  }, delay);
}

// Start the simulation loop.
scheduleNextUpdate();

/**
 * Graceful server shutdown.
 */
process.on("SIGINT", () => {
  console.log(
    "\nShutting down WebSocket server...",
  );

 for (const client of Array.from(clients)) {
    client.close();
  }

  server.close(() => {
    console.log(
      "WebSocket server stopped.",
    );

    process.exit(0);
  });
});
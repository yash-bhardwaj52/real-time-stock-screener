import type { Stock } from "@/types/stock";

const DB_NAME = "stock-screener-db";
const STORE_NAME = "stocks";
const DB_VERSION = 1;

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(
      DB_NAME,
      DB_VERSION,
    );

    request.onupgradeneeded = () => {
      const db = request.result;

      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onerror = () => {
      reject(request.error);
    };
  });
}

export async function saveStocks(
  stocks: Stock[],
): Promise<void> {
  const db = await openDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(
      STORE_NAME,
      "readwrite",
    );

    const store = transaction.objectStore(
      STORE_NAME,
    );

    store.put(stocks, "universe");

    transaction.oncomplete = () => {
      db.close();
      resolve();
    };

    transaction.onerror = () => {
      db.close();
      reject(transaction.error);
    };

    transaction.onabort = () => {
      db.close();
      reject(
        transaction.error ??
          new Error("IndexedDB transaction aborted"),
      );
    };
  });
}

export async function getCachedStocks(): Promise<
  Stock[] | null
> {
  const db = await openDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(
      STORE_NAME,
      "readonly",
    );

    const store = transaction.objectStore(
      STORE_NAME,
    );

    const request = store.get("universe");

    request.onsuccess = () => {
      db.close();
      resolve(request.result ?? null);
    };

    request.onerror = () => {
      db.close();
      reject(request.error);
    };
  });
}

export async function syncStocksFromServer(): Promise<
  Stock[]
> {
  const response = await fetch("/api/stocks", {
    method: "GET",
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(
      `Stock sync failed: ${response.status}`,
    );
  }

  const payload = await response.json();

  const stocks: Stock[] = Array.isArray(payload)
    ? payload
    : payload?.data;

  if (!Array.isArray(stocks)) {
    throw new Error(
      "Invalid stock API response",
    );
  }

  await saveStocks(stocks);

  return stocks;
}
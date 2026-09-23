import StockTable from "@/components/StockTable";
import { generateMockStocks } from "@/lib/mockDataGenerator";

export default function Home() {
  const stocks = generateMockStocks(5000);

  return (
    <main className="min-h-screen bg-gray-950 p-6">
      <h1 className="mb-6 text-2xl font-bold text-white">
        Real-Time Stock Screener
      </h1>

      <StockTable data={stocks} />
    </main>
  );
}
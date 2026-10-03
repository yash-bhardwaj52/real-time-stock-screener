import StockScreenerLoader from "@/components/StockScreenerLoader";

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-950 p-6">
      <h1 className="mb-6 text-2xl font-bold text-white">
        Real-Time Stock Screener
      </h1>

      <StockScreenerLoader />
    </main>
  );
}
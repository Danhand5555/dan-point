import { useState, useEffect } from "react";
import { type StockData, type ScoredStockData, scoreStocks } from "./utils/scoring";
import { StockTable } from "./components/StockTable";
import { AddStockModal } from "./components/AddStockModal";
import { BulkImportModal } from "./components/BulkImportModal";
import { PromptGeneratorModal } from "./components/PromptGeneratorModal";
import { ChartsSection } from "./components/ChartsSection";
import { Button } from "./components/Button";
import { Plus, Upload, Sparkles, BarChart3 } from "lucide-react";

function App() {
  const [stocks, setStocks] = useState<StockData[]>(() => {
    try {
      const saved = localStorage.getItem("stocks");
      const parsed = saved ? JSON.parse(saved) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      console.error("Failed to load stocks from local storage", e);
      return [];
    }
  });

  const [scoredStocks, setScoredStocks] = useState<ScoredStockData[]>([]);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [isPromptModalOpen, setIsPromptModalOpen] = useState(false);

  // Recalculate scores whenever stocks change
  useEffect(() => {
    const scored = scoreStocks(stocks);
    setScoredStocks(scored);
    localStorage.setItem("stocks", JSON.stringify(stocks));
  }, [stocks]);

  const handleAddStock = (newStock: StockData) => {
    setStocks((prev) => {
      // Remove existing if same ticker
      const filtered = prev.filter((s) => s.Ticker !== newStock.Ticker);
      return [...filtered, newStock];
    });
  };

  const handleDeleteStock = (ticker: string) => {
    setStocks((prev) => prev.filter((s) => s.Ticker !== ticker));
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">
              Stock Scoring System
            </h1>
            <p className="text-slate-400 mt-1">
              Analyze and rank stocks based on 10 key financial metrics
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button
              variant="outline"
              onClick={() => setIsPromptModalOpen(true)}
              className="gap-2"
            >
              <Sparkles className="h-4 w-4 text-yellow-400" />
              Generate AI Prompt
            </Button>
            <Button
              variant="secondary"
              onClick={() => setIsBulkModalOpen(true)}
              className="gap-2"
            >
              <Upload className="h-4 w-4" />
              Import from AI
            </Button>
            <Button
              onClick={() => setIsAddModalOpen(true)}
              className="gap-2 shadow-blue-900/20 shadow-lg"
            >
              <Plus className="h-4 w-4" />
              Add Stock
            </Button>
          </div>
        </header>

        {/* Main Content */}
        <main className="space-y-8">
          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-slate-900/50 border border-slate-800 p-4 rounded-xl">
              <div className="text-slate-400 text-sm font-medium mb-1">Total Stocks</div>
              <div className="text-2xl font-bold text-white">{stocks.length}</div>
            </div>
            <div className="bg-slate-900/50 border border-slate-800 p-4 rounded-xl">
              <div className="text-slate-400 text-sm font-medium mb-1">Top Pick</div>
              <div className="text-2xl font-bold text-emerald-400">
                {scoredStocks.length > 0 ? scoredStocks[0].Ticker : "-"}
              </div>
            </div>
            <div className="bg-slate-900/50 border border-slate-800 p-4 rounded-xl">
              <div className="text-slate-400 text-sm font-medium mb-1">Average Score</div>
              <div className="text-2xl font-bold text-blue-400">
                {scoredStocks.length > 0
                  ? (scoredStocks.reduce((acc, s) => acc + s["Final Score"], 0) / scoredStocks.length).toFixed(1)
                  : "-"}
              </div>
            </div>
          </div>

          {/* Table */}
          <section>
            <div className="flex items-center gap-2 mb-4">
              <BarChart3 className="h-5 w-5 text-slate-400" />
              <h2 className="text-xl font-semibold">Rankings</h2>
            </div>
            <StockTable stocks={scoredStocks} onDelete={handleDeleteStock} />
          </section>

          {/* Charts */}
          <ChartsSection stocks={scoredStocks} />
        </main>

        {/* Modals */}
        <AddStockModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          onAdd={handleAddStock}
        />
        <BulkImportModal
          isOpen={isBulkModalOpen}
          onClose={() => setIsBulkModalOpen(false)}
          onAdd={handleAddStock}
        />
        <PromptGeneratorModal
          isOpen={isPromptModalOpen}
          onClose={() => setIsPromptModalOpen(false)}
        />
      </div>
    </div>
  );
}

export default App;

import React from "react";
import { type ScoredStockData } from "../utils/scoring";
import { Button } from "./Button";
import { Trash2 } from "lucide-react";

interface StockTableProps {
    stocks: ScoredStockData[];
    onDelete: (ticker: string) => void;
}

export const StockTable: React.FC<StockTableProps> = ({ stocks, onDelete }) => {
    if (stocks.length === 0) {
        return (
            <div className="text-center py-12 text-slate-500 border border-dashed border-slate-800 rounded-lg">
                No stocks added yet. Add a stock to see scores.
            </div>
        );
    }

    return (
        <div className="overflow-x-auto rounded-lg border border-slate-800 bg-slate-900/50">
            <table className="w-full text-left text-sm text-slate-300">
                <thead className="bg-slate-900 text-xs uppercase text-slate-400">
                    <tr>
                        <th className="px-4 py-3 font-medium">Rank</th>
                        <th className="px-4 py-3 font-medium">Ticker</th>
                        <th className="px-4 py-3 font-medium text-right">Final Score</th>
                        <th className="px-4 py-3 font-medium text-right">P/E</th>
                        <th className="px-4 py-3 font-medium text-right">PEG</th>
                        <th className="px-4 py-3 font-medium text-right">ROE</th>
                        <th className="px-4 py-3 font-medium text-right">FCF</th>
                        <th className="px-4 py-3 font-medium text-right">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                    {stocks.map((stock) => (
                        <tr key={stock.Ticker} className="hover:bg-slate-800/50 transition-colors">
                            <td className="px-4 py-3 font-bold text-white">#{stock.Rank}</td>
                            <td className="px-4 py-3 font-medium text-blue-400">{stock.Ticker}</td>
                            <td className="px-4 py-3 text-right font-bold text-emerald-400">
                                {stock["Final Score"].toFixed(1)}
                            </td>
                            <td className="px-4 py-3 text-right">{stock.PE}</td>
                            <td className="px-4 py-3 text-right">{stock.PEG}</td>
                            <td className="px-4 py-3 text-right">{stock.ROE}%</td>
                            <td className="px-4 py-3 text-right">{stock.FCF}</td>
                            <td className="px-4 py-3 text-right">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => onDelete(stock.Ticker)}
                                    className="text-slate-500 hover:text-red-400"
                                    title="Delete Stock"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

import React, { useState } from "react";
import { parseBulkData, type StockData } from "../utils/scoring";
import { Button } from "./Button";
import { Input } from "./Input";
import { X, AlertCircle, CheckCircle2 } from "lucide-react";

interface BulkImportModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAdd: (data: StockData) => void;
}

export const BulkImportModal: React.FC<BulkImportModalProps> = ({
    isOpen,
    onClose,
    onAdd,
}) => {
    const [ticker, setTicker] = useState("");
    const [text, setText] = useState("");
    const [error, setError] = useState<string | null>(null);

    if (!isOpen) return null;

    const handleImport = () => {
        setError(null);
        if (!ticker.trim()) {
            setError("Please enter a ticker symbol.");
            return;
        }

        try {
            const parsed = parseBulkData(text);

            // Validate required fields
            const requiredFields = [
                "PE", "PEG", "ROE", "FCF", "DE", "Operating Margin",
                "Revenue Growth", "Current Ratio", "Profit Margin", "EPS Growth"
            ];

            const missing = requiredFields.filter(f => parsed[f as keyof typeof parsed] === undefined);

            if (missing.length > 0) {
                setError(`Missing fields: ${missing.join(", ")}`);
                return;
            }

            onAdd({ ...parsed, Ticker: ticker.toUpperCase() } as StockData);
            setTicker("");
            setText("");
            onClose();
        } catch (e) {
            setError("Failed to parse data. Please check the format.");
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="w-full max-w-2xl rounded-xl border border-slate-800 bg-slate-950 p-6 shadow-2xl flex flex-col max-h-[90vh]">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold text-white">Bulk Import from AI</h2>
                    <Button variant="ghost" size="icon" onClick={onClose}>
                        <X className="h-5 w-5" />
                    </Button>
                </div>

                <div className="space-y-4 flex-1 overflow-y-auto">
                    <div className="bg-blue-900/20 border border-blue-800 rounded-lg p-4 text-sm text-blue-200">
                        <p className="font-semibold mb-1 flex items-center gap-2">
                            <CheckCircle2 className="h-4 w-4" /> Instructions
                        </p>
                        <p>
                            Paste the full output from ChatGPT/Claude containing the 10 metrics.
                            The system will automatically extract the values.
                        </p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-400 mb-1">Ticker Symbol</label>
                        <Input
                            value={ticker}
                            onChange={(e) => setTicker(e.target.value.toUpperCase())}
                            placeholder="e.g. MSFT"
                            className="uppercase"
                        />
                    </div>

                    <div className="flex-1">
                        <label className="block text-sm font-medium text-slate-400 mb-1">Paste AI Response</label>
                        <textarea
                            className="w-full h-64 rounded-md border border-slate-700 bg-slate-900 p-3 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                            placeholder={`- P/E Ratio: 36.52
- PEG Ratio: 3.21
...`}
                            value={text}
                            onChange={(e) => setText(e.target.value)}
                        />
                    </div>

                    {error && (
                        <div className="bg-red-900/20 border border-red-800 rounded-lg p-3 text-sm text-red-200 flex items-center gap-2">
                            <AlertCircle className="h-4 w-4" />
                            {error}
                        </div>
                    )}
                </div>

                <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-slate-800">
                    <Button variant="ghost" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button onClick={handleImport}>Import Data</Button>
                </div>
            </div>
        </div>
    );
};

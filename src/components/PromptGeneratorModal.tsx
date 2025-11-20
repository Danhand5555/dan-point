import React, { useState } from "react";
import { generateAiPrompt } from "../utils/scoring";
import { Button } from "./Button";
import { Input } from "./Input";
import { X, Copy, Check } from "lucide-react";

interface PromptGeneratorModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const PromptGeneratorModal: React.FC<PromptGeneratorModalProps> = ({
    isOpen,
    onClose,
}) => {
    const [ticker, setTicker] = useState("");
    const [copied, setCopied] = useState(false);

    if (!isOpen) return null;

    const prompt = ticker ? generateAiPrompt(ticker.toUpperCase()) : "";

    const handleCopy = () => {
        if (!prompt) return;
        navigator.clipboard.writeText(prompt);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="w-full max-w-2xl rounded-xl border border-slate-800 bg-slate-950 p-6 shadow-2xl">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-white">Generate AI Prompt</h2>
                    <Button variant="ghost" size="icon" onClick={onClose}>
                        <X className="h-5 w-5" />
                    </Button>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-400 mb-1">Ticker Symbol</label>
                        <div className="flex gap-2">
                            <Input
                                value={ticker}
                                onChange={(e) => setTicker(e.target.value.toUpperCase())}
                                placeholder="e.g. NVDA"
                                className="uppercase"
                                autoFocus
                            />
                        </div>
                    </div>

                    {ticker && (
                        <div className="relative">
                            <label className="block text-sm font-medium text-slate-400 mb-1">Prompt</label>
                            <div className="relative rounded-md border border-slate-700 bg-slate-900 p-4 text-sm text-slate-300 font-mono whitespace-pre-wrap h-64 overflow-y-auto">
                                {prompt}
                            </div>
                            <div className="absolute top-8 right-2">
                                <Button size="sm" variant="secondary" onClick={handleCopy} className="gap-2">
                                    {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                                    {copied ? "Copied" : "Copy"}
                                </Button>
                            </div>
                        </div>
                    )}
                </div>

                <div className="flex justify-end mt-6">
                    <Button variant="ghost" onClick={onClose}>Close</Button>
                </div>
            </div>
        </div>
    );
};

import React, { useState } from "react";
import { type StockData } from "../utils/scoring";
import { Button } from "./Button";
import { Input } from "./Input";
import { X } from "lucide-react";

interface AddStockModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAdd: (data: StockData) => void;
}

export const AddStockModal: React.FC<AddStockModalProps> = ({
    isOpen,
    onClose,
    onAdd,
}) => {
    const [formData, setFormData] = useState<Partial<StockData>>({});

    if (!isOpen) return null;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Basic validation and type conversion
        const data: any = { ...formData };

        // Convert numeric fields
        const numericFields = [
            "PE", "PEG", "ROE", "DE", "Operating Margin",
            "Revenue Growth", "Current Ratio", "Profit Margin", "EPS Growth"
        ];

        numericFields.forEach(field => {
            if (data[field]) data[field] = parseFloat(data[field]);
        });

        if (!data.Ticker) return alert("Ticker is required");

        onAdd(data as StockData);
        setFormData({});
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="w-full max-w-2xl rounded-xl border border-slate-800 bg-slate-950 p-6 shadow-2xl">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-white">Add New Stock</h2>
                    <Button variant="ghost" size="icon" onClick={onClose}>
                        <X className="h-5 w-5" />
                    </Button>
                </div>

                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="col-span-full">
                        <label className="block text-sm font-medium text-slate-400 mb-1">Ticker Symbol</label>
                        <Input
                            name="Ticker"
                            placeholder="e.g. AAPL"
                            value={formData.Ticker || ""}
                            onChange={handleChange}
                            required
                            autoFocus
                            className="uppercase"
                        />
                    </div>

                    {[
                        { label: "P/E Ratio", name: "PE" },
                        { label: "PEG Ratio", name: "PEG" },
                        { label: "ROE (%)", name: "ROE" },
                        { label: "FCF (e.g. 50M, 2B)", name: "FCF", type: "text" },
                        { label: "D/E Ratio", name: "DE" },
                        { label: "Operating Margin (%)", name: "Operating Margin" },
                        { label: "Revenue Growth (%)", name: "Revenue Growth" },
                        { label: "Current Ratio", name: "Current Ratio" },
                        { label: "Profit Margin (%)", name: "Profit Margin" },
                        { label: "EPS Growth (%)", name: "EPS Growth" },
                    ].map((field) => (
                        <div key={field.name}>
                            <label className="block text-sm font-medium text-slate-400 mb-1">{field.label}</label>
                            <Input
                                name={field.name}
                                type={field.type || "number"}
                                step="any"
                                value={formData[field.name] || ""}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    ))}

                    <div className="col-span-full flex justify-end gap-3 mt-4">
                        <Button type="button" variant="ghost" onClick={onClose}>
                            Cancel
                        </Button>
                        <Button type="submit">Add Stock</Button>
                    </div>
                </form>
            </div>
        </div>
    );
};

import React from "react";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    RadarChart,
    PolarGrid,
    PolarAngleAxis,
    PolarRadiusAxis,
    Radar,
    Legend,
} from "recharts";
import { type ScoredStockData } from "../utils/scoring";

interface ChartsSectionProps {
    stocks: ScoredStockData[];
}

export const ChartsSection: React.FC<ChartsSectionProps> = ({ stocks }) => {
    if (stocks.length === 0) return null;

    // Prepare data for Radar Chart
    // We need to normalize the structure for Recharts Radar
    // The python script plots all stocks on one radar.
    // Let's do the same.

    const metrics = [
        "PE", "PEG", "ROE", "FCF", "DE",
        "Operating Margin", "Revenue Growth", "Current Ratio",
        "Profit Margin", "EPS Growth"
    ];

    const radarData = metrics.map(metric => {
        const point: any = { metric };
        stocks.forEach(stock => {
            point[stock.Ticker] = stock[`${metric} (score)`];
        });
        return point;
    });

    // Colors for different stocks
    const colors = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899"];

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
            {/* Bar Chart - Final Scores */}
            <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-white mb-6">Final Composite Score</h3>
                <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={stocks}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                            <XAxis dataKey="Ticker" stroke="#94a3b8" />
                            <YAxis stroke="#94a3b8" domain={[0, 100]} />
                            <Tooltip
                                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', color: '#f8fafc' }}
                                cursor={{ fill: '#1e293b' }}
                            />
                            <Bar dataKey="Final Score" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Radar Chart - Metric Comparison */}
            <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-white mb-6">Metric Scores Radar (0-100)</h3>
                <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                            <PolarGrid stroke="#334155" />
                            <PolarAngleAxis dataKey="metric" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                            <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                            {stocks.map((stock, index) => (
                                <Radar
                                    key={stock.Ticker}
                                    name={stock.Ticker}
                                    dataKey={stock.Ticker}
                                    stroke={colors[index % colors.length]}
                                    fill={colors[index % colors.length]}
                                    fillOpacity={0.1}
                                />
                            ))}
                            <Legend />
                            <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', color: '#f8fafc' }} />
                        </RadarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
};

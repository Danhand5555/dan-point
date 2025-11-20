export interface StockData {
    Ticker: string;
    PE: number;
    PEG: number;
    ROE: number;
    FCF: number | string; // Can be string during input, parsed to number for scoring
    DE: number;
    "Operating Margin": number;
    "Revenue Growth": number;
    "Current Ratio": number;
    "Profit Margin": number;
    "EPS Growth": number;
    [key: string]: any; // Allow for score columns
}

export interface ScoredStockData extends StockData {
    "Final Score": number;
    Rank: number;
}

// Configuration: which metrics are "higher is better"
export const direction: Record<string, "higher" | "lower"> = {
    PE: "lower",
    PEG: "lower",
    ROE: "higher",
    FCF: "higher",
    DE: "lower",
    "Operating Margin": "higher",
    "Revenue Growth": "higher",
    "Current Ratio": "higher",
    "Profit Margin": "higher",
    "EPS Growth": "higher",
};

// Optional weights for each metric -- equal weights by default
export const defaultWeights: Record<string, number> = {
    PE: 1,
    PEG: 1,
    ROE: 1,
    FCF: 1,
    DE: 1,
    "Operating Margin": 1,
    "Revenue Growth": 1,
    "Current Ratio": 1,
    "Profit Margin": 1,
    "EPS Growth": 1,
};

export function parseFcfValue(fcfStr: string | number): number {
    if (typeof fcfStr === "number") return fcfStr;

    const str = String(fcfStr).trim().toUpperCase();
    try {
        if (str.endsWith("B")) {
            return parseFloat(str.slice(0, -1)) * 1000;
        } else if (str.endsWith("M")) {
            return parseFloat(str.slice(0, -1));
        } else {
            return parseFloat(str);
        }
    } catch (e) {
        console.error("Invalid FCF format", fcfStr);
        return 0;
    }
}

function normalizeMinMax(values: number[], higherIsBetter: boolean = true): number[] {
    const mn = Math.min(...values);
    const mx = Math.max(...values);

    if (Math.abs(mx - mn) < 0.000001) {
        return values.map(() => 50.0);
    }

    return values.map((val) => {
        if (higherIsBetter) {
            return ((val - mn) / (mx - mn)) * 100;
        } else {
            return ((mx - val) / (mx - mn)) * 100;
        }
    });
}

export function scoreStocks(stocks: StockData[], weights = defaultWeights): ScoredStockData[] {
    if (stocks.length === 0) return [];

    // Create a copy to avoid mutating original
    const scored: (StockData & { [key: string]: any })[] = stocks.map(s => ({ ...s, FCF: parseFcfValue(s.FCF) }));
    const metrics = Object.keys(direction);
    const scores: Record<string, number[]> = {};

    // 1. Normalize each metric
    metrics.forEach((metric) => {
        const values = scored.map((s) => s[metric] as number);
        const isHigherBetter = direction[metric] === "higher";
        const normalized = normalizeMinMax(values, isHigherBetter);
        scores[metric] = normalized;

        // Store individual metric score in the object for Radar chart
        scored.forEach((s, i) => {
            s[`${metric} (score)`] = normalized[i];
        });
    });

    // 2. Calculate Weighted Average
    scored.forEach((stock, i) => {
        let totalScore = 0;
        let totalWeight = 0;

        metrics.forEach((metric) => {
            const weight = weights[metric] || 1;
            const score = scores[metric][i];
            totalScore += score * weight;
            totalWeight += weight;
        });

        stock["Final Score"] = totalWeight > 0 ? totalScore / totalWeight : 0;
    });

    // 3. Rank
    // Sort by Final Score descending
    scored.sort((a, b) => b["Final Score"] - a["Final Score"]);

    // Assign rank
    scored.forEach((stock, i) => {
        stock.Rank = i + 1;
    });

    return scored as ScoredStockData[];
}

export function parseBulkData(text: string): Partial<StockData> {
    const data: Partial<StockData> = {};

    // Clean invisible chars
    text = text.replace(/[\u200b-\u200d\ufeff]/g, '');

    // Normalize separators
    text = text
        .replace(/ - /g, '\n')
        .replace(/ • /g, '\n')
        .replace(/ \| /g, '\n')
        .replace(/; /g, '\n')
        .replace(/, /g, '\n');

    const lines = text.split('\n');

    for (let line of lines) {
        line = line.trim();
        if (!line) continue;

        // Remove bullets
        line = line.replace(/^[\*\-•◦▪▫⦿⦾○●►▸➤➢]+/, '').trim();
        line = line.replace(/^[0-9]+\./, '').trim(); // Remove "1." etc

        if (!line.includes(':')) continue;

        const [keyPart, valPart] = line.split(':', 2);
        const key = keyPart.trim().toLowerCase();
        let valueStr = valPart.trim().replace(/%$/, '').trim();

        // Helper to parse float safely
        const parseVal = (v: string) => {
            const f = parseFloat(v);
            return isNaN(f) ? 0 : f;
        };

        if ((key.includes('p/e') || key.includes('pe ratio')) && !key.includes('peg')) {
            data.PE = parseVal(valueStr);
        } else if (key.includes('peg')) {
            data.PEG = parseVal(valueStr);
        } else if (key.includes('roe') || key.includes('return on equity')) {
            data.ROE = parseVal(valueStr);
        } else if (key.includes('fcf') || key.includes('free cash flow')) {
            data.FCF = valueStr; // Keep string for later parsing
        } else if (key.includes('d/e') || (key.includes('debt') && key.includes('equity'))) {
            data.DE = parseVal(valueStr);
        } else if (key.includes('operating margin')) {
            data["Operating Margin"] = parseVal(valueStr);
        } else if (key.includes('revenue growth')) {
            data["Revenue Growth"] = parseVal(valueStr);
        } else if (key.includes('current ratio')) {
            data["Current Ratio"] = parseVal(valueStr);
        } else if (key.includes('profit margin')) {
            data["Profit Margin"] = parseVal(valueStr);
        } else if (key.includes('eps growth')) {
            data["EPS Growth"] = parseVal(valueStr);
        }
    }

    return data;
}

export const generateAiPrompt = (ticker: string) => `Please find the following 10 financial metrics for ${ticker} stock using the most recent data available:

1. P/E Ratio (Price-to-Earnings)
2. PEG Ratio (Price/Earnings to Growth)
3. ROE (Return on Equity) in %
4. FCF (Free Cash Flow) - please specify in millions (M) or billions (B)
5. D/E Ratio (Debt-to-Equity)
6. Operating Margin in %
7. Revenue Growth (Year-over-Year) in %
8. Current Ratio
9. Profit Margin in %
10. EPS Growth (Earnings Per Share Growth Year-over-Year) in %

Please provide just the numbers in a clear format, for example:
- P/E Ratio: 36.52
- PEG Ratio: 3.21
- ROE: 171.42%
- FCF: 98.77B
- D/E Ratio: 1.52
- Operating Margin: 31.97%
- Revenue Growth: 8.5%
- Current Ratio: 1.07
- Profit Margin: 26.4%
- EPS Growth: 9.2%`;

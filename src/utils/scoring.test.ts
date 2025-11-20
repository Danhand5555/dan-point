import { describe, it, expect } from 'vitest';
import { scoreStocks, parseBulkData, parseFcfValue } from './scoring';

describe('scoring logic', () => {
    it('should parse FCF values correctly', () => {
        expect(parseFcfValue('50M')).toBe(50);
        expect(parseFcfValue('2B')).toBe(2000);
        expect(parseFcfValue('100')).toBe(100);
        expect(parseFcfValue(100)).toBe(100);
    });

    it('should score stocks correctly', () => {
        const stocks = [
            {
                Ticker: 'A',
                PE: 10, // Lower is better (best)
                PEG: 1,
                ROE: 20,
                FCF: 100,
                DE: 0.5,
                "Operating Margin": 20,
                "Revenue Growth": 10,
                "Current Ratio": 1.5,
                "Profit Margin": 15,
                "EPS Growth": 10
            },
            {
                Ticker: 'B',
                PE: 20, // Lower is better (worst)
                PEG: 1,
                ROE: 20,
                FCF: 100,
                DE: 0.5,
                "Operating Margin": 20,
                "Revenue Growth": 10,
                "Current Ratio": 1.5,
                "Profit Margin": 15,
                "EPS Growth": 10
            }
        ];

        const scored = scoreStocks(stocks);
        // A should have better score because of lower PE
        expect(scored[0].Ticker).toBe('A');
        expect(scored[0]["Final Score"]).toBeGreaterThan(scored[1]["Final Score"]);
    });

    it('should parse bulk data correctly', () => {
        const text = `
    - P/E Ratio: 36.52
    - PEG Ratio: 3.21
    - ROE: 171.42%
    - FCF: 98.77B
    `;
        const parsed = parseBulkData(text);
        expect(parsed.PE).toBe(36.52);
        expect(parsed.PEG).toBe(3.21);
        expect(parsed.ROE).toBe(171.42);
        expect(parsed.FCF).toBe('98.77B');
    });
});

import { describe, it, expect } from 'vitest';
import { calculateNetSalary } from './payrollCalculator';

describe('payrollCalculator unit tests', () => {
  it('should calculate the base values correctly with no deductions or unpaid leaves', () => {
    const salary = { basic: 5000, hra: 2000, allowances: 1000 };
    const deductions = { pfRate: 0.12, unpaidLeaves: 0 };
    const result = calculateNetSalary(salary, deductions);

    // gross = basic (5000) + hra (2000) + allowances (1000) = 8000
    expect(result.gross).toBe(8000);
    // pf = basic * pfRate = 5000 * 0.12 = 600
    expect(result.pf).toBe(600);
    expect(result.leaveDeduction).toBe(0);
    expect(result.netSalary).toBeLessThan(8000);
  });

  it('should correctly calculate deductions for unpaid leaves based on working days', () => {
    const salary = { basic: 10000, hra: 4000, allowances: 2000 };
    const deductions = { pfRate: 0, unpaidLeaves: 2 };
    // gross = 16000. Under 20 working days, 16000 / 20 * 2 = 1600.
    const result = calculateNetSalary(salary, deductions, 20);

    expect(result.leaveDeduction).toBe(1600);
  });

  it('should fall back to slab tax when tax rate is not manually specified', () => {
    const salary = { basic: 10000, hra: 4000, allowances: 2000 };
    const deductions = { pfRate: 0.12, unpaidLeaves: 0 };
    const result = calculateNetSalary(salary, deductions);

    // gross = 16000. Annual taxable income = 16000 * 12 = 192000
    // Annual slab tax for 192,000:
    // First 50k: 0%
    // 50k - 100k: 50k * 0.10 = 5000
    // 100k - 192k: 92k * 0.20 = 18400
    // Total annual tax = 23,400. Monthly tax = 23,400 / 12 = 1950.
    expect(result.tax).toBe(1950);
  });

  it('should override with manual tax rate if provided', () => {
    const salary = { basic: 10000, hra: 4000, allowances: 2000 };
    const deductions = { pfRate: 0.12, unpaidLeaves: 0, taxRate: 0.15 };
    const result = calculateNetSalary(salary, deductions);

    // monthly taxable income is gross (16000). 15% of 16000 = 2400.
    expect(result.tax).toBe(2400);
  });
});

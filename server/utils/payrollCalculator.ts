export interface SalaryStructure {
  basic: number;
  hra: number;
  allowances: number;
}

export interface PayrollDeductions {
  taxRate?: number; // Optional flat tax rate override
  pfRate: number;  // e.g., 0.12 for 12%
  unpaidLeaves: number;
}

/**
 * Calculates tax based on simple slabs (example logic)
 * 0 - 50k: 0%
 * 50k - 100k: 10%
 * 100k - 200k: 20%
 * Above 200k: 30%
 */
function calculateSlabTax(annualTaxableIncome: number): number {
  if (annualTaxableIncome <= 50000) return 0;
  
  let tax = 0;
  if (annualTaxableIncome > 50000) {
    tax += Math.min(annualTaxableIncome - 50000, 50000) * 0.10;
  }
  if (annualTaxableIncome > 100000) {
    tax += Math.min(annualTaxableIncome - 100000, 100000) * 0.20;
  }
  if (annualTaxableIncome > 200000) {
    tax += (annualTaxableIncome - 200000) * 0.30;
  }
  return tax;
}

export function calculateNetSalary(
  salary: SalaryStructure,
  deductions: PayrollDeductions,
  workingDaysInMonth: number = 22
) {
  const gross = (salary.basic || 0) + (salary.hra || 0) + (salary.allowances || 0);
  
  // Calculate per-day rate for leave deductions
  const dailyRate = workingDaysInMonth > 0 ? gross / workingDaysInMonth : 0;
  const leaveDeduction = (deductions.unpaidLeaves || 0) * dailyRate;
  
  const monthlyTaxableIncome = gross - leaveDeduction;
  const annualTaxableIncome = monthlyTaxableIncome * 12;

  let tax = 0;
  if (deductions.taxRate !== undefined) {
    tax = monthlyTaxableIncome * deductions.taxRate;
  } else {
    const annualTax = calculateSlabTax(annualTaxableIncome);
    tax = annualTax / 12;
  }

  const pf = (salary.basic || 0) * (deductions.pfRate || 0);
  
  const totalDeductions = tax + pf + leaveDeduction;
  const netSalary = gross - totalDeductions;

  return {
    gross,
    tax,
    pf,
    leaveDeduction,
    totalDeductions,
    netSalary: Math.max(0, netSalary),
  };
}

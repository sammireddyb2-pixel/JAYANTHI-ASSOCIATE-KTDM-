/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type UserRole = 'proprietor' | 'manager' | 'team_leader' | 'employee';

export interface Person {
  id: string;
  name: string;
  role: UserRole;
  pin: string;
  photoUrl: string;
  designation: string;
  phone: string;
  email: string;
  joinedDate: string;
}

export interface PaymentItem {
  id: string;
  date: string; // YYYY-MM-DD
  amount: number;
  notes?: string;
}

export interface FundingTransaction {
  id: string;
  date: string; // YYYY-MM-DD
  totalFunding: number; // 1. Total employee funding
  balanceEmployeeFunding: number; // 2. Balance employee funding (e.g. pending allotment)
  receivedAmount: number; // 3. Received amount
  balanceAmount: number; // 4. Balance amount (Total Funding - Received Amount)
  notes?: string;
  proprietorApproved: boolean; // Approved by proprietor only
  employeeConfirmation?: 'Yes' | 'No' | null;
  payments?: PaymentItem[]; // Date-wise payment breakdowns
}

export interface EmployeeFunding {
  employeeId: string;
  transactions: FundingTransaction[];
}

export interface MonthlyFunding {
  id: string; // e.g. "2026-06"
  monthName: string; // e.g. "June 2026"
  employeeFundings: { [employeeId: string]: EmployeeFunding };
}

export interface SalaryRecord {
  employeeId: string;
  amount: number;
  incentive?: number;
  status: 'Credited' | 'Pending';
  employeeConfirmation: 'Yes' | 'No' | null;
  proprietorApproved: boolean;
  notes?: string;
  creditedDate?: string; // YYYY-MM-DD
  lastUpdated: string;
}

export interface MonthlySalary {
  id: string; // e.g. "2026-06"
  monthName: string; // e.g. "June 2026"
  salaries: { [employeeId: string]: SalaryRecord };
}

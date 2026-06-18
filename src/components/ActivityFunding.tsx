/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { MonthlyFunding, Person, FundingTransaction, EmployeeFunding, PaymentItem } from '../types';
import { 
  TrendingUp, Calendar, ChevronRight, User, PlusCircle, CheckCircle, 
  XSquare, Check, X, Pencil, DollarSign, Wallet, FileText, ArrowLeft, Trash2,
  Coins
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ActivityFundingProps {
  funding: MonthlyFunding[];
  people: Person[];
  currentUser: Person;
  onUpdateFunding: (updatedFunding: MonthlyFunding[]) => void;
}

export function ActivityFunding({ funding, people, currentUser, onUpdateFunding }: ActivityFundingProps) {
  // Navigation states:
  // 'months' -> Show grid/list of months
  // 'employees' -> Clicked a month, see employees in that month
  // 'details' -> Clicked an employee, see date-wise transactions
  const [navState, setNavState] = useState<'months' | 'employees' | 'details'>('months');
  const [selectedMonthId, setSelectedMonthId] = useState<string>('');
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>('');

  // Form states for adding or editing transactions
  const [isAddingTxn, setIsAddingTxn] = useState(false);
  const [editingTxnId, setEditingTxnId] = useState<string | null>(null);

  // Form inputs
  const [txnDate, setTxnDate] = useState(new Date().toISOString().split('T')[0]);
  const [txnTotal, setTxnTotal] = useState<number>(30000);
  const [txnBalanceEmp, setTxnBalanceEmp] = useState<number>(0);
  const [txnReceived, setTxnReceived] = useState<number>(25000);
  const [txnNotes, setTxnNotes] = useState('');

  // Date-wise received payments state variables
  const [expandedTxnId, setExpandedTxnId] = useState<string | null>(null);
  const [newPayDate, setNewPayDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [newPayAmount, setNewPayAmount] = useState<number>(0);
  const [newPayNotes, setNewPayNotes] = useState<string>('');

  // Can control data: Proprietor, Manager, Team Leader
  const canControl = currentUser.role === 'proprietor' || currentUser.role === 'manager' || currentUser.role === 'team_leader';
  const isProprietor = currentUser.role === 'proprietor';

  // Year/Month selection for new ledgers
  const [newLedgerYear, setNewLedgerYear] = useState<string>('2026');
  const [newLedgerMonth, setNewLedgerMonth] = useState<string>('07');

  const MONTHS_LIST = [
    { value: '01', label: 'January' },
    { value: '02', label: 'February' },
    { value: '03', label: 'March' },
    { value: '04', label: 'April' },
    { value: '05', label: 'May' },
    { value: '06', label: 'June' },
    { value: '07', label: 'July' },
    { value: '08', label: 'August' },
    { value: '09', label: 'September' },
    { value: '10', label: 'October' },
    { value: '11', label: 'November' },
    { value: '12', label: 'December' },
  ];

  const YEARS_LIST = ['2025', '2026', '2027', '2028', '2029', '2030'];

  // Received/Disburse breakdown modal state
  const [receivedBreakdown, setReceivedBreakdown] = useState<{
    title: string;
    transactions: { date: string; amount: number; employeeName?: string; notes?: string }[];
  } | null>(null);

  const handleMonthReceivedClick = (e: React.MouseEvent, m: MonthlyFunding) => {
    e.stopPropagation(); // Avoid drilling down on container click
    const txns: { date: string; amount: number; employeeName?: string; notes?: string }[] = [];
    Object.values(m.employeeFundings).forEach(empFund => {
      const emp = people.find(p => p.id === empFund.employeeId);
      empFund.transactions.forEach(t => {
        txns.push({
          date: t.date,
          amount: t.receivedAmount,
          employeeName: emp?.name || 'Staff User',
          notes: t.notes
        });
      });
    });
    txns.sort((a, b) => b.date.localeCompare(a.date));
    setReceivedBreakdown({
      title: `Date-wise Disbursals (${m.monthName})`,
      transactions: txns
    });
  };

  const handleEmployeeReceivedClick = (e: React.MouseEvent, empName: string, txnsList: FundingTransaction[]) => {
    e.stopPropagation(); // Prevent container events
    const txns = txnsList.map(t => ({
      date: t.date,
      amount: t.receivedAmount,
      notes: t.notes
    }));
    txns.sort((a, b) => b.date.localeCompare(a.date));
    setReceivedBreakdown({
      title: `Date-wise Received: ${empName}`,
      transactions: txns
    });
  };

  const selectedMonth = funding.find(m => m.id === selectedMonthId);
  const selectedEmployee = people.find(p => p.id === selectedEmployeeId);

  // Helper: Get employee fund details for selected month
  const getEmployeeFundingForMonth = (): EmployeeFunding | undefined => {
    if (!selectedMonth) return undefined;
    return selectedMonth.employeeFundings[selectedEmployeeId] || null;
  };

  const getIndianRupees = (val: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(val);
  };

  // Calculations for a Month
  const getMonthTotalFunding = (m: MonthlyFunding) => {
    let total = 0;
    Object.values(m.employeeFundings).forEach(empFund => {
      empFund.transactions.forEach(t => {
        total += t.totalFunding;
      });
    });
    return total;
  };

  const getMonthReceivedFunding = (m: MonthlyFunding) => {
    let total = 0;
    Object.values(m.employeeFundings).forEach(empFund => {
      empFund.transactions.forEach(t => {
        total += t.receivedAmount;
      });
    });
    return total;
  };

  // Add Transaction handler
  const handleAddTransaction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMonthId || !selectedEmployeeId) return;

    const newTxn: FundingTransaction = {
      id: `txn_${Date.now()}`,
      date: txnDate,
      totalFunding: txnTotal,
      balanceEmployeeFunding: txnBalanceEmp,
      receivedAmount: txnReceived,
      balanceAmount: Math.max(0, txnTotal - txnReceived),
      notes: txnNotes,
      proprietorApproved: isProprietor, // Auto-approved if created by proprietor
      payments: txnReceived > 0 ? [{
        id: `pay_${Date.now()}`,
        date: txnDate,
        amount: txnReceived,
        notes: txnNotes || 'Initial Payment'
      }] : []
    };

    const updated = funding.map(m => {
      if (m.id === selectedMonthId) {
        const currentEmpFunding = m.employeeFundings[selectedEmployeeId] || {
          employeeId: selectedEmployeeId,
          transactions: []
        };
        return {
          ...m,
          employeeFundings: {
            ...m.employeeFundings,
            [selectedEmployeeId]: {
              ...currentEmpFunding,
              transactions: [...currentEmpFunding.transactions, newTxn]
            }
          }
        };
      }
      return m;
    });

    onUpdateFunding(updated);
    setIsAddingTxn(false);
    resetForm();
  };

  // Edit/Update transaction
  const handleEditTransaction = (txn: FundingTransaction) => {
    setEditingTxnId(txn.id);
    setTxnDate(txn.date);
    setTxnTotal(txn.totalFunding);
    setTxnBalanceEmp(txn.balanceEmployeeFunding);
    setTxnReceived(txn.receivedAmount);
    setTxnNotes(txn.notes || '');
  };

  const handleUpdateTransaction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMonthId || !selectedEmployeeId || !editingTxnId) return;

    const updated = funding.map(m => {
      if (m.id === selectedMonthId) {
        const empFund = m.employeeFundings[selectedEmployeeId];
        if (empFund) {
          const updatedTxns = empFund.transactions.map(t => {
            if (t.id === editingTxnId) {
              const currentPayments = t.payments && t.payments.length > 0 ? t.payments : (t.receivedAmount > 0 ? [{
                id: `pay_fallback_${t.id}`,
                date: t.date,
                amount: t.receivedAmount,
                notes: t.notes || 'Initial Payment'
              }] : []);

              let finalPayments = currentPayments;
              if (txnReceived !== t.receivedAmount) {
                finalPayments = [{
                  id: `pay_edit_${Date.now()}`,
                  date: txnDate,
                  amount: txnReceived,
                  notes: txnNotes || 'Adjusted Payment'
                }];
              }

              return {
                ...t,
                date: txnDate,
                totalFunding: txnTotal,
                balanceEmployeeFunding: txnBalanceEmp,
                receivedAmount: txnReceived,
                balanceAmount: Math.max(0, txnTotal - txnReceived),
                notes: txnNotes,
                payments: finalPayments,
                // Only proprietor can directly toggle/change the approval, or preserve existing
                proprietorApproved: isProprietor ? t.proprietorApproved : t.proprietorApproved
              };
            }
            return t;
          });
          return {
            ...m,
            employeeFundings: {
              ...m.employeeFundings,
              [selectedEmployeeId]: {
                ...empFund,
                transactions: updatedTxns
              }
            }
          };
        }
      }
      return m;
    });

    onUpdateFunding(updated);
    setEditingTxnId(null);
    resetForm();
  };

  // Toggle Proprietor approval
  const handleProprietorApprovalToggle = (txnId: string) => {
    if (!isProprietor) return;
    const updated = funding.map(m => {
      if (m.id === selectedMonthId) {
        const empFund = m.employeeFundings[selectedEmployeeId];
        if (empFund) {
          const updatedTxns = empFund.transactions.map(t => {
            if (t.id === txnId) {
              return { ...t, proprietorApproved: !t.proprietorApproved };
            }
            return t;
          });
          return {
            ...m,
            employeeFundings: {
              ...m.employeeFundings,
              [selectedEmployeeId]: {
                ...empFund,
                transactions: updatedTxns
              }
            }
          };
        }
      }
      return m;
    });
    onUpdateFunding(updated);
  };

  // Delete Transaction
  const handleDeleteTransaction = (txnId: string) => {
    if (!canControl) return;
    if (!window.confirm("Are you sure you want to delete this transaction entry?")) return;

    const updated = funding.map(m => {
      if (m.id === selectedMonthId) {
        const empFund = m.employeeFundings[selectedEmployeeId];
        if (empFund) {
          return {
            ...m,
            employeeFundings: {
              ...m.employeeFundings,
              [selectedEmployeeId]: {
                ...empFund,
                transactions: empFund.transactions.filter(t => t.id !== txnId)
              }
            }
          };
        }
      }
      return m;
    });
    onUpdateFunding(updated);
  };

  const resetForm = () => {
    setTxnDate(new Date().toISOString().split('T')[0]);
    setTxnTotal(30000);
    setTxnBalanceEmp(0);
    setTxnReceived(25000);
    setTxnNotes('');
  };

  // Safe helper to read date-wise payment entries falling back to main fields
  const getTxnPayments = (txn: FundingTransaction): PaymentItem[] => {
    if (txn.payments && txn.payments.length > 0) {
      return txn.payments;
    }
    if (txn.receivedAmount > 0) {
      return [{
        id: `init_${txn.id}`,
        date: txn.date,
        amount: txn.receivedAmount,
        notes: txn.notes || 'Initial Payment'
      }];
    }
    return [];
  };

  // Helper to update date-wise payments and propagate to structural totals
  const updateTxnPayments = (txnId: string, updatedPayments: PaymentItem[]) => {
    const totalReceived = updatedPayments.reduce((sum, p) => sum + p.amount, 0);

    const updated = funding.map(m => {
      if (m.id === selectedMonthId) {
        const empFund = m.employeeFundings[selectedEmployeeId];
        if (empFund) {
          const updatedTxns = empFund.transactions.map(t => {
            if (t.id === txnId) {
              return {
                ...t,
                payments: updatedPayments,
                receivedAmount: totalReceived,
                balanceAmount: Math.max(0, t.totalFunding - totalReceived)
              };
            }
            return t;
          });
          return {
            ...m,
            employeeFundings: {
              ...m.employeeFundings,
              [selectedEmployeeId]: {
                ...empFund,
                transactions: updatedTxns
              }
            }
          };
        }
      }
      return m;
    });

    onUpdateFunding(updated);
  };

  const handleMonthClick = (mId: string) => {
    setSelectedMonthId(mId);
    setNavState('employees');
  };

  const handleEmployeeClick = (eId: string) => {
    if (currentUser.role === 'employee' && currentUser.id !== eId) {
      alert("CONFIDENTIAL LEDGER:\nYou are only authorized to view and confirm your own transactional ledger details.");
      return;
    }
    setSelectedEmployeeId(eId);
    setNavState('details');
  };

  const activeEmployeeFunding = getEmployeeFundingForMonth();
  const transactionsList = activeEmployeeFunding?.transactions || [];

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6" id="funding-view">
      {/* View Header with breadcrumbs for easy drilldown navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 mb-6 border-b border-slate-800">
        <div>
          <h2 className="text-lg font-sans font-semibold text-slate-100 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-emerald-400" />
            Jayanthi Associate Funding Details
          </h2>
          <div className="flex items-center gap-1.5 text-xs text-slate-400 font-mono mt-1">
            <span className="cursor-pointer hover:text-emerald-400 transition-colors" onClick={() => setNavState('months')}>Months</span>
            {navState !== 'months' && (
              <>
                <ChevronRight className="w-3 h-3 text-slate-600" />
                <span className="cursor-pointer hover:text-emerald-400 transition-colors inline-block max-w-[80px] truncate" onClick={() => {
                  if (currentUser.role === 'employee') return;
                  setNavState('employees');
                }}>{selectedMonth?.monthName}</span>
              </>
            )}
            {navState === 'details' && (
              <>
                <ChevronRight className="w-3 h-3 text-slate-600" />
                <span className="text-emerald-400 font-medium truncate inline-block max-w-[100px]">{selectedEmployee?.name}</span>
              </>
            )}
          </div>
        </div>

        {/* Action Button for Proprietor/Manager etc */}
        {navState === 'details' && canControl && !isAddingTxn && !editingTxnId && (
          <button
            onClick={() => { resetForm(); setIsAddingTxn(true); }}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-slate-100 font-sans font-medium text-xs rounded-xl transition-all shadow-md active:scale-[0.98]"
            id="add-txn-trigger-btn"
          >
            <PlusCircle className="w-4 h-4" />
            Add Entry
          </button>
        )}
      </div>

      {/* STEP 1: MONTH-WISE FUNDING LIST */}
      {navState === 'months' && (
        <div className="space-y-4" id="funding-step-months">
          {canControl && (
            <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl space-y-3 mb-2">
              <h3 className="text-xs font-mono uppercase tracking-wider text-slate-350 font-semibold flex items-center gap-2">
                <Calendar className="w-4 h-4 text-emerald-400" />
                Initialize New Month Funding Ledger
              </h3>
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-2">
                  <label className="text-[10px] font-mono text-slate-400 uppercase">Year:</label>
                  <select
                    value={newLedgerYear}
                    onChange={(e) => setNewLedgerYear(e.target.value)}
                    className="bg-slate-900 border border-slate-800 text-xs font-mono text-slate-100 rounded px-2 text-center py-1 outline-none focus:border-emerald-500"
                  >
                    {YEARS_LIST.map((y) => (
                      <option key={y} value={y}>{y}</option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center gap-2">
                  <label className="text-[10px] font-mono text-slate-400 uppercase">Month:</label>
                  <select
                    value={newLedgerMonth}
                    onChange={(e) => setNewLedgerMonth(e.target.value)}
                    className="bg-slate-900 border border-slate-800 text-xs font-mono text-slate-100 rounded px-2.5 py-1 outline-none focus:border-emerald-500"
                  >
                    {MONTHS_LIST.map((m) => (
                      <option key={m.value} value={m.value}>{m.label}</option>
                    ))}
                  </select>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    const monthId = `${newLedgerYear}-${newLedgerMonth}`;
                    if (funding.some(s => s.id === monthId)) {
                      alert("A funding ledger for this year/month already exists!");
                      return;
                    }

                    const monthLabel = MONTHS_LIST.find(m => m.value === newLedgerMonth)?.label + ' ' + newLedgerYear;

                    const newLedger: MonthlyFunding = {
                      id: monthId,
                      monthName: monthLabel,
                      employeeFundings: {}
                    };

                    const updated = [newLedger, ...funding].sort((a, b) => b.id.localeCompare(a.id));
                    onUpdateFunding(updated);
                  }}
                  className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 rounded text-slate-100 text-xs font-semibold font-sans transition-colors shrink-0 cursor-pointer"
                >
                  Create Ledger
                </button>
              </div>
            </div>
          )}

          <p className="text-xs text-slate-400 mb-2">Select a month to audit corporate allocations and disbursals.</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {funding.map((m) => {
              const totalAllocated = getMonthTotalFunding(m);
              const totalReceived = getMonthReceivedFunding(m);
              const totalBalance = totalAllocated - totalReceived;

              return (
                <div
                  key={m.id}
                  onClick={() => handleMonthClick(m.id)}
                  className="bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-emerald-500/50 rounded-xl p-4 cursor-pointer transition-all duration-150 flex items-center justify-between relative group"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-emerald-400" />
                      <h3 className="font-sans font-semibold text-sm text-slate-100">{m.monthName}</h3>
                    </div>
                    <div className="flex flex-col gap-1.5 pt-1 font-mono w-44">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-[10px] text-slate-500 uppercase tracking-widest">Allocated:</span>
                        <span className="font-semibold text-slate-300">{getIndianRupees(totalAllocated)}</span>
                      </div>
                      <div 
                        className="flex items-center justify-between text-xs hover:bg-slate-900/80 p-1 rounded transition-colors cursor-pointer group/item border border-transparent hover:border-emerald-500/20"
                        onClick={(e) => handleMonthReceivedClick(e, m)}
                        title="Click to view Date-wise breakdown"
                      >
                        <span className="text-[10px] text-emerald-400 uppercase tracking-widest font-semibold flex items-center gap-1 group-hover/item:underline">
                          Disburse ⓘ:
                        </span>
                        <span className="font-semibold text-emerald-400 group-hover/item:scale-105 transition-transform">{getIndianRupees(totalReceived)}</span>
                      </div>
                      <div className="flex items-center justify-between text-xs border-t border-slate-900/50 pt-1 mt-0.5">
                        <span className="text-[10px] text-slate-500 uppercase tracking-widest">Remaining:</span>
                        <span className={`font-semibold ${totalBalance > 0 ? 'text-amber-400' : 'text-slate-500'}`}>
                          {getIndianRupees(totalBalance)}
                        </span>
                      </div>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-slate-600 group-hover:text-emerald-400 group-hover:translate-x-0.5 transition-all shrink-0" />
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* STEP 2: PARTICULAR EMPLOYEE-WISE FUNDING LIST WITHIN SELECTED MONTH */}
      {navState === 'employees' && selectedMonth && (() => {
        const totalMonthAllocated = getMonthTotalFunding(selectedMonth);
        const totalMonthDisbursed = getMonthReceivedFunding(selectedMonth);
        const totalMonthRemaining = totalMonthAllocated - totalMonthDisbursed;

        return (
          <div id="funding-step-employees">
            <div className="flex items-center gap-2 mb-4">
              <button
                onClick={() => setNavState('months')}
                className="p-1.5 bg-slate-950 border border-slate-800 hover:bg-slate-850 rounded-lg text-slate-400 hover:text-slate-200 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              <h3 className="font-sans font-semibold text-sm text-slate-300">
                Allocated Personnel for <span className="text-emerald-400 font-bold">{selectedMonth.monthName}</span>
              </h3>
            </div>

            {/* Clear Aggregate Metrics Panel (Allocated, Disburse, Remaining) */}
            <div className="flex flex-col gap-3 mb-5 bg-slate-950/70 border border-slate-800 p-4 rounded-xl font-mono">
              <div className="flex items-center justify-between border-b border-slate-800/50 pb-2">
                <span className="text-xs text-slate-500 uppercase tracking-widest font-semibold">Allocated</span>
                <span className="text-sm sm:text-base font-bold text-slate-100">{getIndianRupees(totalMonthAllocated)}</span>
              </div>
              <div 
                className="flex items-center justify-between border-b border-slate-800/50 pb-2 hover:bg-slate-900/60 p-1 rounded transition-all cursor-pointer group/agg border border-transparent hover:border-emerald-500/25"
                onClick={(e) => {
                  const txns: FundingTransaction[] = [];
                  Object.values(selectedMonth.employeeFundings).forEach(empFund => {
                    txns.push(...empFund.transactions);
                  });
                  handleEmployeeReceivedClick(e, `All Staff (${selectedMonth.monthName})`, txns);
                }}
                title="Click to view Date-wise breakdown"
              >
                <span className="text-xs text-emerald-400 uppercase tracking-widest font-semibold flex items-center gap-1 group-hover/agg:underline">
                  Disburse ⓘ:
                </span>
                <span className="text-sm sm:text-base font-bold text-emerald-400 group-hover/agg:scale-105 transition-transform">{getIndianRupees(totalMonthDisbursed)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-amber-400 uppercase tracking-widest font-semibold">Remaining</span>
                <span className="text-sm sm:text-base font-bold text-amber-400">{getIndianRupees(totalMonthRemaining)}</span>
              </div>
            </div>

            <p className="text-xs text-slate-500 mb-3 font-mono">Click on any particular employee below to view their detailed transactional audit ledger.</p>

            <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
              {people.filter(p => p.role === 'employee').map((emp) => {
                const isSelf = emp.id === currentUser.id;
                const isRestricted = currentUser.role === 'employee' && !isSelf;
                
                const empFundData = selectedMonth.employeeFundings[emp.id];
                const txns = empFundData?.transactions || [];
                const totalFunding = txns.reduce((a, b) => a + b.totalFunding, 0);
                const totalReceived = txns.reduce((a, b) => a + b.receivedAmount, 0);
                const balanceAmount = totalFunding - totalReceived;

                return (
                  <div
                    key={emp.id}
                    onClick={() => handleEmployeeClick(emp.id)}
                    className={`p-3 border rounded-xl flex items-center justify-between cursor-pointer transition-all duration-120 group ${
                      isRestricted 
                        ? 'bg-slate-950/40 border-slate-900 opacity-50 cursor-not-allowed hover:bg-slate-950/40'
                        : 'bg-slate-950 hover:bg-slate-800/80 border-slate-850 hover:border-emerald-500/30'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <img 
                          src={emp.photoUrl} 
                          alt={emp.name} 
                          className="w-10 h-10 object-cover rounded-lg border border-slate-800 shrink-0"
                          referrerPolicy="no-referrer"
                        />
                        {isRestricted && (
                          <div className="absolute inset-0 bg-slate-955/60 rounded-lg flex items-center justify-center text-xs text-slate-400 font-bold">🔒</div>
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <h4 className="font-sans font-semibold text-slate-200 text-xs sm:text-sm">{emp.name}</h4>
                          {isSelf && (
                            <span className="px-1.5 py-0.5 text-[8px] bg-emerald-950 text-emerald-400 font-mono font-bold rounded uppercase">You</span>
                          )}
                        </div>
                        <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                          {isRestricted ? 'CONFIDENTIAL LEDGER' : emp.designation}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 shrink-0 font-mono">
                      <div className="text-right hidden md:grid grid-cols-3 gap-4 mr-2">
                        <div>
                          <p className="text-[8px] text-slate-500 uppercase tracking-wider font-bold">Allocated</p>
                          <p className="text-xs font-semibold text-slate-400 mt-0.5">{isRestricted ? "₹•••" : getIndianRupees(totalFunding)}</p>
                        </div>
                        <div 
                          className={`p-1.5 rounded transition-all flex flex-col items-end border border-transparent ${
                            isRestricted 
                              ? 'text-slate-500' 
                              : 'hover:bg-slate-900/80 cursor-pointer group/disb hover:border-emerald-500/30'
                          }`}
                          onClick={(e) => {
                            if (isRestricted) return;
                            handleEmployeeReceivedClick(e, emp.name, txns);
                          }}
                          title={isRestricted ? "Confidential" : "Click to view Date-wise breakdown"}
                        >
                          <p className={`text-[8px] uppercase tracking-wider font-semibold ${isRestricted ? 'text-slate-500' : 'text-emerald-400 group-hover/disb:underline'}`}>Disburse ⓘ</p>
                          <p className={`text-xs font-bold mt-0.5 ${isRestricted ? 'text-slate-500 font-normal' : 'text-emerald-400 group-hover/disb:scale-105 transition-transform'}`}>{isRestricted ? "₹•••" : getIndianRupees(totalReceived)}</p>
                        </div>
                        <div>
                          <p className="text-[8px] text-slate-500 uppercase tracking-wider font-bold">Remaining</p>
                          <p className="text-xs font-semibold text-slate-400 mt-0.5">{isRestricted ? "₹•••" : getIndianRupees(balanceAmount)}</p>
                        </div>
                      </div>

                      <div className="md:hidden text-right flex flex-col items-end">
                        <p className="text-[8px] text-slate-500 uppercase">Disburse / Allocated</p>
                        {isRestricted ? (
                          <p className="text-xs font-semibold text-slate-500 font-mono">₹••• / ₹•••</p>
                        ) : (
                          <p className="text-xs font-semibold text-slate-350">
                            <span 
                              className="text-emerald-400 font-bold hover:underline p-1 px-1.5 bg-slate-900 border border-slate-800 hover:border-emerald-500/30 rounded cursor-pointer inline-block"
                              onClick={(e) => handleEmployeeReceivedClick(e, emp.name, txns)}
                              title="Click for breakdown"
                            >
                              {getIndianRupees(totalReceived)} ⓘ
                            </span>
                            {" "}/ {getIndianRupees(totalFunding)}
                          </p>
                        )}
                      </div>

                      {isRestricted ? (
                        <span className="px-2 py-1 rounded bg-slate-950 text-slate-500 text-[10px] leading-none border border-slate-900 shrink-0 font-sans flex items-center gap-1">
                          🔒 Locked
                        </span>
                      ) : balanceAmount > 0 ? (
                        <span className="px-2 py-1 rounded bg-amber-500/10 text-amber-500 text-[10px] leading-none border border-amber-500/10 shrink-0">
                          Remaining: {getIndianRupees(balanceAmount)}
                        </span>
                      ) : (
                        <span className="px-2 py-1 rounded bg-emerald-500/10 text-emerald-400 text-[10px] leading-none border border-emerald-500/10 shrink-0">
                          Paid
                        </span>
                      )}
                      <ChevronRight className={`w-4 h-4 transition-all shrink-0 ${isRestricted ? 'text-slate-800' : 'text-slate-650 group-hover:text-emerald-400 group-hover:translate-x-0.5'}`} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })()}

      {/* STEP 3: DATE-WISE TRANSACTIONS AUDITING FOR EMPLOYEE IN MONTH */}
      {navState === 'details' && selectedMonth && selectedEmployee && (() => {
        const empAllTransactions = selectedMonth.employeeFundings[selectedEmployee.id]?.transactions || [];
        const totalAllocatedEmp = empAllTransactions.reduce((acc, t) => acc + t.totalFunding, 0);
        const totalDisbursedEmp = empAllTransactions.reduce((acc, t) => acc + t.receivedAmount, 0);
        const totalRemainingEmp = totalAllocatedEmp - totalDisbursedEmp;

        return (
          <div id="funding-step-details">
            {/* Header row */}
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-800/60 pb-3">
              <div className="flex items-center gap-2">
                {currentUser.role !== 'employee' && (
                  <button
                    onClick={() => setNavState('employees')}
                    className="p-1.5 bg-slate-950 border border-slate-800 hover:bg-slate-850 rounded-lg text-slate-400 hover:text-slate-200 transition-colors shrink-0"
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </button>
                )}
                <div className="flex items-center gap-2.5">
                  <img 
                    src={selectedEmployee.photoUrl} 
                    alt="" 
                    className="w-8 h-8 rounded-full object-cover border border-slate-700 shrink-0"
                    referrerPolicy="no-referrer"
                  />
                  <div>
                    <h3 className="font-sans font-bold text-slate-200 text-sm leading-tight">{selectedEmployee.name}</h3>
                    <p className="text-[10px] font-mono text-slate-400">{selectedMonth.monthName} Audit Ledger</p>
                  </div>
                </div>
              </div>

              {currentUser.role === 'employee' && (
                <span className="text-[10px] font-mono px-2 py-0.5 bg-slate-950 border border-slate-800 text-slate-400 rounded-full">
                  Viewing Self
                </span>
              )}
            </div>

            {/* Employee Aggregate Metrics Panel (Allocated, Disburse, Remaining in exact sequence) */}
            <div className="flex flex-col gap-3 mb-5 bg-slate-950/70 border border-slate-850 p-4 rounded-xl font-mono">
              <div className="flex items-center justify-between border-b border-slate-800/50 pb-2">
                <span className="text-xs text-slate-400 uppercase tracking-widest font-semibold">1. Allocated</span>
                <span className="text-sm sm:text-base font-bold text-slate-100">{getIndianRupees(totalAllocatedEmp)}</span>
              </div>
              <div 
                className="flex items-center justify-between border-b border-slate-800/50 pb-2 hover:bg-slate-900/60 p-1 rounded transition-all cursor-pointer group/det border border-transparent hover:border-emerald-500/25"
                onClick={(e) => handleEmployeeReceivedClick(e, selectedEmployee.name, empAllTransactions)}
                title="Click to view Date-wise breakdown"
              >
                <span className="text-xs text-emerald-400 uppercase tracking-widest font-semibold flex items-center gap-1 group-hover/det:underline">
                  2. Disburse ⓘ:
                </span>
                <span className="text-sm sm:text-base font-extrabold text-emerald-400 group-hover/det:scale-105 transition-transform">{getIndianRupees(totalDisbursedEmp)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-amber-400 uppercase tracking-widest font-semibold">3. Remaining</span>
                <span className="text-sm sm:text-base font-bold text-amber-400">{getIndianRupees(totalRemainingEmp)}</span>
              </div>
            </div>

          {/* ADD / EDIT TRANSACTION ROW FORMS FOR MANAGEMENT ONLY */}
          {(isAddingTxn || editingTxnId) && canControl && (
            <motion.form
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              onSubmit={editingTxnId ? handleUpdateTransaction : handleAddTransaction}
              className="mb-6 p-4 bg-slate-950 border border-emerald-500/20 rounded-xl space-y-3.5"
            >
              <div className="flex items-center justify-between pb-1.5 border-b border-slate-800">
                <h4 className="font-sans font-semibold text-xs text-emerald-400 uppercase tracking-wide">
                  {editingTxnId ? 'Edit Funding Entry' : 'Create New Funding Entry'}
                </h4>
                <button
                  type="button"
                  onClick={() => { setIsAddingTxn(false); setEditingTxnId(null); resetForm(); }}
                  className="text-slate-400 hover:text-slate-200 p-0.5 hover:bg-slate-800 rounded-md"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Date */}
                <div>
                  <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-widest mb-1">Date</label>
                  <input
                    type="date"
                    required
                    value={txnDate}
                    onChange={(e) => setTxnDate(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-slate-200 font-mono outline-none focus:border-emerald-500"
                  />
                </div>

                {/* Total Funding Allocated */}
                <div>
                  <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-widest mb-1">1. Total Funding Amount (మొత్తం ఫండింగ్ అమౌంట్) (₹)</label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={txnTotal}
                    onChange={(e) => setTxnTotal(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-slate-200 font-mono outline-none focus:border-emerald-500"
                  />
                </div>

                {/* Balance Employee Funding (Budget unallocated) */}
                <div>
                  <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-widest mb-1">2. Balance Funding Amount (మిగిలిన ఫండింగ్ అమౌంట్) (₹)</label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={txnBalanceEmp}
                    onChange={(e) => setTxnBalanceEmp(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-slate-200 font-mono outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Received Amount */}
                <div>
                  <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-widest mb-1">3. Total Received Amount (మొత్తం వచ్చిన అమౌంట్) (₹)</label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={txnReceived}
                    onChange={(e) => setTxnReceived(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-emerald-300 font-mono outline-none focus:border-emerald-500"
                  />
                </div>

                {/* Auto Calculated Balance Amount info */}
                <div>
                  <label className="block text-[10px] font-mono text-slate-500 uppercase tracking-widest mb-1">4. Balance Amount (మిగిలిన అమౌంట్ - ఆటోమేటిక్) (₹)</label>
                  <div className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-400 font-mono select-none">
                    {getIndianRupees(Math.max(0, txnTotal - txnReceived))}
                  </div>
                </div>
              </div>

              {/* Transaction Notes */}
              <div>
                <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-widest mb-1">Notes / Project Scope</label>
                <input
                  type="text"
                  placeholder="e.g. Infrastructure server setup fee billing"
                  value={txnNotes}
                  onChange={(e) => setTxnNotes(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-slate-200 font-sans outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => { setIsAddingTxn(false); setEditingTxnId(null); resetForm(); }}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-350 text-xs font-sans rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-lg"
                >
                  {editingTxnId ? 'Save Changes' : 'Confirm Add Entry'}
                </button>
              </div>
            </motion.form>
          )}

          {/* TRANSACTIONS LIST */}
          {transactionsList.length === 0 ? (
            <div className="text-center py-8 text-slate-500 border border-dashed border-slate-800 rounded-xl">
              <FileText className="w-8 h-8 text-slate-600 mx-auto mb-2" />
              <p className="text-xs font-mono">No funding transactions logged for this employee this month.</p>
              {canControl && (
                <button 
                  onClick={() => setIsAddingTxn(true)}
                  className="text-xs text-emerald-400 hover:underline mt-2 font-semibold"
                >
                  Create initial transaction entry
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {transactionsList.map((txn, index) => {
                const autoBalance = Math.max(0, txn.totalFunding - txn.receivedAmount);
                return (
                  <div
                    key={txn.id}
                    className="p-4 bg-slate-950 border border-slate-850 rounded-xl relative hover:border-slate-800 transition-colors"
                  >
                    {/* Top Row: Date, Notes & Actions */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-900 pb-2 mb-3">
                      <div>
                        <span className="px-2 py-0.5 bg-emerald-950 text-emerald-400 border border-emerald-500/20 text-[9px] font-mono rounded font-semibold whitespace-nowrap">
                          {txn.date}
                        </span>
                        {txn.notes && (
                          <p className="font-sans text-xs text-slate-300 mt-1">{txn.notes}</p>
                        )}
                      </div>

                      {/* Management Edit operations */}
                      <div className="flex items-center gap-2 shrink-0">
                        {isProprietor ? (
                          <button
                            onClick={() => handleProprietorApprovalToggle(txn.id)}
                            className={`flex items-center gap-1 px-2 py-0.5 rounded text-[9px] font-mono leading-none border transition-colors ${
                              txn.proprietorApproved 
                                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                                : 'bg-slate-900 text-slate-500 border-slate-800 hover:text-slate-300'
                            }`}
                            title="Toggle Proprietor Final Approval"
                          >
                            {txn.proprietorApproved ? <CheckCircle className="w-3 h-3" /> : <div className="w-3 h-3 rounded-full border border-slate-600" />}
                            {txn.proprietorApproved ? 'Proprietor Approved' : 'Click to Approve'}
                          </button>
                        ) : (
                          <span className={`flex items-center gap-1 px-2 py-0.5 rounded text-[9px] font-mono leading-none border ${
                            txn.proprietorApproved 
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                              : 'bg-slate-900 text-slate-550 border-slate-850'
                          }`}>
                            {txn.proprietorApproved ? <CheckCircle className="w-3 h-3" /> : <XSquare className="w-3 h-3" />}
                            {txn.proprietorApproved ? 'Approved by Proprietor' : 'Awaiting Prop Approval'}
                          </span>
                        )}

                        {canControl && (
                          <div className="flex items-center gap-1.5 border-l border-slate-850 pl-2">
                            <button
                              onClick={() => handleEditTransaction(txn)}
                              className="p-1 hover:bg-slate-900 rounded text-slate-400 hover:text-emerald-400 transition-colors"
                              title="Edit Entry"
                            >
                              <Pencil className="w-3 h-3" />
                            </button>
                            <button
                              onClick={() => handleDeleteTransaction(txn.id)}
                              className="p-1 hover:bg-slate-900 rounded text-slate-400 hover:text-pink-500 transition-colors"
                              title="Delete Entry"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                    {/* Funding Details Matrix - EXACTLY the 4 requested items */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-slate-900/60 p-3 rounded-lg border border-slate-900 font-mono">
                      <div>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-tight">
                          1. Total Funding Amount (మొత్తం ఫండింగ్)
                        </p>
                        <p className="text-base font-bold text-slate-100 mt-1">
                          {getIndianRupees(txn.totalFunding)}
                        </p>
                        <span className="text-[8px] text-slate-500 font-mono">Total capital pool</span>
                      </div>

                      <div>
                        <p className="text-[10px] text-purple-400 font-bold uppercase tracking-widest leading-tight">
                          2. Balance Funding Amount (మిగిలిన ఫండింగ్)
                        </p>
                        <p className="text-base font-bold text-purple-300 mt-1">
                          {getIndianRupees(txn.balanceEmployeeFunding)}
                        </p>
                        <span className="text-[8px] text-slate-500 font-mono">Unallocated buffer</span>
                      </div>

                      <div 
                        className="p-1.5 rounded cursor-pointer bg-slate-950 hover:bg-slate-900 border border-emerald-500/30 transition-all group/rec"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (expandedTxnId === txn.id) {
                            setExpandedTxnId(null);
                          } else {
                            setExpandedTxnId(txn.id);
                            setNewPayDate(new Date().toISOString().split('T')[0]);
                            setNewPayAmount(0);
                            setNewPayNotes('');
                          }
                        }}
                        title="Click to view Date-wise Received Amount details"
                      >
                        <p className="text-[10px] text-emerald-400 font-bold uppercase tracking-widest leading-tight group-hover/rec:underline flex items-center gap-1">
                          3. Total Received Amount (మొత్తం వచ్చింది) ⓘ
                        </p>
                        <p className="text-base font-extrabold text-emerald-400 mt-0.5 transition-transform group-hover/rec:scale-[1.02]">
                          {getIndianRupees(txn.receivedAmount)}
                        </p>
                        <span className="text-[8px] text-emerald-600/75 font-mono">Click to view dates</span>
                      </div>

                      <div>
                        <p className="text-[10px] text-amber-400 font-bold uppercase tracking-widest leading-tight">
                          4. Balance Amount (మిగిలిన అమౌంట్)
                        </p>
                        <p className="text-base font-bold text-amber-400 mt-1">
                          {getIndianRupees(autoBalance)}
                        </p>
                        <span className="text-[8px] text-slate-500 font-mono">Total - Total Received (Auto)</span>
                      </div>
                    </div>

                    {/* Expandable Date-wise Payments Details Accordion */}
                    {expandedTxnId === txn.id && (() => {
                      const payments = getTxnPayments(txn);
                      const sortedPayments = [...payments].sort((a, b) => a.date.localeCompare(b.date));
                      let accumPaid = 0;
                      const paymentsWithBalance = sortedPayments.map(p => {
                        accumPaid += p.amount;
                        const currBalance = Math.max(0, txn.totalFunding - accumPaid);
                        return { ...p, cumulativePaid: accumPaid, runningBalance: currBalance };
                      });

                      return (
                        <div className="mt-3.5 p-4 bg-slate-900/50 border border-slate-800 rounded-xl space-y-4">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 border-b border-slate-800 pb-2">
                            <div>
                              <h5 className="text-[11px] font-mono font-bold text-emerald-400 uppercase tracking-widest flex items-center gap-1">
                                <Coins className="w-3.5 h-3.5 text-emerald-500" /> Received Amount Details (తేదీల వారీగా చెల్లింపు వివరాలు)
                              </h5>
                              <p className="text-[10px] text-slate-400 font-mono mt-0.5">Click "Add" below to log multiple payment dates for this funding slot.</p>
                            </div>
                            <span className="text-[10px] text-slate-400 font-mono font-bold px-2 py-0.5 bg-slate-900 rounded border border-slate-800">
                              Total Funding: {getIndianRupees(txn.totalFunding)}
                            </span>
                          </div>

                          {/* Chronological Table of Payments */}
                          {paymentsWithBalance.length === 0 ? (
                            <div className="text-center py-4 text-slate-500 font-mono text-xs">
                              No date-wise receipt logs created yet.
                            </div>
                          ) : (
                            <div className="space-y-2 max-h-[250px] overflow-y-auto custom-scrollbar">
                              <div className="grid grid-cols-12 gap-2 text-[9px] text-slate-500 uppercase font-bold px-2.5 py-1">
                                <span className="col-span-3">Payment Date</span>
                                <span className="col-span-5">Remarks/Notes</span>
                                <span className="col-span-4 text-right">Received & Balance</span>
                              </div>
                              {paymentsWithBalance.map((p, idx) => (
                                <div 
                                  key={p.id || idx}
                                  className="grid grid-cols-12 gap-2 text-xs py-2 px-2.5 rounded-lg bg-slate-950/80 border border-slate-900 hover:border-slate-850 items-center transition-colors"
                                >
                                  <div className="col-span-3 font-semibold text-slate-200">{p.date}</div>
                                  <div className="col-span-5 text-slate-350 truncate">
                                    <span className="font-sans font-medium text-[11px] block text-slate-400">
                                      {p.notes || <span className="text-slate-600 italic">No notes recorded</span>}
                                    </span>
                                  </div>
                                  <div className="col-span-4 flex items-center justify-end gap-2 shrink-0">
                                    <div className="text-right">
                                      <p className="text-emerald-400 font-extrabold text-[11px]">{getIndianRupees(p.amount)}</p>
                                      <p className="text-[9px] text-slate-500 font-mono">Bal: {getIndianRupees(p.runningBalance)}</p>
                                    </div>

                                    {canControl && (
                                      <button
                                        type="button"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          if (!window.confirm("Are you sure you want to delete this payment milestone?")) return;
                                          const updatedPayments = payments.filter(item => item.id !== p.id);
                                          updateTxnPayments(txn.id, updatedPayments);
                                        }}
                                        className="p-1 hover:bg-slate-900 rounded text-slate-500 hover:text-pink-500 transition-colors ml-1"
                                        title="Delete payment"
                                      >
                                        <Trash2 className="w-3.5 h-3.5" />
                                      </button>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                          {canControl && (
                            <div className="bg-slate-950/45 p-3 rounded-lg border border-slate-900 space-y-3">
                              <div className="flex items-center justify-between border-b border-slate-900 pb-1.5 mb-1">
                                <h6 className="text-[10px] font-mono font-bold text-slate-350 uppercase tracking-widest">
                                  ➕ Add New payment (కొత్త పేమెంట్ జోడించండి)
                                </h6>
                                <span className="text-[8px] text-emerald-500 font-mono font-bold bg-emerald-950/50 px-1.5 py-0.5 rounded uppercase">Management Override</span>
                              </div>
                              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                                <div>
                                  <label className="block text-[9px] font-mono text-slate-500 uppercase tracking-wider mb-1">Payment Date</label>
                                  <input 
                                    type="date"
                                    value={newPayDate}
                                    onChange={(e) => setNewPayDate(e.target.value)}
                                    className="w-full bg-slate-900 border border-slate-800 rounded px-2 py-1 text-xs text-slate-300 font-mono focus:border-emerald-500 outline-none"
                                  />
                                </div>
                                <div>
                                  <label className="block text-[9px] font-mono text-slate-500 uppercase tracking-wider mb-1">Paid Amount (₹)</label>
                                  <input 
                                    type="number"
                                    placeholder="e.g. 10000"
                                    value={newPayAmount || ''}
                                    onChange={(e) => setNewPayAmount(Number(e.target.value))}
                                    className="w-full bg-slate-900 border border-slate-800 rounded px-2 py-1 text-xs text-slate-300 font-mono focus:border-emerald-500 outline-none"
                                  />
                                </div>
                                <div>
                                  <label className="block text-[9px] font-mono text-slate-500 uppercase tracking-wider mb-1">Remarks / Note</label>
                                  <input 
                                    type="text"
                                    placeholder="e.g. Second instalment paid"
                                    value={newPayNotes}
                                    onChange={(e) => setNewPayNotes(e.target.value)}
                                    className="w-full bg-slate-900 border border-slate-800 rounded px-2 py-1 text-xs text-slate-300 focus:border-emerald-500 outline-none"
                                  />
                                </div>
                              </div>
                              <div className="flex justify-end pt-1">
                                <button
                                  type="button"
                                  onClick={() => {
                                    if (newPayAmount <= 0) {
                                      alert("Please enter a valid positive payment amount.");
                                      return;
                                    }
                                    const newPayItem: PaymentItem = {
                                      id: `pay_${Date.now()}`,
                                      date: newPayDate,
                                      amount: newPayAmount,
                                      notes: newPayNotes.trim()
                                    };
                                    const updatedPayments = [...payments, newPayItem];
                                    updateTxnPayments(txn.id, updatedPayments);
                                    
                                    // Reset mini fields
                                    setNewPayAmount(0);
                                    setNewPayNotes('');
                                  }}
                                  className="px-3 py-1 bg-emerald-700 hover:bg-emerald-600 font-sans font-bold text-[10px] text-white rounded transition-colors"
                                >
                                  Add Payment Entry
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })()}

                    {/* Employee Yes/No Option (Only Employees can input, Prop/Manager view the response) */}
                    <div className="mt-4 pt-3 border-t border-slate-900 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-1.5 text-xs text-slate-400 font-mono">
                        <span>Staff Ledger Confirmation:</span>
                        {/* If matching current employee, they can select Yes or No */}
                        {currentUser.role === 'employee' && currentUser.id === selectedEmployee.id ? (
                          <div className="flex items-center gap-1.5 ml-2">
                            <span className="text-[10px] text-sky-400 blink">REQUIRED Confirmation :</span>
                            <button
                              onClick={() => {
                                // Save confirmation locally
                                const updated = funding.map(m => {
                                  if (m.id === selectedMonthId) {
                                    const empFund = m.employeeFundings[selectedEmployeeId];
                                    if (empFund) {
                                      const updatedTxns = empFund.transactions.map(t => {
                                        if (t.id === txn.id) {
                                          // employee confirmation can be represented in notes or customized fields. Let's add confirmation tracking!
                                          return { ...t, employeeConfirmation: 'Yes' };
                                        }
                                        return t;
                                      });
                                      return {
                                        ...m,
                                        employeeFundings: {
                                          ...m.employeeFundings,
                                          [selectedEmployeeId]: { ...empFund, transactions: updatedTxns }
                                        }
                                      };
                                    }
                                  }
                                  return m;
                                });
                                onUpdateFunding(updated);
                              }}
                              className={`px-3 py-1 text-[11px] font-sans font-semibold rounded-md border flex items-center gap-1 transition-colors ${
                                //@ts-ignore
                                txn.employeeConfirmation === 'Yes'
                                  ? 'bg-emerald-500/25 border-emerald-500 text-emerald-300'
                                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-emerald-500/50 hover:text-emerald-400'
                              }`}
                            >
                              <Check className="w-3.5 h-3.5" />
                              Yes
                            </button>
                            <button
                              onClick={() => {
                                const updated = funding.map(m => {
                                  if (m.id === selectedMonthId) {
                                    const empFund = m.employeeFundings[selectedEmployeeId];
                                    if (empFund) {
                                      const updatedTxns = empFund.transactions.map(t => {
                                        if (t.id === txn.id) {
                                          return { ...t, employeeConfirmation: 'No' };
                                        }
                                        return t;
                                      });
                                      return {
                                        ...m,
                                        employeeFundings: {
                                          ...m.employeeFundings,
                                          [selectedEmployeeId]: { ...empFund, transactions: updatedTxns }
                                        }
                                      };
                                    }
                                  }
                                  return m;
                                });
                                onUpdateFunding(updated);
                              }}
                              className={`px-3 py-1 text-[11px] font-sans font-semibold rounded-md border flex items-center gap-1 transition-colors ${
                                //@ts-ignore
                                txn.employeeConfirmation === 'No'
                                  ? 'bg-pink-500/25 border-pink-500 text-pink-300'
                                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-pink-500/50 hover:text-pink-400'
                              }`}
                            >
                              <X className="w-3.5 h-3.5" />
                              No
                            </button>
                          </div>
                        ) : (
                          // For other roles, just inspect confirmation status
                          //@ts-ignore
                          txn.employeeConfirmation ? (
                            //@ts-ignore
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded font-bold text-[10px] uppercase tracking-wider ${
                              //@ts-ignore
                              txn.employeeConfirmation === 'Yes' 
                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/10' 
                                : 'bg-pink-500/10 text-pink-400 border border-pink-500/10'
                            }`}>
                              {/* @ts-ignore */}
                              {txn.employeeConfirmation === 'Yes' ? 'Employee Confirmed (YES)' : 'Employee Reported Discrepancy (NO)'}
                            </span>
                          ) : (
                            <span className="text-[10px] text-slate-600 font-mono italic">Awaiting staff confirmation</span>
                          )
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )})()}
      {/* Date-wise Received Breakdown Modal Backdrop */}
      <AnimatePresence>
        {receivedBreakdown && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden relative z-50"
            >
              {/* Modal Header */}
              <div className="bg-slate-950 px-5 py-4 border-b border-slate-800 flex items-center justify-between">
                <div>
                  <h3 className="font-sans font-bold text-slate-100 text-sm">
                    {receivedBreakdown.title}
                  </h3>
                  <p className="text-[10px] font-mono text-slate-400 mt-0.5 uppercase tracking-wider">Date-wise received payment amounts</p>
                </div>
                <button
                  type="button"
                  onClick={() => setReceivedBreakdown(null)}
                  className="p-1 px-2.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-lg text-slate-400 hover:text-slate-100 transition-colors text-xs font-mono font-bold"
                >
                  ✕
                </button>
              </div>

              {/* Modal Content */}
              <div className="p-5 max-h-[350px] overflow-y-auto space-y-3.5 custom-scrollbar font-mono text-left">
                {receivedBreakdown.transactions.length === 0 ? (
                  <p className="text-xs text-slate-500 text-center py-6">No received amounts recorded for this selection.</p>
                ) : (
                  <div className="space-y-2">
                    <div className="grid grid-cols-12 gap-2 text-[9px] text-slate-500 uppercase font-bold pb-2 border-b border-slate-850 px-2">
                      <div className="col-span-3">Date</div>
                      <div className="col-span-5">{receivedBreakdown.transactions[0].employeeName ? 'Staff Member' : 'Remarks/Notes'}</div>
                      <div className="col-span-4 text-right">Received Amount</div>
                    </div>
                    {receivedBreakdown.transactions.map((t, idx) => (
                      <div 
                        key={idx} 
                        className="grid grid-cols-12 gap-2 text-xs py-2 px-2 rounded hover:bg-slate-950 border-b border-slate-900/40 items-center transition-colors"
                      >
                        <div className="col-span-3 font-semibold text-slate-350">{t.date}</div>
                        <div className="col-span-5 text-[11px] text-slate-300 truncate font-sans">
                          {t.employeeName ? (
                            <span className="font-semibold text-slate-200">{t.employeeName}</span>
                          ) : (
                            <span className="text-slate-400 italic font-medium">"{t.notes || 'Disbursed'}"</span>
                          )}
                        </div>
                        <div className="col-span-4 text-right font-bold text-emerald-400">
                          {getIndianRupees(t.amount)}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="bg-slate-950/80 px-5 py-3.5 border-t border-slate-850 flex items-center justify-between text-xs font-mono">
                <span className="text-slate-500">Accumulated Received</span>
                <span className="font-extrabold text-emerald-400 text-sm">
                  {getIndianRupees(receivedBreakdown.transactions.reduce((sum, t) => sum + t.amount, 0))}
                </span>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

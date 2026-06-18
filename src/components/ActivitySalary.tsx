/**
 * @license
 * SPDX-License-Identifier: Apache-2.5
 */

import React, { useState } from 'react';
import { MonthlySalary, Person, SalaryRecord } from '../types';
import { 
  Building2, Calendar, ChevronRight, CheckCircle, ArrowLeft, 
  HelpCircle, ShieldCheck, FileSpreadsheet, Lock, AlertCircle, Edit, Trash2, Check, X,
  IndianRupee, TrendingUp, ShieldAlert, FileText, User
} from 'lucide-react';
import { motion } from 'motion/react';

interface ActivitySalaryProps {
  salaries: MonthlySalary[];
  people: Person[];
  currentUser: Person;
  onUpdateSalaries: (updatedSalaries: MonthlySalary[]) => void;
}

export function ActivitySalary({ salaries, people, currentUser, onUpdateSalaries }: ActivitySalaryProps) {
  // Navigation states:
  // 'months' -> Show grid/list of months
  // 'employees' -> Clicked a month, see employee wise list
  // 'details' -> Clicked an employee, see their detailed salary card and confirm options
  const [navState, setNavState] = useState<'months' | 'employees' | 'details'>('months');
  const [selectedMonthId, setSelectedMonthId] = useState<string>('');
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>('');

  // Form edit states for details view
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [editAmount, setEditAmount] = useState<number>(0);
  const [editIncentive, setEditIncentive] = useState<number>(0);
  const [editStatus, setEditStatus] = useState<'Credited' | 'Pending'>('Pending');
  const [editNotes, setEditNotes] = useState<string>('');
  const [editCreditedDate, setEditCreditedDate] = useState<string>('');

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

  const canControl = currentUser.role === 'proprietor' || currentUser.role === 'manager' || currentUser.role === 'team_leader';
  const isProprietor = currentUser.role === 'proprietor';

  const selectedMonth = salaries.find(s => s.id === selectedMonthId);
  const selectedEmployee = people.find(p => p.id === selectedEmployeeId);

  // Get active record for selected month + employee
  const getActiveRecord = (): SalaryRecord | undefined => {
    if (!selectedMonth || !selectedEmployeeId) return undefined;
    return selectedMonth.salaries[selectedEmployeeId] || null;
  };

  const getIndianRupees = (val: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(val);
  };

  // Calculations for static counters including incentives
  const getMonthSalaryStats = (m: MonthlySalary) => {
    let total = 0;
    let credited = 0;
    let pending = 0;
    Object.values(m.salaries).forEach(record => {
      const gross = record.amount + (record.incentive || 0);
      total += gross;
      if (record.status === 'Credited') {
        credited += gross;
      } else {
        pending += gross;
      }
    });

    return { total, credited, pending };
  };

  // Employee click handler - directly edit row in list if authorized
  const handleStartEdit = (record: SalaryRecord) => {
    if (!canControl) return;
    setIsEditing(true);
    setEditAmount(record.amount);
    setEditIncentive(record.incentive || 0);
    setEditStatus(record.status);
    setEditNotes(record.notes || '');
    setEditCreditedDate(record.creditedDate || '');
  };

  const handleSaveEdit = () => {
    if (!selectedMonthId || !selectedEmployeeId) return;

    const updated = salaries.map(m => {
      if (m.id === selectedMonthId) {
        const currentRecord = m.salaries[selectedEmployeeId] || {
          employeeId: selectedEmployeeId,
          amount: 0,
          incentive: 0,
          status: 'Pending',
          employeeConfirmation: null,
          proprietorApproved: false,
          lastUpdated: ''
        };

        return {
          ...m,
          salaries: {
            ...m.salaries,
            [selectedEmployeeId]: {
              ...currentRecord,
              amount: editAmount,
              incentive: editIncentive,
              status: editStatus,
              notes: editNotes,
              creditedDate: editStatus === 'Credited' ? (editCreditedDate || new Date().toISOString().split('T')[0]) : '',
              lastUpdated: new Date().toISOString().split('T')[0]
            }
          }
        };
      }
      return m;
    });

    onUpdateSalaries(updated);
    setIsEditing(false);
  };

  // Proprietor Approval toggling
  const handleProprietorApprovalToggle = () => {
    if (!isProprietor || !selectedMonthId || !selectedEmployeeId) return;

    const updated = salaries.map(m => {
      if (m.id === selectedMonthId) {
        const currentRecord = m.salaries[selectedEmployeeId];
        if (currentRecord) {
          return {
            ...m,
            salaries: {
              ...m.salaries,
              [selectedEmployeeId]: {
                ...currentRecord,
                proprietorApproved: !currentRecord.proprietorApproved
              }
            }
          };
        }
      }
      return m;
    });

    onUpdateSalaries(updated);
  };

  // Employee "Yes / No" confirmation toggle
  const handleEmployeeConfirmation = (yesNo: 'Yes' | 'No') => {
    if (currentUser.role !== 'employee' || !selectedMonthId) return;

    const updated = salaries.map(m => {
      if (m.id === selectedMonthId) {
        const currentRecord = m.salaries[currentUser.id] || {
          employeeId: currentUser.id,
          amount: 30000,
          incentive: 0,
          status: 'Pending',
          employeeConfirmation: null,
          proprietorApproved: false,
          lastUpdated: ''
        };

        return {
          ...m,
          salaries: {
            ...m.salaries,
            [currentUser.id]: {
              ...currentRecord,
              employeeConfirmation: yesNo,
              lastUpdated: new Date().toISOString().split('T')[0]
            }
          }
        };
      }
      return m;
    });

    onUpdateSalaries(updated);
  };

  const handleMonthClick = (mId: string) => {
    setSelectedMonthId(mId);
    if (currentUser.role === 'employee') {
      setSelectedEmployeeId(currentUser.id);
      setNavState('details');
    } else {
      setNavState('employees');
    }
  };

  const handleEmployeeClick = (empId: string) => {
    setSelectedEmployeeId(empId);
    setNavState('details');
    setIsEditing(false);
  };

  const activeRecord = getActiveRecord();

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6" id="salary-sheet-view">
      {/* breadcrumb navigation and Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 mb-6 border-b border-slate-800">
        <div>
          <h2 className="text-lg font-sans font-semibold text-slate-100 flex items-center gap-2">
            <Building2 className="w-5 h-5 text-amber-500" />
            Jayanthi Associate Salary Ledgers
          </h2>
          <div className="flex items-center gap-1.5 text-xs text-slate-400 font-mono mt-1">
            <span className="cursor-pointer hover:text-amber-500 transition-colors" onClick={() => setNavState('months')}>Months</span>
            {navState !== 'months' && (
              <>
                <ChevronRight className="w-3 h-3 text-slate-600" />
                <span className="cursor-pointer hover:text-amber-500 transition-colors inline-block max-w-[80px] truncate" onClick={() => {
                  if (currentUser.role === 'employee') return;
                  setNavState('employees');
                }}>{selectedMonth?.monthName}</span>
              </>
            )}
            {navState === 'details' && (
              <>
                <ChevronRight className="w-3 h-3 text-slate-600" />
                <span className="text-amber-500 font-medium truncate inline-block max-w-[100px]">{selectedEmployee?.name}</span>
              </>
            )}
          </div>
        </div>

        {currentUser.role === 'employee' && (
          <span className="text-[10px] bg-slate-950 text-slate-400 border border-slate-800 p-1 px-2.5 rounded-full font-mono font-medium self-start sm:self-auto">
            Personal Account
          </span>
        )}
      </div>

      {/* STEP 1: MONTH-WISE SALARY LEDGERS */}
      {navState === 'months' && (
        <div className="space-y-4" id="salary-step-months">
          {canControl && (
            <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl space-y-3 mb-2">
              <h3 className="text-xs font-mono uppercase tracking-wider text-slate-350 font-semibold flex items-center gap-2">
                <Calendar className="w-4 h-4 text-amber-500" />
                Initialize New Month Salary Ledger
              </h3>
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-2">
                  <label className="text-[10px] font-mono text-slate-400 uppercase">Year:</label>
                  <select
                    value={newLedgerYear}
                    onChange={(e) => setNewLedgerYear(e.target.value)}
                    className="bg-slate-900 border border-slate-800 text-xs font-mono text-slate-100 rounded px-2 text-center py-1 outline-none focus:border-amber-500"
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
                    className="bg-slate-900 border border-slate-800 text-xs font-mono text-slate-100 rounded px-2.5 py-1 outline-none focus:border-amber-500"
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
                    if (salaries.some(s => s.id === monthId)) {
                      alert("A salary ledger for this year/month already exists!");
                      return;
                    }

                    const monthLabel = MONTHS_LIST.find(m => m.value === newLedgerMonth)?.label + ' ' + newLedgerYear;

                    const initialMonthSalaries: { [employeeId: string]: SalaryRecord } = {};
                    people.filter(p => p.role === 'employee').forEach(emp => {
                      initialMonthSalaries[emp.id] = {
                        employeeId: emp.id,
                        amount: 32000,
                        incentive: 0,
                        status: 'Pending',
                        employeeConfirmation: null,
                        proprietorApproved: false,
                        lastUpdated: new Date().toISOString().split('T')[0]
                      };
                    });

                    const newLedger: MonthlySalary = {
                      id: monthId,
                      monthName: monthLabel,
                      salaries: initialMonthSalaries
                    };

                    const updated = [newLedger, ...salaries].sort((a, b) => b.id.localeCompare(a.id));
                    onUpdateSalaries(updated);
                  }}
                  className="px-3 py-1 bg-amber-600 hover:bg-amber-500 rounded text-slate-100 text-xs font-semibold font-sans transition-colors shrink-0 cursor-pointer"
                >
                  Create Ledger
                </button>
              </div>
            </div>
          )}

          <p className="text-xs text-slate-400 mb-2">Select a month to view associated staff salaries allocations.</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {salaries.map((m) => {
              const stats = getMonthSalaryStats(m);

              return (
                <div
                  key={m.id}
                  onClick={() => handleMonthClick(m.id)}
                  className="bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-amber-500/50 rounded-xl p-4 cursor-pointer transition-all duration-150 flex items-center justify-between relative group"
                >
                  <div className="space-y-1.5 w-full mr-2">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-amber-500" />
                      <h3 className="font-sans font-semibold text-sm text-slate-100">{m.monthName}</h3>
                    </div>
                    <div className="grid grid-cols-3 gap-2 pt-1 font-mono w-full">
                      <div>
                        <p className="text-[9px] text-slate-500 uppercase tracking-widest font-semibold">Total Gross</p>
                        <p className="text-xs font-semibold text-slate-300 mt-0.5">{getIndianRupees(stats.total)}</p>
                      </div>
                      <div>
                        <p className="text-[9px] text-emerald-500 uppercase tracking-widest font-semibold">Credited</p>
                        <p className="text-xs font-semibold text-emerald-400 mt-0.5">{getIndianRupees(stats.credited)}</p>
                      </div>
                      <div>
                        <p className="text-[9px] text-amber-500 uppercase tracking-widest font-semibold">Pending</p>
                        <p className="text-xs font-semibold text-amber-400 mt-0.5">{getIndianRupees(stats.pending)}</p>
                      </div>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-slate-600 group-hover:text-amber-500 group-hover:translate-x-0.5 transition-all shrink-0" />
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* STEP 2: LIST EMPLOYEES WITHIN SELECTED MONTH */}
      {navState === 'employees' && selectedMonth && (
        <div id="salary-step-employees" className="space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <button
              onClick={() => setNavState('months')}
              className="p-1.5 bg-slate-950 border border-slate-800 hover:bg-slate-850 rounded-lg text-slate-400 hover:text-slate-200 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <h3 className="font-sans font-semibold text-sm text-slate-300">
              Staff Payouts for <span className="text-amber-500 font-bold">{selectedMonth.monthName}</span>
            </h3>
          </div>

          {/* Current Month Salary Aggregate Counters */}
          {(() => {
            const stats = getMonthSalaryStats(selectedMonth);
            return (
              <div className="flex flex-col gap-3 mb-4 bg-slate-950 border border-slate-800 p-4 rounded-xl font-mono">
                <div className="flex items-center justify-between border-b border-slate-800/50 pb-2">
                  <span className="text-xs text-slate-500 uppercase tracking-widest font-semibold">Total Net Allocated</span>
                  <span className="text-sm sm:text-base font-bold text-slate-100">{getIndianRupees(stats.total)}</span>
                </div>
                <div className="flex items-center justify-between border-b border-slate-800/50 pb-2">
                  <span className="text-xs text-emerald-400 uppercase tracking-widest font-semibold">Credited To Bank</span>
                  <span className="text-sm sm:text-base font-bold text-emerald-400">{getIndianRupees(stats.credited)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-amber-400 uppercase tracking-widest font-semibold">Awaiting Credit (Pending)</span>
                  <span className="text-sm sm:text-base font-bold text-amber-400">{getIndianRupees(stats.pending)}</span>
                </div>
              </div>
            );
          })()}

          <p className="text-xs text-slate-500 mb-3 font-mono">Click on any particular employee below to inspect and approve their monthly salary details.</p>

          <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
            {people.filter(p => p.role === 'employee').map((emp) => {
              const record = selectedMonth.salaries[emp.id] || {
                employeeId: emp.id,
                amount: 0,
                incentive: 0,
                status: 'Pending',
                employeeConfirmation: null,
                proprietorApproved: false,
                lastUpdated: ''
              };

              const grossTotal = record.amount + (record.incentive || 0);

              return (
                <div
                  key={emp.id}
                  onClick={() => handleEmployeeClick(emp.id)}
                  className="p-3 bg-slate-950 hover:bg-slate-800/80 border border-slate-850 hover:border-amber-500/30 rounded-xl flex items-center justify-between cursor-pointer transition-all duration-120 group"
                >
                  <div className="flex items-center gap-3">
                    <img 
                      src={emp.photoUrl} 
                      alt={emp.name} 
                      className="w-10 h-10 object-cover rounded-lg border border-slate-800 shrink-0"
                      referrerPolicy="no-referrer"
                    />
                    <div>
                      <h4 className="font-sans font-semibold text-slate-200 text-xs sm:text-sm">{emp.name}</h4>
                      <p className="text-[10px] text-slate-400 font-mono mt-0.5">{emp.designation}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 shrink-0 font-mono">
                    <div className="text-right">
                      <p className="text-[8px] text-slate-500 uppercase">Payout</p>
                      <p className="text-xs font-bold text-slate-100">{getIndianRupees(grossTotal)}</p>
                    </div>

                    {record.status === 'Credited' ? (
                      <span className="px-2 py-1 rounded bg-emerald-500/10 text-emerald-400 text-[10px] leading-none border border-emerald-500/20 shrink-0">
                        Credited
                      </span>
                    ) : (
                      <span className="px-2 py-1 rounded bg-amber-500/10 text-amber-500 text-[10px] leading-none border border-amber-500/20 shrink-0 animate-pulse">
                        Pending
                      </span>
                    )}
                    <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-amber-500 group-hover:translate-x-0.5 transition-all shrink-0" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* STEP 3: INDIVIDUAL EMPLOYEE SALARY DETAIL AND MASTER SIGNOFF */}
      {navState === 'details' && selectedMonth && selectedEmployee && activeRecord && (
        <div id="salary-step-details" className="space-y-4">
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-800/65">
            <div className="flex items-center gap-2">
              {currentUser.role !== 'employee' && (
                <button
                  onClick={() => { setNavState('employees'); setIsEditing(false); }}
                  className="p-1.5 bg-slate-950 border border-slate-800 hover:bg-slate-850 rounded-lg text-slate-400 hover:text-slate-200 transition-colors shrink-0"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
              )}
              <div className="flex items-center gap-2.5">
                <img 
                  src={selectedEmployee.photoUrl} 
                  alt="" 
                  className="w-9 h-9 rounded-full object-cover border border-slate-700 shrink-0"
                  referrerPolicy="no-referrer"
                />
                <div>
                  <h3 className="font-sans font-bold text-slate-200 text-sm leading-tight">{selectedEmployee.name}</h3>
                  <p className="text-[10px] font-mono text-slate-400">{selectedMonth.monthName} Payout Audit</p>
                </div>
              </div>
            </div>

            {currentUser.role === 'employee' && (
              <span className="text-[10px] font-mono px-2 py-0.5 bg-slate-950 border border-slate-800 text-slate-400 rounded-full">
                Viewing Personal
              </span>
            )}

            {canControl && !isEditing && (
              <button
                onClick={() => handleStartEdit(activeRecord)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-slate-100 font-sans font-medium text-xs rounded-xl transition-all shadow-md"
              >
                <Edit className="w-3.5 h-3.5" />
                Edit Record
              </button>
            )}
          </div>

          {/* EDIT FORM */}
          {isEditing && canControl ? (
            <motion.form
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              onSubmit={(e) => { e.preventDefault(); handleSaveEdit(); }}
              className="bg-slate-950 border border-amber-500/20 p-4 rounded-xl space-y-4"
            >
              <h4 className="text-xs font-mono uppercase tracking-wider text-amber-400 font-bold border-b border-slate-850 pb-2">
                Edit Payout Attributes
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-widest mb-1">
                    Base Salary Amount (₹)
                  </label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={editAmount}
                    onChange={(e) => setEditAmount(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-slate-200 font-mono outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-widest mb-1">
                    Incentive / Bonus (₹)
                  </label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={editIncentive}
                    onChange={(e) => setEditIncentive(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-teal-400 font-mono outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-widest mb-1">
                    Payment Disbursement Status
                  </label>
                  <select
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value as 'Credited' | 'Pending')}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-slate-200 font-mono outline-none focus:border-amber-500"
                  >
                    <option value="Credited">Credited (Bank Transfer Complete)</option>
                    <option value="Pending">Pending (Awaiting allocation)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-mono text-slate-500 uppercase tracking-widest mb-1">
                    Gross Calculated Total (Auto-calculated)
                  </label>
                  <div className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-slate-400 font-mono select-none">
                    {getIndianRupees(editAmount + editIncentive)}
                  </div>
                </div>
              </div>

              {editStatus === 'Credited' && (
                <div className="bg-emerald-950/20 border border-emerald-500/20 p-3 rounded-lg space-y-1.5">
                  <label className="block text-[10px] font-mono text-emerald-400 uppercase tracking-widest font-bold">
                    Salary Credited Date (శాలరీ క్రెడిట్ అయిన తేదీ)
                  </label>
                  <input
                    type="date"
                    required
                    value={editCreditedDate || new Date().toISOString().split('T')[0]}
                    onChange={(e) => setEditCreditedDate(e.target.value)}
                    className="w-full bg-slate-900 border border-emerald-500/20 rounded-lg p-2 text-xs text-emerald-350 font-mono outline-none focus:border-emerald-500"
                  />
                </div>
              )}

              <div>
                <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-widest mb-1">
                  Add Audit Remarks / Notes
                </label>
                <input
                  type="text"
                  placeholder="e.g. Cleared via SBI Corporate Netbanking"
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-slate-200 font-sans outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-350 text-xs font-sans rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold rounded-lg"
                >
                  Save Salary Record
                </button>
              </div>
            </motion.form>
          ) : (
            /* DETAILED STATIC VIEW CARD */
            <div className="space-y-4">
              {/* Core Ledger Data Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="bg-slate-950 border border-slate-850 p-4 rounded-xl font-mono text-left">
                  <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-widest leading-none">
                    1. Base Salary
                  </p>
                  <p className="text-xl font-extrabold text-slate-100 mt-2">
                    {getIndianRupees(activeRecord.amount)}
                  </p>
                  <span className="text-[9px] text-slate-600 mt-1 block">Contracted payroll rate</span>
                </div>

                <div className="bg-slate-950 border border-slate-850 p-4 rounded-xl font-mono text-left">
                  <p className="text-[10px] text-teal-400 font-semibold uppercase tracking-widest leading-none">
                    2. Incentive / Bonus
                  </p>
                  <p className="text-xl font-extrabold text-teal-400 mt-2">
                    {getIndianRupees(activeRecord.incentive || 0)}
                  </p>
                  <span className="text-[9px] text-slate-600 mt-1 block">Performance-oriented incentive</span>
                </div>

                <div className="bg-slate-950 border border-slate-850 p-4 rounded-xl font-mono text-left">
                  <p className="text-[10px] text-amber-500 font-semibold uppercase tracking-widest leading-none">
                    3. Total Gross Payout
                  </p>
                  <p className="text-xl font-extrabold text-amber-500 mt-2">
                    {getIndianRupees(activeRecord.amount + (activeRecord.incentive || 0))}
                  </p>
                  <span className="text-[9px] text-slate-600 mt-1 block">Accumulated total gross</span>
                </div>
              </div>

               {/* Status and Notes Card */}
              <div className="bg-slate-950/80 border border-slate-850 p-4 rounded-xl space-y-3.5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-900 pb-2.5">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-slate-450">
                    Disbursal Status:
                  </span>
                  <div className="flex items-center gap-2">
                    {activeRecord.status === 'Credited' && activeRecord.creditedDate && (
                      <span className="text-xs font-mono text-emerald-400 mr-2">
                        Credited Date: {activeRecord.creditedDate}
                      </span>
                    )}
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-mono font-medium ${
                      activeRecord.status === 'Credited' 
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/10' 
                        : 'bg-amber-500/10 text-amber-500 border border-amber-500/10 animate-pulse'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${activeRecord.status === 'Credited' ? 'bg-emerald-400' : 'bg-amber-400'}`} />
                      Salary {activeRecord.status}
                    </span>
                  </div>
                </div>

                {activeRecord.notes ? (
                  <div className="text-left font-sans">
                    <span className="text-[9px] font-mono text-slate-500 block uppercase">Remarks/Notes:</span>
                    <p className="text-xs text-slate-300 mt-0.5 italic">"{activeRecord.notes}"</p>
                  </div>
                ) : (
                  <div className="text-left text-[10px] font-mono text-slate-600">
                    No special ledger annotations added for this transaction.
                  </div>
                )}
                
                {activeRecord.lastUpdated && (
                  <div className="text-right text-[8px] font-mono text-slate-500">
                    Last Verified: {activeRecord.lastUpdated}
                  </div>
                )}
              </div>

              {/* ACTION: EMPLOYEE CONFIRMATION AND PROPRIETOR Master Signoff */}
              <div className="bg-gradient-to-br from-slate-950 to-slate-900 border border-slate-800 p-4 rounded-xl space-y-4 text-left">
                <h4 className="text-[10px] font-mono uppercase tracking-widest text-slate-400 font-bold border-b border-slate-850 pb-1.5">
                  Signoff & Ledger Verification
                </h4>

                <div className="flex flex-col gap-4">
                  {/* Employee confirmation input row */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                    <div>
                      <p className="font-semibold text-slate-200">Staff Confirmation</p>
                      <p className="text-[9px] text-slate-400 font-mono">Employee verifies payment receipt</p>
                    </div>

                    {currentUser.role === 'employee' && currentUser.id === selectedEmployee.id ? (
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleEmployeeConfirmation('Yes')}
                          className={`px-3 py-1 text-[11px] font-sans font-semibold rounded-md border flex items-center gap-1 transition-colors ${
                            activeRecord.employeeConfirmation === 'Yes'
                              ? 'bg-emerald-500/25 border-emerald-500 text-emerald-300'
                              : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-emerald-500/50 hover:text-emerald-400'
                          }`}
                        >
                          <Check className="w-3 h-3" />
                          Yes
                        </button>
                        <button
                          type="button"
                          onClick={() => handleEmployeeConfirmation('No')}
                          className={`px-3 py-1 text-[11px] font-sans font-semibold rounded-md border flex items-center gap-1 transition-colors ${
                            activeRecord.employeeConfirmation === 'No'
                              ? 'bg-pink-500/25 border-pink-500 text-pink-300'
                              : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-pink-500/50 hover:text-pink-400'
                          }`}
                        >
                          <X className="w-3 h-3" />
                          No
                        </button>
                      </div>
                    ) : (
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded text-xs font-mono font-medium ${
                        activeRecord.employeeConfirmation === 'Yes'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/10'
                          : activeRecord.employeeConfirmation === 'No'
                            ? 'bg-pink-500/10 text-pink-400 border border-pink-500/10'
                            : 'bg-slate-950 border border-slate-800 text-slate-500'
                      }`}>
                        {activeRecord.employeeConfirmation 
                          ? `Employee Confirmed: ${activeRecord.employeeConfirmation.toUpperCase()}` 
                          : 'Awaiting Employee Action'}
                      </span>
                    )}
                  </div>

                  {/* Proprietor Final Master Signoff row */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs pt-3.5 border-t border-slate-850">
                    <div>
                      <p className="font-semibold text-slate-200">Proprietor Master Signoff</p>
                      <p className="text-[9px] text-slate-400 font-mono">Final legal & tax approval audit seal</p>
                    </div>

                    {isProprietor ? (
                      <button
                        type="button"
                        onClick={handleProprietorApprovalToggle}
                        className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold font-sans rounded-xl border transition-all ${
                          activeRecord.proprietorApproved
                            ? 'bg-emerald-505 bg-emerald-600/30 border-emerald-500/20 text-emerald-300 shadow-md'
                            : 'bg-slate-950 border-slate-850 text-slate-400 hover:text-slate-250 hover:bg-slate-850'
                        }`}
                      >
                        {activeRecord.proprietorApproved ? <CheckCircle className="w-4 h-4 text-emerald-400" /> : <ShieldAlert className="w-4 h-4 text-slate-500" />}
                        {activeRecord.proprietorApproved ? 'Proprietor Signed Off' : 'Click to signoff ledger'}
                      </button>
                    ) : (
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-mono font-medium ${
                        activeRecord.proprietorApproved
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/10'
                          : 'bg-slate-950 border border-slate-800 text-slate-500'
                      }`}>
                        {activeRecord.proprietorApproved ? <CheckCircle className="w-3.5 h-3.5 text-emerald-400" /> : <AlertCircle className="w-3.5 h-3.5 text-slate-600" />}
                        {activeRecord.proprietorApproved ? 'Approved by Proprietor' : 'Awaiting signoff'}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

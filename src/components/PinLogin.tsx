/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Person } from '../types';
import { Lock, UserCheck, ShieldCheck, HelpCircle } from 'lucide-react';

function getInitials(name: string): string {
  if (!name) return '?';
  if (name.toUpperCase().includes('JANARDHAN')) return 'J';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + (parts[parts.length - 1]?.[0] || '')).toUpperCase();
}

function renderAvatar(photoUrl: string, name: string, sizeClasses = "w-14 h-14 rounded-2xl", textClass = "text-base") {
  return (
    <div className={`${sizeClasses} bg-slate-800 relative overflow-hidden flex items-center justify-center shrink-0 border border-slate-700`}>
      <div className={`absolute inset-0 flex items-center justify-center font-sans font-bold text-slate-400 bg-slate-900 leading-none ${textClass}`}>
        {getInitials(name)}
      </div>
      {photoUrl ? (
        <img 
          src={photoUrl} 
          alt={name} 
          className="absolute inset-0 w-full h-full object-cover z-10" 
          referrerPolicy="no-referrer" 
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).style.opacity = '0';
          }}
        />
      ) : null}
    </div>
  );
}
import { motion } from 'motion/react';

interface PinLoginProps {
  people: Person[];
  onLogin: (person: Person) => void;
}

export function PinLogin({ people, onLogin }: PinLoginProps) {
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [selectedPresetId, setSelectedPresetId] = useState<string>('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const found = people.find((p) => p.pin === pin);
    if (found) {
      setError('');
      setPin('');
      onLogin(found);
    } else {
      setError('Invalid security PIN. Please try again.');
    }
  };

  const handlePresetSelect = (id: string) => {
    const person = people.find((p) => p.id === id);
    if (person) {
      setSelectedPresetId(id);
      setPin(person.pin);
      setError('');
    }
  };

  const handleQuickLogin = (person: Person) => {
    onLogin(person);
  };

  // Group roles for quick showcase
  const admins = people.filter(p => p.role !== 'employee');
  const employees = people.filter(p => p.role === 'employee');

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 selection:bg-emerald-500 selection:text-white" id="pin-login-page">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(16,185,129,0.08),transparent_50%)] pointer-events-none" />
      
      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden relative z-10"
        id="login-card"
      >
        <div className="p-6 bg-slate-900 border-b border-slate-800 text-center relative">
          {/* Proprietor Photo as Login Header Monogram Logo */}
          <div className="mx-auto mb-3">
            {renderAvatar(people[0]?.photoUrl, people[0]?.name || 'JANARDHAN SIR', "w-16 h-16 rounded-full border-2 border-emerald-500/80 p-0.5 shadow-lg shadow-emerald-500/10", "text-lg")}
          </div>
          
          <h2 className="font-sans font-semibold tracking-tight text-xl text-slate-100 flex items-center justify-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            JAYANTHI ASSOCIATES
          </h2>
          <p className="font-mono text-xs text-slate-400 mt-1 uppercase tracking-widest">KTDM Portal Login</p>
        </div>

        <div className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="pin-input" className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Enter Security PIN
              </label>
              <div className="relative">
                <input
                  id="pin-input"
                  type="password"
                  maxLength={4}
                  placeholder="••••"
                  value={pin}
                  onChange={(e) => {
                    setPin(e.target.value.replace(/\D/g, ''));
                    setError('');
                  }}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors py-3 px-10 text-center text-2xl font-mono tracking-[0.75em] text-emerald-400 rounded-xl outline-none"
                  autoFocus
                />
                <div className="absolute left-3 top-3.5 text-slate-600">
                  <Lock className="w-5 h-5" />
                </div>
              </div>
            </div>

            {error && (
              <p className="text-pink-400 text-xs font-mono text-center" id="login-error-msg">
                {error}
              </p>
            )}

            <button
              id="login-submit-btn"
              type="submit"
              disabled={pin.length !== 4}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-800 disabled:text-slate-600 transition-colors text-slate-100 font-sans font-medium text-sm tracking-wide rounded-xl shadow-lg shadow-emerald-900/10 active:scale-[0.99] flex items-center justify-center gap-2"
            >
              <UserCheck className="w-4 h-4" />
              Sign In
            </button>
          </form>

          {/* Quick Demo Switcher - Essential for instant multi-role testing */}
          <div className="mt-6 pt-5 border-t border-slate-800">
            <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest flex items-center gap-1.5 mb-3 justify-center">
              <HelpCircle className="w-3.5 h-3.5 text-slate-500" />
              Quick Demo Accounts for Testing
            </span>

            <div className="space-y-3">
              <div>
                <h4 className="text-[11px] font-semibold text-emerald-400 tracking-wider uppercase mb-1.5">Management (Data Entry &amp; Approval)</h4>
                <div className="grid grid-cols-3 gap-1.5">
                  {admins.map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => handleQuickLogin(p)}
                      className="p-2 bg-slate-950 hover:bg-slate-800 hover:border-emerald-500 border border-slate-800 rounded-lg text-left transition-all duration-150 relative group"
                    >
                      <div className="flex items-center gap-1.5 overflow-hidden">
                        {renderAvatar(p.photoUrl, p.name, "w-5 h-5 rounded-full shrink-0", "text-[6px]")}
                        <div className="truncate">
                          <p className="text-[10px] text-slate-200 font-medium truncate leading-normal">{p.name.split(' ')[0]}</p>
                          <p className="text-[9px] text-slate-500 font-mono scale-90 origin-left mt-0.5">Role: {p.role === 'proprietor' ? 'Proprietor' : p.role === 'manager' ? 'Manager' : 'TL'}</p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-[11px] font-semibold text-sky-400 tracking-wider uppercase mb-1.5">Employees (View &amp; Confirm Yes/No)</h4>
                <div className="grid grid-cols-4 gap-1.5">
                  {employees.slice(0, 4).map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => handleQuickLogin(p)}
                      className="p-1.5 bg-slate-950 hover:bg-slate-800 hover:border-sky-500 border border-slate-800 rounded-lg text-left transition-all duration-150"
                    >
                      <p className="text-[9px] text-slate-200 font-medium truncate">{p.name.split(' ')[0]}</p>
                      <p className="text-[8px] text-slate-500 font-mono mt-0.5">Emp</p>
                    </button>
                  ))}
                  {employees.slice(4).map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => handleQuickLogin(p)}
                      className="p-1.5 bg-slate-950 hover:bg-slate-800 hover:border-sky-500 border border-slate-800 rounded-lg text-left transition-all duration-150"
                    >
                      <p className="text-[9px] text-slate-200 font-medium truncate">{p.name.split(' ')[0]}</p>
                      <p className="text-[8px] text-slate-500 font-mono mt-0.5">Emp</p>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="p-3 bg-slate-950 text-center border-t border-slate-800">
          <p className="text-[9px] font-mono text-slate-600">
            Security Protected • Proprietor JANARDHAN SIR Approved Portal
          </p>
        </div>
      </motion.div>
    </div>
  );
}

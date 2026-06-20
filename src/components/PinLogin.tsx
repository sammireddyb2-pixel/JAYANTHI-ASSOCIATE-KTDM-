/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Person } from '../types';
import { Lock, UserCheck, ShieldCheck, ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

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

interface PinLoginProps {
  people: Person[];
  onLogin: (person: Person) => void;
}

export function PinLogin({ people, onLogin }: PinLoginProps) {
  const [selectedPerson, setSelectedPerson] = useState<Person | null>(null);
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPerson) return;

    if (selectedPerson.pin === pin) {
      setError('');
      setPin('');
      onLogin(selectedPerson);
    } else {
      setError('Invalid security PIN. Please try again.');
    }
  };

  const handleSelectPerson = (person: Person) => {
    setSelectedPerson(person);
    setPin('');
    setError('');
  };

  const handleBack = () => {
    setSelectedPerson(null);
    setPin('');
    setError('');
  };

  const admins = people.filter(p => p.role !== 'employee');
  const employees = people.filter(p => p.role === 'employee');

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 selection:bg-emerald-500 selection:text-white relative" id="pin-login-page">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(16,185,129,0.06),transparent_50%)] pointer-events-none" />
      
      <AnimatePresence mode="wait">
        {!selectedPerson ? (
          <motion.div 
            key="profile-selector"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.3 }}
            className="w-full max-w-xl bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden relative z-10 p-6"
            id="profile-selector-card"
          >
            <div className="text-center pb-6 border-b border-slate-800">
              <div className="mx-auto mb-3 flex items-center justify-center">
                <div className="w-16 h-16 rounded-full border-2 border-emerald-500/80 p-1 bg-slate-900 flex items-center justify-center shadow-lg shadow-emerald-500/10">
                  <ShieldCheck className="w-8 h-8 text-emerald-400" />
                </div>
              </div>
              <h2 className="font-sans font-semibold tracking-tight text-xl text-slate-100 uppercase">
                JAYANTHI ASSOCIATES
              </h2>
              <p className="font-mono text-xs text-slate-400 mt-1 uppercase tracking-widest">KOTHAGUDEM (KTDM) PORTAL</p>
              <p className="text-[11px] text-slate-500 mt-2 font-sans font-medium">Please select your account to proceed with verification</p>
            </div>

            <div className="my-6 space-y-6 max-h-[55vh] overflow-y-auto pr-1 custom-scrollbar">
              {/* Management List */}
              <div>
                <h3 className="text-[11px] font-mono font-bold text-emerald-400 tracking-widest uppercase mb-3">Management</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {admins.map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => handleSelectPerson(p)}
                      className="p-3 bg-slate-950/40 hover:bg-slate-950 hover:border-emerald-500/60 border border-slate-850 rounded-xl text-left transition-all duration-150 flex items-center gap-3 group active:scale-[0.98]"
                    >
                      {renderAvatar(p.photoUrl, p.name, "w-10 h-10 rounded-full shrink-0 border border-slate-800 group-hover:border-emerald-500/40", "text-sm")}
                      <div className="overflow-hidden">
                        <p className="text-xs text-slate-200 font-semibold truncate group-hover:text-emerald-300">{p.name}</p>
                        <p className="text-[9px] text-slate-500 font-mono scale-95 origin-left mt-0.5 uppercase tracking-wider">
                          {p.role === 'proprietor' ? 'Proprietor' : p.role === 'manager' ? 'Manager' : 'Team Leader'}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Employees List */}
              <div>
                <h3 className="text-[11px] font-mono font-bold text-sky-450 tracking-widest uppercase mb-3">Employees / Field Staff</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {employees.map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => handleSelectPerson(p)}
                      className="p-2.5 bg-slate-950/40 hover:bg-slate-950 hover:border-sky-500/60 border border-slate-850 rounded-xl text-left transition-all duration-150 flex items-center gap-2.5 group active:scale-[0.98]"
                    >
                      {renderAvatar(p.photoUrl, p.name, "w-8 h-8 rounded-full shrink-0 border border-slate-800 group-hover:border-sky-500/40", "text-xs")}
                      <div className="overflow-hidden">
                        <p className="text-[11px] text-slate-200 font-semibold truncate group-hover:text-sky-300">{p.name}</p>
                        <p className="text-[8px] text-slate-500 font-mono scale-95 origin-left mt-0.5 uppercase tracking-wider">FOS STAFF</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="text-center pt-2 border-t border-slate-800">
              <p className="text-[9px] font-mono text-slate-600">
                Security Protected • Approved Portal System
              </p>
            </div>
          </motion.div>
        ) : (
          <motion.div 
            key="pin-input-screen"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.3 }}
            className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden relative z-10"
            id="login-card"
          >
            <div className="p-6 bg-slate-900 border-b border-slate-800 text-center relative">
              <button 
                type="button"
                onClick={handleBack}
                className="absolute left-4 top-5 p-1.5 bg-slate-950 hover:bg-slate-800 text-slate-400 hover:text-slate-100 border border-slate-800 rounded-lg transition-colors flex items-center gap-1 text-xs"
                id="back-to-profiles-btn"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Back
              </button>

              <div className="mx-auto mb-3 mt-4">
                {renderAvatar(selectedPerson.photoUrl, selectedPerson.name, "w-16 h-16 rounded-full border-2 border-emerald-500/80 p-0.5 shadow-lg shadow-emerald-500/10", "text-lg")}
              </div>
              
              <h2 className="font-sans font-semibold tracking-tight text-lg text-slate-100 mt-1">
                {selectedPerson.name}
              </h2>
              <p className="font-mono text-[9px] text-emerald-400 uppercase tracking-widest bg-slate-950 px-2 py-0.5 rounded-full inline-block mt-1 border border-emerald-950">
                {selectedPerson.role === 'proprietor' ? 'Proprietor' : selectedPerson.role === 'manager' ? 'Manager' : selectedPerson.role === 'team_leader' ? 'Team Leader' : 'Employee (FOS)'}
              </p>
            </div>

            <div className="p-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="pin-input" className="block text-xs font-semibold text-slate-450 uppercase tracking-wider mb-2 text-center">
                    Enter Your Security PIN
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
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-800 disabled:text-slate-650 transition-colors text-slate-100 font-sans font-medium text-sm tracking-wide rounded-xl shadow-lg active:scale-[0.99] flex items-center justify-center gap-2"
                >
                  <UserCheck className="w-4 h-4" />
                  Verify &amp; Sign In
                </button>
              </form>
            </div>

            <div className="p-3 bg-slate-950 text-center border-t border-slate-800 text-[9px] font-mono text-slate-605">
              Secure Gateway Access Only
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Person } from '../types';
import { X, UserPlus } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { getInitials } from './PersonDetailsModal';

interface AddEmployeeModalProps {
  onClose: () => void;
  onAdd: (newEmployee: Person) => void;
  nextPin: string;
}

export function AddEmployeeModal({ onClose, onAdd, nextPin }: AddEmployeeModalProps) {
  const [name, setName] = useState('');
  const [designation, setDesignation] = useState('Associate Staff');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [pin, setPin] = useState(nextPin);
  const [photoUrl, setPhotoUrl] = useState('');
  const [joinedDate, setJoinedDate] = useState(new Date().toISOString().split('T')[0]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const newEmp: Person = {
      id: `emp_${Date.now()}`,
      name: name.trim(),
      role: 'employee',
      pin: pin.trim() || nextPin,
      photoUrl: photoUrl.trim(), // Optional manual photo url, falls back to initials if left blank
      designation: designation.trim() || 'Associate Staff',
      phone: phone.trim() || '+91 95000 00000',
      email: email.trim() || `${name.trim().toLowerCase().replace(/\s+/g, '')}@jayanthiassoc.com`,
      joinedDate: joinedDate || new Date().toISOString().split('T')[0],
    };

    onAdd(newEmp);
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xs select-none" id="add-employee-backdrop">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl"
          id="add-employee-card"
        >
          {/* Header */}
          <div className="p-4 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
            <h3 className="font-sans font-semibold text-slate-100 flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-emerald-400" />
              Add New Employee
            </h3>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-100 p-1 hover:bg-slate-800 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {/* Visual preview of photo / fallback initials */}
            <div className="flex items-center gap-4 bg-slate-950/40 p-3 rounded-xl border border-slate-800/40">
              <div className="w-14 h-14 rounded-xl overflow-hidden bg-slate-800 relative flex items-center justify-center shrink-0 border border-slate-700">
                <div className="absolute inset-0 flex items-center justify-center font-sans font-bold text-lg text-slate-400 bg-slate-900">
                  {getInitials(name || 'New Staff')}
                </div>
                {photoUrl.trim() && (
                  <img 
                    src={photoUrl} 
                    alt="Preview" 
                    className="absolute inset-0 w-full h-full object-cover z-10"
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).style.opacity = '0';
                    }}
                  />
                )}
              </div>
              <div className="text-xs">
                <p className="text-slate-200 font-semibold font-sans">{name || 'Enter Employee Name'}</p>
                <p className="text-slate-500 font-mono text-[10px] uppercase mt-0.5">{designation || 'Associate Staff'}</p>
              </div>
            </div>

            {/* Employee Name */}
            <div>
              <label htmlFor="emp-name" className="block text-xs font-mono uppercase tracking-wider text-slate-400 mb-1.5">Employee Name *</label>
              <input
                id="emp-name"
                type="text"
                required
                placeholder="Enter full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl px-3 py-2.5 text-slate-200 text-sm outline-none font-sans"
              />
            </div>

            {/* Photo URL Input directly (Replaced fixed presets) */}
            <div>
              <label htmlFor="emp-photo" className="block text-xs font-mono uppercase tracking-wider text-slate-400 mb-1.5">Profile Image URL (Optional)</label>
              <input
                id="emp-photo"
                type="text"
                placeholder="Paste direct photo link or leave blank for initials"
                value={photoUrl}
                onChange={(e) => setPhotoUrl(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl px-3 py-2.5 text-slate-200 text-sm outline-none font-sans"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Designation */}
              <div>
                <label htmlFor="emp-desig" className="block text-xs font-mono uppercase tracking-wider text-slate-400 mb-1.5">Designation</label>
                <input
                  id="emp-desig"
                  type="text"
                  placeholder="e.g. Sales Associate"
                  value={designation}
                  onChange={(e) => setDesignation(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl px-3 py-2.5 text-slate-200 text-sm outline-none font-sans"
                />
              </div>

              {/* Login PIN */}
              <div>
                <label htmlFor="emp-pin" className="block text-xs font-mono uppercase tracking-wider text-slate-400 mb-1.5">Login PIN *</label>
                <input
                  id="emp-pin"
                  type="text"
                  maxLength={4}
                  required
                  placeholder="PIN"
                  value={pin}
                  onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl px-3 py-2.5 text-slate-200 text-sm outline-none font-mono tracking-widest text-center"
                />
              </div>
            </div>

            {/* Date of Joining Picker (Requested edit capability!) */}
            <div>
              <label htmlFor="emp-joinedDate" className="block text-xs font-mono uppercase tracking-wider text-slate-400 mb-1.5">Date of Joining</label>
              <input
                id="emp-joinedDate"
                type="date"
                value={joinedDate}
                onChange={(e) => setJoinedDate(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl px-3 py-2.5 text-slate-200 text-sm outline-none font-sans cursor-pointer"
              />
            </div>

            {/* Phone */}
            <div>
              <label htmlFor="emp-phone" className="block text-xs font-mono uppercase tracking-wider text-slate-400 mb-1.5">Phone Number</label>
              <input
                id="emp-phone"
                type="text"
                placeholder="+91 XXXXX XXXXX"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl px-3 py-2.5 text-slate-200 text-sm outline-none font-sans"
              />
            </div>

            {/* Email */}
            <div>
              <label htmlFor="emp-email" className="block text-xs font-mono uppercase tracking-wider text-slate-400 mb-1.5">Email Address</label>
              <input
                id="emp-email"
                type="email"
                placeholder="email@jayanthiassoc.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl px-3 py-2.5 text-slate-200 text-sm outline-none font-sans"
              />
            </div>

            <div className="pt-3 flex gap-3 justify-end">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-sans text-xs font-medium rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-sans text-xs font-medium rounded-xl transition-colors flex items-center gap-1.5"
              >
                Add Employee
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

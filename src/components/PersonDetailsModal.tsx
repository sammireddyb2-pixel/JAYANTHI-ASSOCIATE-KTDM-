/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Person } from '../types';
import { cleanGoogleDriveUrl } from '../data';
import { X, Phone, Mail, Calendar, Key, Shield, Edit3, Trash2, Save, RotateCcw, Camera } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface PersonDetailsModalProps {
  person: Person;
  onClose: () => void;
  currentUser: Person;
  onUpdatePerson: (updatedPerson: Person) => void;
  onDeletePerson: (id: string) => void;
}

// Simple elegant initials helper
export function getInitials(name: string): string {
  if (!name) return '?';
  if (name.toUpperCase().includes('JANARDHAN')) return 'J';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + (parts[parts.length - 1]?.[0] || '')).toUpperCase();
}

export function PersonDetailsModal({ person, onClose, currentUser, onUpdatePerson, onDeletePerson }: PersonDetailsModalProps) {
  const [isEditing, setIsEditing] = useState(false);

  // Form states
  const [name, setName] = useState(person.name);
  const [designation, setDesignation] = useState(person.designation);
  const [phone, setPhone] = useState(person.phone);
  const [email, setEmail] = useState(person.email);
  const [photoUrl, setPhotoUrl] = useState(person.photoUrl);
  const [pin, setPin] = useState(person.pin);
  const [joinedDate, setJoinedDate] = useState(person.joinedDate || '');

  // Security & action availability checks
  const canEdit = currentUser.id === person.id || 
                  currentUser.role === 'proprietor' || 
                  (currentUser.role === 'manager' && person.role !== 'proprietor');

  const canDelete = person.role !== 'proprietor' && (
                    currentUser.role === 'proprietor' || 
                    (currentUser.role === 'manager' && person.role === 'employee')
  );

  const canViewPin = currentUser.id === person.id || 
                     currentUser.role === 'proprietor' || 
                     currentUser.role === 'manager';

  const handleSave = () => {
    if (!name.trim()) {
      alert("Name cannot be empty.");
      return;
    }
    if (canViewPin && pin.length < 4) {
      alert("PIN must be exactly 4 digits.");
      return;
    }

    const updated: Person = {
      ...person,
      name: name.trim(),
      designation: designation.trim() || 'Staff Accent',
      phone: phone.trim() || '+91 95000 00000',
      email: email.trim() || `${name.trim().toLowerCase().replace(/\s+/g, '')}@jayanthiassoc.com`,
      photoUrl: cleanGoogleDriveUrl(photoUrl.trim()),
      pin: pin.trim() || person.pin,
      joinedDate: joinedDate.trim() || person.joinedDate
    };

    onUpdatePerson(updated);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setName(person.name);
    setDesignation(person.designation);
    setPhone(person.phone);
    setEmail(person.email);
    setPhotoUrl(person.photoUrl);
    setPin(person.pin);
    setJoinedDate(person.joinedDate || '');
    setIsEditing(false);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs select-none animate-fade-in" id="person-modal-backdrop">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="relative w-full max-w-sm bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl max-h-[90vh] flex flex-col"
          id={`person-modal-${person.id}`}
        >
          {/* Header Close */}
          <button
            onClick={onClose}
            className="absolute top-3 right-3 text-slate-400 hover:text-slate-100 p-1.5 hover:bg-slate-800 rounded-lg transition-colors z-10"
            id="person-modal-close"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Top colored accent banner depending on role */}
          <div className={`h-20 w-full bg-gradient-to-r shrink-0 ${
            person.role === 'proprietor' 
              ? 'from-emerald-600 to-teal-500' 
              : person.role === 'manager' 
              ? 'from-indigo-600 to-purple-600'
              : person.role === 'team_leader' 
              ? 'from-amber-500 to-orange-500' 
              : 'from-sky-500 to-blue-500'
          }`} />

          {/* Profile Photo Floating */}
          <div className="px-6 pb-6 relative overflow-y-auto custom-scrollbar flex-1">
            <div className="relative -mt-10 mb-4 flex items-end">
              <div className="w-20 h-20 rounded-2xl border-4 border-slate-900 overflow-hidden shadow-lg bg-slate-800 relative z-10 flex items-center justify-center">
                {/* Initials Fallback drawn behind the image */}
                <div className="absolute inset-0 flex items-center justify-center font-sans font-bold text-xl text-slate-200 bg-gradient-to-br from-slate-800 to-slate-950">
                  {getInitials(isEditing ? name : person.name)}
                </div>

                {(isEditing ? photoUrl : person.photoUrl) ? (
                  <img 
                    src={isEditing ? photoUrl : person.photoUrl} 
                    alt={isEditing ? name : person.name} 
                    className="absolute inset-0 w-full h-full object-cover z-10"
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).style.opacity = '0';
                    }}
                  />
                ) : null}

                {isEditing && (
                  <div className="absolute inset-0 bg-slate-950/60 flex items-center justify-center text-slate-300 z-20">
                    <Camera className="w-4 h-4 opacity-90" />
                  </div>
                )}
              </div>
            </div>

            {/* Editing Form vs Static Details */}
            {isEditing ? (
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-slate-400 font-mono text-[10px] uppercase tracking-wider font-semibold">Editing Profile</span>
                  <span className="text-[10px] px-1.5 py-0.5 bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 font-mono rounded-md uppercase">{person.role.replace('_', ' ')}</span>
                </div>

                {/* Photo URL Input ONLY - Custom real url replaces preset circles */}
                <div>
                  <label className="block text-[9px] font-mono uppercase tracking-wider text-slate-500 mb-1">Profile Image URL</label>
                  <input 
                    type="text" 
                    placeholder="Paste image URL (Unsplash, Drive etc) or leave empty for initials"
                    value={photoUrl} 
                    onChange={(e) => setPhotoUrl(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl px-3 py-1.5 text-slate-200 text-xs outline-none font-sans"
                  />
                </div>

                {/* Name Input */}
                <div>
                  <label className="block text-[9px] font-mono uppercase tracking-wider text-slate-500 mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl px-3 py-1.5 text-slate-200 text-xs outline-none font-sans"
                  />
                </div>

                {/* Designation Input */}
                <div>
                  <label className="block text-[9px] font-mono uppercase tracking-wider text-slate-500 mb-1">Designation</label>
                  <input
                    type="text"
                    required
                    disabled={person.role === 'proprietor' && currentUser.role !== 'proprietor'}
                    value={designation}
                    onChange={(e) => setDesignation(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl px-3 py-1.5 text-slate-200 text-xs outline-none font-sans disabled:opacity-50"
                  />
                </div>

                {/* Date of Joining Input (Requested edit capability!) */}
                <div>
                  <label className="block text-[9px] font-mono uppercase tracking-wider text-slate-500 mb-1">Date of Joining</label>
                  <input
                    type="date"
                    value={joinedDate}
                    onChange={(e) => setJoinedDate(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl px-3 py-1.5 text-slate-200 text-xs outline-none font-sans"
                  />
                </div>

                {/* Phone Input */}
                <div>
                  <label className="block text-[9px] font-mono uppercase tracking-wider text-slate-500 mb-1">Mobile Phone</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl px-3 py-1.5 text-slate-200 text-xs outline-none font-sans"
                  />
                </div>

                {/* Email Input */}
                <div>
                  <label className="block text-[9px] font-mono uppercase tracking-wider text-slate-500 mb-1">Email Address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl px-3 py-1.5 text-slate-200 text-xs outline-none font-sans"
                  />
                </div>

                {/* PIN Input */}
                {canViewPin && (
                  <div>
                    <label className="block text-[9px] font-mono uppercase tracking-wider text-slate-500 mb-1">Entry PIN (4-Digits)</label>
                    <input
                      type="password"
                      maxLength={4}
                      value={pin}
                      disabled={person.role === 'proprietor' && currentUser.role !== 'proprietor'}
                      onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
                      className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl px-3 py-1 text-slate-200 text-xs outline-none font-mono text-center tracking-widest disabled:opacity-50"
                    />
                  </div>
                )}

                {/* Save & Cancel Footer */}
                <div className="pt-2 flex gap-2.5">
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="flex-1 py-2 bg-slate-800 hover:bg-slate-750 text-slate-300 font-sans text-xs font-semibold rounded-xl transition-colors flex items-center justify-center gap-1"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSave}
                    className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-sans text-xs font-semibold rounded-xl transition-colors flex items-center justify-center gap-1 shadow-lg shadow-indigo-600/20"
                  >
                    <Save className="w-3.5 h-3.5" />
                    Save
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="space-y-1">
                  <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono tracking-wider uppercase font-semibold ${
                    person.role === 'proprietor' 
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                      : person.role === 'manager' 
                      ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
                      : person.role === 'team_leader' 
                      ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' 
                      : 'bg-sky-500/10 text-sky-400 border border-sky-500/20'
                  }`}>
                    <Shield className="w-3 h-3" />
                    {person.role.replace('_', ' ')}
                  </span>
                  <h3 className="text-xl font-sans font-semibold tracking-tight text-slate-100 pr-8">
                    {person.name}
                  </h3>
                  <p className="font-mono text-xs text-slate-400 font-medium">
                    {person.designation}
                  </p>
                </div>

                {/* Profile Info Details List */}
                <div className="space-y-3.5 pt-4 border-t border-slate-800/80">
                  <div className="flex items-center gap-3 text-slate-300">
                    <Phone className="w-4 h-4 text-slate-500 shrink-0" />
                    <div className="text-xs">
                      <p className="text-slate-500 font-mono text-[9px] uppercase tracking-wider">Phone</p>
                      <p className="font-sans text-slate-300 mt-0.5">{person.phone}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 text-slate-300">
                    <Mail className="w-4 h-4 text-slate-500 shrink-0" />
                    <div className="text-xs">
                      <p className="text-slate-500 font-mono text-[9px] uppercase tracking-wider">Email Address</p>
                      <p className="font-sans text-slate-300 mt-0.5 break-all">{person.email}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 text-slate-300">
                    <Calendar className="w-4 h-4 text-slate-500 shrink-0" />
                    <div className="text-xs">
                      <p className="text-slate-500 font-mono text-[9px] uppercase tracking-wider">Joined Date</p>
                      <p className="font-sans text-slate-300 mt-0.5">{person.joinedDate || 'N/A'}</p>
                    </div>
                  </div>

                  {/* Show security PIN info only if current user is proprietor/manager or viewing themselves */}
                  {canViewPin && (
                    <div className="flex items-center gap-3 text-slate-300 bg-slate-950/40 p-2.5 rounded-lg border border-slate-800/50">
                      <Key className="w-4 h-4 text-amber-400 shrink-0" />
                      <div className="text-xs">
                        <p className="text-amber-500/80 font-mono text-[9px] uppercase tracking-wider">Security Entry PIN</p>
                        <p className="font-mono font-bold text-slate-200 mt-0.5 tracking-wider">••••</p>
                      </div>
                    </div>
                  )}

                  {/* Edit & Delete Action Panel */}
                  {(canEdit || canDelete) && (
                    <div className="pt-2 flex gap-2.5">
                      {canEdit && (
                        <button
                          type="button"
                          onClick={() => setIsEditing(true)}
                          className="flex-1 py-2 bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-indigo-400 hover:border-indigo-500/30 border border-slate-800 rounded-xl text-xs font-sans font-semibold transition-all flex items-center justify-center gap-1.5"
                          id="btn-edit-person"
                        >
                          <Edit3 className="w-3.5 h-3.5 text-indigo-400" />
                          Edit Info
                        </button>
                      )}
                      {canDelete && (
                        <button
                          type="button"
                          onClick={() => onDeletePerson(person.id)}
                          className="py-2 px-3.5 bg-red-950/20 hover:bg-red-900/30 text-red-400 hover:text-red-300 border border-red-950 rounded-xl text-xs font-sans font-semibold transition-all flex items-center justify-center gap-1"
                          id="btn-delete-person"
                          title="Delete Member"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          Delete
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

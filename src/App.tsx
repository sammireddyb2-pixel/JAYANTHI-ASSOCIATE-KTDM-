/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { Person, MonthlyFunding, MonthlySalary } from './types';
import { 
  INITIAL_PEOPLE, INITIAL_FUNDING, INITIAL_SALARIES, loadLocalData, saveLocalData 
} from './data';
import { PinLogin } from './components/PinLogin';
import { PersonDetailsModal } from './components/PersonDetailsModal';
import { AddEmployeeModal } from './components/AddEmployeeModal';
import { ActivityFunding } from './components/ActivityFunding';
import { ActivitySalary } from './components/ActivitySalary';

import { 
  ShieldAlert, UserCheck, LogOut, Plus, RefreshCw, Trophy, 
  HelpCircle, ChevronRight, Coins, ClipboardList, Briefcase, Info,
  MessageSquare, Wallet, Users, Smartphone, Search, Send, CheckCircle,
  Clock, Wifi, Battery, Check, CheckCheck, Landmark, ArrowLeft, MoreVertical,
  User as UserIcon, CheckCircle2, AlertCircle, Sparkles, Database, Building2
} from 'lucide-react';
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

// Custom interface for simulated WhatsApp messages
interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  text: string;
  timestamp: string;
  read: boolean;
  statusUpdate?: boolean;
}

export default function App() {
  // Main loaded states
  const [people, setPeople] = useState<Person[]>([]);
  const [funding, setFunding] = useState<MonthlyFunding[]>([]);
  const [salaries, setSalaries] = useState<MonthlySalary[]>([]);
  
  // Auth state
  const [currentUser, setCurrentUser] = useState<Person | null>(null);

  // Modal / Interaction states
  const [selectedPerson, setSelectedPerson] = useState<Person | null>(null);
  const [isAddEmployeeOpen, setIsAddEmployeeOpen] = useState(false);
  
  // Active Activity Tab (Fallback inside Pay ledger)
  const [activeActivityTab, setActiveActivityTab] = useState<'funding' | 'salary'>('funding');

  // CUSTOM MOBILE APP STATES
  const [activeMobileTab, setActiveMobileTab] = useState<'home' | 'ledger' | 'salary' | 'team' | 'profile'>('home');
  const [selectedChatPartner, setSelectedChatPartner] = useState<Person | null>(null);
  const [chatInputText, setChatInputText] = useState('');
  const [chats, setChats] = useState<{ [partnerId: string]: ChatMessage[] }>({});
  const [chatSearchQuery, setChatSearchQuery] = useState('');
  const [currentTime, setCurrentTime] = useState('09:08');
  
  // PWA custom installer prompts
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallApp = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      console.log(`User installation outcome: ${outcome}`);
      setDeferredPrompt(null);
    } else {
      alert("మొబైల్ హోమ్ స్క్రీన్‌పై ఇన్‌స్టాల్ చేయడానికి:\n1. మీ బ్రౌజర్ కుడి టాప్ లో ఉన్న మూడు చుక్కల (Menu) గుర్తును నొక్కండి.\n2. 'Add to Home Screen' లేదా 'Install App' పై క్లిక్ చేయండి.\n\nTo install on your home screen:\n1. Open your mobile browser's menu (three dots or share button).\n2. Tap 'Add to Home screen' or 'Install App'.");
    }
  };
  
  // Scroll Ref for WhatsApp auto-scroll
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Helper to save server-side state in background
  const syncWithServer = (pList: Person[], fList: MonthlyFunding[], sList: MonthlySalary[]) => {
    fetch('/api/save', {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ people: pList, funding: fList, salaries: sList })
    })
    .then(res => res.json())
    .catch(err => {
      console.error("Failed to sync server data store:", err);
    });
  };

  // Update dynamic clock time
  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      let hours = now.getHours();
      const minutes = now.getMinutes().toString().padStart(2, '0');
      const ampm = hours >= 12 ? 'PM' : 'AM';
      hours = hours % 12 || 12;
      setCurrentTime(`${hours}:${minutes} ${ampm}`);
    };
    updateClock();
    const interval = setInterval(updateClock, 30000);
    return () => clearInterval(interval);
  }, []);

  // Load state on bootstrap
  useEffect(() => {
    let loadedPeopleRaw = loadLocalData<Person[]>('people', INITIAL_PEOPLE);
    if (!Array.isArray(loadedPeopleRaw)) {
      loadedPeopleRaw = INITIAL_PEOPLE;
    }
    const loadedPeople = loadedPeopleRaw.filter(p => p && p.id).map(p => {
      const official = INITIAL_PEOPLE.find(x => x.id === p.id);
      if (official) {
        return {
          ...p,
          name: official.name,
          phone: official.phone,
          photoUrl: official.photoUrl,
          designation: official.designation
        };
      }
      return { ...p };
    });

    let loadedFunding = loadLocalData<MonthlyFunding[]>('funding', INITIAL_FUNDING);
    if (!Array.isArray(loadedFunding)) loadedFunding = INITIAL_FUNDING;

    let loadedSalaries = loadLocalData<MonthlySalary[]>('salaries', INITIAL_SALARIES);
    if (!Array.isArray(loadedSalaries)) loadedSalaries = INITIAL_SALARIES;

    const loadedUser = loadLocalData<Person | null>('logged_user', null);

    // Load Chat history or seed defaults
    const loadedChats = loadLocalData<{ [partnerId: string]: ChatMessage[] }>('user_chats', {});
    
    setPeople(loadedPeople);
    setFunding(loadedFunding);
    setSalaries(loadedSalaries);
    setChats(loadedChats || {});

    if (loadedUser && loadedUser.id) {
      const match = loadedPeople.find(p => p.id === loadedUser.id);
      if (match) {
        setCurrentUser(match);
      }
    }

    // Live sync from the server DB
    fetch('/api/data')
      .then(res => res.json())
      .then(res => {
        if (res.status === 'success' && res.data) {
          const sPeople = Array.isArray(res.data.people) ? res.data.people : [];
          const sFunding = Array.isArray(res.data.funding) ? res.data.funding : [];
          const sSalaries = Array.isArray(res.data.salaries) ? res.data.salaries : [];

          // Merge server data if any collections have data
          if (sPeople.length > 0 || sFunding.length > 0 || sSalaries.length > 0) {
            let mergedPeople = sPeople.filter((p: any) => p && p.id).map((p: any) => {
              const official = INITIAL_PEOPLE.find(x => x.id === p.id);
              if (official) {
                return {
                  ...p,
                  name: official.name,
                  phone: official.phone,
                  photoUrl: official.photoUrl,
                  designation: official.designation,
                  role: official.role,
                  pin: official.pin
                };
              }
              return { ...p };
            });
            let listChanged = false;

            const idsToDelete = ['manager_2', 'tl_2', 'tl_3'];
            const namesToDelete = [
              'K. Raghu Ram', 'B. Venkat Rao', 'T. Anitha Krishna', 'B venkat rao', 'T Anitha Krishna',
              'Sunitha Rao', 'Suntha rao', 'Vijay Ram', 'Vijay ram'
            ];
            if (mergedPeople.some(x => idsToDelete.includes(x.id) || namesToDelete.includes(x.name))) {
              mergedPeople = mergedPeople.filter(x => !idsToDelete.includes(x.id) && !namesToDelete.includes(x.name));
              listChanged = true;
            }

            INITIAL_PEOPLE.forEach(p => {
              const matchIdx = mergedPeople.findIndex(x => x.id === p.id);
              if (matchIdx === -1) {
                mergedPeople.push({ ...p });
                listChanged = true;
              }
            });

            // Map and merge salaries without mutating any objects direct reference
            let mergedSalaries = sSalaries.length > 0 ? sSalaries.map(ms => JSON.parse(JSON.stringify(ms))) : JSON.parse(JSON.stringify(INITIAL_SALARIES));
            INITIAL_SALARIES.forEach(initialMonth => {
              const matchMonthIdx = mergedSalaries.findIndex((ms: any) => ms.id === initialMonth.id);
              if (matchMonthIdx !== -1) {
                const matchMonth = mergedSalaries[matchMonthIdx];
                let monthSalaries = { ...matchMonth.salaries };
                let monthChanged = false;
                Object.keys(initialMonth.salaries).forEach(empId => {
                  if (!monthSalaries[empId]) {
                    monthSalaries[empId] = { ...(initialMonth.salaries as any)[empId] };
                    monthChanged = true;
                    listChanged = true;
                  }
                });
                if (monthChanged) {
                  mergedSalaries[matchMonthIdx] = {
                    ...matchMonth,
                    salaries: monthSalaries
                  };
                }
              } else {
                mergedSalaries.push(JSON.parse(JSON.stringify(initialMonth)));
                listChanged = true;
              }
            });

            const mergedFundingResult = sFunding.length > 0 ? sFunding : INITIAL_FUNDING;

            if (listChanged) {
              fetch('/api/save', {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ people: mergedPeople, funding: mergedFundingResult, salaries: mergedSalaries })
              }).catch(() => {});
            }

            setPeople(mergedPeople);
            saveLocalData('people', mergedPeople);

            setFunding(mergedFundingResult);
            saveLocalData('funding', mergedFundingResult);

            setSalaries(mergedSalaries);
            saveLocalData('salaries', mergedSalaries);

            if (loadedUser) {
              const match = mergedPeople.find(p => p.id === loadedUser.id);
              if (match) {
                setCurrentUser(match);
                saveLocalData('logged_user', match);
              }
            }
          }
        }
      })
      .catch(err => {
        console.error("Local-Only Fallback Active:", err);
      });
  }, []);

  // Save changes to local storage and sync with server
  const updatePeople = (newPeople: Person[]) => {
    setPeople(newPeople);
    saveLocalData('people', newPeople);
    syncWithServer(newPeople, funding, salaries);
  };

  const updateFunding = (newFunding: MonthlyFunding[]) => {
    setFunding(newFunding);
    saveLocalData('funding', newFunding);
    syncWithServer(people, newFunding, salaries);
  };

  const updateSalaries = (newSalaries: MonthlySalary[]) => {
    setSalaries(newSalaries);
    saveLocalData('salaries', newSalaries);
    syncWithServer(people, funding, newSalaries);
  };

  const handleLogin = (user: Person) => {
    setCurrentUser(user);
    saveLocalData('logged_user', user);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    saveLocalData('logged_user', null);
    setSelectedChatPartner(null);
  };

  const handleAddEmployee = (newEmp: Person) => {
    const updatedPeople = [...people, newEmp];
    const updatedSalaries = salaries.map(ms => {
      return {
        ...ms,
        salaries: {
          ...ms.salaries,
          [newEmp.id]: {
            employeeId: newEmp.id,
            amount: 32000,
            status: 'Pending' as const,
            employeeConfirmation: null,
            proprietorApproved: false,
            lastUpdated: new Date().toISOString().split('T')[0]
          }
        }
      };
    });
    setPeople(updatedPeople);
    saveLocalData('people', updatedPeople);
    setSalaries(updatedSalaries);
    saveLocalData('salaries', updatedSalaries);
    syncWithServer(updatedPeople, funding, updatedSalaries);
  };

  const handleUpdatePerson = (updatedPerson: Person) => {
    const updatedPeople = people.map(p => p.id === updatedPerson.id ? updatedPerson : p);
    updatePeople(updatedPeople);

    if (currentUser && currentUser.id === updatedPerson.id) {
      setCurrentUser(updatedPerson);
      saveLocalData('logged_user', updatedPerson);
    }

    if (selectedPerson && selectedPerson.id === updatedPerson.id) {
      setSelectedPerson(updatedPerson);
    }
  };

  const handleDeletePerson = (id: string) => {
    const target = people.find(p => p.id === id);
    if (!target) return;

    if (target.role === 'proprietor') {
      alert("The Proprietor account cannot be deleted.");
      return;
    }

    if (window.confirm(`Are you sure you want to delete ${target.name}? This will permanently remove them from the system.`)) {
      const updatedPeople = people.filter(p => p.id !== id);
      updatePeople(updatedPeople);
      setSelectedPerson(null);
    }
  };

  const handleResetDatabase = () => {
    if (window.confirm("Restore key-ledger database to initial pre-seeded values? All added staff, chats or status changes will be reset.")) {
      localStorage.removeItem('jayanthi_ktdm_people');
      localStorage.removeItem('jayanthi_ktdm_funding');
      localStorage.removeItem('jayanthi_ktdm_salaries');
      localStorage.removeItem('jayanthi_ktdm_logged_user');
      localStorage.removeItem('jayanthi_ktdm_user_chats');
      
      setPeople(INITIAL_PEOPLE);
      setFunding(INITIAL_FUNDING);
      setSalaries(INITIAL_SALARIES);
      setChats({});
      setCurrentUser(null);
      setSelectedChatPartner(null);

      fetch('/api/save', {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ people: INITIAL_PEOPLE, funding: INITIAL_FUNDING, salaries: INITIAL_SALARIES })
      }).catch(() => {});
    }
  };

  if (!currentUser) {
    return <PinLogin people={people.length ? people : INITIAL_PEOPLE} onLogin={handleLogin} />;
  }

  // Segment personnel
  const employees = people.filter(p => p.role === 'employee');
  const isManagement = currentUser.role === 'proprietor' || currentUser.role === 'manager' || currentUser.role === 'team_leader';

  // Calculations for Wallet Balance widgets
  const getWalletStats = () => {
    let rawTotalFunding = 0;
    let rawTotalReceived = 0;
    let rawTotalSalaryAllotted = 0;
    let rawTotalSalaryCredited = 0;

    funding.forEach(m => {
      Object.values(m.employeeFundings).forEach((emp: any) => {
        emp.transactions.forEach((t: any) => {
          rawTotalFunding += t.totalFunding;
          rawTotalReceived += t.receivedAmount;
        });
      });
    });

    salaries.forEach(m => {
      Object.values(m.salaries).forEach((s: any) => {
        const gross = s.amount + (s.incentive || 0);
        rawTotalSalaryAllotted += gross;
        if (s.status === 'Credited') {
          rawTotalSalaryCredited += gross;
        }
      });
    });

    return {
      fundingLimit: rawTotalFunding || 420005,
      receivedFunding: rawTotalReceived || 395005,
      salaryBudget: rawTotalSalaryAllotted || 298005,
      creditedSalary: rawTotalSalaryCredited || 215005
    };
  };

  const stats = getWalletStats();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-0 md:p-6" id="jayanthi-mobile-workspace">
      {/* Dynamic Background Mesh Effect on Desktops */}
      <div className="absolute inset-x-0 top-0 h-full bg-[radial-gradient(circle_at_50%_0%,rgba(99,102,241,0.05),transparent_70%)] pointer-events-none hidden md:block" />

      {/* Main Grid: Left side details, central real phone frame */}
      <div className="w-full max-w-6xl grid grid-cols-1 md:grid-cols-12 gap-8 items-center justify-items-center relative z-10">
        
        {/* Left Side: Desktop-only App Control and credentials panel */}
        <div className="hidden md:flex md:col-span-12 lg:col-span-5 flex-col space-y-6 self-start text-left text-slate-300">
          <div className="space-y-4">
            <div className="flex items-center gap-1.5">
              <span className="px-2.5 py-0.5 text-[10px] font-mono uppercase bg-indigo-500/10 border border-indigo-500/30 rounded-full font-bold text-indigo-400">
                OFFICIAL PORTAL
              </span>
              <span className="px-2.5 py-0.5 text-[10px] font-mono uppercase bg-emerald-500/10 border border-emerald-500/30 rounded-full font-bold text-emerald-400">
                v3.0 (Active)
              </span>
            </div>
            
            <h1 className="text-3xl font-display font-bold tracking-tight text-slate-100 uppercase">
              Jayanthi Associates
            </h1>
            <p className="text-sm text-slate-400 leading-relaxed font-sans">
              Welcome to the official ledger portal. Authorized managers, team leaders, and employees can check and approve cash funding or salary credit audits.
            </p>
          </div>

          {/* Proprietor Spotlight Card on Desktop left panel */}
          <div className="bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 rounded-3xl p-5 space-y-4 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-2xl" />
            <div className="flex gap-4 items-center">
              <div className="w-16 h-16 bg-slate-900 border-2 border-indigo-500 p-0.5 rounded-full relative overflow-hidden shrink-0">
                <img
                  src="https://lh3.googleusercontent.com/d/1pGUnA5asuY_z_Z-KwS7y1JlXAWr1-vjf"
                  alt="Proprietor Janardhan Sir"
                  className="w-full h-full object-cover rounded-full"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div>
                <span className="px-2 py-0.5 text-[8px] font-bold uppercase tracking-wider bg-indigo-500/10 border border-indigo-500/30 rounded text-indigo-300">
                  Managing Proprietor
                </span>
                <h3 className="font-sans font-bold text-slate-100 text-lg mt-1 uppercase">JANARDHAN SIR</h3>
                <p className="text-xs text-slate-400 font-mono">Jayanthi Associates KTDM</p>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-slate-500 bg-slate-900/30 border border-slate-900 rounded-xl px-4 py-3">
            <div className="flex items-center gap-1.5">
              <Database className="w-3.5 h-3.5 text-slate-400" />
              <span>Durable Cloud SQLite + Firestore synced</span>
            </div>
            <button 
              onClick={handleResetDatabase}
              className="text-slate-400 hover:text-emerald-400 transition-colors hover:underline flex items-center gap-1 font-mono text-[10px]"
            >
              <RefreshCw className="w-3 h-3" />
              Reset Database
            </button>
          </div>
        </div>

        {/* Central: Native Smartphone Frame & Responsive Web Workspace */}
        <div className="w-full md:col-span-12 lg:col-span-7 flex justify-center">
          
          {/* Smartphone bezel frame wrapper */}
          <div className="w-full max-w-[400px] h-full min-h-[100vh] md:min-h-[820px] md:h-[820px] bg-slate-950 md:rounded-[48px] md:border-[10px] md:border-slate-800 md:shadow-[0_0_80px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col relative" id="mobile-viewport-wrapper">
            
            {/* Dynamic Status Notch for phone mockup screen */}
            <div className="absolute top-0 inset-x-0 h-7 bg-slate-950 z-50 flex items-center justify-between px-6 select-none shrink-0" id="phone-notch-bar">
              {/* Dynamic simulated carrier clock and status markers */}
              <div className="flex items-center gap-1.5 text-[11px] font-sans font-semibold text-slate-100">
                <span className="mr-0.5">{currentTime.split(' ')[0]}</span>
                <span className="text-[10px] text-slate-400 font-mono scale-90">{currentTime.split(' ')[1]}</span>
                {activeMobileTab === 'ledger' && <Coins className="w-3 h-3 text-indigo-400 inline shrink-0" />}
                {activeMobileTab === 'team' && <Users className="w-3 h-3 text-emerald-400 inline shrink-0" />}
              </div>

              {/* Central Sleek Sensor Pill */}
              <div className="w-24 h-4 bg-black rounded-full absolute left-1/2 -translate-x-1/2 top-1 hidden md:block" />

              {/* Status Bar Icons */}
              <div className="flex items-center gap-2 text-slate-300">
                <span className="text-[8px] font-mono bg-slate-800 text-slate-400 px-1 py-0.5 rounded leading-none">VoLTE</span>
                <Wifi className="w-3.5 h-3.5 text-slate-200 shrink-0" />
                <div className="flex items-center gap-0.5">
                  <span className="text-[9px] font-mono text-slate-300 font-semibold leading-none">88%</span>
                  <Battery className="w-4 h-4 text-emerald-400 shrink-0" />
                </div>
              </div>
            </div>

            {/* NESTED CONTENT PAGES */}
            <div className="flex-1 flex flex-col pt-7 pb-[68px] overflow-hidden bg-slate-950">
              
              {/* 1. HOME DASHBOARD WITH PROPRIETOR PHOTO ACCENTED SPOTLIGHT */}
              {activeMobileTab === 'home' && (
                <div className="flex-1 flex flex-col h-full overflow-y-auto p-4 space-y-4 custom-scrollbar" id="tab-home-dashboard">
                  
                  {/* Header Branding */}
                  <div className="text-center py-2 border-b border-slate-900">
                    <h2 className="text-xs font-mono text-amber-500 uppercase tracking-widest font-bold">Jayanthi Associates</h2>
                    <p className="text-[10px] text-slate-400 font-sans uppercase mt-0.5">Kothagudem (KTDM) Portal</p>
                  </div>

                  {/* PROPRIETOR PHOTO SPOTLIGHT CARD - BEAUTIFUL HIGHLIGHT */}
                  <div className="bg-gradient-to-b from-slate-900 to-slate-950 border-2 border-amber-500/30 rounded-3xl p-5 text-center space-y-3.5 relative overflow-hidden shadow-2xl">
                    <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-600" />
                    
                    <div className="absolute -top-3 -right-3 w-16 h-16 bg-amber-500/5 rounded-full blur-xl" />
                    
                    <div className="mx-auto w-24 h-24 relative">
                      <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-amber-500 to-yellow-450 animate-pulse p-1">
                        <div className="w-full h-full bg-slate-950 rounded-full flex items-center justify-center font-sans font-black text-3xl text-amber-500 uppercase">
                          J
                        </div>
                      </div>
                      <img
                        src="https://lh3.googleusercontent.com/d/1pGUnA5asuY_z_Z-KwS7y1JlXAWr1-vjf"
                        alt="Proprietor Janardhan Sir"
                        className="absolute inset-1 w-22 h-22 rounded-full object-cover z-10 border border-slate-800 mx-auto"
                        referrerPolicy="no-referrer"
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).style.opacity = '0';
                        }}
                      />
                      <span className="absolute bottom-1 right-2 w-6 h-6 bg-amber-500 rounded-full border-2 border-slate-950 flex items-center justify-center text-[10px] text-slate-950 font-bold shadow-md z-20">✓</span>
                    </div>

                    <div className="space-y-1">
                      <span className="px-2.5 py-0.5 text-[8px] font-sans font-bold uppercase tracking-widest bg-amber-500/10 border border-amber-500/30 rounded-full text-amber-400 inline-block">
                        Proprietor & Founder
                      </span>
                      <h3 className="font-sans font-extrabold text-slate-100 text-lg uppercase tracking-wide">
                        JANARDHAN SIR
                      </h3>
                      <p className="text-[11px] text-slate-400 leading-relaxed font-sans px-2">
                        Honorary Founder & Managing Proprietor of <strong className="text-slate-205">Jayanthi Associates KTDM</strong>.
                      </p>
                    </div>

                    <div className="pt-2 border-t border-slate-900 text-[10px] text-slate-400 flex justify-center items-center gap-1">
                      <ShieldAlert className="w-3.5 h-3.5 text-amber-500" />
                      <span>Ledgers officially verified & approved by Proprietor</span>
                    </div>
                  </div>

                  {/* MOBILE APP INSTALLATION WIDGET */}
                  <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-indigo-950/40 border border-slate-800 rounded-2xl p-4 space-y-3.5 shadow-lg">
                    <div className="flex gap-3.5 items-center">
                      <div className="w-12 h-12 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-center p-0.5 relative shrink-0">
                        <div className="w-full h-full bg-slate-900 rounded-lg flex items-center justify-center text-sm font-black text-amber-500 uppercase">
                          J
                        </div>
                        <img
                          src="https://lh3.googleusercontent.com/d/1pGUnA5asuY_z_Z-KwS7y1JlXAWr1-vjf"
                          alt="Proprietor App Icon"
                          className="absolute inset-0.5 w-11 h-11 object-cover rounded-lg z-10"
                          referrerPolicy="no-referrer"
                          onError={(e) => {
                            (e.currentTarget as HTMLImageElement).style.opacity = '0';
                          }}
                        />
                        <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border border-slate-950 flex items-center justify-center text-[8px] text-white font-bold z-20">✓</span>
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-xs font-bold text-slate-150 uppercase tracking-wide flex items-center gap-1.5 font-sans">
                          <Smartphone className="w-4 h-4 text-emerald-400 animate-bounce" />
                          Install Mobile App
                        </h4>
                        <p className="text-[10px] text-slate-400 mt-0.5 leading-relaxed font-sans">
                          ఈ యాప్‌ని మీ ఫోన్ లో <strong className="text-emerald-400">WhatsApp/PhonePe</strong> తరహాలో ఇన్‌స్టాల్ చేసుకోండి. యాప్ ఐకాన్ పై <strong>జనార్దన్ సార్ ఫోటో</strong> కనిపిస్తుంది!
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={handleInstallApp}
                      className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 transition-all text-white font-sans font-bold text-[11px] rounded-xl flex items-center justify-center gap-2 active:scale-95 shadow-md uppercase tracking-wider"
                    >
                      <Plus className="w-4 h-4" />
                      Install App Now (ఇన్‌స్టాల్ చేయండి)
                    </button>
                  </div>

                  {/* QUICK OVERVIEW STATS MODULE */}
                  <div className="bg-slate-900 border border-slate-850 rounded-2xl p-4 space-y-3">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                      <span className="text-[10px] font-mono text-indigo-400 uppercase tracking-wider font-bold">Ledger Balance Status</span>
                      <span className="text-[9px] font-mono text-slate-500 font-bold">Live Synced</span>
                    </div>

                    <div className="grid grid-cols-2 gap-3.5">
                      <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800">
                        <p className="text-[9px] text-slate-400 uppercase font-mono">Total Funding Allotted</p>
                        <h5 className="text-sm font-bold text-emerald-400 mt-1">₹{stats.receivedFunding.toLocaleString()}</h5>
                        <div className="w-full bg-slate-900 h-1 rounded-full mt-2 overflow-hidden">
                          <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${Math.min(100, (stats.receivedFunding / stats.fundingLimit) * 100)}%` }} />
                        </div>
                      </div>

                      <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800">
                        <p className="text-[9px] text-slate-400 uppercase font-mono">Salary Budget</p>
                        <h5 className="text-sm font-bold text-indigo-400 mt-1">₹{stats.creditedSalary.toLocaleString()}</h5>
                        <div className="w-full bg-slate-900 h-1 rounded-full mt-2 overflow-hidden">
                          <div className="bg-indigo-505 h-full rounded-full" style={{ width: `${Math.min(100, (stats.creditedSalary / stats.salaryBudget) * 100)}%` }} />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* CURRENT SESSION CONTEXT METADATA */}
                  <div className="bg-slate-900/40 p-3 rounded-xl border border-slate-900 flex justify-between items-center text-[10px] font-sans">
                    <div className="flex items-center gap-1.5">
                      <div className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
                      <span className="text-slate-400">Welcome, <strong>{currentUser.name}</strong></span>
                    </div>
                    <span className="text-slate-500 font-mono font-bold">PIN: ••••</span>
                  </div>

                </div>
              )}

              {/* 2. LEDGER VIEW (CONSOLIDATED AUDITS & BALANCES) */}
              {activeMobileTab === 'ledger' && (
                <div className="flex-1 flex flex-col h-full overflow-hidden" id="tab-payment-ledger">
                  {/* Ledger Hub Header */}
                  <div className="bg-slate-900 border-b border-slate-800 px-4 py-3 flex items-center justify-between shrink-0">
                    <div>
                      <h2 className="font-semibold text-sm uppercase text-slate-100 flex items-center gap-1">
                        <Coins className="w-4 h-4 text-emerald-400" />
                        Finances & Ledger
                      </h2>
                      <p className="text-[10px] text-slate-400 font-mono mt-0.5">KTDM FINANCIAL BUDGET SHEETS</p>
                    </div>
                  </div>

                  {/* Scrollable Body */}
                  <div className="flex-1 overflow-y-auto p-3 space-y-4 custom-scrollbar">
                    
                    {/* Integrated Ledger Panels with responsive viewport styling */}
                    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3.5 space-y-4 font-sans">
                      
                      {/* Render sub-components inside native scope - direct action! */}
                      <div className="text-left text-slate-300 select-text overflow-x-hidden min-h-[400px]">
                        <ActivityFunding 
                          funding={funding} 
                          people={people} 
                          currentUser={currentUser} 
                          onUpdateFunding={updateFunding} 
                        />
                      </div>
                    </div>

                    {/* Quick database triggers */}
                    <div className="grid grid-cols-2 gap-2 pb-2 font-sans">
                      <button 
                        onClick={() => {
                          if (isManagement) {
                            setIsAddEmployeeOpen(true);
                          } else {
                            alert("Administrative controls required to register staff.");
                          }
                        }}
                        className="p-2.5 rounded-xl border border-slate-800 bg-slate-900/60 hover:bg-slate-900 transition-all flex items-center justify-center gap-1.5 group text-[10px] font-sans font-semibold text-slate-200"
                      >
                        <Plus className="w-3.5 h-3.5 text-indigo-400 group-hover:text-emerald-400" />
                        + Add Employee
                      </button>

                      <button 
                        onClick={handleResetDatabase}
                        className="p-2.5 rounded-xl border border-slate-800 bg-slate-900/60 hover:bg-slate-900 transition-all flex items-center justify-center gap-1.5 group text-[10px] font-sans font-semibold text-slate-200"
                      >
                        <RefreshCw className="w-3.5 h-3.5 text-indigo-400 group-hover:text-rose-400" />
                        Reset Database
                      </button>
                    </div>

                  </div>
                </div>
              )}

              {/* 2B. SALARY VIEW */}
              {activeMobileTab === 'salary' && (
                <div className="flex-1 flex flex-col h-full overflow-hidden" id="tab-salary-ledger">
                  {/* Salary Hub Header */}
                  <div className="bg-slate-900 border-b border-slate-800 px-4 py-3 flex items-center justify-between shrink-0">
                    <div>
                      <h2 className="font-semibold text-sm uppercase text-slate-100 flex items-center gap-1">
                        <Building2 className="w-4 h-4 text-amber-500" />
                        Salary Details
                      </h2>
                      <p className="text-[10px] text-slate-400 font-mono mt-0.5">KTDM MONTHLY PAYOUT RECORDS</p>
                    </div>
                  </div>

                  {/* Scrollable Body */}
                  <div className="flex-1 overflow-y-auto p-3 space-y-4 custom-scrollbar">
                    
                    {/* Integrated Salary Panels with responsive viewport styling */}
                    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3.5 space-y-4 font-sans">
                      
                      {/* Render sub-components inside native scope - direct action! */}
                      <div className="text-left text-slate-300 select-text overflow-x-hidden min-h-[400px]">
                        <ActivitySalary 
                          salaries={salaries} 
                          people={people} 
                          currentUser={currentUser} 
                          onUpdateSalaries={updateSalaries} 
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* 3. DIRECTORY LISTINGS */}
              {activeMobileTab === 'team' && (
                <div className="flex-1 flex flex-col h-full overflow-hidden font-sans" id="tab-team-roster">
                  {/* Team Profile Header */}
                  <div className="bg-slate-900 border-b border-slate-800 px-4 py-3 flex items-center justify-between shrink-0">
                    <div>
                      <h2 className="font-semibold text-sm uppercase text-slate-100">KTDM Directory</h2>
                      <p className="text-[10px] text-slate-400 font-mono mt-0.5 font-bold uppercase tracking-widest leading-none">{people.length} Registered Nodes</p>
                    </div>
                    {isManagement && (
                      <button
                        onClick={() => setIsAddEmployeeOpen(true)}
                        className="p-1 px-2.5 bg-emerald-600 hover:bg-emerald-500 rounded-lg text-white font-semibold text-[10px] flex items-center gap-1 leading-none shadow"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        Add New
                      </button>
                    )}
                  </div>

                  {/* Team Content list */}
                  <div className="flex-1 overflow-y-auto p-3 space-y-4 custom-scrollbar">
                    
                    {/* Upper Management Executive Section */}
                    <div className="space-y-2">
                      <p className="text-[10px] font-mono text-slate-500 uppercase tracking-widest font-bold">Executive Roster</p>
                      <div className="space-y-2">
                        {/* Proprietor + Managers inside list format */}
                        {people.filter(p => p.role !== 'employee').map((p) => (
                          <div 
                            key={p.id}
                            onClick={() => setSelectedPerson(p)}
                            className="bg-slate-900 border border-slate-800 hover:border-indigo-500/50 rounded-xl p-2.5 flex items-center justify-between cursor-pointer active:bg-slate-850"
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              {renderAvatar(p.photoUrl, p.name, "w-10 h-10 rounded-full border border-slate-700 shrink-0", "text-xs")}
                              <div className="min-w-0">
                                <h4 className="text-[11px] font-bold text-slate-100 uppercase truncate pr-1">
                                  {p.name}
                                </h4>
                                <p className="text-[9px] font-mono text-slate-400 truncate mt-0.5">{p.designation}</p>
                              </div>
                            </div>
                            <span className="text-[8px] font-mono text-indigo-305 border border-indigo-900/50 bg-indigo-950 px-1.5 py-0.5 rounded uppercase font-bold text-right shrink-0">
                              {p.role.replace('_', ' ')}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Operational Team List */}
                    <div className="space-y-2">
                      <p className="text-[10px] font-mono text-slate-500 uppercase tracking-widest font-bold">Operational Team ({employees.length})</p>
                      <div className="grid grid-cols-2 gap-2">
                        {employees.map((p) => (
                          <div 
                            key={p.id}
                            onClick={() => setSelectedPerson(p)}
                            className="bg-slate-900 border border-slate-800/80 hover:border-sky-500/40 rounded-xl p-2 text-center cursor-pointer hover:bg-slate-850 active:scale-95 transition-all flex flex-col items-center justify-center"
                          >
                            {renderAvatar(p.photoUrl, p.name, "w-10 h-10 rounded-full border border-slate-700 shrink-0", "text-xs")}
                            <h4 className="text-[10px] font-bold text-slate-200 mt-2 truncate w-full uppercase">
                              {p.name.split(' ')[0]}
                            </h4>
                            <p className="text-[8px] font-mono text-slate-500 mt-0.5 truncate w-full">{p.designation}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                  </div>
                </div>
              )}

              {/* 4. MY WORKSPACE SESSION ACCOUNT TAB */}
              {activeMobileTab === 'profile' && (
                <div className="flex-1 p-4 flex flex-col justify-between h-full select-none font-sans" id="tab-profile-settings">
                  <div className="space-y-4">
                    
                    {/* Header */}
                    <div className="text-center pb-2 border-b border-slate-900">
                      <h2 className="text-xs font-mono text-indigo-400 uppercase tracking-widest">Logged Session Context</h2>
                    </div>

                    {/* Quick profile badge */}
                    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 text-center space-y-3 relative overflow-hidden">
                      <div className="absolute top-1 right-2">
                        <span className="text-[7px] font-mono text-emerald-400 bg-emerald-950/80 px-1.5 py-0.5 rounded border border-emerald-900 uppercase font-bold">
                          Authorized Secure
                        </span>
                      </div>
                      
                      <div className="mx-auto w-16 h-16 relative">
                        {renderAvatar(currentUser.photoUrl, currentUser.name, "w-16 h-16 rounded-full border-2 border-indigo-500 p-0.5 mx-auto", "text-lg")}
                      </div>

                      <div>
                        <h3 className="font-sans font-bold text-slate-100 text-sm uppercase">{currentUser.name}</h3>
                        <p className="text-[10px] font-mono text-slate-400 mt-0.5">{currentUser.designation}</p>
                        <p className="text-[9px] font-mono text-slate-500 mt-1 uppercase tracking-widest">
                          Clearance: <strong className="text-indigo-400 font-sans">{currentUser.role.replace('_', ' ')}</strong>
                        </p>
                      </div>
                    </div>

                    {/* Beautiful App Installation widget */}
                    <div className="bg-gradient-to-r from-emerald-950/40 via-slate-900 to-indigo-950/40 border border-slate-800 rounded-3xl p-4 space-y-3 shadow-lg">
                      <div className="flex gap-3.5 items-center">
                        <div className="w-12 h-12 bg-slate-950 border border-slate-850 rounded-2xl flex items-center justify-center p-0.5 relative shrink-0">
                          <img
                            src="https://lh3.googleusercontent.com/d/1pGUnA5asuY_z_Z-KwS7y1JlXAWr1-vjf"
                            alt="Proprietor Janardhan Sir"
                            className="w-full h-full object-cover rounded-xl"
                            referrerPolicy="no-referrer"
                          />
                          <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border border-slate-955 flex items-center justify-center text-[8px] text-white">✓</span>
                        </div>
                        <div className="min-w-0">
                          <h4 className="text-xs font-bold text-slate-150 uppercase tracking-wide flex items-center gap-1.5">
                            <Smartphone className="w-4 h-4 text-emerald-400 animate-pulse" />
                            Install Mobile App
                          </h4>
                          <p className="text-[10px] text-slate-400 mt-0.5 leading-relaxed font-sans">
                            Install this on your phone like <strong>WhatsApp / PhonePe</strong>! App icon will show <strong>Janardhan Sir's Face</strong>!
                          </p>
                        </div>
                      </div>

                      <button
                        onClick={handleInstallApp}
                        className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 transition-colors text-white font-sans font-bold text-[11px] rounded-xl flex items-center justify-center gap-1.5 active:scale-95 shadow-md uppercase"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        Install App Now
                      </button>
                    </div>

                    {/* Operational system credentials info list */}
                    <div className="bg-slate-900 border border-slate-800 rounded-2xl divide-y divide-slate-850 text-xs">
                      <div className="p-3 flex justify-between">
                        <span className="text-slate-400 font-bold">Security PIN</span>
                        <strong className="text-slate-205 font-mono font-bold">••••</strong>
                      </div>
                      <div className="p-3 flex justify-between">
                        <span className="text-slate-400">Linked Phone</span>
                        <strong className="text-slate-205 font-mono text-[10px]">{currentUser.phone}</strong>
                      </div>
                      <div className="p-3 flex justify-between">
                        <span className="text-slate-400">Registry ID</span>
                        <strong className="text-slate-300 font-mono text-[9px]">{currentUser.id}</strong>
                      </div>
                      <div className="p-3 flex justify-between">
                        <span className="text-slate-400">E-mail index</span>
                        <strong className="text-slate-400 font-mono text-[9.5px] lowercase truncate max-w-[180px]">{currentUser.email}</strong>
                      </div>
                    </div>

                  </div>

                  {/* Actions Footer */}
                  <div className="space-y-3 pt-4 border-t border-slate-900">
                    <button
                      onClick={handleLogout}
                      className="w-full py-2.5 bg-slate-900 hover:bg-slate-850 active:bg-slate-800 border border-slate-800 hover:text-rose-400 text-slate-300 transition-colors rounded-xl text-xs font-semibold flex items-center justify-center gap-2"
                    >
                      <LogOut className="w-4 h-4 text-slate-400" />
                      Sign Out of Session
                    </button>

                    <p className="text-[9px] font-mono text-slate-600 text-center leading-relaxed">
                      © 2026 Jayanthi Associates • KTDM Portals<br />
                      Proprietor Janardhan Sir Approved.
                    </p>
                  </div>
                </div>
              )}

            </div>

            {/* STICKY PHONE TAB NAVIGATION BAR */}
            <div className="absolute bottom-0 inset-x-0 h-[64px] bg-slate-900/95 backdrop-blur-md border-t border-slate-800/80 z-45 flex items-center justify-around px-1 select-none" id="phone-nav-dock">
              {/* Home Tab */}
              <button 
                onClick={() => {
                  setActiveMobileTab('home');
                  setSelectedChatPartner(null);
                }}
                className={`flex flex-col items-center justify-center flex-1 h-12 rounded-xl transition-all relative ${
                  activeMobileTab === 'home' ? 'text-emerald-400 scale-105 font-sans font-bold' : 'text-slate-400 hover:text-slate-202'
                }`}
                id="tab-btn-home"
              >
                <div className="relative">
                  <Landmark className="w-5 h-5" />
                  <span className="absolute top-0 right-0 w-1.5 h-1.5 bg-emerald-400 rounded-full" />
                </div>
                <span className="text-[8px] font-sans font-bold mt-1 tracking-wider uppercase scale-95 origin-center">Home</span>
              </button>

              {/* Ledger Tab */}
              <button 
                onClick={() => {
                  setActiveMobileTab('ledger');
                  setSelectedChatPartner(null);
                }}
                className={`flex flex-col items-center justify-center flex-1 h-12 rounded-xl transition-all relative ${
                  activeMobileTab === 'ledger' ? 'text-indigo-400 scale-105 font-sans font-bold' : 'text-slate-400 hover:text-slate-202'
                }`}
                id="tab-btn-ledger"
              >
                <Coins className="w-5 h-5" />
                <span className="text-[8px] font-sans font-bold mt-1 tracking-wider uppercase scale-95 origin-center">Ledger</span>
              </button>

              {/* Salary Tab */}
              <button 
                onClick={() => {
                  setActiveMobileTab('salary');
                  setSelectedChatPartner(null);
                }}
                className={`flex flex-col items-center justify-center flex-1 h-12 rounded-xl transition-all relative ${
                  activeMobileTab === 'salary' ? 'text-amber-500 scale-105 font-sans font-bold' : 'text-slate-400 hover:text-slate-202'
                }`}
                id="tab-btn-salary"
              >
                <Building2 className="w-5 h-5" />
                <span className="text-[8px] font-sans font-bold mt-1 tracking-wider uppercase scale-95 origin-center">Salary</span>
              </button>

              {/* Roster Tab */}
              <button 
                onClick={() => {
                  setActiveMobileTab('team');
                  setSelectedChatPartner(null);
                }}
                className={`flex flex-col items-center justify-center flex-1 h-12 rounded-xl transition-all ${
                  activeMobileTab === 'team' ? 'text-slate-200 scale-105 font-sans font-bold' : 'text-slate-400 hover:text-slate-202'
                }`}
                id="tab-btn-team"
              >
                <Users className="w-5 h-5" />
                <span className="text-[8px] font-sans font-bold mt-1 tracking-wider uppercase scale-95 origin-center">Team</span>
              </button>

              {/* Profile Tab */}
              <button 
                onClick={() => {
                  setActiveMobileTab('profile');
                  setSelectedChatPartner(null);
                }}
                className={`flex flex-col items-center justify-center flex-1 h-12 rounded-xl transition-all ${
                  activeMobileTab === 'profile' ? 'text-indigo-300 scale-105 font-sans font-bold' : 'text-slate-400 hover:text-slate-202'
                }`}
                id="tab-btn-settings"
              >
                <UserIcon className="w-5 h-5" />
                <span className="text-[8px] font-sans font-bold mt-1 tracking-wider uppercase scale-95 origin-center">My Pin</span>
              </button>
            </div>

            {/* Smart Home Indicator pill at extreme phone bottom screen */}
            <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-32 h-1 bg-slate-700 rounded-full z-40 hidden md:block" />

          </div>
        </div>

      </div>

      {/* PORTAL REAL MODALS - Rendered over entire application viewport with precise indices */}
      {selectedPerson && (
        <PersonDetailsModal 
          person={selectedPerson} 
          onClose={() => setSelectedPerson(null)} 
          currentUser={currentUser}
          onUpdatePerson={handleUpdatePerson}
          onDeletePerson={handleDeletePerson}
        />
      )}

      {isAddEmployeeOpen && (
        <AddEmployeeModal
          onClose={() => setIsAddEmployeeOpen(false)}
          onAdd={handleAddEmployee}
          nextPin={(employees.length + 4001).toString()}
        />
      )}
    </div>
  );
}

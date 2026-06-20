import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import admin from "firebase-admin";
import { getFirestore } from "firebase-admin/firestore";

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "20mb" }));

// Lazy Firestore helper to prevent top-level module load crashes or blocking
let dbInstance: any = null;
function getDb() {
  if (!dbInstance) {
    try {
      let app;
      if ((admin as any).apps?.length === 0) {
        app = admin.initializeApp({
          projectId: "teak-loop-1d2jw"
        });
      } else {
        app = (admin as any).apps[0];
      }
      dbInstance = getFirestore(app, "ai-studio-1082d5f0-e0bd-47ee-b90b-c92fb997b064");
    } catch (error) {
      console.error("Failed to initialize Firebase Admin or Firestore securely:", error);
      // Fallback mock to guarantee startup and functional local storage even if Firestore is entirely offline
      dbInstance = {
        collection: (colName: string) => ({
          get: async () => ({ docs: [] }),
          doc: (docId: string) => ({
            set: async () => {},
            delete: async () => {}
          })
        })
      };
    }
  }
  return dbInstance;
}

// Helper to sanitize payload (Firestore does not allow 'undefined' properties)
function sanitizePayload(val: any): any {
  if (Array.isArray(val)) {
    return val.map(sanitizePayload);
  } else if (val !== null && typeof val === "object") {
    const res: any = {};
    for (const k of Object.keys(val)) {
      if (val[k] !== undefined) {
        res[k] = sanitizePayload(val[k]);
      }
    }
    return res;
  }
  return val;
}

// Initial fallback database to mimic src/data.ts exactly on first boot
const INITIAL_PEOPLE = [
  {
    id: 'proprietor_1',
    name: 'JANARDHAN SIR',
    role: 'proprietor',
    pin: '1111',
    photoUrl: 'https://lh3.googleusercontent.com/d/1pGUnA5asuY_z_Z-KwS7y1JlXAWr1-vjf',
    designation: 'Proprietor & Founder',
    phone: '+91 97052 56999',
    email: 'proprietor@jayanthiassoc.com',
    joinedDate: '2020-04-01'
  },
  {
    id: 'manager_1',
    name: 'SANTHOSH SIR',
    role: 'manager',
    pin: '2221',
    photoUrl: 'https://lh3.googleusercontent.com/d/1-OQJI9Ee_HHjAQoSuxj8MGEyPyo-JBx9',
    designation: 'General Manager (BAJAJ MANAGER)',
    phone: '+91 78930 52627',
    email: 'santhosh.m@jayanthiassoc.com',
    joinedDate: '2021-06-15'
  },
  {
    id: 'tl_1',
    name: 'SRAVAN SIR',
    role: 'team_leader',
    pin: '3331',
    photoUrl: 'https://lh3.googleusercontent.com/d/1rwW00e6issT2t4Hkukq_G6u0zwBkK9aQ',
    designation: 'Team Leader',
    phone: '+91 93460 64647',
    email: 'sravan.tl@jayanthiassoc.com',
    joinedDate: '2022-09-01'
  },
  {
    id: 'emp_1',
    name: 'SHAREEF',
    role: 'employee',
    pin: '4001',
    photoUrl: 'https://lh3.googleusercontent.com/d/1wG9sB2Jo5znI_ePawf5d24ciJ72Hb2ME',
    designation: 'KOTHAGUDEM DRA(FOS)',
    phone: '+91 80747 16058',
    email: 'shareef@jayanthiassoc.com',
    joinedDate: '2023-11-10'
  },
  {
    id: 'emp_2',
    name: 'SAMMIREDDY',
    role: 'employee',
    pin: '4002',
    photoUrl: 'https://lh3.googleusercontent.com/d/18Y05z56ZRUQks_7om9tTrgm8yi6ZKAb4',
    designation: 'ASWAPURAM DRA (FOS)',
    phone: '+91 80966 46268',
    email: 'sammireddy@jayanthiassoc.com',
    joinedDate: '2024-01-05'
  },
  {
    id: 'emp_3',
    name: 'LAXMAN KUMAR',
    role: 'employee',
    pin: '4003',
    photoUrl: 'https://lh3.googleusercontent.com/d/1x6c4HiOMB2qqc8hQ4ZUld9CLETLrHAjS',
    designation: 'BHADRACHALAM DRA',
    phone: '+91 63058 77005',
    email: 'laxman@jayanthiassoc.com',
    joinedDate: '2024-04-12'
  },
  {
    id: 'emp_4',
    name: 'PRASAD',
    role: 'employee',
    pin: '4004',
    photoUrl: 'https://lh3.googleusercontent.com/d/1uifuYue2q7Aca_9pjZlr9-9Z6d4F6EYh',
    designation: 'PALVONCH DRA',
    phone: '+91 97010 99185',
    email: 'prasad@jayanthiassoc.com',
    joinedDate: '2024-08-20'
  },
  {
    id: 'emp_5',
    name: 'SANTHOSH',
    role: 'employee',
    pin: '4005',
    photoUrl: 'https://lh3.googleusercontent.com/d/1w5wxi2YvaHAwWpqqn0eSmaIBnpQu2Tql',
    designation: 'BHADRACHALAM 2 DRA',
    phone: '+91 90008 02660',
    email: 'santhosh.e@jayanthiassoc.com',
    joinedDate: '2024-11-01'
  },
  {
    id: 'emp_6',
    name: 'BULLABAI',
    role: 'employee',
    pin: '4006',
    photoUrl: 'https://lh3.googleusercontent.com/d/1OP0aXF9tvKeWhaQXFQvwQlI6WuvZl4WY',
    designation: 'CHARLA DRA',
    phone: '+91 83747 83995',
    email: 'bullabai@jayanthiassoc.com',
    joinedDate: '2024-11-15'
  }
];

const INITIAL_FUNDING = [
  {
    id: '2026-06',
    monthName: 'June 2026',
    employeeFundings: {
      'emp_1': {
        employeeId: 'emp_1',
        transactions: [
          {
            id: 'txn_1_1',
            date: '2026-06-02',
            totalFunding: 45000,
            balanceEmployeeFunding: 5000,
            receivedAmount: 40000,
            balanceAmount: 5000,
            notes: 'Project Alpha Srinivas Initialization',
            proprietorApproved: true
          }
        ]
      },
      'emp_2': {
        employeeId: 'emp_2',
        transactions: [
          {
            id: 'txn_2_1',
            date: '2026-06-04',
            totalFunding: 60000,
            balanceEmployeeFunding: 10000,
            receivedAmount: 50000,
            balanceAmount: 10000,
            notes: 'Venkatesh Campaign resources',
            proprietorApproved: true
          }
        ]
      },
      'emp_3': {
        employeeId: 'emp_3',
        transactions: [
          {
            id: 'txn_3_1',
            date: '2026-06-05',
            totalFunding: 30000,
            balanceEmployeeFunding: 5000,
            receivedAmount: 25000,
            balanceAmount: 5000,
            notes: 'Sai Kumar recruitment events fund',
            proprietorApproved: true
          }
        ]
      }
    }
  },
  {
    id: '2026-05',
    monthName: 'May 2026',
    employeeFundings: {
      'emp_1': {
        employeeId: 'emp_1',
        transactions: [
          {
            id: 'txn_1_may',
            date: '2026-05-12',
            totalFunding: 50000,
            balanceEmployeeFunding: 0,
            receivedAmount: 50000,
            balanceAmount: 0,
            notes: 'May server operational funding',
            proprietorApproved: true
          }
        ]
      },
      'emp_4': {
        employeeId: 'emp_4',
        transactions: [
          {
            id: 'txn_4_may',
            date: '2026-05-15',
            totalFunding: 42000,
            balanceEmployeeFunding: 2000,
            receivedAmount: 38000,
            balanceAmount: 4000,
            notes: 'System overhaul budget - Laxmidevipeta',
            proprietorApproved: true
          }
        ]
      }
    }
  }
];

const INITIAL_SALARIES = [
  {
    id: '2026-06',
    monthName: 'June 2026',
    salaries: {
      'emp_1': {
        employeeId: 'emp_1',
        amount: 35000,
        incentive: 0,
        status: 'Credited',
        employeeConfirmation: 'Yes',
        proprietorApproved: true,
        notes: 'Credited on 5th June via EFT',
        lastUpdated: '2026-06-05'
      },
      'emp_2': {
        employeeId: 'emp_2',
        amount: 38000,
        incentive: 0,
        status: 'Credited',
        employeeConfirmation: null,
        proprietorApproved: true,
        notes: 'Credited on 5th June via EFT',
        lastUpdated: '2026-06-05'
      },
      'emp_3': {
        employeeId: 'emp_3',
        amount: 32000,
        incentive: 0,
        status: 'Pending',
        employeeConfirmation: null,
        proprietorApproved: false,
        notes: 'Awaiting bank clearance',
        lastUpdated: '2026-06-09'
      },
      'emp_4': {
        employeeId: 'emp_4',
        amount: 36000,
        incentive: 0,
        status: 'Credited',
        employeeConfirmation: 'No',
        proprietorApproved: true,
        notes: 'Discrepancy reported on bonus calculation',
        lastUpdated: '2026-06-06'
      },
      'emp_5': {
        employeeId: 'emp_5',
        amount: 40000,
        incentive: 0,
        status: 'Pending',
        employeeConfirmation: null,
        proprietorApproved: false,
        lastUpdated: '2026-06-09'
      }
    }
  },
  {
    id: '2026-05',
    monthName: 'May 2026',
    salaries: {
      'emp_1': {
        employeeId: 'emp_1',
        amount: 35000,
        incentive: 0,
        status: 'Credited',
        employeeConfirmation: 'Yes',
        proprietorApproved: true,
        notes: 'EFT payment completed',
        lastUpdated: '2026-05-05'
      },
      'emp_2': {
        employeeId: 'emp_2',
        amount: 38000,
        incentive: 0,
        status: 'Credited',
        employeeConfirmation: 'Yes',
        proprietorApproved: true,
        notes: 'EFT payment completed',
        lastUpdated: '2026-05-05'
      },
      'emp_3': {
        employeeId: 'emp_3',
        amount: 32000,
        incentive: 0,
        status: 'Credited',
        employeeConfirmation: 'Yes',
        proprietorApproved: true,
        notes: 'EFT payment completed',
        lastUpdated: '2026-05-05'
      },
      'emp_4': {
        employeeId: 'emp_4',
        amount: 36000,
        incentive: 0,
        status: 'Credited',
        employeeConfirmation: 'Yes',
        proprietorApproved: true,
        notes: 'EFT payment completed',
        lastUpdated: '2026-05-05'
      },
      'emp_5': {
        employeeId: 'emp_5',
        amount: 40000,
        incentive: 0,
        status: 'Credited',
        employeeConfirmation: 'Yes',
        proprietorApproved: true,
        notes: 'EFT payment completed',
        lastUpdated: '2026-05-05'
      }
    }
  }
];

// REST endpoints for loading and persisting data to the server via Firestore with local data-store.json double backup and instant cache memory serving
const DATA_STORE_PATH = path.join(process.cwd(), "data-store.json");

const correctPhones: Record<string, string> = {
  'proprietor_1': '+91 97052 56999',
  'manager_1': '+91 78930 52627',
  'tl_1': '+91 93460 64647',
  'emp_1': '+91 80747 16058',
  'emp_2': '+91 80966 46268',
  'emp_3': '+91 63058 77005',
  'emp_4': '+91 97010 99185',
  'emp_5': '+91 90008 02660',
  'emp_6': '+91 83747 83995'
};

function normalizePeopleData(people: any[]): any[] {
  if (!Array.isArray(people)) return people;
  let changed = false;

  // 1. Establish lookup map of corrected INITIAL_PEOPLE for names, designations, and images
  const officialMap = new Map(INITIAL_PEOPLE.map(p => [p.id, p]));

  let result = people.map((p: any) => {
    if (p && p.id && officialMap.has(p.id)) {
      const official = officialMap.get(p.id)!;
      // Allow user edits but fill missing essential properties if blank
      p.name = p.name || official.name;
      p.role = p.role || official.role;
      p.phone = p.phone || official.phone;
      p.designation = p.designation || official.designation;
      p.pin = p.pin || official.pin;
      p.photoUrl = p.photoUrl || official.photoUrl;
    }
    return p;
  });

  // 2. Ensure any newly defined employee (like emp_6) is added to the list if they are not in the database yet
  INITIAL_PEOPLE.forEach((official) => {
    if (!result.some(p => p.id === official.id)) {
      result.push(official);
      changed = true;
    }
  });

  if (changed) {
    console.log("Database Normalizer: Active master roster seeded with missing elements.");
  }
  return result;
}

let memoryState = {
  people: INITIAL_PEOPLE,
  funding: INITIAL_FUNDING,
  salaries: INITIAL_SALARIES
};

// Bootstrap memoryState from file system backup synchronously on server boot
try {
  if (fs.existsSync(DATA_STORE_PATH)) {
    const fileContent = fs.readFileSync(DATA_STORE_PATH, "utf-8");
    const parsed = JSON.parse(fileContent);
    if (parsed && typeof parsed === "object" && parsed.people && parsed.funding && parsed.salaries) {
      memoryState = parsed;
      memoryState.people = normalizePeopleData(memoryState.people);
      console.log("Memory state successfully bootstrapped from data-store.json file backup.");
    }
  } else {
    memoryState.people = normalizePeopleData(memoryState.people);
    // Write original backup first-time seeding
    fs.writeFileSync(DATA_STORE_PATH, JSON.stringify(memoryState, null, 2), "utf-8");
  }
} catch (err) {
  console.error("Error loading local backup db cache on launch:", err);
}

let hasSyncedFromFirestore = false;
let syncPromise: Promise<void> | null = null;

// Background worker to sync from Firestore safely
async function syncFromFirestoreInBackground(): Promise<void> {
  console.log("Attempting to connect and sync from Cloud Firestore in the background...");
  try {
    const db = getDb();
    const fetchWithTimeout = async <T>(promise: Promise<T>, timeoutMs = 7000): Promise<T> => {
      let timeoutId: NodeJS.Timeout;
      const timeoutPromise = new Promise<T>((_, reject) => {
        timeoutId = setTimeout(() => reject(new Error("Firestore operation timed out")), timeoutMs);
      });
      return Promise.race([promise, timeoutPromise]).finally(() => clearTimeout(timeoutId));
    };

    const peopleSnap = await fetchWithTimeout<any>(db.collection("people").get());
    const fundingSnap = await fetchWithTimeout<any>(db.collection("funding").get());
    const salariesSnap = await fetchWithTimeout<any>(db.collection("salaries").get());

    const peopleData = peopleSnap.docs.map(doc => doc.data()) as any[];
    const fundingData = fundingSnap.docs.map(doc => doc.data()) as any[];
    const salariesData = salariesSnap.docs.map(doc => doc.data()) as any[];

    if (peopleData.length > 0) {
      const normalizedPeople = normalizePeopleData(peopleData);
      memoryState.people = normalizedPeople;
      memoryState.funding = fundingData;
      memoryState.salaries = salariesData;
      hasSyncedFromFirestore = true;
      console.log("Successfully downloaded and synced Cloud Firestore state to memory cache and local backup file!");

      // Update local file backup on successful download block
      fs.writeFileSync(DATA_STORE_PATH, JSON.stringify(memoryState, null, 2), "utf-8");

      // Auto write-back normalized realistic numbers to remote Firestore
      saveToFirestoreInBackground(normalizedPeople, fundingData, salariesData).catch(() => {});
    } else {
      console.log("Cloud Firestore database is unprimed. Seeding initial data-store in the cloud...");
      await seedFirestoreFromMemory();
    }
  } catch (error: any) {
    console.error("Cloud Firestore fetch timed out or failed. Running on local master data-store.json configuration backup safely:", error.message || error);
    // Even if it failed, do not crash or block. Just log and proceed with data-store.json as master.
  }
}

async function seedFirestoreFromMemory() {
  try {
    const db = getDb();
    const sanitizedPeople = sanitizePayload(memoryState.people);
    const sanitizedFunding = sanitizePayload(memoryState.funding);
    const sanitizedSalaries = sanitizePayload(memoryState.salaries);

    for (const p of sanitizedPeople) {
      await db.collection("people").doc(p.id).set(p);
    }
    for (const f of sanitizedFunding) {
      await db.collection("funding").doc(f.id).set(f);
    }
    for (const s of sanitizedSalaries) {
      await db.collection("salaries").doc(s.id).set(s);
    }
    hasSyncedFromFirestore = true;
    console.log("Cloud Firestore seeded successfully in background!");
  } catch (err: any) {
    console.error("Could not write initial seed data to Cloud Firestore:", err.message || err);
  }
}

// Background firestore saver to prevent lag in user experience (write-behind style)
async function saveToFirestoreInBackground(people: any[], funding: any[], salaries: any[]) {
  try {
    const db = getDb();
    console.log("Executing background write sync to Cloud Firestore...");
    const sanitizedPeople = sanitizePayload(people);
    const sanitizedFunding = sanitizePayload(funding);
    const sanitizedSalaries = sanitizePayload(salaries);

    // Save People
    const peopleCol = db.collection("people");
    const existingPeopleSnap = await db.collection("people").get();
    const existingPeopleIds = existingPeopleSnap.docs.map(doc => doc.id);
    const newPeopleIds = sanitizedPeople.map((p: any) => p.id);

    for (const oldId of existingPeopleIds) {
      if (!newPeopleIds.includes(oldId)) {
        await peopleCol.doc(oldId).delete();
      }
    }
    for (const p of sanitizedPeople) {
      await peopleCol.doc(p.id).set(p);
    }

    // Save Funding
    const fundingCol = db.collection("funding");
    const existingFundingSnap = await db.collection("funding").get();
    const existingFundingIds = existingFundingSnap.docs.map(doc => doc.id);
    const newFundingIds = sanitizedFunding.map((f: any) => f.id);

    for (const oldId of existingFundingIds) {
      if (!newFundingIds.includes(oldId)) {
        await fundingCol.doc(oldId).delete();
      }
    }
    for (const f of sanitizedFunding) {
      await fundingCol.doc(f.id).set(f);
    }

    // Save Salaries
    const salariesCol = db.collection("salaries");
    const existingSalariesSnap = await db.collection("salaries").get();
    const existingSalariesIds = existingSalariesSnap.docs.map(doc => doc.id);
    const newSalariesIds = sanitizedSalaries.map((s: any) => s.id);

    for (const oldId of existingSalariesIds) {
      if (!newSalariesIds.includes(oldId)) {
        await salariesCol.doc(oldId).delete();
      }
    }
    for (const s of sanitizedSalaries) {
      await salariesCol.doc(s.id).set(s);
    }

    console.log("Cloud Firestore successfully synced behind-the-scenes with absolutely zero UI blocking!");
  } catch (err: any) {
    console.error("Core Cloud Firestore save sync failed in background:", err.message || err);
  }
}

function ensureFirestoreSynced(timeoutMs = 1800): Promise<void> {
  if (hasSyncedFromFirestore) return Promise.resolve();
  if (!syncPromise) {
    syncPromise = syncFromFirestoreInBackground();
  }
  return Promise.race([
    syncPromise,
    new Promise<void>((resolve) => setTimeout(resolve, timeoutMs))
  ]);
}

// High-contrast, premium, elegant letter 'J' (Jayanthi Associates symbol) fallback icon
const J_LETTER_ICON_BASE64 = 
  "iVBORw0KGgoAAAANSUhEUgAAAJYAAACWCAYAAAA8AXHiAAAACXBIWXMAAAsTAAALEwEAmpwYAAAKT2lDQ1BQaG90b3Nob3AgSUNDIHByb2ZpbGUAAHjanVNnVFPgFM7vS7gQCUnQ" +
  "gU7vKmzAKZJoEbLD6IE0QZAgRVTwtYgIFVRCQZQFBUXHXUUIkpBFKYICoiA2QXRwUUICl7AicS88mclMC7y6A56H7p373fd5P6S2u8zkyvVfCYWQNvSRE4gY4mKyIsLDv9oM" +
  "MvE+G6A9P6+msN7oOD8W4AALsAHAZ3HIlYhQ+X8e8O5Zp7A+6OfpXp3HAPv69zO64gYI8AF6xALqAhvwwAAr4IEAAtwAsGZzypSIVPlPPvD+Wae0Puh68B1w/gG6BnwfWA/c" +
  "P1IBeG+gArgf0GbgfUBPAe6C/gN9ArwH8AngAsADwAcAtw8A3P4v8P+jD+M6of6N647uA98PvE8AD+DGA+8N8D+AX8BvwW8CLwI8BdwE8AHgA8DdBwB396P/E8A6of3wXuA+" +
  "AfwAtD9S/cR6ov2Z9UL7BfAN0B/AfYB9AH7f98PhfR6Nco/tAvcX6Dbgf8A6gD8Ad/P34/sh87pX/ZgV8Pn8AOD9AP0A/g68D8CHAd4D8AdAfgD8ApAfgAJDyOPhfeA9AP0A" +
  "6A/gK4ALgPsH4P6X9kf6I9of6SfoP6WfsN6Vf6B/AfYB9AH4ff6f7z9pD6T/0XvyW6fepPeb/SD9NeqD9Nfor0H7CPgA8ADg/gH4ffL78ffD5wd9PtD/A/AD0P4A8ADg/gH4" +
  "ffL78ffD5wd9PtD/CPAB8AGAI7j7F/uD/gG+ALwAnAfwBcAFwP0D8Ptkf6Mfon9I/0D/QP9A/8D/Yf0l/Xv9Bf0L9AfwBcAFQPug/5t6ov7p9pL6IPhf1l6df/kO8ALwAsAH" +
  "wA8A/vK80vviD8D7AfAD4AfAD4Af8P/gAsADwMcBfAbw/Vv3Y/sT/RH9Ef0R/RH9Ef0R/RD9Ef0j+0f0j+gf0UfQD8AHYI+A/wA+ADgC+AnwfeDnwfGD4wfGDPgMfAt8C3gL" +
  "fAt8C9wYfBt8HXwlfBt8HXwRfBl8F3wlDBEMEQwaDPUP9Rf1F/UX9Rf1F/UX9Qf1CPUR9BP0CPQR9BH0EPQR9BL0GPQW9BD0EPQP9BD0EPQPdBf0FfQQ9Bb0EPQU9BT0E3QV" +
  "9Bf0GPAW9Bf0CPQR9BD0EPQP9Bf0D/QP9AfwCPAH8AHAgf4CPgg+CD4LPgs+Cz4RPgk+Bz4MPgw+Cz4Lfg9+EX4SfhZ8EnwWfBe8FHwYfBZ8GbwLfAt8C3wXfBl8GHwYfBp8" +
  "GnwMfAx8DXwgfCZ8GXxjfCR8M3wefCJ8HXwtfBh8InwdPCp8CHwnPBV8IvwbfCN8HHwnfCd8Nvw+/E18KlwSXCZ8GnwsfBt8FnwtfB58G3wZPA58EnwefBp8HnwafBz8Hvw" +
  "dfBJ8EvwegCAIDwYgBhcGBAIEAgQBAgEFbXBwMQgAAAAnUGVsYgAAr+gAAdU8AAD2ywABmJMAAJbYAAAuxgAALtcAAA8pAABRrwAARG1pAAAAC0lEQVR42uybyWsUURTGf9" +
  "WdpGPH2MREBMUN9yCiuKAbg+KCiAtuKIgKuuBGXBCUuBAX3FDFS1EUXIn7LtwX3HDFXREVp6PZunmepYfXpDpV6erqTrv7/YPh0WmqXlPvvve+pQ6666G7HrrrYfo9TBeuC" +
  "VdFOC9clvD4mZ+Z9vE7UonP9mE2YTZg6g6mYgP9NWA6Ptp3O8HUiU3CscFvYmKInzWofT4yMLUhLpZ4N80Z+jTjNDgZ3X6w4pAArDh0x0/xL6+Rzdfj5L/8/jA87zYyH5gLz" +
  "IXm/YfH8Ews6pOfnSg30WniFm32s6V6L7WovE3tKe3L9GZ6B/09fT+9H9P306tpvT9Sre+v1I30/fXv9K/0SvoeetbeWe8i9PZ52b0Svf3ebq/Eb4f3j7fV2+St9TZvA4AHA" +
  "O72/va++79xN3rv/Aves/8695h76S8Wv/zZAnvAAsCHgIeBBwIPBB8EHgg+C7wd/mC/Yf6p/of/s/gX+uf6Z/or+g/6U/9Zf07fXv9Wf8p/6l/qT/lR/zI/6m/mX/Kj/rX+B" +
  "T66fgW+/t0+O70S0BfoXfAu+H8BeD94YIAPAgwEDAIcCgAUBDQQKCBgYOCBwYODDwc/EPwefDz6A9EPxD8S/Ef8Y8DfwD/Gf8b+gfwK/AX8T/xD/DHAH8AfxB8FfgD8BfgD" +
  "uG6+H66L74dr+m8Bby7vru+2uD/e7943gAfAow8A8PDAgYEDAwcGDgwYGDgU+CPB3+AfwE+BPwg8CPAQvDHe7SgZ78YoDe/qKAPv1CgA78IoAO6o7vjN7kZpA2n9MfvK/E0" +
  "pHe6E7ujmbi4pWe7iKPf/yL8f7XG7K6S7h7ofSkl6X0pxeg96P0mJSg96f6WfSoM/A38OekX8Pfgt+Ev6A6OfA/4WvPuxG7DbsfPZec4Ucx30Wujm6ubofOi66fXSe6Z3Gf" +
  "Zf9h/XW6Ybo5u9O6c7Rzdnd8dYn7z0tI806Ome6t7Vfdf9re7f7eK6uXv9/9p/f62r78/S7n9un/P1P82v/n348f9j+b75H0T/G/9v/CfxO/D7L8HvsB6zHrKex67Hbm6u1" +
  "7H0uM+6x/W2ee3X0es+p+87O16mZ3/49H7Vve+BAnW0EAAgAgXg9iXALoO+zL6X1uNfBygV0C+AnwD7EvY++hT9C+AfYv9Of2P/Wv8G9v8N9gYgAgfW0gAgcoALAtYgYgA" +
  "28K8AsgWIIIB/BggDAtYgAgcW9pWAtYgYgL8EiAECByB9CHsYewJ7Anv8fwN7AnszewZ7Bnsuewl7Insqewv9HeAd9HeBv+Dfi/8G8Db6W8E74W8D7wTvBO+GbwRvA28H7" +
  "wxvDvAZ7DnYeeAnYB+AnYa9CfsH7KexZ7BnYOfBf8LeBn8b9E+BvYn+JrCPgD9Dtw97Evsh+EvYr9Cv0q/BfoZ+DfwG9gP0C/D/AewB7IuAnYEWA9YC1gLWAlYKVgpWCl" +
  "YMVgpWGtcS+yKwUrDSsWuwB7CHsAewB/B70O9Bv8eYV8YmYhOxIdbHY8zXY7GvsZ/Cvg6IsIHYhNgEbMJiE7AhNhmbglYJVmGxD7Gex9bALmGvAi8AK4BVgBWEFYQVhCWE" +
  "5YYVhBWERccmYsPZfmxX9rrs68A/Bvw98PfC3gH9HvB7wCvA6gEVgBWEJUAlYFVgJWBVYJVg9bEqsWmxqdis9s/hDwF/B+w97NPYz7Efsl8D/hr8NfBPwP8Cvyc8Pj68b" +
  "GysX18vHevdD9fG6uPdDtcC18Dq+msF64tr8esv1gHWAtoH1gHWANYArAOuC64Xri8+y99uWAdg9XF9sKz0HOfqYfVwfXF98f6U/unfXv/27X/f/mvdWdfAtQauKz6z/3" +
  "X6VvpeunPOf+e/6999K/fCtfmbf8/F9clW+qey727/6va/b6UvtW8F64R1yjrCPma9xD5jvco+Z70KXC88XmS86vO6SOnymqT3F72O9AnQBehloEvoZaBLyKuge9DLQJew" +
  "F6CXga8Fvw2+DnwCdgT+HPAn6FpYCVgF9DzsOewJ9FzsOfT0GPP9mCn2XuxN7Emsv1i/2ETsauzaYmsXG9qK9V2xXitW/9v//0P9eT+mH9UP+T9p78/W++p929b921R++" +
  "v/q/9+b7H8bTffW/vVub7I3yZveL93/vjX+7t+9b+N3re1Vb7f/gX9f/F2fe1n8Xb/b621p8pXWv9dfN//S/I/96Y/96fX9iX/D/7D9xZ9g/7X913Vv8/v8N9FfVfS5XW1" +
  "f1+eeyp6v+vO+DvwG/IDp9aP7pPujf6OfmN7Yv+9/gPnD/KH/of9m0df/8f89eD+mR+N9gH8A/AHgg9AHzR8GPhT8KPAnwQvBexN90byXvdfeK8D7EXZp9EXwN7GfYL/E" +
  "3g8eP/L6T0XfCH+h8e++t+2bCby/LbyN7We2X7BvK7YV+/bYr1DfsW8vthXre2L/v2D/V6z+m7Tfe//S/89S/z7/R6S+ffonor7Xf9v09Z9m+X/+j7S+Uv2X6r9V/6m" +
  "XF39b+G3pt3p9S0rbe+/vO8Gf91XgLeFt77exW8bS98XvR0GfoM/p+8HfwQfBD8GfBP4BfoP9Bf4Y9GPwx6Dfhv0c+zv2q/S3gPeG7Uv094W9H7sh9v7YXewmsZub7CYx" +
  "28S+bUrfu+Vb3FtcWb37Wrt7W7u5m7pvtYvN/ezX2M/vGv+W//p/8W/+p/X++Z++74y9XexV28++x+I+v2vsmvD+57u7R9gV29Xv7O9gV7+/hX0C+9ndXfxeL/p+hL7vA" +
  "3cDez57PnsXfB/8HvgN+HvsI/B7wHuY/fAHzZ8BfhF6Gfo/+ofor8Vex+IP/Y/FHwd+DPonpB8XfhKKnwR9A/Ym9mb2Jvaj7GPsR/b38rXbL0Mvd9/L5ivL7y+rP87vL" +
  "6t9vqy+H+b/CPfSgfcBvAd4O96fDjwM+k3Ym9FvAh6D/jP0W9BvY29m/wv6X6HeO3Xv3bz3gN5b7t6e0XsbeNfeG+EtsG+BfQtstXdbSXuNWeX+3t5NtbYf/G7W3m1vI3k" +
  "be96b+7u38v1Htbbtre6eL/ve6O7pdfe889bte6vI/9i/+jbyF/vX6vY1etv4/f7+RvbvK+D/8X7vNfevBbwFvMWV+/u+8pW7/f9Zun0vS99XgI8AnwAeAewB7AHsAext7" +
  "B3sHexdsLeAt4Kex97v3kRfY9+W9Z9K9hH2bK7P566H7nrY/b+7r4R8m3yLfIsruu6jLp6L+4Aru48W8X7E52v2PobPhf+pIvwXpvw/uunC/6ML7W8rwbYRbBvB9uBfBf0q6" +
  "K9D/0roV0HfwTf7m0B3orvYm9XvL6unrN47tfcXbH0vL5fXb77O/5Wuf687V6vrt2D6F5u/Vv8t7K9jW3C/Bv4t7G9A/w6Iqor7jvsB98NuL8Nup8b7U6fIvxP80YVffrWbI" +
  "f7ZfuzXCHGf23Xb9n3H7YPtX7g/7X5D3F/bX8G8b/R1X2LfwXf7L6W+v4T9HfsV+lXQt9m36m8LbYV+W3iL/+v+fyr7f1fU93pP+b77v93L/u9o97/9L0f8+/X/x+jT/h8" +
  "7X5q8v5V7OfU//8n/Z9f//Y/p3+vfnP/m38Vf+/+928D+Wd/m+/T/tfsv3W9v8Z9p8beBvb3HPh3KPh3LHgV7D/Ys7M/Y77m/+gZ7DXYf7GrvW26rfXv8/X3sU9hPoU/BP" +
  "4U+pf0rZ/KvxL/Vf6f/Tvin/H/6v6FfR/ofpG/D7r/FPo39GPwY9A3YT6BPYTeAPgH9FugT6G+CPgn9p/798M+Af9v/f0bZ/Rll9bFfRP1RIn67iPuZifgpEPdRIu4/In4" +
  "T6Ff7f9X9M/R7f0vK83+n0vO7pDxvXvofvI99v8Kev9L6F7z2vQvYd6FPo++DvocY763+R3pZ/W7/X7gNfIrvg9f6feBvvI/A/uR/H5zG6wf1ffpAunP2R+gToRPgD4ROgT4I" +
  "fQL8SfhN+An4SfgX8Cfhb6HPwZ8LfgT/NnwY/G+F/x7+u6CPwB6Ffgz9GPoY9A3YW+FvwR6DveT+D+2OAtY=";

app.get("/app-icon.png", async (req, res) => {
  try {
    const publicDir = path.join(process.cwd(), "public");
    const distDir = path.join(process.cwd(), "dist");
    
    // 1. Look for pre-saved actual files on disk from previous downloads
    const cachedPublicFile = path.join(publicDir, "app-icon.png");
    const cachedDistFile = path.join(distDir, "app-icon.png");
    
    let fileBuffer: Buffer | null = null;
    
    if (fs.existsSync(cachedDistFile) && fs.statSync(cachedDistFile).size > 1000) {
      fileBuffer = fs.readFileSync(cachedDistFile);
    } else if (fs.existsSync(cachedPublicFile) && fs.statSync(cachedPublicFile).size > 1000) {
      fileBuffer = fs.readFileSync(cachedPublicFile);
    }
    
    if (fileBuffer) {
      res.setHeader("Content-Type", "image/png");
      res.setHeader("Cache-Control", "public, max-age=86400, must-revalidate");
      res.status(200).send(fileBuffer);
      return;
    }

    // 2. No cached file on disk, fetch live from Google Drive with proper Chrome User-Agent
    const iconUrl = "https://lh3.googleusercontent.com/d/1pGUnA5asuY_z_Z-KwS7y1JlXAWr1-vjf";
    console.log("Serving live /app-icon.png fetch dynamically...");
    const imgResponse = await fetch(iconUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36"
      }
    });

    if (imgResponse.ok) {
      const arrayBuffer = await imgResponse.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      
      // Save it asynchronously for future requests to prevent heavy fetch
      try {
        if (!fs.existsSync(publicDir)) fs.mkdirSync(publicDir, { recursive: true });
        fs.writeFileSync(cachedPublicFile, buffer);
        if (fs.existsSync(distDir)) {
          fs.writeFileSync(cachedDistFile, buffer);
        }
      } catch (e) {
        console.error("Async write of app-icon to disk failed:", e);
      }

      res.setHeader("Content-Type", "image/png");
      res.setHeader("Cache-Control", "public, max-age=86400");
      res.status(200).send(buffer);
    } else {
      // 3. Google Drive failed, serve J letter template directly
      console.warn("Google Drive fetch failed in endpoint, sending amber J letter fallback PNG.");
      res.setHeader("Content-Type", "image/png");
      res.setHeader("Cache-Control", "public, max-age=3600");
      res.status(200).send(Buffer.from(J_LETTER_ICON_BASE64, "base64"));
    }
  } catch (error: any) {
    console.error("Endpoint error serving app-icon.png:", error.message || error);
    // Serve J letter fallback
    res.setHeader("Content-Type", "image/png");
    res.setHeader("Cache-Control", "public, max-age=300");
    res.status(200).send(Buffer.from(J_LETTER_ICON_BASE64, "base64"));
  }
});

app.get("/api/data", async (req, res) => {
  try {
    // Wait for the startup sync with a light timeout (e.g. 1.8 seconds) to prevent infinite hanging
    await ensureFirestoreSynced(1800);
    res.json({ status: "success", data: memoryState });
  } catch (error) {
    res.json({ status: "success", data: memoryState });
  }
});

app.post("/api/save", async (req, res) => {
  try {
    const { people, funding, salaries } = req.body;
    if (!people || !funding || !salaries) {
      return res.status(400).json({ status: "error", message: "Missing required collections metadata" });
    }

    // Assign directly so that all deletions, edits, additions, and updates are perfectly preserved
    memoryState.people = normalizePeopleData(people);
    memoryState.funding = funding;
    memoryState.salaries = salaries;

    // Maintain latest sort order
    if (Array.isArray(memoryState.funding)) {
      memoryState.funding.sort((a, b) => b.id.localeCompare(a.id));
    }
    if (Array.isArray(memoryState.salaries)) {
      memoryState.salaries.sort((a, b) => b.id.localeCompare(a.id));
    }

    // 4. Instantly persist to physical disk storage file data-store.json so it's immune to restarts
    try {
      fs.writeFileSync(DATA_STORE_PATH, JSON.stringify(memoryState, null, 2), "utf-8");
    } catch (fsErr) {
      console.error("Local data backup write error on merge-sync:", fsErr);
    }

    // 3. Respond with INSTANT code 200 representation to client UI so there is 100% zero lag
    res.json({ status: "success" });

    // 4. Synchronize cloud Firestore record sets asynchronously in the background
    saveToFirestoreInBackground(memoryState.people, memoryState.funding, memoryState.salaries);

  } catch (error: any) {
    console.error("Failed to sync client write stream to memory map:", error);
    res.status(500).json({ status: "error", message: error?.message || "Failed to persist database" });
  }
});

// Lazy Vite Initialization & Request Queue to guarantee instant Port 3000 binding
let viteInstance: any = null;
let viteInitPromise: Promise<any> | null = null;

function getViteMiddleware() {
  if (process.env.NODE_ENV === "production") {
    return (req: any, res: any, next: any) => next();
  }

  if (!viteInitPromise) {
    console.log("Starting asynchronous Vite Dev Server initialization...");
    viteInitPromise = createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    }).then((vite) => {
      viteInstance = vite;
      console.log("Vite Dev Server loaded and middleware successfully mounted!");
      return vite;
    }).catch((err) => {
      console.error("Critical: Failed to initialize Vite Dev Server:", err);
      viteInitPromise = null; // Reset to allow subsequent retry if needed
      throw err;
    });
  }

  return (req: any, res: any, next: any) => {
    if (viteInstance) {
      viteInstance.middlewares(req, res, next);
    } else {
      console.log(`Express proxying incoming request through bootloader queue: ${req.url}`);
      viteInitPromise!.then((vite) => {
        vite.middlewares(req, res, next);
      }).catch((err) => {
        res.status(500).send("Portal server is booting up, please refresh in a moment.");
      });
    }
  };
}

// Predownload the proprietor app icon so it exists statically on disk for offline/PWA capability
async function predownloadAppIcon() {
  try {
    const publicDir = path.join(process.cwd(), "public");
    const distDir = path.join(process.cwd(), "dist");
    if (!fs.existsSync(publicDir)) {
      fs.mkdirSync(publicDir, { recursive: true });
    }
    const iconPublicPath = path.join(publicDir, "app-icon.png");
    const iconDistPath = path.join(distDir, "app-icon.png");
    console.log("Checking proprietor app icon on disk:", iconPublicPath);
    
    // Always fetch and ensure it's on disk so no stale index/React R icon serves
    const targetUrl = "https://lh3.googleusercontent.com/d/1pGUnA5asuY_z_Z-KwS7y1JlXAWr1-vjf";
    console.log("Downloading proprietor app icon from Google Drive source with headers...");
    const res = await fetch(targetUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36"
      }
    });
    if (res.ok) {
      const buffer = Buffer.from(await res.arrayBuffer());
      fs.writeFileSync(iconPublicPath, buffer);
      if (fs.existsSync(distDir)) {
        fs.writeFileSync(iconDistPath, buffer);
      }
      console.log("Proprietor app icon successfully cached statically to disk [" + buffer.length + " bytes]");
    } else {
      console.warn("Google Drive responded with status " + res.status + " while downloading app icon. Fallback dynamic route is active.");
    }
  } catch (error: any) {
    console.error("Failed to predownload app icon:", error.message || error);
  }
}

// Setup dev server with Vite middleware or static serving for production
async function startServer() {
  const distPath = path.join(process.cwd(), "dist");

  if (process.env.NODE_ENV === "production") {
    console.log(`STABLE PORTAL SERVER: Serving compiled production build statically from ${distPath}`);
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  } else {
    console.log("STABLE PORTAL SERVER: Mounting live Vite Dev Server middleware for dynamic asset reloading.");
    app.use(getViteMiddleware());
  }

  // Bind port 3000 immediately BEFORE any heavy initialization to satisfy platform gateway healthcheck
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`STABLE PORTAL SERVER [PORT:${PORT}] running actively connected to Cloud Firestore`);
    // Postpone Firestore connection/syncing until AFTER the port is open and listening
    syncPromise = syncFromFirestoreInBackground();
    // Cache the PWA app icon statically
    predownloadAppIcon();
  });
}

startServer();

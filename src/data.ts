/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Person, MonthlyFunding, MonthlySalary } from './types';

// Let's use high-quality, high-contrast Unsplash avatars that look like professional headshots.
// We can use fallbacks or nice illustrative portraits.
export const INITIAL_PEOPLE: Person[] = [
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

export const INITIAL_FUNDING: MonthlyFunding[] = [
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

export const INITIAL_SALARIES: MonthlySalary[] = [
  {
    id: '2026-06',
    monthName: 'June 2026',
    salaries: {
      'emp_1': {
        employeeId: 'emp_1',
        amount: 35000,
        status: 'Credited',
        employeeConfirmation: 'Yes',
        proprietorApproved: true,
        notes: 'Credited on 5th June via EFT',
        lastUpdated: '2026-06-05'
      },
      'emp_2': {
        employeeId: 'emp_2',
        amount: 38000,
        status: 'Credited',
        employeeConfirmation: null,
        proprietorApproved: true,
        notes: 'Credited on 5th June via EFT',
        lastUpdated: '2026-06-05'
      },
      'emp_3': {
        employeeId: 'emp_3',
        amount: 32000,
        status: 'Pending',
        employeeConfirmation: null,
        proprietorApproved: false,
        notes: 'Awaiting bank clearance',
        lastUpdated: '2026-06-09'
      },
      'emp_4': {
        employeeId: 'emp_4',
        amount: 36000,
        status: 'Credited',
        employeeConfirmation: 'No',
        proprietorApproved: true,
        notes: 'Discrepancy reported on bonus calculation',
        lastUpdated: '2026-06-06'
      },
      'emp_5': {
        employeeId: 'emp_5',
        amount: 40000,
        status: 'Pending',
        employeeConfirmation: null,
        proprietorApproved: false,
        lastUpdated: '2026-06-09'
      },
      'emp_6': {
        employeeId: 'emp_6',
        amount: 30000,
        status: 'Pending',
        employeeConfirmation: null,
        proprietorApproved: false,
        lastUpdated: '2026-06-09'
      },
      'emp_7': {
        employeeId: 'emp_7',
        amount: 42000,
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
        status: 'Credited',
        employeeConfirmation: 'Yes',
        proprietorApproved: true,
        notes: 'EFT payment completed',
        lastUpdated: '2026-05-05'
      },
      'emp_2': {
        employeeId: 'emp_2',
        amount: 38000,
        status: 'Credited',
        employeeConfirmation: 'Yes',
        proprietorApproved: true,
        notes: 'EFT payment completed',
        lastUpdated: '2026-05-05'
      },
      'emp_3': {
        employeeId: 'emp_3',
        amount: 32000,
        status: 'Credited',
        employeeConfirmation: 'Yes',
        proprietorApproved: true,
        notes: 'EFT payment completed',
        lastUpdated: '2026-05-05'
      },
      'emp_4': {
        employeeId: 'emp_4',
        amount: 36000,
        status: 'Credited',
        employeeConfirmation: 'Yes',
        proprietorApproved: true,
        notes: 'EFT payment completed',
        lastUpdated: '2026-05-05'
      },
      'emp_5': {
        employeeId: 'emp_5',
        amount: 40000,
        status: 'Credited',
        employeeConfirmation: 'Yes',
        proprietorApproved: true,
        notes: 'EFT payment completed',
        lastUpdated: '2026-05-05'
      },
      'emp_6': {
        employeeId: 'emp_6',
        amount: 30000,
        status: 'Credited',
        employeeConfirmation: 'Yes',
        proprietorApproved: true,
        notes: 'EFT payment completed',
        lastUpdated: '2026-05-05'
      },
      'emp_7': {
        employeeId: 'emp_7',
        amount: 42000,
        status: 'Credited',
        employeeConfirmation: 'Yes',
        proprietorApproved: true,
        notes: 'EFT payment completed',
        lastUpdated: '2026-05-05'
      }
    }
  }
];

// Helper to save to/load from localStorage
export const loadLocalData = <T>(key: string, defaultValue: T): T => {
  try {
    const serialized = localStorage.getItem(`jayanthi_ktdm_${key}`);
    if (serialized === null) return defaultValue;
    return JSON.parse(serialized);
  } catch (error) {
    console.error(`Error loading state ${key}`, error);
    return defaultValue;
  }
};

export const saveLocalData = <T>(key: string, data: T): void => {
  try {
    const serialized = JSON.stringify(data);
    localStorage.setItem(`jayanthi_ktdm_${key}`, serialized);
  } catch (error) {
    console.error(`Error saving state ${key}`, error);
  }
};

/**
 * Automatically converts normal Google Drive file viewer URLs and sharable links
 * to direct high-performance stream/rendering URLs.
 */
export function cleanGoogleDriveUrl(url: string): string {
  if (!url) return url;
  const trimmed = url.trim();
  // Regex to extract file ID from common Google Drive link types:
  // - drive.google.com/file/d/FILE_ID/view?usp=sharing
  // - drive.google.com/open?id=FILE_ID
  // - docs.google.com/file/d/FILE_ID/edit
  const match = trimmed.match(/(?:drive\.google\.com\/(?:file\/d\/|open\?id=)|docs\.google\.com\/(?:file\/d\/|open\?id=))([a-zA-Z0-9_-]{25,50})/);
  if (match && match[1]) {
    return `https://lh3.googleusercontent.com/d/${match[1]}`;
  }
  return trimmed;
}

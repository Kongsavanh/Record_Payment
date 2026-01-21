
export enum UserRole {
  ADMIN = 'ADMIN',
  STAFF = 'STAFF'
}

export interface User {
  id: string;
  name: string;
  username: string;
  password?: string;
  role: UserRole;
}

export interface Store {
  id: string;
  name: string;
}

export interface ShiftType {
  id: string;
  name: string;
}

export interface Expense {
  id: string;
  amount: number;
  description: string;
  imageUrl?: string;
}

export interface Entry {
  id: string;
  date: string;
  storeId: string;
  userId: string;
  shiftTypeId: string;
  totalRevenue: number;
  transferAmount: number;
  expectedCash: number; // calculated: totalRevenue - transferAmount
  actualCashInDrawer: number;
  difference: number; // calculated: expectedCash - actualCashInDrawer
  expenses: Expense[];
  totalExpenses: number;
  finalBalance: number; // calculated: actualCashInDrawer - totalExpenses
  createdAt: string;
}

export interface AppState {
  users: User[];
  stores: Store[];
  shiftTypes: ShiftType[];
  entries: Entry[];
  currentUser: User | null;
}

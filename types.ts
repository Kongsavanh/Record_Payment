
export enum UserRole {
  ADMIN = 'ADMIN',
  STAFF = 'STAFF'
}

export enum EntryStatus {
  PENDING = 'PENDING',
  VERIFIED = 'VERIFIED'
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
  entry_id?: string;
  amount: number;
  description: string;
  image_url?: string;
}

export interface Entry {
  id: string;
  date: string;
  store_id: string;
  user_id: string;
  shift_type_id: string;
  total_revenue: number;
  transfer_amount: number;
  expected_cash: number;
  actual_cash_in_drawer: number;
  difference: number;
  expenses: Expense[];
  total_expenses: number;
  final_balance: number;
  status: EntryStatus;
  created_at: string;
}

export interface AppState {
  users: User[];
  stores: Store[];
  shiftTypes: ShiftType[];
  entries: Entry[];
  currentUser: User | null;
}

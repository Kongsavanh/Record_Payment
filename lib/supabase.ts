
import { createClient } from '@supabase/supabase-js';

/**
 * --- ຄຳສັ່ງ SQL ສຳລັບສ້າງ Tables ໃນ Supabase ---
 * 
 * -- 1. ຕາຕະລາງ Users
 * CREATE TABLE users (
 *   id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
 *   name TEXT NOT NULL,
 *   username TEXT UNIQUE NOT NULL,
 *   password TEXT NOT NULL,
 *   role TEXT NOT NULL DEFAULT 'STAFF',
 *   created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
 * );
 * 
 * -- 2. ຕາຕະລາງ Stores
 * CREATE TABLE stores (
 *   id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
 *   name TEXT NOT NULL,
 *   created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
 * );
 * 
 * -- 3. ຕາຕະລາງ Shift Types
 * CREATE TABLE shift_types (
 *   id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
 *   name TEXT NOT NULL,
 *   created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
 * );
 * 
 * -- 4. ຕາຕະລາງ Entries
 * CREATE TABLE entries (
 *   id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
 *   date DATE NOT NULL DEFAULT CURRENT_DATE,
 *   store_id UUID REFERENCES stores(id) ON DELETE SET NULL,
 *   user_id UUID REFERENCES users(id) ON DELETE SET NULL,
 *   shift_type_id UUID REFERENCES shift_types(id) ON DELETE SET NULL,
 *   total_revenue NUMERIC DEFAULT 0,
 *   transfer_amount NUMERIC DEFAULT 0,
 *   expected_cash NUMERIC DEFAULT 0,
 *   actual_cash_in_drawer NUMERIC DEFAULT 0,
 *   difference NUMERIC DEFAULT 0,
 *   total_expenses NUMERIC DEFAULT 0,
 *   final_balance NUMERIC DEFAULT 0,
 *   created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
 * );
 * 
 * -- 5. ຕາຕະລາງ Expenses
 * CREATE TABLE expenses (
 *   id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
 *   entry_id UUID REFERENCES entries(id) ON DELETE CASCADE,
 *   amount NUMERIC DEFAULT 0,
 *   description TEXT,
 *   image_url TEXT,
 *   created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
 * );
 */

const supabaseUrl = (window as any).process?.env?.SUPABASE_URL || 'https://ixgchmwlsmtvnsubqpza.supabase.co';
const supabaseAnonKey = (window as any).process?.env?.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml4Z2NobXdsc210dm5zdWJxcHphIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg5Nzk4MjgsImV4cCI6MjA4NDU1NTgyOH0.IohrIt1IoQVh3SbvRUZyA7N27bDC8lTedBjYNeNFpFE';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

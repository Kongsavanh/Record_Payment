
import React, { useState, useEffect, useCallback } from 'react';
import { 
  AppState, 
  User, 
  UserRole, 
  Entry, 
  Store, 
  ShiftType,
  EntryStatus
} from './types';
import { 
  TRANSLATIONS 
} from './constants';
import Login from './views/Login';
import Home from './views/Home';
import EntryForm from './views/EntryForm';
import Admin from './views/Admin';
import Reports from './views/Reports';
import Profile from './views/Profile';
import { supabase } from './lib/supabase';
import { 
  Home as HomeIcon, 
  FileText, 
  Settings, 
  UserCircle, 
  LogOut,
  Plus,
  Loader2,
  RefreshCcw,
  AlertTriangle
} from 'lucide-react';

const App: React.FC = () => {
  const [state, setState] = useState<AppState>({
    users: [],
    stores: [],
    shiftTypes: [],
    entries: [],
    currentUser: null,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'home' | 'record' | 'reports' | 'admin' | 'profile'>('home');

  const fetchInitialData = useCallback(async (showLoader = false) => {
    const getEnv = (name: string): string | undefined => {
      try {
        const metaEnv = (import.meta as any).env;
        if (metaEnv && metaEnv[name]) return metaEnv[name];
        if (typeof process !== 'undefined' && process.env && process.env[name]) return process.env[name];
      } catch (e) {}
      return undefined;
    };

    const supabaseUrl = getEnv('VITE_SUPABASE_URL');
    if (!supabaseUrl || supabaseUrl.includes('placeholder')) {
      setError("ກະລຸນາຕັ້ງຄ່າ VITE_SUPABASE_URL ໃນ Environment Variables");
      setIsLoading(false);
      return;
    }

    if (showLoader) {
      setIsLoading(true);
      setError(null);
    }
    
    try {
      const fetchPromise = Promise.all([
        supabase.from('users').select('*'),
        supabase.from('stores').select('*'),
        supabase.from('shift_types').select('*'),
        supabase.from('entries').select('*, expenses(*)').order('created_at', { ascending: false })
      ]);

      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error("ການເຊື່ອມຕໍ່ຖານຂໍ້ມູນໃຊ້ເວລາດົນເກີນໄປ")), 15000)
      );

      const [usersRes, storesRes, shiftsRes, entriesRes] = await Promise.race([
        fetchPromise,
        timeoutPromise
      ]) as any;

      if (usersRes.error) throw usersRes.error;
      if (storesRes.error) throw storesRes.error;
      if (shiftsRes.error) throw shiftsRes.error;
      if (entriesRes.error) throw entriesRes.error;

      setState(prev => ({
        ...prev,
        users: usersRes.data || [],
        stores: storesRes.data || [],
        shiftTypes: shiftsRes.data || [],
        entries: entriesRes.data || [],
      }));
    } catch (err: any) {
      console.error('Error fetching data:', err);
      setError(err.message || "ເກີດຂໍ້ຜິດພາດໃນການເຊື່ອມຕໍ່ຂໍ້ມູນ.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInitialData(true);

    const channel = supabase
      .channel('db-realtime-sync')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public' },
        () => {
          fetchInitialData(false); 
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchInitialData]);

  const login = (user: User) => {
    setState(prev => ({ ...prev, currentUser: user }));
    setActiveTab('home');
  };

  const logout = () => {
    setState(prev => ({ ...prev, currentUser: null }));
  };

  const updateUser = async (updatedUser: User) => {
    const { error } = await supabase
      .from('users')
      .update({ name: updatedUser.name, password: updatedUser.password })
      .eq('id', updatedUser.id);
    
    if (error) throw error;
    if (state.currentUser?.id === updatedUser.id) {
      setState(prev => ({ ...prev, currentUser: updatedUser }));
    }
  };

  const verifyEntry = async (id: string) => {
    const { error } = await supabase
      .from('entries')
      .update({ status: EntryStatus.VERIFIED })
      .eq('id', id);
    
    if (error) {
      if (error.code === 'PGRST204') {
        throw new Error("ບໍ່ພົບ Column 'status' ໃນ Table 'entries'. ກະລຸນາເພີ່ມ Column ນີ້ໃນ Supabase SQL Editor: ALTER TABLE entries ADD COLUMN status TEXT DEFAULT 'PENDING';");
      }
      throw error;
    }
    await fetchInitialData(false);
  };

  const addUser = async (user: User) => { 
    const { error } = await supabase.from('users').insert([user]); 
    if (error) throw error;
  };
  
  const removeUser = async (id: string) => { 
    const { error } = await supabase.from('users').delete().eq('id', id); 
    if (error) throw error;
  };
  
  const addStore = async (store: Store) => { 
    const { error } = await supabase.from('stores').insert([store]); 
    if (error) throw error;
  };
  
  const removeStore = async (id: string) => { 
    const { error } = await supabase.from('stores').delete().eq('id', id); 
    if (error) throw error;
  };
  
  const addShiftType = async (shift: ShiftType) => { 
    const { error } = await supabase.from('shift_types').insert([shift]); 
    if (error) throw error;
  };
  
  const removeShiftType = async (id: string) => { 
    const { error } = await supabase.from('shift_types').delete().eq('id', id); 
    if (error) throw error;
  };

  const addEntry = async (entry: Entry) => {
    const { expenses, ...entryData } = entry;
    
    // Attempt to insert entry
    const { data: insertedEntries, error: entryErr } = await supabase
      .from('entries')
      .insert([entryData])
      .select();
      
    if (entryErr) {
      console.error('Supabase Entry Insert Error:', entryErr);
      if (entryErr.code === 'PGRST204') {
        // If status column is missing, try inserting without it to allow data saving,
        // but warn the user they need to update their schema for verification features to work.
        const { status, ...entryWithoutStatus } = entryData;
        const { data: retryData, error: retryErr } = await supabase
          .from('entries')
          .insert([entryWithoutStatus])
          .select();
          
        if (retryErr) throw new Error(`Entry Error: ${retryErr.message} (${retryErr.code})`);
        
        // If retry succeeded, notify that the schema needs updating
        console.warn("Inserted entry without 'status' column. Please run the SQL migration.");
        
        if (retryData && retryData.length > 0 && expenses.length > 0) {
           await insertExpenses(retryData[0].id, expenses);
        }
        return;
      }
      throw new Error(`Entry Error: ${entryErr.message} (${entryErr.code})`);
    }
    
    if (insertedEntries && insertedEntries.length > 0 && expenses.length > 0) {
      await insertExpenses(insertedEntries[0].id, expenses);
    }
  };

  const insertExpenses = async (entryId: string, expenses: any[]) => {
    const expensesWithId = expenses.map(ex => ({ 
      entry_id: entryId, 
      amount: ex.amount, 
      description: ex.description, 
      image_url: ex.image_url 
    }));
    
    const { error: expErr } = await supabase.from('expenses').insert(expensesWithId);
    if (expErr) {
      console.error('Supabase Expenses Insert Error:', expErr);
      throw new Error(`Expenses Error: ${expErr.message} (${expErr.code})`);
    }
  };

  const deleteEntry = async (id: string) => {
    const { error } = await supabase.from('entries').delete().eq('id', id);
    if (error) throw error;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-6 text-center">
        <Loader2 className="w-12 h-12 text-emerald-600 animate-spin mb-4" />
        <p className="text-slate-500 font-bold tracking-tight">ກຳລັງໂຫຼດຂໍ້ມູນ...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-6 text-center">
        <div className="bg-white p-8 rounded-3xl shadow-xl border border-red-100 max-w-md w-full">
          <div className="bg-red-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-8 h-8 text-red-500" />
          </div>
          <h2 className="text-xl font-bold text-slate-800 mb-2">ບໍ່ສາມາດເຊື່ອມຕໍ່ໄດ້</h2>
          <p className="text-slate-500 text-sm mb-6 leading-relaxed px-2">{error}</p>
          <button 
            onClick={() => fetchInitialData(true)}
            className="w-full py-3 bg-emerald-600 text-white rounded-xl font-bold shadow-lg hover:bg-emerald-700 transition-all flex items-center justify-center gap-2"
          >
            <RefreshCcw className="w-4 h-4" />
            ລອງໃໝ່ອີກຄັ້ງ
          </button>
        </div>
      </div>
    );
  }

  if (!state.currentUser) {
    return <Login users={state.users} onLogin={login} />;
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="bg-white text-slate-900 border-b border-slate-100 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <h1 className="text-xl font-black text-emerald-600 flex items-center gap-2">
            <div className="bg-emerald-600 p-1.5 rounded-lg text-white shadow-lg shadow-emerald-100">
              <HomeIcon className="w-5 h-5" />
            </div>
            <span className="tracking-tight">{TRANSLATIONS.appName}</span>
          </h1>
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-black text-slate-800 leading-none">{state.currentUser.name}</p>
              <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest mt-0.5">{state.currentUser.role}</p>
            </div>
            <button onClick={logout} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all">
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-6xl mx-auto w-full p-4 pb-28">
        {activeTab === 'home' && <Home state={state} onNavigate={(tab) => setActiveTab(tab)} />}
        {activeTab === 'record' && <EntryForm state={state} onAddEntry={addEntry} onSuccess={() => setActiveTab('home')} />}
        {activeTab === 'reports' && <Reports state={state} onDeleteEntry={deleteEntry} />}
        {activeTab === 'admin' && state.currentUser.role === UserRole.ADMIN && (
          <Admin 
            state={state} 
            onAddUser={addUser} onRemoveUser={removeUser}
            onAddStore={addStore} onRemoveStore={removeStore}
            onAddShift={addShiftType} onRemoveShift={removeShiftType}
            onUpdateUser={updateUser}
            onVerifyEntry={verifyEntry}
          />
        )}
        {activeTab === 'profile' && <Profile user={state.currentUser} onUpdate={updateUser} />}
      </main>

      <nav className="bg-white/80 backdrop-blur-lg border-t border-slate-100 fixed bottom-0 left-0 right-0 z-50 pb-safe">
        <div className="max-w-md mx-auto flex justify-between items-center px-6 h-20">
          <button onClick={() => setActiveTab('home')} className={`flex flex-col items-center gap-1 transition-all ${activeTab === 'home' ? 'text-emerald-600' : 'text-slate-400'}`}>
            <HomeIcon className="w-6 h-6" /><span className="text-[10px] font-bold">{TRANSLATIONS.home}</span>
          </button>
          <button onClick={() => setActiveTab('reports')} className={`flex flex-col items-center gap-1 transition-all ${activeTab === 'reports' ? 'text-emerald-600' : 'text-slate-400'}`}>
            <FileText className="w-6 h-6" /><span className="text-[10px] font-bold">{TRANSLATIONS.reports}</span>
          </button>
          <div className="relative -top-8">
            <button onClick={() => setActiveTab('record')} className="w-16 h-16 rounded-full flex items-center justify-center shadow-2xl bg-emerald-600 text-white transition-all active:scale-90">
              <Plus className={`w-8 h-8 ${activeTab === 'record' ? 'rotate-45' : ''}`} />
            </button>
          </div>
          {state.currentUser.role === UserRole.ADMIN ? (
            <button onClick={() => setActiveTab('admin')} className={`flex flex-col items-center gap-1 transition-all ${activeTab === 'admin' ? 'text-emerald-600' : 'text-slate-400'}`}>
              <Settings className="w-6 h-6" /><span className="text-[10px] font-bold">{TRANSLATIONS.adminPanel}</span>
            </button>
          ) : <div className="w-12"></div>}
          <button onClick={() => setActiveTab('profile')} className={`flex flex-col items-center gap-1 transition-all ${activeTab === 'profile' ? 'text-emerald-600' : 'text-slate-400'}`}>
            <UserCircle className="w-6 h-6" /><span className="text-[10px] font-bold">{TRANSLATIONS.profile}</span>
          </button>
        </div>
      </nav>
    </div>
  );
};

export default App;

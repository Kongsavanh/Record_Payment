
import React, { useState, useEffect, useCallback } from 'react';
import { 
  AppState, 
  User, 
  UserRole, 
  Entry, 
  Store, 
  ShiftType 
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
  WifiOff
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
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [activeTab, setActiveTab] = useState<'home' | 'record' | 'reports' | 'admin' | 'profile'>('home');

  // Monitor online/offline status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const fetchInitialData = useCallback(async (showLoader = false) => {
    if (showLoader) {
      setIsLoading(true);
      setError(null);
    }
    
    try {
      // Define fetch with a clear timeout mechanism
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 20000); // 20 seconds timeout

      const [usersRes, storesRes, shiftsRes, entriesRes] = await Promise.all([
        supabase.from('users').select('*'),
        supabase.from('stores').select('*'),
        supabase.from('shift_types').select('*'),
        supabase.from('entries').select('*, expenses(*)').order('created_at', { ascending: false })
      ]);

      clearTimeout(timeoutId);

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
      setError(null);
    } catch (err: any) {
      console.error('Error fetching data:', err);
      // Handle AbortError specifically for timeouts
      if (err.name === 'AbortError') {
        setError("ການເຊື່ອມຕໍ່ໝົດເວລາ (Timeout). ກະລຸນາກວດສອບອິນເຕີເນັດຂອງທ່ານ.");
      } else {
        setError(err.message || "ເກີດຂໍ້ຜິດພາດໃນການເຊື່ອມຕໍ່ຖານຂໍ້ມູນ. ກະລຸນາລອງໃໝ່.");
      }
    } finally {
      if (showLoader) setIsLoading(false);
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
          // Subtle re-fetch on background changes
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
    
    if (!error && state.currentUser?.id === updatedUser.id) {
      setState(prev => ({ ...prev, currentUser: updatedUser }));
    }
  };

  const addUser = async (user: User) => { await supabase.from('users').insert([user]); };
  const removeUser = async (id: string) => { await supabase.from('users').delete().eq('id', id); };
  const addStore = async (store: Store) => { await supabase.from('stores').insert([store]); };
  const removeStore = async (id: string) => { await supabase.from('stores').delete().eq('id', id); };
  const addShiftType = async (shift: ShiftType) => { await supabase.from('shift_types').insert([shift]); };
  const removeShiftType = async (id: string) => { await supabase.from('shift_types').delete().eq('id', id); };

  const addEntry = async (entry: Entry) => {
    const { expenses, ...entryData } = entry;
    const { data, error } = await supabase.from('entries').insert([entryData]).select();
    
    if (error) throw error;

    if (data && expenses.length > 0) {
      const entryId = data[0].id;
      const expensesWithId = expenses.map(ex => ({ 
        entry_id: entryId, 
        amount: ex.amount, 
        description: ex.description, 
        image_url: ex.image_url 
      }));
      await supabase.from('expenses').insert(expensesWithId);
    }
  };

  const deleteEntry = async (id: string) => {
    await supabase.from('entries').delete().eq('id', id);
  };

  if (!isOnline && !state.currentUser) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-6 text-center">
        <div className="bg-white p-8 rounded-3xl shadow-xl border border-slate-100 max-w-sm">
          <div className="bg-amber-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-amber-500">
            <WifiOff className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-slate-800 mb-2">ບໍ່ມີການເຊື່ອມຕໍ່</h2>
          <p className="text-slate-500 text-sm mb-6">ກະລຸນາກວດສອບອິນເຕີເນັດຂອງທ່ານ ເພື່ອເຂົ້າໃຊ້ງານລະບົບ.</p>
          <button 
            onClick={() => window.location.reload()}
            className="w-full py-3 bg-emerald-600 text-white rounded-xl font-bold shadow-lg"
          >
            ໂຫຼດໜ້າໃໝ່
          </button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
        <div className="relative">
           <Loader2 className="w-12 h-12 text-emerald-600 animate-spin" />
           <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-2 h-2 bg-emerald-600 rounded-full animate-ping"></div>
           </div>
        </div>
        <p className="mt-4 text-slate-500 font-bold animate-pulse">ກຳລັງໂຫຼດຂໍ້ມູນຖານຂໍ້ມູນ...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-6 text-center">
        <div className="bg-white p-8 rounded-3xl shadow-xl border border-red-100 max-w-sm">
          <div className="bg-red-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <RefreshCcw className="w-8 h-8 text-red-500" />
          </div>
          <h2 className="text-xl font-bold text-slate-800 mb-2">ເກີດຂໍ້ຜິດພາດ</h2>
          <p className="text-slate-500 text-sm mb-6">{error}</p>
          <button 
            onClick={() => fetchInitialData(true)}
            className="w-full py-3 bg-emerald-600 text-white rounded-xl font-bold shadow-lg hover:bg-emerald-700 transition-all"
          >
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
          <div className="flex items-center gap-3">
             <h1 className="text-xl font-black text-emerald-600 flex items-center gap-2">
              <div className="bg-emerald-600 p-1.5 rounded-lg text-white shadow-lg shadow-emerald-100">
                <HomeIcon className="w-5 h-5" />
              </div>
              <span className="tracking-tight">{TRANSLATIONS.appName}</span>
            </h1>
            {!isOnline && (
              <span className="flex items-center gap-1 text-[10px] bg-amber-100 text-amber-600 px-2 py-0.5 rounded-full font-bold">
                <WifiOff className="w-3 h-3" /> Offline
              </span>
            )}
          </div>
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
          />
        )}
        {activeTab === 'profile' && <Profile user={state.currentUser} onUpdate={updateUser} />}
      </main>

      <nav className="bg-white/80 backdrop-blur-lg border-t border-slate-100 fixed bottom-0 left-0 right-0 z-50 pb-safe">
        <div className="max-w-md mx-auto flex justify-between items-center px-6 h-20">
          <button onClick={() => setActiveTab('home')} className={`flex flex-col items-center gap-1 transition-all ${activeTab === 'home' ? 'text-emerald-600 scale-110' : 'text-slate-400'}`}>
            <HomeIcon className={`w-6 h-6 ${activeTab === 'home' ? 'fill-emerald-50/20' : ''}`} />
            <span className="text-[10px] font-bold">{TRANSLATIONS.home}</span>
          </button>
          <button onClick={() => setActiveTab('reports')} className={`flex flex-col items-center gap-1 transition-all ${activeTab === 'reports' ? 'text-emerald-600 scale-110' : 'text-slate-400'}`}>
            <FileText className={`w-6 h-6 ${activeTab === 'reports' ? 'fill-emerald-50/20' : ''}`} />
            <span className="text-[10px] font-bold">{TRANSLATIONS.reports}</span>
          </button>
          <div className="relative -top-8">
            <button onClick={() => setActiveTab('record')} className={`w-16 h-16 rounded-full flex items-center justify-center shadow-2xl transition-all active:scale-90 ${activeTab === 'record' ? 'bg-slate-900' : 'bg-emerald-600'} text-white`}>
              <Plus className={`w-8 h-8 transition-transform ${activeTab === 'record' ? 'rotate-45' : ''}`} />
            </button>
          </div>
          {state.currentUser.role === UserRole.ADMIN ? (
            <button onClick={() => setActiveTab('admin')} className={`flex flex-col items-center gap-1 transition-all ${activeTab === 'admin' ? 'text-emerald-600 scale-110' : 'text-slate-400'}`}>
              <Settings className={`w-6 h-6 ${activeTab === 'admin' ? 'fill-emerald-50/20' : ''}`} />
              <span className="text-[10px] font-bold">{TRANSLATIONS.adminPanel}</span>
            </button>
          ) : <div className="w-12"></div>}
          <button onClick={() => setActiveTab('profile')} className={`flex flex-col items-center gap-1 transition-all ${activeTab === 'profile' ? 'text-emerald-600 scale-110' : 'text-slate-400'}`}>
            <UserCircle className={`w-6 h-6 ${activeTab === 'profile' ? 'fill-emerald-50/20' : ''}`} />
            <span className="text-[10px] font-bold">{TRANSLATIONS.profile}</span>
          </button>
        </div>
      </nav>
    </div>
  );
};

export default App;


import React, { useState, useEffect } from 'react';
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
  Loader2
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
  const [activeTab, setActiveTab] = useState<'home' | 'record' | 'reports' | 'admin' | 'profile'>('home');

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setIsLoading(true);
    try {
      const [usersRes, storesRes, shiftsRes, entriesRes] = await Promise.all([
        supabase.from('users').select('*'),
        supabase.from('stores').select('*'),
        supabase.from('shift_types').select('*'),
        supabase.from('entries').select('*, expenses(*)').order('created_at', { ascending: false })
      ]);

      setState({
        users: usersRes.data || [],
        stores: storesRes.data || [],
        shiftTypes: shiftsRes.data || [],
        entries: entriesRes.data || [],
        currentUser: null,
      });
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setIsLoading(false);
    }
  };

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
    
    if (!error) {
      setState(prev => ({
        ...prev,
        users: prev.users.map(u => u.id === updatedUser.id ? updatedUser : u),
        currentUser: prev.currentUser?.id === updatedUser.id ? updatedUser : prev.currentUser
      }));
    }
  };

  const addUser = async (user: User) => {
    const { data, error } = await supabase.from('users').insert([user]).select();
    if (data) {
      setState(prev => ({ ...prev, users: [...prev.users, data[0]] }));
    }
  };

  const removeUser = async (id: string) => {
    const { error } = await supabase.from('users').delete().eq('id', id);
    if (!error) {
      setState(prev => ({ ...prev, users: prev.users.filter(u => u.id !== id) }));
    }
  };

  const addStore = async (store: Store) => {
    const { data, error } = await supabase.from('stores').insert([store]).select();
    if (data) {
      setState(prev => ({ ...prev, stores: [...prev.stores, data[0]] }));
    }
  };

  const removeStore = async (id: string) => {
    const { error } = await supabase.from('stores').delete().eq('id', id);
    if (!error) {
      setState(prev => ({ ...prev, stores: prev.stores.filter(s => s.id !== id) }));
    }
  };

  const addShiftType = async (shift: ShiftType) => {
    const { data, error } = await supabase.from('shift_types').insert([shift]).select();
    if (data) {
      setState(prev => ({ ...prev, shiftTypes: [...prev.shiftTypes, data[0]] }));
    }
  };

  const removeShiftType = async (id: string) => {
    const { error } = await supabase.from('shift_types').delete().eq('id', id);
    if (!error) {
      setState(prev => ({ ...prev, shiftTypes: prev.shiftTypes.filter(s => s.id !== id) }));
    }
  };

  const addEntry = async (entry: Entry) => {
    const { expenses, ...entryData } = entry;
    const { data, error } = await supabase.from('entries').insert([entryData]).select();
    
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

    if (data) {
      const { data: fullEntry } = await supabase.from('entries').select('*, expenses(*)').eq('id', data[0].id).single();
      if (fullEntry) {
        setState(prev => ({ ...prev, entries: [fullEntry, ...prev.entries] }));
      }
    }
  };

  const deleteEntry = async (id: string) => {
    const { error } = await supabase.from('entries').delete().eq('id', id);
    if (!error) {
      setState(prev => ({ ...prev, entries: prev.entries.filter(e => e.id !== id) }));
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
        <Loader2 className="w-10 h-10 text-emerald-600 animate-spin mb-4" />
        <p className="text-slate-500 font-bold">ກຳລັງເຊື່ອມຕໍ່ຖານຂໍ້ມູນ Cloud...</p>
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
            <button 
              onClick={logout}
              className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
              title={TRANSLATIONS.logout}
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-6xl mx-auto w-full p-4 pb-28">
        {activeTab === 'home' && (
          <Home 
            state={state} 
            onNavigate={(tab) => setActiveTab(tab)}
          />
        )}
        {activeTab === 'record' && (
          <EntryForm 
            state={state} 
            onAddEntry={addEntry}
            onSuccess={() => setActiveTab('home')}
          />
        )}
        {activeTab === 'reports' && (
          <Reports 
            state={state} 
            onDeleteEntry={deleteEntry}
          />
        )}
        {activeTab === 'admin' && state.currentUser.role === UserRole.ADMIN && (
          <Admin 
            state={state} 
            onAddUser={addUser}
            onRemoveUser={removeUser}
            onAddStore={addStore}
            onRemoveStore={removeStore}
            onAddShift={addShiftType}
            onRemoveShift={removeShiftType}
            onUpdateUser={updateUser}
          />
        )}
        {activeTab === 'profile' && (
          <Profile 
            user={state.currentUser} 
            onUpdate={updateUser} 
          />
        )}
      </main>

      <nav className="bg-white/80 backdrop-blur-lg border-t border-slate-100 fixed bottom-0 left-0 right-0 z-50 pb-safe">
        <div className="max-w-md mx-auto flex justify-between items-center px-6 h-20">
          <button 
            onClick={() => setActiveTab('home')}
            className={`flex flex-col items-center gap-1 transition-all ${activeTab === 'home' ? 'text-emerald-600 scale-110' : 'text-slate-400'}`}
          >
            <HomeIcon className={`w-6 h-6 ${activeTab === 'home' ? 'fill-emerald-50/50' : ''}`} />
            <span className="text-[10px] font-bold">{TRANSLATIONS.home}</span>
          </button>
          
          <button 
            onClick={() => setActiveTab('reports')}
            className={`flex flex-col items-center gap-1 transition-all ${activeTab === 'reports' ? 'text-emerald-600 scale-110' : 'text-slate-400'}`}
          >
            <FileText className={`w-6 h-6 ${activeTab === 'reports' ? 'fill-emerald-50/50' : ''}`} />
            <span className="text-[10px] font-bold">{TRANSLATIONS.reports}</span>
          </button>

          <div className="relative -top-8">
            <button 
              onClick={() => setActiveTab('record')}
              className={`w-16 h-16 rounded-full flex items-center justify-center shadow-2xl transition-all active:scale-90 ${activeTab === 'record' ? 'bg-slate-900 text-white shadow-slate-300' : 'bg-emerald-600 text-white shadow-emerald-200'}`}
            >
              <Plus className={`w-8 h-8 transition-transform duration-300 ${activeTab === 'record' ? 'rotate-45' : ''}`} />
            </button>
          </div>

          {state.currentUser.role === UserRole.ADMIN ? (
            <button 
              onClick={() => setActiveTab('admin')}
              className={`flex flex-col items-center gap-1 transition-all ${activeTab === 'admin' ? 'text-emerald-600 scale-110' : 'text-slate-400'}`}
            >
              <Settings className={`w-6 h-6 ${activeTab === 'admin' ? 'fill-emerald-50/50' : ''}`} />
              <span className="text-[10px] font-bold">{TRANSLATIONS.adminPanel}</span>
            </button>
          ) : (
            <div className="w-12"></div>
          )}
          
          <button 
            onClick={() => setActiveTab('profile')}
            className={`flex flex-col items-center gap-1 transition-all ${activeTab === 'profile' ? 'text-emerald-600 scale-110' : 'text-slate-400'}`}
          >
            <UserCircle className={`w-6 h-6 ${activeTab === 'profile' ? 'fill-emerald-50/50' : ''}`} />
            <span className="text-[10px] font-bold">{TRANSLATIONS.profile}</span>
          </button>
        </div>
      </nav>
    </div>
  );
};

export default App;

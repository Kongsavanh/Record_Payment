
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
  INITIAL_USERS, 
  INITIAL_STORES, 
  INITIAL_SHIFT_TYPES, 
  TRANSLATIONS 
} from './constants';
import Login from './views/Login';
import Home from './views/Home';
import EntryForm from './views/EntryForm';
import Admin from './views/Admin';
import Reports from './views/Reports';
import Profile from './views/Profile';
import { 
  Home as HomeIcon, 
  FileText, 
  Settings, 
  UserCircle, 
  LogOut,
  Plus
} from 'lucide-react';

const App: React.FC = () => {
  const [state, setState] = useState<AppState>(() => {
    const saved = localStorage.getItem('lao_cash_tracker_state');
    if (saved) {
      const parsed = JSON.parse(saved);
      return { ...parsed, currentUser: null }; // Reset session on reload
    }
    return {
      users: INITIAL_USERS,
      stores: INITIAL_STORES,
      shiftTypes: INITIAL_SHIFT_TYPES,
      entries: [],
      currentUser: null,
    };
  });

  const [activeTab, setActiveTab] = useState<'home' | 'record' | 'reports' | 'admin' | 'profile'>('home');

  useEffect(() => {
    localStorage.setItem('lao_cash_tracker_state', JSON.stringify({
      ...state,
      currentUser: null // Don't persist current user login for security
    }));
  }, [state]);

  const login = (user: User) => {
    setState(prev => ({ ...prev, currentUser: user }));
    setActiveTab('home');
  };

  const logout = () => {
    setState(prev => ({ ...prev, currentUser: null }));
  };

  const updateUser = (updatedUser: User) => {
    setState(prev => ({
      ...prev,
      users: prev.users.map(u => u.id === updatedUser.id ? updatedUser : u),
      currentUser: prev.currentUser?.id === updatedUser.id ? updatedUser : prev.currentUser
    }));
  };

  const addUser = (user: User) => {
    setState(prev => ({ ...prev, users: [...prev.users, user] }));
  };

  const removeUser = (id: string) => {
    setState(prev => ({ ...prev, users: prev.users.filter(u => u.id !== id) }));
  };

  const addStore = (store: Store) => {
    setState(prev => ({ ...prev, stores: [...prev.stores, store] }));
  };

  const removeStore = (id: string) => {
    setState(prev => ({ ...prev, stores: prev.stores.filter(s => s.id !== id) }));
  };

  const addShiftType = (shift: ShiftType) => {
    setState(prev => ({ ...prev, shiftTypes: [...prev.shiftTypes, shift] }));
  };

  const removeShiftType = (id: string) => {
    setState(prev => ({ ...prev, shiftTypes: prev.shiftTypes.filter(s => s.id !== id) }));
  };

  const addEntry = (entry: Entry) => {
    setState(prev => ({ ...prev, entries: [entry, ...prev.entries] }));
  };

  const deleteEntry = (id: string) => {
      setState(prev => ({ ...prev, entries: prev.entries.filter(e => e.id !== id) }));
  }

  if (!state.currentUser) {
    return <Login users={state.users} onLogin={login} />;
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header */}
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

      {/* Main Content */}
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

      {/* Mobile Navigation */}
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

          {/* Central Plus Button */}
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
            <div className="w-12"></div> // Spacer to maintain layout
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

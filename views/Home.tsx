
import React, { useMemo } from 'react';
import { AppState, UserRole } from '../types';
import { TRANSLATIONS as T } from '../constants';
import { formatCurrency, formatDate } from '../utils';
import { 
  TrendingUp, 
  TrendingDown, 
  Wallet, 
  ArrowRightLeft, 
  ShoppingBag,
  Clock,
  LayoutGrid,
  ChevronRight,
  Lock
} from 'lucide-react';

interface HomeProps {
  state: AppState;
  onNavigate: (tab: 'record' | 'reports') => void;
}

const Home: React.FC<HomeProps> = ({ state, onNavigate }) => {
  const isStaff = state.currentUser?.role === UserRole.STAFF;

  // Filter entries based on role
  const filteredEntries = useMemo(() => {
    if (isStaff) {
      return state.entries.filter(e => e.userId === state.currentUser?.id);
    }
    return state.entries;
  }, [state.entries, isStaff, state.currentUser]);

  const totals = useMemo(() => {
    return filteredEntries.reduce((acc, curr) => ({
      revenue: acc.revenue + curr.totalRevenue,
      expenses: acc.expenses + curr.totalExpenses,
      transfers: acc.transfers + curr.transferAmount,
      cash: acc.cash + curr.actualCashInDrawer,
      balance: acc.balance + curr.finalBalance,
      diff: acc.diff + curr.difference
    }), { revenue: 0, expenses: 0, transfers: 0, cash: 0, balance: 0, diff: 0 });
  }, [filteredEntries]);

  const storeStats = useMemo(() => {
    const stats: Record<string, { name: string, balance: number, revenue: number }> = {};
    state.stores.forEach(s => {
      stats[s.id] = { name: s.name, balance: 0, revenue: 0 };
    });
    filteredEntries.forEach(e => {
      if (stats[e.storeId]) {
        stats[e.storeId].balance += e.finalBalance;
        stats[e.storeId].revenue += e.totalRevenue;
      }
    });
    return Object.values(stats).sort((a, b) => b.balance - a.balance);
  }, [filteredEntries, state.stores]);

  const recentEntries = useMemo(() => {
    return [...filteredEntries].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 5);
  }, [filteredEntries]);

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header & Hero */}
      <div className="relative overflow-hidden bg-emerald-600 rounded-3xl p-8 text-white shadow-xl shadow-emerald-100">
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-1">
            <p className="text-emerald-100 font-medium">
              {isStaff ? 'ສະຫຼຸບຜົນງານສ່ວນຕົວຂອງທ່ານ' : T.overallSummary}
            </p>
            {isStaff && (
              <div className="flex items-center gap-1 bg-white/20 px-2 py-0.5 rounded-full text-[10px] font-bold">
                <Lock className="w-3 h-3" />
                <span>ຂໍ້ມູນສ່ວນຕົວ</span>
              </div>
            )}
          </div>
          <h2 className="text-4xl font-black mb-6">{formatCurrency(totals.balance)} <span className="text-xl font-normal opacity-80">{T.currency}</span></h2>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20">
              <div className="flex items-center gap-2 text-emerald-100 text-xs font-bold uppercase mb-1">
                <TrendingUp className="w-3 h-3" />
                <span>{T.totalRevenue}</span>
              </div>
              <p className="text-lg font-bold">{formatCurrency(totals.revenue)}</p>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20">
              <div className="flex items-center gap-2 text-emerald-100 text-xs font-bold uppercase mb-1">
                <TrendingDown className="w-3 h-3" />
                <span>{T.expenses}</span>
              </div>
              <p className="text-lg font-bold">{formatCurrency(totals.expenses)}</p>
            </div>
          </div>
        </div>
        
        {/* Abstract background shapes */}
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-emerald-500 rounded-full opacity-50 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 -ml-8 -mb-8 w-48 h-48 bg-emerald-700 rounded-full opacity-30 blur-2xl"></div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
              <ArrowRightLeft className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase">{T.transferAmount}</p>
              <p className="text-xl font-bold text-slate-800">{formatCurrency(totals.transfers)}</p>
            </div>
          </div>
          <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
            <div 
              className="h-full bg-blue-500" 
              style={{ width: `${totals.revenue > 0 ? (totals.transfers / totals.revenue) * 100 : 0}%` }}
            ></div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
              <Wallet className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase">{T.actualCashInDrawer}</p>
              <p className="text-xl font-bold text-slate-800">{formatCurrency(totals.cash)}</p>
            </div>
          </div>
          <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
            <div 
              className="h-full bg-amber-500" 
              style={{ width: `${totals.cash > 0 ? (totals.cash / (totals.cash + Math.abs(totals.diff))) * 100 : 0}%` }}
            ></div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex items-center gap-4 mb-4">
            <div className={`p-3 rounded-xl ${totals.diff >= 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
              <LayoutGrid className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase">{T.difference}</p>
              <p className={`text-xl font-bold ${totals.diff < 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                {formatCurrency(totals.diff)}
              </p>
            </div>
          </div>
          <p className="text-xs text-slate-400">ສ່ວນຕ່າງສະສົມ{isStaff ? 'ສ່ວນຕົວ' : 'ທັງໝົດ'}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Performance by Store */}
        <section className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-emerald-600" />
              {T.performanceByStore}
            </h3>
          </div>
          <div className="space-y-4">
            {storeStats.map((store, i) => (
              <div key={i} className="group p-4 rounded-2xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-slate-700">{store.name}</span>
                  <span className="font-bold text-emerald-600">{formatCurrency(store.balance)}</span>
                </div>
                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-emerald-500 transition-all duration-1000" 
                    style={{ width: `${totals.revenue > 0 ? (store.revenue / totals.revenue) * 100 : 0}%` }}
                  ></div>
                </div>
                <div className="flex justify-between mt-1">
                   <span className="text-[10px] text-slate-400 uppercase font-bold">ລາຍໄດ້: {formatCurrency(store.revenue)}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Recent Entries */}
        <section className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <Clock className="w-5 h-5 text-emerald-600" />
              {T.recentEntries}
            </h3>
            <button 
              onClick={() => onNavigate('reports')}
              className="text-sm font-bold text-emerald-600 flex items-center hover:underline"
            >
              ເບິ່ງທັງໝົດ
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          <div className="space-y-3">
            {recentEntries.map((entry) => (
              <div key={entry.id} className="flex items-center justify-between p-3 rounded-xl border border-slate-50 hover:bg-slate-50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="bg-slate-100 p-2 rounded-lg text-slate-400">
                    <LayoutGrid className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-800">{state.stores.find(s => s.id === entry.storeId)?.name}</p>
                    <p className="text-[10px] text-slate-400">{formatDate(entry.date)}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-slate-900">{formatCurrency(entry.finalBalance)}</p>
                  {!isStaff && <p className="text-[10px] text-emerald-500 font-medium">{state.users.find(u => u.id === entry.userId)?.name}</p>}
                </div>
              </div>
            ))}
            {recentEntries.length === 0 && (
              <div className="text-center py-10 text-slate-400 text-sm italic">ຍັງບໍ່ມີຂໍ້ມູນການບັນທຶກ</div>
            )}
          </div>
        </section>
      </div>
      
      {/* Quick Action */}
      <div className="pt-4 pb-12">
        <button 
          onClick={() => onNavigate('record')}
          className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold shadow-xl shadow-slate-200 hover:bg-black transition-all transform hover:-translate-y-1"
        >
          {T.record}
        </button>
      </div>
    </div>
  );
};

export default Home;

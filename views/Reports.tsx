
import React, { useState, useMemo, useEffect } from 'react';
import { AppState, UserRole } from '../types';
import { formatDate, formatCurrency, getTodayStr } from '../utils';
import { Search, Filter, Trash2, Calendar, User, ShoppingBag, Clock, Lock } from 'lucide-react';
import { TRANSLATIONS } from '../constants';

interface ReportsProps {
  state: AppState;
  onDeleteEntry: (id: string) => void;
}

const Reports: React.FC<ReportsProps> = ({ state, onDeleteEntry }) => {
  const isStaff = state.currentUser?.role === UserRole.STAFF;
  const [startDate, setStartDate] = useState(getTodayStr());
  const [endDate, setEndDate] = useState(getTodayStr());
  const [filterStore, setFilterStore] = useState('all');
  // For staff, default to their own ID and don't allow changing
  const [filterUser, setFilterUser] = useState(isStaff ? state.currentUser?.id || 'all' : 'all');

  // Synchronize filterUser if currentUser changes or if role changes (though unlikely in a single session)
  useEffect(() => {
    if (isStaff) {
      setFilterUser(state.currentUser?.id || 'all');
    }
  }, [state.currentUser, isStaff]);

  const filteredEntries = useMemo(() => {
    return state.entries.filter(e => {
      const entryDate = e.date;
      const dateMatch = entryDate >= startDate && entryDate <= endDate;
      const storeMatch = filterStore === 'all' || e.storeId === filterStore;
      
      // Strict enforcement: even if they somehow change state, filter by currentUser.id if they are staff
      const targetUserId = isStaff ? state.currentUser?.id : filterUser;
      const userMatch = targetUserId === 'all' || e.userId === targetUserId;
      
      return dateMatch && storeMatch && userMatch;
    });
  }, [state.entries, startDate, endDate, filterStore, filterUser, isStaff, state.currentUser]);

  const totals = useMemo(() => {
    return filteredEntries.reduce((acc, curr) => ({
      rev: acc.rev + curr.totalRevenue,
      trans: acc.trans + curr.transferAmount,
      exp: acc.exp + curr.totalExpenses,
      bal: acc.bal + curr.finalBalance
    }), { rev: 0, trans: 0, exp: 0, bal: 0 });
  }, [filteredEntries]);

  const getStoreName = (id: string) => state.stores.find(s => s.id === id)?.name || 'N/A';
  const getUserName = (id: string) => state.users.find(u => u.id === id)?.name || 'N/A';
  const getShiftName = (id: string) => state.shiftTypes.find(s => s.id === id)?.name || 'N/A';

  const handleDelete = (id: string) => {
      if (confirm(TRANSLATIONS.confirmDelete)) {
          onDeleteEntry(id);
      }
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Filters */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Filter className="w-6 h-6 text-emerald-600" />
            <h2 className="text-xl font-bold text-slate-800">{TRANSLATIONS.reports}</h2>
          </div>
          {isStaff && (
            <div className="flex items-center gap-2 px-3 py-1 bg-slate-100 text-slate-500 rounded-lg text-xs font-bold">
              <Lock className="w-3 h-3" />
              <span>ສະແດງສະເພາະຂໍ້ມູນຂອງທ່ານ</span>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block">{TRANSLATIONS.startDate}</label>
            <input 
              type="date" 
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg bg-slate-50 text-sm outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block">{TRANSLATIONS.endDate}</label>
            <input 
              type="date" 
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg bg-slate-50 text-sm outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block">{TRANSLATIONS.store}</label>
            <select 
              value={filterStore}
              onChange={(e) => setFilterStore(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg bg-slate-50 text-sm outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="all">ທັງໝົດ</option>
              {state.stores.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block">{TRANSLATIONS.staff}</label>
            <select 
              value={filterUser}
              onChange={(e) => setFilterUser(e.target.value)}
              disabled={isStaff}
              className={`w-full px-3 py-2 border rounded-lg text-sm outline-none transition-all ${
                isStaff 
                ? 'bg-slate-200 text-slate-500 cursor-not-allowed border-slate-200' 
                : 'bg-slate-50 focus:ring-2 focus:ring-emerald-500'
              }`}
            >
              {!isStaff && <option value="all">ທັງໝົດ</option>}
              {state.users.map(u => (
                (!isStaff || u.id === state.currentUser?.id) && (
                  <option key={u.id} value={u.id}>{u.name}</option>
                )
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
          <div className="bg-emerald-100 p-3 rounded-xl">
             <Calendar className="w-6 h-6 text-emerald-600" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase">{TRANSLATIONS.totalRevenue}</p>
            <p className="text-lg font-bold text-slate-800">{formatCurrency(totals.rev)}</p>
          </div>
        </div>
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
          <div className="bg-blue-100 p-3 rounded-xl">
             <Search className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase">{TRANSLATIONS.transferAmount}</p>
            <p className="text-lg font-bold text-slate-800">{formatCurrency(totals.trans)}</p>
          </div>
        </div>
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
          <div className="bg-red-100 p-3 rounded-xl">
             <Trash2 className="w-6 h-6 text-red-600" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase">{TRANSLATIONS.total} {TRANSLATIONS.expenses}</p>
            <p className="text-lg font-bold text-slate-800">{formatCurrency(totals.exp)}</p>
          </div>
        </div>
        <div className="bg-emerald-600 p-5 rounded-2xl shadow-lg flex items-center gap-4 text-white">
          <div className="bg-emerald-500/50 p-3 rounded-xl">
             <Calendar className="w-6 h-6 text-white" />
          </div>
          <div>
            <p className="text-xs font-bold text-emerald-100 uppercase">{TRANSLATIONS.finalBalance}</p>
            <p className="text-lg font-bold">{formatCurrency(totals.bal)}</p>
          </div>
        </div>
      </div>

      {/* Report Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">{TRANSLATIONS.date}</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">{TRANSLATIONS.store}</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">{TRANSLATIONS.staff}</th>
                <th className="px-6 py-4 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">{TRANSLATIONS.totalRevenue}</th>
                <th className="px-6 py-4 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">{TRANSLATIONS.expenses}</th>
                <th className="px-6 py-4 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">{TRANSLATIONS.finalBalance}</th>
                <th className="px-6 py-4 text-center text-xs font-bold text-slate-500 uppercase tracking-wider"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredEntries.map((entry) => (
                <tr key={entry.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700 font-medium">{formatDate(entry.date)}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <ShoppingBag className="w-4 h-4 text-slate-400" />
                      <span className="text-sm text-slate-600">{getStoreName(entry.storeId)}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-slate-400" />
                      <span className="text-sm text-slate-600">{getUserName(entry.userId)}</span>
                      <span className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded uppercase">{getShiftName(entry.shiftTypeId)}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-bold text-slate-900">{formatCurrency(entry.totalRevenue)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-semibold text-red-500">{formatCurrency(entry.totalExpenses)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-bold text-emerald-600">{formatCurrency(entry.finalBalance)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <button 
                      onClick={() => handleDelete(entry.id)}
                      className="p-2 text-slate-300 hover:text-red-500 transition-colors"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))}
              {filteredEntries.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-400 italic">
                    ບໍ່ພົບຂໍ້ມູນຕາມເງື່ອນໄຂທີ່ເລືອກ
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Reports;

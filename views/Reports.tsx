
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { AppState, UserRole, EntryStatus } from '../types';
import { formatDate, formatCurrency, getTodayStr } from '../utils';
import { 
  Search, 
  Filter, 
  Trash2, 
  Calendar, 
  User, 
  ShoppingBag, 
  Clock, 
  Lock,
  Download,
  FileSpreadsheet,
  FileText as FilePdf,
  Loader2,
  Wallet,
  ArrowRightLeft,
  ShieldCheck,
  ShieldAlert,
  Coins
} from 'lucide-react';
import { TRANSLATIONS } from '../constants';
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

interface ReportsProps {
  state: AppState;
  onDeleteEntry: (id: string) => void;
}

const Reports: React.FC<ReportsProps> = ({ state, onDeleteEntry }) => {
  const isStaff = state.currentUser?.role === UserRole.STAFF;
  const [startDate, setStartDate] = useState(getTodayStr());
  const [endDate, setEndDate] = useState(getTodayStr());
  const [filterStore, setFilterStore] = useState('all');
  const [filterUser, setFilterUser] = useState(isStaff ? state.currentUser?.id || 'all' : 'all');
  const [isExporting, setIsExporting] = useState(false);
  
  const reportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isStaff) {
      setFilterUser(state.currentUser?.id || 'all');
    }
  }, [state.currentUser, isStaff]);

  const filteredEntries = useMemo(() => {
    return state.entries.filter(e => {
      const entryDate = e.date;
      const dateMatch = entryDate >= startDate && entryDate <= endDate;
      const storeMatch = filterStore === 'all' || e.store_id === filterStore;
      const targetUserId = isStaff ? state.currentUser?.id : filterUser;
      const userMatch = targetUserId === 'all' || e.user_id === targetUserId;
      return dateMatch && storeMatch && userMatch;
    });
  }, [state.entries, startDate, endDate, filterStore, filterUser, isStaff, state.currentUser]);

  // Totals only for VERIFIED entries in report summary
  const totals = useMemo(() => {
    return filteredEntries
      .filter(e => e.status === EntryStatus.VERIFIED)
      .reduce((acc, curr) => ({
        rev: acc.rev + curr.total_revenue,
        trans: acc.trans + curr.transfer_amount,
        exp: acc.exp + curr.total_expenses,
        bal: acc.bal + curr.final_balance,
        cashInDrawer: acc.cashInDrawer + curr.actual_cash_in_drawer
      }), { rev: 0, trans: 0, exp: 0, bal: 0, cashInDrawer: 0 });
  }, [filteredEntries]);

  const getStoreName = (id: string) => state.stores.find(s => s.id === id)?.name || 'N/A';
  const getUserName = (id: string) => state.users.find(u => u.id === id)?.name || 'N/A';
  const getShiftName = (id: string) => state.shiftTypes.find(s => s.id === id)?.name || 'N/A';

  const handleDelete = (id: string) => {
    if (confirm(TRANSLATIONS.confirmDelete)) {
      onDeleteEntry(id);
    }
  };

  const exportToExcel = () => {
    const data = filteredEntries.map(e => ({
      'ວັນທີ': e.date,
      'ຮ້ານຄ້າ': getStoreName(e.store_id),
      'ພະນັກງານ': getUserName(e.user_id),
      'ປະເພດກະ': getShiftName(e.shift_type_id),
      'ລາຍໄດ້ລວມໃນລະບົບ': e.total_revenue,
      'ຍອດໂອນ': e.transfer_amount,
      'ເງິນສົດໃນລິ້ນຊັກ': e.actual_cash_in_drawer,
      'ຄ່າໃຊ້ຈ່າຍ': e.total_expenses,
      'ຍອດຄົງເຫຼືອຈິງ': e.final_balance,
      'ສະຖານະ': e.status === EntryStatus.VERIFIED ? 'ກວດແລ້ວ' : 'ລໍຖ້າກວດ'
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Report');
    XLSX.writeFile(wb, `Report_${startDate}_to_${endDate}.xlsx`);
  };

  const exportToPDF = async () => {
    if (!reportRef.current) return;
    setIsExporting(true);
    
    try {
      const canvas = await html2canvas(reportRef.current, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff'
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Report_${startDate}_to_${endDate}.pdf`);
    } catch (error) {
      console.error('PDF Export failed:', error);
      alert('ເກີດຂໍ້ຜິດພາດໃນການສ້າງ PDF');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <Filter className="w-6 h-6 text-emerald-600" />
            <h2 className="text-xl font-bold text-slate-800">{TRANSLATIONS.reports}</h2>
            {isStaff && (
              <div className="flex items-center gap-2 px-3 py-1 bg-slate-100 text-slate-500 rounded-lg text-xs font-bold">
                <Lock className="w-3 h-3" />
                <span>ຂໍ້ມູນສ່ວນຕົວ</span>
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            <button 
              onClick={exportToExcel}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 rounded-xl text-sm font-bold hover:bg-emerald-100 transition-all border border-emerald-100"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Excel</span>
            </button>
            <button 
              onClick={exportToPDF}
              disabled={isExporting}
              className="flex items-center gap-2 px-4 py-2 bg-rose-50 text-rose-700 rounded-xl text-sm font-bold hover:bg-rose-100 transition-all border border-rose-100 disabled:opacity-50"
            >
              {isExporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <FilePdf className="w-4 h-4" />}
              <span>PDF</span>
            </button>
          </div>
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
        <div className="mt-4 p-2 bg-slate-50 rounded-lg text-[10px] text-slate-400 font-bold uppercase tracking-widest text-center">
          * ສະຫຼຸບຍອດລວມສະເພາະຂໍ້ມູນທີ່ກວດສອບແລ້ວເທົ່ານັ້ນ
        </div>
      </div>

      <div ref={reportRef} className="space-y-6 bg-white p-4 rounded-3xl">
        <div className="hidden pdf-only flex flex-col items-center mb-8">
           <h1 className="text-2xl font-bold text-slate-800">{TRANSLATIONS.appName}</h1>
           <p className="text-slate-500">ລາຍງານລະຫວ່າງວັນທີ: {formatDate(startDate)} ຫາ {formatDate(endDate)}</p>
        </div>

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
               <ArrowRightLeft className="w-6 h-6 text-blue-600" />
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
               <Wallet className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-xs font-bold text-emerald-100 uppercase">{TRANSLATIONS.finalBalance}</p>
              <p className="text-lg font-bold">{formatCurrency(totals.bal)}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full table-auto">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr>
                  <th className="px-4 py-4 text-left text-[10px] font-bold text-slate-500 uppercase tracking-wider">{TRANSLATIONS.date}</th>
                  <th className="px-4 py-4 text-left text-[10px] font-bold text-slate-500 uppercase tracking-wider">{TRANSLATIONS.store}</th>
                  <th className="px-4 py-4 text-left text-[10px] font-bold text-slate-500 uppercase tracking-wider">{TRANSLATIONS.staff}</th>
                  <th className="px-4 py-4 text-right text-[10px] font-bold text-slate-500 uppercase tracking-wider">{TRANSLATIONS.totalRevenue}</th>
                  <th className="px-4 py-4 text-right text-[10px] font-bold text-slate-500 uppercase tracking-wider">{TRANSLATIONS.transferAmount}</th>
                  <th className="px-4 py-4 text-right text-[10px] font-bold text-slate-500 uppercase tracking-wider">{TRANSLATIONS.actualCashInDrawer}</th>
                  <th className="px-4 py-4 text-right text-[10px] font-bold text-slate-500 uppercase tracking-wider">{TRANSLATIONS.expenses}</th>
                  <th className="px-4 py-4 text-right text-[10px] font-bold text-slate-500 uppercase tracking-wider font-black">{TRANSLATIONS.finalBalance}</th>
                  <th className="px-4 py-4 text-center text-[10px] font-bold text-slate-500 uppercase tracking-wider">{TRANSLATIONS.status}</th>
                  <th className="px-4 py-4 text-center text-[10px] font-bold text-slate-500 uppercase tracking-wider no-print"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredEntries.map((entry) => (
                  <tr key={entry.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-4 whitespace-nowrap text-[12px] text-slate-700 font-medium">{formatDate(entry.date)}</td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <ShoppingBag className="w-3 h-3 text-slate-400" />
                        <span className="text-[12px] text-slate-600">{getStoreName(entry.store_id)}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <User className="w-3 h-3 text-slate-400" />
                        <span className="text-[12px] text-slate-600">{getUserName(entry.user_id)}</span>
                        <span className="text-[9px] bg-slate-100 text-slate-500 px-1 py-0.5 rounded uppercase font-bold">{getShiftName(entry.shift_type_id)}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-right text-[12px] text-slate-600 font-medium">{formatCurrency(entry.total_revenue)}</td>
                    <td className="px-4 py-4 whitespace-nowrap text-right text-[12px] text-slate-600 font-medium">{formatCurrency(entry.transfer_amount)}</td>
                    <td className="px-4 py-4 whitespace-nowrap text-right text-[12px] text-slate-600 font-medium">{formatCurrency(entry.actual_cash_in_drawer)}</td>
                    <td className="px-4 py-4 whitespace-nowrap text-right text-[12px] text-red-500 font-medium">{formatCurrency(entry.total_expenses)}</td>
                    <td className="px-4 py-4 whitespace-nowrap text-right text-[13px] font-black text-slate-900">{formatCurrency(entry.final_balance)}</td>
                    <td className="px-4 py-4 whitespace-nowrap text-center">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                        entry.status === EntryStatus.VERIFIED 
                        ? 'bg-emerald-100 text-emerald-600 border border-emerald-200' 
                        : 'bg-amber-100 text-amber-600 border border-amber-200'
                      }`}>
                        {entry.status === EntryStatus.VERIFIED ? <ShieldCheck className="w-3 h-3" /> : <ShieldAlert className="w-3 h-3" />}
                        {entry.status === EntryStatus.VERIFIED ? TRANSLATIONS.verified : TRANSLATIONS.pending}
                      </span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-center no-print">
                      <button 
                        onClick={() => handleDelete(entry.id)}
                        className="p-1.5 text-slate-300 hover:text-red-500 transition-colors rounded-lg hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filteredEntries.length === 0 && (
            <div className="text-center py-20 text-slate-400">
               <div className="bg-slate-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-dashed border-slate-200">
                 <Search className="w-6 h-6 text-slate-200" />
               </div>
               <p className="text-sm font-bold uppercase tracking-widest">ບໍ່ພົບຂໍ້ມູນໃນການຄົ້ນຫາ</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Reports;


import React, { useState, useMemo } from 'react';
import { 
  AppState, 
  Entry, 
  Expense, 
  Store, 
  ShiftType,
  EntryStatus
} from '../types';
import { TRANSLATIONS as T } from '../constants';
import { getTodayStr, formatCurrency } from '../utils';
import NumberInput from '../components/NumberInput';
import { Plus, Trash2, Camera, Save, ReceiptText, Calculator } from 'lucide-react';

interface DashboardProps {
  state: AppState;
  onAddEntry: (entry: Entry) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ state, onAddEntry }) => {
  const [date, setDate] = useState(getTodayStr());
  const [storeId, setStoreId] = useState(state.stores[0]?.id || '');
  const [shiftTypeId, setShiftTypeId] = useState(state.shiftTypes[0]?.id || '');
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [transferAmount, setTransferAmount] = useState(0);
  const [actualCashInDrawer, setActualCashInDrawer] = useState(0);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  
  // New Expense state
  const [newExpAmount, setNewExpAmount] = useState(0);
  const [newExpDesc, setNewExpDesc] = useState('');
  const [newExpImg, setNewExpImg] = useState<string | null>(null);

  const expectedCash = useMemo(() => totalRevenue - transferAmount, [totalRevenue, transferAmount]);
  const difference = useMemo(() => expectedCash - actualCashInDrawer, [expectedCash, actualCashInDrawer]);
  const totalExpenses = useMemo(() => expenses.reduce((sum, exp) => sum + exp.amount, 0), [expenses]);
  const finalBalance = useMemo(() => actualCashInDrawer - totalExpenses, [actualCashInDrawer, totalExpenses]);

  const handleAddExpense = () => {
    if (newExpAmount <= 0 || !newExpDesc) return;
    // Fix: Use image_url instead of imageUrl to match Expense interface
    const exp: Expense = {
      id: crypto.randomUUID(),
      amount: newExpAmount,
      description: newExpDesc,
      image_url: newExpImg || undefined,
    };
    setExpenses([...expenses, exp]);
    setNewExpAmount(0);
    setNewExpDesc('');
    setNewExpImg(null);
  };

  const removeExpense = (id: string) => {
    setExpenses(expenses.filter(e => e.id !== id));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewExpImg(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveEntry = () => {
    if (!storeId || !shiftTypeId) {
        alert('ກະລຸນາເລືອກຮ້ານ ແລະ ປະເພດກະ');
        return;
    }

    // Fix: Map property names to match the snake_case fields in Entry interface
    // Added missing 'status' field to satisfy Entry interface requirement
    const newEntry: Entry = {
      id: crypto.randomUUID(),
      date,
      store_id: storeId,
      user_id: state.currentUser?.id || '',
      shift_type_id: shiftTypeId,
      total_revenue: totalRevenue,
      transfer_amount: transferAmount,
      expected_cash: expectedCash,
      actual_cash_in_drawer: actualCashInDrawer,
      difference,
      expenses,
      total_expenses: totalExpenses,
      final_balance: finalBalance,
      status: EntryStatus.PENDING,
      created_at: new Date().toISOString()
    };
    onAddEntry(newEntry);
    
    // Reset form
    setTotalRevenue(0);
    setTransferAmount(0);
    setActualCashInDrawer(0);
    setExpenses([]);
    alert('ບັນທຶກຂໍ້ມູນສຳເລັດແລ້ວ');
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
        <div className="flex items-center gap-3 mb-6">
          <ReceiptText className="w-6 h-6 text-emerald-600" />
          <h2 className="text-xl font-bold text-slate-800">ບັນທຶກລາຍຮັບປະຈຳວັນ</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Top Section: Basic Info */}
          <div className="space-y-4">
            <div>
              <label className="text-sm font-semibold text-slate-700 mb-1 block">{T.date}</label>
              <input 
                type="date" 
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg bg-white outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="text-sm font-semibold text-slate-700 mb-1 block">{T.store}</label>
              <select 
                value={storeId}
                onChange={(e) => setStoreId(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg bg-white outline-none focus:ring-2 focus:ring-emerald-500"
              >
                {state.stores.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
            <div>
              <label className="text-sm font-semibold text-slate-700 mb-1 block">{T.shift}</label>
              <select 
                value={shiftTypeId}
                onChange={(e) => setShiftTypeId(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg bg-white outline-none focus:ring-2 focus:ring-emerald-500"
              >
                {state.shiftTypes.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
          </div>

          {/* Money Section */}
          <div className="space-y-4">
            <NumberInput 
              label={T.totalRevenue}
              value={totalRevenue}
              onChange={setTotalRevenue}
              placeholder="0"
            />
            <NumberInput 
              label={T.transferAmount}
              value={transferAmount}
              onChange={setTransferAmount}
              placeholder="0"
            />
            <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-100">
               <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">{T.expectedCash}</span>
               <p className="text-xl font-bold text-emerald-800">{formatCurrency(expectedCash)} {T.currency}</p>
            </div>
            <NumberInput 
              label={T.actualCashInDrawer}
              value={actualCashInDrawer}
              onChange={setActualCashInDrawer}
              placeholder="0"
            />
            <div className={`p-3 rounded-lg border ${difference === 0 ? 'bg-slate-50 border-slate-200' : (difference > 0 ? 'bg-red-50 border-red-100' : 'bg-blue-50 border-blue-100')}`}>
               <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">{T.difference}</span>
               <p className={`text-xl font-bold ${difference > 0 ? 'text-red-600' : (difference < 0 ? 'text-blue-600' : 'text-slate-800')}`}>
                 {formatCurrency(difference)} {T.currency}
               </p>
            </div>
          </div>
        </div>
      </div>

      {/* Expenses Section */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
        <div className="flex items-center gap-3 mb-6">
          <Trash2 className="w-6 h-6 text-red-500" />
          <h2 className="text-xl font-bold text-slate-800">{T.expenses}</h2>
        </div>

        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <label className="text-sm font-semibold text-slate-700 mb-1 block">{T.expenseDescription}</label>
              <input 
                type="text" 
                value={newExpDesc}
                onChange={(e) => setNewExpDesc(e.target.value)}
                placeholder="ຕົວຢ່າງ: ຄ່າໄຟຟ້າ..."
                className="w-full px-4 py-2 border rounded-lg bg-white outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <NumberInput 
              label={T.expenseAmount}
              value={newExpAmount}
              onChange={setNewExpAmount}
            />
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-4">
            <label className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-300 rounded-lg cursor-pointer hover:bg-slate-50 transition-colors">
              <Camera className="w-5 h-5 text-slate-500" />
              <span className="text-sm font-medium text-slate-600">{T.attachImage}</span>
              <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
            </label>
            {newExpImg && (
              <div className="relative w-16 h-16 rounded-lg overflow-hidden border border-slate-200">
                <img src={newExpImg} alt="Proof" className="w-full h-full object-cover" />
                <button 
                  onClick={() => setNewExpImg(null)}
                  className="absolute top-0 right-0 p-0.5 bg-red-500 text-white rounded-bl-lg"
                >
                  <Plus className="w-3 h-3 rotate-45" />
                </button>
              </div>
            )}
            <button 
              onClick={handleAddExpense}
              disabled={!newExpDesc || newExpAmount <= 0}
              className="ml-auto flex items-center gap-2 px-6 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-900 transition-colors disabled:opacity-50"
            >
              <Plus className="w-5 h-5" />
              <span>{T.add}</span>
            </button>
          </div>
        </div>

        {expenses.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="text-left py-3 text-sm font-semibold text-slate-400">{T.expenseDescription}</th>
                  <th className="text-right py-3 text-sm font-semibold text-slate-400">{T.expenseAmount}</th>
                  <th className="text-center py-3 text-sm font-semibold text-slate-400">ຫຼັກຖານ</th>
                  <th className="text-right py-3 text-sm font-semibold text-slate-400"></th>
                </tr>
              </thead>
              <tbody>
                {expenses.map((exp) => (
                  <tr key={exp.id} className="border-b border-slate-50 last:border-0">
                    <td className="py-4 text-slate-700">{exp.description}</td>
                    <td className="py-4 text-right font-semibold text-slate-900">{formatCurrency(exp.amount)}</td>
                    <td className="py-4 flex justify-center">
                      {/* Fix: Use image_url instead of imageUrl */}
                      {exp.image_url ? (
                        <img src={exp.image_url} className="w-10 h-10 object-cover rounded shadow-sm border border-slate-200" alt="Receipt" />
                      ) : (
                        <span className="text-xs text-slate-300">ບໍ່ມີ</span>
                      )}
                    </td>
                    <td className="py-4 text-right">
                      <button onClick={() => removeExpense(exp.id)} className="p-2 text-red-400 hover:text-red-600">
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8 text-slate-400 text-sm italic">ຍັງບໍ່ມີລາຍການຄ່າໃຊ້ຈ່າຍ</div>
        )}

        <div className="mt-6 flex flex-col md:flex-row items-center gap-4 justify-between pt-6 border-t border-slate-100">
          <div className="flex gap-4">
             <div className="text-center">
               <p className="text-xs text-slate-500 font-bold uppercase">{T.expenses}</p>
               <p className="text-lg font-bold text-red-600">{formatCurrency(totalExpenses)} {T.currency}</p>
             </div>
             <div className="w-px bg-slate-200 h-10"></div>
             <div className="text-center">
               <p className="text-xs text-slate-500 font-bold uppercase">{T.finalBalance}</p>
               <p className="text-lg font-bold text-emerald-600">{formatCurrency(finalBalance)} {T.currency}</p>
             </div>
          </div>

          <button 
            onClick={handleSaveEntry}
            className="w-full md:w-auto flex items-center justify-center gap-3 px-10 py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-bold shadow-lg shadow-emerald-100 transition-all hover:-translate-y-0.5"
          >
            <Save className="w-6 h-6" />
            <span>{T.save}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

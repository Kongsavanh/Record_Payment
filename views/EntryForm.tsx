
import React, { useState, useMemo } from 'react';
import { 
  AppState, 
  Entry, 
  Expense, 
  Store, 
  ShiftType 
} from '../types';
import { TRANSLATIONS as T } from '../constants';
import { getTodayStr, formatCurrency } from '../utils';
import NumberInput from '../components/NumberInput';
import { Plus, Trash2, Camera, Save, ReceiptText, Calculator, X, Loader2 } from 'lucide-react';

interface EntryFormProps {
  state: AppState;
  onAddEntry: (entry: Entry) => Promise<void>;
  onSuccess: () => void;
}

const EntryForm: React.FC<EntryFormProps> = ({ state, onAddEntry, onSuccess }) => {
  const [isSaving, setIsSaving] = useState(false);
  const [date, setDate] = useState(getTodayStr());
  const [storeId, setStoreId] = useState(state.stores[0]?.id || '');
  const [shiftTypeId, setShiftTypeId] = useState(state.shiftTypes[0]?.id || '');
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [transferAmount, setTransferAmount] = useState(0);
  const [actualCashInDrawer, setActualCashInDrawer] = useState(0);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  
  const [newExpAmount, setNewExpAmount] = useState(0);
  const [newExpDesc, setNewExpDesc] = useState('');
  const [newExpImg, setNewExpImg] = useState<string | null>(null);

  const expectedCash = useMemo(() => totalRevenue - transferAmount, [totalRevenue, transferAmount]);
  const difference = useMemo(() => expectedCash - actualCashInDrawer, [expectedCash, actualCashInDrawer]);
  const totalExpenses = useMemo(() => expenses.reduce((sum, exp) => sum + exp.amount, 0), [expenses]);
  const finalBalance = useMemo(() => actualCashInDrawer - totalExpenses, [actualCashInDrawer, totalExpenses]);

  const handleAddExpense = () => {
    if (newExpAmount <= 0 || !newExpDesc) return;
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

  const handleSaveEntry = async () => {
    if (!storeId || !shiftTypeId) {
        alert('ກະລຸນາເລືອກຮ້ານ ແລະ ປະເພດກະ');
        return;
    }

    if (isSaving) return;

    try {
      setIsSaving(true);
      const entryId = crypto.randomUUID();
      const newEntry: Entry = {
        id: entryId,
        date,
        store_id: storeId,
        user_id: state.currentUser?.id || '',
        shift_type_id: shiftTypeId,
        total_revenue: totalRevenue,
        transfer_amount: transferAmount,
        expected_cash: expectedCash,
        actual_cash_in_drawer: actualCashInDrawer,
        difference,
        expenses: expenses.map(ex => ({ ...ex, entry_id: entryId })),
        total_expenses: totalExpenses,
        final_balance: finalBalance,
        created_at: new Date().toISOString()
      };
      
      await onAddEntry(newEntry);
      
      // UI Feedback
      alert('ບັນທຶກຂໍ້ມູນສຳເລັດແລ້ວ');
      onSuccess();
    } catch (error) {
      console.error('Error saving entry:', error);
      alert('ເກີດຂໍ້ຜິດພາດໃນການບັນທຶກຂໍ້ມູນ');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6 md:p-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-emerald-100 rounded-2xl text-emerald-600">
              <ReceiptText className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-bold text-slate-800">{T.record}</h2>
          </div>
          <button onClick={onSuccess} className="p-2 text-slate-400 hover:bg-slate-100 rounded-full transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-5">
            <div>
              <label className="text-sm font-bold text-slate-700 mb-1.5 block">{T.date}</label>
              <input 
                type="date" 
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-4 py-3 border border-slate-200 rounded-xl bg-slate-50 outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all font-medium"
              />
            </div>
            <div>
              <label className="text-sm font-bold text-slate-700 mb-1.5 block">{T.store}</label>
              <select 
                value={storeId}
                onChange={(e) => setStoreId(e.target.value)}
                className="w-full px-4 py-3 border border-slate-200 rounded-xl bg-slate-50 outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all font-medium appearance-none"
              >
                {state.stores.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
            <div>
              <label className="text-sm font-bold text-slate-700 mb-1.5 block">{T.shift}</label>
              <select 
                value={shiftTypeId}
                onChange={(e) => setShiftTypeId(e.target.value)}
                className="w-full px-4 py-3 border border-slate-200 rounded-xl bg-slate-50 outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all font-medium appearance-none"
              >
                {state.shiftTypes.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
          </div>

          <div className="space-y-5">
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
            
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
                <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest block mb-1">{T.expectedCash}</span>
                <p className="text-lg font-black text-emerald-800">{formatCurrency(expectedCash)}</p>
              </div>
              <div className={`p-4 rounded-2xl border transition-colors ${difference === 0 ? 'bg-slate-50 border-slate-100' : (difference > 0 ? 'bg-red-50 border-red-100' : 'bg-blue-50 border-blue-100')}`}>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-1">{T.difference}</span>
                <p className={`text-lg font-black ${difference > 0 ? 'text-red-600' : (difference < 0 ? 'text-blue-600' : 'text-slate-800')}`}>
                  {formatCurrency(difference)}
                </p>
              </div>
            </div>

            <NumberInput 
              label={T.actualCashInDrawer}
              value={actualCashInDrawer}
              onChange={setActualCashInDrawer}
              placeholder="0"
            />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6 md:p-8">
        <div className="flex items-center gap-3 mb-8">
          <div className="p-3 bg-red-50 rounded-2xl text-red-500">
            <Trash2 className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-bold text-slate-800">{T.expenses}</h2>
        </div>

        <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2">
              <label className="text-sm font-bold text-slate-700 mb-1.5 block">{T.expenseDescription}</label>
              <input 
                type="text" 
                value={newExpDesc}
                onChange={(e) => setNewExpDesc(e.target.value)}
                placeholder="ຕົວຢ່າງ: ຄ່າໄຟຟ້າ..."
                className="w-full px-4 py-3 border border-slate-200 rounded-xl bg-white outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
              />
            </div>
            <NumberInput 
              label={T.expenseAmount}
              value={newExpAmount}
              onChange={setNewExpAmount}
            />
          </div>
          <div className="mt-6 flex flex-wrap items-center gap-4">
            <label className="flex items-center gap-3 px-6 py-3 bg-white border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-50 transition-all font-bold text-slate-600">
              <Camera className="w-5 h-5 text-slate-400" />
              <span className="text-sm">{T.attachImage}</span>
              <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
            </label>
            {newExpImg && (
              <div className="relative w-20 h-20 rounded-2xl overflow-hidden border-2 border-emerald-500 shadow-md">
                <img src={newExpImg} alt="Proof" className="w-full h-full object-cover" />
                <button 
                  onClick={() => setNewExpImg(null)}
                  className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full shadow-lg"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            )}
            <button 
              onClick={handleAddExpense}
              disabled={!newExpDesc || newExpAmount <= 0 || isSaving}
              className="ml-auto flex items-center gap-2 px-8 py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-black transition-all disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <Plus className="w-5 h-5" />
              <span>{T.add}</span>
            </button>
          </div>
        </div>

        {expenses.length > 0 ? (
          <div className="space-y-3">
            {expenses.map((exp) => (
              <div key={exp.id} className="flex items-center justify-between p-4 bg-white border border-slate-100 rounded-2xl hover:border-slate-200 transition-all group">
                <div className="flex items-center gap-4">
                  {exp.image_url ? (
                    <img src={exp.image_url} className="w-12 h-12 object-cover rounded-xl shadow-sm border border-slate-200" alt="Receipt" />
                  ) : (
                    <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center text-slate-300">
                      <Camera className="w-5 h-5" />
                    </div>
                  )}
                  <div>
                    <p className="font-bold text-slate-800">{exp.description}</p>
                    <p className="text-sm font-bold text-red-500">{formatCurrency(exp.amount)} {T.currency}</p>
                  </div>
                </div>
                <button 
                  onClick={() => removeExpense(exp.id)} 
                  disabled={isSaving}
                  className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-full transition-all opacity-0 group-hover:opacity-100 disabled:hidden"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-slate-400 text-sm italic border-2 border-dashed border-slate-100 rounded-3xl">
            ຍັງບໍ່ມີລາຍການຄ່າໃຊ້ຈ່າຍ
          </div>
        )}

        <div className="mt-10 pt-8 border-t border-slate-100">
          <div className="grid grid-cols-2 gap-6 mb-8">
             <div className="bg-slate-50 p-4 rounded-2xl">
               <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1">{T.expenses}</p>
               <p className="text-xl font-black text-red-600">{formatCurrency(totalExpenses)}</p>
             </div>
             <div className="bg-emerald-50 p-4 rounded-2xl">
               <p className="text-[10px] text-emerald-500 font-bold uppercase tracking-widest mb-1">{T.finalBalance}</p>
               <p className="text-xl font-black text-emerald-600">{formatCurrency(finalBalance)}</p>
             </div>
          </div>

          <button 
            onClick={handleSaveEntry}
            disabled={isSaving}
            className="w-full flex items-center justify-center gap-3 px-10 py-5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-black text-lg shadow-xl shadow-emerald-100 transition-all hover:-translate-y-1 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-6 h-6 animate-spin" />
                <span>ກຳລັງບັນທຶກ...</span>
              </>
            ) : (
              <>
                <Save className="w-6 h-6" />
                <span>{T.save}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EntryForm;

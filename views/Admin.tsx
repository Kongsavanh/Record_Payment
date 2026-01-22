
import React, { useState, useMemo } from 'react';
import { 
  AppState, 
  User, 
  UserRole, 
  Store, 
  ShiftType,
  EntryStatus
} from '../types';
import { TRANSLATIONS as T } from '../constants';
import { formatCurrency, formatDate } from '../utils';
import { 
  Users, 
  Store as StoreIcon, 
  Clock, 
  Plus, 
  Trash2, 
  Shield, 
  Key, 
  UserPlus, 
  ShieldCheck,
  ClipboardList,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

interface AdminProps {
  state: AppState;
  onAddUser: (user: User) => void;
  onRemoveUser: (id: string) => void;
  onAddStore: (store: Store) => void;
  onRemoveStore: (id: string) => void;
  onAddShift: (shift: ShiftType) => void;
  onRemoveShift: (id: string) => void;
  onUpdateUser?: (user: User) => void;
  onVerifyEntry?: (id: string) => Promise<void>;
}

const Admin: React.FC<AdminProps> = ({ 
  state, 
  onAddUser, 
  onRemoveUser, 
  onAddStore, 
  onRemoveStore, 
  onAddShift, 
  onRemoveShift,
  onUpdateUser,
  onVerifyEntry
}) => {
  const [activeTab, setActiveTab] = useState<'review' | 'users' | 'stores' | 'shifts'>('review');
  
  const [newUserName, setNewUserName] = useState('');
  const [newUserUsername, setNewUserUsername] = useState('');
  const [newUserPass, setNewUserPass] = useState('');
  const [newUserRole, setNewUserRole] = useState<UserRole>(UserRole.STAFF);

  const [resettingUserId, setResettingUserId] = useState<string | null>(null);
  const [resetPassword, setResetPassword] = useState('');

  const [newStoreName, setNewStoreName] = useState('');
  const [newShiftName, setNewShiftName] = useState('');

  const pendingEntries = useMemo(() => {
    return state.entries.filter(e => e.status === EntryStatus.PENDING);
  }, [state.entries]);

  const handleVerify = async (id: string) => {
    if (!onVerifyEntry) return;
    try {
      await onVerifyEntry(id);
      alert('ຢືນຢັນຂໍ້ມູນສຳເລັດແລ້ວ');
    } catch (error) {
      alert('ເກີດຂໍ້ຜິດພາດໃນການຢືນຢັນ');
    }
  };

  const handleAddUser = () => {
    if (!newUserName || !newUserUsername || !newUserPass) return;
    onAddUser({
      id: crypto.randomUUID(),
      name: newUserName,
      username: newUserUsername,
      password: newUserPass,
      role: newUserRole
    });
    setNewUserName('');
    setNewUserUsername('');
    setNewUserPass('');
    setNewUserRole(UserRole.STAFF);
  };

  const handleResetPassword = (userId: string) => {
    if (!resetPassword || !onUpdateUser) return;
    const user = state.users.find(u => u.id === userId);
    if (user) {
      onUpdateUser({ ...user, password: resetPassword });
      setResettingUserId(null);
      setResetPassword('');
      alert('ປ່ຽນລະຫັດຜ່ານສຳເລັດແລ້ວ');
    }
  };

  const handleAddStore = () => {
    if (!newStoreName) return;
    onAddStore({ id: crypto.randomUUID(), name: newStoreName });
    setNewStoreName('');
  };

  const handleAddShift = () => {
    if (!newShiftName) return;
    onAddShift({ id: crypto.randomUUID(), name: newShiftName });
    setNewShiftName('');
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Navigation */}
      <div className="flex border-b border-slate-200 gap-6 overflow-x-auto no-scrollbar">
        <button 
          onClick={() => setActiveTab('review')}
          className={`pb-3 text-sm font-bold transition-all relative whitespace-nowrap flex items-center gap-2 ${activeTab === 'review' ? 'text-emerald-600' : 'text-slate-400 hover:text-slate-600'}`}
        >
          <ClipboardList className="w-4 h-4" />
          <span>{T.verification}</span>
          {pendingEntries.length > 0 && (
            <span className="bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full animate-bounce">
              {pendingEntries.length}
            </span>
          )}
          {activeTab === 'review' && <div className="absolute bottom-0 left-0 right-0 h-1 bg-emerald-600 rounded-t-full" />}
        </button>
        <button 
          onClick={() => setActiveTab('users')}
          className={`pb-3 text-sm font-bold transition-all relative whitespace-nowrap flex items-center gap-2 ${activeTab === 'users' ? 'text-emerald-600' : 'text-slate-400 hover:text-slate-600'}`}
        >
          <Users className="w-4 h-4" />
          <span>ຈັດການຜູ້ໃຊ້</span>
          {activeTab === 'users' && <div className="absolute bottom-0 left-0 right-0 h-1 bg-emerald-600 rounded-t-full" />}
        </button>
        <button 
          onClick={() => setActiveTab('stores')}
          className={`pb-3 text-sm font-bold transition-all relative whitespace-nowrap flex items-center gap-2 ${activeTab === 'stores' ? 'text-emerald-600' : 'text-slate-400 hover:text-slate-600'}`}
        >
          <StoreIcon className="w-4 h-4" />
          <span>ຮ້ານຄ້າ</span>
          {activeTab === 'stores' && <div className="absolute bottom-0 left-0 right-0 h-1 bg-emerald-600 rounded-t-full" />}
        </button>
        <button 
          onClick={() => setActiveTab('shifts')}
          className={`pb-3 text-sm font-bold transition-all relative whitespace-nowrap flex items-center gap-2 ${activeTab === 'shifts' ? 'text-emerald-600' : 'text-slate-400 hover:text-slate-600'}`}
        >
          <Clock className="w-4 h-4" />
          <span>ປະເພດກະ</span>
          {activeTab === 'shifts' && <div className="absolute bottom-0 left-0 right-0 h-1 bg-emerald-600 rounded-t-full" />}
        </button>
      </div>

      {/* Content */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6">
        {activeTab === 'review' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between mb-4">
               <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2">
                 <ShieldCheck className="w-5 h-5 text-emerald-600" />
                 ລາຍການລໍຖ້າການຢືນຢັນ
               </h3>
               <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                 ພົບທັງໝົດ {pendingEntries.length} ລາຍການ
               </span>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {pendingEntries.map(entry => (
                <div key={entry.id} className="p-6 border border-slate-100 rounded-2xl bg-slate-50 hover:bg-white hover:border-emerald-200 transition-all shadow-sm">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{T.date}</p>
                        <p className="font-bold text-slate-800">{formatDate(entry.date)}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{T.store}</p>
                        <p className="font-bold text-slate-800">{state.stores.find(s => s.id === entry.store_id)?.name}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{T.staff}</p>
                        <p className="font-bold text-emerald-600">{state.users.find(u => u.id === entry.user_id)?.name}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{T.finalBalance}</p>
                        <p className="font-black text-slate-900 text-lg">{formatCurrency(entry.final_balance)}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <button 
                        onClick={() => handleVerify(entry.id)}
                        className="flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 shadow-lg shadow-emerald-100 transition-all active:scale-95"
                      >
                        <CheckCircle2 className="w-5 h-5" />
                        <span>{T.approve}</span>
                      </button>
                    </div>
                  </div>
                  
                  {entry.expenses.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-slate-200/50">
                       <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">ລາຍການຄ່າໃຊ້ຈ່າຍ ({entry.expenses.length})</p>
                       <div className="flex flex-wrap gap-2">
                         {entry.expenses.map((ex, idx) => (
                           <div key={idx} className="bg-white px-3 py-1.5 rounded-lg border border-slate-200 flex items-center gap-2">
                             <span className="text-xs text-slate-600 font-medium">{ex.description}:</span>
                             <span className="text-xs text-red-500 font-bold">{formatCurrency(ex.amount)}</span>
                           </div>
                         ))}
                       </div>
                    </div>
                  )}
                </div>
              ))}
              
              {pendingEntries.length === 0 && (
                <div className="text-center py-20 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
                   <div className="bg-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                      <CheckCircle2 className="w-8 h-8 text-emerald-500" />
                   </div>
                   <h4 className="font-bold text-slate-800">ທຸກຢ່າງຮຽບຮ້ອຍ!</h4>
                   <p className="text-slate-400 text-sm mt-1">ບໍ່ມີລາຍການໃໝ່ທີ່ລໍຖ້າການກວດສອບ</p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'users' && (
          <div className="space-y-8">
            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200">
              <div className="flex items-center gap-2 mb-4">
                <UserPlus className="w-5 h-5 text-emerald-600" />
                <h3 className="font-bold text-slate-800">ເພີ່ມບັນຊີຜູ້ໃຊ້ໃໝ່</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
                <div className="lg:col-span-1">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1.5 ml-1">ຊື່-ນາມສະກຸນ</label>
                  <input 
                    type="text" 
                    value={newUserName}
                    onChange={(e) => setNewUserName(e.target.value)}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                    placeholder="ນາງ ສົມໃຈ"
                  />
                </div>
                <div className="lg:col-span-1">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1.5 ml-1">ຊື່ຜູ້ໃຊ້ (Login)</label>
                  <input 
                    type="text" 
                    value={newUserUsername}
                    onChange={(e) => setNewUserUsername(e.target.value)}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                    placeholder="somjai_123"
                  />
                </div>
                <div className="lg:col-span-1">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1.5 ml-1">ລະຫັດຜ່ານ</label>
                  <input 
                    type="text" 
                    value={newUserPass}
                    onChange={(e) => setNewUserPass(e.target.value)}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                    placeholder="••••••"
                  />
                </div>
                <div className="lg:col-span-1">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1.5 ml-1">ສິດທິການໃຊ້</label>
                  <select 
                    value={newUserRole}
                    onChange={(e) => setNewUserRole(e.target.value as UserRole)}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500 bg-white appearance-none"
                  >
                    <option value={UserRole.STAFF}>ພະນັກງານ (Staff)</option>
                    <option value={UserRole.ADMIN}>ຜູ້ດູແລ (Admin)</option>
                  </select>
                </div>
                <button 
                  onClick={handleAddUser}
                  className="flex items-center justify-center gap-2 px-6 py-2.5 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-100"
                >
                  <Plus className="w-4 h-4" />
                  <span>{T.add}</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {state.users.map(user => (
                <div key={user.id} className="p-5 border border-slate-100 rounded-2xl bg-white hover:border-emerald-200 transition-all group relative overflow-hidden">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <div className={`p-3 rounded-2xl ${user.role === UserRole.ADMIN ? 'bg-amber-100 text-amber-600' : 'bg-slate-100 text-slate-600'}`}>
                        {user.role === UserRole.ADMIN ? <Shield className="w-6 h-6" /> : <Users className="w-6 h-6" />}
                      </div>
                      <div>
                        <h4 className="font-black text-slate-800 text-lg">{user.name}</h4>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-400">@{user.username}</span>
                          <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-black uppercase ${user.role === UserRole.ADMIN ? 'bg-amber-500 text-white' : 'bg-slate-200 text-slate-500'}`}>
                            {user.role}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => setResettingUserId(resettingUserId === user.id ? null : user.id)}
                        className={`p-2 rounded-xl transition-all ${resettingUserId === user.id ? 'bg-emerald-100 text-emerald-600' : 'text-slate-300 hover:text-emerald-500 hover:bg-emerald-50'}`}
                        title="ຣີເຊັດລະຫັດຜ່ານ"
                      >
                        <Key className="w-5 h-5" />
                      </button>
                      {user.id !== state.currentUser?.id && (
                        <button 
                          onClick={() => onRemoveUser(user.id)}
                          className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                          title="ລຶບບັນຊີ"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      )}
                    </div>
                  </div>

                  {resettingUserId === user.id && (
                    <div className="mt-4 pt-4 border-t border-slate-100 flex gap-2 animate-fadeIn">
                      <input 
                        type="password" 
                        value={resetPassword}
                        onChange={(e) => setResetPassword(e.target.value)}
                        placeholder="ລະຫັດຜ່ານໃໝ່..."
                        className="flex-1 px-4 py-2 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                      <button 
                        onClick={() => handleResetPassword(user.id)}
                        className="px-4 py-2 bg-slate-900 text-white rounded-xl text-sm font-bold hover:bg-black transition-all"
                      >
                        ຢືນຢັນ
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'stores' && (
          <div className="space-y-6">
            <div className="flex gap-4 items-end bg-slate-50 p-6 rounded-2xl border border-slate-200">
              <div className="flex-1">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1.5 ml-1">ຊື່ຮ້ານຄ້າໃໝ່</label>
                <input 
                  type="text" 
                  value={newStoreName}
                  onChange={(e) => setNewStoreName(e.target.value)}
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                  placeholder="ຊື່ຮ້ານ..."
                />
              </div>
              <button 
                onClick={handleAddStore}
                className="flex items-center justify-center gap-2 px-8 py-3 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-100"
              >
                <Plus className="w-4 h-4" />
                <span>{T.add}</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {state.stores.map(store => (
                <div key={store.id} className="p-4 border border-slate-100 rounded-2xl flex items-center justify-between bg-white hover:border-emerald-200 transition-all group">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-slate-50 rounded-xl text-slate-400 group-hover:text-emerald-500 group-hover:bg-emerald-50 transition-all">
                      <StoreIcon className="w-5 h-5" />
                    </div>
                    <span className="font-bold text-slate-800">{store.name}</span>
                  </div>
                  <button 
                    onClick={() => onRemoveStore(store.id)}
                    className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'shifts' && (
          <div className="space-y-6">
            <div className="flex gap-4 items-end bg-slate-50 p-6 rounded-2xl border border-slate-200">
              <div className="flex-1">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1.5 ml-1">ຊື່ປະເພດກະໃໝ່</label>
                <input 
                  type="text" 
                  value={newShiftName}
                  onChange={(e) => setNewShiftName(e.target.value)}
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                  placeholder="ຕົວຢ່າງ: ກະບ່າຍ..."
                />
              </div>
              <button 
                onClick={handleAddShift}
                className="flex items-center justify-center gap-2 px-8 py-3 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-100"
              >
                <Plus className="w-4 h-4" />
                <span>{T.add}</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {state.shiftTypes.map(shift => (
                <div key={shift.id} className="p-4 border border-slate-100 rounded-2xl flex items-center justify-between bg-white hover:border-emerald-200 transition-all group">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-slate-50 rounded-xl text-slate-400 group-hover:text-emerald-500 group-hover:bg-emerald-50 transition-all">
                      <Clock className="w-5 h-5" />
                    </div>
                    <span className="font-bold text-slate-800">{shift.name}</span>
                  </div>
                  <button 
                    onClick={() => onRemoveShift(shift.id)}
                    className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Admin;

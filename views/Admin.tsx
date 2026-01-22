
import React, { useState } from 'react';
import { 
  AppState, 
  User, 
  UserRole, 
  Store, 
  ShiftType 
} from '../types';
import { TRANSLATIONS } from '../constants';
import { supabase } from '../lib/supabase';
import { 
  Users, 
  Store as StoreIcon, 
  Clock, 
  Plus, 
  Trash2, 
  Shield, 
  Key, 
  UserPlus, 
  Activity,
  CheckCircle2,
  XCircle,
  Loader2
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
}

const Admin: React.FC<AdminProps> = ({ 
  state, 
  onAddUser, 
  onRemoveUser, 
  onAddStore, 
  onRemoveStore, 
  onAddShift, 
  onRemoveShift,
  onUpdateUser
}) => {
  const [activeTab, setActiveTab] = useState<'users' | 'stores' | 'shifts' | 'system'>('users');
  
  // Input states
  const [newUserName, setNewUserName] = useState('');
  const [newUserUsername, setNewUserUsername] = useState('');
  const [newUserPass, setNewUserPass] = useState('');
  const [newUserRole, setNewUserRole] = useState<UserRole>(UserRole.STAFF);
  const [newStoreName, setNewStoreName] = useState('');
  const [newShiftName, setNewShiftName] = useState('');

  // Password reset
  const [resettingUserId, setResettingUserId] = useState<string | null>(null);
  const [resetPassword, setResetPassword] = useState('');

  // System Diagnosis
  const [diagStatus, setDiagStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [diagMsg, setDiagMsg] = useState('');

  const checkConnection = async () => {
    setDiagStatus('loading');
    setDiagMsg('ກຳລັງທົດສອບການເຊື່ອມຕໍ່ຖານຂໍ້ມູນ...');
    try {
      const start = Date.now();
      const { error } = await supabase.from('users').select('count', { count: 'exact', head: true });
      const duration = Date.now() - start;
      
      if (error) throw error;
      
      setDiagStatus('success');
      setDiagMsg(`ເຊື່ອມຕໍ່ສຳເລັດ! ຄວາມໄວການຕອບສະໜອງ: ${duration}ms`);
    } catch (err: any) {
      setDiagStatus('error');
      setDiagMsg(`ການເຊື່ອມຕໍ່ມີບັນຫາ: ${err.message || 'Timed out'}`);
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
    setNewUserName(''); setNewUserUsername(''); setNewUserPass('');
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

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Navigation */}
      <div className="flex border-b border-slate-200 gap-6 overflow-x-auto no-scrollbar pb-1">
        <button onClick={() => setActiveTab('users')} className={`pb-3 text-sm font-bold relative whitespace-nowrap flex items-center gap-2 ${activeTab === 'users' ? 'text-emerald-600' : 'text-slate-400'}`}>
          <Users className="w-4 h-4" /> <span>ຜູ້ໃຊ້</span>
          {activeTab === 'users' && <div className="absolute bottom-0 left-0 right-0 h-1 bg-emerald-600 rounded-t-full" />}
        </button>
        <button onClick={() => setActiveTab('stores')} className={`pb-3 text-sm font-bold relative whitespace-nowrap flex items-center gap-2 ${activeTab === 'stores' ? 'text-emerald-600' : 'text-slate-400'}`}>
          <StoreIcon className="w-4 h-4" /> <span>ຮ້ານຄ້າ</span>
          {activeTab === 'stores' && <div className="absolute bottom-0 left-0 right-0 h-1 bg-emerald-600 rounded-t-full" />}
        </button>
        <button onClick={() => setActiveTab('shifts')} className={`pb-3 text-sm font-bold relative whitespace-nowrap flex items-center gap-2 ${activeTab === 'shifts' ? 'text-emerald-600' : 'text-slate-400'}`}>
          <Clock className="w-4 h-4" /> <span>ປະເພດກະ</span>
          {activeTab === 'shifts' && <div className="absolute bottom-0 left-0 right-0 h-1 bg-emerald-600 rounded-t-full" />}
        </button>
        <button onClick={() => setActiveTab('system')} className={`pb-3 text-sm font-bold relative whitespace-nowrap flex items-center gap-2 ${activeTab === 'system' ? 'text-emerald-600' : 'text-slate-400'}`}>
          <Activity className="w-4 h-4" /> <span>ລະບົບ</span>
          {activeTab === 'system' && <div className="absolute bottom-0 left-0 right-0 h-1 bg-emerald-600 rounded-t-full" />}
        </button>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6">
        {activeTab === 'users' && (
          <div className="space-y-8">
            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
                <div className="lg:col-span-1">
                  <label className="text-xs font-bold text-slate-500 mb-1 block">ຊື່-ນາມສະກຸນ</label>
                  <input type="text" value={newUserName} onChange={(e) => setNewUserName(e.target.value)} className="w-full px-4 py-2.5 border rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500" placeholder="ຊື່ພະນັກງານ..." />
                </div>
                <div className="lg:col-span-1">
                  <label className="text-xs font-bold text-slate-500 mb-1 block">Username</label>
                  <input type="text" value={newUserUsername} onChange={(e) => setNewUserUsername(e.target.value)} className="w-full px-4 py-2.5 border rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500" placeholder="ຊື່ເຂົ້າລະບົບ..." />
                </div>
                <div className="lg:col-span-1">
                  <label className="text-xs font-bold text-slate-500 mb-1 block">ລະຫັດຜ່ານ</label>
                  <input type="text" value={newUserPass} onChange={(e) => setNewUserPass(e.target.value)} className="w-full px-4 py-2.5 border rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500" placeholder="••••••" />
                </div>
                <div className="lg:col-span-1">
                  <label className="text-xs font-bold text-slate-500 mb-1 block">ສິດທິ</label>
                  <select value={newUserRole} onChange={(e) => setNewUserRole(e.target.value as UserRole)} className="w-full px-4 py-2.5 border rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500">
                    <option value={UserRole.STAFF}>ພະນັກງານ</option>
                    <option value={UserRole.ADMIN}>ຜູ້ດູແລ</option>
                  </select>
                </div>
                <button onClick={handleAddUser} className="flex items-center justify-center gap-2 px-6 py-2.5 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 shadow-lg shadow-emerald-100"><Plus className="w-4 h-4" /> ເພີ່ມ</button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {state.users.map(user => (
                <div key={user.id} className="p-5 border border-slate-100 rounded-2xl bg-white hover:border-emerald-200 transition-all">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`p-3 rounded-2xl ${user.role === UserRole.ADMIN ? 'bg-amber-100 text-amber-600' : 'bg-slate-100 text-slate-600'}`}>
                        {user.role === UserRole.ADMIN ? <Shield className="w-6 h-6" /> : <Users className="w-6 h-6" />}
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-800">{user.name}</h4>
                        <span className="text-xs text-slate-400">@{user.username}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={() => setResettingUserId(resettingUserId === user.id ? null : user.id)} className={`p-2 rounded-xl ${resettingUserId === user.id ? 'bg-emerald-100 text-emerald-600' : 'text-slate-300 hover:text-emerald-500'}`}><Key className="w-5 h-5" /></button>
                      {user.id !== state.currentUser?.id && <button onClick={() => onRemoveUser(user.id)} className="p-2 text-slate-300 hover:text-red-500"><Trash2 className="w-5 h-5" /></button>}
                    </div>
                  </div>
                  {resettingUserId === user.id && (
                    <div className="mt-4 pt-4 border-t flex gap-2 animate-fadeIn">
                      <input type="password" value={resetPassword} onChange={(e) => setResetPassword(e.target.value)} placeholder="ລະຫັດຜ່ານໃໝ່..." className="flex-1 px-4 py-2 border rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500" />
                      <button onClick={() => handleResetPassword(user.id)} className="px-4 py-2 bg-slate-900 text-white rounded-xl text-sm font-bold">ຢືນຢັນ</button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'stores' && (
          <div className="space-y-6">
            <div className="flex gap-4 items-end bg-slate-50 p-6 rounded-2xl">
              <div className="flex-1">
                <label className="text-xs font-bold text-slate-500 mb-1 block">ຊື່ຮ້ານຄ້າໃໝ່</label>
                <input type="text" value={newStoreName} onChange={(e) => setNewStoreName(e.target.value)} className="w-full px-4 py-3 border rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500" placeholder="ຊື່ຮ້ານ..." />
              </div>
              <button onClick={() => { if(newStoreName) { onAddStore({id: crypto.randomUUID(), name: newStoreName}); setNewStoreName(''); }}} className="px-8 py-3 bg-emerald-600 text-white rounded-xl font-bold shadow-lg shadow-emerald-100">ເພີ່ມ</button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {state.stores.map(store => (
                <div key={store.id} className="p-4 border border-slate-100 rounded-2xl flex items-center justify-between bg-white hover:border-emerald-200">
                  <span className="font-bold text-slate-800">{store.name}</span>
                  <button onClick={() => onRemoveStore(store.id)} className="p-2 text-slate-300 hover:text-red-500"><Trash2 className="w-5 h-5" /></button>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'shifts' && (
          <div className="space-y-6">
            <div className="flex gap-4 items-end bg-slate-50 p-6 rounded-2xl">
              <div className="flex-1">
                <label className="text-xs font-bold text-slate-500 mb-1 block">ຊື່ປະເພດກະໃໝ່</label>
                <input type="text" value={newShiftName} onChange={(e) => setNewShiftName(e.target.value)} className="w-full px-4 py-3 border rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500" placeholder="ຕົວຢ່າງ: ກະຄ່ຳ..." />
              </div>
              <button onClick={() => { if(newShiftName) { onAddShift({id: crypto.randomUUID(), name: newShiftName}); setNewShiftName(''); }}} className="px-8 py-3 bg-emerald-600 text-white rounded-xl font-bold shadow-lg shadow-emerald-100">ເພີ່ມ</button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {state.shiftTypes.map(shift => (
                <div key={shift.id} className="p-4 border border-slate-100 rounded-2xl flex items-center justify-between bg-white hover:border-emerald-200">
                  <span className="font-bold text-slate-800">{shift.name}</span>
                  <button onClick={() => onRemoveShift(shift.id)} className="p-2 text-slate-300 hover:text-red-500"><Trash2 className="w-5 h-5" /></button>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'system' && (
          <div className="space-y-6">
            <div className="p-6 bg-slate-50 rounded-3xl border border-slate-200">
              <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                <Activity className="w-5 h-5 text-emerald-600" />
                ກວດສອບການເຊື່ອມຕໍ່ລະບົບ
              </h3>
              <p className="text-sm text-slate-500 mb-6">
                ຖ້າທ່ານພົບຂໍ້ຜິດພາດ "Timed out", ໃຫ້ໃຊ້ປຸ່ມນີ້ເພື່ອທົດສອບວ່າ Internet ຂອງທ່ານສາມາດລົມກັບຖານຂໍ້ມູນໄດ້ຫຼືບໍ່.
              </p>
              
              <div className="space-y-4">
                <button 
                  onClick={checkConnection}
                  disabled={diagStatus === 'loading'}
                  className="px-6 py-3 bg-slate-900 text-white rounded-2xl font-bold hover:bg-black transition-all flex items-center gap-2 disabled:opacity-50"
                >
                  {diagStatus === 'loading' ? <Loader2 className="w-5 h-5 animate-spin" /> : <Activity className="w-5 h-5" />}
                  ເລີ່ມການທົດສອບ
                </button>

                {diagStatus !== 'idle' && (
                  <div className={`p-4 rounded-2xl flex items-start gap-3 animate-fadeIn ${
                    diagStatus === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 
                    diagStatus === 'error' ? 'bg-red-50 text-red-700 border border-red-100' : 'bg-blue-50 text-blue-700 border border-blue-100'
                  }`}>
                    {diagStatus === 'success' ? <CheckCircle2 className="w-5 h-5 mt-0.5" /> : 
                     diagStatus === 'error' ? <XCircle className="w-5 h-5 mt-0.5" /> : <Loader2 className="w-5 h-5 mt-0.5 animate-spin" />}
                    <div>
                      <p className="font-bold text-sm">ຜົນການທົດສອບ:</p>
                      <p className="text-sm opacity-90">{diagMsg}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100">
               <p className="text-xs text-amber-700 leading-relaxed font-medium">
                 💡 **ຄຳແນະນຳ:** ຖ້າຜົນການທົດສອບຂຶ້ນວ່າ "ສຳເລັດ" ແຕ່ທ່ານຍັງເຂົ້າເວັບບໍ່ໄດ້, ອາດເປັນເພາະ DNS ຂອງ Domain ຍັງບໍ່ທັນສົມບູນ. ແຕ່ຖ້າຂຶ້ນວ່າ "ການເຊື່ອມຕໍ່ມີບັນຫາ", ອາດເກີດຈາກ Internet ທີ່ທ່ານກຳລັງໃຊ້ຢູ່ມີການບລັອກ ຫຼື ສັນຍານບໍ່ສະຖຽນ.
               </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Admin;

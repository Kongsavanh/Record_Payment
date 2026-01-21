
import React, { useState } from 'react';
import { 
  AppState, 
  User, 
  UserRole, 
  Store, 
  ShiftType 
  // Fix: Remove TRANSLATIONS as T from types import
} from '../types';
import { TRANSLATIONS } from '../constants';
import { Users, Store as StoreIcon, Clock, Plus, Trash2, Shield } from 'lucide-react';

interface AdminProps {
  state: AppState;
  onAddUser: (user: User) => void;
  onRemoveUser: (id: string) => void;
  onAddStore: (store: Store) => void;
  onRemoveStore: (id: string) => void;
  onAddShift: (shift: ShiftType) => void;
  onRemoveShift: (id: string) => void;
}

const Admin: React.FC<AdminProps> = ({ 
  state, 
  onAddUser, 
  onRemoveUser, 
  onAddStore, 
  onRemoveStore, 
  onAddShift, 
  onRemoveShift 
}) => {
  const [activeTab, setActiveTab] = useState<'users' | 'stores' | 'shifts'>('users');
  
  // Input states
  const [newUserName, setNewUserName] = useState('');
  const [newUserUsername, setNewUserUsername] = useState('');
  const [newUserPass, setNewUserPass] = useState('');
  const [newUserRole, setNewUserRole] = useState<UserRole>(UserRole.STAFF);

  const [newStoreName, setNewStoreName] = useState('');
  const [newShiftName, setNewShiftName] = useState('');

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
      <div className="flex border-b border-slate-200 gap-6">
        <button 
          onClick={() => setActiveTab('users')}
          className={`pb-3 text-sm font-bold transition-colors relative ${activeTab === 'users' ? 'text-emerald-600' : 'text-slate-400 hover:text-slate-600'}`}
        >
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            <span>ຈັດການພະນັກງານ</span>
          </div>
          {activeTab === 'users' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-600" />}
        </button>
        <button 
          onClick={() => setActiveTab('stores')}
          className={`pb-3 text-sm font-bold transition-colors relative ${activeTab === 'stores' ? 'text-emerald-600' : 'text-slate-400 hover:text-slate-600'}`}
        >
          <div className="flex items-center gap-2">
            <StoreIcon className="w-4 h-4" />
            <span>ຮ້ານຄ້າ</span>
          </div>
          {activeTab === 'stores' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-600" />}
        </button>
        <button 
          onClick={() => setActiveTab('shifts')}
          className={`pb-3 text-sm font-bold transition-colors relative ${activeTab === 'shifts' ? 'text-emerald-600' : 'text-slate-400 hover:text-slate-600'}`}
        >
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            <span>ປະເພດກະ</span>
          </div>
          {activeTab === 'shifts' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-600" />}
        </button>
      </div>

      {/* Content */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
        {activeTab === 'users' && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end bg-slate-50 p-4 rounded-xl border border-slate-200">
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase block mb-1">ຊື່-ນາມສະກຸນ</label>
                <input 
                  type="text" 
                  value={newUserName}
                  onChange={(e) => setNewUserName(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg text-sm outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="ນາງ ສົມໃຈ"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase block mb-1">ຊື່ຜູ້ໃຊ້</label>
                <input 
                  type="text" 
                  value={newUserUsername}
                  onChange={(e) => setNewUserUsername(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg text-sm outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="somjai_123"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase block mb-1">ລະຫັດຜ່ານ</label>
                <input 
                  type="text" 
                  value={newUserPass}
                  onChange={(e) => setNewUserPass(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg text-sm outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="••••••"
                />
              </div>
              <button 
                onClick={handleAddUser}
                className="flex items-center justify-center gap-2 px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors h-[38px]"
              >
                <Plus className="w-4 h-4" />
                <span>{TRANSLATIONS.add}</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {state.users.map(user => (
                <div key={user.id} className="p-4 border border-slate-100 rounded-xl flex items-center justify-between hover:border-emerald-200 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-full ${user.role === UserRole.ADMIN ? 'bg-amber-100 text-amber-600' : 'bg-slate-100 text-slate-600'}`}>
                      {user.role === UserRole.ADMIN ? <Shield className="w-5 h-5" /> : <Users className="w-5 h-5" />}
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-800">{user.name}</h4>
                      <p className="text-xs text-slate-400">@{user.username}</p>
                    </div>
                  </div>
                  {user.id !== state.currentUser?.id && (
                    <button 
                      onClick={() => onRemoveUser(user.id)}
                      className="p-2 text-slate-300 hover:text-red-500 transition-colors"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'stores' && (
          <div className="space-y-6">
            <div className="flex gap-4 items-end bg-slate-50 p-4 rounded-xl border border-slate-200">
              <div className="flex-1">
                <label className="text-xs font-bold text-slate-500 uppercase block mb-1">ຊື່ຮ້ານຄ້າໃໝ່</label>
                <input 
                  type="text" 
                  value={newStoreName}
                  onChange={(e) => setNewStoreName(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg text-sm outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="ຊື່ຮ້ານ..."
                />
              </div>
              <button 
                onClick={handleAddStore}
                className="flex items-center justify-center gap-2 px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors h-[38px]"
              >
                <Plus className="w-4 h-4" />
                <span>{TRANSLATIONS.add}</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {state.stores.map(store => (
                <div key={store.id} className="p-4 border border-slate-100 rounded-xl flex items-center justify-between hover:border-emerald-200 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-slate-100 rounded-lg text-slate-600">
                      <StoreIcon className="w-5 h-5" />
                    </div>
                    <span className="font-bold text-slate-800">{store.name}</span>
                  </div>
                  <button 
                    onClick={() => onRemoveStore(store.id)}
                    className="p-2 text-slate-300 hover:text-red-500 transition-colors"
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
            <div className="flex gap-4 items-end bg-slate-50 p-4 rounded-xl border border-slate-200">
              <div className="flex-1">
                <label className="text-xs font-bold text-slate-500 uppercase block mb-1">ຊື່ປະເພດກະໃໝ່</label>
                <input 
                  type="text" 
                  value={newShiftName}
                  onChange={(e) => setNewShiftName(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg text-sm outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="ຕົວຢ່າງ: ກະບ່າຍ..."
                />
              </div>
              <button 
                onClick={handleAddShift}
                className="flex items-center justify-center gap-2 px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors h-[38px]"
              >
                <Plus className="w-4 h-4" />
                <span>{TRANSLATIONS.add}</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {state.shiftTypes.map(shift => (
                <div key={shift.id} className="p-4 border border-slate-100 rounded-xl flex items-center justify-between hover:border-emerald-200 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-slate-100 rounded-lg text-slate-600">
                      <Clock className="w-5 h-5" />
                    </div>
                    <span className="font-bold text-slate-800">{shift.name}</span>
                  </div>
                  <button 
                    onClick={() => onRemoveShift(shift.id)}
                    className="p-2 text-slate-300 hover:text-red-500 transition-colors"
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

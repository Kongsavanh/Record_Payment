
import React, { useState } from 'react';
// Fix: Remove TRANSLATIONS from types import
import { User } from '../types';
import { TRANSLATIONS as T } from '../constants';
import { UserCircle, Shield, Key, Save, CheckCircle2 } from 'lucide-react';

interface ProfileProps {
  user: User;
  onUpdate: (user: User) => void;
}

const Profile: React.FC<ProfileProps> = ({ user, onUpdate }) => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleUpdatePassword = () => {
    if (!newPassword || newPassword !== confirmPassword) {
      setError('ລະຫັດຜ່ານບໍ່ກົງກັນ ຫຼື ຫວ່າງເປົ່າ');
      return;
    }

    onUpdate({ ...user, password: newPassword });
    setNewPassword('');
    setConfirmPassword('');
    setSuccess(true);
    setError('');
    setTimeout(() => setSuccess(false), 3000);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fadeIn">
      {/* Profile Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="bg-emerald-600 h-24"></div>
        <div className="px-8 pb-8">
          <div className="relative -mt-12 flex justify-center">
            <div className="bg-white p-2 rounded-full shadow-lg">
              <div className="bg-slate-100 w-24 h-24 rounded-full flex items-center justify-center text-slate-400">
                <UserCircle className="w-16 h-16" />
              </div>
            </div>
          </div>
          
          <div className="text-center mt-4">
            <h2 className="text-2xl font-bold text-slate-800">{user.name}</h2>
            <div className="flex items-center justify-center gap-2 text-slate-500 mt-1">
              <Shield className="w-4 h-4" />
              <span className="text-sm font-medium uppercase tracking-wider">{user.role}</span>
            </div>
          </div>

          <div className="mt-8 pt-8 border-t border-slate-100 space-y-6">
            <div className="flex items-center gap-3 mb-2">
              <Key className="w-5 h-5 text-emerald-600" />
              <h3 className="font-bold text-slate-800">{T.changePassword}</h3>
            </div>

            {success && (
              <div className="bg-emerald-50 text-emerald-600 p-3 rounded-lg flex items-center gap-2 mb-4 border border-emerald-100">
                <CheckCircle2 className="w-5 h-5" />
                <span className="text-sm font-medium">ປ່ຽນລະຫັດຜ່ານສຳເລັດແລ້ວ</span>
              </div>
            )}

            {error && (
              <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-4 border border-red-100">
                {error}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase block mb-1">ລະຫັດຜ່ານໃໝ່</label>
                <input 
                  type="password" 
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                  placeholder="••••••••"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase block mb-1">ຢືນຢັນລະຫັດຜ່ານໃໝ່</label>
                <input 
                  type="password" 
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                  placeholder="••••••••"
                />
              </div>
              <button 
                onClick={handleUpdatePassword}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-xl font-bold shadow-lg shadow-emerald-50 hover:bg-emerald-700 transition-all"
              >
                <Save className="w-5 h-5" />
                <span>{T.save}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <div className="text-center text-xs text-slate-400">
        ຂໍ້ມູນຂອງທ່ານຈະຖືກເກັບຮັກສາເປັນຄວາມລັບພາຍໃນລະບົບເທົ່ານັ້ນ
      </div>
    </div>
  );
};

export default Profile;

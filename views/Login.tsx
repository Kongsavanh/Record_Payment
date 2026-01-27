
import React, { useState } from 'react';
import { User } from '../types';
import { Lock, User as UserIcon, AlertCircle, Eye, EyeOff } from 'lucide-react';

interface LoginProps {
  users: User[];
  onLogin: (user: User) => void;
}

const Login: React.FC<LoginProps> = ({ users, onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Normalize both input and stored username to lowercase for case-insensitive comparison
    const user = users.find(u => 
      u.username.toLowerCase() === username.trim().toLowerCase() && 
      u.password === password
    );
    
    if (user) {
      onLogin(user);
    } else {
      setError('ຊື່ຜູ້ໃຊ້ ຫຼື ລະຫັດຜ່ານບໍ່ຖືກຕ້ອງ');
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center p-4 pb-20 sm:pb-4">
      <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-md p-6 sm:p-8 animate-fadeIn">
        <div className="text-center mb-8 sm:mb-10">
          <div className="bg-emerald-100 w-20 h-20 sm:w-24 sm:h-24 rounded-3xl rotate-12 flex items-center justify-center mx-auto mb-6 shadow-inner transform hover:rotate-0 transition-transform duration-500">
            <div className="-rotate-12 group-hover:rotate-0 transition-transform">
              <Lock className="w-10 h-10 sm:w-12 sm:h-12 text-emerald-600" />
            </div>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-800 tracking-tight">ລະບົບບັນທຶກການເງິນ</h1>
          <p className="text-slate-400 mt-2 font-medium text-sm sm:text-base">ກະລຸນາເຂົ້າສູ່ລະບົບເພື່ອເລີ່ມຕົ້ນ</p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-2xl flex items-center gap-3 mb-8 border border-red-100 animate-fadeIn">
            <div className="bg-red-100 p-1.5 rounded-lg">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
            </div>
            <span className="text-sm font-bold">{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5 sm:space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">ຊື່ຜູ້ໃຊ້</label>
            <div className="relative group">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-emerald-500 transition-colors">
                <UserIcon className="w-5 h-5" />
              </div>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="w-full pl-12 pr-4 py-3.5 sm:py-4 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all hover:border-emerald-300 bg-slate-50 focus:bg-white font-medium text-base"
                placeholder="ປ້ອນຊື່ຜູ້ໃຊ້..."
                autoComplete="username"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">ລະຫັດຜ່ານ</label>
            <div className="relative group">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-emerald-500 transition-colors">
                <Lock className="w-5 h-5" />
              </div>
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full pl-12 pr-14 py-3.5 sm:py-4 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all hover:border-emerald-300 bg-slate-50 focus:bg-white font-medium text-base"
                placeholder="••••••••"
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={togglePasswordVisibility}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-2 text-slate-300 hover:text-emerald-500 transition-colors focus:outline-none rounded-lg hover:bg-emerald-50"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black py-3.5 sm:py-4 rounded-2xl shadow-xl shadow-emerald-200 transition-all transform active:scale-[0.98] hover:-translate-y-0.5 mt-2"
          >
            ເຂົ້າສູ່ລະບົບ
          </button>
        </form>

        <div className="mt-8 sm:mt-12 text-center">
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em]">
            &copy; {new Date().getFullYear()} ລະບົບຈັດການການເງິນພາຍໃນ
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { X, Lock, Eye, EyeOff, ShieldCheck } from 'lucide-react';

interface AdminLoginModalProps {
  onClose: () => void;
  onLoginSuccess: () => void;
  lang: 'en' | 'bn';
}

export const AdminLoginModal: React.FC<AdminLoginModalProps> = ({
  onClose,
  onLoginSuccess,
  lang
}) => {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === '1234' || password === 'admin') {
      onLoginSuccess();
    } else {
      setError(
        lang === 'en' 
          ? 'Incorrect Password! Use default: 1234' 
          : 'ভুল পাসওয়ার্ড! সঠিক পাসওয়ার্ড দিন (ডিফল্ট: 1234)'
      );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs select-none">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className="w-full max-w-sm rounded-3xl bg-white shadow-2xl border border-slate-100 p-6 dark:bg-slate-900 dark:border-slate-800 space-y-5"
      >
        {/* Header */}
        <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2 text-slate-900 dark:text-white font-extrabold text-sm uppercase tracking-wider">
            <Lock className="h-4 w-4 text-emerald-500" />
            <span>{lang === 'en' ? 'Admin Login' : 'এডমিন লগইন'}</span>
          </div>
          <button 
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-white cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Info */}
        <div className="text-center space-y-1.5 py-1">
          <div className="h-12 w-12 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center mx-auto">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <h3 className="text-sm font-extrabold text-slate-950 dark:text-white">
            {lang === 'en' ? 'Enter Merchant Code' : 'মার্চেন্ট পাসকোড লিখুন'}
          </h3>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">
            {lang === 'en' ? 'Default Access Pin is 1234' : 'ডিফল্ট অ্যাক্সেস পিন হল 1234'}
          </p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[10px] font-black uppercase text-slate-400 mb-1 tracking-wider">
              {lang === 'en' ? 'Admin Password' : 'এডমিন পাসওয়ার্ড'}
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError(null);
                }}
                placeholder="••••"
                className="w-full rounded-xl border border-slate-150 bg-slate-50 pl-3.5 pr-10 py-2.5 text-sm text-slate-900 outline-hidden focus:border-emerald-500 focus:bg-white dark:border-slate-800 dark:bg-slate-950 dark:text-white font-bold tracking-widest text-center"
                autoFocus
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-white cursor-pointer"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {error && (
            <p className="text-[10px] font-black text-rose-500 text-center uppercase tracking-wide bg-rose-50 dark:bg-rose-950/20 py-1.5 rounded-lg border border-rose-100 dark:border-rose-950/40">
              ⚠️ {error}
            </p>
          )}

          <div className="flex items-center gap-2.5 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-xl border border-slate-150 py-2.5 text-xs font-black text-slate-500 hover:bg-slate-50 dark:border-slate-800 dark:text-slate-400 dark:hover:bg-slate-950 transition-all cursor-pointer"
            >
              {lang === 'en' ? 'Cancel' : 'বাতিল'}
            </button>
            <button
              type="submit"
              className="flex-1 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black py-2.5 transition-all shadow-md active:scale-98 cursor-pointer"
            >
              {lang === 'en' ? 'Login' : 'লগইন'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

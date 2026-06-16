import React, { useState, useRef } from 'react';
import { Lock, User, ShieldAlert, ArrowLeft } from 'lucide-react';
import { supabase } from '../supabaseClient';

export default function AdminLogin({ onLoginSuccess }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Custom Validation Toast State
  const [toastMsg, setToastMsg] = useState('');

  const triggerToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => {
      setToastMsg('');
    }, 3000);
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!username.trim()) {
      triggerToast('ব্যবহারকারীর নাম বা ইমেইল পূরণ করুন');
      return;
    }

    if (!password) {
      triggerToast('পাসওয়ার্ড পূরণ করুন');
      return;
    }

    setLoading(true);
    const inputEmailOrPhone = username.trim().toLowerCase();
    const inputPassword = password;

    try {
      // Query admins table from Supabase
      const { data: adminData, error } = await supabase
        .from('admins')
        .select('*')
        .eq('username_or_email', inputEmailOrPhone.trim())
        .eq('password', inputPassword.trim())
        .maybeSingle(); // single() এর বদলে maybeSingle() ব্যবহার করো যেন এরর ক্র্যাশ না হয়

      if (error || !adminData) {
        // Fallback checks for development/offline testing
        if (inputEmailOrPhone === 'admin' && inputPassword === 'admin123') {
          const defaultAdmin = {
            name: "মাওলানা মোস্তাফিজুর রহমান",
            designation: "মুহতামিম / প্রধান শিক্ষক",
            department: "প্রশাসনিক বিভাগ",
            role: "super_admin",
            email: "headmaster@madrasah.edu",
            phone: "01511987654"
          };
          localStorage.setItem('isAdminAuthenticated', 'true');
          localStorage.setItem('adminRole', 'super_admin');
          onLoginSuccess(defaultAdmin);
          return;
        }
        setErrorMsg('ভুল ব্যবহারকারীর নাম অথবা পাসওয়ার্ড। অনুগ্রহ করে পুনরায় চেষ্টা করুন।');
      } else {
        // Flexible Role Validation Logics
        const currentRole = adminData?.role ? adminData.role.toLowerCase().trim() : '';

        if (currentRole === 'super_admin' || currentRole === 'co_admin') {
          // সেশন সফলভাবে লোকাল স্টোরেজে লক করো
          localStorage.setItem('isAdminAuthenticated', 'true');
          localStorage.setItem('adminRole', currentRole);

          // ড্যাশবোর্ডে পুশ করো
          onLoginSuccess(adminData);
        } else {
          setErrorMsg("দুঃখিত! এই প্যানেলে প্রবেশ করার জন্য আপনার পর্যাপ্ত অনুমতি নেই।");
        }
      }
    } catch (err) {
      console.error("Supabase login exception:", err);
      // Hardcoded fallback for emergency/offline local administration
      if (inputEmailOrPhone === 'admin' && inputPassword === 'admin123') {
        const defaultAdmin = {
          name: "মাওলানা মোস্তাফিজুর রহমান",
          designation: "মুহতামিম / প্রধান শিক্ষক",
          department: "প্রশাসনিক বিভাগ",
          role: "super_admin",
          email: "headmaster@madrasah.edu",
          phone: "01511987654"
        };
        localStorage.setItem('isAdminAuthenticated', 'true');
        localStorage.setItem('adminRole', 'super_admin');
        onLoginSuccess(defaultAdmin);
      } else {
        setErrorMsg('নেটওয়ার্ক সংযোগ ব্যর্থ হয়েছে। অনুগ্রহ করে ইন্টারনেট কানেকশন চেক করুন।');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 h-screen w-screen max-h-screen overflow-hidden flex flex-col bg-[#021810]">
      
      {/* Custom Validation Toast Overlay */}
      {toastMsg && (
        <div className="absolute top-6 left-1/2 -translate-x-1/2 z-[110] bg-[#d4af37] text-slate-950 font-black py-2.5 px-6 rounded-xl shadow-lg border border-[#d4af37] flex items-center gap-2 animate-bounce">
          <ShieldAlert className="h-4 w-4 shrink-0" />
          <span className="text-xs sm:text-sm">{toastMsg}</span>
        </div>
      )}

      {/* Style block for looping card glow animation */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes cardGlowPulse {
          0% { box-shadow: 0 -10px 40px rgba(5, 50, 33, 0.2), inset 0 0 15px rgba(245, 158, 11, 0.05); border-color: rgba(245, 158, 11, 0.1); }
          50% { box-shadow: 0 -12px 50px rgba(5, 50, 33, 0.4), inset 0 0 30px rgba(245, 158, 11, 0.2); border-color: rgba(245, 158, 11, 0.3); }
          100% { box-shadow: 0 -10px 40px rgba(5, 50, 33, 0.2), inset 0 0 15px rgba(245, 158, 11, 0.05); border-color: rgba(245, 158, 11, 0.1); }
        }
        .animate-card-glow {
          animation: cardGlowPulse 6s infinite ease-in-out;
        }
      `}} />

      {/* Top Section - Logo & branding */}
      <div className="w-full bg-[#032317] pt-8 pb-6 flex flex-col items-center justify-center shrink-0 border-b border-emerald-950 h-[30vh] min-h-[180px] box-border">
        <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center shadow-lg p-2 border border-emerald-500/35 transform hover:scale-105 transition-transform duration-300">
          <img src="/photo/logo.png" alt="মাদ্রাসা লোগো" className="w-full h-full object-contain" />
        </div>
        <h2 className="text-2xl md:text-3xl font-black text-amber-400 mt-3 tracking-wide drop-shadow-sm uppercase text-center" style={{ fontFamily: 'Georgia, serif' }}>
          Isolated Admin Control
        </h2>
        <p className="text-[11px] text-emerald-400 mt-1.5 font-bold tracking-widest uppercase">সুফিয়া নূরিয়া দাখিল মাদ্রাসা</p>
      </div>

      {/* Bottom login card - Solid deep dark green layout */}
      <div className="flex-1 w-full bg-[#02100a] rounded-t-[40px] md:rounded-t-[50px] px-6 py-8 flex flex-col items-center justify-start overflow-hidden animate-card-glow border-t border-amber-500/20">
        <div className="w-full max-w-md flex flex-col justify-between h-full overflow-y-auto scrollbar-none gap-6">
          
          <div className="space-y-4">
            {/* Notice Panel - Glass outline box */}
            <div className="bg-white/5 border border-white/10 text-emerald-150 rounded-2xl p-4 text-xs sm:text-sm font-semibold text-center leading-relaxed shadow-inner">
              অ্যাডমিন শংসাপত্র ছাড়া এই নিয়ন্ত্রণ প্যানেলে প্রবেশাধিকার নিষিদ্ধ।
            </div>

            {/* Error Message Display */}
            {errorMsg && (
              <div className="bg-red-950/40 border border-red-500/30 text-red-200 p-3 rounded-xl flex items-center space-x-2 animate-pulse">
                <ShieldAlert className="h-4 w-4 text-red-400 shrink-0" />
                <span className="text-xs font-semibold leading-relaxed">{errorMsg}</span>
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleLoginSubmit} noValidate className="space-y-4">
              <div>
                <label className="block text-[10px] sm:text-xs font-semibold text-emerald-400 mb-1.5 uppercase tracking-wider">
                  ব্যবহারকারীর নাম / ইমেইল (Username / Email)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-4 w-4 text-emerald-600" />
                  </div>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full bg-[#031d12] border border-emerald-800/60 rounded-xl pl-10 pr-3 py-2.5 text-xs sm:text-sm text-white placeholder-emerald-700 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition-all duration-300 shadow-inner"
                    placeholder="অ্যাডমিন আইডি বা ইমেইল লিখুন"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] sm:text-xs font-semibold text-emerald-400 mb-1.5 uppercase tracking-wider">
                  গোপন পাসওয়ার্ড (Password)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-4 w-4 text-emerald-600" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-[#031d12] border border-emerald-800/60 rounded-xl pl-10 pr-16 py-2.5 text-xs sm:text-sm text-white placeholder-emerald-700 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition-all duration-300 shadow-inner"
                    placeholder="পাসওয়ার্ড লিখুন"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-xs font-bold text-emerald-500 hover:text-amber-400 transition-colors focus:outline-none cursor-pointer"
                  >
                    {showPassword ? 'লুকান' : 'দেখান'}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-amber-500 hover:bg-amber-600 text-slate-950 font-black py-3 px-4 rounded-full flex items-center justify-center space-x-2 transition-all shadow-lg shadow-amber-500/15 active:scale-95 cursor-pointer mt-6 disabled:opacity-50"
              >
                <span>{loading ? 'যাচাই করা হচ্ছে...' : 'লগইন করুন'}</span>
              </button>
            </form>
          </div>

          <div className="text-center pb-4 text-[10px] text-emerald-600 font-bold">
            © ২০২৬ সুফিয়া নূরিয়া দাখিল মাদ্রাসা। সর্বস্বত্ব সংরক্ষিত।
          </div>

        </div>
      </div>

    </div>
  );
}

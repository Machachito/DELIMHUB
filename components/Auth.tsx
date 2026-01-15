
import React, { useState } from 'react';
import { useApp } from '../App';
import { UserRole, User } from '../types';

const Auth: React.FC = () => {
  const { setUser, teamMembers, setTeamMembers } = useApp();
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({ 
    firstName: '', 
    lastName: '', 
    email: '', 
    password: '', 
    company: '',
    isAdminSignup: false 
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isLogin) {
      const existingUser = teamMembers.find(m => m.email.toLowerCase() === formData.email.toLowerCase());
      if (existingUser) {
        if (existingUser.password === formData.password) {
           setUser(existingUser);
        } else {
          alert("Incorrect access key for this command address.");
        }
      } else {
        alert("Credentials not recognized in our database. Try signing up!");
      }
    } else {
      // Create a unique company ID for the new Admin or default for Member
      const newCompanyId = formData.isAdminSignup 
        ? `org-${Math.random().toString(36).substr(2, 6)}` 
        : 'org-root';

      const newUser: User = {
        id: `u-${Math.random().toString(36).substr(2, 9)}`,
        name: `${formData.firstName} ${formData.lastName}`,
        email: formData.email,
        password: formData.password,
        role: formData.isAdminSignup ? UserRole.ADMIN : UserRole.MEMBER,
        companyId: newCompanyId,
        position: formData.isAdminSignup ? 'System Overseer' : 'Ecosystem Member',
      };
      
      setTeamMembers(prev => [...prev, newUser]);
      setUser(newUser);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 p-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20" />
      <div className="absolute top-0 left-0 w-full h-full opacity-30 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-600 rounded-full blur-[150px]" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-600 rounded-full blur-[150px]" />
      </div>

      <div className="w-full max-w-md relative z-10">
        <div className="bg-white rounded-[60px] shadow-2xl p-12 space-y-10 border border-white/20">
          <div className="text-center">
            <div className="w-20 h-20 bg-indigo-600 rounded-[32px] flex items-center justify-center font-black text-4xl text-white mx-auto mb-6 shadow-2xl shadow-indigo-900/40 italic">D</div>
            <h1 className="text-4xl font-black text-slate-900 italic tracking-tighter uppercase">DELIMHUB</h1>
            <p className="text-slate-400 font-bold uppercase tracking-widest mt-2 text-[10px]">High-Intensity Operations</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5 text-left">
            {!isLogin && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">First Name</label>
                    <input type="text" className="w-full px-6 py-4 rounded-3xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-4 focus:ring-indigo-100 font-bold" value={formData.firstName} onChange={e => setFormData({...formData, firstName: e.target.value})} required placeholder="John" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Second Name</label>
                    <input type="text" className="w-full px-6 py-4 rounded-3xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-4 focus:ring-indigo-100 font-bold" value={formData.lastName} onChange={e => setFormData({...formData, lastName: e.target.value})} required placeholder="Doe" />
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Company Domain</label>
                  <input type="text" className="w-full px-6 py-4 rounded-3xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-4 focus:ring-indigo-100 font-bold" value={formData.company} onChange={e => setFormData({...formData, company: e.target.value})} required placeholder="Acme Corp" />
                </div>
              </>
            )}
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">EMAIL</label>
              <input type="email" className="w-full px-6 py-4 rounded-3xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-4 focus:ring-indigo-100 font-bold" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} required placeholder="user@domain.com" />
            </div>
            <div className="relative">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">PASSWORD</label>
              <input 
                type={showPassword ? "text" : "password"} 
                className="w-full px-6 py-4 rounded-3xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-4 focus:ring-indigo-100 font-bold pr-14" 
                value={formData.password} 
                onChange={e => setFormData({...formData, password: e.target.value})} 
                required 
                placeholder="••••••••" 
              />
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-5 bottom-4 text-slate-400 hover:text-indigo-600 transition-colors"
              >
                {showPassword ? (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" /></svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                )}
              </button>
            </div>
            
            {!isLogin && (
              <div className="flex items-center space-x-3 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <input type="checkbox" id="isAdmin" className="w-5 h-5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500" checked={formData.isAdminSignup} onChange={e => setFormData({...formData, isAdminSignup: e.target.checked})} />
                <label htmlFor="isAdmin" className="text-xs font-bold text-slate-700 uppercase tracking-wide cursor-pointer">Admin Clearance</label>
              </div>
            )}
            
            <button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-black italic uppercase tracking-widest py-5 rounded-[32px] shadow-2xl shadow-indigo-200 transition-all active:scale-[0.98] text-sm">
              {isLogin ? 'LOGIN' : 'CREATE ACCOUNT'}
            </button>
          </form>

          <div className="text-center pt-2 border-t border-slate-50">
            <button onClick={() => setIsLogin(!isLogin)} className="text-xs font-black text-slate-400 hover:text-indigo-600 uppercase tracking-widest transition-colors">
              {isLogin ? "JOIN DELIMHUB (SIGN UP)" : "Back to Port (LOGIN)"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;

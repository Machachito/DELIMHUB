
import React, { useState } from 'react';
import { useApp } from '../App';

const Profile: React.FC = () => {
  const { user, setUser } = useApp();
  const [name, setName] = useState(user?.name || '');
  const [position, setPosition] = useState(user?.position || '');
  const [avatar, setAvatar] = useState(user?.avatar || '');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSaved, setIsSaved] = useState(false);

  const handleSave = () => {
    if (!user) return;
    if (password && password !== confirmPassword) {
      alert("Passwords do not match!");
      return;
    }
    setUser({ ...user, name, position, avatar });
    setIsSaved(true);
    setPassword('');
    setConfirmPassword('');
    setTimeout(() => setIsSaved(false), 3000);
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatar(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-10 animate-in fade-in duration-500">
      <div className="text-center">
        <h1 className="text-4xl font-bold tracking-tight text-slate-800">My Profile</h1>
        <p className="text-slate-500 font-medium tracking-tight">Change your personal details and photo here</p>
      </div>

      <div className="bg-white rounded-3xl shadow-xl p-12 border border-slate-100 relative overflow-hidden">
        <div className="flex flex-col items-center space-y-8">
           <div className="relative group">
              {avatar ? (
                <img src={avatar} className="w-40 h-40 rounded-full object-cover shadow-2xl border-4 border-white transition-transform group-hover:scale-105" />
              ) : (
                <div className="w-40 h-40 bg-indigo-600 rounded-full flex items-center justify-center text-6xl font-bold text-white shadow-2xl border-4 border-white">
                  {name.charAt(0)}
                </div>
              )}
              <label className="absolute bottom-2 right-2 bg-slate-800 text-white p-3 rounded-2xl cursor-pointer hover:bg-indigo-600 transition-all shadow-xl">
                 <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"/><path d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                 <input type="file" className="hidden" onChange={handleAvatarChange} accept="image/*" />
              </label>
           </div>

           <div className="w-full space-y-6 text-left">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-slate-500 mb-2">Full Name</label>
                  <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full px-6 py-3 rounded-2xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-100 font-bold text-slate-800" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-500 mb-2">Job Title</label>
                  <input type="text" value={position} onChange={(e) => setPosition(e.target.value)} className="w-full px-6 py-3 rounded-2xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-100 font-bold text-slate-600" />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-bold text-slate-500 mb-2">Email Address</label>
                <input type="text" disabled value={user?.email} className="w-full px-8 py-4 rounded-3xl bg-slate-100 border border-slate-100 font-bold text-slate-400 cursor-not-allowed" />
              </div>

              <div className="border-t border-slate-100 pt-6 mt-6">
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">Change Password</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-slate-500 mb-2">New Password</label>
                    <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full px-6 py-3 rounded-2xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-100 font-bold" placeholder="••••••••" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-500 mb-2">Confirm New Password</label>
                    <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="w-full px-6 py-3 rounded-2xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-100 font-bold" placeholder="••••••••" />
                  </div>
                </div>
              </div>

              <div className="pt-6">
                 <button onClick={handleSave} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-5 rounded-3xl font-bold uppercase tracking-widest shadow-xl transition-all active:scale-95">Save Changes</button>
                 {isSaved && <p className="text-center mt-4 text-emerald-500 font-bold text-xs">Profile saved successfully!</p>}
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;

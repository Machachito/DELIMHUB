
import React, { useState } from 'react';
import { useApp } from '../App';
import { UserRole, User, TaskStatus } from '../types';
import { Icons } from '../constants';

const Team: React.FC = () => {
  const { teamMembers, tasks, projects, user, setTeamMembers, globalSearch, impersonateUser } = useApp();
  const [isAdding, setIsAdding] = useState(false);
  const [editingMember, setEditingMember] = useState<User | null>(null);
  const [newMember, setNewMember] = useState({ name: '', position: '', email: '', password: '', role: UserRole.MEMBER });
  const [showPass, setShowPass] = useState(false);

  const isAdmin = user?.role === UserRole.ADMIN;

  const handleAddMember = () => {
    if (!newMember.name || !newMember.position || !newMember.email || !newMember.password) {
      alert("Please fill in all details.");
      return;
    }
    const member: User = {
      id: Math.random().toString(36).substr(2, 9),
      name: newMember.name,
      email: newMember.email,
      password: newMember.password,
      role: newMember.role,
      companyId: user?.companyId || 'c1',
      position: newMember.position,
      isOnline: false
    };
    setTeamMembers(prev => [...prev, member]);
    setNewMember({ name: '', position: '', email: '', password: '', role: UserRole.MEMBER });
    setIsAdding(false);
  };

  const handleUpdateMember = () => {
    if (!editingMember) return;
    setTeamMembers(prev => prev.map(m => m.id === editingMember.id ? editingMember : m));
    setEditingMember(null);
  };

  const handleDeleteMember = (memberId: string) => {
    if (memberId === user?.id) {
      alert("You cannot terminate your own clearance.");
      return;
    }
    if (window.confirm("Are you sure you want to terminate this operator's clearance? This cannot be undone.")) {
      setTeamMembers(prev => prev.filter(m => m.id !== memberId));
    }
  };

  const filteredTeam = teamMembers.filter(m => 
    m.companyId === user?.companyId && (
      m.name.toLowerCase().includes(globalSearch.toLowerCase()) ||
      m.position.toLowerCase().includes(globalSearch.toLowerCase())
    )
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div className="text-left">
          <h1 className="text-3xl font-bold text-slate-800 italic uppercase tracking-tighter">Team Roster</h1>
          <p className="text-slate-500 font-medium">Managing {filteredTeam.length} active operators in this ecosystem.</p>
        </div>
        {isAdmin && (
          <button onClick={() => setIsAdding(true)} className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-2xl flex items-center space-x-2 transition-all shadow-xl font-bold">
            <Icons.Plus className="w-5 h-5" />
            <span>Add Member</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredTeam.map(member => {
          const memberTasks = tasks.filter(t => t.assignedTo.includes(member.id));
          const activeCount = memberTasks.filter(t => t.status !== TaskStatus.DONE).length;
          const projCount = projects.filter(p => tasks.some(t => t.projectId === p.id && t.assignedTo.includes(member.id))).length;

          return (
            <div key={member.id} className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 hover:shadow-xl transition-all relative overflow-hidden text-left group">
              {isAdmin && (
                <div className="absolute top-4 right-4 flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                   <button 
                     onClick={() => impersonateUser(member)}
                     className="p-2 bg-amber-50 text-amber-600 rounded-xl hover:bg-amber-600 hover:text-white transition-all shadow-sm"
                     title="Login as this user"
                   >
                     <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                       <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />
                     </svg>
                   </button>
                   <button 
                     onClick={() => setEditingMember(member)}
                     className="p-2 bg-indigo-50 text-indigo-600 rounded-xl hover:bg-indigo-600 hover:text-white transition-all shadow-sm"
                     title="Edit Clearance"
                   >
                     <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                   </button>
                   <button 
                     onClick={() => handleDeleteMember(member.id)}
                     className="p-2 bg-red-50 text-red-600 rounded-xl hover:bg-red-600 hover:text-white transition-all shadow-sm"
                     title="Terminate Access"
                   >
                     <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                   </button>
                </div>
              )}

              <div className="flex items-center space-x-6 relative z-10">
                 <div className="w-20 h-20 bg-indigo-600 rounded-3xl flex items-center justify-center text-3xl font-bold text-white shadow-xl overflow-hidden shrink-0">
                   {member.avatar ? <img src={member.avatar} className="w-full h-full object-cover" /> : member.name.charAt(0)}
                 </div>
                 <div className="overflow-hidden">
                    <h3 className="text-xl font-bold text-slate-800 truncate">{member.name}</h3>
                    <p className="text-xs font-bold text-indigo-400 uppercase tracking-widest mt-1 truncate">{member.position}</p>
                    <span className={`text-[9px] font-black px-2 py-0.5 rounded-full border uppercase tracking-widest mt-2 inline-block ${member.role === UserRole.ADMIN ? 'bg-indigo-50 text-indigo-600 border-indigo-100' : 'bg-slate-50 text-slate-500 border-slate-100'}`}>
                      {member.role}
                    </span>
                 </div>
              </div>

              <div className="mt-10 grid grid-cols-2 gap-4">
                 <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 text-center">
                    <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Live Tasks</p>
                    <p className="text-2xl font-bold text-slate-800">{activeCount}</p>
                 </div>
                 <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 text-center">
                    <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Ecosystems</p>
                    <p className="text-2xl font-bold text-slate-800">{projCount}</p>
                 </div>
              </div>

              <div className="mt-6 flex justify-between items-center text-[10px] font-bold uppercase tracking-widest text-slate-400">
                 <span>Operational Status</span>
                 <div className="flex items-center space-x-1">
                    <div className={`w-2 h-2 rounded-full ${member.isOnline ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'}`} />
                    <span>{member.isOnline ? 'Online' : 'Offline'}</span>
                 </div>
              </div>
            </div>
          );
        })}
      </div>

      {(isAdding || editingMember) && (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-xl z-[60] flex items-center justify-center p-4">
          <div className="bg-white rounded-[48px] w-full max-w-lg p-12 animate-in zoom-in-95 duration-300 shadow-2xl">
            <h2 className="text-3xl font-black italic uppercase tracking-tighter mb-8 text-indigo-600">
              {editingMember ? 'Modify Clearance' : 'Invite Operator'}
            </h2>
            <div className="space-y-4 text-left">
              <div>
                <label className="block text-sm font-bold text-slate-400 uppercase mb-2">Full Identity</label>
                <input 
                  type="text" 
                  value={editingMember ? editingMember.name : newMember.name} 
                  onChange={(e) => editingMember ? setEditingMember({...editingMember, name: e.target.value}) : setNewMember({...newMember, name: e.target.value})} 
                  className="w-full px-6 py-3 rounded-2xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-4 focus:ring-indigo-100 font-bold" 
                  placeholder="John Doe" 
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-slate-400 uppercase mb-2">Mission Title</label>
                  <input 
                    type="text" 
                    value={editingMember ? editingMember.position : newMember.position} 
                    onChange={(e) => editingMember ? setEditingMember({...editingMember, position: e.target.value}) : setNewMember({...newMember, position: e.target.value})} 
                    className="w-full px-6 py-3 rounded-2xl bg-slate-50 border border-slate-200 font-bold" 
                    placeholder="Lead Dev" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-400 uppercase mb-2">Clearance Level</label>
                  <select 
                    value={editingMember ? editingMember.role : newMember.role} 
                    onChange={(e) => editingMember ? setEditingMember({...editingMember, role: e.target.value as UserRole}) : setNewMember({...newMember, role: e.target.value as UserRole})} 
                    className="w-full px-6 py-3 rounded-2xl bg-slate-50 border border-slate-200 font-bold text-sm"
                  >
                    <option value={UserRole.MEMBER}>Member</option>
                    <option value={UserRole.ADMIN}>Admin</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-400 uppercase mb-2">Email Address</label>
                <input 
                  type="email" 
                  value={editingMember ? editingMember.email : newMember.email} 
                  onChange={(e) => editingMember ? setEditingMember({...editingMember, email: e.target.value}) : setNewMember({...newMember, email: e.target.value})} 
                  className="w-full px-6 py-3 rounded-2xl bg-slate-50 border border-slate-200 font-bold" 
                  placeholder="user@domain.com" 
                />
              </div>
              <div className="relative">
                <label className="block text-sm font-bold text-slate-400 uppercase mb-2">Access Key (Password)</label>
                <input 
                  type={showPass ? "text" : "password"}
                  value={editingMember ? editingMember.password : newMember.password} 
                  onChange={(e) => editingMember ? setEditingMember({...editingMember, password: e.target.value}) : setNewMember({...newMember, password: e.target.value})} 
                  className="w-full px-6 py-3 rounded-2xl bg-slate-50 border border-slate-200 font-bold pr-14" 
                  placeholder="••••••••" 
                />
                <button 
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-5 bottom-3.5 text-slate-400"
                >
                  {showPass ? <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" /></svg> : <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>}
                </button>
              </div>

              <div className="flex space-x-4 pt-6">
                <button 
                  onClick={() => { setIsAdding(false); setEditingMember(null); }} 
                  className="flex-1 px-8 py-4 rounded-2xl font-bold uppercase text-xs text-slate-400 hover:text-slate-600 transition-colors"
                >
                  Abort
                </button>
                <button 
                  onClick={editingMember ? handleUpdateMember : handleAddMember} 
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-4 rounded-3xl font-black uppercase italic tracking-widest text-xs shadow-2xl transition-all"
                >
                  {editingMember ? 'Update Data' : 'Register'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Team;


import React from 'react';
import { useApp } from '../App';
import { TaskStatus, TaskPriority, UserRole } from '../types';
import { Icons } from '../constants';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const Dashboard: React.FC = () => {
  const { projects, tasks, user, teamMembers } = useApp();

  const myTasks = tasks.filter(t => t.assignedTo.includes(user?.id || ''));
  const isAdmin = user?.role === UserRole.ADMIN;

  const completedCount = tasks.filter(t => t.status === TaskStatus.DONE).length;
  const inProgressCount = tasks.filter(t => t.status === TaskStatus.IN_PROGRESS).length;
  const todoCount = tasks.filter(t => t.status === TaskStatus.TODO).length;

  const chartData = [
    { name: 'To Do', count: todoCount, color: '#94a3b8' },
    { name: 'Doing', count: inProgressCount, color: '#6366f1' },
    { name: 'Done', count: completedCount, color: '#22c55e' },
  ];

  const getTimeBasedGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const firstName = user?.name.split(' ')[0] || 'Member';

  if (isAdmin) {
    return (
      <div className="space-y-8 animate-in fade-in duration-500">
        <div className="flex items-center justify-between">
          <div className="text-left">
            <h2 className="text-2xl font-bold tracking-tight text-slate-800 italic uppercase tracking-tighter">{getTimeBasedGreeting()}, {firstName}</h2>
            <p className="text-slate-500 font-medium">Here's an overview of the company ecosystem.</p>
          </div>
          <span className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-xs font-bold uppercase">Admin Center</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
            { label: 'Total Projects', value: projects.length, icon: '📂', color: 'indigo' },
            { label: 'Total Tasks', value: tasks.length, icon: '🎯', color: 'blue' },
            { label: 'Finished Tasks', value: completedCount, icon: '✅', color: 'green' },
            { label: 'Team Members', value: teamMembers.length, icon: '👥', color: 'emerald' },
          ].map((stat, i) => (
            <div key={i} className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 text-left">
              <div className={`w-12 h-12 rounded-2xl bg-${stat.color}-50 flex items-center justify-center text-2xl mb-4`}>
                {stat.icon}
              </div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{stat.label}</p>
              <p className="text-3xl font-bold text-slate-900 mt-1">{stat.value}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 bg-white p-8 rounded-3xl shadow-sm border border-slate-100 min-w-0 text-left">
            <h3 className="text-lg font-bold mb-8">System Throughput</h3>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fontWeight: 600, fill: '#64748b' }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fontWeight: 600, fill: '#64748b' }} />
                  <Tooltip 
                    cursor={{ fill: '#f8fafc' }} 
                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', padding: '12px' }}
                  />
                  <Bar dataKey="count" radius={[8, 8, 0, 0]} barSize={40}>
                    {chartData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 text-left">
            <h3 className="text-lg font-bold mb-6">Top Contributors</h3>
            <div className="space-y-6">
              {teamMembers.slice(0, 4).map(member => {
                const memberTasks = tasks.filter(t => t.assignedTo.includes(member.id));
                const completed = memberTasks.filter(t => t.status === TaskStatus.DONE).length;
                return (
                  <div key={member.id} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-500 overflow-hidden">
                        {member.avatar ? <img src={member.avatar} className="w-full h-full object-cover" /> : member.name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-800">{member.name}</p>
                        <p className="text-[9px] text-slate-400 font-bold uppercase">{member.position}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-indigo-600">{completed}/{memberTasks.length}</p>
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Tasks</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center space-x-4 mb-8 text-left">
        <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center text-3xl font-bold text-white shadow-xl overflow-hidden">
           {user?.avatar ? <img src={user.avatar} className="w-full h-full object-cover" /> : user?.name.charAt(0)}
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-800 italic uppercase tracking-tighter">{getTimeBasedGreeting()}, {firstName}!</h1>
          <p className="text-slate-500 font-medium">You have {myTasks.filter(t => t.status !== TaskStatus.DONE).length} pending tasks for today.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 text-left">
          <h3 className="text-lg font-bold mb-6">Upcoming Deadlines</h3>
          <div className="space-y-4">
             {myTasks.filter(t => t.status !== TaskStatus.DONE).slice(0, 3).map(task => (
               <div key={task.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                 <div className="flex justify-between items-start mb-2">
                    <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase ${task.priority === TaskPriority.HIGH ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}>
                      {task.priority}
                    </span>
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Due {new Date(task.dueDate).toLocaleDateString()}</span>
                 </div>
                 <p className="font-bold text-slate-800">{task.title}</p>
               </div>
             ))}
             {myTasks.filter(t => t.status !== TaskStatus.DONE).length === 0 && <p className="text-slate-400 italic text-sm">No tasks pending! Enjoy your day.</p>}
          </div>
        </div>

        <div className="md:col-span-2 bg-indigo-600 p-8 rounded-3xl text-white shadow-2xl relative overflow-hidden text-left">
          <div className="absolute top-0 right-0 p-12 opacity-10"><Icons.Dashboard className="w-48 h-48" /></div>
          <div className="relative z-10 h-full flex flex-col justify-between">
            <div>
              <h3 className="text-2xl font-bold mb-2">Performance Metrics</h3>
              <p className="text-indigo-100 font-medium opacity-80 max-w-sm">You have completed {myTasks.filter(t => t.status === TaskStatus.DONE).length} milestones successfully.</p>
            </div>
            <div className="mt-12 flex space-x-12">
               <div>
                  <p className="text-4xl font-bold italic">{(myTasks.length > 0 ? (myTasks.filter(t => t.status === TaskStatus.DONE).length / myTasks.length * 100) : 0).toFixed(0)}%</p>
                  <p className="text-[10px] font-bold uppercase tracking-widest opacity-60">Completion Coefficient</p>
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

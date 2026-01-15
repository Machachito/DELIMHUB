
import React from 'react';
import { useApp } from '../App';
import { TaskStatus, TaskPriority } from '../types';

const Kanban: React.FC = () => {
  const { tasks, setTasks, projects, teamMembers, user } = useApp();

  const moveTask = (taskId: string, newStatus: TaskStatus) => {
    if (newStatus === TaskStatus.DONE) {
      const confirmCompletion = window.confirm("Finalize milestone? This will lock the objective status.");
      if (!confirmCompletion) return;
    }
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: newStatus } : t));
  };

  const columns = [
    { title: 'BACKLOG', status: TaskStatus.TODO, color: 'slate' },
    { title: 'IN FLIGHT', status: TaskStatus.IN_PROGRESS, color: 'indigo' },
    { title: 'REVIEW', status: TaskStatus.REVIEW, color: 'amber' },
    { title: 'STAGED', status: TaskStatus.DONE, color: 'emerald' },
  ];

  // Error fix: Filter tasks and projects by current user's company
  const companyTasks = tasks.filter(t => {
    const proj = projects.find(p => p.id === t.projectId);
    return proj?.companyId === user?.companyId;
  });

  return (
    <div className="h-full flex flex-col space-y-6">
       <div className="flex items-center justify-between">
          <div className="text-left">
            <h1 className="text-3xl font-black italic tracking-tighter uppercase text-slate-800">Operational Grid</h1>
            <p className="text-slate-500 font-medium tracking-tight">Tracking {companyTasks.length} tactical milestones for {user?.companyId || 'Enterprise'}</p>
          </div>
       </div>

       <div className="flex-1 flex space-x-6 overflow-x-auto pb-4 custom-scrollbar min-h-0">
          {columns.map(col => (
            <div key={col.status} className="w-80 shrink-0 flex flex-col space-y-4">
              <div className={`flex items-center justify-between p-4 bg-white border-b-4 border-${col.color}-500 rounded-t-[32px] shadow-sm`}>
                 <h3 className="text-xs font-black uppercase tracking-[0.3em] text-slate-600">{col.title}</h3>
                 <span className="bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full text-[10px] font-black">
                    {companyTasks.filter(t => t.status === col.status).length}
                 </span>
              </div>
              
              <div 
                className="flex-1 overflow-y-auto space-y-4 custom-scrollbar pr-2 min-h-[200px]"
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  const taskId = e.dataTransfer.getData('taskId');
                  moveTask(taskId, col.status);
                }}
              >
                {companyTasks.filter(t => t.status === col.status).map(task => {
                  const project = projects.find(p => p.id === task.projectId);
                  return (
                    <div 
                      key={task.id} 
                      className="bg-white p-5 rounded-[28px] shadow-sm border border-slate-100 hover:shadow-xl hover:-translate-y-1 transition-all cursor-grab active:cursor-grabbing group text-left"
                      draggable
                      onDragStart={(e) => e.dataTransfer.setData('taskId', task.id)}
                    >
                      <div className="flex justify-between items-start mb-3">
                         <span className={`text-[8px] font-black px-2 py-0.5 rounded-full border uppercase tracking-widest ${
                           task.priority === TaskPriority.HIGH ? 'bg-red-50 text-red-600 border-red-100' : 'bg-slate-50 text-slate-500 border-slate-100'
                         }`}>
                           {task.priority}
                         </span>
                         <span className="text-[9px] font-bold text-slate-300 uppercase italic truncate max-w-[100px]">{project?.name}</span>
                      </div>
                      <p className="text-sm font-bold text-slate-800 leading-snug group-hover:text-indigo-600 transition-colors">{task.title}</p>
                      <div className="mt-4 pt-4 border-t border-slate-50 flex justify-between items-center">
                         <div className="flex -space-x-2">
                            {task.assignedTo.map(uid => {
                               const member = teamMembers.find(m => m.id === uid);
                               return (
                                 <div key={uid} className="w-6 h-6 rounded-full bg-slate-200 border-2 border-white text-[8px] flex items-center justify-center font-black uppercase overflow-hidden" title={member?.name}>
                                    {member?.avatar ? <img src={member.avatar} className="w-full h-full object-cover" /> : member?.name.charAt(0)}
                                 </div>
                               );
                            })}
                         </div>
                         <p className="text-[9px] font-black text-slate-400">{new Date(task.dueDate).toLocaleDateString()}</p>
                      </div>
                    </div>
                  );
                })}
                
                {companyTasks.filter(t => t.status === col.status).length === 0 && (
                   <div className="h-24 border-2 border-dashed border-slate-100 rounded-[28px] flex items-center justify-center text-slate-200 text-[10px] font-black uppercase tracking-widest italic">
                      No Data
                   </div>
                )}
              </div>
            </div>
          ))}
       </div>
    </div>
  );
};

export default Kanban;

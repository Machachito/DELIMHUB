
import React, { useState, useEffect, useMemo } from 'react';
import { useApp } from '../App';
import { Icons } from '../constants';
import { TaskStatus, Task, Project, TaskPriority, UserRole, Document as DocType } from '../types';
import { useLocation } from 'react-router-dom';
import { generateAIReport } from '../services/geminiService';

type SortKey = 'dueDate' | 'createdAt' | 'priority';

const Projects: React.FC = () => {
  const { projects, tasks, user, setProjects, setTasks, teamMembers, documents, setDocuments, globalSearch } = useApp();
  const location = useLocation();
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [newProject, setNewProject] = useState({ name: '', description: '', priority: TaskPriority.MEDIUM });
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  
  // Selection and Sorting
  const [selectedTaskIds, setSelectedTaskIds] = useState<string[]>([]);
  const [sortKey, setSortKey] = useState<SortKey>('dueDate');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false);
  const [newTask, setNewTask] = useState<{
    title: string;
    description: string;
    dueDate: string;
    priority: TaskPriority;
    assignedTo: string[];
    reminderBefore: number;
  }>({
    title: '',
    description: '',
    dueDate: new Date().toISOString().split('T')[0],
    priority: TaskPriority.MEDIUM,
    assignedTo: [],
    reminderBefore: 60,
  });

  const canManageProjects = user?.role === UserRole.ADMIN;

  // Filter project-relevant team members by company
  const companyTeam = teamMembers.filter(m => m.companyId === user?.companyId);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('action') === 'new-project' && canManageProjects) setIsProjectModalOpen(true);
    if (params.get('action') === 'new-task') {
      const companyProjects = projects.filter(p => p.companyId === user?.companyId);
      if (companyProjects.length > 0) {
        setSelectedProject(companyProjects[0]);
        setIsAddTaskOpen(true);
      }
    }
  }, [location.search, projects, canManageProjects, user?.companyId]);

  const handleCreateProject = () => {
    if (!newProject.name || !canManageProjects) return;
    const project: Project = {
      id: Math.random().toString(36).substr(2, 9),
      name: newProject.name,
      description: newProject.description,
      companyId: user?.companyId || 'c1',
      managerId: user?.id || 'u1',
      createdAt: new Date().toISOString().split('T')[0],
      priority: newProject.priority
    };
    setProjects([...projects, project]);
    setNewProject({ name: '', description: '', priority: TaskPriority.MEDIUM });
    setIsProjectModalOpen(false);
  };

  const handleCreateTask = () => {
    if (!newTask.title || !selectedProject) return;
    const task: Task = {
      id: Math.random().toString(36).substr(2, 9),
      projectId: selectedProject.id,
      title: newTask.title,
      description: newTask.description,
      assignedTo: newTask.assignedTo.length > 0 ? newTask.assignedTo : [user?.id || 'u1'],
      status: TaskStatus.TODO,
      dueDate: newTask.dueDate,
      createdAt: new Date().toISOString().split('T')[0],
      priority: newTask.priority,
      reminderBefore: newTask.reminderBefore,
    };
    setTasks([...tasks, task]);
    setNewTask({ title: '', description: '', dueDate: new Date().toISOString().split('T')[0], priority: TaskPriority.MEDIUM, assignedTo: [], reminderBefore: 60 });
    setIsAddTaskOpen(false);
  };

  const toggleTaskStatus = (taskId: string) => {
    setTasks(prev => prev.map(t => {
      if (t.id === taskId) {
        if (t.status !== TaskStatus.DONE) {
          if (window.confirm(`Mark "${t.title}" as finished?`)) return { ...t, status: TaskStatus.DONE };
          return t;
        }
        return { ...t, status: TaskStatus.TODO };
      }
      return t;
    }));
  };

  const handleTaskFileUpload = (taskId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user || !selectedProject) return;

    const newDoc: DocType = {
      id: Math.random().toString(36).substr(2, 9),
      name: file.name,
      projectId: selectedProject.id,
      taskId: taskId,
      uploadedBy: user.id,
      uploadedAt: new Date().toISOString().split('T')[0],
      fileType: file.name.split('.').pop() || 'file',
    };
    setDocuments([...documents, newDoc]);
    alert(`File "${file.name}" attached.`);
  };

  // Bulk Actions
  const handleBulkAction = (action: 'status' | 'priority' | 'assignee', value: any) => {
    if (selectedTaskIds.length === 0 || !value) return;
    setTasks(prev => prev.map(t => {
      if (selectedTaskIds.includes(t.id)) {
        if (action === 'status') return { ...t, status: value as TaskStatus };
        if (action === 'priority') return { ...t, priority: value as TaskPriority };
        if (action === 'assignee') return { ...t, assignedTo: [value] };
      }
      return t;
    }));
    setSelectedTaskIds([]);
  };

  const toggleTaskSelection = (taskId: string) => {
    setSelectedTaskIds(prev => prev.includes(taskId) ? prev.filter(id => id !== taskId) : [...prev, taskId]);
  };

  const selectAllTasks = (projectTasks: Task[]) => {
    if (selectedTaskIds.length === projectTasks.length) {
      setSelectedTaskIds([]);
    } else {
      setSelectedTaskIds(projectTasks.map(t => t.id));
    }
  };

  const toggleAssignee = (userId: string) => {
    setNewTask(prev => ({
      ...prev,
      assignedTo: prev.assignedTo.includes(userId)
        ? prev.assignedTo.filter(id => id !== userId)
        : [...prev.assignedTo, userId]
    }));
  };

  const sortedTasks = useMemo(() => {
    if (!selectedProject) return [];
    let filtered = tasks.filter(t => t.projectId === selectedProject.id);
    
    return filtered.sort((a, b) => {
      let valA: any = a[sortKey];
      let valB: any = b[sortKey];
      
      if (sortKey === 'priority') {
        const priorities = { [TaskPriority.HIGH]: 3, [TaskPriority.MEDIUM]: 2, [TaskPriority.LOW]: 1 };
        valA = priorities[a.priority];
        valB = priorities[b.priority];
      }

      if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
  }, [tasks, selectedProject, sortKey, sortOrder]);

  const getPriorityStyles = (p: TaskPriority) => {
    switch (p) {
      case TaskPriority.HIGH: return 'text-red-600 bg-red-50 border-red-100';
      case TaskPriority.MEDIUM: return 'text-orange-600 bg-orange-50 border-orange-100';
      case TaskPriority.LOW: return 'text-blue-600 bg-blue-50 border-blue-100';
      default: return 'text-slate-600 bg-slate-50 border-slate-100';
    }
  };

  const handleGenerateAIReport = async () => {
    if (!selectedProject) return;
    setIsGeneratingReport(true);
    try {
      const projectTasks = tasks.filter(t => t.projectId === selectedProject.id);
      const report = await generateAIReport(selectedProject, projectTasks);
      const reportText = `Project Analysis: ${selectedProject.name}\nHealth: ${report.healthScore}%\nSummary: ${report.summary}`;
      const blob = new Blob([reportText], { type: 'text/plain' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `${selectedProject.name}_AI_Report.txt`;
      link.click();
    } catch (err) {
      alert("AI report failed. Ensure your Gemini key is correct.");
    } finally {
      setIsGeneratingReport(false);
    }
  };

  // Error fix: Filter projects by companyId
  const filteredProjects = projects.filter(p => 
    p.companyId === user?.companyId &&
    p.name.toLowerCase().includes(globalSearch.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="text-left">
          <h1 className="text-3xl font-bold text-slate-800 italic uppercase tracking-tighter">Project Ecosystem</h1>
          <p className="text-slate-500 font-medium">Tracking {filteredProjects.length} distinct initiatives for your organization.</p>
        </div>
        {canManageProjects && (
          <button onClick={() => setIsProjectModalOpen(true)} className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-2xl flex items-center space-x-2 transition-all shadow-xl font-bold">
            <Icons.Plus className="w-5 h-5" />
            <span>New Project</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredProjects.map(project => {
          const pTasks = tasks.filter(t => t.projectId === project.id);
          const progress = pTasks.length > 0 ? (pTasks.filter(t => t.status === TaskStatus.DONE).length / pTasks.length) * 100 : 0;
          return (
            <div key={project.id} onClick={() => { setSelectedProject(project); setSelectedTaskIds([]); }} className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 hover:border-indigo-400 transition-all cursor-pointer group text-left">
              <div className="flex justify-between items-start mb-6">
                <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 font-bold text-xl group-hover:bg-indigo-600 group-hover:text-white transition-colors">{project.name.charAt(0)}</div>
                <div className={`px-3 py-1 rounded-full text-[10px] font-bold border uppercase flex items-center space-x-1 ${getPriorityStyles(project.priority)}`}>
                   {project.priority === TaskPriority.HIGH && <span>🔥</span>}
                   {project.priority === TaskPriority.MEDIUM && <span>⚖️</span>}
                   {project.priority === TaskPriority.LOW && <span>🧊</span>}
                   <span>{project.priority}</span>
                </div>
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-2">{project.name}</h3>
              <p className="text-slate-500 text-sm line-clamp-2 mb-8 leading-relaxed">{project.description}</p>
              <div className="space-y-3">
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-indigo-500 transition-all duration-1000" style={{ width: `${progress}%` }} />
                </div>
                <div className="flex justify-between items-center text-[11px] font-bold text-slate-400 uppercase tracking-wide">
                   <span>{pTasks.length} Tasks</span>
                   <span className="text-indigo-600">{Math.round(progress)}% Progress</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {selectedProject && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-50 flex justify-end">
          <div className="w-full max-w-4xl bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-500 overflow-hidden">
            <div className="p-8 border-b border-slate-100 flex items-center justify-between shrink-0">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-indigo-600 text-white rounded-xl flex items-center justify-center font-bold text-xl">{selectedProject.name.charAt(0)}</div>
                <div>
                  <h2 className="text-2xl font-bold text-indigo-600">{selectedProject.name}</h2>
                  <p className="text-xs font-bold text-slate-400 uppercase">Operational Detail Hub</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <button 
                  onClick={handleGenerateAIReport} 
                  disabled={isGeneratingReport} 
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl transition-all font-bold flex items-center space-x-2 disabled:opacity-50"
                >
                  {isGeneratingReport ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <span>AI Analysis</span>}
                </button>
                <button onClick={() => setSelectedProject(null)} className="p-2 hover:bg-slate-100 rounded-full text-slate-400">
                  <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M6 18L18 6M6 6l12 12"/></svg>
                </button>
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto p-8 space-y-10 custom-scrollbar text-left">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                  {selectedTaskIds.length > 0 && (
                    <div className="bg-indigo-600 text-white p-4 rounded-2xl flex items-center justify-between shadow-lg sticky top-0 z-20 animate-in slide-in-from-top-2">
                       <div className="flex items-center space-x-4 overflow-x-auto">
                         <span className="text-sm font-bold shrink-0">{selectedTaskIds.length} tasks selected</span>
                         <div className="flex items-center space-x-2">
                            <select onChange={(e) => handleBulkAction('status', e.target.value)} className="bg-indigo-700 text-[10px] font-bold p-1.5 rounded outline-none cursor-pointer">
                              <option value="">Status</option>
                              {Object.values(TaskStatus).map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                            <select onChange={(e) => handleBulkAction('priority', e.target.value)} className="bg-indigo-700 text-[10px] font-bold p-1.5 rounded outline-none cursor-pointer">
                              <option value="">Priority</option>
                              {Object.values(TaskPriority).map(p => <option key={p} value={p}>{p}</option>)}
                            </select>
                            <select onChange={(e) => handleBulkAction('assignee', e.target.value)} className="bg-indigo-700 text-[10px] font-bold p-1.5 rounded outline-none cursor-pointer">
                              <option value="">Assignee</option>
                              {companyTeam.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                            </select>
                         </div>
                       </div>
                       <button onClick={() => setSelectedTaskIds([])} className="text-xs font-bold hover:underline shrink-0">Clear</button>
                    </div>
                  )}

                  <section>
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Briefing</h4>
                    <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 text-slate-700 italic leading-relaxed">
                      {selectedProject.description}
                    </div>
                  </section>

                  <section>
                    <div className="flex justify-between items-end mb-6">
                      <div className="flex items-center space-x-4">
                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Milestones</h4>
                        <div className="flex items-center space-x-2">
                           <select value={sortKey} onChange={(e) => setSortKey(e.target.value as SortKey)} className="text-[10px] font-bold bg-white border border-slate-200 p-1 rounded">
                             <option value="dueDate">Due Date</option>
                             <option value="createdAt">Created Date</option>
                             <option value="priority">Priority</option>
                           </select>
                           <button onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')} className="text-[10px] font-bold text-indigo-600 uppercase underline">Flip</button>
                        </div>
                      </div>
                      <button onClick={() => setIsAddTaskOpen(!isAddTaskOpen)} className="bg-indigo-600 text-white p-2 rounded-xl shadow-lg hover:scale-105 transition-all"><Icons.Plus className="w-6 h-6" /></button>
                    </div>

                    {isAddTaskOpen && (
                      <div className="mb-8 p-6 bg-indigo-50 border border-indigo-100 rounded-3xl space-y-4 shadow-xl animate-in zoom-in-95">
                        <input type="text" placeholder="Mission name..." className="w-full px-5 py-3 rounded-2xl border border-indigo-200 focus:outline-none focus:ring-4 focus:ring-indigo-100 font-bold" value={newTask.title} onChange={e => setNewTask({...newTask, title: e.target.value})} />
                        
                        <div>
                          <label className="block text-[10px] font-bold text-indigo-400 uppercase mb-3">Assign Operators</label>
                          <div className="grid grid-cols-2 gap-2 bg-white p-4 rounded-2xl border border-indigo-200 max-h-40 overflow-y-auto custom-scrollbar">
                             {companyTeam.map(m => (
                               <label key={m.id} className="flex items-center space-x-2 cursor-pointer group">
                                  <input 
                                    type="checkbox" 
                                    className="w-4 h-4 rounded text-indigo-600" 
                                    checked={newTask.assignedTo.includes(m.id)}
                                    onChange={() => toggleAssignee(m.id)}
                                  />
                                  <span className="text-xs font-bold text-slate-700 group-hover:text-indigo-600">{m.name}</span>
                               </label>
                             ))}
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-[10px] font-bold text-indigo-400 uppercase mb-2">Priority</label>
                            <select className="w-full px-5 py-3 rounded-2xl border border-indigo-200 bg-white font-bold text-sm" value={newTask.priority} onChange={e => setNewTask({...newTask, priority: e.target.value as TaskPriority})}>
                              {Object.values(TaskPriority).map(p => <option key={p} value={p}>{p}</option>)}
                            </select>
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold text-indigo-400 uppercase mb-2">Deadline</label>
                            <input type="date" className="w-full px-5 py-3 rounded-2xl border border-indigo-200 bg-white font-bold text-sm" value={newTask.dueDate} onChange={e => setNewTask({...newTask, dueDate: e.target.value})} />
                          </div>
                        </div>
                        <button onClick={handleCreateTask} className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-bold uppercase shadow-xl transition-all">Launch Task</button>
                      </div>
                    )}

                    <div className="space-y-4">
                      {sortedTasks.map(task => {
                        const taskFiles = documents.filter(d => d.taskId === task.id);
                        return (
                          <div key={task.id} className={`bg-white border rounded-3xl hover:shadow-xl transition-all group overflow-hidden ${selectedTaskIds.includes(task.id) ? 'border-indigo-400 shadow-md bg-indigo-50/10' : 'border-slate-100'}`}>
                            <div className="p-5 flex items-center space-x-4">
                              <input 
                                type="checkbox" 
                                checked={selectedTaskIds.includes(task.id)} 
                                onChange={() => toggleTaskSelection(task.id)}
                                className="w-5 h-5 rounded border-slate-200 text-indigo-600 cursor-pointer"
                              />
                              <div className="flex-1 min-w-0" onClick={() => toggleTaskStatus(task.id)}>
                                <p className={`text-sm font-bold truncate cursor-pointer ${task.status === TaskStatus.DONE ? 'line-through text-slate-300' : 'text-slate-800'}`}>{task.title}</p>
                                <div className="flex items-center space-x-3 mt-1">
                                  <div className="flex -space-x-1">
                                     {task.assignedTo.map(id => {
                                       const m = teamMembers.find(tm => tm.id === id);
                                       return (
                                         <div key={id} className="w-5 h-5 rounded-full bg-slate-200 border-2 border-white flex items-center justify-center text-[8px] font-black uppercase overflow-hidden" title={m?.name}>
                                            {m?.avatar ? <img src={m.avatar} className="w-full h-full object-cover" /> : m?.name.charAt(0)}
                                         </div>
                                       );
                                     })}
                                  </div>
                                  <div className="w-1 h-1 bg-slate-300 rounded-full" />
                                  <span className="text-[10px] font-bold text-slate-400 uppercase italic">Due: {task.dueDate}</span>
                                </div>
                              </div>
                              <div className="flex items-center space-x-2">
                                <label className="cursor-pointer p-2 hover:bg-slate-50 rounded-lg text-slate-400 transition-colors" title="Attach Data">
                                   <Icons.Plus className="w-4 h-4" />
                                   <input type="file" className="hidden" onChange={(e) => handleTaskFileUpload(task.id, e)} />
                                </label>
                                <span className={`text-[10px] px-3 py-1 rounded-full font-bold border uppercase ${getPriorityStyles(task.priority)}`}>{task.priority}</span>
                              </div>
                            </div>
                            {taskFiles.length > 0 && (
                              <div className="bg-slate-50 px-5 py-2 border-t border-slate-100 flex flex-wrap gap-2">
                                {taskFiles.map(file => (
                                  <div key={file.id} className="flex items-center space-x-1 bg-white px-2 py-0.5 rounded border border-slate-200 text-[9px] font-bold text-slate-500">
                                    <span>{file.name}</span>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </section>
                </div>

                <div className="space-y-8">
                  <section>
                    <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Assigned Taskforce</h4>
                    <div className="space-y-3">
                       {companyTeam.filter(m => tasks.some(t => t.projectId === selectedProject?.id && t.assignedTo.includes(m.id))).map(member => (
                         <div key={member.id} className="flex items-center justify-between p-3 bg-white rounded-2xl border border-slate-100">
                           <div className="flex items-center space-x-3">
                             <div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center text-[10px] font-bold text-indigo-600 overflow-hidden">
                                {member.avatar ? <img src={member.avatar} className="w-full h-full object-cover" /> : member.name.charAt(0)}
                             </div>
                             <div>
                               <p className="text-xs font-bold text-slate-800">{member.name}</p>
                               <p className="text-[9px] text-slate-400 font-bold uppercase">{member.position}</p>
                             </div>
                           </div>
                         </div>
                       ))}
                    </div>
                  </section>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {isProjectModalOpen && canManageProjects && (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-xl z-[60] flex items-center justify-center p-4">
          <div className="bg-white rounded-[48px] w-full max-w-lg p-12 animate-in zoom-in-95 duration-300 shadow-2xl text-left">
            <h2 className="text-3xl font-bold mb-8 text-indigo-600 italic uppercase tracking-tighter">Engage New Objective</h2>
            <div className="space-y-6">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-2">Ecosystem Label</label>
                <input type="text" value={newProject.name} onChange={(e) => setNewProject({...newProject, name: e.target.value})} className="w-full px-6 py-4 rounded-3xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-4 focus:ring-indigo-100 font-bold" placeholder="e.g. Project Apollo" />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-2">Objective Briefing</label>
                <textarea rows={4} value={newProject.description} onChange={(e) => setNewProject({...newProject, description: e.target.value})} className="w-full px-6 py-4 rounded-3xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-4 focus:ring-indigo-100 font-bold" placeholder="Target details..." />
              </div>
              <div className="flex space-x-4 pt-6">
                <button onClick={() => setIsProjectModalOpen(false)} className="flex-1 px-8 py-4 rounded-2xl font-bold uppercase text-xs text-slate-400">Abort</button>
                <button onClick={handleCreateProject} className="flex-1 bg-indigo-600 text-white px-8 py-4 rounded-3xl font-black uppercase italic tracking-widest text-xs shadow-2xl transition-all">Launch</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Projects;

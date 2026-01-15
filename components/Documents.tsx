
import React, { useState } from 'react';
import { useApp } from '../App';
import { Icons } from '../constants';
import { Document as DocType } from '../types';

const Documents: React.FC = () => {
  const { documents, setDocuments, projects, tasks, teamMembers, user, globalSearch } = useApp();
  const [isUploading, setIsUploading] = useState(false);
  const [newDoc, setNewDoc] = useState({ 
    name: '', 
    projectId: projects[0]?.id || '', 
    taskId: '',
    file: null as File | null 
  });

  const handleUpload = () => {
    if (!newDoc.name || !newDoc.projectId || !user) {
      alert("Please provide at least a name and project context.");
      return;
    }
    
    const doc: DocType = {
      id: Math.random().toString(36).substr(2, 9),
      name: newDoc.name,
      projectId: newDoc.projectId,
      uploadedBy: user.id,
      uploadedAt: new Date().toISOString().split('T')[0],
      fileType: newDoc.file?.name.split('.').pop() || 'doc',
    };
    
    setDocuments(prev => [...prev, doc]);
    setIsUploading(false);
    setNewDoc({ name: '', projectId: projects[0]?.id || '', taskId: '', file: null });
  };

  const filteredDocs = documents.filter(d => 
    d.name.toLowerCase().includes(globalSearch.toLowerCase())
  );

  const filteredTasks = tasks.filter(t => t.projectId === newDoc.projectId);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-black italic tracking-tighter uppercase text-slate-800">Archive & Intelligence</h1>
          <p className="text-slate-500 font-medium tracking-tight">Accessing {documents.length} critical project artifacts</p>
        </div>
        <button 
          onClick={() => setIsUploading(true)}
          className="bg-slate-800 hover:bg-slate-900 text-white px-6 py-3 rounded-2xl flex items-center space-x-2 transition-all shadow-xl font-bold"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"/></svg>
          <span className="uppercase text-xs italic">Upload Artifact</span>
        </button>
      </div>

      <div className="bg-white rounded-[40px] shadow-sm border border-slate-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-100">
            <tr>
              <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Artifact Label</th>
              <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Associated Project</th>
              <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Operator</th>
              <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Timestamp</th>
              <th className="px-8 py-4 text-right"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {filteredDocs.map(doc => {
              const project = projects.find(p => p.id === doc.projectId);
              const uploader = teamMembers.find(u => u.id === doc.uploadedBy);
              return (
                <tr key={doc.id} className="hover:bg-slate-50 transition-colors group">
                  <td className="px-8 py-6">
                    <div className="flex items-center space-x-4">
                       <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center font-black text-xs">
                          {doc.fileType.toUpperCase()}
                       </div>
                       <p className="font-bold text-slate-800 group-hover:text-indigo-600 transition-colors">{doc.name}</p>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <span className="bg-slate-100 text-slate-500 px-3 py-1 rounded-full text-[10px] font-bold uppercase">
                       {project?.name || 'Global'}
                    </span>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center space-x-2">
                       <div className="w-6 h-6 rounded-full bg-slate-200 text-[8px] flex items-center justify-center font-black">
                          {uploader?.name.charAt(0)}
                       </div>
                       <span className="text-xs font-bold text-slate-600">{uploader?.name}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-xs text-slate-400 font-bold">{doc.uploadedAt}</td>
                  <td className="px-8 py-6 text-right">
                    <button className="text-slate-400 hover:text-indigo-600 transition-colors">
                       <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {filteredDocs.length === 0 && (
          <div className="py-20 text-center text-slate-400">
             <p className="font-bold italic uppercase tracking-widest">No artifacts found</p>
          </div>
        )}
      </div>

      {isUploading && (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-xl z-[60] flex items-center justify-center p-4">
          <div className="bg-white rounded-[48px] w-full max-w-lg p-12 animate-in zoom-in-95 duration-300 shadow-2xl">
            <h2 className="text-3xl font-black italic uppercase tracking-tighter mb-8 text-indigo-600">Archive Artifact</h2>
            <div className="space-y-6">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Display Name</label>
                <input 
                  type="text" 
                  value={newDoc.name}
                  onChange={(e) => setNewDoc({...newDoc, name: e.target.value})}
                  className="w-full px-6 py-4 rounded-3xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-4 focus:ring-indigo-100 font-bold" 
                  placeholder="e.g. Q4_PROPOSAL_FINAL"
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Context Project</label>
                  <select 
                    value={newDoc.projectId}
                    onChange={(e) => setNewDoc({...newDoc, projectId: e.target.value, taskId: ''})}
                    className="w-full px-6 py-4 rounded-3xl bg-slate-50 border border-slate-200 font-bold"
                  >
                    {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Linked Task (Optional)</label>
                  <select 
                    value={newDoc.taskId}
                    onChange={(e) => setNewDoc({...newDoc, taskId: e.target.value})}
                    className="w-full px-6 py-4 rounded-3xl bg-slate-50 border border-slate-200 font-bold"
                  >
                    <option value="">General Project Artifact</option>
                    {filteredTasks.map(t => <option key={t.id} value={t.id}>{t.title}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">File Payload</label>
                <input 
                  type="file" 
                  onChange={(e) => setNewDoc({...newDoc, file: e.target.files?.[0] || null})}
                  className="w-full px-6 py-4 rounded-3xl bg-indigo-50 border border-indigo-100 font-bold cursor-pointer file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-black file:bg-indigo-600 file:text-white hover:file:bg-indigo-700"
                />
              </div>

              <div className="flex space-x-4 pt-6">
                <button 
                  onClick={() => setIsUploading(false)}
                  className="flex-1 px-8 py-4 rounded-2xl font-black uppercase text-xs text-slate-400 hover:text-slate-600 transition-colors"
                >
                  Discard
                </button>
                <button 
                  onClick={handleUpload}
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-4 rounded-[28px] font-black uppercase italic tracking-[0.2em] text-xs shadow-2xl shadow-indigo-200 transition-all active:scale-95"
                >
                  Secure Archive
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Documents;


import React, { useState } from 'react';
import { useApp } from '../App';
import { generateAIReport } from '../services/geminiService';
import { Icons } from '../constants';

const Reports: React.FC = () => {
  const { projects, tasks } = useApp();
  const [selectedProjectId, setSelectedProjectId] = useState(projects[0]?.id || '');
  const [report, setReport] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleGenerate = async () => {
    const project = projects.find(p => p.id === selectedProjectId);
    if (!project) return;
    
    setIsLoading(true);
    try {
      const projectTasks = tasks.filter(t => t.projectId === project.id);
      const res = await generateAIReport(project, projectTasks);
      setReport(res);
    } catch (err) {
      alert("Failed to generate report. Please check your API key.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="bg-gradient-to-br from-indigo-600 to-blue-700 p-8 rounded-3xl text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10">
          <Icons.Report className="w-32 h-32" />
        </div>
        <div className="relative z-10">
          <h2 className="text-3xl font-bold mb-2">AI Project Intelligence</h2>
          <p className="text-blue-100 mb-8 max-w-lg">Get deep insights, health scores, and automated bottleneck analysis powered by Gemini 3 Flash.</p>
          
          <div className="flex flex-col sm:flex-row gap-4">
            <select 
              value={selectedProjectId}
              onChange={(e) => setSelectedProjectId(e.target.value)}
              className="bg-white/20 backdrop-blur-md border border-white/30 text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-white/50"
            >
              {projects.map(p => <option key={p.id} value={p.id} className="text-slate-900">{p.name}</option>)}
            </select>
            <button 
              onClick={handleGenerate}
              disabled={isLoading}
              className="bg-white text-blue-700 font-bold px-8 py-3 rounded-xl hover:bg-blue-50 transition-colors shadow-lg disabled:opacity-70 flex items-center space-x-2"
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-blue-700 border-t-transparent rounded-full animate-spin" />
                  <span>Analyzing Project...</span>
                </>
              ) : (
                <>
                  <Icons.Plus className="w-5 h-5" />
                  <span>Generate AI Report</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {report ? (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 flex flex-col items-center justify-center text-center">
              <div className="relative w-32 h-32 flex items-center justify-center">
                 <svg className="w-full h-full -rotate-90">
                    <circle cx="64" cy="64" r="58" fill="none" stroke="#f1f5f9" strokeWidth="12" />
                    <circle cx="64" cy="64" r="58" fill="none" stroke="#3b82f6" strokeWidth="12" strokeDasharray="364" strokeDashoffset={364 - (364 * report.healthScore / 100)} className="transition-all duration-1000 ease-out" />
                 </svg>
                 <span className="absolute text-3xl font-bold text-slate-800">{report.healthScore}%</span>
              </div>
              <h4 className="mt-4 font-bold text-slate-400 uppercase tracking-widest text-xs">Project Health Score</h4>
            </div>

            <div className="md:col-span-2 bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
              <h3 className="text-xl font-bold text-slate-800 mb-4 flex items-center space-x-2">
                <span>Executive Summary</span>
                <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-[10px] uppercase">AI Insight</span>
              </h3>
              <p className="text-slate-600 leading-relaxed italic">"{report.summary}"</p>
              <div className="mt-6 flex items-center space-x-2 text-blue-600 font-bold">
                 <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                 <span>Estimated Completion: {report.completionEstimate || 'TBD'}</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-red-50 p-8 rounded-3xl border border-red-100">
              <h4 className="text-red-800 font-bold mb-4 flex items-center space-x-2">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
                <span>Potential Bottlenecks</span>
              </h4>
              <ul className="space-y-3">
                {report.bottlenecks.map((item: string, i: number) => (
                  <li key={i} className="flex items-start space-x-3 text-red-700 text-sm">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-400 mt-1.5 flex-shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-green-50 p-8 rounded-3xl border border-green-100">
              <h4 className="text-green-800 font-bold mb-4 flex items-center space-x-2">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                <span>Strategic Recommendations</span>
              </h4>
              <ul className="space-y-3">
                {report.recommendations.map((item: string, i: number) => (
                  <li key={i} className="flex items-start space-x-3 text-green-700 text-sm">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-400 mt-1.5 flex-shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      ) : (
        <div className="py-20 flex flex-col items-center justify-center text-slate-400 space-y-4">
          <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center">
             <Icons.Report className="w-10 h-10" />
          </div>
          <p className="text-lg font-medium">Select a project to generate your first AI insight</p>
        </div>
      )}
    </div>
  );
};

export default Reports;

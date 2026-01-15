
import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../App';
import { Message, Attachment } from '../types';

const EMOJIS = ['👍', '🔥', '🚀', '✅', '❤️', '🙌', '✨', '🎯', '💡', '⚠️'];

const ChatRoom: React.FC = () => {
  const { messages, setMessages, user, projects, teamMembers } = useApp();
  const [activeTab, setActiveTab] = useState<'project' | 'personal'>('project');
  const [selectedProjectId, setSelectedProjectId] = useState(projects[0]?.id || '');
  const [selectedMemberId, setSelectedMemberId] = useState('');
  const [input, setInput] = useState('');
  const [showEmojis, setShowEmojis] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, selectedProjectId, selectedMemberId, activeTab]);

  const handleSend = (text: string = input, attachment?: Attachment) => {
    if ((!text.trim() && !attachment) || !user) return;
    const newMessage: Message = {
      id: Date.now().toString(),
      projectId: activeTab === 'project' ? selectedProjectId : undefined,
      receiverId: activeTab === 'personal' ? selectedMemberId : undefined,
      senderId: user.id,
      senderName: user.name,
      text: text,
      timestamp: new Date().toISOString(),
      attachment: attachment
    };
    setMessages(prev => [...prev, newMessage]);
    setInput('');
    setShowEmojis(false);
  };

  const handleFileAttach = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const type = file.type.startsWith('image') ? 'image' : file.type.startsWith('video') ? 'video' : 'file';
      const attachment: Attachment = {
        name: file.name,
        url: reader.result as string,
        type: type as any
      };
      handleSend('', attachment);
    };
    reader.readAsDataURL(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const addEmoji = (emoji: string) => {
    setInput(prev => prev + emoji);
  };

  const currentMessages = activeTab === 'project' 
    ? messages.filter(m => m.projectId === selectedProjectId)
    : messages.filter(m => 
        (m.senderId === user?.id && m.receiverId === selectedMemberId) || 
        (m.senderId === selectedMemberId && m.receiverId === user?.id)
      );

  return (
    <div className="h-full flex flex-col bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden text-left relative">
      <div className="flex border-b border-slate-100 shrink-0">
        <button onClick={() => setActiveTab('project')} className={`flex-1 p-4 font-bold uppercase text-xs tracking-widest transition-all ${activeTab === 'project' ? 'bg-indigo-600 text-white shadow-inner' : 'bg-slate-50 text-slate-400 hover:bg-slate-100'}`}>Squad Channels</button>
        <button onClick={() => setActiveTab('personal')} className={`flex-1 p-4 font-bold uppercase text-xs tracking-widest transition-all ${activeTab === 'personal' ? 'bg-indigo-600 text-white shadow-inner' : 'bg-slate-50 text-slate-400 hover:bg-slate-100'}`}>Direct Comms</button>
      </div>

      <div className="p-4 bg-slate-50/50 border-b border-slate-100 flex items-center space-x-4 shrink-0">
        {activeTab === 'project' ? (
          <select value={selectedProjectId} onChange={(e) => setSelectedProjectId(e.target.value)} className="w-full bg-white px-4 py-2 rounded-xl border border-slate-200 font-bold focus:ring-2 focus:ring-indigo-100 outline-none">
            {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        ) : (
          <select value={selectedMemberId} onChange={(e) => setSelectedMemberId(e.target.value)} className="w-full bg-white px-4 py-2 rounded-xl border border-slate-200 font-bold focus:ring-2 focus:ring-indigo-100 outline-none">
            <option value="">Select a receiver...</option>
            {teamMembers.filter(m => m.id !== user?.id).map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
          </select>
        )}
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar bg-slate-50/20">
        {currentMessages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-slate-400 italic space-y-4">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center text-2xl animate-pulse">📡</div>
            <p>Frequency open. Awaiting data transmission.</p>
          </div>
        ) : (
          currentMessages.map(m => (
            <div key={m.id} className={`flex ${m.senderId === user?.id ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-2`}>
              <div className={`max-w-[70%] space-y-1 ${m.senderId === user?.id ? 'items-end' : 'items-start'}`}>
                {m.senderId !== user?.id && <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-2">{m.senderName}</span>}
                <div className={`px-4 py-3 rounded-2xl shadow-sm text-sm font-medium ${m.senderId === user?.id ? 'bg-indigo-600 text-white' : 'bg-white border border-slate-100 text-slate-800'}`}>
                  {m.attachment && (
                    <div className="mb-2">
                       {m.attachment.type === 'image' && <img src={m.attachment.url} className="max-w-full rounded-lg shadow-sm mb-1" />}
                       {m.attachment.type === 'video' && <video controls src={m.attachment.url} className="max-w-full rounded-lg shadow-sm mb-1" />}
                       <div className={`flex items-center space-x-2 text-[10px] p-2 rounded ${m.senderId === user?.id ? 'bg-indigo-700' : 'bg-slate-50'}`}>
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" /></svg>
                          <span className="truncate">{m.attachment.name}</span>
                       </div>
                    </div>
                  )}
                  {m.text}
                </div>
                <span className="text-[9px] text-slate-400 uppercase font-bold">{new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
            </div>
          ))
        )}
      </div>

      {showEmojis && (
        <div className="absolute bottom-20 left-4 bg-white p-3 rounded-2xl shadow-2xl border border-slate-100 flex gap-2 animate-in zoom-in-95">
          {EMOJIS.map(e => <button key={e} onClick={() => addEmoji(e)} className="hover:scale-125 transition-transform">{e}</button>)}
        </div>
      )}

      <div className="p-4 bg-white border-t border-slate-100 shrink-0">
        <div className="flex items-center space-x-2">
          <button onClick={() => setShowEmojis(!showEmojis)} className={`p-2 rounded-xl transition-all ${showEmojis ? 'bg-indigo-100 text-indigo-600' : 'text-slate-400 hover:bg-slate-50'}`} title="Emoji">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          </button>
          <button onClick={() => fileInputRef.current?.click()} className="p-2 text-slate-400 hover:bg-slate-50 rounded-xl transition-all" title="Attach file">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" /></svg>
            <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileAttach} />
          </button>
          <input 
            type="text" 
            value={input} 
            onChange={(e) => setInput(e.target.value)} 
            onKeyPress={(e) => e.key === 'Enter' && handleSend()} 
            placeholder="Broadcast data..." 
            className="flex-1 px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-medium" 
          />
          <button onClick={() => handleSend()} disabled={!input.trim() && (activeTab === 'personal' && !selectedMemberId)} className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white p-4 rounded-2xl shadow-lg transition-all active:scale-95">
            <svg className="w-5 h-5 rotate-90" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/></svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatRoom;

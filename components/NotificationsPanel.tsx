
import React from 'react';
import { useApp } from '../App';

const NotificationsPanel: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { notifications, setNotifications } = useApp();

  const markAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  return (
    <>
      <div className="fixed inset-0 z-40" onClick={onClose} />
      <div className="absolute right-8 top-16 w-80 bg-white shadow-2xl rounded-3xl border border-slate-100 z-50 overflow-hidden flex flex-col animate-in slide-in-from-top-4 duration-200">
        <div className="p-4 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
          <h4 className="font-bold text-slate-800">Notifications</h4>
          <button onClick={() => setNotifications([])} className="text-[10px] font-bold text-blue-600 uppercase tracking-wider hover:underline">Clear All</button>
        </div>
        <div className="max-h-96 overflow-y-auto custom-scrollbar">
          {notifications.length === 0 ? (
            <div className="p-10 text-center text-slate-400">
               <p className="text-sm font-medium">All caught up!</p>
            </div>
          ) : (
            notifications.map(n => (
              <div 
                key={n.id} 
                onClick={() => markAsRead(n.id)}
                className={`p-4 border-b border-slate-50 hover:bg-slate-50 cursor-pointer transition-colors relative ${!n.read ? 'bg-blue-50/30' : ''}`}
              >
                {!n.read && <div className="absolute left-2 top-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-blue-500 rounded-full" />}
                <p className="text-xs font-bold text-slate-800">{n.title}</p>
                <p className="text-[11px] text-slate-500 mt-1">{n.content}</p>
                <p className="text-[9px] text-slate-400 mt-2">{new Date(n.timestamp).toLocaleTimeString()}</p>
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
};

export default NotificationsPanel;

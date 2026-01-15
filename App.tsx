
import React, { useState, useEffect, createContext, useContext } from 'react';
import { HashRouter as Router, Routes, Route, Navigate, Link, useLocation, useNavigate } from 'react-router-dom';
import { User, Project, Task, Message, Notification, UserRole, TaskStatus, TaskPriority, Document as DocType } from './types';
import { Icons } from './constants';
import Dashboard from './components/Dashboard';
import Projects from './components/Projects';
import ChatRoom from './components/ChatRoom';
import Reports from './components/Reports';
import Auth from './components/Auth';
import NotificationsPanel from './components/NotificationsPanel';
import Kanban from './components/Kanban';
import Team from './components/Team';
import Documents from './components/Documents';
import Profile from './components/Profile';

interface AppContextType {
  user: User | null;
  setUser: (u: User | null) => void;
  impersonator: User | null;
  impersonateUser: (u: User) => void;
  stopImpersonating: () => void;
  projects: Project[];
  setProjects: React.Dispatch<React.SetStateAction<Project[]>>;
  tasks: Task[];
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
  teamMembers: User[];
  setTeamMembers: React.Dispatch<React.SetStateAction<User[]>>;
  messages: Message[];
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
  notifications: Notification[];
  setNotifications: React.Dispatch<React.SetStateAction<Notification[]>>;
  documents: DocType[];
  setDocuments: React.Dispatch<React.SetStateAction<DocType[]>>;
  logout: () => void;
  globalSearch: string;
  setGlobalSearch: (s: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error("useApp must be used within AppProvider");
  return context;
};

// System Default Admin - always available for testing
const DEFAULT_ADMIN: User = { 
  id: 'u-root', 
  name: 'System Admin', 
  email: 'admin@delimhub.com', 
  password: 'password', 
  role: UserRole.ADMIN, 
  companyId: 'org-root', 
  position: 'Root Administrator', 
  isOnline: true 
};

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, logout, notifications, globalSearch, setGlobalSearch, impersonator, stopImpersonating } = useApp();
  const location = useLocation();
  const navigate = useNavigate();
  const [showNotifications, setShowNotifications] = useState(false);

  const navItems = [
    { icon: Icons.Dashboard, label: 'Dashboard', path: '/' },
    { icon: Icons.Project, label: 'Projects', path: '/projects' },
    { icon: (props: any) => <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25V6ZM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25v-2.25ZM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25a2.25 2.25 0 0 1-2.25-2.25V6ZM13.5 15.75a2.25 2.25 0 0 1 2.25-2.25H18a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H16a2.25 2.25 0 0 1-2.25-2.25v-2.25Z" /></svg>, label: 'Board View', path: '/kanban' },
    { icon: Icons.Chat, label: 'Messages', path: '/chat' },
    { icon: Icons.User, label: 'Team Members', path: '/team' },
    { icon: (props: any) => <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" /></svg>, label: 'Files', path: '/documents' },
    { icon: Icons.Report, label: 'Reports', path: '/reports' },
  ];

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      {impersonator && (
        <div className="bg-amber-500 text-slate-900 px-6 py-2 flex items-center justify-between shadow-lg z-[100] border-b border-amber-600/20">
          <div className="flex items-center space-x-3">
            <span className="animate-pulse text-lg">⚠️</span>
            <p className="text-sm font-black uppercase italic tracking-tighter">
              Impersonation Active: Viewing as <span className="underline">{user?.name}</span>
            </p>
          </div>
          <button 
            onClick={stopImpersonating}
            className="bg-slate-900 text-white px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all active:scale-95"
          >
            Stop Impersonating
          </button>
        </div>
      )}
      
      <div className="flex flex-1 overflow-hidden">
        <aside className="w-64 bg-slate-900 text-white flex flex-col hidden md:flex shrink-0">
          <div className="p-6 flex items-center space-x-3">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center font-bold">D</div>
            <span className="text-xl font-bold tracking-tight uppercase italic">DELIMHUB</span>
          </div>
          
          <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto custom-scrollbar">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-colors ${
                  location.pathname === item.path ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/50' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </Link>
            ))}
          </nav>

          <div className="p-4 border-t border-slate-800">
            <Link to="/profile" className="flex items-center space-x-3 mb-4 p-2 hover:bg-slate-800 rounded-xl transition-colors">
              {user?.avatar ? (
                <img src={user.avatar} className="w-10 h-10 rounded-full object-cover" />
              ) : (
                <div className="w-10 h-10 bg-indigo-500 rounded-full flex items-center justify-center font-bold text-white">
                  {user?.name.charAt(0)}
                </div>
              )}
              <div className="overflow-hidden">
                <p className="text-sm font-semibold truncate">{user?.name}</p>
                <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">{user?.role}</p>
              </div>
            </Link>
            <button onClick={logout} className="flex items-center space-x-2 text-slate-400 hover:text-red-400 transition-colors w-full px-3 py-2">
              <Icons.Logout className="w-5 h-5" />
              <span>Logout</span>
            </button>
          </div>
        </aside>

        <main className="flex-1 flex flex-col min-w-0 bg-slate-50 overflow-hidden">
          <header className="h-16 border-b border-slate-200 bg-white flex items-center justify-between px-8 sticky top-0 z-30 shrink-0">
            <div className="flex items-center space-x-6 flex-1 max-w-2xl">
              <h2 className="text-xl font-bold text-slate-800 hidden lg:block min-w-max">
                {navItems.find(i => i.path === location.pathname)?.label || 'DELIMHUB'}
              </h2>
              <div className="relative w-full max-w-md">
                <input 
                  type="text" 
                  placeholder="Search everything..." 
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 pl-10 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  value={globalSearch}
                  onChange={(e) => setGlobalSearch(e.target.value)}
                />
                <svg className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
              </div>
            </div>
            <div className="flex items-center space-x-3 ml-4">
              {(user?.role === UserRole.ADMIN) && (
                <button onClick={() => navigate('/projects?action=new-project')} className="hidden sm:flex bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded-lg text-sm font-bold items-center space-x-2 transition-all active:scale-95">
                  <Icons.Plus className="w-4 h-4" />
                  <span>Project</span>
                </button>
              )}
              <button onClick={() => navigate('/projects?action=new-task')} className="hidden sm:flex bg-slate-800 hover:bg-slate-900 text-white px-3 py-1.5 rounded-lg text-sm font-bold items-center space-x-2 transition-all active:scale-95">
                <Icons.Plus className="w-4 h-4" />
                <span>Task</span>
              </button>
              <div className="h-8 w-px bg-slate-200 mx-1"></div>
              <button onClick={() => setShowNotifications(!showNotifications)} className="relative p-2 text-slate-500 hover:bg-slate-100 rounded-full transition-colors">
                <Icons.Notification className="w-6 h-6" />
                {unreadCount > 0 && <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[9px] flex items-center justify-center rounded-full border-2 border-white font-bold">{unreadCount}</span>}
              </button>
            </div>
          </header>

          <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
            {children}
          </div>
          {showNotifications && <NotificationsPanel onClose={() => setShowNotifications(false)} />}
        </main>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [impersonator, setImpersonator] = useState<User | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [teamMembers, setTeamMembers] = useState<User[]>([DEFAULT_ADMIN]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [documents, setDocuments] = useState<DocType[]>([]);
  const [globalSearch, setGlobalSearch] = useState('');
  const [isReady, setIsReady] = useState(false);

  // Load state from localStorage
  useEffect(() => {
    const getData = (key: string) => {
      const saved = localStorage.getItem(key);
      return saved ? JSON.parse(saved) : null;
    };

    const savedUser = getData('delimhub_user');
    const savedImpersonator = getData('delimhub_impersonator');
    const savedMessages = getData('delimhub_messages');
    const savedTeam = getData('delimhub_team');
    const savedProjects = getData('delimhub_projects');
    const savedTasks = getData('delimhub_tasks');
    const savedDocs = getData('delimhub_docs');
    
    if (savedImpersonator) setImpersonator(savedImpersonator);
    if (savedUser) setUser(savedUser);
    if (savedMessages) setMessages(savedMessages);
    if (savedTeam) setTeamMembers(savedTeam);
    if (savedProjects) setProjects(savedProjects);
    if (savedTasks) setTasks(savedTasks);
    if (savedDocs) setDocuments(savedDocs);

    setIsReady(true);
  }, []);

  // Sync state to localStorage
  useEffect(() => {
    if (isReady) {
      localStorage.setItem('delimhub_messages', JSON.stringify(messages));
      localStorage.setItem('delimhub_team', JSON.stringify(teamMembers));
      localStorage.setItem('delimhub_projects', JSON.stringify(projects));
      localStorage.setItem('delimhub_tasks', JSON.stringify(tasks));
      localStorage.setItem('delimhub_docs', JSON.stringify(documents));
    }
  }, [messages, teamMembers, projects, tasks, documents, isReady]);

  const handleSetUser = (u: User | null) => {
    setUser(u);
    if (u) {
      localStorage.setItem('delimhub_user', JSON.stringify(u));
      setTeamMembers(prev => prev.map(m => m.id === u.id ? { ...u, isOnline: true } : m));
    } else {
      localStorage.removeItem('delimhub_user');
      localStorage.removeItem('delimhub_impersonator');
      setImpersonator(null);
    }
  };

  const impersonateUser = (target: User) => {
    if (!user) return;
    const currentAdmin = impersonator || user;
    localStorage.setItem('delimhub_impersonator', JSON.stringify(currentAdmin));
    setImpersonator(currentAdmin);
    setUser(target);
    localStorage.setItem('delimhub_user', JSON.stringify(target));
  };

  const stopImpersonating = () => {
    if (!impersonator) return;
    setUser(impersonator);
    localStorage.setItem('delimhub_user', JSON.stringify(impersonator));
    localStorage.removeItem('delimhub_impersonator');
    setImpersonator(null);
  };

  const logout = () => handleSetUser(null);

  if (!isReady) return <div className="h-screen flex items-center justify-center">Initializing Hub...</div>;

  return (
    <AppContext.Provider value={{ 
      user, 
      setUser: handleSetUser, 
      impersonator,
      impersonateUser,
      stopImpersonating,
      projects, 
      setProjects, 
      tasks, 
      setTasks, 
      teamMembers, 
      setTeamMembers, 
      messages, 
      setMessages, 
      notifications, 
      setNotifications, 
      documents, 
      setDocuments, 
      logout, 
      globalSearch, 
      setGlobalSearch 
    }}>
      <Router>
        {!user ? (
          <Routes>
            <Route path="/auth" element={<Auth />} />
            <Route path="*" element={<Navigate to="/auth" />} />
          </Routes>
        ) : (
          <Layout>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/projects" element={<Projects />} />
              <Route path="/kanban" element={<Kanban />} />
              <Route path="/chat" element={<ChatRoom />} />
              <Route path="/team" element={<Team />} />
              <Route path="/documents" element={<Documents />} />
              <Route path="/reports" element={<Reports />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </Layout>
        )}
      </Router>
    </AppContext.Provider>
  );
};

export default App;

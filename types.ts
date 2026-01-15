
export enum UserRole {
  ADMIN = 'ADMIN',
  MEMBER = 'MEMBER'
}

export interface User {
  id: string;
  name: string;
  email: string;
  password?: string; // Added for administrative management
  role: UserRole;
  companyId: string;
  position: string;
  avatar?: string;
  isOnline?: boolean;
}

export interface Company {
  id: string;
  name: string;
}

export enum TaskStatus {
  TODO = 'TODO',
  IN_PROGRESS = 'IN_PROGRESS',
  REVIEW = 'REVIEW',
  DONE = 'DONE'
}

export enum TaskPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH'
}

export interface Task {
  id: string;
  projectId: string;
  title: string;
  description: string;
  assignedTo: string[]; 
  status: TaskStatus;
  dueDate: string;
  createdAt: string;
  priority: TaskPriority;
  reminderBefore?: number;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  companyId: string;
  managerId: string;
  createdAt: string;
  priority: TaskPriority;
}

export interface Attachment {
  name: string;
  url: string;
  type: 'image' | 'video' | 'file';
}

export interface Message {
  id: string;
  projectId?: string;
  senderId: string;
  receiverId?: string;
  senderName: string;
  text: string;
  timestamp: string;
  attachment?: Attachment;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  content: string;
  read: boolean;
  timestamp: string;
}

export interface Document {
  id: string;
  name: string;
  projectId: string;
  taskId?: string;
  uploadedBy: string;
  uploadedAt: string;
  fileType: string;
}

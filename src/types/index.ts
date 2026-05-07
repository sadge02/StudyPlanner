/**
 * StudyPlanner Type Definitions
 * Generated from Prisma schema with additional derived types for the application
 */

// ==========================================
// NEXTAUTH.JS TYPES
// ==========================================

export interface Account {
  id: string;
  userId: string;
  type: string;
  provider: string;
  providerAccountId: string;
  refresh_token: string | null;
  access_token: string | null;
  expires_at: number | null;
  token_type: string | null;
  scope: string | null;
  id_token: string | null;
  session_state: string | null;
}

export interface Session {
  id: string;
  sessionToken: string;
  userId: string;
  expires: Date;
}

export interface VerificationToken {
  identifier: string;
  token: string;
  expires: Date;
}

export interface User {
  id: string;
  name: string | null;
  email: string | null;
  emailVerified: Date | null;
  image: string | null;
  password: string | null;
  darkMode: boolean;
}

// ==========================================
// STUDYPLANNER CORE TYPES
// ==========================================

export interface Project {
  id: string;
  name: string;
  description: string | null;
  createdAt: Date;
  updatedAt: Date;
  inviteCode: string;
}

export type ProjectRole = "ADMIN" | "MEMBER";

export interface ProjectMember {
  id: string;
  userId: string;
  projectId: string;
  role: ProjectRole;
  joinedAt: Date;
}

export interface Subject {
  id: string;
  name: string;
  credits: number | null;
  color: string | null;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

export type TaskPriority = "LOW" | "MEDIUM" | "HIGH";

export interface Task {
  id: string;
  title: string;
  description: string | null;
  status: string;
  priority: TaskPriority;
  deadline: Date | null;
  userId: string;
  projectId: string | null;
  subjectId: string | null;
  parentId: string | null;
}

export interface Event {
  id: string;
  title: string;
  description: string | null;
  startTime: Date;
  endTime: Date;
  isRecurring: boolean;
  recurrenceRule: string | null;
  userId: string;
  subjectId: string | null;
}

export interface Note {
  id: string;
  title: string;
  content: string | null;
  fileUrl: string | null;
  userId: string;
  subjectId: string | null;
  projectId: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface StudySession {
  id: string;
  startTime: Date;
  endTime: Date | null;
  duration: number | null;
  userId: string;
  subjectId: string | null;
  taskId: string | null;
}

// ==========================================
// DERIVED TYPES (with relations)
// ==========================================

export interface UserWithAccounts extends User {
  accounts: Account[];
}

export interface UserWithSessions extends User {
  sessions: Session[];
}

export interface UserWithRelations extends User {
  accounts: Account[];
  sessions: Session[];
  subjects: Subject[];
  tasks: Task[];
  events: Event[];
  notes: Note[];
  projectMembers: ProjectMember[];
  studySessions: StudySession[];
}

export interface ProjectWithMembers extends Project {
  members: (ProjectMember & { user: User })[];
}

export interface ProjectWithTasks extends Project {
  tasks: (Task & { subject: Subject | null })[];
}

export interface ProjectWithNotes extends Project {
  notes: (Note & { user: User })[];
}

export interface ProjectWithRelations extends Project {
  members: (ProjectMember & { user: User })[];
  tasks: (Task & { subject: Subject | null })[];
  notes: (Note & { user: User })[];
}

export interface ProjectTimelineTask {
  id: string;
  title: string;
  description: string | null;
  status: string;
  priority: TaskPriority;
  startTime: Date;
  endTime: Date;
  isProxyRange: boolean;
  subject: Subject | null;
}

export interface ProjectOverview extends Project {
  role: ProjectRole;
  members: (ProjectMember & { user: User })[];
  tasks: ProjectTimelineTask[];
}

export interface SubjectWithTasks extends Subject {
  tasks: Task[];
}

export interface SubjectWithEvents extends Subject {
  events: Event[];
}

export interface SubjectWithNotes extends Subject {
  notes: Note[];
}

export interface SubjectWithSessions extends Subject {
  studySessions: StudySession[];
}

export interface SubjectWithRelations extends Subject {
  tasks: Task[];
  events: Event[];
  notes: Note[];
  studySessions: StudySession[];
}

export interface TaskWithSubject extends Task {
  subject: Subject | null;
}

export interface TaskWithProject extends Task {
  project: Project | null;
}

export interface TaskWithSubtasks extends Task {
  subTasks: Task[];
  parentTask: Task | null;
}

export interface TaskWithSessions extends Task {
  studySessions: StudySession[];
}

export interface TaskWithRelations extends Task {
  subject: Subject | null;
  project: Project | null;
  subTasks: Task[];
  parentTask: Task | null;
  studySessions: StudySession[];
}

export interface EventWithSubject extends Event {
  subject: Subject | null;
}

export interface NoteWithSubject extends Note {
  subject: Subject | null;
}

export interface NoteWithProject extends Note {
  project: Project | null;
}

export interface NoteWithRelations extends Note {
  subject: Subject | null;
  project: Project | null;
}

export interface StudySessionWithSubject extends StudySession {
  subject: Subject | null;
}

export interface StudySessionWithTask extends StudySession {
  task: Task | null;
}

export interface StudySessionWithRelations extends StudySession {
  subject: Subject | null;
  task: Task | null;
}

export interface ProjectMemberWithUser extends ProjectMember {
  user: User;
}

export interface ProjectMemberWithProject extends ProjectMember {
  project: Project;
}

export interface ProjectMemberWithRelations extends ProjectMember {
  user: User;
  project: Project;
}

// ==========================================
// API RESPONSE TYPES
// ==========================================

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// ==========================================
// FORM TYPES
// ==========================================

export interface CreateTaskInput {
  title: string;
  description?: string;
  priority: TaskPriority;
  deadline?: Date;
  subjectId?: string;
  projectId?: string;
  parentId?: string;
}

export interface UpdateTaskInput extends Partial<CreateTaskInput> {
  id: string;
  status?: string;
}

export interface CreateSubjectInput {
  name: string;
  credits?: number;
  color?: string;
}

export interface UpdateSubjectInput extends Partial<CreateSubjectInput> {
  id: string;
}

export interface CreateProjectInput {
  name: string;
  description?: string;
}

export interface UpdateProjectInput extends Partial<CreateProjectInput> {
  id: string;
}

export interface CreateEventInput {
  title: string;
  description?: string;
  startTime: Date;
  endTime: Date;
  isRecurring: boolean;
  recurrenceRule?: string;
  subjectId?: string;
}

export interface UpdateEventInput extends Partial<CreateEventInput> {
  id: string;
}

export interface CreateNoteInput {
  title: string;
  content?: string;
  fileUrl?: string;
  subjectId?: string;
  projectId?: string;
}

export interface UpdateNoteInput extends Partial<CreateNoteInput> {
  id: string;
}

export interface CreateStudySessionInput {
  startTime: Date;
  subjectId?: string;
  taskId?: string;
}

export interface UpdateStudySessionInput {
  id: string;
  endTime: Date;
}

export interface InviteProjectMemberInput {
  projectId: string;
  userEmail: string;
  role: ProjectRole;
}

export interface UpdateProjectMemberRoleInput {
  projectMemberId: string;
  role: ProjectRole;
}

// ==========================================
// UTILITY TYPES
// ==========================================

export type TaskStatus = "TODO" | "IN_PROGRESS" | "DONE" | "BLOCKED";

export interface TaskWithDuration extends Task {
  duration?: number;
}

export interface UpcomingEvent extends Event {
  timeUntilStart: number;
  isToday: boolean;
}

export interface StudyStats {
  totalHours: number;
  sessionsCount: number;
  averageSessionDuration: number;
  bySubject: Record<string, number>;
}

export interface Dashboard {
  upcomingEvents: UpcomingEvent[];
  todaysTasks: Task[];
  totalTasks: number;
  completedTasks: number;
  studyStats: StudyStats;
}

export type KanbanColumn = {
  id: string;
  title: string;
};

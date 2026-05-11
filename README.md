<div align="left">
  <h1>StudyPlanner</h1>

StudyPlanner is an academic management web application designed to organize your semester and daily workflow. By streamlining subject administration, assignment tracking, collaborative projects, and file management, StudyPlanner intuitively visualizes your academic life to help you perform at your best.

---

## Core Features

### Subject & Task Management

- **Academic Subjects**: Create and manage your university courses with custom colors and credits.
- **Task System**: Create tasks with detailed descriptions, priorities (LOW/MEDIUM/HIGH), deadlines, status tracking (TODO/IN_PROGRESS/DONE), and optional sub-tasks. Tasks can be associated with specific subjects or stand independently.
- **Notes & File Storage**: Full-featured notes tab with support for file uploads (PDF, DOC, DOCX, PPT, images, and more) via UploadThing. Organize notes into subject folders with drag-and-drop reordering.

### Interactive Dashboard

- **Today's Board**: Personalized view showing tasks due today with quick status toggles.
- **Kanban Board**: Trello-like drag-and-drop task board with three fixed columns (TODO -> In Progress -> Done) for visual task management.
- **General TODOs**: Quick add widget for miscellaneous tasks.
- **Next Class Indicator**: Real-time display of your upcoming schedule.

### Academic Timetable & Calendar

- **Event Scheduling**: Support for one-time events (exams, deadlines) and recurring events (weekly lectures, seminars) using iCal-style recurrence rules.
- **Multi-View Calendar**: Full calendar integration powered by `react-big-calendar` showing tasks, deadlines, and events in a familiar monthly/weekly view.

### Collaboration & Projects

- **Group Projects**: Create shared project workspaces with admin/member roles.
- **Invite System**: Generate unique invite codes to add team members to your projects.
- **Shared Kanban**: Collaborate on tasks with team members in a shared Kanban view.
- **Project Timeline**: Visual Gantt-style timeline of project tasks and deadlines.

### Analytics & Study Tracker

- **Study Timer**: Built-in Pomodoro-style timer to track study sessions by subject.
- **Productivity Charts**: Visual breakdown of task completion rates, time spent per subject, and study trends over time.
- **Dark Mode**: Native dark/light mode support with system preference detection.

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 16 (App Router) with React 19 |
| UI Library | shadcn/ui + TailwindCSS v4 |
| State Management | React Server Components + Server Actions |
| Auth | NextAuth.js v5 (Credentials + OAuth: Google, GitHub) |
| Database | PostgreSQL + Prisma ORM |
| Forms | React Hook Form + Zod validation |
| File Storage | UploadThing |
| Charts | Recharts |
| Calendar | react-big-calendar + rrule (recurrence) |
| Drag & Drop | @dnd-kit |

---

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v20+ recommended; project uses Next.js 16)
- [PostgreSQL](https://www.postgresql.org/) database (local or cloud provider like Neon, Supabase, Railway)
- [UploadThing](https://uploadthing.com/) account for file uploads (free tier available)

### Installation

Clone and install dependencies:

```bash
git clone https://github.com/sadge02/StudyPlanner.git
cd StudyPlanner
npm install
```

### Environment Configuration

Create a `.env` file based on `.env.example`:

```env
# PostgreSQL Database
DATABASE_URL="postgresql://user:password@localhost:5432/studyplanner?schema=public"

# NextAuth v5
AUTH_URL="http://localhost:3000"
AUTH_SECRET="generate-a-secure-secret-here"

# OAuth Providers (optional for email/password login)
GITHUB_ID="your-github-oauth-id"
GITHUB_SECRET="your-github-oauth-secret"
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# UploadThing (for file uploads in Notes tab)
UPLOADTHING_TOKEN="your-uploadthing-token"
```

**Generate `AUTH_SECRET`**:
```bash
openssl rand -base64 32
```

### Database Setup

Push the Prisma schema to your database:

```bash
npx prisma db push
```

Optionally seed with initial data:

```bash
npm run prisma:seed
```

### Run Development Server

```bash
npm run dev
```

The app will be available at **http://localhost:3000**

### Build for Production

```bash
npm run build
npm run start
```

---

## Project Structure

```
src/
├── app/                      # Next.js App Router
│   ├── (auth)/              # Auth pages (login, register)
│   ├── api/                 # API routes (auth, uploadthing)
│   └── dashboard/           # Main app routes
│       ├── analytics/       # Study charts & timer
│       ├── calendar/        # Calendar view
│       ├── kanban/          # Task board
│       ├── notes/           # Notes & file management
│       ├── projects/        # Shared projects
│       ├── subjects/        # Course management
│       └── tasks/           # Task detail views
│
├── components/
│   ├── ui/                  # shadcn/ui components
│   ├── notes/               # Notes tab components
│   ├── kanban/              # Kanban board
│   ├── calendar/            # Calendar views
│   ├── analytics/           # Charts & timer
│   ├── projects/            # Project components
│   ├── subjects/            # Subject components
│   ├── tasks/               # Task components
│   ├── auth/                # Login/Register forms
│   ├── layout/              # AppShell, Navbar, Sidebar
│   └── providers/           # Theme, Auth providers
│
├── lib/
│   ├── actions/             # Server actions (database mutations)
│   ├── utils/               # Utilities (cn, access helpers)
│   ├── auth.ts               # NextAuth configuration
│   ├── db.ts                 # Prisma client singleton
│   └── uploadthing.ts        # UploadThing utilities
│
├── schemas/                  # Zod validation schemas
└── types/                    # TypeScript type definitions
```

---

## Database Schema

Core entities:

| Model | Description |
|-------|-------------|
| `User` | User profiles with credentials, OAuth links, and preferences (dark mode) |
| `Subject` | University courses with name, credits, color, and user association |
| `Task` | Action items with priority, deadline, status, and optional sub-tasks |
| `Event` | Scheduled events with recurrence rules for lectures/exams |
| `Project` | Shared workspaces with invite codes for collaboration |
| `ProjectMember` | Join table linking users to projects with roles (ADMIN/MEMBER) |
| `Note` | Text notes with optional file attachments via UploadThing |
| `StudySession` | Tracked study sessions with duration and subject association |

Also includes NextAuth.js standard models: `Account`, `Session`, `VerificationToken`.

---

## Authentication

StudyPlanner supports multiple authentication methods:

| Method | Description |
|--------|-------------|
| Email/Password | Traditional signup/login with bcrypt-hashed passwords |
| Google OAuth | Sign in with Google account |
| GitHub OAuth | Sign in with GitHub account |

New users can register directly via the signup form or authenticate through OAuth providers.

---

## Development Commands

| Command | Action |
|---------|--------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run prisma:seed` | Seed database with sample data |
</div>

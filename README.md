<div align="left">
  <h1>StudyPlanner</h1>

**StudyPlanner** is an academic management web application purposefully designed to organize semester and daily workflow. By streamlining subject administration, assignment tracking, and collaborative projects, StudyPlanner intuitively visualizes your academic life to help you perform at your best.

---

## Core Features and Scope

### 1. Subject and Task Management (CRUD)

- **Academic Subjects**: Create and manage courses.
- **Task System**: Create custom tasks with a detailed task view for descriptions, status, and sub-tasks. Association with/without specific subjects.
- **Note & Document Storage**: Integration for note-taking and storage for academic PDFs.

### 2. Interactive Dashboard

- **Personalized Board**: A "Today" board with tasks for that day.
- **Custom Kanban Boards**: A Trello-like drag-and-drop system. Users can define their own columns.
- **General TODOs**: Management of general tasks.

### 3. Advanced Academic Timetable

- **Event Scheduling**: Support for one-time events (exams) and date-range or indefinite recurring events (seminars, lectures).
- **Contextual Awareness**: Real-time "Next Class" indicator on the dashboard.

### 4. Visualization: Calendar & Timeline

- **Multi-View Calendar Interface**: Toggle between a list view and a responsive full-screen calendar to show various tasks and deadlines.
- **Timeline View**: Visual representation of project timelines and tasks.

### 5. Collaboration & Projects

- **Group Projects**: Create specific "Project" entities and invite other users to collaborate.
- **Shared Task Boards**: Work together on group assignments with shared Kanban boards and progress tracking.

### 6. Analytics and Study Tracker

- **Productivity Trends**: Visual breakdown of task completion rates and time spent per subject.
- **Exam Tracking**: Section for exam dates, preparation progress, etc.
- **Study Tracker**: A timer to log study sessions.

---

## Technical Implementation

### Framework and UI

- **Next.js (App Router)**: Utilizing SSR for data-heavy views (Timetable, Projects) and CSR for high-interactivity components (Kanban boards).
- **Styling**: Fully responsive design using **TailwindCSS** for mobile and desktop consistency.
- **Dark Mode**: Native implementation using **next-themes** and **shadcn/ui** components.

### State and Data Management

- **Authentication**: Secure multi-user login and project invitations handled by **NextAuth.js**.
- **Database**: **PostgreSQL** with **Prisma ORM** for relational mapping between Users, Projects, and Tasks.
- **Form Validation**: **React Hook Form** with **Zod** schemas for robust data entry.

### Hosting and Storage

- **Deployment**: Hosted on **Vercel** with a CI/CD pipeline.
- **Storage**: Integration with **UploadThing** or **Supabase Storage** for PDF and document hosting.

---

## Getting Started

### 1. Prerequisites

- [Node.js](https://nodejs.org/) (v20+)
- [PostgreSQL](https://www.postgresql.org/) database (local or cloud like Neon/Supabase)

### 2. Installation

Clone the repository and install the NPM dependencies:

```bash
git clone https://github.com/sadge02/StudyPlanner.git
cd StudyPlanner
npm install
```

### 3. Environment Configuration

Duplicate the `.env.local` or create a new `.env` file containing your database string and NextAuth keys:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/studyplanner"
AUTH_SECRET="generate-a-secure-secret"
GITHUB_ID="oauth-app-client-id"
GITHUB_SECRET="oauth-app-client-secret"
```

### 4. Database Setup

Push the Prisma schema to your PostgreSQL database and generate the TypeScript client:

```bash
npx prisma db push
npx prisma generate
```

### 5. Run the Application

Launch the Next.js development server:

```bash
npm run dev
```

Your app will be available at `http://localhost:3000`.

---

## Database Architecture

| Entity          | Description                                                                 |
| --------------- | --------------------------------------------------------------------------- |
| **`Users`**     | Authenticated profiles, credentials, and app preferences (e.g., dark mode). |
| **`Projects`**  | Collaborative workspaces connecting multiple users.                         |
| **`Subjects`**  | Represents university courses and aggregates their data.                    |
| **`Tasks`**     | Action items with customizable priority, deadlines, and statuses.           |
| **`Events`**    | Time blocks mapped to schedules (lectures, exams).                          |
| **`Notes`**     | Plaintext content and external storage links for class materials.           |
| **`Analytics`** | Logs detailing study sessions, timers, and completion timestamps.           |

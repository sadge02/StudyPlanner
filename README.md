<div align="left">
  <h1>StudyPlanner</h1>

**StudyPlanner** is an academic management web application purposefully designed to organize semester and daily workflow. By streamlining subject administration, assignment tracking, and collaborative projects, StudyPlanner intuitively visualizes your academic life to help you perform at your best.

---

## Core Features and Scope

### 1. Subject and Task Management (CRUD)
- **Academic Subjects**: Create and manage courses.
- **Task System**: Create custom tasks with a detailed task view for descriptions, status, and priority. Association with or without specific subjects.
- **Note & Document Storage**: Integration for note-taking and robust cloud storage for academic PDFs via UploadThing.

### 2. Interactive Dashboard
- **Personalized Board**: A "Today" board outlining all tasks and events for the day.
- **Custom Kanban Boards**: A Trello-like drag-and-drop system. Users can define their own workflows and track task statuses dynamically.
- **General TODOs**: Management and overview of general tasks.

### 3. Advanced Academic Timetable
- **Event Scheduling**: Support for one-time events (exams) and date-range or indefinite recurring events (seminars, lectures, office hours).
- **Contextual Awareness**: Real-time "Next Class" indicator on the dashboard to keep you on schedule.

### 4. Visualization: Calendar & Timeline
- **Multi-View Calendar Interface**: Toggle between a timeline view and a responsive full-screen calendar to show various tasks, classes, and deadlines.
- **Timeline View**: Visual representation of project timelines and upcoming assignments.

### 5. Collaboration & Projects
- **Group Projects**: Create specific "Project" entities and invite other users to collaborate via unique invite codes.
- **Shared Task Boards**: Work together on group assignments with shared Kanban boards, deadlines, and task ownership.

### 6. Analytics and Study Tracker
- **Productivity Trends**: Visual breakdown of task completion rates and time spent per subject.
- **Study Tracker**: A built-in pomodoro-style timer to log study sessions and track efficiency.

---

## Technical Implementation

### Framework and UI
- **Next.js (App Router)**: Utilizing SSR for optimal data-fetching and CSR for high-interactivity components (Kanban boards, Timers).
- **Styling**: Fully responsive design using **TailwindCSS** for mobile and desktop consistency.
- **Components**: Pre-built accessible components heavily utilizing **shadcn/ui** and **Lucide Icons**.
- **Themes**: Native dark/light mode implementation using **next-themes**.

### State and Data Management
- **Authentication**: Secure multi-user login, credentials handling, and session management powered by **Auth.js (NextAuth v5)**.
- **Database**: **PostgreSQL** configured with **Prisma ORM** for relational mapping between Users, Projects, Subjects, Tasks, and Events.
- **Form Validation**: Client and server-side validation using **React Hook Form** paired with **Zod** schema parsing.

### Hosting and Storage
- **Deployment**: Hosted and optimized for **Vercel** with a CI/CD pipeline.
- **Storage**: Secure file uploads and avatar hosting managed explicitly via **UploadThing**.

---

## Getting Started

### 1. Prerequisites
- [Node.js](https://nodejs.org/) (v20+)
- [PostgreSQL](https://www.postgresql.org/) database (local, or cloud-hosted via Neon/Supabase)

### 2. Installation

Clone the repository and install the NPM dependencies:

```bash
git clone https://github.com/sadge02/StudyPlanner.git
cd StudyPlanner
npm install
```

### 3. Environment Configuration

Duplicate the `.env.example` file and create a new `.env` file containing your database string, upload bucket credentials, and NextAuth keys:

```env
# PostgreSQL Database Connection
DATABASE_URL="postgresql://user:password@localhost:5432/studyplanner?schema=public"

# Auth.js / NextAuth v5 Configuration
AUTH_URL="http://localhost:3000"
AUTH_SECRET="generate-a-random-secret-here-via-openssl-rand-base64-32"

# OAuth Providers (Optional)
GITHUB_ID="your-github-oauth-id"
GITHUB_SECRET="your-github-oauth-secret"
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# UploadThing
UPLOADTHING_TOKEN="your-uploadthing-token"
```

### 4. Database Setup & Seeding

Push the Prisma schema to your PostgreSQL database to generate the necessary tables and typing:

```bash
npx prisma db push
```

We have included a comprehensive seed script that populates the database with dummy users, subjects, interactive group projects, recurring events, and tasks across different statuses to test the app out-of-the-box. Run the seed command:

```bash
npm run prisma:seed
```
*Note: The demo user credentials are `demo@studyplanner.app` with the password `password123`.*

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
| **`User`**      | Authenticated profiles, credentials, and app preferences (e.g., dark mode). |
| **`Project`**   | Collaborative workspaces connecting multiple users via unique invite codes. |
| **`Subject`**   | Represents university courses and aggregates their related data.            |
| **`Task`**      | Action items with customizable priority, deadlines, and statuses.           |
| **`Event`**     | Time blocks mapped to schedules (lectures, exams), supports recurrence.     |
| **`Note`**      | Content and external UploadThing storage links for class materials.         |
| **`Analytics`** | Logs detailing study sessions, timers, and completion timestamps.           |
</div>

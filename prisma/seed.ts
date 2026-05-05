import { PrismaClient, TaskPriority } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

type TaskParam = {
  title: string;
  status: string;
  priority: TaskPriority;
  subjectId?: string;
  projectId?: string;
  daysOffset?: number;
};

async function main() {
  console.log("Start seeding...");

  // Prevent destructive seeding in production without explicit flag
  if (process.env.NODE_ENV === "production" && process.env.ALLOW_DESTRUCTIVE_SEED !== "true") {
    console.warn("Production environment detected. Skipping seed to prevent data loss. Provide ALLOW_DESTRUCTIVE_SEED=true to override.");
    return;
  }

  // 1. Create Demo User safely via upsert (does not delete existing data)
  console.log("Creating/Updating demo user...");
  const hashedPassword = await bcrypt.hash("password123", 10);

  const demoUser = await prisma.user.upsert({
    where: { email: "demo@studyplanner.app" },
    update: {},
    create: {
      name: "Jane Doe",
      email: "demo@studyplanner.app",
      password: hashedPassword,
      darkMode: true,
      emailVerified: new Date(),
    },
  });

  const alternateUser = await prisma.user.upsert({
    where: { email: "john@studyplanner.app" },
    update: {},
    create: {
      name: "John Smith",
      email: "john@studyplanner.app",
      password: hashedPassword,
      emailVerified: new Date(),
    },
  });

  // 2. Create Subjects
  console.log("Creating subjects...");
  
  let cs101 = await prisma.subject.findFirst({ where: { name: "Intro to Computer Science", userId: demoUser.id } });
  if (!cs101) {
    cs101 = await prisma.subject.create({
      data: { name: "Intro to Computer Science", credits: 3, color: "#4285F4", userId: demoUser.id },
    });
  }

  let math201 = await prisma.subject.findFirst({ where: { name: "Advanced Calculus", userId: demoUser.id } });
  if (!math201) {
    math201 = await prisma.subject.create({
      data: { name: "Advanced Calculus", credits: 4, color: "#EA4335", userId: demoUser.id },
    });
  }

  let phys101 = await prisma.subject.findFirst({ where: { name: "Physics I", userId: demoUser.id } });
  if (!phys101) {
    phys101 = await prisma.subject.create({
      data: { name: "Physics I", credits: 4, color: "#34A853", userId: demoUser.id },
    });
  }

  // 3. Create Group Project safely
  console.log("Creating projects...");
  let seniorProject = await prisma.project.findFirst({ where: { name: "Senior Design Alpha" } });
  if (!seniorProject) {
    seniorProject = await prisma.project.create({
      data: {
        name: "Senior Design Alpha",
        description: "Building the next-gen study application.",
        members: {
          create: [
            { userId: demoUser.id, role: "ADMIN" },
            { userId: alternateUser.id, role: "MEMBER" },
          ],
        },
      },
    });
  }

  // 4. Create Tasks
  console.log("Creating tasks...");
  const today = new Date();

  const tasksParams: TaskParam[] = [
    { title: "Read Chapter 1", status: "DONE", priority: TaskPriority.LOW, subjectId: cs101.id },
    { title: "Complete Lab 1", status: "DONE", priority: TaskPriority.MEDIUM, subjectId: cs101.id },
    { title: "Start Essay Draft", status: "IN_PROGRESS", priority: TaskPriority.MEDIUM, subjectId: cs101.id },
    { title: "Submit Assignment 2", status: "TODO", priority: TaskPriority.HIGH, subjectId: math201.id, daysOffset: 1 },
    { title: "Study for Midterm", status: "TODO", priority: TaskPriority.HIGH, subjectId: phys101.id, daysOffset: 3 },
    { title: "Buy Physics Textbook", status: "BLOCKED", priority: TaskPriority.MEDIUM, subjectId: phys101.id },
    { title: "Review Calculus formulas", status: "IN_PROGRESS", priority: TaskPriority.LOW, subjectId: math201.id },
    { title: "Find presentation partner", status: "TODO", priority: TaskPriority.MEDIUM, subjectId: cs101.id },
    { title: "Project: DB Schema Outline", status: "DONE", priority: TaskPriority.HIGH, projectId: seniorProject.id },
    { title: "Project: API Planning", status: "IN_PROGRESS", priority: TaskPriority.HIGH, projectId: seniorProject.id },
    { title: "Draft final project report", status: "TODO", priority: TaskPriority.MEDIUM, projectId: seniorProject.id, daysOffset: 14 },
  ];

  for (const t of tasksParams) {
    const exists = await prisma.task.findFirst({ where: { title: t.title, userId: demoUser.id } });
    if (!exists) {
      await prisma.task.create({
        data: {
          title: t.title,
          status: t.status,
          priority: t.priority,
          userId: demoUser.id,
          subjectId: t.subjectId,
          projectId: t.projectId,
          deadline: t.daysOffset ? new Date(today.getTime() + t.daysOffset * 24 * 60 * 60 * 1000) : undefined,
        },
      });
    }
  }

  // 5. Create Events
  console.log("Creating events...");

  const midtermStart = new Date(today);
  midtermStart.setDate(today.getDate() + 3);
  midtermStart.setHours(14, 0, 0, 0);
  const midtermEnd = new Date(midtermStart);
  midtermEnd.setHours(16, 0, 0, 0);

  const existingMidterm = await prisma.event.findFirst({ where: { title: "Physics Midterm Exam", userId: demoUser.id } });
  if (!existingMidterm) {
    await prisma.event.create({
      data: {
        title: "Physics Midterm Exam",
        description: "Room 302 in STEM Building",
        startTime: midtermStart,
        endTime: midtermEnd,
        isRecurring: false,
        userId: demoUser.id,
        subjectId: phys101.id,
      },
    });
  }

  const lectureStart = new Date(today);
  lectureStart.setDate(today.getDate() + 1);
  lectureStart.setHours(10, 0, 0, 0);
  const lectureEnd = new Date(lectureStart);
  lectureEnd.setHours(11, 30, 0, 0);

  const existingLecture = await prisma.event.findFirst({ where: { title: "CS101 Lecture", userId: demoUser.id } });
  if (!existingLecture) {
    await prisma.event.create({
      data: {
        title: "CS101 Lecture",
        description: "Main Hall Auditorium",
        startTime: lectureStart,
        endTime: lectureEnd,
        isRecurring: true,
        recurrenceRule: "FREQ=WEEKLY;UNTIL=20261231T235959Z",
        userId: demoUser.id,
        subjectId: cs101.id,
      },
    });
  }

  const seminarStart = new Date(today);
  seminarStart.setDate(today.getDate() + 2);
  seminarStart.setHours(16, 0, 0, 0);
  const seminarEnd = new Date(seminarStart);
  seminarEnd.setHours(17, 0, 0, 0);

  const existingSeminar = await prisma.event.findFirst({ where: { title: "Math 201 Seminar", userId: demoUser.id } });
  if (!existingSeminar) {
    await prisma.event.create({
      data: {
        title: "Math 201 Seminar",
        description: "Room 105",
        startTime: seminarStart,
        endTime: seminarEnd,
        isRecurring: true,
        recurrenceRule: "FREQ=WEEKLY;BYDAY=TU,TH",
        userId: demoUser.id,
        subjectId: math201.id,
      },
    });
  }

  const meetingStart = new Date(today);
  meetingStart.setHours(18, 0, 0, 0);
  const meetingEnd = new Date(meetingStart);
  meetingEnd.setHours(19, 0, 0, 0);

  const existingSync = await prisma.event.findFirst({ where: { title: "Senior Project Sync", userId: demoUser.id } });
  if (!existingSync) {
    await prisma.event.create({
      data: {
        title: "Senior Project Sync",
        description: "Zoom Link: https://zoom.us/j/123456789",
        startTime: meetingStart,
        endTime: meetingEnd,
        isRecurring: true,
        recurrenceRule: "FREQ=WEEKLY;BYDAY=WE",
        userId: demoUser.id,
      },
    });
  }

  const officeHoursStart = new Date(today);
  officeHoursStart.setDate(today.getDate() - 1);
  officeHoursStart.setHours(13, 0, 0, 0);
  const officeHoursEnd = new Date(officeHoursStart);
  officeHoursEnd.setHours(15, 0, 0, 0);

  const existingOffice = await prisma.event.findFirst({ where: { title: "CS101 Office Hours", userId: demoUser.id } });
  if (!existingOffice) {
    await prisma.event.create({
      data: {
        title: "CS101 Office Hours",
        description: "Ask questions about Lab 1",
        startTime: officeHoursStart,
        endTime: officeHoursEnd,
        isRecurring: false,
        userId: demoUser.id,
        subjectId: cs101.id,
      },
    });
  }

  console.log("Seeding finished.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

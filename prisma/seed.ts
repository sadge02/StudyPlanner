import { PrismaClient, TaskPriority } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Start seeding...");

  // 1. Clean existing database
  console.log("Cleaning existing data...");
  await prisma.projectMember.deleteMany();
  await prisma.event.deleteMany();
  await prisma.task.deleteMany();
  await prisma.note.deleteMany();
  await prisma.subject.deleteMany();
  await prisma.project.deleteMany();
  await prisma.user.deleteMany();

  // 2. Create Demo User
  console.log("Creating demo user...");
  const hashedPassword = await bcrypt.hash("password123", 10);

  const demoUser = await prisma.user.create({
    data: {
      name: "Jane Doe",
      email: "demo@studyplanner.app",
      password: hashedPassword,
      darkMode: true,
      emailVerified: new Date(),
    },
  });

  const alternateUser = await prisma.user.create({
    data: {
      name: "John Smith",
      email: "john@studyplanner.app",
      password: hashedPassword,
      emailVerified: new Date(),
    },
  });

  // 3. Create Subjects
  console.log("Creating subjects...");
  const cs101 = await prisma.subject.create({
    data: {
      name: "Intro to Computer Science",
      credits: 3,
      color: "#4285F4",
      userId: demoUser.id,
    },
  });

  const math201 = await prisma.subject.create({
    data: {
      name: "Advanced Calculus",
      credits: 4,
      color: "#EA4335",
      userId: demoUser.id,
    },
  });

  const phys101 = await prisma.subject.create({
    data: {
      name: "Physics I",
      credits: 4,
      color: "#34A853",
      userId: demoUser.id,
    },
  });

  // 4. Create Group Project for Collaboration Features
  console.log("Creating projects...");
  const seniorProject = await prisma.project.create({
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

  // 5. Create Tasks with Mixed Statuses and Priorities
  console.log("Creating tasks...");
  const today = new Date();

  const tasksParams = [
    {
      title: "Read Chapter 1",
      status: "DONE",
      priority: TaskPriority.LOW,
      subjectId: cs101.id,
    },
    {
      title: "Complete Lab 1",
      status: "DONE",
      priority: TaskPriority.MEDIUM,
      subjectId: cs101.id,
    },
    {
      title: "Start Essay Draft",
      status: "IN_PROGRESS",
      priority: TaskPriority.MEDIUM,
      subjectId: cs101.id,
    },
    {
      title: "Submit Assignment 2",
      status: "TODO",
      priority: TaskPriority.HIGH,
      subjectId: math201.id,
      daysOffset: 1,
    },
    {
      title: "Study for Midterm",
      status: "TODO",
      priority: TaskPriority.HIGH,
      subjectId: phys101.id,
      daysOffset: 3,
    },
    {
      title: "Buy Physics Textbook",
      status: "BLOCKED",
      priority: TaskPriority.MEDIUM,
      subjectId: phys101.id,
    },
    {
      title: "Review Calculus formulas",
      status: "IN_PROGRESS",
      priority: TaskPriority.LOW,
      subjectId: math201.id,
    },
    {
      title: "Find presentation partner",
      status: "TODO",
      priority: TaskPriority.MEDIUM,
      subjectId: cs101.id,
    },
    {
      title: "Project: DB Schema Outline",
      status: "DONE",
      priority: TaskPriority.HIGH,
      projectId: seniorProject.id,
    },
    {
      title: "Project: API Planning",
      status: "IN_PROGRESS",
      priority: TaskPriority.HIGH,
      projectId: seniorProject.id,
    },
    {
      title: "Draft final project report",
      status: "TODO",
      priority: TaskPriority.MEDIUM,
      projectId: seniorProject.id,
      daysOffset: 14,
    },
  ];

  for (const t of tasksParams) {
    await prisma.task.create({
      data: {
        title: t.title,
        status: t.status,
        priority: t.priority,
        userId: demoUser.id,
        subjectId: t.subjectId,
        projectId: t.projectId,
        deadline: t.daysOffset
          ? new Date(today.getTime() + t.daysOffset * 24 * 60 * 60 * 1000)
          : undefined,
      },
    });
  }

  // 6. Create Events (One-time and Recurring)
  console.log("Creating events...");

  // A. One-time Event: Midterm
  const midtermStart = new Date(today);
  midtermStart.setDate(today.getDate() + 3);
  midtermStart.setHours(14, 0, 0, 0);
  const midtermEnd = new Date(midtermStart);
  midtermEnd.setHours(16, 0, 0, 0);

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

  // B. Recurring Event: Weekly Lecture
  const lectureStart = new Date(today);
  lectureStart.setDate(today.getDate() + 1);
  lectureStart.setHours(10, 0, 0, 0);
  const lectureEnd = new Date(lectureStart);
  lectureEnd.setHours(11, 30, 0, 0);

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

  // C. Recurring Event: Weekly Seminar
  const seminarStart = new Date(today);
  seminarStart.setDate(today.getDate() + 2);
  seminarStart.setHours(16, 0, 0, 0);
  const seminarEnd = new Date(seminarStart);
  seminarEnd.setHours(17, 0, 0, 0);

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

  // D. Event: Group Project Meeting
  const meetingStart = new Date(today);
  meetingStart.setHours(18, 0, 0, 0);
  const meetingEnd = new Date(meetingStart);
  meetingEnd.setHours(19, 0, 0, 0);

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

  // E. One-time Event: Office Hours
  const officeHoursStart = new Date(today);
  officeHoursStart.setDate(today.getDate() - 1);
  officeHoursStart.setHours(13, 0, 0, 0);
  const officeHoursEnd = new Date(officeHoursStart);
  officeHoursEnd.setHours(15, 0, 0, 0);

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

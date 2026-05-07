"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function updateUserDarkMode(darkMode: boolean) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  await prisma.user.update({
    where: { id: session.user.id },
    data: { darkMode },
  });

  return { ok: true as const };
}

"use server";

import { prisma } from "../db";
import bcrypt from "bcryptjs";
import { registerSchema } from "@/schemas/auth.schema";
import { signIn } from "../auth";
import { AuthError } from "next-auth";

export async function registerUser(_prevState: unknown, formData: FormData) {
  try {
    const rawData = Object.fromEntries(formData.entries());
    const validatedData = registerSchema.safeParse(rawData);

    if (!validatedData.success) {
      return {
        error: validatedData.error.flatten().fieldErrors,
        message: "Invalid input data",
      };
    }

    const { name, email, password } = validatedData.data;

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return { message: "User with this email already exists" };
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await prisma.user.create({
      data: {
        name: name,
        email: email,
        password: hashedPassword,
      },
    });

    return { success: true };
  } catch (error) {
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === "P2002"
    ) {
      return { message: "User with this email already exists" };
    }
    return { message: "Internal server error" };
  }
}

export async function loginUser(_prevState: unknown, formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!email || !password) {
    return { message: "Email and password are required" };
  }

  try {
    await signIn("credentials", {
      email,
      password,
      redirect: false,
    });
    return { success: true };
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return { message: "Invalid credentials." };
        default:
          return { message: "Something went wrong." };
      }
    }
    throw error;
  }
}

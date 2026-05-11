import NextAuth from "next-auth";
import authConfig from "./auth.config";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "./db";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  callbacks: {
    ...authConfig.callbacks,
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.sub = user.id!;
        const u = user as { darkMode?: boolean };
        token.darkMode = typeof u.darkMode === "boolean" ? u.darkMode : false;
      }
      if (trigger === "update" && session) {
        const patch = session as {
          user?: { darkMode?: boolean };
          darkMode?: unknown;
        };
        if (typeof patch.user?.darkMode === "boolean") {
          token.darkMode = patch.user.darkMode;
        } else if (typeof patch.darkMode === "boolean") {
          token.darkMode = patch.darkMode;
        }
      }
      if (token.sub && typeof token.darkMode !== "boolean") {
        const u = await prisma.user.findUnique({
          where: { id: token.sub },
          select: { darkMode: true },
        });
        token.darkMode = u?.darkMode ?? false;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        if (token.sub) {
          session.user.id = token.sub;
        }
        session.user.darkMode =
          typeof token.darkMode === "boolean" ? token.darkMode : false;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  providers: [
    ...authConfig.providers,
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: {
          label: "Email",
          type: "email",
          placeholder: "you@example.com",
        },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Missing email or password");
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string },
        });

        if (!user) {
          throw new Error("User does not exist");
        }

        if (!user.password) {
          throw new Error(
            "Account is linked to an OAuth provider (like Google or GitHub). Please sign in with that provider.",
          );
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password as string,
          user.password,
        );

        if (!isPasswordValid) {
          throw new Error("Invalid credentials");
        }

        return user;
      },
    }),
  ],
  events: {
    async linkAccount({ user }) {
      await prisma.user.update({
        where: { id: user.id },
        data: { emailVerified: new Date() },
      });
    },
  },
});

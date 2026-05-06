import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface User {
    darkMode?: boolean;
  }

  interface Session {
    user: DefaultSession["user"] & {
      id: string;
      darkMode: boolean;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    darkMode?: boolean;
  }
}

declare module "@auth/core/types" {
  interface User {
    darkMode?: boolean;
  }
}

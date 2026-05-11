import type { Metadata } from "next";
import { Poppins } from "next/font/google";

import { AppProviders } from "@/components/providers/app-providers";
import { auth } from "@/lib/auth";

import "./globals.css";
import { Toaster } from "sonner";

const poppins = Poppins({
  weight: ["300"],
  subsets: ["latin"],
  variable: "--font-poppins",
});

export const metadata: Metadata = {
  title: "StudyPlanner",
  description: "Academic management and planning application",
};

/**
 * Root Layout
 * M4 - Global styles, providers, auth setup
 */

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();

  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${poppins.variable} ${poppins.variable} h-full antialiased`}
    >
      <body className={`${poppins.className} flex min-h-full flex-col`}>
        <AppProviders session={session}>{children}</AppProviders>
        <Toaster />
      </body>
    </html>
  );
}

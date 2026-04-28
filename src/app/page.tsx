import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-gray-50 dark:bg-gray-900">
      <div className="z-10 w-full max-w-5xl items-center justify-center font-mono flex-col flex">
        <h1 className="text-6xl font-bold text-blue-600 dark:text-blue-400 mb-6">
          StudyPlanner
        </h1>
        <p className="mt-4 text-xl text-gray-700 dark:text-gray-300">
          Work in progress ...
        </p>
        <div className="flex flex-col gap-4 mt-12">
          {/* TODO: Here add navigation links */}
          <Link href="/testpage">Go to Test Page</Link>
        </div>
      </div>
    </main>
  );
}

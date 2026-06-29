import { Navbar } from "@/components/layout/Navbar";

export function AppShell({ user, children }) {
  return (
    <div className="flex min-h-full flex-1 flex-col bg-zinc-50">
      <Navbar user={user} />
      <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-8">
        {children}
      </main>
    </div>
  );
}

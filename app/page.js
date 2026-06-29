import { redirect } from "next/navigation";

import { auth0 } from "@/lib/auth0";

export default async function Home() {
  const session = await auth0.getSession();

  if (session) {
    redirect("/dashboard");
  }

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-6 bg-gradient-to-br from-indigo-50 via-white to-fuchsia-50 px-6 text-center">
      <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-fuchsia-500 text-lg font-bold text-white">
        C
      </span>
      <h1 className="text-3xl font-semibold text-zinc-900">CRM</h1>
      <p className="max-w-md text-zinc-600">
        Track contacts, deals, notes, and tasks in one shared workspace.
      </p>
      <div className="flex gap-3">
        {/* Must be plain <a> tags, not <Link>, so the Auth0 SDK routes handle these server-side. */}
        <a
          href="/auth/login?screen_hint=signup"
          className="rounded-md bg-gradient-to-r from-indigo-600 to-violet-600 px-4 py-2 text-sm font-medium text-white hover:from-indigo-500 hover:to-violet-500"
        >
          Sign up
        </a>
        <a
          href="/auth/login"
          className="rounded-md border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-900 hover:bg-zinc-50"
        >
          Log in
        </a>
      </div>
    </div>
  );
}

import Link from "next/link";
import { redirect } from "next/navigation";

import { getSessionUser } from "@/lib/auth";

export default async function Home() {
  const user = await getSessionUser();

  if (user) {
    redirect("/dishes");
  }

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-6 bg-gradient-to-br from-indigo-50 via-white to-fuchsia-50 px-6 text-center">
      <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-fuchsia-500 text-lg font-bold text-white">
        SG
      </span>
      <h1 className="text-3xl font-semibold text-zinc-900">SGMakanHealthy</h1>
      <p className="max-w-md text-zinc-600">
        Discover the micro-nutrition and taste rating of Singapore&apos;s favourite
        dishes, compare the same dish across food stalls, and snap a photo to
        find out what you&apos;re eating.
      </p>
      <div className="flex gap-3">
        <Link
          href="/login"
          className="rounded-md bg-gradient-to-r from-indigo-600 to-violet-600 px-4 py-2 text-sm font-medium text-white hover:from-indigo-500 hover:to-violet-500"
        >
          Get started
        </Link>
        <Link
          href="/login"
          className="rounded-md border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-900 hover:bg-zinc-50"
        >
          Log in
        </Link>
      </div>
    </div>
  );
}

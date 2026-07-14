import Link from "next/link";

import { logoutAction } from "@/app/(app)/actions";

const LINKS = [
  { href: "/dishes", label: "Dishes" },
  { href: "/stalls", label: "Stalls" },
  { href: "/scan", label: "Scan" },
  { href: "/profile", label: "Profile" },
];

export function Navbar({ user }) {
  return (
    <header className="border-b border-zinc-200 bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3">
        <div className="flex items-center gap-6">
          <Link href="/dishes" className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-md bg-gradient-to-br from-indigo-600 to-fuchsia-500 text-xs font-bold text-white">
              SG
            </span>
            <span className="font-semibold text-zinc-900">SGMakanHealthy</span>
          </Link>
          <nav className="flex items-center gap-4 text-sm text-zinc-600">
            {LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="transition-colors hover:text-indigo-600"
              >
                {link.label}
              </Link>
            ))}
            {user.role === "ADMIN" && (
              <>
                <Link href="/admin/stalls" className="transition-colors hover:text-indigo-600">
                  Manage stalls
                </Link>
                <Link href="/admin/dishes" className="transition-colors hover:text-indigo-600">
                  Manage dishes
                </Link>
                <Link href="/admin/users" className="transition-colors hover:text-indigo-600">
                  Users
                </Link>
              </>
            )}
          </nav>
        </div>
        <div className="flex items-center gap-3 text-sm text-zinc-600">
          <span>{user.username}</span>
          <form action={logoutAction}>
            <button type="submit" className="font-medium text-indigo-600 hover:underline">
              Log out
            </button>
          </form>
        </div>
      </div>
    </header>
  );
}

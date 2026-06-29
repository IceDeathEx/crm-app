import Link from "next/link";

const LINKS = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/contacts", label: "Contacts" },
  { href: "/deals", label: "Deals" },
  { href: "/tasks", label: "Tasks" },
];

export function Navbar({ user }) {
  return (
    <header className="border-b border-zinc-200 bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3">
        <div className="flex items-center gap-6">
          <Link href="/dashboard" className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-md bg-gradient-to-br from-indigo-600 to-fuchsia-500 text-xs font-bold text-white">
              C
            </span>
            <span className="font-semibold text-zinc-900">CRM</span>
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
              <Link href="/admin/users" className="transition-colors hover:text-indigo-600">
                Users
              </Link>
            )}
          </nav>
        </div>
        <div className="flex items-center gap-3 text-sm text-zinc-600">
          <span>{user.name ?? user.email}</span>
          {/* Must be a plain <a>, not <Link>, so the SDK's logout route handles it server-side. */}
          <a href="/auth/logout" className="font-medium text-indigo-600 hover:underline">
            Log out
          </a>
        </div>
      </div>
    </header>
  );
}

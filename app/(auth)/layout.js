export default function AuthLayout({ children }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-6 bg-gradient-to-br from-indigo-50 via-white to-fuchsia-50 px-6 py-12">
      {children}
    </div>
  );
}

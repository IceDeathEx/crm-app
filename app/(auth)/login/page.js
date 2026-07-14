import { LoginForm } from "@/components/auth/LoginForm";

export default function LoginPage() {
  return (
    <div className="flex w-full max-w-sm flex-col gap-6">
      <div className="flex flex-col items-center gap-3 text-center">
        <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-fuchsia-500 text-lg font-bold text-white">
          SG
        </span>
        <h1 className="text-2xl font-semibold text-zinc-900">SGMakanHealthy</h1>
        <p className="text-sm text-zinc-600">
          Log in with your phone number. We&apos;ll send a one-time code via WhatsApp.
        </p>
      </div>
      <LoginForm />
    </div>
  );
}

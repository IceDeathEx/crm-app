"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

export function LoginForm() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState(null);
  const [devCode, setDevCode] = useState(null);

  const [step, setStep] = useState("phone"); // "phone" | "code" | "username"
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [username, setUsername] = useState("");
  const [phoneVerifyToken, setPhoneVerifyToken] = useState(null);

  function requestCode(e) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const res = await fetch("/api/auth/otp/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error ?? "Failed to send code");
        return;
      }
      setDevCode(data.devCode ?? null);
      setStep("code");
    });
  }

  function verifyCode(e) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const res = await fetch("/api/auth/otp/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, code }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error ?? "Failed to verify code");
        return;
      }
      if (data.status === "logged_in") {
        router.push("/dishes");
        router.refresh();
        return;
      }
      setPhoneVerifyToken(data.phoneVerifyToken);
      setStep("username");
    });
  }

  function signup(e) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, username, phoneVerifyToken }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error ?? "Failed to create account");
        return;
      }
      router.push("/dishes");
      router.refresh();
    });
  }

  return (
    <div className="flex flex-col gap-4 rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
      {step === "phone" && (
        <form onSubmit={requestCode} className="flex flex-col gap-4">
          <Input
            label="Phone number"
            name="phone"
            type="tel"
            placeholder="+6591234567"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
          />
          <Button type="submit" disabled={isPending}>
            {isPending ? "Sending code…" : "Send WhatsApp code"}
          </Button>
        </form>
      )}

      {step === "code" && (
        <form onSubmit={verifyCode} className="flex flex-col gap-4">
          <p className="text-sm text-zinc-600">
            Enter the 6-digit code sent to <span className="font-medium">{phone}</span> via WhatsApp.
          </p>
          {devCode && (
            <p className="rounded-md bg-amber-50 px-3 py-2 text-xs text-amber-700">
              WhatsApp delivery is mocked in this environment — dev code: <strong>{devCode}</strong>
            </p>
          )}
          <Input
            label="Verification code"
            name="code"
            inputMode="numeric"
            maxLength={6}
            value={code}
            onChange={(e) => setCode(e.target.value)}
            required
          />
          <Button type="submit" disabled={isPending}>
            {isPending ? "Verifying…" : "Verify"}
          </Button>
          <button
            type="button"
            onClick={() => setStep("phone")}
            className="text-sm text-zinc-500 hover:underline"
          >
            Use a different number
          </button>
        </form>
      )}

      {step === "username" && (
        <form onSubmit={signup} className="flex flex-col gap-4">
          <p className="text-sm text-zinc-600">Pick a username to finish creating your account.</p>
          <Input
            label="Username"
            name="username"
            placeholder="3-20 letters, numbers, underscores"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
          <Button type="submit" disabled={isPending}>
            {isPending ? "Creating account…" : "Create account"}
          </Button>
        </form>
      )}

      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}

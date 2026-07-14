"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";

export function ScanForm({ dishes }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [preview, setPreview] = useState(null);
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null); // { matched, available, dish?, labels? }
  const [error, setError] = useState(null);
  const [manualSlug, setManualSlug] = useState(dishes[0]?.slug ?? "");

  function onFileChange(e) {
    const selected = e.target.files?.[0];
    if (!selected) return;
    setFile(selected);
    setResult(null);
    setError(null);
    setPreview(URL.createObjectURL(selected));
  }

  function submit() {
    if (!file) return;
    setError(null);
    startTransition(async () => {
      const formData = new FormData();
      formData.append("image", file);
      const res = await fetch("/api/food-recognition", { method: "POST", body: formData });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error ?? "Recognition failed");
        return;
      }
      setResult(data);
    });
  }

  function goToManualDish() {
    router.push(`/dishes/${manualSlug}`);
  }

  return (
    <div className="flex flex-col gap-4 rounded-xl border border-zinc-200 bg-white p-5">
      <label className="flex flex-col gap-2">
        <span className="text-sm font-medium text-zinc-700">Photo</span>
        <input
          type="file"
          accept="image/*"
          capture="environment"
          onChange={onFileChange}
          className="text-sm"
        />
      </label>

      {preview && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={preview} alt="Selected food" className="max-h-64 rounded-lg object-cover" />
      )}

      <Button type="button" onClick={submit} disabled={!file || isPending} className="self-start">
        {isPending ? "Identifying…" : "Identify dish"}
      </Button>

      {error && <p className="text-sm text-red-600">{error}</p>}

      {result?.matched && (
        <div className="rounded-md bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          Looks like <strong>{result.dish.name}</strong>.{" "}
          <a href={`/dishes/${result.dish.slug}`} className="underline">
            View nutrition &amp; compare stalls
          </a>
        </div>
      )}

      {result && !result.matched && result.available && (
        <p className="text-sm text-amber-700">
          Couldn&apos;t confidently match this photo to one of the 8 dishes. Pick it manually below.
        </p>
      )}

      {result && !result.available && (
        <p className="text-sm text-zinc-600">
          Food recognition isn&apos;t configured yet in this environment (no API key set). Pick the
          dish manually below instead.
        </p>
      )}

      {result && !result.matched && (
        <div className="flex items-end gap-3">
          <Select label="Or pick manually" value={manualSlug} onChange={(e) => setManualSlug(e.target.value)}>
            {dishes.map((dish) => (
              <option key={dish.slug} value={dish.slug}>
                {dish.name}
              </option>
            ))}
          </Select>
          <Button type="button" variant="secondary" onClick={goToManualDish}>
            Go
          </Button>
        </div>
      )}
    </div>
  );
}

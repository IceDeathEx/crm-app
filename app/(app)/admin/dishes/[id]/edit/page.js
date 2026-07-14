import { notFound } from "next/navigation";

import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { Input, Textarea } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { updateDish } from "@/app/(app)/admin/dishes/actions";

export default async function EditDishPage({ params }) {
  await requireAdmin();
  const { id } = await params;

  const dish = await db.dish.findUnique({ where: { id } });
  if (!dish) notFound();

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-xl font-semibold text-zinc-900">Edit {dish.name}</h1>

      <form
        action={updateDish.bind(null, dish.id)}
        className="flex flex-col gap-4 rounded-xl border border-zinc-200 bg-white p-5"
      >
        <Textarea
          label="Short description"
          name="shortDescription"
          rows={3}
          defaultValue={dish.shortDescription}
          required
        />
        <Input label="Category" name="category" defaultValue={dish.category ?? ""} />
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <Input label="Calories (kcal)" name="caloriesKcal" type="number" defaultValue={dish.caloriesKcal} required />
          <Input label="Protein (g)" name="proteinG" type="number" step="0.1" defaultValue={dish.proteinG} required />
          <Input label="Carbs (g)" name="carbsG" type="number" step="0.1" defaultValue={dish.carbsG} required />
          <Input label="Fat (g)" name="fatG" type="number" step="0.1" defaultValue={dish.fatG} required />
          <Input label="Sodium (mg)" name="sodiumMg" type="number" defaultValue={dish.sodiumMg} required />
          <Input label="Fiber (g)" name="fiberG" type="number" step="0.1" defaultValue={dish.fiberG} required />
          <Input label="Sugar (g)" name="sugarG" type="number" step="0.1" defaultValue={dish.sugarG} required />
        </div>
        <Input label="Serving note" name="servingNote" defaultValue={dish.servingNote ?? ""} />
        <Button type="submit" className="self-start">
          Save changes
        </Button>
      </form>
    </div>
  );
}

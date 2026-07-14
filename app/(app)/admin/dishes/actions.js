"use server";

import { revalidatePath } from "next/cache";

import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { requireString, requireInt, optionalString } from "@/lib/validation";

export async function updateDish(dishId, formData) {
  await requireAdmin();

  const dish = await db.dish.update({
    where: { id: dishId },
    data: {
      shortDescription: requireString(formData.get("shortDescription"), "Description"),
      category: optionalString(formData.get("category")),
      caloriesKcal: requireInt(formData.get("caloriesKcal"), "Calories"),
      proteinG: Number.parseFloat(formData.get("proteinG")),
      carbsG: Number.parseFloat(formData.get("carbsG")),
      fatG: Number.parseFloat(formData.get("fatG")),
      sodiumMg: requireInt(formData.get("sodiumMg"), "Sodium"),
      fiberG: Number.parseFloat(formData.get("fiberG")),
      sugarG: Number.parseFloat(formData.get("sugarG")),
      servingNote: optionalString(formData.get("servingNote")),
    },
  });

  revalidatePath(`/admin/dishes/${dish.id}/edit`);
  revalidatePath(`/dishes/${dish.slug}`);
}

"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { requireString, optionalInt } from "@/lib/validation";

export async function createStall(formData) {
  await requireAdmin();

  const name = requireString(formData.get("name"), "Name");
  const address = requireString(formData.get("address"), "Address");

  const stall = await db.stall.create({ data: { name, address } });
  redirect(`/admin/stalls/${stall.id}/edit`);
}

export async function updateStall(stallId, formData) {
  await requireAdmin();

  const name = requireString(formData.get("name"), "Name");
  const address = requireString(formData.get("address"), "Address");

  await db.stall.update({ where: { id: stallId }, data: { name, address } });
  revalidatePath(`/admin/stalls/${stallId}/edit`);
}

export async function deleteStall(stallId) {
  await requireAdmin();
  await db.stall.delete({ where: { id: stallId } });
  redirect("/admin/stalls");
}

export async function addStallDish(stallId, formData) {
  await requireAdmin();

  const dishId = requireString(formData.get("dishId"), "Dish");
  const priceCents = optionalInt(formData.get("priceCents"));

  await db.stallDish.upsert({
    where: { stallId_dishId: { stallId, dishId } },
    update: { priceCents },
    create: { stallId, dishId, priceCents },
  });
  revalidatePath(`/admin/stalls/${stallId}/edit`);
}

export async function removeStallDish(stallId, stallDishId) {
  await requireAdmin();
  await db.stallDish.delete({ where: { id: stallDishId } });
  revalidatePath(`/admin/stalls/${stallId}/edit`);
}

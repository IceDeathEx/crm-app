"use server";

import { redirect } from "next/navigation";

import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { requireString, ValidationError } from "@/lib/validation";

function parseValueCents(value) {
  const dollars = Number.parseFloat(value);
  if (!Number.isFinite(dollars) || dollars < 0) {
    throw new ValidationError("Value must be a positive number");
  }
  return Math.round(dollars * 100);
}

export async function createDeal(formData) {
  await requireUser();

  const data = {
    title: requireString(formData.get("title"), "Title"),
    valueCents: parseValueCents(formData.get("value")),
    contactId: requireString(formData.get("contactId"), "Contact"),
    ownerId: requireString(formData.get("ownerId"), "Owner"),
  };

  const deal = await db.deal.create({ data });
  redirect(`/deals/${deal.id}`);
}

export async function updateDeal(dealId, formData) {
  await requireUser();

  const data = {
    title: requireString(formData.get("title"), "Title"),
    valueCents: parseValueCents(formData.get("value")),
    ownerId: requireString(formData.get("ownerId"), "Owner"),
  };

  await db.deal.update({ where: { id: dealId }, data });
  redirect(`/deals/${dealId}`);
}

export async function deleteDeal(dealId) {
  await requireUser();
  await db.deal.delete({ where: { id: dealId } });
  redirect("/deals");
}

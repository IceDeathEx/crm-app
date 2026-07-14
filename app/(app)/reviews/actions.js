"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { requireString, requireIntInRange } from "@/lib/validation";

export async function createReview(formData) {
  const user = await requireUser();

  const stallDishId = requireString(formData.get("stallDishId"), "Stall dish");
  const tasteRating = requireIntInRange(formData.get("tasteRating"), "Rating", 1, 5);
  const description = requireString(formData.get("description"), "Review");
  const isAnonymous = formData.get("isAnonymous") === "on";
  const redirectPath = requireString(formData.get("redirectPath"), "Redirect path");

  await db.review.create({
    data: { stallDishId, userId: user.id, tasteRating, description, isAnonymous },
  });

  revalidatePath(redirectPath);
}

export async function deleteReview(reviewId, redirectPath) {
  const user = await requireUser();

  const review = await db.review.findUnique({ where: { id: reviewId } });
  if (!review) return;
  if (review.userId !== user.id && user.role !== "ADMIN") {
    redirect(redirectPath);
  }

  await db.review.delete({ where: { id: reviewId } });
  revalidatePath(redirectPath);
}

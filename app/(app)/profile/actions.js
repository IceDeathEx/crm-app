"use server";

import { redirect } from "next/navigation";

import { db } from "@/lib/db";
import { requireUser, HttpError } from "@/lib/auth";
import { requireString, optionalInt, optionalFloat, optionalString, ValidationError } from "@/lib/validation";

const USERNAME_PATTERN = /^[a-zA-Z0-9_]{3,20}$/;
const GENDERS = ["MALE", "FEMALE", "OTHER", "PREFER_NOT_TO_SAY"];
const ACTIVITY_LEVELS = ["SEDENTARY", "LIGHT", "MODERATE", "ACTIVE", "VERY_ACTIVE"];

export async function updateProfile(formData) {
  const user = await requireUser();

  const username = requireString(formData.get("username"), "Username");
  if (!USERNAME_PATTERN.test(username)) {
    throw new ValidationError("Username must be 3-20 characters, letters/numbers/underscores only");
  }

  const gender = optionalString(formData.get("gender"));
  if (gender && !GENDERS.includes(gender)) {
    throw new ValidationError("Invalid gender");
  }
  const activityLevel = optionalString(formData.get("activityLevel"));
  if (activityLevel && !ACTIVITY_LEVELS.includes(activityLevel)) {
    throw new ValidationError("Invalid activity level");
  }

  try {
    await db.user.update({
      where: { id: user.id },
      data: {
        username,
        gender: gender ?? null,
        activityLevel: activityLevel ?? null,
        age: optionalInt(formData.get("age")),
        heightCm: optionalFloat(formData.get("heightCm")),
        weightKg: optionalFloat(formData.get("weightKg")),
      },
    });
  } catch (err) {
    if (err.code === "P2002") {
      throw new HttpError(400, "That username is already taken");
    }
    throw err;
  }

  redirect("/profile");
}

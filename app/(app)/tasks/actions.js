"use server";

import { redirect } from "next/navigation";

import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { requireString, optionalString, optionalDate } from "@/lib/validation";

export async function createTask(formData) {
  const user = await requireUser();

  const contactId = formData.get("contactId") || null;
  const dealId = formData.get("dealId") || null;
  const redirectPath = formData.get("redirectPath") || "/tasks";

  const data = {
    title: requireString(formData.get("title"), "Title"),
    description: optionalString(formData.get("description")),
    dueDate: optionalDate(formData.get("dueDate")),
    assigneeId: requireString(formData.get("assigneeId"), "Assignee"),
    createdById: user.id,
    contactId,
    dealId,
  };

  await db.task.create({ data });

  redirect(redirectPath);
}

export async function updateTask(taskId, formData) {
  await requireUser();

  const data = {
    title: requireString(formData.get("title"), "Title"),
    description: optionalString(formData.get("description")),
    dueDate: optionalDate(formData.get("dueDate")),
    assigneeId: requireString(formData.get("assigneeId"), "Assignee"),
    status: formData.get("status") === "DONE" ? "DONE" : "OPEN",
  };

  await db.task.update({ where: { id: taskId }, data });
  redirect(formData.get("redirectPath") || "/tasks");
}

export async function deleteTask(taskId, redirectPath) {
  await requireUser();
  await db.task.delete({ where: { id: taskId } });
  redirect(redirectPath);
}

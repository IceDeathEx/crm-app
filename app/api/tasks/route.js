import { db } from "@/lib/db";
import { requireApiUser, handleApiError } from "@/lib/auth";
import { requireString, optionalString, optionalDate } from "@/lib/validation";

export async function GET(request) {
  try {
    const user = await requireApiUser();
    const { searchParams } = new URL(request.url);
    const view = searchParams.get("view") ?? "mine";
    const status = searchParams.get("status");

    const tasks = await db.task.findMany({
      where: {
        ...(view === "mine" ? { assigneeId: user.id } : {}),
        ...(status ? { status } : {}),
      },
      include: { assignee: true, contact: true, deal: true },
      orderBy: [{ dueDate: "asc" }, { createdAt: "desc" }],
    });

    return Response.json(tasks);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request) {
  try {
    const user = await requireApiUser();
    const body = await request.json();

    const task = await db.task.create({
      data: {
        title: requireString(body.title, "Title"),
        description: optionalString(body.description),
        dueDate: optionalDate(body.dueDate),
        assigneeId: requireString(body.assigneeId, "Assignee"),
        createdById: user.id,
        contactId: body.contactId || null,
        dealId: body.dealId || null,
      },
    });

    return Response.json(task, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}

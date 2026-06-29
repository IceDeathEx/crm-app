import { db } from "@/lib/db";
import { requireApiUser, handleApiError, HttpError } from "@/lib/auth";
import {
  requireString,
  optionalString,
  optionalDate,
  ValidationError,
} from "@/lib/validation";

export async function GET(request, { params }) {
  try {
    await requireApiUser();
    const { id } = await params;

    const task = await db.task.findUnique({
      where: { id },
      include: { assignee: true, contact: true, deal: true },
    });
    if (!task) throw new HttpError(404, "Not found");

    return Response.json(task);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(request, { params }) {
  try {
    await requireApiUser();
    const { id } = await params;
    const body = await request.json();

    const data = {};
    if (body.title !== undefined) data.title = requireString(body.title, "Title");
    if (body.description !== undefined) data.description = optionalString(body.description);
    if (body.dueDate !== undefined) data.dueDate = optionalDate(body.dueDate);
    if (body.assigneeId !== undefined) data.assigneeId = requireString(body.assigneeId, "Assignee");
    if (body.status !== undefined) {
      if (body.status !== "OPEN" && body.status !== "DONE") {
        throw new ValidationError("Invalid status");
      }
      data.status = body.status;
    }

    const task = await db.task.update({ where: { id }, data });
    return Response.json(task);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(request, { params }) {
  try {
    await requireApiUser();
    const { id } = await params;

    await db.task.delete({ where: { id } });
    return new Response(null, { status: 204 });
  } catch (error) {
    return handleApiError(error);
  }
}

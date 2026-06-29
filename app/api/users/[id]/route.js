import { db } from "@/lib/db";
import { requireApiAdmin, handleApiError, HttpError } from "@/lib/auth";
import { ValidationError } from "@/lib/validation";

export async function PATCH(request, { params }) {
  try {
    const admin = await requireApiAdmin();
    const { id } = await params;
    const body = await request.json();

    if (body.role !== "ADMIN" && body.role !== "MEMBER") {
      throw new ValidationError("Invalid role");
    }
    if (id === admin.id) {
      throw new HttpError(400, "You can't change your own role");
    }

    const user = await db.user.update({
      where: { id },
      data: { role: body.role },
    });

    return Response.json(user);
  } catch (error) {
    return handleApiError(error);
  }
}

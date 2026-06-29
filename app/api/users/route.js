import { db } from "@/lib/db";
import { requireApiAdmin, handleApiError } from "@/lib/auth";

export async function GET() {
  try {
    await requireApiAdmin();
    const users = await db.user.findMany({ orderBy: { createdAt: "asc" } });
    return Response.json(users);
  } catch (error) {
    return handleApiError(error);
  }
}

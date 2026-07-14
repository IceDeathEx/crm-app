import { db } from "@/lib/db";
import { requireApiUser, handleApiError, HttpError } from "@/lib/auth";
import { recognizeDish } from "@/lib/foodRecognition";
import { matchDishFromLabels } from "@/lib/dishMatching";

export async function POST(request) {
  try {
    await requireApiUser();

    const formData = await request.formData();
    const file = formData.get("image");
    if (!file || typeof file === "string") {
      throw new HttpError(400, "No image uploaded");
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const result = await recognizeDish(buffer, file.type);

    if (!result.available) {
      return Response.json({ matched: false, available: false });
    }

    const slug = matchDishFromLabels(result.labels ?? []);
    if (!slug) {
      return Response.json({ matched: false, available: true, labels: result.labels });
    }

    const dish = await db.dish.findUnique({ where: { slug } });
    if (!dish) {
      return Response.json({ matched: false, available: true, labels: result.labels });
    }

    return Response.json({ matched: true, available: true, dish });
  } catch (error) {
    return handleApiError(error);
  }
}

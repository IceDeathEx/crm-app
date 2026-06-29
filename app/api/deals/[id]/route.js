import { db } from "@/lib/db";
import { requireApiUser, handleApiError, HttpError } from "@/lib/auth";
import { requireString, ValidationError } from "@/lib/validation";
import { DEAL_STAGES } from "@/lib/format";

export async function GET(request, { params }) {
  try {
    await requireApiUser();
    const { id } = await params;

    const deal = await db.deal.findUnique({
      where: { id },
      include: { contact: true, owner: true },
    });
    if (!deal) throw new HttpError(404, "Not found");

    return Response.json(deal);
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
    if (body.ownerId !== undefined) data.ownerId = requireString(body.ownerId, "Owner");
    if (body.valueCents !== undefined) {
      const valueCents = Number.parseInt(body.valueCents, 10);
      if (!Number.isFinite(valueCents) || valueCents < 0) {
        throw new ValidationError("valueCents must be a non-negative integer");
      }
      data.valueCents = valueCents;
    }
    if (body.stage !== undefined) {
      if (!DEAL_STAGES.includes(body.stage)) {
        throw new ValidationError("Invalid stage");
      }
      data.stage = body.stage;
      data.closedAt = body.stage === "WON" || body.stage === "LOST" ? new Date() : null;
    }

    const deal = await db.deal.update({ where: { id }, data });
    return Response.json(deal);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(request, { params }) {
  try {
    await requireApiUser();
    const { id } = await params;

    await db.deal.delete({ where: { id } });
    return new Response(null, { status: 204 });
  } catch (error) {
    return handleApiError(error);
  }
}

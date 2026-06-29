import { db } from "@/lib/db";
import { requireApiUser, handleApiError } from "@/lib/auth";
import { requireString } from "@/lib/validation";
import { DEAL_STAGES } from "@/lib/format";

export async function GET(request) {
  try {
    await requireApiUser();
    const { searchParams } = new URL(request.url);
    const stage = searchParams.get("stage");
    const ownerId = searchParams.get("ownerId");

    const deals = await db.deal.findMany({
      where: {
        ...(stage ? { stage } : {}),
        ...(ownerId ? { ownerId } : {}),
      },
      include: { contact: true, owner: true },
      orderBy: { createdAt: "desc" },
    });

    return Response.json(deals);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request) {
  try {
    await requireApiUser();
    const body = await request.json();

    const valueCents = Number.parseInt(body.valueCents, 10);
    if (!Number.isFinite(valueCents) || valueCents < 0) {
      throw new Error("valueCents must be a non-negative integer");
    }

    const deal = await db.deal.create({
      data: {
        title: requireString(body.title, "Title"),
        valueCents,
        stage: DEAL_STAGES.includes(body.stage) ? body.stage : "LEAD",
        contactId: requireString(body.contactId, "Contact"),
        ownerId: requireString(body.ownerId, "Owner"),
      },
    });

    return Response.json(deal, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}

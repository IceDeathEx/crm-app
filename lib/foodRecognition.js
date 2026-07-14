// Food photo recognition via LogMeal's food-recognition API (pretrained,
// general-purpose -- not a model trained from scratch on our 8 dishes, since
// no labeled dataset exists). Degrades gracefully with { available: false }
// whenever no API key is configured or the call fails, so the UI can fall
// back to manual dish selection instead of crashing.
const LOGMEAL_ENDPOINT = "https://api.logmeal.com/v2/image/segmentation/complete";

export async function recognizeDish(imageBuffer, contentType) {
  const apiKey = process.env.FOOD_RECOGNITION_API_KEY;
  if (!apiKey) {
    return { available: false };
  }

  try {
    const form = new FormData();
    form.append("image", new Blob([imageBuffer], { type: contentType }), "upload");

    const res = await fetch(LOGMEAL_ENDPOINT, {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}` },
      body: form,
    });

    if (!res.ok) {
      return { available: false, error: `Recognition API returned ${res.status}` };
    }

    const data = await res.json();
    const labels = (data.recognition_results ?? []).map((r) => r.name).filter(Boolean);
    return { available: true, labels };
  } catch (err) {
    return { available: false, error: err.message };
  }
}

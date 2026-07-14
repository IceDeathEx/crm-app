// Maps generic food-recognition API labels back to our 8 fixed dish slugs.
// Generic vision APIs won't return "char kway teow" verbatim, so we match
// against a small synonym list per dish instead.
const DISH_SYNONYMS = {
  "roti-prata": ["roti prata", "roti canai", "paratha", "flatbread", "indian pancake"],
  "chicken-rice": ["chicken rice", "hainanese chicken rice", "poached chicken", "steamed chicken"],
  "char-kway-teow": ["char kway teow", "char kuey teow", "fried flat noodles", "stir-fried rice noodles", "ckt"],
  "bak-kut-teh": ["bak kut teh", "pork rib soup", "pork bone tea soup", "pork rib tea"],
  "hor-fun": ["hor fun", "he fun", "wat tan hor", "flat rice noodles in gravy", "ho fun"],
  "fried-rice": ["fried rice", "egg fried rice", "yangzhou fried rice"],
  "nasi-lemak": ["nasi lemak", "coconut rice", "coconut milk rice"],
  "mee-rebus": ["mee rebus", "noodles in gravy", "yellow noodles gravy"],
};

export function matchDishFromLabels(labels) {
  const normalized = labels.map((l) => l.toLowerCase());

  for (const [slug, synonyms] of Object.entries(DISH_SYNONYMS)) {
    for (const synonym of synonyms) {
      if (normalized.some((label) => label.includes(synonym) || synonym.includes(label))) {
        return slug;
      }
    }
  }
  return null;
}

const CATEGORY_COLORS = {
  noodles: "amber",
  rice: "green",
  soup: "purple",
  breakfast: "blue",
};

export function dishCategoryColor(category) {
  return CATEGORY_COLORS[category] ?? "zinc";
}

// Simple generic placeholder used when a dish has no imageUrl yet -- drop a
// real photo into /public/dishes and set Dish.imageUrl to replace this.
const DISH_EMOJI = {
  "roti-prata": "\u{1FAD3}",
  "chicken-rice": "\u{1F357}",
  "char-kway-teow": "\u{1F35C}",
  "bak-kut-teh": "\u{1F372}",
  "hor-fun": "\u{1F35C}",
  "fried-rice": "\u{1F35A}",
  "nasi-lemak": "\u{1F35B}",
  "mee-rebus": "\u{1F35C}",
};

export function dishEmoji(slug) {
  return DISH_EMOJI[slug] ?? "\u{1F372}";
}

const STAR_RATING_COLORS = {
  1: "red",
  2: "red",
  3: "amber",
  4: "green",
  5: "green",
};

export function starRatingColor(rating) {
  return STAR_RATING_COLORS[rating] ?? "zinc";
}

export function formatMoney(cents) {
  if (cents == null) return "—";
  return (cents / 100).toLocaleString("en-SG", {
    style: "currency",
    currency: "SGD",
  });
}

export function formatDate(date) {
  if (!date) return "—";
  return new Date(date).toLocaleDateString("en-SG", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function formatDateTime(date) {
  if (!date) return "—";
  return new Date(date).toLocaleString("en-SG", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

// Seed data for SGMakanHealthy: 8 fixed Singapore dishes, a handful of
// sample stalls, and price rows linking stalls to dishes for comparison.
//
// Nutrition values below are reasonable per-serving estimates, not sourced
// from a verified nutrition database (e.g. Singapore HPB) -- swap them out
// once real figures are available, no schema change needed.
require("dotenv/config");
const { PrismaClient } = require("@prisma/client");

const db = new PrismaClient({
  datasourceUrl: process.env.DATABASE_URL ?? process.env.POSTGRES_PRISMA_URL,
});

const DISHES = [
  {
    slug: "roti-prata",
    name: "Roti Prata",
    category: "breakfast",
    shortDescription:
      "A flaky, pan-fried flatbread of Indian-Muslim origin, typically served with a bowl of curry for dipping. A hawker breakfast staple across Singapore.",
    caloriesKcal: 330,
    proteinG: 6,
    carbsG: 40,
    fatG: 16,
    sodiumMg: 480,
    fiberG: 1.5,
    sugarG: 2,
    servingNote: "Per 2 plain pieces with curry",
  },
  {
    slug: "chicken-rice",
    name: "Chicken Rice",
    category: "rice",
    shortDescription:
      "Poached or roasted chicken served over fragrant rice cooked in chicken stock and pandan, with chilli sauce, ginger paste, and dark soy.",
    caloriesKcal: 600,
    proteinG: 28,
    carbsG: 70,
    fatG: 22,
    sodiumMg: 850,
    fiberG: 2,
    sugarG: 3,
    servingNote: "Per regular hawker plate",
  },
  {
    slug: "char-kway-teow",
    name: "Char Kway Teow",
    category: "noodles",
    shortDescription:
      "Flat rice noodles wok-fried over high heat with dark soy sauce, chilli, egg, cockles, prawns, and Chinese sausage for a smoky \"wok hei\" flavour.",
    caloriesKcal: 740,
    proteinG: 20,
    carbsG: 80,
    fatG: 38,
    sodiumMg: 1200,
    fiberG: 3,
    sugarG: 5,
    servingNote: "Per regular hawker plate",
  },
  {
    slug: "bak-kut-teh",
    name: "Bak Kut Teh",
    category: "soup",
    shortDescription:
      "Pork ribs simmered for hours in a peppery, garlicky broth (Teochew style) or a herbal Hokkien-style broth, served with rice and youtiao.",
    caloriesKcal: 450,
    proteinG: 30,
    carbsG: 8,
    fatG: 32,
    sodiumMg: 1400,
    fiberG: 1,
    sugarG: 1,
    servingNote: "Per bowl, ribs + broth only",
  },
  {
    slug: "hor-fun",
    name: "Hor Fun",
    category: "noodles",
    shortDescription:
      "Wide rice noodles served either dry-fried with soy sauce or smothered in a silky egg gravy (\"wat tan hor\") with prawns, fish, and greens.",
    caloriesKcal: 650,
    proteinG: 22,
    carbsG: 75,
    fatG: 28,
    sodiumMg: 1100,
    fiberG: 2.5,
    sugarG: 4,
    servingNote: "Per regular hawker plate",
  },
  {
    slug: "fried-rice",
    name: "Fried Rice",
    category: "rice",
    shortDescription:
      "Wok-fried rice tossed with egg, char siew or luncheon meat, prawns, and spring onion -- a simple, widely available hawker comfort dish.",
    caloriesKcal: 580,
    proteinG: 15,
    carbsG: 78,
    fatG: 20,
    sodiumMg: 900,
    fiberG: 2,
    sugarG: 3,
    servingNote: "Per regular hawker plate",
  },
  {
    slug: "nasi-lemak",
    name: "Nasi Lemak",
    category: "rice",
    shortDescription:
      "Coconut milk rice served with sambal chilli, fried anchovies, roasted peanuts, cucumber, and a fried egg, often with fried chicken on the side.",
    caloriesKcal: 680,
    proteinG: 20,
    carbsG: 75,
    fatG: 32,
    sodiumMg: 950,
    fiberG: 2.5,
    sugarG: 4,
    servingNote: "Per regular set with egg and ikan bilis",
  },
  {
    slug: "mee-rebus",
    name: "Mee Rebus",
    category: "noodles",
    shortDescription:
      "Yellow noodles in a thick, sweet-savoury potato-based gravy, topped with hard-boiled egg, tofu puffs, beansprouts, and a squeeze of lime.",
    caloriesKcal: 500,
    proteinG: 16,
    carbsG: 65,
    fatG: 18,
    sodiumMg: 1050,
    fiberG: 3,
    sugarG: 6,
    servingNote: "Per regular hawker bowl",
  },
];

const STALLS = [
  { key: "tian-tian", name: "Tian Tian Hainanese Chicken Rice", address: "Maxwell Food Centre, 1 Kadayanallur St" },
  { key: "ah-tai", name: "Ah Tai Chicken Rice", address: "Golden Mile Food Centre, 505 Beach Rd" },
  { key: "zion-road", name: "Zion Road Big Prawn Noodle & Char Kway Teow", address: "Zion Riverside Food Centre, 70 Zion Rd" },
  { key: "outram-park", name: "Outram Park Fried Kway Teow Mee", address: "Hong Lim Market & Food Centre, 531A Upper Cross St" },
  { key: "founder", name: "Founder Bak Kut Teh", address: "154 Crawford Ln" },
  { key: "ng-ah-sio", name: "Ng Ah Sio Bak Kut Teh", address: "25 Rangoon Rd" },
  { key: "hillstreet", name: "Hillstreet Fried Hor Fun", address: "33A Ann Siang Rd" },
  { key: "whitley-road", name: "Whitley Road Big Prawn Noodle", address: "90 Whitley Rd" },
  { key: "old-airport-road-prata", name: "Old Airport Road Roti Prata", address: "Old Airport Road Food Centre, 51 Old Airport Rd" },
  { key: "springleaf-prata", name: "Springleaf Prata Place", address: "1002 Upper Thomson Rd" },
  { key: "rase-sayang", name: "Rase Sayang Nasi Lemak", address: "87 Marine Parade Central" },
  { key: "adam-road", name: "Adam Road Nasi Lemak", address: "Adam Road Food Centre, 2 Adam Rd" },
  { key: "sin-kee", name: "Sin Kee Famous Fried Rice", address: "226 Toa Payoh" },
  { key: "geylang-mee-rebus", name: "Geylang Mee Rebus", address: "Geylang Serai Market, 1 Geylang Serai" },
];

// dish slug -> [{ stallKey, priceCents }]
const STALL_DISHES = {
  "roti-prata": [
    { stallKey: "old-airport-road-prata", priceCents: 250 },
    { stallKey: "springleaf-prata", priceCents: 320 },
  ],
  "chicken-rice": [
    { stallKey: "tian-tian", priceCents: 500 },
    { stallKey: "ah-tai", priceCents: 450 },
  ],
  "char-kway-teow": [
    { stallKey: "zion-road", priceCents: 400 },
    { stallKey: "outram-park", priceCents: 350 },
  ],
  "bak-kut-teh": [
    { stallKey: "founder", priceCents: 800 },
    { stallKey: "ng-ah-sio", priceCents: 950 },
  ],
  "hor-fun": [
    { stallKey: "hillstreet", priceCents: 500 },
    { stallKey: "whitley-road", priceCents: 600 },
  ],
  "fried-rice": [
    { stallKey: "sin-kee", priceCents: 400 },
    { stallKey: "ah-tai", priceCents: 450 },
  ],
  "nasi-lemak": [
    { stallKey: "rase-sayang", priceCents: 450 },
    { stallKey: "adam-road", priceCents: 500 },
  ],
  "mee-rebus": [
    { stallKey: "geylang-mee-rebus", priceCents: 350 },
    { stallKey: "hillstreet", priceCents: 400 },
  ],
};

async function main() {
  const stallIdByKey = {};
  for (const stall of STALLS) {
    const existing = await db.stall.findFirst({ where: { name: stall.name } });
    const row = existing ?? (await db.stall.create({ data: { name: stall.name, address: stall.address } }));
    stallIdByKey[stall.key] = row.id;
  }

  for (const dish of DISHES) {
    const row = await db.dish.upsert({
      where: { slug: dish.slug },
      update: { ...dish },
      create: { ...dish },
    });

    const links = STALL_DISHES[dish.slug] ?? [];
    for (const link of links) {
      const stallId = stallIdByKey[link.stallKey];
      await db.stallDish.upsert({
        where: { stallId_dishId: { stallId, dishId: row.id } },
        update: { priceCents: link.priceCents },
        create: { stallId, dishId: row.id, priceCents: link.priceCents },
      });
    }
  }

  console.log(`Seeded ${DISHES.length} dishes, ${STALLS.length} stalls.`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await db.$disconnect();
  });

import { db } from "@/lib/db";
import { DishCard } from "@/components/dishes/DishCard";

export default async function DishesPage() {
  const dishes = await db.dish.findMany({ orderBy: { name: "asc" } });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold text-zinc-900">Dishes</h1>
        <p className="text-sm text-zinc-600">
          Eight classic Singapore dishes -- check the nutrition, compare stalls, and rate the taste.
        </p>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {dishes.map((dish) => (
          <DishCard key={dish.id} dish={dish} />
        ))}
      </div>
    </div>
  );
}

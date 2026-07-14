const ROWS = [
  { key: "caloriesKcal", label: "Calories", unit: "kcal" },
  { key: "proteinG", label: "Protein", unit: "g" },
  { key: "carbsG", label: "Carbs", unit: "g" },
  { key: "fatG", label: "Fat", unit: "g" },
  { key: "sodiumMg", label: "Sodium", unit: "mg" },
  { key: "fiberG", label: "Fiber", unit: "g" },
  { key: "sugarG", label: "Sugar", unit: "g" },
];

export function NutritionFacts({ dish }) {
  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-5">
      <div className="flex items-baseline justify-between">
        <h2 className="font-semibold text-zinc-900">Nutrition facts</h2>
        {dish.servingNote && <span className="text-xs text-zinc-500">{dish.servingNote}</span>}
      </div>
      <dl className="mt-3 grid grid-cols-2 gap-x-6 gap-y-2 sm:grid-cols-4">
        {ROWS.map(({ key, label, unit }) => (
          <div key={key} className="flex flex-col">
            <dt className="text-xs text-zinc-500">{label}</dt>
            <dd className="text-sm font-medium text-zinc-900">
              {dish[key]}
              {unit}
            </dd>
          </div>
        ))}
      </dl>
      <p className="mt-3 text-xs text-zinc-400">
        Reference values are estimates for a typical hawker serving, not lab-verified figures.
      </p>
    </div>
  );
}

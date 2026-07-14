import { notFound } from "next/navigation";

import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { StallForm } from "@/components/stalls/StallForm";
import { Select } from "@/components/ui/Select";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Table, Thead, Th, Tbody, Td, EmptyState } from "@/components/ui/Table";
import { formatMoney } from "@/lib/format";
import { updateStall, addStallDish, removeStallDish } from "@/app/(app)/admin/stalls/actions";

export default async function EditStallPage({ params }) {
  await requireAdmin();
  const { id } = await params;

  const stall = await db.stall.findUnique({
    where: { id },
    include: { stallDishes: { include: { dish: true } } },
  });
  if (!stall) notFound();

  const dishes = await db.dish.findMany({ orderBy: { name: "asc" } });
  const listedDishIds = new Set(stall.stallDishes.map((sd) => sd.dishId));

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-xl font-semibold text-zinc-900">Edit {stall.name}</h1>

      <StallForm action={updateStall.bind(null, stall.id)} stall={stall} />

      <div className="flex flex-col gap-3">
        <h2 className="font-semibold text-zinc-900">Dishes at this stall</h2>
        <Table>
          <Thead>
            <Th>Dish</Th>
            <Th>Price</Th>
            <Th />
          </Thead>
          <Tbody>
            {stall.stallDishes.length === 0 ? (
              <tr>
                <Td>
                  <EmptyState>No dishes added yet.</EmptyState>
                </Td>
              </tr>
            ) : (
              stall.stallDishes.map((sd) => (
                <tr key={sd.id} className="hover:bg-zinc-50">
                  <Td>{sd.dish.name}</Td>
                  <Td>{formatMoney(sd.priceCents)}</Td>
                  <Td>
                    <form action={removeStallDish.bind(null, stall.id, sd.id)}>
                      <button type="submit" className="text-xs text-red-600 hover:underline">
                        Remove
                      </button>
                    </form>
                  </Td>
                </tr>
              ))
            )}
          </Tbody>
        </Table>

        <form
          action={addStallDish.bind(null, stall.id)}
          className="flex flex-wrap items-end gap-3 rounded-xl border border-zinc-200 bg-white p-4"
        >
          <Select label="Dish" name="dishId" required>
            {dishes.map((dish) => (
              <option key={dish.id} value={dish.id}>
                {dish.name}
                {listedDishIds.has(dish.id) ? " (already listed)" : ""}
              </option>
            ))}
          </Select>
          <Input label="Price (cents)" name="priceCents" type="number" min="0" placeholder="500" />
          <Button type="submit">Add / update price</Button>
        </form>
      </div>
    </div>
  );
}

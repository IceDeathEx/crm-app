import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";

export function DealForm({ action, deal, contacts, users, currentUserId, submitLabel = "Save" }) {
  return (
    <form action={action} className="flex flex-col gap-4 max-w-lg">
      <Input label="Title" name="title" defaultValue={deal?.title} required />
      <Input
        label="Value (USD)"
        name="value"
        type="number"
        step="0.01"
        min="0"
        defaultValue={deal ? (deal.valueCents / 100).toFixed(2) : ""}
        required
      />
      {!deal && contacts && (
        <Select label="Contact" name="contactId" required>
          {contacts.map((c) => (
            <option key={c.id} value={c.id}>
              {c.firstName} {c.lastName}
              {c.company ? ` (${c.company})` : ""}
            </option>
          ))}
        </Select>
      )}
      <Select
        label="Owner"
        name="ownerId"
        defaultValue={deal?.ownerId ?? currentUserId}
        required
      >
        {users.map((u) => (
          <option key={u.id} value={u.id}>
            {u.name ?? u.email}
          </option>
        ))}
      </Select>
      <div>
        <Button type="submit">{submitLabel}</Button>
      </div>
    </form>
  );
}

import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

export function StallForm({ action, stall }) {
  return (
    <form action={action} className="flex flex-col gap-4 rounded-xl border border-zinc-200 bg-white p-5">
      <Input label="Name" name="name" defaultValue={stall?.name} required />
      <Input label="Address" name="address" defaultValue={stall?.address} required />
      <Button type="submit" className="self-start">
        {stall ? "Save changes" : "Create stall"}
      </Button>
    </form>
  );
}

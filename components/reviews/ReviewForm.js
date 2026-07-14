import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { createReview } from "@/app/(app)/reviews/actions";

export function ReviewForm({ stallDishId, redirectPath }) {
  return (
    <form action={createReview} className="flex flex-col gap-3 rounded-xl border border-zinc-200 bg-white p-4">
      <input type="hidden" name="stallDishId" value={stallDishId} />
      <input type="hidden" name="redirectPath" value={redirectPath} />
      <h3 className="font-medium text-zinc-900">Write a review</h3>
      <Select label="Taste rating" name="tasteRating" defaultValue="5" required>
        <option value="5">5 - Best</option>
        <option value="4">4</option>
        <option value="3">3</option>
        <option value="2">2</option>
        <option value="1">1 - Worst</option>
      </Select>
      <Textarea
        label="Your review"
        name="description"
        rows={3}
        placeholder="What did you think of the taste, portion, value..."
        required
      />
      <label className="flex items-center gap-2 text-sm text-zinc-600">
        <input type="checkbox" name="isAnonymous" className="rounded border-zinc-300" />
        Post anonymously
      </label>
      <Button type="submit" className="self-start">
        Submit review
      </Button>
    </form>
  );
}

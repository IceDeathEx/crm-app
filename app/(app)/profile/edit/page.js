import { requireUser } from "@/lib/auth";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { updateProfile } from "@/app/(app)/profile/actions";

export default async function EditProfilePage() {
  const user = await requireUser();

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-xl font-semibold text-zinc-900">Edit profile</h1>

      <form action={updateProfile} className="flex flex-col gap-4 rounded-xl border border-zinc-200 bg-white p-5">
        <Input label="Username" name="username" defaultValue={user.username} required />

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <Input label="Age" name="age" type="number" min="0" defaultValue={user.age ?? ""} />
          <Select label="Gender" name="gender" defaultValue={user.gender ?? ""}>
            <option value="">Prefer not to say</option>
            <option value="MALE">Male</option>
            <option value="FEMALE">Female</option>
            <option value="OTHER">Other</option>
            <option value="PREFER_NOT_TO_SAY">Prefer not to say</option>
          </Select>
          <Input label="Height (cm)" name="heightCm" type="number" step="0.1" defaultValue={user.heightCm ?? ""} />
          <Input label="Weight (kg)" name="weightKg" type="number" step="0.1" defaultValue={user.weightKg ?? ""} />
        </div>

        <Select label="Physical activity level" name="activityLevel" defaultValue={user.activityLevel ?? ""}>
          <option value="">Not set</option>
          <option value="SEDENTARY">Sedentary (little to no exercise)</option>
          <option value="LIGHT">Lightly active (1-3 days/week)</option>
          <option value="MODERATE">Moderately active (3-5 days/week)</option>
          <option value="ACTIVE">Active (6-7 days/week)</option>
          <option value="VERY_ACTIVE">Very active (hard exercise/training)</option>
        </Select>

        <Button type="submit" className="self-start">
          Save changes
        </Button>
      </form>
    </div>
  );
}

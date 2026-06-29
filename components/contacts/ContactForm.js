import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

export function ContactForm({ action, contact, submitLabel = "Save" }) {
  return (
    <form action={action} className="flex flex-col gap-4 max-w-lg">
      <div className="grid grid-cols-2 gap-4">
        <Input
          label="First name"
          name="firstName"
          defaultValue={contact?.firstName}
          required
        />
        <Input
          label="Last name"
          name="lastName"
          defaultValue={contact?.lastName}
          required
        />
      </div>
      <Input
        label="Email"
        name="email"
        type="email"
        defaultValue={contact?.email ?? ""}
      />
      <Input label="Phone" name="phone" defaultValue={contact?.phone ?? ""} />
      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Company"
          name="company"
          defaultValue={contact?.company ?? ""}
        />
        <Input
          label="Job title"
          name="jobTitle"
          defaultValue={contact?.jobTitle ?? ""}
        />
      </div>
      <div>
        <Button type="submit">{submitLabel}</Button>
      </div>
    </form>
  );
}

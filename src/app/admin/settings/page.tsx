import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { RegistrationToggle } from "./registration-toggle";
import { ReviewDeadlines } from "./review-deadlines";

export default async function AdminSettingsPage() {
  await requireAdmin();

  const supabase = await createClient();

  const [{ data: settings }, { data: reviews }] = await Promise.all([
    supabase
      .from("app_settings")
      .select("registration_open")
      .eq("id", 1)
      .single(),
    supabase
      .from("reviews")
      .select("review_number, title, upload_deadline")
      .order("review_number"),
  ]);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-semibold tracking-tight text-primary">
          Settings
        </h1>
        <p className="mt-1 text-sm text-secondary">
          Control registration and each review&apos;s upload deadline
        </p>
      </div>

      <div className="space-y-8">
        <RegistrationToggle open={settings?.registration_open ?? false} />

        <div>
          <h2 className="text-xl font-semibold tracking-tight text-primary mb-4">
            Review Deadlines
          </h2>
          <ReviewDeadlines reviews={reviews ?? []} />
        </div>
      </div>
    </div>
  );
}

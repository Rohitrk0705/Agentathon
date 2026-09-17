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
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-mono uppercase tracking-widest text-accent font-semibold">
            Platform Settings
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-primary">
          Event Controls & Deadlines
        </h1>
        <p className="mt-1 text-xs sm:text-sm text-secondary">
          Configure team registration availability and manage stage upload lockouts
        </p>
      </div>

      <div className="space-y-8">
        {/* Registration Gating */}
        <section>
          <RegistrationToggle open={settings?.registration_open ?? false} />
        </section>

        {/* 3 Review Deadlines */}
        <section className="space-y-4">
          <div>
            <h2 className="text-lg font-bold tracking-tight text-primary">
              Stage Review Deadlines
            </h2>
            <p className="text-xs text-secondary mt-0.5">
              Set cutoffs in local time. When deadline passes, candidate submissions automatically lock.
            </p>
          </div>
          <ReviewDeadlines reviews={reviews ?? []} />
        </section>
      </div>
    </div>
  );
}

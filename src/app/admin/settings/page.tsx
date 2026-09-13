import Link from "next/link";
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
    <main className="mx-auto max-w-2xl p-8">
      <Link href="/admin" className="text-sm text-gray-500 hover:underline">
        ← Back to admin
      </Link>

      <h1 className="mt-2 text-xl font-semibold">Settings</h1>
      <p className="mt-1 text-sm text-gray-500">
        Control registration and each review&apos;s upload deadline.
      </p>

      <div className="mt-6">
        <RegistrationToggle open={settings?.registration_open ?? false} />
      </div>

      <div className="mt-8">
        <ReviewDeadlines reviews={reviews ?? []} />
      </div>
    </main>
  );
}

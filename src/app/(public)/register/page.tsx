import Link from "next/link";
import { redirect } from "next/navigation";
import { getUserAndProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { RegisterForm } from "./register-form";

export default async function RegisterPage() {
  const result = await getUserAndProfile();

  if (result) {
    redirect(result.profile.role === "admin" ? "/admin" : "/dashboard");
  }

  const supabase = await createClient();

  const [{ data: settings }, { data: tracks }] = await Promise.all([
    supabase.from("app_settings").select("registration_open").eq("id", 1).single(),
    supabase.from("tracks").select("id, title").order("title", { ascending: true }),
  ]);

  if (!settings?.registration_open) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
        <div className="w-full max-w-sm space-y-4 text-center">
          <h1 className="text-2xl font-semibold text-gray-900">
            Registration is closed
          </h1>
          <p className="text-sm text-gray-500">
            The organizers have closed registration for this event.
          </p>
          <Link href="/login" className="text-sm text-blue-600 hover:underline">
            Back to login
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-10">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-gray-900">
            Register your team
          </h1>
          <p className="mt-1 text-sm text-gray-500">Agentathon</p>
        </div>
        <RegisterForm tracks={tracks ?? []} />
      </div>
    </main>
  );
}

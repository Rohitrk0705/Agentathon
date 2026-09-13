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
      <div className="w-full max-w-sm">
        <div className="rounded-lg border border-border-subtle bg-surface p-6 md:p-8 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-surface-hover">
            <svg className="h-6 w-6 text-muted" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
          </div>
          <h1 className="text-xl font-semibold tracking-tight text-primary">
            Registration is closed
          </h1>
          <p className="mt-2 text-sm text-secondary">
            The organizers have closed registration for this event.
          </p>
          <Link
            href="/login"
            className="mt-4 inline-flex items-center rounded-md border border-border-subtle bg-transparent px-4 py-2 text-sm text-primary hover:bg-surface-hover transition-colors duration-150"
          >
            Back to login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-lg">
      <div className="rounded-lg border border-border-subtle bg-surface p-6 md:p-8">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-semibold tracking-tight text-primary">
            Register your team
          </h1>
          <p className="mt-1 text-sm text-secondary">Agentathon</p>
        </div>
        <RegisterForm tracks={tracks ?? []} />
      </div>
    </div>
  );
}

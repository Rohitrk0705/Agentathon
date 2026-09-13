import Link from "next/link";
import { redirect } from "next/navigation";
import { getUserAndProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { LoginForm } from "./login-form";

export default async function LoginPage() {
  const result = await getUserAndProfile();

  if (result) {
    redirect(result.profile.role === "admin" ? "/admin" : "/dashboard");
  }

  const supabase = await createClient();
  const { data: settings } = await supabase
    .from("app_settings")
    .select("registration_open")
    .eq("id", 1)
    .single();
  const registrationOpen = settings?.registration_open ?? false;

  return (
    <div className="w-full max-w-sm">
      <div className="rounded-lg border border-border-subtle bg-surface p-6 md:p-8">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-semibold tracking-tight text-primary">
            Sign in
          </h1>
          <p className="mt-1 text-sm text-secondary">
            Agentathon submission portal
          </p>
        </div>

        <LoginForm />

        <div className="mt-6 pt-6 border-t border-border-subtle text-center">
          {registrationOpen ? (
            <div className="space-y-2">
              <p className="text-xs text-muted">New to Agentathon?</p>
              <Link
                href="/register"
                className="inline-flex items-center justify-center w-full rounded-md border border-border-subtle bg-transparent px-4 py-2 text-sm text-primary hover:bg-surface-hover hover:border-border-strong transition-colors duration-150"
              >
                Register your team
              </Link>
            </div>
          ) : (
            <p className="text-sm text-muted">
              Registration is currently closed
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

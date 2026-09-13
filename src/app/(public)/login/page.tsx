import { redirect } from "next/navigation";
import { getUserAndProfile } from "@/lib/auth";
import { LoginForm } from "./login-form";

export default async function LoginPage() {
  const result = await getUserAndProfile();

  if (result) {
    redirect(result.profile.role === "admin" ? "/admin" : "/dashboard");
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-gray-900">Log in</h1>
          <p className="mt-1 text-sm text-gray-500">
            Agentathon submission portal
          </p>
        </div>
        <LoginForm />
      </div>
    </main>
  );
}

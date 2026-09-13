import Link from "next/link";
import { redirect } from "next/navigation";
import { getUserAndProfile } from "@/lib/auth";
import { getRegisterPageData } from "./actions";
import { RegisterForm } from "./register-form";

export default async function RegisterPage() {
  const result = await getUserAndProfile();

  if (result) {
    redirect(result.profile.role === "admin" ? "/admin" : "/dashboard");
  }

  const { registrationOpen, tracks } = await getRegisterPageData();

  if (!registrationOpen) {
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
        <RegisterForm tracks={tracks} />
      </div>
    </main>
  );
}

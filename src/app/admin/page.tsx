import Link from "next/link";

export default function AdminPage() {
  return (
    <main className="p-8">
      <h1 className="text-xl font-semibold">Admin</h1>

      <nav className="mt-4 flex gap-4">
        <Link href="/admin/tracks" className="text-sm text-blue-600 hover:underline">
          Tracks
        </Link>
        <Link href="/admin/settings" className="text-sm text-blue-600 hover:underline">
          Settings
        </Link>
      </nav>

      <form action="/logout" method="POST" className="mt-4">
        <button
          type="submit"
          className="rounded-md border border-gray-300 px-3 py-1.5 text-sm"
        >
          Sign out
        </button>
      </form>
    </main>
  );
}

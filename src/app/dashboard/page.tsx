export default function DashboardPage() {
  return (
    <main className="p-8">
      <h1 className="text-xl font-semibold">Dashboard</h1>
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

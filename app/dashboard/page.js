import { getCurrentUser } from "@/lib/auth";
import AppShell from "@/components/AppShell";

export default async function DashboardPage() {
  const user = await getCurrentUser();

  return (
    <AppShell user={user}>
      <div className="border-b bg-white">
        <div className="px-6 py-6 lg:px-8">
          <h1 className="text-2xl font-bold text-slate-900">
            Dashboard
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Welcome back, {user?.name}.
          </p>
        </div>
      </div>

      <div className="p-6 lg:p-8">
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {[
            ["Active Clients", "0"],
            ["Open Engagements", "0"],
            ["Filings Due", "0"],
            ["Outstanding Payments", "₦0"],
          ].map(([title, value]) => (
            <div
              key={title}
              className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <p className="text-sm text-slate-500">{title}</p>

              <p className="mt-3 text-3xl font-bold text-slate-900">
                {value}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-8 rounded-xl border border-slate-200 bg-white p-8">
          <h2 className="text-lg font-semibold text-slate-900">
            Practice Overview
          </h2>

          <p className="mt-2 text-sm text-slate-500">
            Your firm-wide activity and outstanding work will appear here.
          </p>
        </div>
      </div>
    </AppShell>
  );
}
import Link from "next/link";
import {
  Building2,
  Users,
  ShieldCheck,
  LockKeyhole,
  ChevronRight,
} from "lucide-react";

import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import AppShell from "@/components/AppShell";

export default async function SettingsPage() {
  const user = await getCurrentUser();
  if (!user) {
  redirect("/login");
}

if (
  user.role !== "admin" &&
  user.role !== "manager"
) {
  redirect("/dashboard");
}

  if (!user) {
    return null;
  }

  return (
    <AppShell user={user}>
      <div className="border-b border-slate-200 bg-white">
        <div className="px-6 py-7 lg:px-8">
          <p className="text-sm font-medium text-slate-500">
            Administration
          </p>

          <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">
            Settings
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Manage your practice, team access and system
            preferences.
          </p>
        </div>
      </div>

      <div className="p-6 lg:p-8">
        <div className="grid gap-6 lg:grid-cols-2">
          <SettingsCard
            href="/settings/practice"
            icon={Building2}
            title="Practice Information"
            description="Manage your firm name, contact details and practice information."
          />

          <SettingsCard
            href="/settings/staff"
            icon={Users}
            title="Staff & Users"
            description="Add team members, manage accounts and control user access."
          />

          <SettingsCard
            href="/settings/permissions"
            icon={ShieldCheck}
            title="Roles & Permissions"
            description="Define what administrators, managers and staff can access."
          />

          <SettingsCard
            href="/settings/security"
            icon={LockKeyhole}
            title="Security"
            description="Manage passwords, account security and other security settings."
          />
        </div>

        <div className="mt-8 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-sm font-semibold text-slate-900">
            Your Account
          </h2>

          <div className="mt-4 flex items-center gap-4">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-slate-900 text-sm font-semibold text-white">
              {user.name
                ?.charAt(0)
                ?.toUpperCase()}
            </div>

            <div>
              <p className="text-sm font-semibold text-slate-900">
                {user.name}
              </p>

              <p className="text-xs text-slate-500">
                {user.email}
              </p>
            </div>

            <span className="ml-auto rounded-full bg-purple-50 px-3 py-1 text-xs font-semibold capitalize text-purple-700">
              {user.role}
            </span>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

function SettingsCard({
  href,
  icon: Icon,
  title,
  description,
}) {
  return (
    <Link
      href={href}
      className="group flex items-start gap-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md"
    >
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-600 transition group-hover:bg-slate-900 group-hover:text-white">
        <Icon size={20} />
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-3">
          <h2 className="font-semibold text-slate-900">
            {title}
          </h2>

          <ChevronRight
            size={17}
            className="shrink-0 text-slate-400 transition group-hover:translate-x-0.5 group-hover:text-slate-700"
          />
        </div>

        <p className="mt-1.5 text-sm leading-6 text-slate-500">
          {description}
        </p>
      </div>
    </Link>
  );
}
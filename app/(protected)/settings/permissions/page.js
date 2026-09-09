"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  ShieldCheck,
  Check,
  Lock,
} from "lucide-react";



const permissions = [
  ["dashboard", "Dashboard"],
  ["clients", "Clients"],
  ["engagements", "Engagements"],
  ["filings", "Filing Tracker"],
  ["billing", "Payments & Billing"],
  ["documents", "Documents"],
  ["reports", "Reports"],
  ["staffManagement", "Staff & Users"],
  ["practiceSettings", "Practice Information"],
  ["permissions", "Roles & Permissions"],
  ["security", "Security"],
];

const roleRules = {
  admin: {
    dashboard: true,
    clients: true,
    engagements: true,
    filings: true,
    billing: true,
    documents: true,
    reports: true,
    staffManagement: true,
    practiceSettings: true,
    permissions: true,
    security: true,
  },

  manager: {
    dashboard: true,
    clients: true,
    engagements: true,
    filings: true,
    billing: true,
    documents: true,
    reports: true,
    staffManagement: false,
    practiceSettings: false,
    permissions: false,
    security: true,
  },

  staff: {
    dashboard: true,
    clients: true,
    engagements: true,
    filings: true,
    billing: true,
    documents: true,
    reports: false,
    staffManagement: false,
    practiceSettings: false,
    permissions: false,
    security: true,
  },
};

export default function PermissionsPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
  async function load() {
    try {
      const response =
        await fetch("/api/auth/me");

      const data =
        await response.json();

      if (!response.ok) {
        router.push("/login");
        return;
      }

      setUser(data.user);

      if (data.user.role !== "admin") {
        router.push("/dashboard");
        return;
      }
    } finally {
      setLoading(false);
    }
  }

  load();
}, [router]);


  if (loading) {
    return (
      <main user={user}>
        <div className="flex min-h-screen items-center justify-center">
          <p className="text-sm text-slate-500">
            Loading permissions...
          </p>
        </div>
      </main>
    );
  }

  return (
    <main user={user}>
      <div className="border-b border-slate-200 bg-white">
        <div className="px-6 py-7 lg:px-8">
          <p className="text-sm font-medium text-slate-500">
            Settings
          </p>

          <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">
            Roles & Permissions
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            See what each role can access within TPM.
          </p>
        </div>
      </div>

      <div className="p-6 lg:p-8">
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center gap-3 border-b border-slate-100 px-5 py-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
              <ShieldCheck size={19} />
            </div>

            <div>
              <h2 className="font-semibold text-slate-900">
                Access Matrix
              </h2>

              <p className="text-xs text-slate-500">
                Current system-level role access.
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-175">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50">
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Module
                  </th>

                  <th className="px-5 py-3 text-center text-xs font-semibold uppercase tracking-wide text-purple-600">
                    Admin
                  </th>

                  <th className="px-5 py-3 text-center text-xs font-semibold uppercase tracking-wide text-blue-600">
                    Manager
                  </th>

                  <th className="px-5 py-3 text-center text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Staff
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {permissions.map(
                  ([key, label]) => (
                    <tr key={key}>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          {roleRules.admin[key] && (
                            <Lock
                              size={14}
                              className="text-slate-400"
                            />
                          )}

                          <span className="text-sm font-medium text-slate-800">
                            {label}
                          </span>
                        </div>
                      </td>

                      <PermissionCell
                        allowed={
                          roleRules.admin[key]
                        }
                      />

                      <PermissionCell
                        allowed={
                          roleRules.manager[key]
                        }
                      />

                      <PermissionCell
                        allowed={
                          roleRules.staff[key]
                        }
                      />
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-5">
          <p className="text-sm font-semibold text-amber-900">
            Permission model
          </p>

          <p className="mt-1 text-sm leading-6 text-amber-800">
            These are the initial role-level permissions.
            We will later add more granular controls,
            including assignment-based access to clients,
            engagements, filings and documents.
          </p>
        </div>
      </div>
    </main>
  );
}

function PermissionCell({ allowed }) {
  return (
    <td className="px-5 py-4 text-center">
      {allowed ? (
        <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
          <Check size={15} />
        </span>
      ) : (
        <span className="text-slate-300">
          —
        </span>
      )}
    </td>
  );
}
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  BriefcaseBusiness,
  FileCheck2,
  CreditCard,
  FolderOpen,
  BarChart3,
  Settings,
  LogOut,
  Menu,
  X,
} from "lucide-react";

const navigation = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    name: "Clients",
    href: "/clients",
    icon: Users,
  },
  {
    name: "Engagements",
    href: "/engagements",
    icon: BriefcaseBusiness,
  },
  {
    name: "Filing Tracker",
    href: "/filings",
    icon: FileCheck2,
  },
  {
    name: "Payments",
    href: "/payments",
    icon: CreditCard,
  },
  {
    name: "Documents",
    href: "/documents",
    icon: FolderOpen,
  },
  {
    name: "Reports",
    href: "/reports",
    icon: BarChart3,
  },
  {
    name: "Settings",
    href: "/settings",
    icon: Settings,
  },
];

export default function AppShell({ user, children }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/auth/logout", {
      method: "POST",
    });

    router.push("/login");
  }

  return (
    <div className="min-h-screen bg-slate-100">
      {/* Mobile header */}
      <div className="flex items-center justify-between border-b bg-white px-4 py-4 lg:hidden">
        <div>
          <h1 className="font-bold text-slate-900">
            Tzaddy Consulting
          </h1>
          <p className="text-xs text-slate-500">
            Practice Manager
          </p>
        </div>

        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="rounded-lg p-2 hover:bg-slate-100"
        >
          {mobileOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 transform border-r bg-white transition-transform lg:translate-x-0 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="border-b px-6 py-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-sm font-bold text-white">
                T
              </div>

              <div>
                <h1 className="font-bold text-slate-900">
                  Tzaddy Consulting
                </h1>
                <p className="text-xs text-slate-500">
                  Practice Manager
                </p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-5">
            {navigation.map((item) => {
              const Icon = item.icon;

              return (
                <a
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
                >
                  <Icon size={19} />
                  {item.name}
                </a>
              );
            })}
          </nav>

          {/* User */}
          <div className="border-t p-4">
            <div className="mb-3 flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-200 font-semibold text-slate-700">
                {user?.name?.charAt(0)?.toUpperCase() || "U"}
              </div>

              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-slate-900">
                  {user?.name}
                </p>

                <p className="truncate text-xs capitalize text-slate-500">
                  {user?.role}
                </p>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-slate-600 transition hover:bg-red-50 hover:text-red-600"
            >
              <LogOut size={18} />
              Sign out
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="lg:pl-64">
        <main className="min-h-screen">
          {children}
        </main>
      </div>
    </div>
  );
}
"use client";

import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
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
  ChevronRight,
} from "lucide-react";

import { hasPermission } from "@/lib/permissions";

const navigation = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    permission: "dashboard",
  },
  {
    name: "Clients",
    href: "/clients",
    icon: Users,
    permission: "clients",
  },
  {
    name: "Engagements",
    href: "/engagements",
    icon: BriefcaseBusiness,
    permission: "engagements",
  },
  {
    name: "Filing Tracker",
    href: "/filings",
    icon: FileCheck2,
    permission: "filings",
  },
  {
    name: "Payments & Billing",
    href: "/payments",
    icon: CreditCard,
    permission: "billing",
  },
  {
    name: "Documents",
    href: "/documents",
    icon: FolderOpen,
    permission: "documents",
  },
  {
    name: "Reports",
    href: "/reports",
    icon: BarChart3,
    permission: "reports",
  },
  {
    name: "Settings",
    href: "/settings",
    icon: Settings,
    permission: "settings",
  },
];

export default function AppShell({
  user,
  children,
}) {
  const pathname = usePathname();
  const router = useRouter();

  const [mobileOpen, setMobileOpen] =
    useState(false);

  async function handleLogout() {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
      });
    } finally {
      router.push("/login");
    }
  }

  function isActive(href) {
    if (href === "/dashboard") {
      return pathname === "/dashboard";
    }

    return (
      pathname === href ||
      pathname.startsWith(`${href}/`)
    );
  }

  const visibleNavigation =
    navigation.filter((item) => {
      if (item.permission === "settings") {
        return (
          user?.role === "admin" ||
          user?.role === "manager"
        );
      }

      return hasPermission(
        user?.role,
        item.permission
      );
    });

  const userInitial =
    user?.name
      ?.charAt(0)
      ?.toUpperCase() || "U";

  return (
    <div className="min-h-screen bg-slate-50">
      {/* MOBILE HEADER */}
      <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200 bg-white px-4 lg:hidden">
        <button
          onClick={() =>
            setMobileOpen(true)
          }
          className="rounded-lg p-2 text-slate-600 hover:bg-slate-100"
          aria-label="Open navigation"
        >
          <Menu size={22} />
        </button>

        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-900 text-xs font-bold text-white">
            T
          </div>

          <span className="text-sm font-bold text-slate-900">
            Tzaddy Consulting
          </span>
        </div>

        <div className="w-9" />
      </header>

      {/* MOBILE OVERLAY */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/40 lg:hidden"
          onClick={() =>
            setMobileOpen(false)
          }
        />
      )}

      {/* SIDEBAR */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-slate-200 bg-white transition-transform duration-200 ${
          mobileOpen
            ? "translate-x-0"
            : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div className="flex h-20 items-center border-b border-slate-200 px-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-sm font-bold text-white">
              T
            </div>

            <div>
              <p className="text-sm font-bold tracking-tight text-slate-900">
                Tzaddy Consulting
              </p>

              <p className="mt-0.5 text-xs text-slate-500">
                Practice Manager
              </p>
            </div>
          </div>

          <button
            onClick={() =>
              setMobileOpen(false)
            }
            className="ml-auto rounded-lg p-2 text-slate-500 hover:bg-slate-100 lg:hidden"
            aria-label="Close navigation"
          >
            <X size={19} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-3 py-5">
          <p className="mb-3 px-3 text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-400">
            Practice
          </p>

          <nav className="space-y-1">
            {visibleNavigation.map(
              (item) => {
                const Icon = item.icon;
                const active = isActive(
                  item.href
                );

                return (
                  <button
                    key={item.href}
                    onClick={() => {
                      setMobileOpen(false);
                      router.push(
                        item.href
                      );
                    }}
                    className={`group flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium transition ${
                      active
                        ? "bg-slate-900 text-white shadow-sm"
                        : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                    }`}
                  >
                    <Icon
                      size={18}
                      strokeWidth={
                        active ? 2.2 : 1.9
                      }
                    />

                    <span className="flex-1">
                      {item.name}
                    </span>

                    {active && (
                      <ChevronRight
                        size={15}
                        className="opacity-70"
                      />
                    )}
                  </button>
                );
              }
            )}
          </nav>
        </div>

        {/* USER AREA */}
        <div className="border-t border-slate-200 p-4">
          <div className="mb-3 flex items-center gap-3 rounded-xl bg-slate-50 p-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-200 text-sm font-semibold text-slate-700">
              {userInitial}
            </div>

            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-slate-900">
                {user?.name || "User"}
              </p>

              <p className="truncate text-xs capitalize text-slate-500">
                {user?.role || "Staff"}
              </p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-red-50 hover:text-red-600"
          >
            <LogOut size={18} />

            Sign out
          </button>
        </div>
      </aside>

      <div className="lg:pl-64">
        <main className="min-h-screen">
          {children}
        </main>
      </div>
    </div>
  );
}
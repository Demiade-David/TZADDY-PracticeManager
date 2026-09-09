import Link from "next/link";
import {
  Users,
  BriefcaseBusiness,
  FileCheck2,
  Wallet,
  AlertCircle,
  Clock3,
  UserPlus,
  Plus,
  Receipt,
  FolderOpen,
} from "lucide-react";

import { connectDB } from "@/lib/mongodb";
import { getCurrentUser } from "@/lib/auth";

import Client from "@/models/Client";
import Engagement from "@/models/Engagement";
import Filing from "@/models/Filing";
import Invoice from "@/models/Invoice";
import Payment from "@/models/Payment";
import Document from "@/models/Document";



async function getDashboardData() {
  await connectDB();

  const now = new Date();

  const sevenDaysFromNow = new Date(now);
  sevenDaysFromNow.setDate(
    sevenDaysFromNow.getDate() + 7
  );

  const [
    activeClients,
    openEngagements,
    overdueFilings,
    upcomingFilings,
    filedFilings,
    invoiceTotals,
    paymentTotals,
    documentCount,
    recentClients,
    recentEngagements,
    recentFilings,
    recentPayments,
    recentDocuments,
  ] = await Promise.all([
    Client.countDocuments({
      status: "Active",
    }),

    Engagement.countDocuments({
      status: {
        $nin: ["Completed", "Cancelled"],
      },
    }),

    Filing.countDocuments({
      dueDate: {
        $lt: now,
      },
      status: {
        $nin: ["Filed", "Cancelled"],
      },
    }),

    Filing.countDocuments({
      dueDate: {
        $gte: now,
        $lte: sevenDaysFromNow,
      },
      status: {
        $nin: ["Filed", "Cancelled"],
      },
    }),

    Filing.countDocuments({
      status: "Filed",
    }),

    Invoice.aggregate([
      {
        $match: {
          status: {
            $ne: "Cancelled",
          },
        },
      },
      {
        $group: {
          _id: null,
          totalInvoiced: {
            $sum: "$amount",
          },
          totalPaid: {
            $sum: "$amountPaid",
          },
        },
      },
    ]),

    Payment.aggregate([
      {
        $group: {
          _id: null,
          totalCollected: {
            $sum: "$amount",
          },
        },
      },
    ]),

    Document.countDocuments(),

    Client.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select("name createdAt")
      .lean(),

    Engagement.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate("client", "name")
      .select("name status client createdAt")
      .lean(),

    Filing.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate("client", "name")
      .select(
        "taxType filingPeriod status client createdAt"
      )
      .lean(),

    Payment.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate("client", "name")
      .select(
        "amount client paymentDate createdAt"
      )
      .lean(),

    Document.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate("client", "name")
      .select(
        "name documentType client createdAt"
      )
      .lean(),
  ]);

  const totals = invoiceTotals[0] || {
    totalInvoiced: 0,
    totalPaid: 0,
  };

  const totalCollected =
    paymentTotals[0]?.totalCollected || 0;

  const outstanding =
    totals.totalInvoiced -
    totals.totalPaid;

  const recentActivity = [
    ...recentClients.map((item) => ({
      type: "client",
      title: "New client added",
      description: item.name,
      date: item.createdAt,
    })),

    ...recentEngagements.map((item) => ({
      type: "engagement",
      title: "Engagement created",
      description: `${item.name} · ${
        item.client?.name || "Client"
      }`,
      date: item.createdAt,
    })),

    ...recentFilings.map((item) => ({
      type: "filing",
      title: "Filing created",
      description: `${item.taxType} · ${
        item.client?.name || "Client"
      }`,
      date: item.createdAt,
    })),

    ...recentPayments.map((item) => ({
      type: "payment",
      title: "Payment recorded",
      description: `₦${Number(
        item.amount || 0
      ).toLocaleString("en-NG")} · ${
        item.client?.name || "Client"
      }`,
      date: item.createdAt,
    })),

    ...recentDocuments.map((item) => ({
      type: "document",
      title: "Document uploaded",
      description: `${item.name} · ${
        item.client?.name || "Client"
      }`,
      date: item.createdAt,
    })),
  ]
    .sort(
      (a, b) =>
        new Date(b.date).getTime() -
        new Date(a.date).getTime()
    )
    .slice(0, 8);

  return {
    stats: {
      activeClients,
      openEngagements,
      overdueFilings,
      upcomingFilings,
      filedFilings,
      totalInvoiced: totals.totalInvoiced,
      totalCollected,
      outstanding,
      documentCount,
    },

    recentActivity,
  };
}

function formatCurrency(amount) {
  return `₦${Number(
    amount || 0
  ).toLocaleString("en-NG")}`;
}

function formatDate(date) {
  return new Date(date).toLocaleDateString(
    "en-NG",
    {
      day: "numeric",
      month: "short",
      year: "numeric",
    }
  );
}

function activityIcon(type) {
  if (type === "client") return Users;
  if (type === "engagement")
    return BriefcaseBusiness;
  if (type === "filing")
    return FileCheck2;
  if (type === "payment")
    return Wallet;

  return FolderOpen;
}

export default async function DashboardPage() {
  const user = await getCurrentUser();

  if (!user) {
    return null;
  }

  const data = await getDashboardData();

  const stats = data.stats;
  const activity = data.recentActivity || [];

  const firstName =
    user.name?.split(" ")[0] || "there";

  const today = new Date().toLocaleDateString(
    "en-NG",
    {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    }
  );

  return (
    <main user={user}>
      <div className="border-b border-slate-200 bg-white">
        <div className="px-6 py-7 lg:px-8">
          <p className="text-sm font-medium text-slate-500">
            Practice overview
          </p>

          <div className="mt-1 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                Good Day, {firstName}.
              </h1>

              <p className="mt-1 text-sm text-slate-500">
                Here&apos;s what&apos;s happening across
                Tzaddy Consulting.
              </p>
            </div>

            <div className="text-sm text-slate-400">
              {today}
            </div>
          </div>
        </div>
      </div>

      <div className="p-6 lg:p-8">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            title="Active Clients"
            value={stats.activeClients}
            icon={Users}
            href="/clients"
          />

          <StatCard
            title="Open Engagements"
            value={stats.openEngagements}
            icon={BriefcaseBusiness}
            href="/engagements"
          />

          <StatCard
            title="Filings Due Soon"
            value={stats.upcomingFilings}
            icon={FileCheck2}
            href="/filings"
          />

          <StatCard
            title="Outstanding"
            value={formatCurrency(
              stats.outstanding
            )}
            icon={Wallet}
            href="/payments"
          />
        </div>

        <div className="mt-6 grid gap-6 xl:grid-cols-2">
          <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
              <div>
                <h2 className="font-semibold text-slate-900">
                  Work Queue
                </h2>

                <p className="mt-0.5 text-xs text-slate-500">
                  Items requiring attention
                </p>
              </div>

              <Link
                href="/engagements"
                className="text-xs font-semibold text-slate-600 hover:text-slate-900"
              >
                View engagements →
              </Link>
            </div>

            <div className="divide-y divide-slate-100">
              <QueueItem
                icon={AlertCircle}
                label="Overdue filings"
                value={stats.overdueFilings}
                description="Need immediate attention"
                tone="danger"
              />

              <QueueItem
                icon={Clock3}
                label="Filings due this week"
                value={stats.upcomingFilings}
                description="Due within the next 7 days"
                tone="warning"
              />

              <QueueItem
                icon={BriefcaseBusiness}
                label="Open engagements"
                value={stats.openEngagements}
                description="Active client work"
                tone="neutral"
              />
            </div>
          </section>

          <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
              <div>
                <h2 className="font-semibold text-slate-900">
                  Compliance
                </h2>

                <p className="mt-0.5 text-xs text-slate-500">
                  Filing position across the practice
                </p>
              </div>

              <Link
                href="/filings"
                className="text-xs font-semibold text-slate-600 hover:text-slate-900"
              >
                Filing tracker →
              </Link>
            </div>

            <div className="grid grid-cols-3 divide-x divide-slate-100">
              <ComplianceStat
                label="Overdue"
                value={stats.overdueFilings}
              />

              <ComplianceStat
                label="Due Soon"
                value={stats.upcomingFilings}
              />

              <ComplianceStat
                label="Filed"
                value={stats.filedFilings}
              />
            </div>

            <div className="border-t border-slate-100 px-5 py-5">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500">
                  Documents in practice
                </span>

                <span className="font-semibold text-slate-900">
                  {stats.documentCount}
                </span>
              </div>
            </div>
          </section>
        </div>

        <section className="mt-6 rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 px-5 py-4">
            <h2 className="font-semibold text-slate-900">
              Billing Overview
            </h2>

            <p className="mt-0.5 text-xs text-slate-500">
              Current invoicing and collections position
            </p>
          </div>

          <div className="grid divide-y divide-slate-100 sm:grid-cols-3 sm:divide-x sm:divide-y-0">
            <BillingStat
              label="Total Invoiced"
              value={formatCurrency(
                stats.totalInvoiced
              )}
            />

            <BillingStat
              label="Collected"
              value={formatCurrency(
                stats.totalCollected
              )}
            />

            <BillingStat
              label="Outstanding"
              value={formatCurrency(
                stats.outstanding
              )}
            />
          </div>
        </section>

        <section className="mt-6 rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 px-5 py-4">
            <h2 className="font-semibold text-slate-900">
              Recent Activity
            </h2>

            <p className="mt-0.5 text-xs text-slate-500">
              Latest activity recorded in the practice
            </p>
          </div>

          {activity.length === 0 ? (
            <div className="px-5 py-10 text-center">
              <p className="text-sm text-slate-500">
                No recent activity yet.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {activity.map((item, index) => {
                const Icon = activityIcon(
                  item.type
                );

                return (
                  <div
                    key={`${item.type}-${item.date}-${index}`}
                    className="flex items-center gap-4 px-5 py-4"
                  >
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
                      <Icon size={17} />
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-slate-900">
                        {item.title}
                      </p>

                      <p className="mt-0.5 truncate text-xs text-slate-500">
                        {item.description}
                      </p>
                    </div>

                    <p className="shrink-0 text-xs text-slate-400">
                      {formatDate(item.date)}
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        <section className="mt-6">
          <div className="mb-3">
            <h2 className="font-semibold text-slate-900">
              Quick Actions
            </h2>

            <p className="mt-0.5 text-xs text-slate-500">
              Get common practice tasks started quickly.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <QuickAction
              href="/clients"
              icon={UserPlus}
              title="New Client"
              description="Add a client"
            />

            <QuickAction
              href="/engagements"
              icon={Plus}
              title="New Engagement"
              description="Start client work"
            />

            <QuickAction
              href="/filings"
              icon={FileCheck2}
              title="New Filing"
              description="Create compliance work"
            />

            <QuickAction
              href="/payments"
              icon={Receipt}
              title="New Invoice"
              description="Raise an invoice"
            />
          </div>
        </section>
      </div>
    </main>
  );
}

function StatCard({
  title,
  value,
  icon: Icon,
  href,
}) {
  return (
    <Link
      href={href}
      className="group rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md"
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-slate-500">
            {title}
          </p>

          <p className="mt-3 text-2xl font-bold tracking-tight text-slate-900">
            {value}
          </p>
        </div>

        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 text-slate-600 transition group-hover:bg-slate-900 group-hover:text-white">
          <Icon size={19} />
        </div>
      </div>
    </Link>
  );
}

function QueueItem({
  icon: Icon,
  label,
  value,
  description,
  tone,
}) {
  const toneClasses = {
    danger: "bg-red-50 text-red-600",
    warning: "bg-amber-50 text-amber-600",
    neutral: "bg-slate-100 text-slate-600",
  };

  return (
    <div className="flex items-center gap-4 px-5 py-4">
      <div
        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
          toneClasses[tone]
        }`}
      >
        <Icon size={17} />
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-slate-900">
          {label}
        </p>

        <p className="mt-0.5 text-xs text-slate-500">
          {description}
        </p>
      </div>

      <span className="text-xl font-bold text-slate-900">
        {value}
      </span>
    </div>
  );
}

function ComplianceStat({
  label,
  value,
}) {
  return (
    <div className="px-4 py-6 text-center">
      <p className="text-2xl font-bold text-slate-900">
        {value}
      </p>

      <p className="mt-1 text-xs text-slate-500">
        {label}
      </p>
    </div>
  );
}

function BillingStat({
  label,
  value,
}) {
  return (
    <div className="px-5 py-5">
      <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
        {label}
      </p>

      <p className="mt-2 text-xl font-bold text-slate-900">
        {value}
      </p>
    </div>
  );
}

function QuickAction({
  href,
  icon: Icon,
  title,
  description,
}) {
  return (
    <Link
      href={href}
      className="group flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-slate-300 hover:shadow-md"
    >
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-600 transition group-hover:bg-slate-900 group-hover:text-white">
        <Icon size={18} />
      </div>

      <div>
        <p className="text-sm font-semibold text-slate-900">
          {title}
        </p>

        <p className="mt-0.5 text-xs text-slate-500">
          {description}
        </p>
      </div>
    </Link>
  );
}
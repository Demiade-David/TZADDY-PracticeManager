"use client";

import { useEffect, useState } from "react";
import AppShell from "@/components/AppShell";
import {
  Plus,
  Search,
  X,
  BriefcaseBusiness,
  Check,
  RotateCcw,
} from "lucide-react";

const initialForm = {
  client: "",
  name: "",
  service: "",
  startDate: "",
  dueDate: "",
  status: "Not Started",
  priority: "Medium",
  fee: "",
  notes: "",
};

const priorities = [
  "Low",
  "Medium",
  "High",
  "Urgent",
];

export default function EngagementsPage() {
  const [engagements, setEngagements] = useState([]);
  const [clients, setClients] = useState([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("Active");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [updatingId, setUpdatingId] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    Promise.all([
      fetch("/api/engagements"),
      fetch("/api/clients"),
    ])
      .then(async ([engagementResponse, clientResponse]) => {
        const engagementData = await engagementResponse.json();
        const clientData = await clientResponse.json();

        if (!engagementResponse.ok) {
          throw new Error(
            engagementData.error || "Unable to load engagements"
          );
        }

        if (!clientResponse.ok) {
          throw new Error(
            clientData.error || "Unable to load clients"
          );
        }

        return { engagementData, clientData };
      })
      .then(({ engagementData, clientData }) => {
        if (!cancelled) {
          setEngagements(engagementData);
          setClients(clientData);
        }
      })
      .catch((error) => {
        console.error(error);

        if (!cancelled) {
          setError(error.message);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  function updateField(field, value) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  async function handleSubmit(e) {
    e.preventDefault();

    setSaving(true);
    setError("");

    try {
      const response = await fetch(
        "/api/engagements",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(form),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            "Unable to create engagement"
        );
      }

      setEngagements((current) => [
        ...current,
        data,
      ]);

      setForm(initialForm);
      setShowForm(false);
    } catch (error) {
      console.error(error);
      setError(error.message);
    } finally {
      setSaving(false);
    }
  }

  async function updateStatus(id, status) {
    try {
      setUpdatingId(id);
      setError("");

      const response = await fetch(
        "/api/engagements",
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            id,
            status,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            "Unable to update engagement"
        );
      }

      setEngagements((current) =>
        current.map((engagement) =>
          engagement._id === id
            ? data
            : engagement
        )
      );
    } catch (error) {
      console.error(error);
      setError(error.message);
    } finally {
      setUpdatingId(null);
    }
  }

  const filteredEngagements =
    engagements.filter((engagement) => {
      const term = search.toLowerCase();

      const matchesSearch =
        engagement.name
          ?.toLowerCase()
          .includes(term) ||
        engagement.service
          ?.toLowerCase()
          .includes(term) ||
        engagement.client?.name
          ?.toLowerCase()
          .includes(term);

      const matchesFilter =
        filter === "All"
          ? true
          : filter === "Active"
          ? ![
              "Completed",
              "Cancelled",
            ].includes(engagement.status)
          : filter === "Completed"
          ? engagement.status === "Completed"
          : engagement.status === "Cancelled"
          ? engagement.status === "Cancelled"
          : true;

      return matchesSearch && matchesFilter;
    });

  return (
    <AppShell>
      <div className="border-b bg-white">
        <div className="flex flex-col gap-4 px-6 py-6 lg:px-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">
                Engagements
              </h1>

              <p className="mt-1 text-sm text-slate-500">
                Manage client work and assignments.
              </p>
            </div>

            <button
              onClick={() => setShowForm(true)}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-slate-800"
            >
              <Plus size={18} />
              New Engagement
            </button>
          </div>

          <div className="flex flex-wrap gap-2">
            {["Active", "Completed", "All"].map(
              (option) => (
                <button
                  key={option}
                  onClick={() =>
                    setFilter(option)
                  }
                  className={`rounded-lg px-4 py-2 text-sm font-medium ${
                    filter === option
                      ? "bg-slate-900 text-white"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {option}
                </button>
              )
            )}
          </div>
        </div>
      </div>

      <div className="p-6 lg:p-8">
        {error && (
          <div className="mb-5 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="mb-6 grid gap-4 sm:grid-cols-3">
          <SummaryCard
            label="Active"
            value={
              engagements.filter(
                (item) =>
                  ![
                    "Completed",
                    "Cancelled",
                  ].includes(item.status)
              ).length
            }
          />

          <SummaryCard
            label="Completed"
            value={
              engagements.filter(
                (item) =>
                  item.status === "Completed"
              ).length
            }
          />

          <SummaryCard
            label="Total"
            value={engagements.length}
          />
        </div>

        <div className="mb-6 flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3">
          <Search
            size={19}
            className="text-slate-400"
          />

          <input
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
            placeholder="Search engagements..."
            className="w-full bg-transparent text-sm outline-none"
          />
        </div>

        {loading ? (
          <div className="rounded-xl border bg-white p-10 text-center text-sm text-slate-500">
            Loading engagements...
          </div>
        ) : filteredEngagements.length === 0 ? (
          <div className="rounded-xl border bg-white p-12 text-center">
            <BriefcaseBusiness
              size={40}
              className="mx-auto text-slate-300"
            />

            <h2 className="mt-4 font-semibold text-slate-900">
              No engagements found
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              {filter === "Completed"
                ? "No completed engagements yet."
                : "Create your first engagement to get started."}
            </p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="border-b bg-slate-50">
                  <tr>
                    <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Engagement
                    </th>

                    <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Client
                    </th>

                    <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Due Date
                    </th>

                    <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Priority
                    </th>

                    <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Status
                    </th>

                    <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Action
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y">
                  {filteredEngagements.map(
                    (engagement) => (
                      <tr
                        key={engagement._id}
                        className="hover:bg-slate-50"
                      >
                        <td className="px-5 py-4">
                          <p className="font-medium text-slate-900">
                            {engagement.name}
                          </p>

                          <p className="mt-1 text-xs text-slate-500">
                            {engagement.service}
                          </p>
                        </td>

                        <td className="px-5 py-4 text-sm text-slate-600">
                          {engagement.client?.name ||
                            "—"}
                        </td>

                        <td className="px-5 py-4 text-sm text-slate-600">
                          {engagement.dueDate
                            ? new Date(
                                engagement.dueDate
                              ).toLocaleDateString()
                            : "—"}
                        </td>

                        <td className="px-5 py-4 text-sm text-slate-600">
                          {engagement.priority}
                        </td>

                        <td className="px-5 py-4">
                          <span
                            className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
                              engagement.status ===
                              "Completed"
                                ? "bg-green-100 text-green-700"
                                : "bg-slate-100 text-slate-700"
                            }`}
                          >
                            {engagement.status}
                          </span>
                        </td>

                        <td className="px-5 py-4">
                          {engagement.status ===
                          "Completed" ? (
                            <button
                              disabled={
                                updatingId ===
                                engagement._id
                              }
                              onClick={() =>
                                updateStatus(
                                  engagement._id,
                                  "In Progress"
                                )
                              }
                              className="inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 disabled:opacity-50"
                            >
                              <RotateCcw
                                size={14}
                              />
                              Reopen
                            </button>
                          ) : (
                            <button
                              disabled={
                                updatingId ===
                                engagement._id
                              }
                              onClick={() =>
                                updateStatus(
                                  engagement._id,
                                  "Completed"
                                )
                              }
                              className="inline-flex items-center gap-2 rounded-lg bg-green-600 px-3 py-2 text-xs font-medium text-white hover:bg-green-700 disabled:opacity-50"
                            >
                              <Check size={14} />
                              Complete
                            </button>
                          )}
                        </td>
                      </tr>
                    )
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b px-6 py-5">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">
                  New Engagement
                </h2>

                <p className="text-sm text-slate-500">
                  Create work for a client.
                </p>
              </div>

              <button
                onClick={() =>
                  setShowForm(false)
                }
                className="rounded-lg p-2 text-slate-400 hover:bg-slate-100"
              >
                <X size={20} />
              </button>
            </div>

            <form
              onSubmit={handleSubmit}
              className="space-y-5 p-6"
            >
              <div>
                <label className="text-sm font-medium text-slate-700">
                  Client *
                </label>

                <select
                  required
                  value={form.client}
                  onChange={(e) =>
                    updateField(
                      "client",
                      e.target.value
                    )
                  }
                  className="mt-2 w-full rounded-lg border px-3 py-2.5"
                >
                  <option value="">
                    Select client
                  </option>

                  {clients.map((client) => (
                    <option
                      key={client._id}
                      value={client._id}
                    >
                      {client.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label className="text-sm font-medium text-slate-700">
                    Engagement name *
                  </label>

                  <input
                    required
                    value={form.name}
                    onChange={(e) =>
                      updateField(
                        "name",
                        e.target.value
                      )
                    }
                    placeholder="2026 Annual Accounts"
                    className="mt-2 w-full rounded-lg border px-3 py-2.5"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="text-sm font-medium text-slate-700">
                    Service *
                  </label>

                  <input
                    required
                    value={form.service}
                    onChange={(e) =>
                      updateField(
                        "service",
                        e.target.value
                      )
                    }
                    placeholder="Accounting & Tax"
                    className="mt-2 w-full rounded-lg border px-3 py-2.5"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-slate-700">
                    Start date
                  </label>

                  <input
                    type="date"
                    value={form.startDate}
                    onChange={(e) =>
                      updateField(
                        "startDate",
                        e.target.value
                      )
                    }
                    className="mt-2 w-full rounded-lg border px-3 py-2.5"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-slate-700">
                    Due date
                  </label>

                  <input
                    type="date"
                    value={form.dueDate}
                    onChange={(e) =>
                      updateField(
                        "dueDate",
                        e.target.value
                      )
                    }
                    className="mt-2 w-full rounded-lg border px-3 py-2.5"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-slate-700">
                    Priority
                  </label>

                  <select
                    value={form.priority}
                    onChange={(e) =>
                      updateField(
                        "priority",
                        e.target.value
                      )
                    }
                    className="mt-2 w-full rounded-lg border px-3 py-2.5"
                  >
                    {priorities.map(
                      (priority) => (
                        <option
                          key={priority}
                          value={priority}
                        >
                          {priority}
                        </option>
                      )
                    )}
                  </select>
                </div>

                <div>
                  <label className="text-sm font-medium text-slate-700">
                    Fee
                  </label>

                  <input
                    type="number"
                    min="0"
                    value={form.fee}
                    onChange={(e) =>
                      updateField(
                        "fee",
                        e.target.value
                      )
                    }
                    placeholder="0"
                    className="mt-2 w-full rounded-lg border px-3 py-2.5"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="text-sm font-medium text-slate-700">
                    Notes
                  </label>

                  <textarea
                    rows={3}
                    value={form.notes}
                    onChange={(e) =>
                      updateField(
                        "notes",
                        e.target.value
                      )
                    }
                    className="mt-2 w-full rounded-lg border px-3 py-2.5"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 border-t pt-5">
                <button
                  type="button"
                  onClick={() =>
                    setShowForm(false)
                  }
                  className="rounded-lg border px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={
                    saving || !clients.length
                  }
                  className="rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-50"
                >
                  {saving
                    ? "Saving..."
                    : "Create Engagement"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AppShell>
  );
}

function SummaryCard({ label, value }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-sm text-slate-500">
        {label}
      </p>

      <p className="mt-3 text-3xl font-bold text-slate-900">
        {value}
      </p>
    </div>
  );
}
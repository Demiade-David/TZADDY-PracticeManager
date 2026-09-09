"use client";

import { useEffect, useState } from "react";
import AppShell from "@/components/AppShell";
import {
  Plus,
  Search,
  X,
  FileCheck2,
  Check,
  RotateCcw,
} from "lucide-react";

const initialForm = {
  client: "",
  taxType: "",
  filingPeriod: "",
  dueDate: "",
  status: "Not Started",
  notes: "",
};

const taxTypes = [
  "VAT",
  "PAYE",
  "Company Income Tax",
  "Personal Income Tax",
  "Withholding Tax",
  "Annual Returns",
  "Tax Clearance",
  "Other",
];

const statuses = [
  "Not Started",
  "In Progress",
  "Awaiting Client",
  "Ready to File",
  "Filed",
  "Overdue",
  "Cancelled",
];

export default function FilingsPage() {
  const [filings, setFilings] = useState([]);
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
      fetch("/api/filings"),
      fetch("/api/clients"),
    ])
      .then(async ([filingResponse, clientResponse]) => {
        const filingData = await filingResponse.json();
        const clientData = await clientResponse.json();

        if (!filingResponse.ok) {
          throw new Error(
            filingData.error || "Unable to load filings"
          );
        }

        if (!clientResponse.ok) {
          throw new Error(
            clientData.error || "Unable to load clients"
          );
        }

        return { filingData, clientData };
      })
      .then(({ filingData, clientData }) => {
        if (!cancelled) {
          setFilings(filingData);
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
        "/api/filings",
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
            "Unable to create filing"
        );
      }

      setFilings((current) =>
        [...current, data].sort(
          (a, b) =>
            new Date(a.dueDate) -
            new Date(b.dueDate)
        )
      );

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
        "/api/filings",
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
            "Unable to update filing"
        );
      }

      setFilings((current) =>
        current.map((filing) =>
          filing._id === id
            ? data
            : filing
        )
      );
    } catch (error) {
      console.error(error);
      setError(error.message);
    } finally {
      setUpdatingId(null);
    }
  }

  function isOverdue(filing) {
    if (
      filing.status === "Filed" ||
      filing.status === "Cancelled"
    ) {
      return false;
    }

    return (
      new Date(filing.dueDate) <
      new Date()
    );
  }

  const filteredFilings = filings.filter(
    (filing) => {
      const term = search.toLowerCase();

      const matchesSearch =
        filing.client?.name
          ?.toLowerCase()
          .includes(term) ||
        filing.taxType
          ?.toLowerCase()
          .includes(term) ||
        filing.filingPeriod
          ?.toLowerCase()
          .includes(term) ||
        filing.status
          ?.toLowerCase()
          .includes(term);

      const matchesFilter =
        filter === "All"
          ? true
          : filter === "Active"
          ? ![
              "Filed",
              "Cancelled",
            ].includes(filing.status)
          : filter === "Filed"
          ? filing.status === "Filed"
          : true;

      return matchesSearch && matchesFilter;
    }
  );

  function getStatusClass(status) {
    if (status === "Filed") {
      return "bg-green-100 text-green-700";
    }

    if (status === "Overdue") {
      return "bg-red-100 text-red-700";
    }

    if (status === "Awaiting Client") {
      return "bg-amber-100 text-amber-700";
    }

    if (status === "Ready to File") {
      return "bg-blue-100 text-blue-700";
    }

    return "bg-slate-100 text-slate-700";
  }

  return (
    <AppShell>
      <div className="border-b bg-white">
        <div className="flex flex-col gap-4 px-6 py-6 lg:px-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">
                Filing Tracker
              </h1>

              <p className="mt-1 text-sm text-slate-500">
                Track your firm&apos;s tax and regulatory filings.
              </p>
            </div>

            <button
              onClick={() =>
                setShowForm(true)
              }
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-slate-800"
            >
              <Plus size={18} />
              New Filing
            </button>
          </div>

          <div className="flex flex-wrap gap-2">
            {["Active", "Filed", "All"].map(
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

        <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <SummaryCard
            label="Total"
            value={filings.length}
          />

          <SummaryCard
            label="Active"
            value={
              filings.filter(
                (filing) =>
                  ![
                    "Filed",
                    "Cancelled",
                  ].includes(filing.status)
              ).length
            }
          />

          <SummaryCard
            label="Overdue"
            value={
              filings.filter(
                (filing) =>
                  isOverdue(filing)
              ).length
            }
          />

          <SummaryCard
            label="Filed"
            value={
              filings.filter(
                (filing) =>
                  filing.status === "Filed"
              ).length
            }
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
            placeholder="Search filings..."
            className="w-full bg-transparent text-sm outline-none"
          />
        </div>

        {loading ? (
          <div className="rounded-xl border bg-white p-10 text-center text-sm text-slate-500">
            Loading filings...
          </div>
        ) : filteredFilings.length === 0 ? (
          <div className="rounded-xl border bg-white p-12 text-center">
            <FileCheck2
              size={40}
              className="mx-auto text-slate-300"
            />

            <h2 className="mt-4 font-semibold text-slate-900">
              No filings found
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              {filter === "Filed"
                ? "No filed filings yet."
                : "Create your first filing to get started."}
            </p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="border-b bg-slate-50">
                  <tr>
                    <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Client
                    </th>

                    <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Tax Type
                    </th>

                    <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Period
                    </th>

                    <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Due Date
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
                  {filteredFilings.map(
                    (filing) => {
                      const overdue =
                        isOverdue(filing);

                      return (
                        <tr
                          key={filing._id}
                          className="hover:bg-slate-50"
                        >
                          <td className="px-5 py-4">
                            <p className="font-medium text-slate-900">
                              {filing.client?.name ||
                                "—"}
                            </p>
                          </td>

                          <td className="px-5 py-4 text-sm text-slate-600">
                            {filing.taxType}
                          </td>

                          <td className="px-5 py-4 text-sm text-slate-600">
                            {filing.filingPeriod}
                          </td>

                          <td className="px-5 py-4">
                            <span
                              className={`text-sm ${
                                overdue
                                  ? "font-semibold text-red-600"
                                  : "text-slate-600"
                              }`}
                            >
                              {new Date(
                                filing.dueDate
                              ).toLocaleDateString()}
                            </span>
                          </td>

                          <td className="px-5 py-4">
                            <span
                              className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${getStatusClass(
                                filing.status
                              )}`}
                            >
                              {filing.status}
                            </span>
                          </td>

                          <td className="px-5 py-4">
                            {filing.status ===
                            "Filed" ? (
                              <button
                                disabled={
                                  updatingId ===
                                  filing._id
                                }
                                onClick={() =>
                                  updateStatus(
                                    filing._id,
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
                                  filing._id
                                }
                                onClick={() =>
                                  updateStatus(
                                    filing._id,
                                    "Filed"
                                  )
                                }
                                className="inline-flex items-center gap-2 rounded-lg bg-green-600 px-3 py-2 text-xs font-medium text-white hover:bg-green-700 disabled:opacity-50"
                              >
                                <Check size={14} />
                                Mark Filed
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    }
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
                  New Filing
                </h2>

                <p className="text-sm text-slate-500">
                  Add a tax or regulatory filing.
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
                <div>
                  <label className="text-sm font-medium text-slate-700">
                    Tax Type *
                  </label>

                  <select
                    required
                    value={form.taxType}
                    onChange={(e) =>
                      updateField(
                        "taxType",
                        e.target.value
                      )
                    }
                    className="mt-2 w-full rounded-lg border px-3 py-2.5"
                  >
                    <option value="">
                      Select tax type
                    </option>

                    {taxTypes.map((type) => (
                      <option
                        key={type}
                        value={type}
                      >
                        {type}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-sm font-medium text-slate-700">
                    Filing Period *
                  </label>

                  <input
                    required
                    value={form.filingPeriod}
                    onChange={(e) =>
                      updateField(
                        "filingPeriod",
                        e.target.value
                      )
                    }
                    placeholder="August 2026"
                    className="mt-2 w-full rounded-lg border px-3 py-2.5"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-slate-700">
                    Due Date *
                  </label>

                  <input
                    required
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
                    Status
                  </label>

                  <select
                    value={form.status}
                    onChange={(e) =>
                      updateField(
                        "status",
                        e.target.value
                      )
                    }
                    className="mt-2 w-full rounded-lg border px-3 py-2.5"
                  >
                    {statuses.map((status) => (
                      <option
                        key={status}
                        value={status}
                      >
                        {status}
                      </option>
                    ))}
                  </select>
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
                    : "Create Filing"}
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
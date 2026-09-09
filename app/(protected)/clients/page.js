"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { Plus, Search, X, Building2, Mail, Phone } from "lucide-react";

const initialForm = {
  name: "",
  clientType: "Company",
  email: "",
  phone: "",
  address: "",
  contactPerson: "",
  cacNumber: "",
  tin: "",
  services: "",
  status: "Active",
  notes: "",
};

export default function ClientsPage() {
  const router = useRouter();
  const [clients, setClients] = useState([]);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    fetch("/api/clients")
      .then(async (response) => {
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Unable to load clients");
        }

        return data;
      })
      .then((data) => {
        if (!cancelled) {
          setClients(data);
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
      const response = await fetch("/api/clients", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...form,
          services: form.services
            .split(",")
            .map((service) => service.trim())
            .filter(Boolean),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Unable to create client");
      }

      setClients((current) => [data, ...current]);
      setForm(initialForm);
      setShowForm(false);
    } catch (error) {
      console.error(error);
      setError(error.message);
    } finally {
      setSaving(false);
    }
  }

  const filteredClients = clients.filter((client) => {
    const term = search.toLowerCase();

    return (
      client.name?.toLowerCase().includes(term) ||
      client.email?.toLowerCase().includes(term) ||
      client.phone?.toLowerCase().includes(term) ||
      client.tin?.toLowerCase().includes(term) ||
      client.cacNumber?.toLowerCase().includes(term)
    );
  });

  return (
    <main>
      <div className="border-b bg-white">
        <div className="flex flex-col gap-4 px-6 py-6 sm:flex-row sm:items-center sm:justify-between lg:px-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Clients</h1>

            <p className="mt-1 text-sm text-slate-500">
              Manage your firm&apos;s client relationships.
            </p>
          </div>

          <button
            onClick={() => setShowForm(true)}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-slate-800"
          >
            <Plus size={18} />
            Add Client
          </button>
        </div>
      </div>

      <div className="p-6 lg:p-8">
        {error && (
          <div className="mb-5 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="mb-6 flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3">
          <Search size={19} className="text-slate-400" />

          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search clients..."
            className="w-full bg-transparent text-sm outline-none"
          />
        </div>

        {loading ? (
          <div className="rounded-xl border bg-white p-10 text-center text-sm text-slate-500">
            Loading clients...
          </div>
        ) : filteredClients.length === 0 ? (
          <div className="rounded-xl border bg-white p-12 text-center">
            <Building2 size={40} className="mx-auto text-slate-300" />

            <h2 className="mt-4 font-semibold text-slate-900">
              No clients found
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Add your first client to get started.
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
                      Contact
                    </th>

                    <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Type
                    </th>

                    <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Status
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y">
                  {filteredClients.map((client) => (
                    <tr
                      key={client._id}
                      onClick={() => router.push(`/clients/${client._id}`)}
                      className="cursor-pointer hover:bg-slate-50"
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100">
                            <Building2 size={18} className="text-slate-600" />
                          </div>

                          <div>
                            <p className="font-medium text-slate-900">
                              {client.name}
                            </p>

                            {client.contactPerson && (
                              <p className="text-xs text-slate-500">
                                {client.contactPerson}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <div className="space-y-1 text-sm text-slate-600">
                          {client.email && (
                            <div className="flex items-center gap-2">
                              <Mail size={14} />
                              {client.email}
                            </div>
                          )}

                          {client.phone && (
                            <div className="flex items-center gap-2">
                              <Phone size={14} />
                              {client.phone}
                            </div>
                          )}
                        </div>
                      </td>

                      <td className="px-5 py-4 text-sm text-slate-600">
                        {client.clientType}
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
                            client.status === "Active"
                              ? "bg-green-100 text-green-700"
                              : "bg-slate-100 text-slate-600"
                          }`}
                        >
                          {client.status}
                        </span>
                      </td>
                    </tr>
                  ))}
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
                  Add Client
                </h2>

                <p className="text-sm text-slate-500">
                  Create a new client record.
                </p>
              </div>

              <button
                onClick={() => setShowForm(false)}
                className="rounded-lg p-2 text-slate-400 hover:bg-slate-100"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5 p-6">
              <div className="grid gap-5 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label className="text-sm font-medium text-slate-700">
                    Client name *
                  </label>

                  <input
                    required
                    value={form.name}
                    onChange={(e) => updateField("name", e.target.value)}
                    className="mt-2 w-full rounded-lg border px-3 py-2.5 outline-none focus:border-slate-900"
                    placeholder="ABC Limited"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-slate-700">
                    Client type
                  </label>

                  <select
                    value={form.clientType}
                    onChange={(e) => updateField("clientType", e.target.value)}
                    className="mt-2 w-full rounded-lg border px-3 py-2.5 outline-none"
                  >
                    <option>Company</option>
                    <option>Business Name</option>
                    <option>Individual</option>
                  </select>
                </div>

                <div>
                  <label className="text-sm font-medium text-slate-700">
                    Contact person
                  </label>

                  <input
                    value={form.contactPerson}
                    onChange={(e) =>
                      updateField("contactPerson", e.target.value)
                    }
                    className="mt-2 w-full rounded-lg border px-3 py-2.5 outline-none"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-slate-700">
                    Email
                  </label>

                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => updateField("email", e.target.value)}
                    className="mt-2 w-full rounded-lg border px-3 py-2.5 outline-none"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-slate-700">
                    Phone
                  </label>

                  <input
                    value={form.phone}
                    onChange={(e) => updateField("phone", e.target.value)}
                    className="mt-2 w-full rounded-lg border px-3 py-2.5 outline-none"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-slate-700">
                    CAC number
                  </label>

                  <input
                    value={form.cacNumber}
                    onChange={(e) => updateField("cacNumber", e.target.value)}
                    className="mt-2 w-full rounded-lg border px-3 py-2.5 outline-none"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-slate-700">
                    TIN
                  </label>

                  <input
                    value={form.tin}
                    onChange={(e) => updateField("tin", e.target.value)}
                    className="mt-2 w-full rounded-lg border px-3 py-2.5 outline-none"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="text-sm font-medium text-slate-700">
                    Address
                  </label>

                  <textarea
                    rows={2}
                    value={form.address}
                    onChange={(e) => updateField("address", e.target.value)}
                    className="mt-2 w-full rounded-lg border px-3 py-2.5 outline-none"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="text-sm font-medium text-slate-700">
                    Services
                  </label>

                  <input
                    value={form.services}
                    onChange={(e) => updateField("services", e.target.value)}
                    className="mt-2 w-full rounded-lg border px-3 py-2.5 outline-none"
                    placeholder="Tax Filing, Bookkeeping, Business Advisory"
                  />

                  <p className="mt-1 text-xs text-slate-400">
                    Separate multiple services with commas.
                  </p>
                </div>

                <div className="sm:col-span-2">
                  <label className="text-sm font-medium text-slate-700">
                    Notes
                  </label>

                  <textarea
                    rows={3}
                    value={form.notes}
                    onChange={(e) => updateField("notes", e.target.value)}
                    className="mt-2 w-full rounded-lg border px-3 py-2.5 outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 border-t pt-5">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="rounded-lg border px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-50"
                >
                  {saving ? "Saving..." : "Save Client"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}

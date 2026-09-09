"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import AppShell from "@/components/AppShell";
import {
  ArrowLeft,
  Building2,
  Mail,
  Phone,
  MapPin,
  Edit,
  X,
} from "lucide-react";

export default function ClientDetailsPage() {
  const params = useParams();
  const router = useRouter();

  const [client, setClient] = useState(null);
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadClient() {
      try {
        const response = await fetch(
          `/api/clients/${params.id}`
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.error || "Unable to load client"
          );
        }

        setClient(data);
        setForm({
          ...data,
          services: data.services?.join(", ") || "",
        });
      } catch (error) {
        console.error(error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    }

    if (params.id) {
      loadClient();
    }
  }, [params.id]);

  function updateField(field, value) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  async function handleSave(e) {
    e.preventDefault();

    setSaving(true);
    setError("");

    try {
      const response = await fetch(
        `/api/clients/${params.id}`,
        {
          method: "PATCH",
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
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Unable to update client"
        );
      }

      setClient(data);
      setForm({
        ...data,
        services: data.services?.join(", ") || "",
      });
      setEditing(false);
    } catch (error) {
      console.error(error);
      setError(error.message);
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <AppShell>
        <div className="p-8 text-sm text-slate-500">
          Loading client...
        </div>
      </AppShell>
    );
  }

  if (error || !client) {
    return (
      <AppShell>
        <div className="p-8">
          <div className="rounded-xl bg-red-50 p-5 text-sm text-red-700">
            {error || "Client not found"}
          </div>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="border-b bg-white">
        <div className="flex items-center justify-between px-6 py-6 lg:px-8">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push("/clients")}
              className="rounded-lg p-2 hover:bg-slate-100"
            >
              <ArrowLeft size={20} />
            </button>

            <div>
              <h1 className="text-2xl font-bold text-slate-900">
                {client.name}
              </h1>

              <p className="mt-1 text-sm text-slate-500">
                {client.clientType}
              </p>
            </div>
          </div>

          {!editing && (
            <button
              onClick={() => setEditing(true)}
              className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-slate-800"
            >
              <Edit size={17} />
              Edit Client
            </button>
          )}
        </div>
      </div>

      <div className="p-6 lg:p-8">
        {editing ? (
          <form
            onSubmit={handleSave}
            className="rounded-xl border bg-white p-6"
          >
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-lg font-semibold">
                Edit Client
              </h2>

              <button
                type="button"
                onClick={() => setEditing(false)}
                className="rounded-lg p-2 hover:bg-slate-100"
              >
                <X size={20} />
              </button>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="text-sm font-medium">
                  Client name *
                </label>

                <input
                  required
                  value={form.name}
                  onChange={(e) =>
                    updateField("name", e.target.value)
                  }
                  className="mt-2 w-full rounded-lg border px-3 py-2.5"
                />
              </div>

              <div>
                <label className="text-sm font-medium">
                  Client type
                </label>

                <select
                  value={form.clientType}
                  onChange={(e) =>
                    updateField(
                      "clientType",
                      e.target.value
                    )
                  }
                  className="mt-2 w-full rounded-lg border px-3 py-2.5"
                >
                  <option>Company</option>
                  <option>Business Name</option>
                  <option>Individual</option>
                </select>
              </div>

              <div>
                <label className="text-sm font-medium">
                  Contact person
                </label>

                <input
                  value={form.contactPerson || ""}
                  onChange={(e) =>
                    updateField(
                      "contactPerson",
                      e.target.value
                    )
                  }
                  className="mt-2 w-full rounded-lg border px-3 py-2.5"
                />
              </div>

              <div>
                <label className="text-sm font-medium">
                  Email
                </label>

                <input
                  type="email"
                  value={form.email || ""}
                  onChange={(e) =>
                    updateField("email", e.target.value)
                  }
                  className="mt-2 w-full rounded-lg border px-3 py-2.5"
                />
              </div>

              <div>
                <label className="text-sm font-medium">
                  Phone
                </label>

                <input
                  value={form.phone || ""}
                  onChange={(e) =>
                    updateField("phone", e.target.value)
                  }
                  className="mt-2 w-full rounded-lg border px-3 py-2.5"
                />
              </div>

              <div>
                <label className="text-sm font-medium">
                  CAC Number
                </label>

                <input
                  value={form.cacNumber || ""}
                  onChange={(e) =>
                    updateField(
                      "cacNumber",
                      e.target.value
                    )
                  }
                  className="mt-2 w-full rounded-lg border px-3 py-2.5"
                />
              </div>

              <div>
                <label className="text-sm font-medium">
                  TIN
                </label>

                <input
                  value={form.tin || ""}
                  onChange={(e) =>
                    updateField("tin", e.target.value)
                  }
                  className="mt-2 w-full rounded-lg border px-3 py-2.5"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="text-sm font-medium">
                  Address
                </label>

                <textarea
                  rows={2}
                  value={form.address || ""}
                  onChange={(e) =>
                    updateField("address", e.target.value)
                  }
                  className="mt-2 w-full rounded-lg border px-3 py-2.5"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="text-sm font-medium">
                  Services
                </label>

                <input
                  value={form.services || ""}
                  onChange={(e) =>
                    updateField(
                      "services",
                      e.target.value
                    )
                  }
                  placeholder="Tax Filing, Bookkeeping, Advisory"
                  className="mt-2 w-full rounded-lg border px-3 py-2.5"
                />
              </div>

              <div>
                <label className="text-sm font-medium">
                  Status
                </label>

                <select
                  value={form.status}
                  onChange={(e) =>
                    updateField("status", e.target.value)
                  }
                  className="mt-2 w-full rounded-lg border px-3 py-2.5"
                >
                  <option>Active</option>
                  <option>Inactive</option>
                  <option>Off-boarded</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="text-sm font-medium">
                  Notes
                </label>

                <textarea
                  rows={3}
                  value={form.notes || ""}
                  onChange={(e) =>
                    updateField("notes", e.target.value)
                  }
                  className="mt-2 w-full rounded-lg border px-3 py-2.5"
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3 border-t pt-5">
              <button
                type="button"
                onClick={() => setEditing(false)}
                className="rounded-lg border px-4 py-2.5 text-sm font-medium"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={saving}
                className="rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-medium text-white disabled:opacity-50"
              >
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>
        ) : (
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="rounded-xl border bg-white p-6 lg:col-span-2">
              <h2 className="text-lg font-semibold text-slate-900">
                Client Information
              </h2>

              <div className="mt-6 grid gap-6 sm:grid-cols-2">
                <Info
                  label="Client Type"
                  value={client.clientType}
                  icon={Building2}
                />

                <Info
                  label="Contact Person"
                  value={client.contactPerson}
                />

                <Info
                  label="Email"
                  value={client.email}
                  icon={Mail}
                />

                <Info
                  label="Phone"
                  value={client.phone}
                  icon={Phone}
                />

                <Info
                  label="CAC Number"
                  value={client.cacNumber}
                />

                <Info
                  label="TIN"
                  value={client.tin}
                />

                <Info
                  label="Address"
                  value={client.address}
                  icon={MapPin}
                />
              </div>
            </div>

            <div className="rounded-xl border bg-white p-6">
              <h2 className="text-lg font-semibold text-slate-900">
                Services
              </h2>

              <div className="mt-4 space-y-2">
                {client.services?.length ? (
                  client.services.map((service) => (
                    <div
                      key={service}
                      className="rounded-lg bg-slate-100 px-3 py-2 text-sm text-slate-700"
                    >
                      {service}
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-slate-500">
                    No services recorded.
                  </p>
                )}
              </div>

              <h2 className="mt-8 text-lg font-semibold text-slate-900">
                Status
              </h2>

              <span className="mt-3 inline-flex rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700">
                {client.status}
              </span>
            </div>

            <div className="rounded-xl border bg-white p-6 lg:col-span-3">
              <h2 className="text-lg font-semibold text-slate-900">
                Notes
              </h2>

              <p className="mt-3 whitespace-pre-wrap text-sm text-slate-600">
                {client.notes || "No notes recorded."}
              </p>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}

function Info({ label, value, icon: Icon }) {
  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
        {label}
      </p>

      <div className="mt-2 flex items-center gap-2 text-sm text-slate-700">
        {Icon && <Icon size={16} className="text-slate-400" />}
        {value || "Not provided"}
      </div>
    </div>
  );
}
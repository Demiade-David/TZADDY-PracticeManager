"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Building2,
  Save,
} from "lucide-react";

import AppShell from "@/components/AppShell";

export default function PracticeSettingsPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    website: "",
    registrationNumber: "",
    taxIdentificationNumber: "",
    logoUrl: "",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

 useEffect(() => {
  async function load() {
    try {
      const meResponse =
        await fetch("/api/auth/me");

      const me = await meResponse.json();

      if (!meResponse.ok) {
        router.push("/login");
        return;
      }

      setUser(me.user);

      if (me.user.role !== "admin") {
        router.push("/dashboard");
        return;
      }

      const practiceResponse =
        await fetch("/api/practice");

      const practice =
        await practiceResponse.json();

      if (!practiceResponse.ok) {
        throw new Error(
          practice.error ||
            "Unable to load practice information"
        );
      }

      setForm({
        name: practice.name || "",
        email: practice.email || "",
        phone: practice.phone || "",
        address: practice.address || "",
        website: practice.website || "",
        registrationNumber:
          practice.registrationNumber || "",
        taxIdentificationNumber:
          practice.taxIdentificationNumber || "",
        logoUrl: practice.logoUrl || "",
      });
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }

  load();
}, [router]);


  function updateField(field, value) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));

    setMessage("");
    setError("");
  }

  async function handleSubmit(e) {
    e.preventDefault();

    setSaving(true);
    setMessage("");
    setError("");

    try {
      const response = await fetch("/api/practice", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            "Unable to save practice information"
        );
      }

      setMessage(
        "Practice information saved successfully."
      );
    } catch (error) {
      setError(error.message);
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <AppShell user={user}>
        <div className="flex min-h-screen items-center justify-center">
          <p className="text-sm text-slate-500">
            Loading practice information...
          </p>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell user={user}>
      <div className="border-b border-slate-200 bg-white">
        <div className="px-6 py-7 lg:px-8">
          <p className="text-sm font-medium text-slate-500">
            Settings
          </p>

          <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">
            Practice Information
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Keep your firm&apos;s information up to date.
          </p>
        </div>
      </div>

      <div className="p-6 lg:p-8">
        <div className="mx-auto max-w-3xl">
          {message && (
            <div className="mb-5 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
              {message}
            </div>
          )}

          {error && (
            <div className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <form
            onSubmit={handleSubmit}
            className="rounded-xl border border-slate-200 bg-white shadow-sm"
          >
            <div className="flex items-center gap-3 border-b border-slate-100 px-6 py-5">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
                <Building2 size={19} />
              </div>

              <div>
                <h2 className="font-semibold text-slate-900">
                  Firm Details
                </h2>

                <p className="text-xs text-slate-500">
                  Information used throughout the practice.
                </p>
              </div>
            </div>

            <div className="grid gap-5 p-6 sm:grid-cols-2">
              <Field
                label="Practice Name"
                value={form.name}
                onChange={(value) =>
                  updateField("name", value)
                }
                required
                className="sm:col-span-2"
              />

              <Field
                label="Email"
                type="email"
                value={form.email}
                onChange={(value) =>
                  updateField("email", value)
                }
              />

              <Field
                label="Phone"
                value={form.phone}
                onChange={(value) =>
                  updateField("phone", value)
                }
              />

              <Field
                label="Address"
                value={form.address}
                onChange={(value) =>
                  updateField("address", value)
                }
                className="sm:col-span-2"
              />

              <Field
                label="Website"
                value={form.website}
                onChange={(value) =>
                  updateField("website", value)
                }
              />

              <Field
                label="CAC / Registration Number"
                value={form.registrationNumber}
                onChange={(value) =>
                  updateField(
                    "registrationNumber",
                    value
                  )
                }
              />

              <Field
                label="Tax Identification Number"
                value={form.taxIdentificationNumber}
                onChange={(value) =>
                  updateField(
                    "taxIdentificationNumber",
                    value
                  )
                }
              />

              <Field
                label="Logo URL"
                value={form.logoUrl}
                onChange={(value) =>
                  updateField("logoUrl", value)
                }
              />
            </div>

            <div className="flex justify-end border-t border-slate-100 px-6 py-4">
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-50"
              >
                <Save size={17} />

                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </AppShell>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  required = false,
  className = "",
}) {
  return (
    <div className={className}>
      <label className="mb-1.5 block text-sm font-medium text-slate-700">
        {label}
      </label>

      <input
        type={type}
        value={value}
        required={required}
        onChange={(e) =>
          onChange(e.target.value)
        }
        className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-100"
      />
    </div>
  );
}
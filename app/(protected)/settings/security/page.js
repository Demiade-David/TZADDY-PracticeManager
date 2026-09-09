"use client";

import { useEffect, useState } from "react";
import {
  LockKeyhole,
  ShieldCheck,
} from "lucide-react";

import AppShell from "@/components/AppShell";

export default function SecurityPage() {
  const [user, setUser] = useState(null);

  const [form, setForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const response =
          await fetch("/api/auth/me");

        const data = await response.json();

        if (response.ok) {
          setUser(data.user);
        }
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

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

    setMessage("");
    setError("");

    if (
      form.newPassword !==
      form.confirmPassword
    ) {
      setError(
        "New passwords do not match."
      );
      return;
    }

    if (form.newPassword.length < 8) {
      setError(
        "New password must be at least 8 characters."
      );
      return;
    }

    setSaving(true);

    try {
      const response = await fetch(
        "/api/auth/change-password",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            currentPassword:
              form.currentPassword,
            newPassword:
              form.newPassword,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            "Unable to change password"
        );
      }

      setForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });

      setMessage(
        "Password changed successfully."
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
            Loading security settings...
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
            Security
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Manage your account security.
          </p>
        </div>
      </div>

      <div className="p-6 lg:p-8">
        <div className="mx-auto max-w-2xl space-y-6">
          {message && (
            <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
              {message}
            </div>
          )}

          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="flex items-center gap-3 border-b border-slate-100 px-6 py-5">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
                <LockKeyhole size={19} />
              </div>

              <div>
                <h2 className="font-semibold text-slate-900">
                  Change Password
                </h2>

                <p className="text-xs text-slate-500">
                  Update the password for your TPM account.
                </p>
              </div>
            </div>

            <form
              onSubmit={handleSubmit}
              className="space-y-5 p-6"
            >
              <PasswordField
                label="Current Password"
                value={
                  form.currentPassword
                }
                onChange={(value) =>
                  updateField(
                    "currentPassword",
                    value
                  )
                }
              />

              <PasswordField
                label="New Password"
                value={
                  form.newPassword
                }
                onChange={(value) =>
                  updateField(
                    "newPassword",
                    value
                  )
                }
              />

              <PasswordField
                label="Confirm New Password"
                value={
                  form.confirmPassword
                }
                onChange={(value) =>
                  updateField(
                    "confirmPassword",
                    value
                  )
                }
              />

              <div className="rounded-lg bg-slate-50 p-4">
                <div className="flex gap-3">
                  <ShieldCheck
                    size={18}
                    className="mt-0.5 shrink-0 text-slate-500"
                  />

                  <div>
                    <p className="text-sm font-medium text-slate-700">
                      Password requirement
                    </p>

                    <p className="mt-1 text-xs leading-5 text-slate-500">
                      Your password must contain at
                      least 8 characters.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex justify-end border-t border-slate-100 pt-4">
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-50"
                >
                  {saving
                    ? "Updating..."
                    : "Change Password"}
                </button>
              </div>
            </form>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-sm font-semibold text-slate-900">
              Signed in as
            </h2>

            <p className="mt-2 text-sm text-slate-600">
              {user?.name}
            </p>

            <p className="mt-1 text-xs text-slate-500">
              {user?.email}
            </p>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

function PasswordField({
  label,
  value,
  onChange,
}) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-slate-700">
        {label}
      </label>

      <input
        type="password"
        required
        value={value}
        onChange={(e) =>
          onChange(e.target.value)
        }
        className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-100"
      />
    </div>
  );
}
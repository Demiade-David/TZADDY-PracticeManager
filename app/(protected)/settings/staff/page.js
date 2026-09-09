"use client";

import { useEffect, useState } from "react";
import { UserPlus, ShieldCheck, UserCheck, UserX, X } from "lucide-react";



export default function StaffPage() {
  const [user, setUser] = useState(null);
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState("");

  async function loadData() {
    try {
      setLoading(true);
      const [meResponse, staffResponse] = await Promise.all([
        fetch("/api/auth/me"),
        fetch("/api/users"),
      ]);

      if (!meResponse.ok || !staffResponse.ok) {
        throw new Error("Unable to load staff");
      }

      const me = await meResponse.json();
      const users = await staffResponse.json();

      setUser(me.user);
      setStaff(users);
    } catch (error) {
      console.error(error);
      setError("Unable to load staff.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    let cancelled = false;

    Promise.all([fetch("/api/auth/me"), fetch("/api/users")])
      .then(async ([meResponse, staffResponse]) => {
        if (!meResponse.ok || !staffResponse.ok) {
          throw new Error("Unable to load staff");
        }

        const me = await meResponse.json();
        const users = await staffResponse.json();

        if (!cancelled) {
          setUser(me.user);
          setStaff(users);
        }
      })
      .catch((error) => {
        console.error(error);

        if (!cancelled) {
          setError("Unable to load staff.");
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

  async function handleCreateStaff(formData) {
    setError("");

    const response = await fetch("/api/users", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Unable to create staff account");
    }

    setShowModal(false);
    await loadData();
  }

  async function toggleUser(userId, active) {
    const response = await fetch(`/api/users/${userId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        active: !active,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      setError(data.error || "Unable to update user");
      return;
    }

    setStaff((current) =>
      current.map((person) => (person._id === userId ? data : person)),
    );
  }

  if (loading) {
    return (
      <main user={user}>
        <div className="flex min-h-screen items-center justify-center">
          <p className="text-sm text-slate-500">Loading staff...</p>
        </div>
      </main>
    );
  }

  return (
    <main user={user}>
      <div className="border-b border-slate-200 bg-white">
        <div className="px-6 py-7 lg:px-8">
          <p className="text-sm font-medium text-slate-500">Settings</p>

          <div className="mt-1 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                Staff & Users
              </h1>

              <p className="mt-1 text-sm text-slate-500">
                Manage people who have access to Tzaddy Practice Manager.
              </p>
            </div>

            <button
              onClick={() => {
                setError("");
                setShowModal(true);
              }}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800"
            >
              <UserPlus size={17} />
              Add Staff
            </button>
          </div>
        </div>
      </div>

      <div className="p-6 lg:p-8">
        {error && (
          <div className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="mb-6 grid gap-4 sm:grid-cols-3">
          <SummaryCard
            icon={ShieldCheck}
            label="Total Users"
            value={staff.length}
          />

          <SummaryCard
            icon={UserCheck}
            label="Active"
            value={staff.filter((person) => person.active).length}
          />

          <SummaryCard
            icon={UserX}
            label="Inactive"
            value={staff.filter((person) => !person.active).length}
          />
        </div>

        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 px-5 py-4">
            <h2 className="font-semibold text-slate-900">Practice Users</h2>

            <p className="mt-0.5 text-xs text-slate-500">
              Users with access to the practice management system.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-175">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50 text-left">
                  <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-400">
                    User
                  </th>

                  <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Role
                  </th>

                  <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Status
                  </th>

                  <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Joined
                  </th>

                  <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Action
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {staff.map((person) => (
                  <tr key={person._id} className="hover:bg-slate-50">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-sm font-semibold text-slate-700">
                          {person.name?.charAt(0)?.toUpperCase()}
                        </div>

                        <div>
                          <p className="text-sm font-semibold text-slate-900">
                            {person.name}
                          </p>

                          <p className="text-xs text-slate-500">
                            {person.email}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      <RoleBadge role={person.role} />
                    </td>

                    <td className="px-5 py-4">
                      <StatusBadge active={person.active} />
                    </td>

                    <td className="px-5 py-4 text-sm text-slate-500">
                      {new Date(person.createdAt).toLocaleDateString("en-NG", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>

                    <td className="px-5 py-4 text-right">
                      {person._id !== user?._id && (
                        <button
                          onClick={() => toggleUser(person._id, person.active)}
                          className="rounded-lg px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                        >
                          {person.active ? "Deactivate" : "Activate"}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {showModal && (
        <AddStaffModal
          onClose={() => setShowModal(false)}
          onSubmit={handleCreateStaff}
        />
      )}
    </main>
  );
}

function SummaryCard({ icon: Icon, label, value }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-slate-500">{label}</p>

          <p className="mt-2 text-2xl font-bold text-slate-900">{value}</p>
        </div>

        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
          <Icon size={19} />
        </div>
      </div>
    </div>
  );
}

function RoleBadge({ role }) {
  const styles = {
    admin: "bg-purple-50 text-purple-700",
    manager: "bg-blue-50 text-blue-700",
    staff: "bg-slate-100 text-slate-700",
  };

  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${
        styles[role] || styles.staff
      }`}
    >
      {role}
    </span>
  );
}

function StatusBadge({ active }) {
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
        active
          ? "bg-emerald-50 text-emerald-700"
          : "bg-slate-100 text-slate-500"
      }`}
    >
      {active ? "Active" : "Inactive"}
    </span>
  );
}

function AddStaffModal({ onClose, onSubmit }) {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "staff",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function updateField(field, value) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  async function handleSubmit(e) {
    e.preventDefault();

    setError("");

    if (form.password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    try {
      setLoading(true);
      await onSubmit(form);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <div>
            <h2 className="font-semibold text-slate-900">Add Staff Member</h2>

            <p className="mt-0.5 text-xs text-slate-500">
              Create a login for a team member.
            </p>
          </div>

          <button
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 p-6">
          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </div>
          )}

          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              Full Name
            </label>

            <input
              required
              value={form.name}
              onChange={(e) => updateField("name", e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-100"
              placeholder="Jane Doe"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              Email
            </label>

            <input
              required
              type="email"
              value={form.email}
              onChange={(e) => updateField("email", e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-100"
              placeholder="jane@tzaddy.com"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              Temporary Password
            </label>

            <input
              required
              type="password"
              value={form.password}
              onChange={(e) => updateField("password", e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-100"
              placeholder="Minimum 8 characters"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              Role
            </label>

            <select
              value={form.role}
              onChange={(e) => updateField("role", e.target.value)}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-100"
            >
              <option value="staff">Staff</option>

              <option value="manager">Manager</option>

              <option value="admin">Admin</option>
            </select>
          </div>

          <div className="flex justify-end gap-3 border-t border-slate-100 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              className="rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-50"
            >
              {loading ? "Creating..." : "Create Staff"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

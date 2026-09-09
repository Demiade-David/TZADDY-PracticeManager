"use client";

import { useEffect, useMemo, useState } from "react";

import { CreditCard, Plus, Search, X, CheckCircle2 } from "lucide-react";

export default function PaymentsPage() {
  const [invoices, setInvoices] = useState([]);
  const [clients, setClients] = useState([]);
  const [engagements, setEngagements] = useState([]);

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");

  const [showInvoiceModal, setShowInvoiceModal] = useState(false);

  const [showPaymentModal, setShowPaymentModal] = useState(false);

  const [selectedInvoice, setSelectedInvoice] = useState(null);

  const [loading, setLoading] = useState(true);

  const [invoiceForm, setInvoiceForm] = useState({
    client: "",
    engagement: "",
    invoiceNumber: "",
    description: "",
    invoiceDate: "",
    dueDate: "",
    amount: "",
    status: "Draft",
    notes: "",
  });

  const [paymentForm, setPaymentForm] = useState({
    amount: "",
    paymentDate: "",
    paymentMethod: "Bank Transfer",
    reference: "",
    notes: "",
  });

  async function loadData() {
    try {
      setLoading(true);

      const [invoicesResponse, clientsResponse, engagementsResponse] =
        await Promise.all([
          fetch("/api/invoices"),
          fetch("/api/clients"),
          fetch("/api/engagements"),
        ]);

      const invoicesData = await invoicesResponse.json();
      const clientsData = await clientsResponse.json();
      const engagementsData = await engagementsResponse.json();

      if (!invoicesResponse.ok) {
        throw new Error(invoicesData.error || "Unable to load invoices");
      }

      if (!clientsResponse.ok) {
        throw new Error(clientsData.error || "Unable to load clients");
      }

      if (!engagementsResponse.ok) {
        throw new Error(engagementsData.error || "Unable to load engagements");
      }

      setInvoices(invoicesData);
      setClients(clientsData);
      setEngagements(engagementsData);
    } catch (error) {
      console.error("Unable to load payment data:", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const loadInitialData = async () => {
      await loadData();
    };

    loadInitialData();
  }, []);
  const filteredInvoices = useMemo(() => {
    let result = [...invoices];

    if (filter !== "All") {
      result = result.filter((invoice) => invoice.status === filter);
    }

    const query = search.toLowerCase().trim();

    if (query) {
      result = result.filter((invoice) => {
        return (
          invoice.invoiceNumber?.toLowerCase().includes(query) ||
          invoice.description?.toLowerCase().includes(query) ||
          invoice.client?.name?.toLowerCase().includes(query)
        );
      });
    }

    return result;
  }, [invoices, filter, search]);

  const totals = useMemo(() => {
    const activeInvoices = invoices.filter(
      (invoice) => invoice.status !== "Cancelled",
    );

    const totalInvoiced = activeInvoices.reduce(
      (sum, invoice) => sum + (invoice.amount || 0),
      0,
    );

    const totalPaid = activeInvoices.reduce(
      (sum, invoice) => sum + (invoice.amountPaid || 0),
      0,
    );

    return {
      totalInvoiced,
      totalPaid,
      outstanding: totalInvoiced - totalPaid,
    };
  }, [invoices]);

  function handleInvoiceChange(e) {
    const { name, value } = e.target;

    setInvoiceForm((current) => ({
      ...current,
      [name]: value,
    }));
  }

  function handlePaymentChange(e) {
    const { name, value } = e.target;

    setPaymentForm((current) => ({
      ...current,
      [name]: value,
    }));
  }

  function resetInvoiceForm() {
    setInvoiceForm({
      client: "",
      engagement: "",
      invoiceNumber: "",
      description: "",
      invoiceDate: "",
      dueDate: "",
      amount: "",
      status: "Draft",
      notes: "",
    });
  }

  function resetPaymentForm() {
    setPaymentForm({
      amount: "",
      paymentDate: "",
      paymentMethod: "Bank Transfer",
      reference: "",
      notes: "",
    });
  }

  async function handleCreateInvoice(e) {
    e.preventDefault();

    try {
      const response = await fetch("/api/invoices", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(invoiceForm),
      });

      const data = await response.json();

      console.log("CREATE INVOICE STATUS:", response.status);
      console.log("CREATE INVOICE RESPONSE:", data);

      if (!response.ok) {
        alert(data.error || "Unable to create invoice");
        return;
      }

      // Reload invoices directly from MongoDB
      await loadData();

      resetInvoiceForm();
      setShowInvoiceModal(false);
    } catch (error) {
      console.error("Create invoice error:", error);
      alert("Something went wrong while creating the invoice.");
    }
  }
  async function handleRecordPayment(e) {
    e.preventDefault();

    if (!selectedInvoice) {
      return;
    }

    const amount = Number(paymentForm.amount);

    const outstanding = Math.max(
      0,
      (selectedInvoice.amount || 0) - (selectedInvoice.amountPaid || 0),
    );

    if (amount <= 0) {
      alert("Payment amount must be greater than zero.");
      return;
    }

    if (amount > outstanding) {
      alert(
        `Payment cannot exceed the outstanding balance of ${formatCurrency(
          outstanding,
        )}.`,
      );
      return;
    }

    try {
      const response = await fetch("/api/payments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          invoice: selectedInvoice._id,
          ...paymentForm,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.error || "Unable to record payment");
        return;
      }

      await loadData();

      resetPaymentForm();
      setSelectedInvoice(null);
      setShowPaymentModal(false);
    } catch (error) {
      console.error("Record payment error:", error);

      alert("Something went wrong.");
    }
  }

  function openPaymentModal(invoice) {
    const outstanding = Math.max(
      0,
      (invoice.amount || 0) - (invoice.amountPaid || 0),
    );

    setSelectedInvoice(invoice);

    setPaymentForm({
      amount: outstanding > 0 ? String(outstanding) : "",
      paymentDate: new Date().toISOString().split("T")[0],
      paymentMethod: "Bank Transfer",
      reference: "",
      notes: "",
    });

    setShowPaymentModal(true);
  }

  function formatCurrency(amount) {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      maximumFractionDigits: 0,
    }).format(amount || 0);
  }

  function formatDate(date) {
    if (!date) return "—";

    return new Date(date).toLocaleDateString();
  }

  function getOutstanding(invoice) {
    return Math.max(0, (invoice.amount || 0) - (invoice.amountPaid || 0));
  }

  function getStatusClass(status) {
    const classes = {
      Draft: "bg-slate-100 text-slate-700",

      Sent: "bg-blue-50 text-blue-700",

      "Partially Paid": "bg-amber-50 text-amber-700",

      Paid: "bg-green-50 text-green-700",

      Overdue: "bg-red-50 text-red-700",

      Cancelled: "bg-slate-100 text-slate-500",
    };

    return classes[status] || "bg-slate-100 text-slate-700";
  }

  return (
    <main>
      <div className="border-b bg-white">
        <div className="flex flex-col gap-4 px-6 py-6 sm:flex-row sm:items-center sm:justify-between lg:px-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              Payments & Billing
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Manage invoices, payments and outstanding balances.
            </p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => setShowInvoiceModal(true)}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800"
            >
              <Plus size={18} />
              New Invoice
            </button>
          </div>
        </div>
      </div>

      <div className="p-6 lg:p-8">
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">Total Invoiced</p>

            <p className="mt-2 text-2xl font-bold text-slate-900">
              {formatCurrency(totals.totalInvoiced)}
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">Total Paid</p>

            <p className="mt-2 text-2xl font-bold text-green-700">
              {formatCurrency(totals.totalPaid)}
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">Outstanding</p>

            <p className="mt-2 text-2xl font-bold text-red-700">
              {formatCurrency(totals.outstanding)}
            </p>
          </div>
        </div>

        <div className="mt-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap gap-2">
            {[
              "All",
              "Draft",
              "Sent",
              "Partially Paid",
              "Paid",
              "Overdue",
              "Cancelled",
            ].map((status) => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`rounded-lg px-3 py-2 text-sm font-medium transition ${
                  filter === status
                    ? "bg-slate-900 text-white"
                    : "bg-white text-slate-600 hover:bg-slate-100"
                }`}
              >
                {status}
              </button>
            ))}
          </div>

          <div className="flex w-full items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 lg:max-w-sm">
            <Search size={19} className="text-slate-400" />

            <input
              type="text"
              placeholder="Search invoices or clients..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-transparent text-sm outline-none"
            />
          </div>
        </div>

        <div className="mt-5 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          {loading ? (
            <div className="p-8 text-center text-sm text-slate-500">
              Loading invoices...
            </div>
          ) : filteredInvoices.length === 0 ? (
            <div className="p-12 text-center">
              <CreditCard size={40} className="mx-auto text-slate-300" />

              <h3 className="mt-4 font-semibold text-slate-900">
                No invoices found
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                Create an invoice to start tracking billing.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="border-b bg-slate-50">
                  <tr>
                    <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Invoice
                    </th>

                    <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Client
                    </th>

                    <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Due
                    </th>

                    <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Amount
                    </th>

                    <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Paid
                    </th>

                    <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Outstanding
                    </th>

                    <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Status
                    </th>

                    <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Action
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {filteredInvoices.map((invoice) => (
                    <tr key={invoice._id} className="hover:bg-slate-50">
                      <td className="px-5 py-4">
                        <p className="font-medium text-slate-900">
                          {invoice.invoiceNumber}
                        </p>

                        <p className="mt-1 text-xs text-slate-500">
                          {invoice.description}
                        </p>
                      </td>

                      <td className="px-5 py-4 text-sm text-slate-700">
                        {invoice.client?.name || "—"}
                      </td>

                      <td className="px-5 py-4 text-sm text-slate-500">
                        {formatDate(invoice.dueDate)}
                      </td>

                      <td className="px-5 py-4 text-sm font-medium text-slate-900">
                        {formatCurrency(invoice.amount)}
                      </td>

                      <td className="px-5 py-4 text-sm font-medium text-green-700">
                        {formatCurrency(invoice.amountPaid)}
                      </td>

                      <td className="px-5 py-4 text-sm font-medium text-red-700">
                        {formatCurrency(getOutstanding(invoice))}
                      </td>

                      <td className="px-5 py-4">
                        <select
                          value={invoice.status}
                          onChange={async (e) => {
                            const newStatus = e.target.value;

                            try {
                              const response = await fetch("/api/invoices", {
                                method: "PATCH",
                                headers: {
                                  "Content-Type": "application/json",
                                },
                                body: JSON.stringify({
                                  id: invoice._id,
                                  status: newStatus,
                                }),
                              });

                              const data = await response.json();

                              if (!response.ok) {
                                alert(
                                  data.error ||
                                    "Unable to update invoice status",
                                );
                                return;
                              }

                              setInvoices((current) =>
                                current.map((item) =>
                                  item._id === invoice._id ? data : item,
                                ),
                              );
                            } catch (error) {
                              console.error(
                                "Update invoice status error:",
                                error,
                              );

                              alert(
                                "Something went wrong while updating the status.",
                              );
                            }
                          }}
                          className={`rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium outline-none ${getStatusClass(
                            invoice.status,
                          )}`}
                        >
                          <option value="Draft">Draft</option>
                          <option value="Sent">Sent</option>
                          <option value="Partially Paid">Partially Paid</option>
                          <option value="Paid">Paid</option>
                          <option value="Overdue">Overdue</option>
                          <option value="Cancelled">Cancelled</option>
                        </select>
                      </td>
                      <td className="px-5 py-4">
                        {getOutstanding(invoice) > 0 &&
                        invoice.status !== "Cancelled" ? (
                          <button
                            onClick={() => openPaymentModal(invoice)}
                            className="text-sm font-medium text-green-700 hover:underline"
                          >
                            Record Payment
                          </button>
                        ) : invoice.status === "Paid" ? (
                          <span className="inline-flex items-center gap-1 text-sm text-green-600">
                            <CheckCircle2 size={15} />
                            Paid
                          </span>
                        ) : null}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* NEW INVOICE MODAL */}

      {showInvoiceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b px-6 py-5">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">
                  New Invoice
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Create a billing record for a client.
                </p>
              </div>

              <button
                onClick={() => {
                  setShowInvoiceModal(false);
                  resetInvoiceForm();
                }}
                className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateInvoice} className="space-y-5 p-6">
              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-slate-700">
                    Client
                  </label>

                  <select
                    name="client"
                    required
                    value={invoiceForm.client}
                    onChange={handleInvoiceChange}
                    className="mt-2 w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-slate-900"
                  >
                    <option value="">Select client</option>

                    {clients.map((client) => (
                      <option key={client._id} value={client._id}>
                        {client.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700">
                    Engagement
                  </label>

                  <select
                    name="engagement"
                    value={invoiceForm.engagement}
                    onChange={handleInvoiceChange}
                    className="mt-2 w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-slate-900"
                  >
                    <option value="">None</option>

                    {engagements.map((engagement) => (
                      <option key={engagement._id} value={engagement._id}>
                        {engagement.name} — {engagement.client?.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-slate-700">
                    Invoice number
                  </label>

                  <input
                    name="invoiceNumber"
                    required
                    value={invoiceForm.invoiceNumber}
                    onChange={handleInvoiceChange}
                    placeholder="INV-0001"
                    className="mt-2 w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700">
                    Amount
                  </label>

                  <input
                    name="amount"
                    type="number"
                    min="0"
                    required
                    value={invoiceForm.amount}
                    onChange={handleInvoiceChange}
                    placeholder="500000"
                    className="mt-2 w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700">
                  Description
                </label>

                <input
                  name="description"
                  required
                  value={invoiceForm.description}
                  onChange={handleInvoiceChange}
                  placeholder="Professional accounting services"
                  className="mt-2 w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-slate-900"
                />
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-slate-700">
                    Invoice date
                  </label>

                  <input
                    name="invoiceDate"
                    type="date"
                    value={invoiceForm.invoiceDate}
                    onChange={handleInvoiceChange}
                    className="mt-2 w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700">
                    Due date
                  </label>

                  <input
                    name="dueDate"
                    type="date"
                    required
                    value={invoiceForm.dueDate}
                    onChange={handleInvoiceChange}
                    className="mt-2 w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700">
                  Status
                </label>

                <select
                  name="status"
                  value={invoiceForm.status}
                  onChange={handleInvoiceChange}
                  className="mt-2 w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-slate-900"
                >
                  <option value="Draft">Draft</option>

                  <option value="Sent">Sent</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700">
                  Notes
                </label>

                <textarea
                  name="notes"
                  value={invoiceForm.notes}
                  onChange={handleInvoiceChange}
                  rows={3}
                  placeholder="Optional notes"
                  className="mt-2 w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-slate-900"
                />
              </div>

              <div className="flex justify-end gap-3 border-t pt-5">
                <button
                  type="button"
                  onClick={() => {
                    setShowInvoiceModal(false);
                    resetInvoiceForm();
                  }}
                  className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-slate-800"
                >
                  Create Invoice
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* RECORD PAYMENT MODAL */}

      {showPaymentModal && selectedInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b px-6 py-5">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">
                  Record Payment
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  {selectedInvoice.invoiceNumber} ·{" "}
                  {selectedInvoice.client?.name}
                </p>
              </div>

              <button
                onClick={() => {
                  setShowPaymentModal(false);
                  setSelectedInvoice(null);
                  resetPaymentForm();
                }}
                className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleRecordPayment} className="space-y-5 p-6">
              <div className="rounded-xl bg-slate-50 p-4">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Invoice amount</span>

                  <span className="font-medium text-slate-900">
                    {formatCurrency(selectedInvoice.amount)}
                  </span>
                </div>

                <div className="mt-2 flex justify-between text-sm">
                  <span className="text-slate-500">Already paid</span>

                  <span className="font-medium text-green-700">
                    {formatCurrency(selectedInvoice.amountPaid)}
                  </span>
                </div>

                <div className="mt-3 flex justify-between border-t pt-3">
                  <span className="font-medium text-slate-700">
                    Outstanding
                  </span>

                  <span className="font-bold text-red-700">
                    {formatCurrency(getOutstanding(selectedInvoice))}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700">
                  Payment amount
                </label>

                <input
                  name="amount"
                  type="number"
                  min="1"
                  max={getOutstanding(selectedInvoice)}
                  required
                  value={paymentForm.amount}
                  onChange={handlePaymentChange}
                  className="mt-2 w-full rounded-lg border border-slate-300 px-4 py-3 text-lg font-semibold outline-none focus:border-slate-900"
                />
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-slate-700">
                    Payment date
                  </label>

                  <input
                    name="paymentDate"
                    type="date"
                    required
                    value={paymentForm.paymentDate}
                    onChange={handlePaymentChange}
                    className="mt-2 w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700">
                    Payment method
                  </label>

                  <select
                    name="paymentMethod"
                    value={paymentForm.paymentMethod}
                    onChange={handlePaymentChange}
                    className="mt-2 w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-slate-900"
                  >
                    <option value="Bank Transfer">Bank Transfer</option>

                    <option value="Cash">Cash</option>

                    <option value="Card">Card</option>

                    <option value="POS">POS</option>

                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700">
                  Payment reference
                </label>

                <input
                  name="reference"
                  value={paymentForm.reference}
                  onChange={handlePaymentChange}
                  placeholder="Bank transfer reference"
                  className="mt-2 w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-slate-900"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700">
                  Notes
                </label>

                <textarea
                  name="notes"
                  value={paymentForm.notes}
                  onChange={handlePaymentChange}
                  rows={3}
                  placeholder="Optional payment notes"
                  className="mt-2 w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-slate-900"
                />
              </div>

              <div className="flex justify-end gap-3 border-t pt-5">
                <button
                  type="button"
                  onClick={() => {
                    setShowPaymentModal(false);
                    setSelectedInvoice(null);
                    resetPaymentForm();
                  }}
                  className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="inline-flex items-center gap-2 rounded-lg bg-green-700 px-5 py-2.5 text-sm font-medium text-white hover:bg-green-800"
                >
                  <CheckCircle2 size={17} />
                  Record Payment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}

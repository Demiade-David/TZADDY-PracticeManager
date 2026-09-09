"use client";

import { useEffect, useMemo, useState } from "react";

import {
  FileText,
  Plus,
  Search,
  X,
} from "lucide-react";


export default function DocumentsPage() {
  const [documents, setDocuments] = useState([]);
  const [clients, setClients] = useState([]);
  const [engagements, setEngagements] = useState([]);
  const [filings, setFilings] = useState([]);

  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState({
    client: "",
    name: "",
    documentType: "",
    engagement: "",
    filing: "",
    fileUrl: "",
    fileName: "",
    notes: "",
  });

  useEffect(() => {
    let cancelled = false;

    Promise.all([
      fetch("/api/documents"),
      fetch("/api/clients"),
      fetch("/api/engagements"),
      fetch("/api/filings"),
    ])
      .then(async (responses) => {
        const [
          documentsResponse,
          clientsResponse,
          engagementsResponse,
          filingsResponse,
        ] = responses;

        return Promise.all(
          [
            documentsResponse,
            clientsResponse,
            engagementsResponse,
            filingsResponse,
          ].map((response) => response.json())
        );
      })
      .then(
        ([
          documentsData,
          clientsData,
          engagementsData,
          filingsData,
        ]) => {
          if (cancelled) {
            return;
          }

          setDocuments(
            Array.isArray(documentsData) ? documentsData : []
          );

          setClients(
            Array.isArray(clientsData) ? clientsData : []
          );

          setEngagements(
            Array.isArray(engagementsData)
              ? engagementsData
              : []
          );

          setFilings(
            Array.isArray(filingsData) ? filingsData : []
          );
        }
      )
      .catch((error) => {
        console.error("Unable to load documents data:", error);
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

  const filteredDocuments = useMemo(() => {
    const query = search.toLowerCase().trim();

    if (!query) {
      return documents;
    }

    return documents.filter((document) => {
      return (
        document.name?.toLowerCase().includes(query) ||
        document.documentType?.toLowerCase().includes(query) ||
        document.client?.name?.toLowerCase().includes(query) ||
        document.fileName?.toLowerCase().includes(query)
      );
    });
  }, [documents, search]);

  function handleChange(e) {
    const { name, value } = e.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  }

  async function handleSubmit(e) {
    e.preventDefault();

    try {
      const response = await fetch("/api/documents", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.error || "Unable to create document");
        return;
      }

      setDocuments((current) => [data, ...current]);

      setForm({
        client: "",
        name: "",
        documentType: "",
        engagement: "",
        filing: "",
        fileUrl: "",
        fileName: "",
        notes: "",
      });

      setShowModal(false);
    } catch (error) {
      console.error("Create document error:", error);
      alert("Something went wrong.");
    }
  }

  return (
    <main>
      <div className="border-b bg-white">
        <div className="flex flex-col gap-4 px-6 py-6 sm:flex-row sm:items-center sm:justify-between lg:px-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              Documents
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Manage client documents and supporting records.
            </p>
          </div>

          <button
            onClick={() => setShowModal(true)}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800"
          >
            <Plus size={18} />
            Add Document
          </button>
        </div>
      </div>

      <div className="p-6 lg:p-8">
        <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">
              Total Documents
            </p>

            <p className="mt-2 text-3xl font-bold text-slate-900">
              {documents.length}
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">
              Linked to Filings
            </p>

            <p className="mt-2 text-3xl font-bold text-slate-900">
              {documents.filter((document) => document.filing).length}
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">
              Linked to Engagements
            </p>

            <p className="mt-2 text-3xl font-bold text-slate-900">
              {
                documents.filter(
                  (document) => document.engagement
                ).length
              }
            </p>
          </div>
        </div>

        <div className="mb-5 flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3">
          <Search size={19} className="text-slate-400" />

          <input
            type="text"
            placeholder="Search documents, clients or document types..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-transparent text-sm outline-none"
          />
        </div>

        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          {loading ? (
            <div className="p-8 text-center text-sm text-slate-500">
              Loading documents...
            </div>
          ) : filteredDocuments.length === 0 ? (
            <div className="p-12 text-center">
              <FileText
                size={40}
                className="mx-auto text-slate-300"
              />

              <h3 className="mt-4 font-semibold text-slate-900">
                No documents found
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                Add a document to start building your document
                register.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="border-b bg-slate-50">
                  <tr>
                    <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Document
                    </th>

                    <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Client
                    </th>

                    <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Type
                    </th>

                    <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Linked Work
                    </th>

                    <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Uploaded
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {filteredDocuments.map((document) => (
                    <tr
                      key={document._id}
                      className="hover:bg-slate-50"
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100">
                            <FileText
                              size={18}
                              className="text-slate-600"
                            />
                          </div>

                          <div>
                            <p className="font-medium text-slate-900">
                              {document.name}
                            </p>

                            {document.fileName && (
                              <p className="text-xs text-slate-500">
                                {document.fileName}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-4 text-sm text-slate-700">
                        {document.client?.name || "—"}
                      </td>

                      <td className="px-5 py-4 text-sm text-slate-700">
                        {document.documentType}
                      </td>

                      <td className="px-5 py-4">
                        {document.filing ? (
                          <span className="inline-flex rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700">
                            {document.filing.taxType}
                          </span>
                        ) : document.engagement ? (
                          <span className="inline-flex rounded-full bg-purple-50 px-2.5 py-1 text-xs font-medium text-purple-700">
                            {document.engagement.name}
                          </span>
                        ) : (
                          <span className="text-sm text-slate-400">
                            —
                          </span>
                        )}
                      </td>

                      <td className="px-5 py-4 text-sm text-slate-500">
                        {document.uploadedAt
                          ? new Date(
                              document.uploadedAt
                            ).toLocaleDateString()
                          : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b px-6 py-5">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">
                  Add Document
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Record a client document in the practice system.
                </p>
              </div>

              <button
                onClick={() => setShowModal(false)}
                className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
              >
                <X size={20} />
              </button>
            </div>

            <form
              onSubmit={handleSubmit}
              className="space-y-5 p-6"
            >
              <div>
                <label className="block text-sm font-medium text-slate-700">
                  Client
                </label>

                <select
                  name="client"
                  required
                  value={form.client}
                  onChange={handleChange}
                  className="mt-2 w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-slate-900"
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
                  <label className="block text-sm font-medium text-slate-700">
                    Document name
                  </label>

                  <input
                    name="name"
                    required
                    value={form.name}
                    onChange={handleChange}
                    placeholder="e.g. 2025 Audited Financial Statements"
                    className="mt-2 w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700">
                    Document type
                  </label>

                  <select
                    name="documentType"
                    required
                    value={form.documentType}
                    onChange={handleChange}
                    className="mt-2 w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-slate-900"
                  >
                    <option value="">
                      Select type
                    </option>
                    <option value="Financial Statements">
                      Financial Statements
                    </option>
                    <option value="Tax Document">
                      Tax Document
                    </option>
                    <option value="Certificate">
                      Certificate
                    </option>
                    <option value="Receipt">
                      Receipt
                    </option>
                    <option value="Filing Evidence">
                      Filing Evidence
                    </option>
                    <option value="Client Submission">
                      Client Submission
                    </option>
                    <option value="Correspondence">
                      Correspondence
                    </option>
                    <option value="Working Paper">
                      Working Paper
                    </option>
                    <option value="Other">
                      Other
                    </option>
                  </select>
                </div>
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-slate-700">
                    Engagement
                  </label>

                  <select
                    name="engagement"
                    value={form.engagement}
                    onChange={handleChange}
                    className="mt-2 w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-slate-900"
                  >
                    <option value="">
                      None
                    </option>

                    {engagements.map((engagement) => (
                      <option
                        key={engagement._id}
                        value={engagement._id}
                      >
                        {engagement.name} —{" "}
                        {engagement.client?.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700">
                    Filing
                  </label>

                  <select
                    name="filing"
                    value={form.filing}
                    onChange={handleChange}
                    className="mt-2 w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-slate-900"
                  >
                    <option value="">
                      None
                    </option>

                    {filings.map((filing) => (
                      <option
                        key={filing._id}
                        value={filing._id}
                      >
                        {filing.taxType} —{" "}
                        {filing.filingPeriod} —{" "}
                        {filing.client?.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-slate-700">
                    File name
                  </label>

                  <input
                    name="fileName"
                    value={form.fileName}
                    onChange={handleChange}
                    placeholder="e.g. CIT_2025_Return.pdf"
                    className="mt-2 w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700">
                    File URL / reference
                  </label>

                  <input
                    name="fileUrl"
                    value={form.fileUrl}
                    onChange={handleChange}
                    placeholder="Secure file location"
                    className="mt-2 w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700">
                  Notes
                </label>

                <textarea
                  name="notes"
                  value={form.notes}
                  onChange={handleChange}
                  rows={3}
                  placeholder="Optional notes about this document"
                  className="mt-2 w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-slate-900"
                />
              </div>

              <div className="flex justify-end gap-3 border-t pt-5">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-slate-800"
                >
                  Add Document
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import {
  Download,
  Printer,
  X,
  FileText,
  CheckCircle2,
  Clock,
  MapPin,
  Phone,
  Mail,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";
import httpClient from "@/lib/httpClient.js";

export default function CustomerInvoiceModal({
  isOpen,
  onClose,
  bookingId,
  bookingNumber,
}) {
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isOpen || !bookingId) return;

    let isMounted = true;
    setLoading(true);
    setError(null);

    const fetchInvoice = async () => {
      try {
        const response = await httpClient.get(`/api/v1/invoices/booking/${bookingId}`);
        if (isMounted) {
          setInvoice(response.data?.data || response.data);
          setLoading(false);
        }
      } catch (err) {
        if (isMounted) {
          console.error("Failed to load invoice:", err);
          setError(err.response?.data?.message || "Invoice is not ready or booking is still in progress.");
          setLoading(false);
        }
      }
    };

    fetchInvoice();

    return () => {
      isMounted = false;
    };
  }, [isOpen, bookingId]);

  const handleDownloadPdf = async () => {
    if (!bookingId) return;
    try {
      setDownloading(true);
      const response = await httpClient.get(`/api/v1/invoices/booking/${bookingId}/pdf?download=true`, {
        responseType: "blob",
      });

      if (response.data && response.data.type === "application/json") {
        const text = await response.data.text();
        const errJson = JSON.parse(text);
        throw new Error(errJson.message || "Failed to download invoice PDF");
      }

      const blob = new Blob([response.data], { type: "application/pdf" });
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = downloadUrl;
      const filename = invoice?.invoiceNumber ? `${invoice.invoiceNumber}.pdf` : `invoice-${bookingNumber || bookingId}.pdf`;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      setTimeout(() => {
        link.remove();
        window.URL.revokeObjectURL(downloadUrl);
      }, 5000);
      toast.success("Invoice PDF downloaded successfully");
    } catch (err) {
      console.error("Download invoice failed:", err);
      toast.error(err.message || "Failed to download invoice PDF");
    } finally {
      setDownloading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (!isOpen) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/60 backdrop-blur-sm overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative w-full max-w-3xl my-auto bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh] dark:bg-(--surface-1) dark:border-(--border-subtle)">
        {/* Top Header Bar */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-900 text-white border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400">
              <FileText size={18} />
            </div>
            <div>
              <h2 className="text-base font-bold tracking-tight text-white flex items-center gap-2">
                Official Tax Invoice
                {invoice?.invoiceNumber && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-mono font-medium">
                    #{invoice.invoiceNumber}
                  </span>
                )}
              </h2>
              <p className="text-xs text-slate-400">Fixonest Home & Repair Services Pvt. Ltd.</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              disabled={loading || !!error}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-800 text-slate-200 hover:bg-slate-700 transition disabled:opacity-50"
              title="Print Invoice"
            >
              <Printer size={14} />
              Print
            </button>
            <button
              type="button"
              onClick={handleDownloadPdf}
              disabled={loading || downloading || !!error}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-indigo-600 text-white hover:bg-indigo-500 transition shadow-sm disabled:opacity-50"
            >
              {downloading ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Download size={14} />
                  Download PDF
                </>
              )}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
              aria-label="Close modal"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6 bg-slate-50/50 dark:bg-(--surface-2)/40">
          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center text-center">
              <Loader2 className="w-10 h-10 text-indigo-600 animate-spin mb-3" />
              <p className="text-sm font-medium text-slate-600 dark:text-slate-300">Loading your service invoice...</p>
              <p className="text-xs text-slate-400 mt-1">Retrieving official invoice details from secure server</p>
            </div>
          ) : error ? (
            <div className="py-16 px-4 flex flex-col items-center justify-center text-center">
              <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mb-3">
                <AlertCircle size={24} />
              </div>
              <h3 className="text-base font-bold text-slate-800 dark:text-white">Invoice Not Available Yet</h3>
              <p className="text-sm text-slate-500 mt-1 max-w-md dark:text-slate-400">{error}</p>
            </div>
          ) : invoice ? (
            <div className="bg-white p-6 sm:p-8 rounded-xl border border-slate-200 shadow-sm space-y-6 dark:bg-(--surface-1) dark:border-(--border-subtle)">
              {/* Invoice Paper Header */}
              <div className="flex flex-col sm:flex-row justify-between items-start gap-4 pb-6 border-b border-slate-100 dark:border-(--border-subtle)">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-2xl tracking-tight text-slate-900 dark:text-white">
                      FIXO<span className="text-indigo-600 dark:text-indigo-400">NEST</span>
                    </span>
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-slate-100 text-slate-600 dark:bg-(--surface-2) dark:text-(--text-muted)">
                      Tax Invoice
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1 dark:text-slate-400">
                    {invoice.company?.name && !invoice.company.name.toLowerCase().includes("technologies")
                      ? invoice.company.name
                      : "Fixonest Home & Repair Services Pvt. Ltd."}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{invoice.company?.address || "Salt Lake Sector V, Bidhannagar, Kolkata, West Bengal 700091"}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">GSTIN: {invoice.company?.gstin || "19AAACF1234M1Z5"} | CIN: {invoice.company?.cin || "U93000WB2026PTC123456"}</p>
                </div>

                <div className="sm:text-right space-y-1">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold dark:bg-emerald-500/10 dark:text-emerald-300">
                    <CheckCircle2 size={13} />
                    PAID
                  </div>
                  <p className="text-xs text-slate-500 pt-1 dark:text-slate-400">
                    <span className="font-medium text-slate-700 dark:text-slate-300">Invoice No: </span>
                    <span className="font-mono font-bold text-slate-900 dark:text-white">{invoice.invoiceNumber}</span>
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    <span className="font-medium text-slate-700 dark:text-slate-300">Booking No: </span>
                    <span className="font-mono text-slate-800 dark:text-slate-200">#{invoice.bookingNumber}</span>
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    <span className="font-medium text-slate-700 dark:text-slate-300">Date: </span>
                    {new Date(invoice.issueDate || invoice.createdAt).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </p>
                </div>
              </div>

              {/* Billed To & Provider Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pb-6 border-b border-slate-100 dark:border-(--border-subtle) text-xs">
                {/* Customer */}
                <div className="space-y-1.5 bg-slate-50 p-4 rounded-xl dark:bg-(--surface-2)/40">
                  <p className="font-bold text-[11px] uppercase tracking-wider text-slate-400">Billed To</p>
                  <p className="font-semibold text-slate-900 text-sm dark:text-white">{invoice.customer?.name}</p>
                  <p className="text-slate-600 flex items-center gap-1.5 dark:text-slate-300">
                    <Phone size={12} className="text-slate-400" />
                    {invoice.customer?.phone}
                  </p>
                  {invoice.customer?.email && (
                    <p className="text-slate-600 flex items-center gap-1.5 dark:text-slate-300">
                      <Mail size={12} className="text-slate-400" />
                      {invoice.customer?.email}
                    </p>
                  )}
                  {invoice.customer?.address && (
                    <p className="text-slate-600 flex items-start gap-1.5 pt-0.5 dark:text-slate-300">
                      <MapPin size={12} className="text-slate-400 shrink-0 mt-0.5" />
                      <span>
                        {invoice.customer.address.street}, {invoice.customer.address.city} {invoice.customer.address.postalCode}
                      </span>
                    </p>
                  )}
                </div>

                {/* Service Provider */}
                <div className="space-y-1.5 bg-indigo-50/50 p-4 rounded-xl border border-indigo-100/50 dark:bg-indigo-500/10 dark:border-indigo-500/20">
                  <p className="font-bold text-[11px] uppercase tracking-wider text-indigo-700 dark:text-indigo-300">Fulfilled By</p>
                  <p className="font-semibold text-slate-900 text-sm dark:text-white">{invoice.provider?.name}</p>
                  {invoice.provider?.category && (
                    <p className="text-slate-600 dark:text-slate-300">Category: <span className="font-medium text-slate-800 dark:text-white">{invoice.provider.category}</span></p>
                  )}
                  <p className="text-slate-600 flex items-center gap-1.5 dark:text-slate-300">
                    <Phone size={12} className="text-slate-400" />
                    {invoice.provider?.phone || "Verified Fixonest Partner"}
                  </p>
                  <p className="text-slate-600 flex items-center gap-1.5 dark:text-slate-300">
                    <Clock size={12} className="text-slate-400" />
                    Service Slot: {invoice.service?.timeSlot || "Completed Slot"}
                  </p>
                </div>
              </div>

              {/* Service Line Items */}
              <div className="overflow-x-auto w-full">
                <table className="w-full text-left text-xs min-w-[500px]">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-500 uppercase tracking-wider dark:border-(--border-subtle)">
                      <th className="py-2.5 font-semibold w-1/2">Service Description</th>
                      <th className="py-2.5 font-semibold text-center w-1/6 whitespace-nowrap">Quantity</th>
                      <th className="py-2.5 font-semibold text-right w-1/6 whitespace-nowrap">Price</th>
                      <th className="py-2.5 font-semibold text-right w-1/6 whitespace-nowrap pr-2">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-(--border-subtle)">
                    {invoice.items && invoice.items.length > 0 ? (
                      invoice.items.map((item, idx) => (
                        <tr key={idx}>
                          <td className="py-3 pr-4">
                            <p className="font-semibold text-slate-800 text-sm dark:text-white">{item.description}</p>
                            {invoice.service?.categoryName && (
                              <p className="text-[11px] text-slate-400">{invoice.service.categoryName}</p>
                            )}
                          </td>
                          <td className="py-3 text-center text-slate-600 dark:text-slate-300 whitespace-nowrap">
                            {item.quantity} ({invoice.service?.durationMinutes || 60} min)
                          </td>
                          <td className="py-3 text-right text-slate-600 font-medium dark:text-slate-300 whitespace-nowrap">₹{item.unitPrice}</td>
                          <td className="py-3 text-right font-bold text-slate-900 pr-2 dark:text-white whitespace-nowrap">₹{item.total ?? item.amount ?? (item.unitPrice * (item.quantity || 1))}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td className="py-3 pr-4">
                          <p className="font-semibold text-slate-800 text-sm dark:text-white">{invoice.service?.title || "Professional Home Service"}</p>
                          <p className="text-[11px] text-slate-400">{invoice.service?.categoryName}</p>
                        </td>
                        <td className="py-3 text-center text-slate-600 dark:text-slate-300 whitespace-nowrap">1 ({invoice.service?.durationMinutes || 60} min)</td>
                        <td className="py-3 text-right text-slate-600 font-medium dark:text-slate-300 whitespace-nowrap">₹{invoice.subtotal}</td>
                        <td className="py-3 text-right font-bold text-slate-900 dark:text-white whitespace-nowrap pr-2">₹{invoice.subtotal}</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Financial Calculation Breakdown */}
              <div className="pt-4 border-t border-slate-100 dark:border-(--border-subtle) flex flex-col sm:flex-row justify-between gap-6">
                <div className="text-xs text-slate-500 space-y-1.5 sm:max-w-xs dark:text-slate-400">
                  <p className="font-semibold text-slate-700 dark:text-slate-200">Payment Summary:</p>
                  <p>Mode: <span className="font-medium text-slate-800 dark:text-white capitalize">{invoice.paymentMethod?.replace(/_/g, " ") || "Cash on Delivery"}</span></p>
                  <p>Status: <span className="font-medium text-emerald-600 dark:text-emerald-400 capitalize">{invoice.paymentStatus}</span></p>
                  <p>Amount Paid: <span className="font-bold text-slate-900 dark:text-white">₹{invoice.paidAmount}</span></p>
                </div>

                <div className="w-full sm:w-64 space-y-2 text-xs">
                  <div className="flex justify-between text-slate-600 dark:text-slate-300">
                    <span>Subtotal:</span>
                    <span className="font-medium text-slate-800 dark:text-white">₹{invoice.subtotal}</span>
                  </div>
                  {invoice.discount > 0 && (
                    <div className="flex justify-between text-emerald-600 dark:text-emerald-400">
                      <span>Discount:</span>
                      <span className="font-medium">-₹{invoice.discount}</span>
                    </div>
                  )}
                  {invoice.taxAmount > 0 ? (
                    <div className="flex justify-between text-slate-600 dark:text-slate-300">
                      <span>GST / Tax ({invoice.taxRate}%):</span>
                      <span className="font-medium text-slate-800 dark:text-white">₹{invoice.taxAmount}</span>
                    </div>
                  ) : (
                    <div className="flex justify-between text-slate-400">
                      <span>Taxes & Fees:</span>
                      <span>Included</span>
                    </div>
                  )}
                  <div className="flex justify-between border-t border-slate-200 pt-2 text-sm font-extrabold text-slate-900 dark:border-(--border-subtle) dark:text-white">
                    <span>Total Paid:</span>
                    <span>₹{invoice.totalAmount}</span>
                  </div>
                </div>
              </div>

              {/* Guarantee & Terms Footer */}
              <div className="pt-6 border-t border-slate-100 dark:border-(--border-subtle) flex flex-col sm:flex-row justify-between items-end gap-4 text-[11px] text-slate-400">
                <div className="space-y-1">
                  <p className="font-semibold text-slate-600 dark:text-slate-300">Fixonest Quality Assurance:</p>
                  <p>1. 30-day warranty on all completed service repairs.</p>
                  <p>2. Official computer-generated tax invoice valid for all warranty claims.</p>
                </div>
                <div className="text-center sm:text-right border border-dashed border-slate-200 p-2.5 rounded-lg dark:border-(--border-subtle)">
                  <p className="font-bold text-slate-800 dark:text-white">For Fixonest Home & Repair Services Pvt. Ltd.</p>
                  <p className="text-[10px] text-indigo-600 font-semibold mt-1 dark:text-indigo-400">Authorized Digital Signatory</p>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>,
    document.body
  );
}

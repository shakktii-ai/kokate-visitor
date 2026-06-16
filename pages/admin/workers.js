import React, { useState, useEffect, useCallback } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import { toast, ToastContainer } from "react-toastify";
import { HiSearch, HiFilter, HiTrash, HiEye, HiUserAdd, HiRefresh } from "react-icons/hi";
import "react-toastify/dist/ReactToastify.css";

const POSITIONS = [
  "बूथ प्रमुख",
  "शक्ती केंद्र प्रमुख",
  "मंडळ अध्यक्ष",
  "मंडळ सरचिटणीस",
  "शहर उपाध्यक्ष",
  "जिल्हा कार्यकारिणी सदस्य",
  "कार्यकर्ता",
];

const positionColors = {
  "बूथ प्रमुख":            "bg-blue-50 text-blue-700 border-blue-200",
  "शक्ती केंद्र प्रमुख":    "bg-purple-50 text-purple-700 border-purple-200",
  "मंडळ अध्यक्ष":        "bg-red-50 text-red-700 border-red-200",
  "मंडळ सरचिटणीस":      "bg-amber-50 text-amber-700 border-amber-200",
  "शहर उपाध्यक्ष":        "bg-cyan-50 text-cyan-700 border-cyan-200",
  "जिल्हा कार्यकारिणी सदस्य": "bg-slate-50 text-slate-700 border-slate-200",
  "कार्यकर्ता":          "bg-green-50 text-green-700 border-green-200",
};

/* ─── Detail Modal ─────────────────────────────────────────── */
const DetailModal = ({ worker, onClose }) => {
  if (!worker) return null;

  const formatDate = (dateStr) => {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleDateString("mr-IN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric"
    });
  };

  const sections = [
    {
      title: "१. वैयक्तिक माहिती (Personal Info)",
      fields: [
        ["नाव (Full Name)", `${worker.firstName} ${worker.middleName || ""} ${worker.lastName}`],
        ["जन्मतारीख (DOB)", formatDate(worker.DOB)],
        ["वैवाहिक स्थिती (Marital Status)", worker.maritalStatus || "—"],
      ]
    },
    {
      title: "२. पत्ता आणि संपर्क (Address & Contacts)",
      fields: [
        ["प्राथमिक मोबाईल (Mobile)", worker.primaryPhone],
        ["पर्यायी मोबाईल (Alt Mobile)", worker.alternativePhone || "—"],
        ["घर क्रमांक (House No)", worker.houseNo || "—"],
        ["रस्ता / गल्ली (Street)", worker.street || "—"],
        ["गाव / शहर (Village)", worker.village || "—"],
        ["तालुका (Taluka)", worker.taluka || "—"],
        ["जिल्हा (District)", worker.district || "—"],
        ["पिन कोड (Pincode)", worker.pincode || "—"],
      ]
    },
    {
      title: "३. संघटना / जबाबदारी (Position & Area)",
      fields: [
        ["पद (Position)", worker.position],
        ["क्षेत्र / बूथ क्रमांक (Area/Booth)", worker.areaNameOrBooth || "—"],
      ]
    },
    {
      title: "४. कौटुंबिक माहिती (Family Details)",
      fields: [
        ["पती / पत्नीचे नाव", worker.spouseName || "—"],
        ["पती / पत्नीची जन्मतारीख", formatDate(worker.spouseDOB)],
        ["लग्नाचा वाढदिवस", formatDate(worker.anniversaryDate)],
        ["वडिलांचे नाव", worker.fatherName || "—"],
        ["वडिलांची जन्मतारीख", formatDate(worker.fatherDOB)],
        ["आईचे नाव", worker.motherName || "—"],
        ["आईची जन्मतारीख", formatDate(worker.motherDOB)],
        ["पालकांच्या लग्नाचा वाढदिवस", formatDate(worker.parentsAnniversaryDate)],
      ]
    }
  ];

  return (
    <div
      className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-sm overflow-y-auto"
      onClick={onClose}
    >
      <div className="min-h-screen flex items-start justify-center p-4 pt-10">
        <div
          className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl overflow-hidden border border-orange-100"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="sticky top-0 bg-white border-b border-orange-100 px-6 py-4 flex items-center justify-between z-10">
            <div>
              <h2 className="text-xl font-bold text-slate-800 leading-tight">
                {worker.firstName} {worker.lastName}
              </h2>
              <span className={`inline-flex mt-1.5 text-xs px-2.5 py-0.5 rounded-full font-medium border ${positionColors[worker.position] || "bg-gray-100 text-gray-600 border-gray-200"}`}>
                {worker.position}
              </span>
            </div>
            <button
              onClick={onClose}
              className="w-10 h-10 rounded-xl hover:bg-slate-100 flex items-center justify-center text-slate-500 hover:text-slate-700 transition-colors text-xl font-semibold"
            >
              ✕
            </button>
          </div>

          {/* Body */}
          <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
            {sections.map((section) => (
              <div key={section.title} className="space-y-3">
                <h3 className="text-sm font-bold text-slate-800 border-b border-orange-50 pb-1">{section.title}</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {section.fields.map(([label, value]) => (
                    <div key={label} className="bg-slate-50 border border-slate-100 rounded-2xl p-4">
                      <p className="text-xs text-slate-400 mb-1 font-semibold">{label}</p>
                      <p className="text-sm font-medium text-slate-800 break-words">{value}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className="bg-slate-50 border-t border-slate-100 p-4 flex justify-end">
            <button
              onClick={onClose}
              className="px-5 py-2.5 bg-slate-800 text-white rounded-xl hover:bg-slate-900 transition-colors text-sm font-semibold shadow-sm"
            >
              बंद करा (Close)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ─── Confirm Delete Modal ─────────────────────────────────── */
const ConfirmModal = ({ worker, onConfirm, onCancel }) => (
  <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm p-8 text-center border border-orange-100">
      <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4 text-red-500 text-2xl">
        ⚠️
      </div>
      <h3 className="text-slate-800 font-bold text-lg mb-2">कार्यकर्ता डिलीट करायचा?</h3>
      <p className="text-slate-500 text-sm mb-6 leading-relaxed">
        आपण खरोखरच <span className="font-semibold text-slate-700">{worker.firstName} {worker.lastName}</span> यांची नोंदणी हटवू इच्छिता? ही क्रिया पूर्ववत करता येणार नाही.
      </p>
      <div className="flex gap-3">
        <button
          onClick={onCancel}
          className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-sm font-medium hover:bg-slate-50 transition-colors"
        >
          रद्द करा (Cancel)
        </button>
        <button
          onClick={onConfirm}
          className="flex-1 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-bold transition-colors"
        >
          हटवा (Delete)
        </button>
      </div>
    </div>
  </div>
);

/* ─── Main Workers Manager Page ────────────────────────────── */
export default function WorkersList() {
  const router = useRouter();

  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [search, setSearch] = useState("");
  const [position, setPosition] = useState("");
  const [sort, setSort] = useState("newest");
  const limit = 10;

  const [selectedWorker, setSelectedWorker] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  useEffect(() => {
    const role = localStorage.getItem("userRole");
    if (role !== "admin") {
      router.push("/login");
    }
  }, [router]);

  const fetchWorkers = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit, search, position, sort });
      const res = await fetch(`/api/workers?${params}`);
      const data = await res.json();
      if (res.ok && data.success) {
        setWorkers(data.workers);
        setTotal(data.total);
        setTotalPages(data.totalPages);
      } else {
        toast.error("कार्यकर्ता यादी मिळवण्यात अडचण आली.");
      }
    } catch (err) {
      console.error(err);
      toast.error("सर्व्हरशी जोडणी करण्यात अडचण आली.");
    } finally {
      setLoading(false);
    }
  }, [page, search, position, sort]);

  useEffect(() => {
    fetchWorkers();
  }, [fetchWorkers]);

  const handleSearch = (val) => { setSearch(val); setPage(1); };
  const handlePosition = (val) => { setPosition(val); setPage(1); };
  const handleSort = (val) => { setSort(val); setPage(1); };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      const res = await fetch(`/api/workers?id=${deleteTarget._id}`, { method: "DELETE" });
      const data = await res.json();
      if (res.ok && data.success) {
        toast.success("कार्यकर्त्याची नोंदणी यशस्वीरीत्या डिलीट केली.");
        setDeleteTarget(null);
        fetchWorkers();
      } else {
        toast.error(data.error || "डिलीट करण्यास अपयश आले.");
      }
    } catch {
      toast.error("डिलीट करताना अडचण आली.");
    }
  };

  return (
    <>
      <Head>
        <title>कार्यकर्ता यादी – VisitorPass Admin</title>
        <meta name="description" content="Manage and view all registered workers." />
      </Head>

      <ToastContainer position="bottom-right" autoClose={3000} theme="light" />

      <div className="p-4 md:p-8 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">कार्यकर्ता यादी (Workers Manager)</h1>
            <p className="text-slate-500 text-sm mt-0.5">
              एकूण {total} कार्यकर्ता नोंदणीकृत आहेत
            </p>
          </div>
          <div className="flex gap-2.5">
            <button
              onClick={fetchWorkers}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-orange-200 text-orange-600 text-sm font-medium hover:bg-orange-50 transition-colors"
            >
              <HiRefresh className="w-4.5 h-4.5" />
              ताजेतवाने करा (Refresh)
            </button>
            <button
              onClick={() => router.push("/admin/addWorker")}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-white text-sm font-semibold hover:from-orange-600 hover:to-amber-600 transition-all shadow-md shadow-orange-500/20"
            >
              <HiUserAdd className="w-4.5 h-4.5" />
              नवीन कार्यकर्ता
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl border border-orange-100 shadow-sm p-4 flex flex-col md:flex-row gap-3">
          {/* Search bar */}
          <div className="flex-1 relative">
            <HiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />
            <input
              type="text"
              placeholder="नाव, मोबाईल, गाव किंवा पदाने शोधा..."
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
            />
          </div>

          {/* Position filter */}
          <select
            value={position}
            onChange={(e) => handlePosition(e.target.value)}
            className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all outline-none"
          >
            <option value="">सर्व पदे (All Positions)</option>
            {POSITIONS.map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>

          {/* Sort */}
          <select
            value={sort}
            onChange={(e) => handleSort(e.target.value)}
            className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all outline-none"
          >
            <option value="newest">नवीन आधी (Newest)</option>
            <option value="oldest">जुने आधी (Oldest)</option>
          </select>
        </div>

        {/* Main Table */}
        <div className="bg-white rounded-2xl border border-orange-100 shadow-sm overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center h-48">
              <div className="animate-spin w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full" />
            </div>
          ) : workers.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 text-slate-400">
              <span className="text-3xl mb-2">👥</span>
              <p className="text-sm">कोणतेही कार्यकर्ते आढळले नाहीत.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-orange-50/60 border-b border-orange-100">
                  <tr>
                    <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-4 py-3.5">#</th>
                    <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-4 py-3.5">नाव (Name)</th>
                    <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-4 py-3.5">संपर्क (Contact)</th>
                    <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-4 py-3.5">गाव / बूथ (Area/Booth)</th>
                    <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-4 py-3.5">पक्षीय जबाबदारी (Position)</th>
                    <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-4 py-3.5">नोंदणी दिनांक</th>
                    <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-4 py-3.5">कृती (Actions)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {workers.map((w, idx) => (
                    <tr key={w._id} className="hover:bg-orange-50/20 transition-colors">
                      <td className="px-4 py-3 text-slate-400 text-xs">
                        {(page - 1) * limit + idx + 1}
                      </td>
                      <td className="px-4 py-3 font-semibold text-slate-800">
                        {w.firstName} {w.middleName || ""} {w.lastName}
                      </td>
                      <td className="px-4 py-3 space-y-0.5">
                        <p className="text-slate-700 font-medium">{w.primaryPhone}</p>
                        {w.alternativePhone && (
                          <p className="text-slate-400 text-xs">पर्यायी: {w.alternativePhone}</p>
                        )}
                      </td>
                      <td className="px-4 py-3 space-y-0.5">
                        <p className="text-slate-700">{w.village || "—"}</p>
                        {w.areaNameOrBooth && (
                          <p className="text-slate-400 text-xs">{w.areaNameOrBooth}</p>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-xs px-2.5 py-1 rounded-full font-semibold border ${positionColors[w.position] || "bg-gray-100 text-gray-600 border-gray-200"}`}>
                          {w.position}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-500 text-xs">
                        {w.createdAt ? new Date(w.createdAt).toLocaleDateString("mr-IN") : "—"}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => setSelectedWorker(w)}
                            className="p-1.5 rounded-lg hover:bg-orange-100 text-orange-500 transition-colors"
                            title="तपशील पहा"
                          >
                            <HiEye className="w-4.5 h-4.5" />
                          </button>
                          <button
                            onClick={() => setDeleteTarget(w)}
                            className="p-1.5 rounded-lg hover:bg-red-100 text-red-400 hover:text-red-600 transition-colors"
                            title="काढून टाका"
                          >
                            <HiTrash className="w-4.5 h-4.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Pagination */}
        {!loading && totalPages > 1 && (
          <div className="flex items-center justify-between">
            <p className="text-slate-500 text-xs">
              Showing {(page - 1) * limit + 1}–{Math.min(page * limit, total)} of {total} workers
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 text-xs disabled:opacity-40 hover:bg-slate-50 transition-colors"
              >
                ← Prev
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`w-7 h-7 rounded-lg text-xs font-bold transition-colors ${
                    p === page
                      ? "bg-gradient-to-r from-orange-500 to-amber-500 text-white"
                      : "border border-slate-200 text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  {p}
                </button>
              ))}
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 text-xs disabled:opacity-40 hover:bg-slate-50 transition-colors"
              >
                Next →
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {selectedWorker && (
        <DetailModal
          worker={selectedWorker}
          onClose={() => setSelectedWorker(null)}
        />
      )}

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <ConfirmModal
          worker={deleteTarget}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </>
  );
}

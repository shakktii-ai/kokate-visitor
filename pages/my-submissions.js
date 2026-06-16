import React, { useState, useEffect, useCallback } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import { toast } from "react-toastify";
import { HiCheckCircle, HiClock, HiExclamation, HiXCircle, HiSearch, HiFilter, HiEye } from "react-icons/hi";

const PURPOSES = [
  { value: "medical", label: "वैद्यकीय मदत (Medical)" },
  { value: "education", label: "शिक्षण (Education)" },
  { value: "job", label: "नोकरी (Job)" },
  { value: "schemes", label: "शासकीय योजना (Schemes)" },
  { value: "business", label: "व्यवसाय (Business)" },
  { value: "utility", label: "नागरी सुविधा (Utility)" },
  { value: "police", label: "पोलीस तक्रार/अर्ज (Police)" },
  { value: "administrative", label: "प्रशासकीय काम (Administrative)" }
];

const purposeColors = {
  medical:        "bg-red-50 text-red-600 border-red-200",
  education:      "bg-blue-50 text-blue-600 border-blue-200",
  job:            "bg-green-50 text-green-600 border-green-200",
  schemes:        "bg-purple-50 text-purple-600 border-purple-200",
  business:       "bg-amber-50 text-amber-600 border-amber-200",
  utility:        "bg-cyan-50 text-cyan-600 border-cyan-200",
  police:         "bg-slate-50 text-slate-600 border-slate-200",
  administrative: "bg-orange-50 text-orange-600 border-orange-200",
};

const purposeLabels = {
  medical: "वैद्यकीय मदत",
  education: "शिक्षण",
  job: "नोकरी",
  schemes: "शासकीय योजना",
  business: "व्यवसाय",
  utility: "नागरी सुविधा",
  police: "पोलीस तक्रार/अर्ज",
  administrative: "प्रशासकीय काम"
};

const statusStyles = {
  "Pending": {
    bg: "bg-amber-50 text-amber-700 border-amber-200",
    icon: <HiClock className="w-4 h-4 text-amber-500 flex-shrink-0" />,
    label: "प्रलंबित (Pending)"
  },
  "In Progress": {
    bg: "bg-blue-50 text-blue-700 border-blue-200",
    icon: <HiClock className="w-4 h-4 text-blue-500 flex-shrink-0 animate-pulse" />,
    label: "प्रगतीपथावर (In Progress)"
  },
  "Completed": {
    bg: "bg-green-50 text-green-700 border-green-200",
    icon: <HiCheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />,
    label: "पूर्ण झाले (Completed)"
  },
  "Rejected": {
    bg: "bg-red-50 text-red-700 border-red-200",
    icon: <HiXCircle className="w-4 h-4 text-red-500 flex-shrink-0" />,
    label: "नाकारले (Rejected)"
  }
};

/* ─── Detail Modal ─────────────────────────────────────────── */
const DetailModal = ({ visitor, onClose }) => {
  if (!visitor) return null;

  const getStatusText = (status) => {
    return statusStyles[status]?.label || status || "प्रलंबित (Pending)";
  };

  const getGenderText = (sex) => {
    if (sex === "male") return "पुरुष";
    if (sex === "female") return "महिला";
    if (sex === "other") return "इतर";
    return sex || "—";
  };

  const fields = [
    ["पूर्ण नाव (Name)", visitor.fullName],
    ["ईमेल (Email)", visitor.email],
    ["फोन नंबर (Phone)", visitor.phoneNo],
    ["वय (Age)", visitor.age],
    ["लिंग (Gender)", getGenderText(visitor.sex)],
    ["जन्मतारीख (DOB)", visitor.DOB ? new Date(visitor.DOB).toLocaleDateString("mr-IN") : "—"],
    ["आधार / मतदार ओळखपत्र", visitor.aadharVoter],
    ["घर क्रमांक", visitor.houseNo],
    ["जवळची खूण / लँडमार्क", visitor.landmark],
    ["गाव / शहर (Village)", visitor.village],
    ["पिनकोड (Pincode)", visitor.pincode],
    ["भेट देण्याचा हेतू (Purpose)", purposeLabels[visitor.purpose] || visitor.purpose],
    ["अर्ज सद्यस्थिती (Status)", getStatusText(visitor.status)],
    ["नोंदणी दिनांक (Registered On)", visitor.createdAt ? new Date(visitor.createdAt).toLocaleString("mr-IN") : "—"],
  ].filter(([, value]) => value);

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
            <div className="flex items-center gap-3">
              {visitor.photos ? (
                <img
                  src={visitor.photos}
                  alt={visitor.fullName}
                  className="w-12 h-12 rounded-full object-cover border-2 border-orange-200"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-400 to-amber-400 flex items-center justify-center text-white font-bold text-lg">
                  {visitor.fullName?.[0]?.toUpperCase() || "?"}
                </div>
              )}
              <div>
                <h2 className="text-lg font-bold text-slate-800 leading-tight">
                  {visitor.fullName}
                </h2>
                <span className={`inline-flex mt-1.5 text-xs px-2 py-0.5 rounded-full font-medium border ${purposeColors[visitor.purpose] || "bg-gray-100 text-gray-600 border-gray-200"}`}>
                  {purposeLabels[visitor.purpose] || visitor.purpose}
                </span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-10 h-10 rounded-xl hover:bg-slate-100 flex items-center justify-center text-slate-500 hover:text-slate-700 transition-colors text-xl font-semibold"
            >
              ✕
            </button>
          </div>

          {/* Body */}
          <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
            {/* Status Highlight */}
            <div className={`p-4 rounded-2xl border ${statusStyles[visitor.status || "Pending"]?.bg} flex items-start gap-3`}>
              {statusStyles[visitor.status || "Pending"]?.icon}
              <div>
                <h4 className="font-bold text-sm">अर्ज प्रगतीची स्थिती (Application Status)</h4>
                <p className="text-sm mt-0.5 font-semibold">
                  {statusStyles[visitor.status || "Pending"]?.label}
                </p>
                {visitor.followUp ? (
                  <div className="mt-2.5 pt-2 border-t border-current/20">
                    <p className="text-xs opacity-75 font-semibold">अद्यतन टिप्पणी / फॉलो-अप:</p>
                    <p className="text-sm font-medium mt-0.5 break-words whitespace-pre-line">{visitor.followUp}</p>
                  </div>
                ) : (
                  <p className="text-xs opacity-75 mt-1.5 font-medium">कोणतीही फॉलो-अप टिप्पणी उपलब्ध नाही.</p>
                )}
              </div>
            </div>

            {/* Form Fields Grid */}
            <div>
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-3">नोंदणी तपशील (Submission Details)</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {fields.map(([label, value]) => (
                  <div key={label} className="bg-slate-50 border border-slate-100 rounded-2xl p-4">
                    <p className="text-xs text-slate-400 mb-1 font-semibold">{label}</p>
                    <p className="text-sm font-medium text-slate-800 break-words">{value}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Message/Notes */}
            {visitor.message && (
              <div className="bg-orange-50/20 border border-orange-100/50 rounded-2xl p-4">
                <h4 className="text-xs text-slate-500 font-bold mb-1">अतिरिक्त निरोप / संदेश</h4>
                <p className="text-sm text-slate-700 whitespace-pre-line leading-relaxed">{visitor.message}</p>
              </div>
            )}
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

/* ─── Main Submissions Listing ──────────────────────────────── */
export default function MySubmissions() {
  const router = useRouter();
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [search, setSearch] = useState("");
  const [purpose, setPurpose] = useState("");
  const [sort, setSort] = useState("newest");
  const limit = 9;

  const [selectedVisitor, setSelectedVisitor] = useState(null);

  useEffect(() => {
    const role = localStorage.getItem("userRole");
    const username = localStorage.getItem("username");
    if (!role || !username) {
      router.push("/login");
    }
  }, [router]);

  const fetchSubmissions = useCallback(async () => {
    const username = localStorage.getItem("username") || "";
    if (!username) return;

    setLoading(true);
    try {
      const params = new URLSearchParams({
        page,
        limit,
        search,
        purpose,
        sort,
        addedBy: username
      });
      const res = await fetch(`/api/visitors?${params}`);
      const data = await res.json();
      if (res.ok && data.success) {
        setSubmissions(data.visitors);
        setTotal(data.total);
        setTotalPages(data.totalPages);
      } else {
        toast.error(data.error || "अर्ज यादी आणण्यात अडचण आली.");
      }
    } catch (err) {
      console.error(err);
      toast.error("सर्व्हरशी संपर्क साधता आला नाही.");
    } finally {
      setLoading(false);
    }
  }, [page, search, purpose, sort]);

  useEffect(() => {
    fetchSubmissions();
  }, [fetchSubmissions]);

  // Reset to page 1 when filter values change
  const handleSearch = (val) => { setSearch(val); setPage(1); };
  const handlePurpose = (val) => { setPurpose(val); setPage(1); };
  const handleSort = (val) => { setSort(val); setPage(1); };

  const getStatusBadge = (status) => {
    const style = statusStyles[status] || statusStyles["Pending"];
    return (
      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${style.bg}`}>
        {style.icon}
        {style.label}
      </span>
    );
  };

  return (
    <>
      <Head>
        <title>माझे अर्ज (My Submissions) – Smt Mayuri Rahul Kokate</title>
        <meta name="description" content="Track status and progress of visitor forms submitted by you." />
      </Head>

      <div className="max-w-6xl mx-auto px-4 md:px-8 py-6 md:py-10 space-y-6">
        {/* Title */}
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-800">माझे अर्ज (My Submissions)</h1>
          <p className="text-slate-500 text-sm mt-1">
            तुमच्याद्वारे नोंदणी केलेल्या भेट देणाऱ्यांचे तपशील, कामाची सद्यस्थिती आणि फॉलो-अप टिप्पणी पहा.
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl border border-orange-100 shadow-sm p-4 flex flex-col sm:flex-row gap-3">
          {/* Search bar */}
          <div className="flex-1 relative">
            <HiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4.5 h-4.5" />
            <input
              type="text"
              placeholder="नाव, फोन किंवा गावाने शोधा..."
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/10 rounded-xl text-slate-800 placeholder-slate-400 text-sm transition-all"
            />
          </div>

          {/* Purpose dropdown */}
          <select
            value={purpose}
            onChange={(e) => handlePurpose(e.target.value)}
            className="px-4 py-2.5 bg-slate-50 border border-slate-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/10 rounded-xl text-slate-700 text-sm transition-all outline-none"
          >
            <option value="">सर्व हेतू (All Purposes)</option>
            {PURPOSES.map((p) => (
              <option key={p.value} value={p.value}>{p.label}</option>
            ))}
          </select>

          {/* Sort dropdown */}
          <select
            value={sort}
            onChange={(e) => handleSort(e.target.value)}
            className="px-4 py-2.5 bg-slate-50 border border-slate-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/10 rounded-xl text-slate-700 text-sm transition-all outline-none"
          >
            <option value="newest">नवीन सर्वात आधी (Newest)</option>
            <option value="oldest">जुने सर्वात आधी (Oldest)</option>
          </select>
        </div>

        {/* Main List */}
        {loading ? (
          <div className="flex items-center justify-center py-24">
            <div className="animate-spin w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full" />
          </div>
        ) : submissions.length === 0 ? (
          <div className="bg-white rounded-2xl border border-orange-100 shadow-sm p-12 text-center max-w-md mx-auto space-y-3">
            <div className="w-16 h-16 bg-orange-50 rounded-full flex items-center justify-center mx-auto text-orange-500 text-2xl">
              📝
            </div>
            <h3 className="font-bold text-slate-800">कोणतीही नोंद सापडली नाही</h3>
            <p className="text-slate-400 text-xs leading-relaxed">
              तुमच्याकडून अद्याप कोणताही अर्ज भरण्यात आलेला नाही किंवा शोध निष्पन्न झाला नाही. नवीन अर्ज भरण्यासाठी 'Register' वर जा.
            </p>
            <button
              onClick={() => router.push("/form")}
              className="mt-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-white hover:from-orange-600 hover:to-amber-600 transition-all text-xs font-bold shadow-md shadow-orange-500/10 inline-block"
            >
              नवीन नोंदणी करा
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {submissions.map((v) => (
              <div
                key={v._id}
                className="bg-white rounded-2xl border border-orange-100/70 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col overflow-hidden group hover:border-orange-200"
              >
                {/* Status bar */}
                <div className="px-5 py-3.5 bg-slate-50 border-b border-orange-50/50 flex justify-between items-center">
                  <span className="text-xs text-slate-400 font-semibold">
                    {v.createdAt ? new Date(v.createdAt).toLocaleDateString("mr-IN") : ""}
                  </span>
                  {getStatusBadge(v.status)}
                </div>

                {/* Body details */}
                <div className="p-5 flex-grow space-y-4">
                  <div className="flex items-center gap-3">
                    {v.photos ? (
                      <img
                        src={v.photos}
                        alt={v.fullName}
                        className="w-11 h-11 rounded-full object-cover border border-orange-100 flex-shrink-0"
                      />
                    ) : (
                      <div className="w-11 h-11 rounded-full bg-gradient-to-br from-orange-400 to-amber-400 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                        {v.fullName?.[0]?.toUpperCase() || "?"}
                      </div>
                    )}
                    <div className="min-w-0">
                      <h3 className="font-bold text-slate-800 text-sm truncate group-hover:text-orange-500 transition-colors">
                        {v.fullName}
                      </h3>
                      <p className="text-xs text-slate-400 mt-0.5">गावं/शहर: {v.village || "—"}</p>
                    </div>
                  </div>

                  {/* Purpose Info */}
                  <div className="flex flex-wrap items-center justify-between text-xs pt-1">
                    <span className="text-slate-400">भेट हेतू:</span>
                    <span className={`px-2.5 py-0.5 rounded-full font-medium border ${purposeColors[v.purpose] || "bg-slate-100 text-slate-600 border-slate-200"}`}>
                      {purposeLabels[v.purpose] || v.purpose}
                    </span>
                  </div>

                  {/* Progress log section */}
                  <div className="bg-slate-50/70 border border-slate-100 rounded-xl p-3.5 space-y-1 mt-2">
                    <p className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">फॉलो-अप प्रगती (Follow-up Notes)</p>
                    <p className="text-xs font-semibold text-slate-700 line-clamp-2 leading-relaxed">
                      {v.followUp || "कामाची प्रगती लवकरच येथे अद्ययावत केली जाईल."}
                    </p>
                  </div>
                </div>

                {/* View Action */}
                <div className="px-5 pb-5 pt-0">
                  <button
                    onClick={() => setSelectedVisitor(v)}
                    className="w-full py-2.5 rounded-xl border border-orange-200/60 hover:bg-orange-50 text-orange-600 text-xs font-bold transition-all flex items-center justify-center gap-1.5 group-hover:border-orange-300"
                  >
                    <HiEye className="w-4 h-4" />
                    तपशील पहा (View Details)
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {!loading && totalPages > 1 && (
          <div className="flex items-center justify-between pt-4">
            <p className="text-slate-500 text-xs">
              एकूण {total} पैकी {(page - 1) * limit + 1}–{Math.min(page * limit, total)} अर्ज दाखवत आहे
            </p>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 text-xs disabled:opacity-40 hover:bg-slate-50 transition-colors font-medium"
              >
                मागे (Prev)
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
                className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 text-xs disabled:opacity-40 hover:bg-slate-50 transition-colors font-medium"
              >
                पुढे (Next)
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {selectedVisitor && (
        <DetailModal
          visitor={selectedVisitor}
          onClose={() => setSelectedVisitor(null)}
        />
      )}
    </>
  );
}

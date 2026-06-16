import React, { useState, useEffect, useCallback } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import { toast, ToastContainer } from "react-toastify";
import { HiUser, HiPhone, HiMap, HiBriefcase, HiHeart, HiArrowLeft, HiSave } from "react-icons/hi";
import dynamic from "next/dynamic";
import "react-toastify/dist/ReactToastify.css";

const ReactTransliterate = dynamic(
  () => import("react-transliterate").then((mod) => mod.ReactTransliterate),
  { ssr: false }
);

const POSITIONS = [
  { value: "बूथ प्रमुख", label: "बूथ प्रमुख" },
  { value: "शक्ती केंद्र प्रमुख", label: "शक्ती केंद्र प्रमुख" },
  { value: "मंडळ अध्यक्ष", label: "मंडळ अध्यक्ष" },
  { value: "मंडळ सरचिटणीस", label: "मंडळ सरचिटणीस" },
  { value: "शहर उपाध्यक्ष", label: "शहर उपाध्यक्ष" },
  { value: "जिल्हा कार्यकारिणी सदस्य", label: "जिल्हा कार्यकारिणी सदस्य" },
  { value: "कार्यकर्ता", label: "कार्यकर्ता" },
];

const MARITAL_STATUSES = [
  { value: "अविवाहित", label: "अविवाहित (Single)" },
  { value: "विवाहित", label: "विवाहित (Married)" },
  { value: "घटस्फोटित", label: "घटस्फोटित (Divorced)" },
  { value: "विधुर / विधवा", label: "विधुर / विधवा (Widowed)" },
];

export default function AddWorker() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    firstName: "",
    middleName: "",
    lastName: "",
    houseNo: "",
    street: "",
    village: "",
    taluka: "",
    district: "",
    pincode: "",
    primaryPhone: "",
    alternativePhone: "",
    position: "",
    areaNameOrBooth: "",
    DOB: "",
    maritalStatus: "",
    spouseName: "",
    spouseDOB: "",
    anniversaryDate: "",
    fatherName: "",
    fatherDOB: "",
    motherName: "",
    motherDOB: "",
    parentsAnniversaryDate: "",
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const role = localStorage.getItem("userRole");
    if (role !== "admin") {
      router.push("/login");
    }
  }, [router]);

  const handleTextChange = useCallback((name, value) => {
    setFormData((prev) => {
      const updated = { ...prev, [name]: value };
      if (name === "maritalStatus" && value !== "विवाहित") {
        updated.spouseName = "";
        updated.spouseDOB = "";
        updated.anniversaryDate = "";
      }
      return updated;
    });
    setErrors((prev) => ({ ...prev, [name]: "" }));
  }, []);

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    handleTextChange(name, value);
  }, [handleTextChange]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.firstName || !formData.firstName.trim()) {
      newErrors.firstName = "प्रथम नाव आवश्यक आहे.";
    }
    if (!formData.lastName || !formData.lastName.trim()) {
      newErrors.lastName = "आडनाव आवश्यक आहे.";
    }
    if (!formData.primaryPhone || !formData.primaryPhone.trim()) {
      newErrors.primaryPhone = "मोबाईल नंबर आवश्यक आहे.";
    } else if (!/^\d{10}$/.test(formData.primaryPhone.trim())) {
      newErrors.primaryPhone = "मोबाईल नंबर अचूक १० अंकी असावा.";
    }
    if (formData.alternativePhone && formData.alternativePhone.trim() && !/^\d{10}$/.test(formData.alternativePhone.trim())) {
      newErrors.alternativePhone = "पर्यायी मोबाईल नंबर अचूक १० अंकी असावा.";
    }
    if (!formData.position) {
      newErrors.position = "पद निवडणे आवश्यक आहे.";
    }
    if (formData.pincode && formData.pincode.toString().trim() && !/^\d{6}$/.test(formData.pincode.toString().trim())) {
      newErrors.pincode = "पिनकोड अचूक ६ अंकी असावा.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("कृपया सर्व आवश्यक आणि वैध माहिती भरा.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/workers/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        toast.success("कार्यकर्त्याची यशस्वी नोंदणी झाली!");
        setFormData({
          firstName: "",
          middleName: "",
          lastName: "",
          houseNo: "",
          street: "",
          village: "",
          taluka: "",
          district: "",
          pincode: "",
          primaryPhone: "",
          alternativePhone: "",
          position: "",
          areaNameOrBooth: "",
          DOB: "",
          maritalStatus: "",
          spouseName: "",
          spouseDOB: "",
          anniversaryDate: "",
          fatherName: "",
          fatherDOB: "",
          motherName: "",
          motherDOB: "",
          parentsAnniversaryDate: "",
        });
        setErrors({});
      } else {
        toast.error(data.message || "नोंदणी सबमिट करण्यास अपयश आले.");
      }
    } catch (error) {
      console.error(error);
      toast.error("फॉर्म सबमिट करताना एरर आली.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputClass =
    "w-full bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 p-3 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all duration-300";

  const labelClass = "block text-slate-700 text-sm font-medium mb-1.5";

  const renderInput = (label, name, type = "text", placeholder = "", transliterate = false) => {
    const hasError = !!errors[name];

    return (
      <div>
        <label className={labelClass}>{label}</label>
        {transliterate ? (
          <ReactTransliterate
            value={formData[name] || ""}
            onChangeText={(val) => handleTextChange(name, val)}
            lang="mr"
            renderComponent={(props) => (
              <input
                type={type}
                name={name}
                placeholder={placeholder || "प्रविष्ट करा"}
                className={`${inputClass} ${
                  hasError ? "border-red-500 focus:ring-red-500/20" : ""
                }`}
                {...props}
              />
            )}
          />
        ) : (
          <input
            type={type}
            name={name}
            value={formData[name] || ""}
            onChange={handleChange}
            placeholder={placeholder || "प्रविष्ट करा"}
            className={`${inputClass} ${
              hasError ? "border-red-500 focus:ring-red-500/20" : ""
            }`}
          />
        )}
        {hasError && <p className="text-xs text-red-500 mt-1">{errors[name]}</p>}
      </div>
    );
  };

  const renderSelect = (label, name, options) => {
    const hasError = !!errors[name];
    return (
      <div>
        <label className={labelClass}>{label}</label>
        <select
          name={name}
          value={formData[name]}
          onChange={handleChange}
          className={`${inputClass} ${
            hasError ? "border-red-500 focus:ring-red-500/20" : ""
          }`}
        >
          <option value="">निवडा</option>
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        {hasError && <p className="text-xs text-red-500 mt-1">{errors[name]}</p>}
      </div>
    );
  };

  return (
    <>
      <Head>
        <title>कार्यकर्ता नोंदणी फॉर्म – Smt Mayuri Rahul Kokate</title>
        <meta name="description" content="Worker registration form for admin panel." />
      </Head>

      <ToastContainer position="bottom-right" autoClose={3000} theme="light" />

      <div className="p-4 md:p-8 space-y-6 max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => router.push("/admin")}
            className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-800 hover:bg-slate-50 transition-all duration-300"
          >
            <HiArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-800">
              कार्यकर्ता नोंदणी फॉर्म (Worker Registration Form)
            </h1>
            <p className="text-slate-500 text-sm mt-0.5">
              संघटना आणि बूथ पातळीवरील नवीन कार्यकर्त्यांची नोंदणी करा
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Section 1: Personal Details */}
          <div className="bg-white rounded-3xl border border-orange-100 p-6 md:p-8 shadow-sm space-y-5">
            <div className="flex items-center gap-2.5 pb-2 border-b border-orange-50">
              <HiUser className="w-5 h-5 text-orange-500" />
              <h2 className="text-base font-bold text-slate-800">१. वैयक्तिक माहिती (Personal Details)</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {renderInput("प्रथम नाव (First Name) *", "firstName", "text", "उदा: राजेश", true)}
              {renderInput("मधले नाव (Middle Name)", "middleName", "text", "उदा: अशोक", true)}
              {renderInput("आडनाव (Last Name) *", "lastName", "text", "उदा: पाटील", true)}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {renderInput("जन्मतारीख (Date of Birth)", "DOB", "date")}
              {renderSelect("वैवाहिक स्थिती (Marital Status)", "maritalStatus", MARITAL_STATUSES)}
            </div>
          </div>

          {/* Section 2: Address & Contacts */}
          <div className="bg-white rounded-3xl border border-orange-100 p-6 md:p-8 shadow-sm space-y-5">
            <div className="flex items-center gap-2.5 pb-2 border-b border-orange-50">
              <HiMap className="w-5 h-5 text-orange-500" />
              <h2 className="text-base font-bold text-slate-800">२. पत्ता आणि संपर्क (Address & Contacts)</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {renderInput("मोबाईल नंबर (Primary Mobile) *", "primaryPhone", "tel", "उदा: 9876543210")}
              {renderInput("पर्यायी मोबाईल (Alternative Mobile)", "alternativePhone", "tel", "उदा: 9876543210")}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {renderInput("घर क्रमांक (House No.)", "houseNo", "text", "उदा: घर नं. १२")}
              {renderInput("रस्ता / गल्ली (Street / Road)", "street", "text", "उदा: गणेश नगर", true)}
              {renderInput("गाव / शहर (Village / City)", "village", "text", "उदा: चिंचवड", true)}
              {renderInput("तालुका (Taluka)", "taluka", "text", "उदा: हवेली", true)}
              {renderInput("जिल्हा (District)", "district", "text", "उदा: पुणे", true)}
              {renderInput("पिन कोड (Pincode)", "pincode", "number", "उदा: 411033")}
            </div>
          </div>

          {/* Section 3: Organization Details */}
          <div className="bg-white rounded-3xl border border-orange-100 p-6 md:p-8 shadow-sm space-y-5">
            <div className="flex items-center gap-2.5 pb-2 border-b border-orange-50">
              <HiBriefcase className="w-5 h-5 text-orange-500" />
              <h2 className="text-base font-bold text-slate-800">३. पद आणि कार्यक्षेत्र (Position & Area)</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {renderSelect("पक्ष/संघटना मधील पद (Position) *", "position", POSITIONS)}
              {renderInput("क्षेत्र किंवा बूथ क्रमांक (Area Name / Booth)", "areaNameOrBooth", "text", "उदा: बूथ क्र. १४५ किंवा प्रभाग १२")}
            </div>
          </div>

          {/* Section 4: Family Details */}
          <div className="bg-white rounded-3xl border border-orange-100 p-6 md:p-8 shadow-sm space-y-5">
            <div className="flex items-center gap-2.5 pb-2 border-b border-orange-50">
              <HiHeart className="w-5 h-5 text-orange-500" />
              <h2 className="text-base font-bold text-slate-800">४. कौटुंबिक माहिती (Family Details)</h2>
            </div>
            {formData.maritalStatus === "विवाहित" && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {renderInput("पती / पत्नीचे नाव (Spouse Name)", "spouseName", "text", "उदा: पूजा राजेश पाटील", true)}
                {renderInput("पती / पत्नीची जन्मतारीख (Spouse DOB)", "spouseDOB", "date")}
                {renderInput("लग्नाचा वाढदिवस (Anniversary Date)", "anniversaryDate", "date")}
              </div>
            )}
            <div className="border-t border-orange-50 pt-4 space-y-4">
              <h3 className="text-sm font-bold text-slate-800">पालकांची माहिती (Parents Details)</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {renderInput("वडिलांचे नाव (Father Name)", "fatherName", "text", "उदा: अशोक गणपत पाटील", true)}
                {renderInput("वडिलांची जन्मतारीख (Father DOB)", "fatherDOB", "date")}
                {renderInput("आईचे नाव (Mother Name)", "motherName", "text", "उदा: सुनीता अशोक पाटील", true)}
                {renderInput("आईची जन्मतारीख (Mother DOB)", "motherDOB", "date")}
                <div className="md:col-span-2">
                  {renderInput("पालकांच्या लग्नाचा वाढदिवस (Parents Anniversary Date)", "parentsAnniversaryDate", "date")}
                </div>
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 px-8 py-3.5 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 text-white font-semibold hover:from-orange-600 hover:to-amber-600 transition-all disabled:opacity-50 shadow-md shadow-orange-500/25 text-sm"
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  नोंदणी होत आहे...
                </>
              ) : (
                <>
                  <HiSave className="w-5 h-5" />
                  नोंदणी सबमिट करा (Submit)
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}

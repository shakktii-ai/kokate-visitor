import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/router";
import { HiUser, HiPhone, HiMap, HiBriefcase, HiHeart, HiArrowLeft, HiSave, HiCamera, HiCloudUpload } from "react-icons/hi";
import dynamic from "next/dynamic";

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

export default function WorkerForm({ initialData, onSubmit, isSubmitting, backPath = "/admin", createdBy = "admin" }) {
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
    photo: "",
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (initialData) {
      // Map initial data to form fields and format dates appropriately for input type="date"
      const formatInputDate = (dateStr) => {
        if (!dateStr) return "";
        try {
          return new Date(dateStr).toISOString().split("T")[0];
        } catch {
          return "";
        }
      };

      setFormData({
        firstName: initialData.firstName || "",
        middleName: initialData.middleName || "",
        lastName: initialData.lastName || "",
        houseNo: initialData.houseNo || "",
        street: initialData.street || "",
        village: initialData.village || "",
        taluka: initialData.taluka || "",
        district: initialData.district || "",
        pincode: initialData.pincode || "",
        primaryPhone: initialData.primaryPhone || "",
        alternativePhone: initialData.alternativePhone || "",
        position: initialData.position || "",
        areaNameOrBooth: initialData.areaNameOrBooth || "",
        DOB: formatInputDate(initialData.DOB),
        maritalStatus: initialData.maritalStatus || "",
        spouseName: initialData.spouseName || "",
        spouseDOB: formatInputDate(initialData.spouseDOB),
        anniversaryDate: formatInputDate(initialData.anniversaryDate),
        fatherName: initialData.fatherName || "",
        fatherDOB: formatInputDate(initialData.fatherDOB),
        motherName: initialData.motherName || "",
        motherDOB: formatInputDate(initialData.motherDOB),
        parentsAnniversaryDate: formatInputDate(initialData.parentsAnniversaryDate),
        photo: initialData.photo || "",
      });
    }
  }, [initialData]);

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

  const handleFileChange = useCallback((e, fieldName) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => ({ ...prev, [fieldName]: reader.result }));
        setErrors((prev) => ({ ...prev, [fieldName]: "" }));
      };
      reader.readAsDataURL(file);
    }
  }, []);

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

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }
    onSubmit(formData);
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

  const renderFileUpload = (label, fieldName) => {
    const hasError = !!errors[fieldName];
    return (
      <div className="space-y-1.5">
        <label className={labelClass}>{label}</label>
        <div className="relative">
          {formData[fieldName] ? (
            <div className="relative group max-w-xs">
              <img
                src={formData[fieldName]}
                alt="Preview"
                className={`w-full h-40 object-cover rounded-xl border ${
                  hasError ? "border-red-500" : "border-orange-100"
                }`}
              />
              <div
                className="absolute inset-0 bg-black/40 rounded-xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                onClick={() => document.getElementById(`file-${fieldName}`).click()}
              >
                <HiCamera className="w-8 h-8 text-white" />
              </div>
            </div>
          ) : (
            <div
              className={`w-full max-w-xs h-40 border-2 border-dashed rounded-xl flex flex-col items-center justify-center cursor-pointer hover:bg-orange-50/20 transition-all duration-300 ${
                hasError
                  ? "border-red-500 hover:border-red-500/50"
                  : "border-slate-200 hover:border-orange-500/50"
              }`}
              onClick={() => document.getElementById(`file-${fieldName}`).click()}
            >
              <HiCloudUpload className={`w-10 h-10 mb-2 ${hasError ? "text-red-400" : "text-slate-400"}`} />
              <p className={`text-sm ${hasError ? "text-red-500" : "text-slate-500"}`}>अपलोड करण्यासाठी क्लिक करा</p>
            </div>
          )}
          <input
            id={`file-${fieldName}`}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => handleFileChange(e, fieldName)}
          />
        </div>
        {hasError && <p className="text-xs text-red-500 mt-1">{errors[fieldName]}</p>}
      </div>
    );
  };

  return (
    <div className="p-4 md:p-8 space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={() => router.push(backPath)}
          className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-800 hover:bg-slate-50 transition-all duration-300"
        >
          <HiArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-800">
            {initialData ? "कार्यकर्ता माहिती बदला (Edit Worker Details)" : "कार्यकर्ता नोंदणी फॉर्म (Worker Registration Form)"}
          </h1>
          <p className="text-slate-500 text-sm mt-0.5">
            {initialData ? "नोंदणीकृत कार्यकर्त्याची माहिती अद्ययावत करा" : "संघटना आणि बूथ पातळीवरील नवीन कार्यकर्त्यांची नोंदणी करा"}
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
          {renderFileUpload("कार्यकर्त्याचा फोटो (Worker Photo)", "photo")}
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
                {initialData ? "बदल होत आहेत..." : "नोंदणी होत आहे..."}
              </>
            ) : (
              <>
                <HiSave className="w-5 h-5" />
                {initialData ? "बदल जतन करा (Save Changes)" : "नोंदणी सबमिट करा (Submit)"}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

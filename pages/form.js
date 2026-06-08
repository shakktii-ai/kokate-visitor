import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/router";
import { toast } from "react-toastify";
import { HiCamera, HiCheckCircle, HiArrowLeft, HiArrowRight, HiCloudUpload } from "react-icons/hi";
import dynamic from 'next/dynamic';

const ReactTransliterate = dynamic(
  () => import('react-transliterate').then(mod => mod.ReactTransliterate),
  { ssr: false }
);

const Form = () => {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const totalSteps = 4;

  const [formData, setFormData] = useState({
    photos: "", fullName: "", email: "", phoneNo: "", age: "", sex: "", DOB: "", aadharVoter: "",
    houseNo: "", landmark: "", village: "", pincode: "",
    purpose: "",
    patiantName: "", hospitalName: "", trackingDoctor: "", reason: "",
    studentName: "", studentDOB: "", studentGender: "", studentCategory: "", studentPhoto: "",
    jobFullName: "", jobPosition: "", jobDepartment: "", jobLocation: "", jobSalary: "",
    employeeName: "", employeeId: "", employeeDepartment: "", employeeDesignation: "", employeeRDepartment: "", employeeRTransfer: "",
    schemeName: "", schemePApplication: "", schemeApplyDate: "", schemeMaritalStatus: "", schemeCategary: "", schemeAddhar: "",
    businessName: "", businessType: "", businessSector: "", businessRNo: "", businessDOE: "", businessGST: "", businessAddress: "",
    utilityServiceInstallation: "", utilityProblem: "",
    policeApplicationNo: "", policeApplicationDate: "", policeApplicationPlace: "", policeIncidentDetails: "", policeInvolveName: "", policeDeclaration: "", policePhoto: "",
    projectName: "", projectLocation: "", projectProblem: "",
    message: "",
  });

  const [errors, setErrors] = useState({});

  // Revisit Lookup States
  const [searchPhone, setSearchPhone] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    const userRole = localStorage.getItem("userRole");
    if (userRole !== "user") {
      router.push("/login");
    }
  }, [router]);

  const calculateAge = (dobString) => {
    if (!dobString || !/^\d{4}-\d{2}-\d{2}$/.test(dobString)) return "";
    const today = new Date();
    const birthDate = new Date(dobString);
    if (isNaN(birthDate.getTime())) return "";
    let calculatedAge = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      calculatedAge--;
    }
    return calculatedAge >= 0 && calculatedAge <= 100 ? calculatedAge.toString() : "";
  };

  const handleTextChange = useCallback((name, value) => {
    setFormData((prev) => {
      const updated = { ...prev, [name]: value };
      if (name === "DOB") {
        updated.age = calculateAge(value);
      }
      return updated;
    });

    setErrors((prev) => {
      const updated = { ...prev, [name]: "" };
      if (name === "DOB") {
        updated.age = "";
      }
      if (name === "purpose") {
        const purposeFields = [
          "patiantName", "hospitalName", "trackingDoctor", "reason",
          "studentName", "studentDOB", "studentGender", "studentCategory", "studentPhoto",
          "jobFullName", "jobPosition", "jobDepartment", "jobLocation", "jobSalary",
          "employeeName", "employeeId", "employeeDepartment", "employeeDesignation", "employeeRDepartment", "employeeRTransfer",
          "schemeName", "schemePApplication", "schemeApplyDate", "schemeMaritalStatus", "schemeCategary", "schemeAddhar",
          "businessName", "businessType", "businessSector", "businessRNo", "businessDOE", "businessGST", "businessAddress",
          "utilityServiceInstallation", "utilityProblem",
          "policeApplicationNo", "policeApplicationDate", "policeApplicationPlace", "policeIncidentDetails", "policeInvolveName", "policeDeclaration", "policePhoto",
          "projectName", "projectLocation", "projectProblem"
        ];
        purposeFields.forEach((f) => {
          updated[f] = "";
        });
      }
      return updated;
    });
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

  // Revisit Pre-fill Logic
  const handleRevisitLookup = async () => {
    if (!searchPhone) {
      toast.warning("कृपया शोधण्यासाठी फोन नंबर प्रविष्ट करा.");
      return;
    }
    
    setIsSearching(true);
    try {
      const response = await fetch(`/api/lookup-visitor?phone=${encodeURIComponent(searchPhone)}`);
      const data = await response.json();

      if (response.ok) {
        let formattedDOB = "";
        if (data.DOB) {
          formattedDOB = new Date(data.DOB).toISOString().split("T")[0];
        }

        setFormData((prev) => {
          const updated = {
            ...prev,
            ...data,
            DOB: formattedDOB,
            purpose: "",
          };
          updated.age = calculateAge(formattedDOB);
          return updated;
        });

        setErrors({});
        toast.success(`पुन्हा स्वागत आहे, ${data.fullName}! तुमचे तपशील भरले गेले आहेत.`);
        setCurrentStep(3);
      } else {
        toast.error(data.error || "कोणतीही नोंद सापडली नाही. कृपया नवीन भेट देणारे म्हणून नोंदणी करा.");
      }
    } catch (error) {
      console.error("Error looking up returning visitor:", error);
      toast.error("तपशील शोधताना त्रुटी आली. कृपया स्वतः तपशील भरा.");
    } finally {
      setIsSearching(false);
    }
  };

  const validateStep = (step) => {
    const newErrors = {};

    if (step === 1) {
      if (!formData.fullName || !formData.fullName.trim()) {
        newErrors.fullName = "पूर्ण नाव आवश्यक आहे.";
      } else if (formData.fullName.trim().length < 3) {
        newErrors.fullName = "पूर्ण नाव किमान ३ अक्षरांचे असावे.";
      } else if (!/^[A-Za-z\u0900-\u097F\s]+$/.test(formData.fullName.trim())) {
        newErrors.fullName = "नावामध्ये फक्त अक्षरे आणि जागा असावी.";
      }

      if (formData.email && formData.email.trim() !== "") {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email.trim())) {
          newErrors.email = "कृपया वैध ईमेल पत्ता प्रविष्ट करा.";
        }
      }

      if (!formData.phoneNo || !formData.phoneNo.trim()) {
        newErrors.phoneNo = "फोन नंबर आवश्यक आहे.";
      } else if (!/^\d{10}$/.test(formData.phoneNo.trim())) {
        newErrors.phoneNo = "फोन नंबर अचूक १० अंकी असणे आवश्यक आहे.";
      }

      if (!formData.age || formData.age.toString().trim() === "") {
        newErrors.age = "वय आवश्यक आहे.";
      } else {
        const parsedAge = parseInt(formData.age, 10);
        if (isNaN(parsedAge) || parsedAge < 1 || parsedAge > 100) {
          newErrors.age = "वय १ ते १०० दरम्यान असावे.";
        }
      }

      if (!formData.sex) {
        newErrors.sex = "लिंग निवडणे आवश्यक आहे.";
      }

      if (!formData.DOB) {
        newErrors.DOB = "जन्मतारीख आवश्यक आहे.";
      } else {
        const dobDate = new Date(formData.DOB);
        const today = new Date();
        if (dobDate > today) {
          newErrors.DOB = "जन्मतारीख भविष्यातील नसावी.";
        } else {
          let calculatedAge = today.getFullYear() - dobDate.getFullYear();
          const m = today.getMonth() - dobDate.getMonth();
          if (m < 0 || (m === 0 && today.getDate() < dobDate.getDate())) {
            calculatedAge--;
          }
          if (calculatedAge > 100) {
            newErrors.DOB = "जन्मतारीख १०० वर्षांपेक्षा जुनी नसावी.";
          }
        }
      }

      if (formData.aadharVoter && formData.aadharVoter.trim() !== "") {
        const val = formData.aadharVoter.trim();
        if (/^\d+$/.test(val)) {
          if (val.length !== 12) {
            newErrors.aadharVoter = "आधार कार्ड अचूक १२ अंकी असणे आवश्यक आहे.";
          }
        } else if (val.length < 5) {
          newErrors.aadharVoter = "कृपया वैध आधार किंवा मतदार ओळखपत्र प्रविष्ट करा.";
        }
      }
    }

    if (step === 2) {
      if (!formData.houseNo || !formData.houseNo.trim()) {
        newErrors.houseNo = "घर क्रमांक आवश्यक आहे.";
      }
      if (!formData.village || !formData.village.trim()) {
        newErrors.village = "गाव / शहर आवश्यक आहे.";
      }
      if (!formData.pincode || !formData.pincode.toString().trim()) {
        newErrors.pincode = "पिनकोड आवश्यक आहे.";
      } else if (!/^\d{6}$/.test(formData.pincode.toString().trim())) {
        newErrors.pincode = "पिनकोड अचूक ६ अंकी असणे आवश्यक आहे.";
      }
    }

    if (step === 3) {
      if (!formData.purpose) {
        newErrors.purpose = "भेट देण्याचा हेतू आवश्यक आहे.";
      } else {
        switch (formData.purpose) {
          case "medical":
            if (!formData.patiantName || !formData.patiantName.trim()) newErrors.patiantName = "रुग्णाचे नाव आवश्यक आहे.";
            if (!formData.hospitalName || !formData.hospitalName.trim()) newErrors.hospitalName = "रुग्णालयाचे नाव आवश्यक आहे.";
            if (!formData.trackingDoctor || !formData.trackingDoctor.trim()) newErrors.trackingDoctor = "डॉक्टरचे नाव आवश्यक आहे.";
            if (!formData.reason || !formData.reason.trim()) newErrors.reason = "भेट देण्याचे कारण आवश्यक आहे.";
            break;
          case "education":
            if (!formData.studentName || !formData.studentName.trim()) newErrors.studentName = "विद्यार्थ्याचे नाव आवश्यक आहे.";
            if (!formData.studentDOB) newErrors.studentDOB = "विद्यार्थ्याची जन्मतारीख आवश्यक आहे.";
            if (!formData.studentGender) newErrors.studentGender = "विद्यार्थ्याचे लिंग आवश्यक आहे.";
            if (!formData.studentCategory || !formData.studentCategory.trim()) newErrors.studentCategory = "जात प्रवर्ग आवश्यक आहे.";
            break;
          case "job": {
            const hasJobAppField = [
              formData.jobFullName,
              formData.jobPosition,
              formData.jobDepartment,
              formData.jobLocation,
              formData.jobSalary
            ].some(val => val && val.trim() !== "");

            const hasEmployeeField = [
              formData.employeeName,
              formData.employeeId,
              formData.employeeDepartment,
              formData.employeeDesignation,
              formData.employeeRDepartment,
              formData.employeeRTransfer
            ].some(val => val && val.trim() !== "");

            if (!hasJobAppField && !hasEmployeeField) {
              newErrors.jobFullName = "कृपया नोकरी अर्ज किंवा कर्मचारी बदली यापैकी एक पर्याय पूर्ण भरा.";
              newErrors.employeeName = "कृपया नोकरी अर्ज किंवा कर्मचारी बदली यापैकी एक पर्याय पूर्ण भरा.";
            } else {
              if (hasJobAppField) {
                if (!formData.jobFullName || !formData.jobFullName.trim()) newErrors.jobFullName = "पूर्ण नाव आवश्यक आहे.";
                if (!formData.jobPosition || !formData.jobPosition.trim()) newErrors.jobPosition = "अर्ज केलेले पद आवश्यक आहे.";
                if (!formData.jobDepartment || !formData.jobDepartment.trim()) newErrors.jobDepartment = "विभाग आवश्यक आहे.";
                if (!formData.jobLocation || !formData.jobLocation.trim()) newErrors.jobLocation = "अपेक्षित ठिकाण आवश्यक आहे.";
                if (!formData.jobSalary || !formData.jobSalary.toString().trim()) newErrors.jobSalary = "अपेक्षित वेतन आवश्यक आहे.";
              }
              if (hasEmployeeField) {
                if (!formData.employeeName || !formData.employeeName.trim()) newErrors.employeeName = "कर्मचाऱ्याचे नाव आवश्यक आहे.";
                if (!formData.employeeId || !formData.employeeId.trim()) newErrors.employeeId = "कर्मचारी आयडी आवश्यक आहे.";
                if (!formData.employeeDepartment || !formData.employeeDepartment.trim()) newErrors.employeeDepartment = "विभाग आवश्यक आहे.";
                if (!formData.employeeDesignation || !formData.employeeDesignation.trim()) newErrors.employeeDesignation = "पदनाम आवश्यक आहे.";
                if (!formData.employeeRDepartment || !formData.employeeRDepartment.trim()) newErrors.employeeRDepartment = "विनंती केलेला विभाग आवश्यक आहे.";
                if (!formData.employeeRTransfer || !formData.employeeRTransfer.trim()) newErrors.employeeRTransfer = "बदलीचे सविस्तर तपशील आवश्यक आहेत.";
              }
            }
            break;
          }
          case "schemes":
            if (!formData.schemeName || !formData.schemeName.trim()) newErrors.schemeName = "योजनेचे नाव आवश्यक आहे.";
            if (!formData.schemeApplyDate) newErrors.schemeApplyDate = "अर्जाची तारीख आवश्यक आहे.";
            if (!formData.schemeMaritalStatus) newErrors.schemeMaritalStatus = "वैवाहिक स्थिती आवश्यक आहे.";
            if (!formData.schemeCategary || !formData.schemeCategary.trim()) newErrors.schemeCategary = "जात प्रवर्ग आवश्यक आहे.";
            break;
          case "business":
            if (!formData.businessName || !formData.businessName.trim()) newErrors.businessName = "व्यवसायाचे नाव आवश्यक आहे.";
            if (!formData.businessType || !formData.businessType.trim()) newErrors.businessType = "व्यवसायाचा प्रकार आवश्यक आहे.";
            if (!formData.businessSector || !formData.businessSector.trim()) newErrors.businessSector = "व्यवसाय क्षेत्र आवश्यक आहे.";
            if (!formData.businessDOE) newErrors.businessDOE = "स्थापना तारीख आवश्यक आहे.";
            if (!formData.businessAddress || !formData.businessAddress.trim()) newErrors.businessAddress = "व्यवसायाचा पत्ता आवश्यक आहे.";
            if (formData.businessGST && formData.businessGST.trim() !== "") {
              if (formData.businessGST.trim().length !== 15) {
                newErrors.businessGST = "जीएसटी क्रमांक अचूक १५ अक्षरी असणे आवश्यक आहे.";
              }
            }
            break;
          case "utility":
            if (!formData.utilityServiceInstallation || !formData.utilityServiceInstallation.trim()) newErrors.utilityServiceInstallation = "सुविधेचे नाव / प्रकार आवश्यक आहे.";
            if (!formData.utilityProblem || !formData.utilityProblem.trim()) newErrors.utilityProblem = "समस्येचे वर्णन आवश्यक आहे.";
            break;
          case "police":
            if (!formData.policeApplicationNo || !formData.policeApplicationNo.trim()) newErrors.policeApplicationNo = "अर्ज क्रमांक आवश्यक आहे.";
            if (!formData.policeApplicationDate) newErrors.policeApplicationDate = "अर्जाची तारीख आवश्यक आहे.";
            if (!formData.policeApplicationPlace || !formData.policeApplicationPlace.trim()) newErrors.policeApplicationPlace = "अर्जाचे ठिकाण आवश्यक आहे.";
            if (!formData.policeIncidentDetails || !formData.policeIncidentDetails.trim()) newErrors.policeIncidentDetails = "घटनेचा सविस्तर तपशील आवश्यक आहे.";
            if (!formData.policeDeclaration || !formData.policeDeclaration.trim()) newErrors.policeDeclaration = "घोषणापत्र आवश्यक आहे.";
            break;
          case "administrative":
            if (!formData.projectName || !formData.projectName.trim()) newErrors.projectName = "प्रकल्पाचे नाव आवश्यक आहे.";
            if (!formData.projectLocation || !formData.projectLocation.trim()) newErrors.projectLocation = "प्रकल्पाचे ठिकाण आवश्यक आहे.";
            if (!formData.projectProblem || !formData.projectProblem.trim()) newErrors.projectProblem = "समस्येचे वर्णन आवश्यक आहे.";
            break;
        }
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (currentStep !== totalSteps) {
      if (validateStep(currentStep)) {
        setCurrentStep((prev) => prev + 1);
      } else {
        toast.error("कृपया सर्व आवश्यक क्षेत्रे योग्यरित्या भरा.");
      }
      return;
    }

    let allStepsValid = true;
    let firstFailedStep = null;
    
    for (let step = 1; step <= 3; step++) {
      if (!validateStep(step)) {
        allStepsValid = false;
        if (firstFailedStep === null) {
          firstFailedStep = step;
        }
      }
    }
    
    if (!allStepsValid) {
      setCurrentStep(firstFailedStep);
      toast.error(`कृपया सबमिट करण्यापूर्वी पायरी ${firstFailedStep} मधील त्रुटी सुधारा.`);
      return;
    }

    setIsSubmitting(true);
    try {
      const addedBy = localStorage.getItem("username") || "";
      const payload = { ...formData, addedBy };
      const res = await fetch("/api/addform", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await res.json();
      if (res.ok) {
        toast.success("भेट देणाऱ्याची यशस्वी नोंदणी झाली!");
        setIsSubmitted(true);
      } else {
        toast.error(result.error || "नोंदणी सबमिट करण्यास अपयश आले.");
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      toast.error("फॉर्म सबमिट करताना एरर आली.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const stepLabels = ["वैयक्तिक माहिती", "पत्ता", "भेट देण्याचा हेतू", "पुनरावलोकन"];

  const inputClass =
    "w-full bg-white border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 p-3 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all duration-300";

  const labelClass = "block text-slate-700 text-sm font-medium mb-1.5";

  const renderInput = (label, name, type = "text", placeholder = "") => {
    const hasError = !!errors[name];
    const noTransliterateNames = [
      "email",
      "phoneNo",
      "age",
      "pincode",
      "aadharVoter",
      "policeApplicationNo",
      "businessGST",
      "employeeId",
      "schemeAddhar",
      "jobSalary"
    ];

    const shouldTransliterate = type === "text" && !noTransliterateNames.includes(name);

    return (
      <div>
        <label className={labelClass}>{label}</label>
        {shouldTransliterate ? (
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
                  hasError
                    ? "border-red-500 focus:ring-red-500/20 focus:border-red-500"
                    : "border-slate-200 focus:ring-orange-500/20 focus:border-orange-500"
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
              hasError
                ? "border-red-500 focus:ring-red-500/20 focus:border-red-500"
                : "border-slate-200 focus:ring-orange-500/20 focus:border-orange-500"
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
            hasError
              ? "border-red-500 focus:ring-red-500/20 focus:border-red-500"
              : "border-slate-200 focus:ring-orange-500/20 focus:border-orange-500"
          }`}
        >
          <option value="">{label} निवडा</option>
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
      <div>
        <label className={labelClass}>{label}</label>
        <div className="relative">
          {formData[fieldName] ? (
            <div className="relative group max-w-sm mx-auto">
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
              className={`w-full h-40 border-2 border-dashed rounded-xl flex flex-col items-center justify-center cursor-pointer hover:bg-orange-50/20 transition-all duration-300 ${
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

  const renderPurposeFields = () => {
    switch (formData.purpose) {
      case "medical":
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            {renderInput("रुग्णाचे नाव", "patiantName")}
            {renderInput("रुग्णालयाचे नाव", "hospitalName")}
            {renderInput("उपचार करणारे डॉक्टर", "trackingDoctor")}
            {renderInput("भेट देण्याचे कारण", "reason")}
          </div>
        );
      case "education":
        return (
          <div className="space-y-4 mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {renderInput("विद्यार्थ्याचे नाव", "studentName")}
              {renderInput("विद्यार्थ्याची जन्मतारीख", "studentDOB", "date")}
              {renderSelect("विद्यार्थ्याचे लिंग", "studentGender", [
                { value: "male", label: "पुरुष" },
                { value: "female", label: "महिला" },
                { value: "other", label: "इतर" },
              ])}
              {renderInput("जात प्रवर्ग", "studentCategory")}
            </div>
            {renderFileUpload("विद्यार्थ्याचा फोटो", "studentPhoto")}
          </div>
        );
      case "job":
        return (
          <div className="space-y-4 mt-4">
            <h4 className="text-slate-800 font-bold text-sm border-b border-orange-100 pb-1">नोकरी अर्ज</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {renderInput("उमेदवाराचे पूर्ण नाव", "jobFullName")}
              {renderInput("अर्ज केलेले पद", "jobPosition")}
              {renderInput("विभाग", "jobDepartment")}
              {renderInput("अपेक्षित ठिकाण", "jobLocation")}
              {renderInput("अपेक्षित वेतन", "jobSalary")}
            </div>
            <h4 className="text-slate-800 font-bold text-sm border-b border-orange-100 pb-1 pt-2">कर्मचारी बदली</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {renderInput("कर्मचाऱ्याचे नाव", "employeeName")}
              {renderInput("कर्मचारी आयडी", "employeeId")}
              {renderInput("विभाग", "employeeDepartment")}
              {renderInput("पदनाम", "employeeDesignation")}
              {renderInput("विनंती केलेला विभाग", "employeeRDepartment")}
              {renderInput("बदलीचे ठिकाण/तपशील", "employeeRTransfer")}
            </div>
          </div>
        );
      case "schemes":
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            {renderInput("योजनेचे नाव", "schemeName")}
            {renderInput("पूर्वी अर्ज केला आहे का (तपशील)", "schemePApplication")}
            {renderInput("अर्ज केल्याची तारीख", "schemeApplyDate", "date")}
            {renderSelect("वैवाहिक स्थिती", "schemeMaritalStatus", [
              { value: "single", label: "अविवाहित" },
              { value: "married", label: "विवाहित" },
              { value: "divorced", label: "घटस्फोटित" },
              { value: "widowed", label: "विधवा / विधुर" },
            ])}
            {renderInput("जात प्रवर्ग", "schemeCategary")}
            {renderInput("आधार कार्ड क्रमांक", "schemeAddhar")}
          </div>
        );
      case "business":
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            {renderInput("व्यवसायाचे नाव", "businessName")}
            {renderInput("व्यवसायाचा प्रकार", "businessType")}
            {renderInput("व्यवसाय क्षेत्र", "businessSector")}
            {renderInput("नोंदणी क्रमांक", "businessRNo")}
            {renderInput("स्थापना तारीख", "businessDOE", "date")}
            {renderInput("जीएसटी (GST) क्रमांक", "businessGST")}
            <div className="md:col-span-2">
              {renderInput("व्यवसायाचा पत्ता", "businessAddress")}
            </div>
          </div>
        );
      case "utility":
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            {renderInput("सुविधेचे नाव / प्रकार", "utilityServiceInstallation")}
            {renderInput("समस्येचे वर्णन", "utilityProblem")}
          </div>
        );
      case "police":
        return (
          <div className="space-y-4 mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {renderInput("तक्रार / अर्ज क्रमांक", "policeApplicationNo")}
              {renderInput("अर्जाची तारीख", "policeApplicationDate", "date")}
              {renderInput("अर्जाचे ठिकाण", "policeApplicationPlace")}
              {renderInput("संबंधित व्यक्तीचे नाव", "policeInvolveName")}
            </div>
            <div>
              <label className={labelClass}>घटनेचा तपशील</label>
              <ReactTransliterate
                value={formData.policeIncidentDetails || ""}
                onChangeText={(val) => handleTextChange("policeIncidentDetails", val)}
                lang="mr"
                renderComponent={(props) => (
                  <textarea
                    name="policeIncidentDetails"
                    rows={3}
                    className={`${inputClass} resize-none ${
                      errors.policeIncidentDetails
                        ? "border-red-500 focus:ring-red-500/20 focus:border-red-500"
                        : "border-slate-200 focus:ring-orange-500/20 focus:border-orange-500"
                    }`}
                    placeholder="घटनेचे सविस्तर वर्णन येथे लिहा..."
                    {...props}
                  />
                )}
              />
              {errors.policeIncidentDetails && (
                <p className="text-xs text-red-500 mt-1">{errors.policeIncidentDetails}</p>
              )}
            </div>
            <div>
              <label className={labelClass}>स्वयंघोषणापत्र</label>
              <ReactTransliterate
                value={formData.policeDeclaration || ""}
                onChangeText={(val) => handleTextChange("policeDeclaration", val)}
                lang="mr"
                renderComponent={(props) => (
                  <textarea
                    name="policeDeclaration"
                    rows={3}
                    className={`${inputClass} resize-none ${
                      errors.policeDeclaration
                        ? "border-red-500 focus:ring-red-500/20 focus:border-red-500"
                        : "border-slate-200 focus:ring-orange-500/20 focus:border-orange-500"
                    }`}
                    placeholder="आपली स्वयंघोषणा येथे लिहा..."
                    {...props}
                  />
                )}
              />
              {errors.policeDeclaration && (
                <p className="text-xs text-red-500 mt-1">{errors.policeDeclaration}</p>
              )}
            </div>
            {renderFileUpload("घटनेचा पुरावा किंवा फोटो", "policePhoto")}
          </div>
        );
      case "administrative":
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            {renderInput("प्रकल्पाचे नाव", "projectName")}
            {renderInput("प्रकल्पाचे ठिकाण", "projectLocation")}
            <div className="md:col-span-2">
              <label className={labelClass}>समस्येचे वर्णन</label>
              <ReactTransliterate
                value={formData.projectProblem || ""}
                onChangeText={(val) => handleTextChange("projectProblem", val)}
                lang="mr"
                renderComponent={(props) => (
                  <textarea
                    name="projectProblem"
                    rows={3}
                    className={`${inputClass} resize-none ${
                      errors.projectProblem
                        ? "border-red-500 focus:ring-red-500/20 focus:border-red-500"
                        : "border-slate-200 focus:ring-orange-500/20 focus:border-orange-500"
                    }`}
                    placeholder="समस्येचे सविस्तर वर्णन येथे लिहा..."
                    {...props}
                  />
                )}
              />
              {errors.projectProblem && (
                <p className="text-xs text-red-500 mt-1">{errors.projectProblem}</p>
              )}
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-5">
            {/* Returning Visitor Pre-fill Lookup Panel */}
            <div className="bg-orange-50/50 border border-orange-100 rounded-2xl p-4 md:p-5 shadow-sm space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                <div>
                  <h4 className="text-slate-800 font-bold text-sm">पूर्वी भेट दिली आहे का?</h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    तुमच्या नोंदणीकृत फोन नंबरचा वापर करून तुमचे तपशील त्वरित भरा.
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <input
                  type="tel"
                  placeholder="नोंदणीकृत फोन नंबर टाका..."
                  value={searchPhone}
                  onChange={(e) => setSearchPhone(e.target.value)}
                  className="flex-1 px-4 py-2.5 bg-white border border-slate-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/10 rounded-xl text-slate-800 placeholder-slate-400 outline-none text-sm transition-all"
                />
                <button
                  type="button"
                  onClick={handleRevisitLookup}
                  disabled={isSearching || !searchPhone}
                  className="px-5 py-2.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 disabled:opacity-50 text-white text-sm font-semibold rounded-xl transition-all shadow-md shadow-orange-500/10 flex items-center gap-1.5 whitespace-nowrap"
                >
                  {isSearching ? (
                    <>
                      <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      शोधत आहे...
                    </>
                  ) : (
                    "तपशील शोधा"
                  )}
                </button>
              </div>
            </div>

            <h3 className="text-xl font-bold text-slate-800">वैयक्तिक माहिती</h3>
            {renderFileUpload("फोटो", "photos")}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {renderInput("पूर्ण नाव", "fullName")}
              {renderInput("ईमेल", "email", "email")}
              {renderInput("फोन नंबर", "phoneNo", "tel")}
              {renderInput("वय", "age", "number")}
              {renderSelect("लिंग", "sex", [
                { value: "male", label: "पुरुष" },
                { value: "female", label: "महिला" },
                { value: "other", label: "इतर" },
              ])}
              {renderInput("जन्मतारीख", "DOB", "date")}
              {renderInput("आधार / मतदार ओळखपत्र", "aadharVoter")}
            </div>
          </div>
        );
      case 2:
        return (
          <div className="space-y-5">
            <h3 className="text-xl font-bold text-slate-800">पत्ता तपशील</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {renderInput("घर क्रमांक", "houseNo")}
              {renderInput("जवळची खूण / लँडमार्क", "landmark")}
              {renderInput("गाव / शहर", "village")}
              {renderInput("पिनकोड", "pincode")}
            </div>
          </div>
        );
      case 3:
        return (
          <div className="space-y-5">
            <h3 className="text-xl font-bold text-slate-800">भेट देण्याचा हेतू</h3>
            {renderSelect("हेतू", "purpose", [
              { value: "medical", label: "वैद्यकीय मदत" },
              { value: "education", label: "शिक्षण" },
              { value: "job", label: "नोकरी" },
              { value: "schemes", label: "शासकीय योजना" },
              { value: "business", label: "व्यवसाय" },
              { value: "utility", label: "नागरी सुविधा" },
              { value: "police", label: "पोलीस तक्रार/अर्ज" },
              { value: "administrative", label: "प्रशासकीय काम" },
            ])}
            {renderPurposeFields()}
          </div>
        );
      case 4:
        return (
          <div className="space-y-5">
            <h3 className="text-xl font-bold text-slate-800">पुनरावलोकन आणि सबमिट</h3>
            {isSubmitted && (
              <div className="bg-green-50 border border-green-200 rounded-2xl p-5 shadow-sm flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center text-2xl text-green-600 flex-shrink-0">
                  <HiCheckCircle className="w-8 h-8" />
                </div>
                <div>
                  <h4 className="text-green-800 font-bold text-base">भेट देणाऱ्याची यशस्वी नोंदणी झाली!</h4>
                  <p className="text-xs text-green-600 mt-1 leading-relaxed">
                    नोंदणी यशस्वीरित्या पूर्ण झाली आहे. आपण खालील तपशील पाहू शकता.
                  </p>
                </div>
              </div>
            )}
            <div>
              <label className={labelClass}>अतिरिक्त संदेश किंवा नोंद</label>
              <ReactTransliterate
                value={formData.message || ""}
                onChangeText={(val) => handleTextChange("message", val)}
                lang="mr"
                renderComponent={(props) => (
                  <textarea
                    name="message"
                    disabled={isSubmitted}
                    rows={4}
                    className={`${inputClass} resize-none ${isSubmitted ? "bg-slate-50 text-slate-500 cursor-not-allowed border-slate-100" : ""}`}
                    placeholder="काही अतिरिक्त निरोप किंवा टीप असल्यास येथे लिहा..."
                    {...props}
                  />
                )}
              />
            </div>
            <div className="bg-orange-50/30 border border-orange-100 rounded-xl p-5 space-y-3">
              <h4 className="text-slate-800 font-bold text-sm mb-3">नोंदणीचा सारांश</h4>
              {formData.photos && (
                <div className="flex justify-center mb-4">
                  <img src={formData.photos} alt="Visitor" className="w-20 h-20 rounded-full object-cover border-2 border-orange-500" />
                </div>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2 text-sm">
                {[
                  ["नाव", formData.fullName],
                  ["ईमेल", formData.email],
                  ["फोन नंबर", formData.phoneNo],
                  ["वय", formData.age],
                  ["लिंग", formData.sex === "male" ? "पुरुष" : formData.sex === "female" ? "महिला" : formData.sex === "other" ? "इतर" : formData.sex],
                  ["जन्मतारीख", formData.DOB],
                  ["आधार / मतदार ओळखपत्र", formData.aadharVoter],
                  ["घर क्रमांक", formData.houseNo],
                  ["जवळची खूण / लँडमार्क", formData.landmark],
                  ["गाव / शहर", formData.village],
                  ["पिनकोड", formData.pincode],
                  ["भेट देण्याचा हेतू", formData.purpose === "medical" ? "वैद्यकीय मदत" : formData.purpose === "education" ? "शिक्षण" : formData.purpose === "job" ? "नोकरी" : formData.purpose === "schemes" ? "शासकीय योजना" : formData.purpose === "business" ? "व्यवसाय" : formData.purpose === "utility" ? "नागरी सुविधा" : formData.purpose === "police" ? "पोलीस तक्रार/अर्ज" : formData.purpose === "administrative" ? "प्रशासकीय काम" : formData.purpose],
                ].map(([label, value]) =>
                  value ? (
                    <div key={label} className="flex justify-between py-1 border-b border-orange-100/30">
                      <span className="text-slate-500">{label}</span>
                      <span className="text-slate-800 font-medium capitalize">{value}</span>
                    </div>
                  ) : null
                )}
              </div>
              {formData.message && (
                <div className="pt-2 border-t border-orange-100/50">
                  <span className="text-slate-500 text-sm">संदेश/टीप: </span>
                  <span className="text-slate-800 text-sm">{formData.message}</span>
                </div>
              )}
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <>
      <div className="min-h-screen  bg-gradient-to-br from-orange-50/40 via-slate-50 to-orange-100/20 p-5 md:p-8">
        <div className="max-w-3xl mx-auto space-y-6">
          <div className="text-center">
            <h1 className="text-3xl pt-3 md:text-4xl font-bold bg-gradient-to-r from-orange-600 to-orange-500 bg-clip-text text-transparent">
              भेट देणाऱ्यांची नोंदणी
            </h1>
            <p className="text-slate-500 mt-2 ">नवीन भेट देणाऱ्याची नोंदणी करण्यासाठी सर्व पायऱ्या पूर्ण करा</p>
          </div>

          <div className="flex items-center justify-between px-2">
            {stepLabels.map((label, index) => {
              const step = index + 1;
              const isCompleted = isSubmitted || currentStep > step;
              const isCurrent = !isSubmitted && currentStep === step;
              return (
                <div key={step} className="flex items-center flex-1">
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${
                        isCompleted
                          ? "bg-green-500 text-white shadow-sm"
                          : isCurrent
                          ? "bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-lg shadow-orange-500/25"
                          : "bg-slate-100 text-slate-400 border border-slate-200"
                      }`}
                    >
                      {isCompleted ? <HiCheckCircle className="w-6 h-6" /> : step}
                    </div>
                    <span
                      className={`text-xs mt-1.5 hidden sm:block ${
                        isCurrent ? "text-orange-600 font-semibold" : isCompleted ? "text-green-600 font-medium" : "text-slate-400"
                      }`}
                    >
                      {label}
                    </span>
                  </div>
                  {step < totalSteps && (
                    <div
                      className={`flex-1 h-0.5 mx-2 rounded-full transition-all duration-300 ${
                        isCompleted ? "bg-green-500" : "bg-slate-200"
                      }`}
                    />
                  )}
                </div>
              );
            })}
          </div>

          <form onSubmit={handleSubmit}>
            <div className="bg-white border border-orange-100 rounded-3xl p-6 md:p-8 shadow-sm hover:shadow-md transition-shadow duration-300">
              {renderStep()}
            </div>

            <div className="flex justify-between mt-6">
              {isSubmitted ? (
                <>
                  <div />
                  <button
                    type="button"
                    onClick={() => {
                      setFormData({
                        photos: "", fullName: "", email: "", phoneNo: "", age: "", sex: "", DOB: "", aadharVoter: "",
                        houseNo: "", landmark: "", village: "", pincode: "",
                        purpose: "",
                        patiantName: "", hospitalName: "", trackingDoctor: "", reason: "",
                        studentName: "", studentDOB: "", studentGender: "", studentCategory: "", studentPhoto: "",
                        jobFullName: "", jobPosition: "", jobDepartment: "", jobLocation: "", jobSalary: "",
                        employeeName: "", employeeId: "", employeeDepartment: "", employeeDesignation: "", employeeRDepartment: "", employeeRTransfer: "",
                        schemeName: "", schemePApplication: "", schemeApplyDate: "", schemeMaritalStatus: "", schemeCategary: "", schemeAddhar: "",
                        businessName: "", businessType: "", businessSector: "", businessRNo: "", businessDOE: "", businessGST: "", businessAddress: "",
                        utilityServiceInstallation: "", utilityProblem: "",
                        policeApplicationNo: "", policeApplicationDate: "", policeApplicationPlace: "", policeIncidentDetails: "", policeInvolveName: "", policeDeclaration: "", policePhoto: "",
                        projectName: "", projectLocation: "", projectProblem: "",
                        message: "",
                      });
                      setSearchPhone("");
                      setErrors({});
                      setIsSubmitted(false);
                      setCurrentStep(1);
                    }}
                    className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-white font-semibold hover:from-orange-600 hover:to-amber-600 transition-all shadow-md shadow-orange-500/20"
                  >
                    दुसऱ्या भेट देणाऱ्याची नोंदणी करा
                  </button>
                </>
              ) : (
                <>
                  {currentStep > 1 ? (
                    <button
                      key="prev-button"
                      type="button"
                      disabled={isSubmitting}
                      onClick={() => setCurrentStep((prev) => prev - 1)}
                      className="flex items-center gap-2 px-6 py-3 rounded-xl text-slate-600 border border-slate-200 hover:bg-slate-50 bg-white transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <HiArrowLeft className="w-4 h-4" />
                      मागे
                    </button>
                  ) : (
                    <div />
                  )}

                  {currentStep < totalSteps ? (
                    <button
                      key="next-button"
                      type="button"
                      onClick={() => {
                        if (validateStep(currentStep)) {
                          setCurrentStep((prev) => prev + 1);
                        } else {
                          toast.error("कृपया सर्व आवश्यक क्षेत्रे योग्यरित्या भरा.");
                        }
                      }}
                      className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-white font-semibold hover:from-orange-600 hover:to-amber-600 transition-all shadow-md shadow-orange-500/10"
                    >
                      पुढे
                      <HiArrowRight className="w-4 h-4" />
                    </button>
                  ) : (
                    <button
                      key="submit-button"
                      type="submit"
                      disabled={isSubmitting}
                      className="flex items-center gap-2 px-8 py-3 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-white font-semibold hover:from-orange-600 hover:to-amber-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-orange-500/20"
                    >
                      {isSubmitting ? (
                        <>
                          <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                          </svg>
                          सबमिट होत आहे...
                        </>
                      ) : (
                        "नोंदणी सबमिट करा"
                      )}
                    </button>
                  )}
                </>
              )}
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default Form;

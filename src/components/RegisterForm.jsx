import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import styles from "./design/RegisterForm.module.css";

const MAX_FILE_MB = 10;
const BLOOD_REGEX = /^(A|B|AB|O)[+-]$/i; // e.g., A+, B-, O+, AB-
const GENDERS = ["पुरुष", "महिला"];
const AADHAAR_FIELD = "aadhaar"; // change to "aadhar" if backend expects that

// helper to join css-module classes safely
const cn = (...classes) =>
  classes
    .filter(Boolean)
    .map((c) => (styles[c] ? styles[c] : c))
    .join(" ");

// normalize values to reduce server-side 400
const normalizeForApi = (formData) => {
  const gender =
    formData.gender === "पुरुष"
      ? "MALE"
      : formData.gender === "महिला"
      ? "FEMALE"
      : formData.gender;

  const dob = formData.dob
    ? new Date(formData.dob).toISOString().slice(0, 10) // YYYY-MM-DD
    : "";

  const height = String(formData.height).replace(/[^\d.]/g, ""); // keep numbers/dot only
  const bloodGroup = String(formData.bloodGroup).trim().toUpperCase();
  const mobile = String(formData.mobile).replace(/\D/g, ""); // only digits

  return { ...formData, gender, dob, height, bloodGroup, mobile };
};

// extract a human-readable message from axios error
const extractServerMessage = (err) => {
  const res = err?.response;
  if (!res) return err?.message || "Request failed.";
  const data = res.data;

  if (typeof data === "string") return data;
  if (data?.message) return data.message;
  if (data?.error) return data.error;

  try {
    return JSON.stringify(data);
  } catch {
    return `HTTP ${res.status}: ${res.statusText || "Error"}`;
  }
};

const formatBytes = (bytes) => {
  if (!bytes || isNaN(bytes)) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  const v = parseFloat((bytes / Math.pow(k, i)).toFixed(2));
  return `${v} ${sizes[i]}`;
};

const RegisterForm = ({ initialMobile = "", lockMobile = false }) => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    gender: "",
    dob: "",
    birthplace: "",
    kuldevat: "",
    gotra: "",
    height: "",
    bloodGroup: "",
    education: "",
    profession: "",
    fatherName: "",
    fatherProfession: "",
    motherName: "",
    motherProfession: "",
    siblings: "",
    mama: "",
    kaka: "",
    address: "",
    mobile: initialMobile || "",
    profilePhoto: null,
    aadhaar: null,
  });

  useEffect(() => {
    // When OTPRegister provides a verified mobile, keep it in sync
    if (initialMobile) {
      setFormData((p) => ({ ...p, mobile: initialMobile }));
    }
  }, [initialMobile]);

  const [photoPreview, setPhotoPreview] = useState(null);
  const [aadhaarPreviewName, setAadhaarPreviewName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState({ type: "", message: "" });
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  // Upload progress
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadBytes, setUploadBytes] = useState({ loaded: 0, total: 0 });

  // Result popup
  const [resultPopup, setResultPopup] = useState({
    open: false,
    type: "success", // success | error
    title: "",
    message: "",
  });

  // Cleanup preview URL on unmount/change
  useEffect(() => {
    return () => {
      if (photoPreview) URL.revokeObjectURL(photoPreview);
    };
  }, [photoPreview]);

  const age = useMemo(() => {
    if (!formData.dob) return null;
    const today = new Date();
    const dob = new Date(formData.dob);
    if (isNaN(dob.getTime())) return null;
    let a = today.getFullYear() - dob.getFullYear();
    const m = today.getMonth() - dob.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) a--;
    return a;
  }, [formData.dob]);

  const requiredFields = [
    "name",
    "gender",
    "dob",
    "birthplace",
    "kuldevat",
    "gotra",
    "height",
    "bloodGroup",
    "education",
    "profession",
    "fatherName",
    "fatherProfession",
    "motherName",
    "motherProfession",
    "address",
    "mobile",
    "profilePhoto",
    "aadhaar",
  ];

  const progress = useMemo(() => {
    const total = requiredFields.length;
    let done = 0;
    requiredFields.forEach((k) => {
      const v = formData[k];
      if (v !== null && v !== undefined && String(v).trim() !== "") done++;
    });
    return Math.round((done / total) * 100);
  }, [formData]);

  const setField = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const setError = (name, msg) => {
    setErrors((prev) => ({ ...prev, [name]: msg }));
  };

  const validateField = (name, value) => {
    const isEmpty = (v) =>
      v === null || v === undefined || String(v).trim() === "";
    switch (name) {
      case "name":
      case "birthplace":
      case "kuldevat":
      case "gotra":
      case "height":
      case "education":
      case "profession":
      case "fatherName":
      case "fatherProfession":
      case "motherName":
      case "motherProfession":
      case "address":
        if (isEmpty(value)) return "हे फील्ड आवश्यक आहे";
        return "";

      case "gender":
        if (isEmpty(value)) return "लिंग निवडा";
        if (!GENDERS.includes(value)) return "अवैध लिंग";
        return "";

      case "dob":
        if (isEmpty(value)) return "जन्म तारीख आवश्यक आहे";
        if (!age || age < 18) return "वय कमीत कमी 18 वर्षे असावे";
        return "";

      case "bloodGroup":
        if (isEmpty(value)) return "रक्तगट आवश्यक आहे";
        if (!BLOOD_REGEX.test(value)) return "उदा. A+, B-, O+, AB+";
        return "";

      case "mobile": {
        if (isEmpty(value)) return "मोबाईल नंबर आवश्यक आहे";
        const only = String(value).replace(/\D/g, "");
        if (!/^\d{10}$/.test(only)) return "वैध 10 अंकी नंबर टाका";
        return "";
      }

      case "profilePhoto":
        if (!value) return "प्रोफाइल फोटो आवश्यक आहे";
        if (!value.type?.startsWith("image/")) return "फक्त इमेज फाइल निवडा";
        if (value.size > MAX_FILE_MB * 1024 * 1024)
          return `फाइल ${MAX_FILE_MB}MB पेक्षा कमी असावी`;
        return "";

      case "aadhaar":
        if (!value) return "आधार कार्ड आवश्यक आहे";
        const isImg = value.type?.startsWith("image/");
        const isPdf = value.type === "application/pdf";
        if (!isImg && !isPdf) return "इमेज किंवा PDF निवडा";
        if (value.size > MAX_FILE_MB * 1024 * 1024)
          return `फाइल ${MAX_FILE_MB}MB पेक्षा कमी असावी`;
        return "";

      default:
        return "";
    }
  };

  const validateAll = () => {
    const newErrors = {};
    requiredFields.forEach((name) => {
      newErrors[name] = validateField(name, formData[name]);
    });
    setErrors(newErrors);
    return newErrors;
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched((t) => ({ ...t, [name]: true }));
    const msg = validateField(name, formData[name]);
    setError(name, msg);
  };

  const handleChange = (e) => {
    const { name, value, files, type } = e.target;

    if (type === "file") {
      const file = files && files.length > 0 ? files[0] : null;
      setField(name, file);

      if (name === "profilePhoto") {
        if (photoPreview) URL.revokeObjectURL(photoPreview);
        setPhotoPreview(file ? URL.createObjectURL(file) : null);
      }
      if (name === "aadhaar") {
        setAadhaarPreviewName(file ? file.name : "");
      }

      if (touched[name]) setError(name, validateField(name, file));
    } else {
      // If mobile is locked, don't let user edit it
      if (lockMobile && name === "mobile") return;
      setField(name, value);
      if (touched[name]) setError(name, validateField(name, value));
    }
  };

  const showToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast({ type: "", message: "" }), 3500);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    const fieldErrors = validateAll();
    const hasError = Object.values(fieldErrors).some((m) => m);
    if (hasError) {
      showToast("error", "कृपया सर्व आवश्यक फील्ड योग्यरीत्या भरा.");
      return;
    }

    setIsSubmitting(true);
    setUploadProgress(0);
    setUploadBytes({ loaded: 0, total: 0 });

    try {
      const normalized = normalizeForApi(formData);

      const fd = new FormData();
      fd.append("name", normalized.name);
      fd.append("gender", normalized.gender);
      fd.append("dob", normalized.dob);
      fd.append("birthplace", normalized.birthplace);
      fd.append("kuldevat", normalized.kuldevat);
      fd.append("gotra", normalized.gotra);
      fd.append("height", normalized.height);
      fd.append("bloodGroup", normalized.bloodGroup);
      fd.append("education", normalized.education);
      fd.append("profession", normalized.profession);
      fd.append("fatherName", normalized.fatherName);
      fd.append("fatherProfession", normalized.fatherProfession);
      fd.append("motherName", normalized.motherName);
      fd.append("motherProfession", normalized.motherProfession);
      fd.append("siblings", normalized.siblings);
      fd.append("mama", normalized.mama);
      fd.append("kaka", normalized.kaka);
      fd.append("address", normalized.address);
      fd.append("mobile", normalized.mobile);

      if (formData.profilePhoto)
        fd.append("profilePhoto", formData.profilePhoto);
      if (formData.aadhaar) fd.append(AADHAAR_FIELD, formData.aadhaar);

      const res = await axios.post(
        "https://perfect-match-server.onrender.com/api/users/register",
        fd,
        {
          headers: { "Content-Type": "multipart/form-data" },
          onUploadProgress: (pe) => {
            if (!pe) return;
            const loaded = pe.loaded || 0;
            const total = pe.total || 0;
            setUploadBytes({ loaded, total });
            if (total > 0) {
              const percent = Math.round((loaded * 100) / total);
              setUploadProgress(percent);
            }
          },
        }
      );

      const data = res.data || {};
      const userId = data.id || data.user?.id;

      if (!userId) {
        setResultPopup({
          open: true,
          type: "error",
          title: "नोंदणी अयशस्वी",
          message: "User ID सापडला नाही!",
        });
        setIsSubmitting(false);
        return;
      }

      // Save to "this device only" list for SelfProfile (/me)
      try {
        const keyIds = "deviceProfileIds";
        const keyActive = "activeProfileId";
        const raw = localStorage.getItem(keyIds);
        let ids = [];
        try {
          ids = raw ? JSON.parse(raw) : [];
        } catch {
          ids = [];
        }
        const sId = String(userId);
        if (!ids.includes(sId)) ids.push(sId);
        localStorage.setItem(keyIds, JSON.stringify(ids));
        localStorage.setItem(keyActive, sId);
        // Back-compatible
        localStorage.setItem("currentUserId", sId);
        if (data.user)
          localStorage.setItem("currentUser", JSON.stringify(data.user));
      } catch (e) {
        console.warn("Failed to persist device profile ids:", e);
      }

      // Success popup
      setResultPopup({
        open: true,
        type: "success",
        title: "नोंदणी यशस्वी 🎉",
        message: "तुमची माहिती सेव्ह झाली. प्रोफाइल पेजवर नेत आहोत...",
      });

      setTimeout(() => navigate(`/me`), 1200);
    } catch (err) {
      console.error("Register error:", err);
      setResultPopup({
        open: true,
        type: "error",
        title: "नोंदणी अयशस्वी",
        message: extractServerMessage(err),
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const loadedText =
    uploadBytes.total > 0
      ? `${formatBytes(uploadBytes.loaded)} / ${formatBytes(uploadBytes.total)}`
      : `${formatBytes(uploadBytes.loaded)}`;

  return (
    <div className={styles["rf-container"]}>
      {/* Top upload bar */}
      {isSubmitting && (
        <>
          <div className={styles["rf-upload-topbar"]}>
            <div
              className={styles["rf-upload-topbar__bar"]}
              style={{ width: `${uploadProgress}%` }}
            />
          </div>

          {/* Upload overlay */}
          <div className={styles["rf-upload-overlay"]} aria-live="polite">
            <div className={styles["rf-upload-card"]}>
              <div
                className={styles["rf-ring"]}
                style={{ ["--p"]: uploadProgress }}
              >
                <div className={styles["rf-ring__label"]}>
                  {uploadProgress}%
                </div>
              </div>
              <div className={styles["rf-upload-text"]}>
                अपलोड होत आहे...
                <span className={styles["rf-upload-sub"]}>{loadedText}</span>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Toast (validation etc.) */}
      {toast.message && (
        <div
          className={cn(
            "rf-toast",
            toast.type === "success" ? "rf-toast--success" : "rf-toast--error"
          )}
        >
          {toast.message}
        </div>
      )}

      {/* Success/Error popup */}
      {resultPopup.open && (
        <div
          className={styles["rf-result-overlay"]}
          onClick={() => setResultPopup((p) => ({ ...p, open: false }))}
        >
          <div
            className={cn(
              "rf-result",
              resultPopup.type === "success"
                ? "rf-result--success"
                : "rf-result--error"
            )}
            role="dialog"
            aria-modal="true"
          >
            <div className={styles["rf-result__icon-wrap"]}>
              {resultPopup.type === "success" ? (
                <svg
                  className={styles["rf-check"]}
                  viewBox="0 0 52 52"
                  aria-hidden="true"
                >
                  <circle
                    className={styles["rf-check__circle"]}
                    cx="26"
                    cy="26"
                    r="25"
                    fill="none"
                  />
                  <path
                    className={styles["rf-check__check"]}
                    fill="none"
                    d="M14 27 l8 8 l16 -16"
                  />
                </svg>
              ) : (
                <svg
                  className={styles["rf-cross"]}
                  viewBox="0 0 52 52"
                  aria-hidden="true"
                >
                  <circle
                    className={styles["rf-cross__circle"]}
                    cx="26"
                    cy="26"
                    r="25"
                    fill="none"
                  />
                  <path
                    className={styles["rf-cross__line"]}
                    d="M18 18 L34 34"
                  />
                  <path
                    className={styles["rf-cross__line"]}
                    d="M34 18 L18 34"
                  />
                </svg>
              )}
            </div>

            <h4 className={styles["rf-result__title"]}>{resultPopup.title}</h4>
            <p className={styles["rf-result__msg"]}>{resultPopup.message}</p>
          </div>
        </div>
      )}

      <form className={styles["rf-card"]} onSubmit={handleSubmit}>
        {/* Header */}
        <div className={styles["rf-header"]}>
          <button
            type="button"
            className={cn("rf-btn", "rf-btn--ghost")}
            onClick={() => navigate("/")}
          >
            ⬅ Back to Home
          </button>

          <div className={styles["rf-title-wrap"]}>
            <h2 className={styles["rf-title"]}>तुमचे प्रोफाइल तयार करा</h2>
            <p className={styles["rf-subtitle"]}>
              एका डिव्हाइसवर फक्त एकच User नोंदणी करू शकतो ✅
            </p>
          </div>

          <div className={styles["rf-progress"]}>
            <div
              className={styles["rf-progress__bar"]}
              style={{ width: `${progress}%` }}
            />
            <span className={styles["rf-progress__label"]}>
              {progress}% पूर्ण
            </span>
          </div>
        </div>

        {/* Grid */}
        <div className={styles["rf-grid"]}>
          {/* Personal */}
          <div className={styles["rf-section"]}>
            <h3 className={styles["rf-section__title"]}>व्यक्तिगत माहिती</h3>

            <div className={styles["rf-field"]}>
              <label>पूर्ण नाव *</label>
              <input
                className={cn(
                  "rf-input",
                  errors.name && touched.name && "rf-input--error"
                )}
                type="text"
                id="name"
                name="name"
                placeholder="तुमचे पूर्ण नाव टाका"
                value={formData.name}
                onChange={handleChange}
                onBlur={handleBlur}
                required
              />
              {touched.name && errors.name && (
                <span className={styles["rf-error"]}>{errors.name}</span>
              )}
            </div>

            <div className={styles["rf-row"]}>
              <div className={styles["rf-field"]}>
                <label>लिंग *</label>
                <select
                  className={cn(
                    "rf-input",
                    errors.gender && touched.gender && "rf-input--error"
                  )}
                  id="gender"
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  required
                >
                  <option value="">लिंग निवडा</option>
                  {GENDERS.map((g) => (
                    <option key={g} value={g}>
                      {g}
                    </option>
                  ))}
                </select>
                {touched.gender && errors.gender && (
                  <span className={styles["rf-error"]}>{errors.gender}</span>
                )}
              </div>

              <div className={styles["rf-field"]}>
                <label>जन्म तारीख *</label>
                <input
                  className={cn(
                    "rf-input",
                    errors.dob && touched.dob && "rf-input--error"
                  )}
                  type="date"
                  id="dob"
                  name="dob"
                  value={formData.dob}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  required
                />
                <div className={styles["rf-hint"]}>
                  {age !== null
                    ? `अंदाजे वय: ${age} वर्षे`
                    : "वय १८ वर्षे आणि त्याहून अधिक"}
                </div>
                {touched.dob && errors.dob && (
                  <span className={styles["rf-error"]}>{errors.dob}</span>
                )}
              </div>
            </div>

            <div className={styles["rf-field"]}>
              <label>जन्मस्थळ *</label>
              <input
                className={cn(
                  "rf-input",
                  errors.birthplace && touched.birthplace && "rf-input--error"
                )}
                type="text"
                id="birthplace"
                name="birthplace"
                placeholder="शहर / गाव टाका"
                value={formData.birthplace}
                onChange={handleChange}
                onBlur={handleBlur}
                required
              />
              {touched.birthplace && errors.birthplace && (
                <span className={styles["rf-error"]}>{errors.birthplace}</span>
              )}
            </div>

            <div className={styles["rf-row"]}>
              <div className={styles["rf-field"]}>
                <label>कुलदेवत *</label>
                <input
                  className={cn(
                    "rf-input",
                    errors.kuldevat && touched.kuldevat && "rf-input--error"
                  )}
                  type="text"
                  id="kuldevat"
                  name="kuldevat"
                  placeholder="कुलदेवत टाका"
                  value={formData.kuldevat}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  required
                />
                {touched.kuldevat && errors.kuldevat && (
                  <span className={styles["rf-error"]}>{errors.kuldevat}</span>
                )}
              </div>

              <div className={styles["rf-field"]}>
                <label>गोत्र *</label>
                <input
                  className={cn(
                    "rf-input",
                    errors.gotra && touched.gotra && "rf-input--error"
                  )}
                  type="text"
                  id="gotra"
                  name="gotra"
                  placeholder="गोत्र टाका"
                  value={formData.gotra}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  required
                />
                {touched.gotra && errors.gotra && (
                  <span className={styles["rf-error"]}>{errors.gotra}</span>
                )}
              </div>
            </div>

            <div className={styles["rf-row"]}>
              <div className={styles["rf-field"]}>
                <label>उंची *</label>
                <input
                  className={cn(
                    "rf-input",
                    errors.height && touched.height && "rf-input--error"
                  )}
                  type="text"
                  id="height"
                  name="height"
                  placeholder="उदा. 170 से.मी"
                  value={formData.height}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  required
                />
                {touched.height && errors.height && (
                  <span className={styles["rf-error"]}>{errors.height}</span>
                )}
              </div>

              <div className={styles["rf-field"]}>
                <label>रक्तगट *</label>
                <input
                  className={cn(
                    "rf-input",
                    errors.bloodGroup && touched.bloodGroup && "rf-input--error"
                  )}
                  type="text"
                  id="bloodGroup"
                  name="bloodGroup"
                  placeholder="उदा. A+, B-, O+"
                  value={formData.bloodGroup}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  required
                />
                {touched.bloodGroup && errors.bloodGroup && (
                  <span className={styles["rf-error"]}>
                    {errors.bloodGroup}
                  </span>
                )}
              </div>
            </div>

            <div className={styles["rf-row"]}>
              <div className={styles["rf-field"]}>
                <label>शिक्षण *</label>
                <input
                  className={cn(
                    "rf-input",
                    errors.education && touched.education && "rf-input--error"
                  )}
                  type="text"
                  id="education"
                  name="education"
                  placeholder="शिक्षण टाका"
                  value={formData.education}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  required
                />
                {touched.education && errors.education && (
                  <span className={styles["rf-error"]}>{errors.education}</span>
                )}
              </div>

              <div className={styles["rf-field"]}>
                <label>व्यवसाय *</label>
                <input
                  className={cn(
                    "rf-input",
                    errors.profession && touched.profession && "rf-input--error"
                  )}
                  type="text"
                  id="profession"
                  name="profession"
                  placeholder="तुमचा व्यवसाय टाका"
                  value={formData.profession}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  required
                />
                {touched.profession && errors.profession && (
                  <span className={styles["rf-error"]}>
                    {errors.profession}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Family (more space) */}
          <div className={cn("rf-section", "rf-section--family")}>
            <h3 className={styles["rf-section__title"]}>कौटुंबिक माहिती</h3>

            <div className={styles["rf-row"]}>
              <div className={styles["rf-field"]}>
                <label>वडिलांचे नाव *</label>
                <input
                  className={cn(
                    "rf-input",
                    errors.fatherName && touched.fatherName && "rf-input--error"
                  )}
                  type="text"
                  id="fatherName"
                  name="fatherName"
                  value={formData.fatherName}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  required
                />
                {touched.fatherName && errors.fatherName && (
                  <span className={styles["rf-error"]}>
                    {errors.fatherName}
                  </span>
                )}
              </div>

              <div className={styles["rf-field"]}>
                <label>वडिलांचा व्यवसाय *</label>
                <input
                  className={cn(
                    "rf-input",
                    errors.fatherProfession &&
                      touched.fatherProfession &&
                      "rf-input--error"
                  )}
                  type="text"
                  id="fatherProfession"
                  name="fatherProfession"
                  value={formData.fatherProfession}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  required
                />
                {touched.fatherProfession && errors.fatherProfession && (
                  <span className={styles["rf-error"]}>
                    {errors.fatherProfession}
                  </span>
                )}
              </div>
            </div>

            <div className={styles["rf-row"]}>
              <div className={styles["rf-field"]}>
                <label>आईचे नाव *</label>
                <input
                  className={cn(
                    "rf-input",
                    errors.motherName && touched.motherName && "rf-input--error"
                  )}
                  type="text"
                  id="motherName"
                  name="motherName"
                  value={formData.motherName}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  required
                />
                {touched.motherName && errors.motherName && (
                  <span className={styles["rf-error"]}>
                    {errors.motherName}
                  </span>
                )}
              </div>

              <div className={styles["rf-field"]}>
                <label>आईचा व्यवसाय *</label>
                <input
                  className={cn(
                    "rf-input",
                    errors.motherProfession &&
                      touched.motherProfession &&
                      "rf-input--error"
                  )}
                  type="text"
                  id="motherProfession"
                  name="motherProfession"
                  value={formData.motherProfession}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  required
                />
                {touched.motherProfession && errors.motherProfession && (
                  <span className={styles["rf-error"]}>
                    {errors.motherProfession}
                  </span>
                )}
              </div>
            </div>

            <div className={styles["rf-row"]}>
              <div className={styles["rf-field"]}>
                <label>भावंड</label>
                <input
                  className={styles["rf-input"]}
                  type="text"
                  id="siblings"
                  name="siblings"
                  placeholder="उदा. 1 बहीण, 1 भाऊ"
                  value={formData.siblings}
                  onChange={handleChange}
                />
              </div>

              <div className={styles["rf-field"]}>
                <label>मामा</label>
                <input
                  className={styles["rf-input"]}
                  type="text"
                  id="mama"
                  name="mama"
                  value={formData.mama}
                  onChange={handleChange}
                />
              </div>

              <div className={styles["rf-field"]}>
                <label>काका</label>
                <input
                  className={styles["rf-input"]}
                  type="text"
                  id="kaka"
                  name="kaka"
                  value={formData.kaka}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className={styles["rf-field"]}>
              <label>पत्ता *</label>
              <input
                className={cn(
                  "rf-input",
                  errors.address && touched.address && "rf-input--error"
                )}
                type="text"
                id="address"
                name="address"
                placeholder="संपूर्ण पत्ता टाका"
                value={formData.address}
                onChange={handleChange}
                onBlur={handleBlur}
                required
              />
              {touched.address && errors.address && (
                <span className={styles["rf-error"]}>{errors.address}</span>
              )}
            </div>

            <div className={styles["rf-field"]}>
              <label>मोबाईल नंबर *</label>
              <input
                className={cn(
                  "rf-input",
                  errors.mobile && touched.mobile && "rf-input--error"
                )}
                type="text"
                id="mobile"
                name="mobile"
                inputMode="numeric"
                placeholder="उदा. 9876543210"
                value={formData.mobile}
                onChange={handleChange}
                onBlur={handleBlur}
                required
                disabled={lockMobile}
                title={lockMobile ? "OTP पडताळलेला मोबाईल" : ""}
              />
              {touched.mobile && errors.mobile && (
                <span className={styles["rf-error"]}>{errors.mobile}</span>
              )}
            </div>
          </div>

          {/* Documents */}
          <div className={styles["rf-section"]}>
            <h3 className={styles["rf-section__title"]}>कागदपत्रे</h3>

            <div className={styles["rf-field"]}>
              <label>प्रोफाइल फोटो *</label>
              <div
                className={cn(
                  "rf-file",
                  errors.profilePhoto &&
                    touched.profilePhoto &&
                    "rf-file--error"
                )}
              >
                <input
                  id="profilePhoto"
                  className={styles["rf-file__input"]}
                  type="file"
                  name="profilePhoto"
                  accept="image/*"
                  onChange={handleChange}
                  onBlur={() => {
                    setTouched((t) => ({ ...t, profilePhoto: true }));
                    setError(
                      "profilePhoto",
                      validateField("profilePhoto", formData.profilePhoto)
                    );
                  }}
                  required
                />
                <label
                  htmlFor="profilePhoto"
                  className={styles["rf-file__label"]}
                >
                  <span className={styles["rf-file__title"]}>फोटो निवडा</span>
                  <span className={styles["rf-file__hint"]}>
                    JPG/PNG • कमाल {MAX_FILE_MB}MB
                  </span>
                </label>
              </div>
              {photoPreview && (
                <img
                  src={photoPreview}
                  alt="Profile Preview"
                  className={styles["rf-photo-preview"]}
                />
              )}
              {touched.profilePhoto && errors.profilePhoto && (
                <span className={styles["rf-error"]}>
                  {errors.profilePhoto}
                </span>
              )}
            </div>

            <div className={styles["rf-field"]}>
              <label>आधार कार्ड *</label>
              <div
                className={cn(
                  "rf-file",
                  errors.aadhaar && touched.aadhaar && "rf-file--error"
                )}
              >
                <input
                  id="aadhaar"
                  className={styles["rf-file__input"]}
                  type="file"
                  name="aadhaar"
                  accept="image/*,application/pdf"
                  onChange={handleChange}
                  onBlur={() => {
                    setTouched((t) => ({ ...t, aadhaar: true }));
                    setError(
                      "aadhaar",
                      validateField("aadhaar", formData.aadhaar)
                    );
                  }}
                  required
                />
                <label htmlFor="aadhaar" className={styles["rf-file__label"]}>
                  <span className={styles["rf-file__title"]}>फाइल निवडा</span>
                  <span className={styles["rf-file__hint"]}>
                    इमेज/PDF • कमाल {MAX_FILE_MB}MB
                  </span>
                </label>
              </div>
              {aadhaarPreviewName && (
                <div className={styles["rf-file-name"]}>
                  निवडलेले: {aadhaarPreviewName}
                </div>
              )}
              {touched.aadhaar && errors.aadhaar && (
                <span className={styles["rf-error"]}>{errors.aadhaar}</span>
              )}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className={styles["rf-actions"]}>
          <button
            type="button"
            className={cn("rf-btn", "rf-btn--ghost")}
            onClick={() => {
              setFormData({
                name: "",
                gender: "",
                dob: "",
                birthplace: "",
                kuldevat: "",
                gotra: "",
                height: "",
                bloodGroup: "",
                education: "",
                profession: "",
                fatherName: "",
                fatherProfession: "",
                motherName: "",
                motherProfession: "",
                siblings: "",
                mama: "",
                kaka: "",
                address: "",
                mobile: initialMobile || "",
                profilePhoto: null,
                aadhaar: null,
              });
              setPhotoPreview(null);
              setAadhaarPreviewName("");
              setErrors({});
              setTouched({});
            }}
          >
            Reset
          </button>

          <button
            type="submit"
            className={cn("rf-btn", "rf-btn--primary")}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <span className={styles["rf-spinner"]} aria-hidden="true" />
            ) : (
              "सबमिट करा"
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default RegisterForm;

import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import styles from "./design/Update.module.css";

const API_BASE = (
  import.meta.env.VITE_API_BASE_URL ||
  import.meta.env.VITE_API_URL ||
  "http://localhost:8080/api"
).replace(/\/$/, "");

const USERS_URL = `${API_BASE}/users`;

// helpers
const cn = (...classes) =>
  classes
    .filter(Boolean)
    .map((c) => (styles[c] ? styles[c] : c))
    .join(" ");

const toDateInputValue = (dob) => {
  if (!dob) return "";
  if (typeof dob === "string") return dob.substring(0, 10);
  const d = new Date(dob);
  return isNaN(d.getTime()) ? "" : d.toISOString().substring(0, 10);
};

const isImageUrl = (url) =>
  typeof url === "string" && /\.(png|jpe?g|gif|webp|bmp)$/i.test(url);
const isPdfUrl = (url) => typeof url === "string" && /\.pdf$/i.test(url);

const uiGenderFromApi = (g) =>
  g === "MALE" ? "पुरुष" : g === "FEMALE" ? "महिला" : g;
const apiGenderFromUi = (g) =>
  g === "पुरुष" ? "MALE" : g === "महिला" ? "FEMALE" : g;

const formatBytes = (bytes) => {
  if (!bytes || isNaN(bytes)) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  const v = parseFloat((bytes / Math.pow(k, i)).toFixed(2));
  return `${v} ${sizes[i]}`;
};

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

// File Upload Component
const FileUpload = ({
  label,
  name,
  accept,
  preview,
  previewName,
  error,
  touched,
  onChange,
  onBlur,
  required = false,
  hint,
  existingFile,
}) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const event = {
        target: {
          name,
          files,
          type: "file",
        },
      };
      onChange(event);
    }
  };

  return (
    <div className={styles.fileUpload}>
      <label className={styles.fileUploadLabel}>
        {label} {required && "*"}
        {existingFile && (
          <span className={styles.existingFileNote}>
            (Existing file available)
          </span>
        )}
      </label>

      <div
        className={cn(
          styles.fileUploadArea,
          isDragging && styles.fileUploadAreaDragging,
          error && touched && styles.fileUploadAreaError
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <input
          id={name}
          className={styles.fileUploadInput}
          type="file"
          name={name}
          accept={accept}
          onChange={onChange}
          onBlur={onBlur}
          required={required}
        />

        <div className={styles.fileUploadContent}>
          <div className={styles.fileUploadIcon}>📁</div>
          <div className={styles.fileUploadText}>
            <p className={styles.fileUploadTitle}>
              {preview ? "फाइल निवडली" : "फाइल ड्रॅग करा किंवा क्लिक करा"}
            </p>
            <p className={styles.fileUploadHint}>
              {hint || "JPG, PNG, PDF • कमाल 10MB"}
            </p>
          </div>
          <button
            type="button"
            className={styles.fileUploadButton}
            onClick={() => document.getElementById(name).click()}
          >
            फाइल निवडा
          </button>
        </div>
      </div>

      {preview && (
        <div className={styles.filePreview}>
          {name === "profilePhoto" ? (
            <div className={styles.photoPreviewContainer}>
              <img
                src={preview}
                alt="Profile Preview"
                className={styles.photoPreview}
              />
              <div className={styles.photoPreviewOverlay}>
                <span className={styles.previewText}>नवीन प्रिव्यू</span>
              </div>
            </div>
          ) : (
            <div className={styles.documentPreview}>
              <div className={styles.documentIcon}>📄</div>
              <div className={styles.documentInfo}>
                <span className={styles.documentName}>
                  {previewName || "Selected File"}
                </span>
                <span className={styles.documentSize}>Ready to upload</span>
              </div>
            </div>
          )}
        </div>
      )}

      {existingFile && (
        <div className={styles.existingFile}>
          <div className={styles.existingFileLabel}>Current File:</div>
          {isImageUrl(existingFile) ? (
            <div className={styles.existingPhoto}>
              <img
                src={existingFile}
                alt="Current"
                className={styles.existingPhotoImg}
              />
              <a
                href={existingFile}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.viewLink}
              >
                View Current
              </a>
            </div>
          ) : (
            <a
              href={existingFile}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.docLink}
            >
              📄 View Current Document
            </a>
          )}
        </div>
      )}

      {touched && error && <div className={styles.fileError}>{error}</div>}
    </div>
  );
};

const Update = () => {
  const { id } = useParams();
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
    mobile: "",
    profilePhoto: null,
    aadhaar: null,
  });

  const [photoPreview, setPhotoPreview] = useState(null);
  const [aadhaarPreview, setAadhaarPreview] = useState(null);
  const [existingProfilePhoto, setExistingProfilePhoto] = useState(null);
  const [existingAadhaar, setExistingAadhaar] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  // upload progress UI
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadBytes, setUploadBytes] = useState({ loaded: 0, total: 0 });

  // result popup
  const [resultPopup, setResultPopup] = useState({
    open: false,
    type: "success",
    title: "",
    message: "",
  });

  // toast
  const [toast, setToast] = useState({ type: "", message: "" });

  // Age calculation
  const age = React.useMemo(() => {
    if (!formData.dob) return null;
    const today = new Date();
    const dob = new Date(formData.dob);
    if (isNaN(dob.getTime())) return null;
    let a = today.getFullYear() - dob.getFullYear();
    const m = today.getMonth() - dob.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) a--;
    return a;
  }, [formData.dob]);

  // Progress calculation
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
  ];

  const progress = React.useMemo(() => {
    const total = requiredFields.length;
    let done = 0;
    requiredFields.forEach((k) => {
      const v = formData[k];
      if (v !== null && v !== undefined && String(v).trim() !== "") done++;
    });
    return Math.round((done / total) * 100);
  }, [formData]);

  // Load user
  useEffect(() => {
    const fetchUser = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${USERS_URL}/${id}`);
        const user = res.data;

        setFormData({
          name: user.name || "",
          gender: uiGenderFromApi(user.gender || ""),
          dob: toDateInputValue(user.dob),
          birthplace: user.birthplace || "",
          kuldevat: user.kuldevat || "",
          gotra: user.gotra || "",
          height: user.height || "",
          bloodGroup: user.bloodGroup || "",
          education: user.education || "",
          profession: user.profession || "",
          fatherName: user.fatherName || "",
          fatherProfession: user.fatherProfession || "",
          motherName: user.motherName || "",
          motherProfession: user.motherProfession || "",
          siblings: user.siblings || "",
          mama: user.mama || "",
          kaka: user.kaka || "",
          address: user.address || "",
          mobile: user.mobile || "",
          profilePhoto: null,
          aadhaar: null,
        });

        setExistingProfilePhoto(user.profilePhotoPath || null);
        setExistingAadhaar(user.aadhaarPath || null);
      } catch (err) {
        console.error("Failed to fetch user:", extractServerMessage(err));
        showToast(
          "error",
          "User data load failed: " + extractServerMessage(err)
        );
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchUser();
  }, [id]);

  // Validation
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
        if (!["पुरुष", "महिला"].includes(value)) return "अवैध लिंग";
        return "";

      case "dob":
        if (isEmpty(value)) return "जन्म तारीख आवश्यक आहे";
        if (!age || age < 18) return "वय कमीत कमी 18 वर्षे असावे";
        return "";

      case "bloodGroup":
        if (isEmpty(value)) return "रक्तगट आवश्यक आहे";
        if (!/^(A|B|AB|O)[+-]$/i.test(value)) return "उदा. A+, B-, O+, AB+";
        return "";

      case "mobile":
        if (isEmpty(value)) return "मोबाईल नंबर आवश्यक आहे";
        if (!/^\d{10,}$/.test(value)) return "किमान 10 अंकांचा वैध नंबर टाका";
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

  const setError = (name, msg) => {
    setErrors((prev) => ({ ...prev, [name]: msg }));
  };

  const showToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast({ type: "", message: "" }), 3500);
  };

  // Handlers
  const handleChange = (e) => {
    const { name, value, files, type } = e.target;

    if (type === "file") {
      const file = files && files.length > 0 ? files[0] : null;
      setFormData((prev) => ({ ...prev, [name]: file }));

      if (name === "profilePhoto") {
        if (file) {
          const url = URL.createObjectURL(file);
          setPhotoPreview(url);
        } else {
          setPhotoPreview(null);
        }
      }

      if (name === "aadhaar") {
        if (file) {
          const url = URL.createObjectURL(file);
          setAadhaarPreview(url);
        } else {
          setAadhaarPreview(null);
        }
      }
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
      if (touched[name]) setError(name, validateField(name, value));
    }
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched((t) => ({ ...t, [name]: true }));
    const msg = validateField(name, formData[name]);
    setError(name, msg);
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
      const data = new FormData();

      // Append text fields (with gender normalization back to API)
      const payload = {
        ...formData,
        gender: apiGenderFromUi(formData.gender),
      };

      [
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
        "siblings",
        "mama",
        "kaka",
        "address",
        "mobile",
      ].forEach((key) => data.append(key, payload[key] ?? ""));

      // Append files only if selected
      if (formData.profilePhoto)
        data.append("profilePhoto", formData.profilePhoto);
      if (formData.aadhaar) data.append("aadhaar", formData.aadhaar);

      await axios.put(`${USERS_URL}/update/${id}`, data, {
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
      });

      setResultPopup({
        open: true,
        type: "success",
        title: "अपडेट यशस्वी 🎉",
        message: "तुमचे प्रोफाइल अपडेट झाले. प्रोफाइल पेजवर नेत आहोत...",
      });

      setTimeout(() => navigate(`/profile/${id}`), 3000);
    } catch (err) {
      console.error(err);
      setResultPopup({
        open: true,
        type: "error",
        title: "अपडेट अयशस्वी",
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

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.pageLoader}>
          <div className={styles.loadingSpinner} />
          <div className={styles.loadingText}>Loading Profile...</div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Top upload bar */}
      {isSubmitting && (
        <>
          <div className={styles.uploadTopbar}>
            <div
              className={styles.uploadTopbarBar}
              style={{ width: `${uploadProgress}%` }}
            />
          </div>

          {/* Upload overlay */}
          <div className={styles.uploadOverlay} aria-live="polite">
            <div className={styles.uploadCard}>
              <div
                className={styles.progressRing}
                style={{ ["--progress"]: uploadProgress }}
              >
                <div className={styles.ringLabel}>{uploadProgress}%</div>
              </div>
              <div className={styles.uploadText}>
                अपलोड होत आहे...
                <span className={styles.uploadSub}>{loadedText}</span>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Toast */}
      {toast.message && (
        <div
          className={cn(
            styles.toast,
            toast.type === "success" ? styles.toastSuccess : styles.toastError
          )}
        >
          {toast.message}
        </div>
      )}

      {/* Success/Error popup */}
      {resultPopup.open && (
        <div
          className={styles.resultOverlay}
          onClick={() => setResultPopup((p) => ({ ...p, open: false }))}
        >
          <div
            className={cn(
              styles.result,
              resultPopup.type === "success"
                ? styles.resultSuccess
                : styles.resultError
            )}
            role="dialog"
            aria-modal="true"
          >
            <div className={styles.resultIconWrap}>
              {resultPopup.type === "success" ? (
                <svg
                  className={styles.check}
                  viewBox="0 0 52 52"
                  aria-hidden="true"
                >
                  <circle
                    className={styles.checkCircle}
                    cx="26"
                    cy="26"
                    r="25"
                    fill="none"
                  />
                  <path
                    className={styles.checkPath}
                    fill="none"
                    d="M14 27 l8 8 l16 -16"
                  />
                </svg>
              ) : (
                <svg
                  className={styles.cross}
                  viewBox="0 0 52 52"
                  aria-hidden="true"
                >
                  <circle
                    className={styles.crossCircle}
                    cx="26"
                    cy="26"
                    r="25"
                    fill="none"
                  />
                  <path className={styles.crossLine} d="M18 18 L34 34" />
                  <path className={styles.crossLine} d="M34 18 L18 34" />
                </svg>
              )}
            </div>
            <h4 className={styles.resultTitle}>{resultPopup.title}</h4>
            <p className={styles.resultMessage}>{resultPopup.message}</p>
          </div>
        </div>
      )}

      <div className={styles.formContainer}>
        {/* Header */}
        <div className={styles.header}>
          <button
            type="button"
            className={styles.backButton}
            onClick={() => navigate(`/profile/${id}`)}
          >
            <span className={styles.backIcon}>←</span>
            प्रोफाइल वर परत जा
          </button>

          <div className={styles.titleSection}>
            <h1 className={styles.mainTitle}>प्रोफाइल अपडेट</h1>
            <p className={styles.subtitle}>
              बंजारा समाज वधू-वर मेळावा, जळगाव जिल्हा
            </p>
          </div>

          <div className={styles.progressSection}>
            <div className={styles.progressBar}>
              <div
                className={styles.progressFill}
                style={{ width: `${progress}%` }}
              />
            </div>
            <span className={styles.progressText}>{progress}% पूर्ण</span>
          </div>
        </div>

        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.formGrid}>
            {/* Personal Information */}
            <div className={styles.section}>
              <h3 className={styles.sectionTitle}>व्यक्तिगत माहिती</h3>

              <div className={styles.formGroup}>
                <label className={styles.label}>पूर्ण नाव *</label>
                <input
                  className={cn(
                    styles.input,
                    errors.name && touched.name && styles.inputError
                  )}
                  type="text"
                  name="name"
                  placeholder="तुमचे पूर्ण नाव टाका"
                  value={formData.name}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  required
                />
                {touched.name && errors.name && (
                  <span className={styles.error}>{errors.name}</span>
                )}
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label className={styles.label}>लिंग *</label>
                  <select
                    className={cn(
                      styles.input,
                      errors.gender && touched.gender && styles.inputError
                    )}
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    required
                  >
                    <option value="">लिंग निवडा</option>
                    <option value="पुरुष">पुरुष</option>
                    <option value="महिला">महिला</option>
                  </select>
                  {touched.gender && errors.gender && (
                    <span className={styles.error}>{errors.gender}</span>
                  )}
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label}>जन्म तारीख *</label>
                  <input
                    className={cn(
                      styles.input,
                      errors.dob && touched.dob && styles.inputError
                    )}
                    type="date"
                    name="dob"
                    value={formData.dob}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    required
                  />
                  <div className={styles.hint}>
                    {age !== null
                      ? `अंदाजे वय: ${age} वर्षे`
                      : "वय १८ वर्षे आणि त्याहून अधिक"}
                  </div>
                  {touched.dob && errors.dob && (
                    <span className={styles.error}>{errors.dob}</span>
                  )}
                </div>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>जन्मस्थळ *</label>
                <input
                  className={cn(
                    styles.input,
                    errors.birthplace && touched.birthplace && styles.inputError
                  )}
                  type="text"
                  name="birthplace"
                  placeholder="शहर / गाव टाका"
                  value={formData.birthplace}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  required
                />
                {touched.birthplace && errors.birthplace && (
                  <span className={styles.error}>{errors.birthplace}</span>
                )}
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label className={styles.label}>कुलदेवत *</label>
                  <input
                    className={cn(
                      styles.input,
                      errors.kuldevat && touched.kuldevat && styles.inputError
                    )}
                    type="text"
                    name="kuldevat"
                    placeholder="कुलदेवत टाका"
                    value={formData.kuldevat}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    required
                  />
                  {touched.kuldevat && errors.kuldevat && (
                    <span className={styles.error}>{errors.kuldevat}</span>
                  )}
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label}>गोत्र *</label>
                  <input
                    className={cn(
                      styles.input,
                      errors.gotra && touched.gotra && styles.inputError
                    )}
                    type="text"
                    name="gotra"
                    placeholder="गोत्र टाका"
                    value={formData.gotra}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    required
                  />
                  {touched.gotra && errors.gotra && (
                    <span className={styles.error}>{errors.gotra}</span>
                  )}
                </div>
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label className={styles.label}>उंची *</label>
                  <input
                    className={cn(
                      styles.input,
                      errors.height && touched.height && styles.inputError
                    )}
                    type="text"
                    name="height"
                    placeholder="उदा. 170 से.मी"
                    value={formData.height}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    required
                  />
                  {touched.height && errors.height && (
                    <span className={styles.error}>{errors.height}</span>
                  )}
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label}>रक्तगट *</label>
                  <input
                    className={cn(
                      styles.input,
                      errors.bloodGroup &&
                        touched.bloodGroup &&
                        styles.inputError
                    )}
                    type="text"
                    name="bloodGroup"
                    placeholder="उदा. A+, B-, O+"
                    value={formData.bloodGroup}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    required
                  />
                  {touched.bloodGroup && errors.bloodGroup && (
                    <span className={styles.error}>{errors.bloodGroup}</span>
                  )}
                </div>
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label className={styles.label}>शिक्षण *</label>
                  <input
                    className={cn(
                      styles.input,
                      errors.education && touched.education && styles.inputError
                    )}
                    type="text"
                    name="education"
                    placeholder="शिक्षण टाका"
                    value={formData.education}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    required
                  />
                  {touched.education && errors.education && (
                    <span className={styles.error}>{errors.education}</span>
                  )}
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label}>व्यवसाय *</label>
                  <input
                    className={cn(
                      styles.input,
                      errors.profession &&
                        touched.profession &&
                        styles.inputError
                    )}
                    type="text"
                    name="profession"
                    placeholder="तुमचा व्यवसाय टाका"
                    value={formData.profession}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    required
                  />
                  {touched.profession && errors.profession && (
                    <span className={styles.error}>{errors.profession}</span>
                  )}
                </div>
              </div>
            </div>

            {/* Family Information */}
            <div className={cn(styles.section, styles.familySection)}>
              <h3 className={styles.sectionTitle}>कौटुंबिक माहिती</h3>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label className={styles.label}>वडिलांचे नाव *</label>
                  <input
                    className={cn(
                      styles.input,
                      errors.fatherName &&
                        touched.fatherName &&
                        styles.inputError
                    )}
                    type="text"
                    name="fatherName"
                    value={formData.fatherName}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    required
                  />
                  {touched.fatherName && errors.fatherName && (
                    <span className={styles.error}>{errors.fatherName}</span>
                  )}
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label}>वडिलांचा व्यवसाय *</label>
                  <input
                    className={cn(
                      styles.input,
                      errors.fatherProfession &&
                        touched.fatherProfession &&
                        styles.inputError
                    )}
                    type="text"
                    name="fatherProfession"
                    value={formData.fatherProfession}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    required
                  />
                  {touched.fatherProfession && errors.fatherProfession && (
                    <span className={styles.error}>
                      {errors.fatherProfession}
                    </span>
                  )}
                </div>
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label className={styles.label}>आईचे नाव *</label>
                  <input
                    className={cn(
                      styles.input,
                      errors.motherName &&
                        touched.motherName &&
                        styles.inputError
                    )}
                    type="text"
                    name="motherName"
                    value={formData.motherName}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    required
                  />
                  {touched.motherName && errors.motherName && (
                    <span className={styles.error}>{errors.motherName}</span>
                  )}
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label}>आईचा व्यवसाय *</label>
                  <input
                    className={cn(
                      styles.input,
                      errors.motherProfession &&
                        touched.motherProfession &&
                        styles.inputError
                    )}
                    type="text"
                    name="motherProfession"
                    value={formData.motherProfession}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    required
                  />
                  {touched.motherProfession && errors.motherProfession && (
                    <span className={styles.error}>
                      {errors.motherProfession}
                    </span>
                  )}
                </div>
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label className={styles.label}>भावंड</label>
                  <input
                    className={styles.input}
                    type="text"
                    name="siblings"
                    placeholder="उदा. 1 बहीण, 1 भाऊ"
                    value={formData.siblings}
                    onChange={handleChange}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label}>मामा</label>
                  <input
                    className={styles.input}
                    type="text"
                    name="mama"
                    value={formData.mama}
                    onChange={handleChange}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label}>काका</label>
                  <input
                    className={styles.input}
                    type="text"
                    name="kaka"
                    value={formData.kaka}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>पत्ता *</label>
                <input
                  className={cn(
                    styles.input,
                    errors.address && touched.address && styles.inputError
                  )}
                  type="text"
                  name="address"
                  placeholder="संपूर्ण पत्ता टाका"
                  value={formData.address}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  required
                />
                {touched.address && errors.address && (
                  <span className={styles.error}>{errors.address}</span>
                )}
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>मोबाईल नंबर *</label>
                <input
                  className={cn(
                    styles.input,
                    errors.mobile && touched.mobile && styles.inputError
                  )}
                  type="text"
                  name="mobile"
                  inputMode="numeric"
                  placeholder="उदा. 9876543210"
                  value={formData.mobile}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  required
                />
                {touched.mobile && errors.mobile && (
                  <span className={styles.error}>{errors.mobile}</span>
                )}
              </div>
            </div>

            {/* Documents */}
            <div className={styles.section}>
              <h3 className={styles.sectionTitle}>कागदपत्रे</h3>

              <FileUpload
                label="प्रोफाइल फोटो"
                name="profilePhoto"
                accept="image/*"
                preview={photoPreview}
                previewName={formData.profilePhoto?.name}
                onChange={handleChange}
                hint="JPG, PNG • कमाल 10MB"
                existingFile={existingProfilePhoto}
              />

              <FileUpload
                label="आधार कार्ड"
                name="aadhaar"
                accept="image/*,application/pdf"
                preview={aadhaarPreview}
                previewName={formData.aadhaar?.name}
                onChange={handleChange}
                hint="इमेज, PDF • कमाल 10MB"
                existingFile={existingAadhaar}
              />
            </div>
          </div>

          {/* Actions */}
          <div className={styles.actions}>
            <button
              type="button"
              className={cn(styles.button, styles.secondaryButton)}
              onClick={() => navigate(`/profile/${id}`)}
            >
              रद्द करा
            </button>

            <button
              type="submit"
              className={cn(styles.button, styles.primaryButton)}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <div className={styles.spinner} />
                  अपडेट होत आहे...
                </>
              ) : (
                "अपडेट करा"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Update;

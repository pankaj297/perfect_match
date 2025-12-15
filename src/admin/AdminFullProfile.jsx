import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import styles from "./design/AdminFullProfile.module.css";

const API_USERS_URL = "http://localhost:8080/api/users";

const getUserById = async (id) => {
  const res = await axios.get(`${API_USERS_URL}/${id}`);
  return res.data;
};

const AdminFullProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Auth guard + fetch
  useEffect(() => {
    const isLoggedIn = localStorage.getItem("adminLoggedIn") === "true";
    if (!isLoggedIn) {
      navigate("/admin-login");
      return;
    }

    const fetchUser = async () => {
      try {
        const data = await getUserById(id);
        setUser(data);
      } catch (error) {
        console.error(
          "Error fetching user:",
          error?.response?.data || error.message
        );
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchUser();
  }, [id, navigate]);

  const handlePrint = () => window.print();

  if (loading) return <p className={styles.loading}>Loading...</p>;
  if (!user) return <p className={styles.notFound}>User not found.</p>;

  // Small internal components for readability
  const InfoRow = ({ label, value }) => (
    <div className={styles.adminInfoRow}>
      <span className={styles.adminInfoLabel}>{label}:</span>
      <span className={styles.adminInfoValue}>{value || "-"}</span>
    </div>
  );

  const DocumentRow = ({ label, path }) => (
    <div className={styles.adminDocumentRow}>
      <span className={styles.adminDocLabel}>{label}:</span>
      {path ? (
        <a
          href={path}
          target="_blank"
          rel="noopener noreferrer"
          className={styles.adminDocLink}
        >
          दस्तऐवज पहा
        </a>
      ) : (
        <span className={styles.adminDocMissing}>उपलब्ध नाही</span>
      )}
    </div>
  );

  return (
    <div className={styles.adminContainer}>
      <div className={styles.adminTopTitle}>
        || बंजारा समाज वधू - वर मेळावा जळगाव जिल्हा ||
      </div>

      <div className={styles.adminHeader}>
        {/* Left: User Photo */}
        <div className={styles.adminPhotoSection}>
          <img
            src={user.profilePhotoPath || "/default-avatar.png"}
            alt={user.name}
            className={styles.adminUserPhoto}
            onError={(e) => (e.currentTarget.src = "/default-avatar.png")}
          />
        </div>

        {/* Center: User Info */}
        <div className={styles.adminInfoSection}>
          <h1 className={styles.adminUserName}>{user.name}</h1>
          <p className={styles.adminUserGender}>{user.gender}</p>
          <div className={styles.adminHeaderButtons}>
            <button className={styles.adminPrintBtn} onClick={handlePrint}>
              प्रिंट करा
            </button>
            <button
              className={styles.adminBackBtn}
              onClick={() => navigate("/cbaddda")}
            >
              ⬅ Back
            </button>
          </div>
        </div>

        {/* Right: Ganpati */}
        <div className={styles.adminGanpatiSection}>
          <img
            src="/images/god.png"
            alt="Ganpati Bappa"
            className={styles.adminGanpatiImg}
          />
          <p className={styles.adminGanpatiText}>|| श्री गणेशाय नमः ||</p>
        </div>
      </div>

      {/* Print Header - Only visible in print */}
      <div className={styles.adminPrintHeader}>
        <div className={styles.adminPrintPhoto}>
          <img
            src={user.profilePhotoPath || "/default-avatar.png"}
            alt={user.name}
            onError={(e) => (e.currentTarget.src = "/default-avatar.png")}
          />
        </div>
        <div className={styles.adminPrintGanpati}>
          <img src="/images/god.png" alt="Ganpati Bappa" />
          <p>|| श्री गणेशाय नमः ||</p>
        </div>
      </div>

      <div className={styles.adminContent}>
        <section className={styles.adminSection}>
          <h2>व्यक्तिगत माहिती</h2>
          <InfoRow label="जन्म तारीख" value={user.dob} />
          <InfoRow label="जन्म स्थळ" value={user.birthplace} />
          <InfoRow label="कुळदेवत" value={user.kuldevat} />
          <InfoRow label="गोत्र" value={user.gotra} />
          <InfoRow label="उंची" value={user.height} />
          <InfoRow label="रक्तगट" value={user.bloodGroup} />
          <InfoRow label="शिक्षण" value={user.education} />
          <InfoRow label="व्यवसाय" value={user.profession} />
        </section>

        <section className={styles.adminSection}>
          <h2>कौटुंबिक माहिती</h2>
          <InfoRow label="वडिलांचे नाव" value={user.fatherName} />
          <InfoRow label="वडिलांचे व्यवसाय" value={user.fatherProfession} />
          <InfoRow label="आईचे नाव" value={user.motherName} />
          <InfoRow label="आईचा व्यवसाय" value={user.motherProfession} />
          <InfoRow label="भाऊ-बहीणांची माहिती" value={user.siblings} />
          <InfoRow label="मामा" value={user.mama} />
          <InfoRow label="काका" value={user.kaka} />
          <InfoRow label="पत्ता" value={user.address} />
          <InfoRow label="मोबाइल" value={user.mobile} />
        </section>

        <section
          className={`${styles.adminSection} ${styles.adminDocumentSection}`}
        >
          <h2>दस्तऐवज</h2>
          <DocumentRow label="Profile Photo" path={user.profilePhotoPath} />
          <DocumentRow label="Aadhaar Card" path={user.aadhaarPath} />
        </section>

        <div className={styles.adminActions}>
          <button className={styles.adminPrintBtn} onClick={handlePrint}>
            Print
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminFullProfile;

import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import styles from "./design/UserProfile.module.css";

const API_USERS = "https://perfect-match-server.onrender.com/api/users";

const templates = [
  { key: "card", label: "कार्ड शैली" },
  { key: "glass", label: "ग्लास मॉर्फझिझम" },
  { key: "minimal", label: "न्यूनतम" },
];

const cn = (...cls) =>
  cls
    .filter(Boolean)
    .map((c) => (styles[c] ? styles[c] : c))
    .join(" ");

const formatDate = (dob) => {
  if (!dob) return "";
  const s = String(dob);
  // ISO or YYYY-MM-DD
  return s.length >= 10 ? s.substring(0, 10) : s;
};

const uiGenderFromApi = (g) =>
  g === "MALE" ? "पुरुष" : g === "FEMALE" ? "महिला" : g || "";

/* Small API helpers (direct URLs) */
const getUserById = async (id) => {
  const res = await axios.get(`${API_USERS}/${id}`);
  return res.data;
};

const deleteUser = async (id) => {
  await axios.delete(`${API_USERS}/delete/${id}`);
};

const InfoCard = ({ icon, label, value, className = "" }) => (
  <div className={cn(styles.infoCard, className)}>
    <div className={styles.cardIcon}>{icon}</div>
    <div className={styles.cardContent}>
      <div className={styles.cardLabel}>{label}</div>
      <div className={styles.cardValue}>{value || "दिलेले नाही"}</div>
    </div>
  </div>
);

const DocumentCard = ({ label, path }) => (
  <div className={styles.documentCard}>
    <div className={styles.docIcon}>📄</div>
    <div className={styles.docInfo}>
      <span className={styles.docLabel}>{label}</span>
      {path ? (
        <a
          href={path}
          target="_blank"
          rel="noopener noreferrer"
          className={styles.viewBtn}
        >
          दस्तऐवज पहा
        </a>
      ) : (
        <span className={styles.notAvailable}>उपलब्ध नाही</span>
      )}
    </div>
  </div>
);

const Section = ({ title, children, columns = 2 }) => (
  <section className={styles.section}>
    <h2 className={styles.sectionTitle}>{title}</h2>
    <div className={cn(styles.sectionGrid, styles[`grid${columns}`])}>
      {children}
    </div>
  </section>
);

/* Print Header Component */
const PrintHeader = () => (
  <div className={styles.printHeader}>
    <div className={styles.printHeaderContent}>
      <h1 className={styles.printMainTitle}>बंजारा समाज वधू - वर मेळावा</h1>
      <div className={styles.printSubtitle}>
        <span className={styles.printDistrict}>जळगाव जिल्हा</span>
        <span className={styles.printSeparator}> | </span>
        <span className={styles.printOrganizer}>
          मुख्य आयोजक - नितीन तुळशिराम जाधव
        </span>
      </div>
      <div className={styles.printBlessing}>
        <span className={styles.blessingText}>श्री गणेशाय नमः</span>
      </div>
    </div>
  </div>
);

/* Card Style Template */
const TemplateCard = ({ user, onUpdate, onPrint, onDelete }) => (
  <div className={styles.cardRoot}>
    <PrintHeader />

    {/* Profile Header Card */}
    <div className={styles.profileHeaderCard}>
      <div className={styles.avatarSection}>
        <div className={styles.avatarWrapper}>
          <img
            src={user.profilePhotoPath || "/default-avatar.png"}
            alt={user.name}
            className={styles.profileAvatar}
            onError={(e) => (e.currentTarget.src = "/default-avatar.png")}
          />
          <div className={styles.onlineIndicator}></div>
        </div>
        <div className={styles.verificationBadge}>
          <span className={styles.verifiedIcon}>✓</span> पुष्टीकरण झालेले
          प्रोफाइल
        </div>
      </div>

      <div className={styles.profileInfo}>
        <div className={styles.nameSection}>
          <h1 className={styles.profileName}>{user.name}</h1>
          <div className={styles.profileTags}>
            <span className={styles.genderBadge}>
              {uiGenderFromApi(user.gender)}
            </span>
            {user.profession && (
              <span className={styles.professionBadge}>{user.profession}</span>
            )}
            <span className={styles.communityBadge}>Banjarā Samāj</span>
          </div>
        </div>

        <div className={styles.contactInfo}>
          <div className={styles.contactItem}>
            <span className={styles.contactIcon}>📱</span>
            <span>{user.mobile || "उपलब्ध नाही"}</span>
          </div>
          <div className={styles.contactItem}>
            <span className={styles.contactIcon}>📍</span>
            <span>{user.address || "पत्ता उपलब्ध नाही"}</span>
          </div>
        </div>
      </div>

      <div className={styles.actionSection}>
        <button
          className={cn(styles.actionBtn, styles.primaryAction)}
          onClick={onUpdate}
        >
          <span className={styles.btnIcon}>✏️</span>
          प्रोफाइल संपादन करा
        </button>
        <button
          className={cn(styles.actionBtn, styles.secondaryAction)}
          onClick={onPrint}
        >
          <span className={styles.btnIcon}>🖨️</span>
          प्रिंट
        </button>
        <button
          className={cn(styles.actionBtn, styles.deleteButton)}
          onClick={onDelete}
          title="Delete"
        >
          <span className={styles.btnIcon}>🗑️</span>
          प्रोफाइल हटवा
        </button>
      </div>
    </div>

    {/* Main Content Grid */}
    <div className={styles.mainGrid}>
      {/* Personal Information */}
      <Section title="वैयक्तिक माहिती" columns={3}>
        <InfoCard icon="🎂" label="जन्म तारीख" value={formatDate(user.dob)} />
        <InfoCard icon="🏠" label="जन्म ठिकाण" value={user.birthplace} />
        <InfoCard icon="🛐" label="कुळदेवत" value={user.kuldevat} />
        <InfoCard icon="🌳" label="गोत्र" value={user.gotra} />
        <InfoCard icon="📏" label="उंची" value={user.height} />
        <InfoCard icon="💉" label="रक्त गट" value={user.bloodGroup} />
        <InfoCard icon="🎓" label="शिक्षण" value={user.education} />
        <InfoCard icon="💼" label="व्यवसाय" value={user.profession} />
      </Section>

      {/* Family Information */}
      <Section title="कुटुंब माहिती" columns={2}>
        <InfoCard icon="👨" label="वडिलांचे नाव" value={user.fatherName} />
        <InfoCard
          icon="💼"
          label="वडिलांचे व्यवसाय"
          value={user.fatherProfession}
        />
        <InfoCard icon="👩" label="आईचे नाव" value={user.motherName} />
        <InfoCard
          icon="💼"
          label="आईचे व्यवसाय"
          value={user.motherProfession}
        />
        <InfoCard icon="👥" label="भाऊ-बहिणी" value={user.siblings} />
        <InfoCard icon="👨‍👩‍👧" label="मामा" value={user.mama} />
        <InfoCard icon="👨‍👩‍👦" label="काका" value={user.kaka} />
        <InfoCard icon="📍" label="पत्ता" value={user.address} />
        <InfoCard icon="📞" label="मोबाइल" value={user.mobile} />
      </Section>

      {/* Documents Section */}
      <Section title="दस्तऐवज" columns={2}>
        <DocumentCard label="प्रोफाइल फोटो" path={user.profilePhotoPath} />
        <DocumentCard label="आधार कार्ड" path={user.aadhaarPath} />
      </Section>
    </div>
  </div>
);

/* Glass Morphism Template */
const TemplateGlass = ({ user, onUpdate, onPrint, onDelete }) => (
  <div className={styles.glassRoot}>
    <PrintHeader />

    <div className={styles.glassContainer}>
      {/* Sidebar */}
      <aside className={styles.glassSidebar}>
        <div className={styles.glassAvatarSection}>
          <div className={styles.glassAvatarWrapper}>
            <img
              src={user.profilePhotoPath || "/default-avatar.png"}
              alt={user.name}
              className={styles.glassAvatar}
              onError={(e) => (e.currentTarget.src = "/default-avatar.png")}
            />
            <div className={styles.glassAvatarGlow}></div>
          </div>
        </div>

        <div className={styles.glassInfo}>
          <h1 className={styles.glassName}>{user.name}</h1>
          <p className={styles.glassSubtitle}>{uiGenderFromApi(user.gender)}</p>
          {user.profession && (
            <p className={styles.glassProfession}>{user.profession}</p>
          )}
        </div>

        <div className={styles.glassActions}>
          <button
            className={cn(styles.glassBtn, styles.glassPrimary)}
            onClick={onUpdate}
          >
            प्रोफाइल अपडेट करा
          </button>
          <button
            className={cn(styles.glassBtn, styles.glassSecondary)}
            onClick={onPrint}
          >
            प्रिंट प्रोफाइल
          </button>
          <button
            className={cn(styles.glassBtn, styles.deleteButton)}
            onClick={onDelete}
            title="Delete"
          >
            🗑️ हटवा
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className={styles.glassMain}>
        <div className={styles.glassContent}>
          <div className={styles.glassSection}>
            <h3 className={styles.glassSectionTitle}>
              <span className={styles.sectionIcon}>👤</span> वैयक्तिक माहिती
            </h3>
            <div className={styles.glassGrid}>
              <InfoCard
                icon="🎂"
                label="जन्म तारीख"
                value={formatDate(user.dob)}
              />
              <InfoCard icon="🏠" label="जन्म ठिकाण" value={user.birthplace} />
              <InfoCard icon="🛐" label="कुळदेवत" value={user.kuldevat} />
              <InfoCard icon="🌳" label="गोत्र" value={user.gotra} />
              <InfoCard icon="📏" label="उंची" value={user.height} />
              <InfoCard icon="💉" label="रक्त गट" value={user.bloodGroup} />
              <InfoCard icon="🎓" label="शिक्षण" value={user.education} />
              <InfoCard icon="💼" label="व्यवसाय" value={user.profession} />
            </div>
          </div>

          <div className={styles.glassSection}>
            <h3 className={styles.glassSectionTitle}>
              <span className={styles.sectionIcon}>👨‍👩‍👧</span> कौटुंबिक माहिती
            </h3>
            <div className={styles.glassGrid}>
              <InfoCard
                label="वडिलांचे नाव"
                value={user.fatherName}
                icon="👨"
              />
              <InfoCard
                label="वडिलांचे व्यवसाय"
                value={user.fatherProfession}
                icon="💼"
              />
              <InfoCard label="आईचे नाव" value={user.motherName} icon="👩" />
              <InfoCard
                label="आईचे व्यवसाय"
                value={user.motherProfession}
                icon="💼"
              />
              <InfoCard label="भाऊ-बहिणी" value={user.siblings} icon="👥" />
              <InfoCard label="मामा" value={user.mama} icon="👨‍👩‍👧" />
              <InfoCard label="काका" value={user.kaka} icon="👨‍👩‍👦" />
            </div>
          </div>

          <div className={styles.glassSection}>
            <h3 className={styles.glassSectionTitle}>
              <span className={styles.sectionIcon}>📑</span> दस्तऐवज
            </h3>
            <div className={styles.glassDocuments}>
              <DocumentCard
                label="प्रोफाइल फोटो"
                path={user.profilePhotoPath}
              />
              <DocumentCard label="आधार कार्ड" path={user.aadhaarPath} />
            </div>
          </div>
        </div>
      </main>
    </div>
  </div>
);

/* Minimal Template */
const TemplateMinimal = ({ user, onUpdate, onPrint, onDelete }) => (
  <div className={styles.minimalRoot}>
    <PrintHeader />

    <div className={styles.minimalContainer}>
      {/* Header */}
      <header className={styles.minimalHeader}>
        <div className={styles.minimalAvatar}>
          <img
            src={user.profilePhotoPath || "/default-avatar.png"}
            alt={user.name}
            className={styles.minimalAvatarImg}
            onError={(e) => (e.currentTarget.src = "/default-avatar.png")}
          />
        </div>
        <div className={styles.minimalHeaderInfo}>
          <h1 className={styles.minimalName}>{user.name}</h1>
          <div className={styles.minimalMeta}>
            <span className={styles.minimalGender}>
              {uiGenderFromApi(user.gender)}
            </span>
            {user.profession && (
              <>
                <span className={styles.metaDivider}>•</span>
                <span className={styles.minimalProfession}>
                  {user.profession}
                </span>
              </>
            )}
          </div>
        </div>
        <div className={styles.minimalActions}>
          <button
            className={cn(styles.minimalBtn, styles.minimalPrimary)}
            onClick={onUpdate}
          >
            प्रोफाइल संपादित करा
          </button>
          <button
            className={cn(styles.minimalBtn, styles.minimalSecondary)}
            onClick={onPrint}
          >
            प्रिंट
          </button>
          <button
            className={cn(styles.minimalBtn, styles.deleteButton)}
            onClick={onDelete}
            title="Delete"
          >
            🗑️ हटवा
          </button>
        </div>
      </header>

      {/* Content */}
      <main className={styles.minimalMain}>
        <div className={styles.minimalGrid}>
          {/* Personal Info */}
          <div className={styles.minimalColumn}>
            <h3 className={styles.minimalColumnTitle}>वैयक्तिक तपशील</h3>
            <div className={styles.minimalList}>
              <div className={styles.minimalItem}>
                <span className={styles.minimalLabel}>जन्म तारीख</span>
                <span className={styles.minimalValue}>
                  {formatDate(user.dob) || "-"}
                </span>
              </div>
              <div className={styles.minimalItem}>
                <span className={styles.minimalLabel}>जन्म ठिकाण</span>
                <span className={styles.minimalValue}>
                  {user.birthplace || "-"}
                </span>
              </div>
              <div className={styles.minimalItem}>
                <span className={styles.minimalLabel}>कुळदेवत</span>
                <span className={styles.minimalValue}>
                  {user.kuldevat || "-"}
                </span>
              </div>
              <div className={styles.minimalItem}>
                <span className={styles.minimalLabel}>गोत्र</span>
                <span className={styles.minimalValue}>{user.gotra || "-"}</span>
              </div>
              <div className={styles.minimalItem}>
                <span className={styles.minimalLabel}>उंची</span>
                <span className={styles.minimalValue}>
                  {user.height || "-"}
                </span>
              </div>
              <div className={styles.minimalItem}>
                <span className={styles.minimalLabel}>रक्त गट</span>
                <span className={styles.minimalValue}>
                  {user.bloodGroup || "-"}
                </span>
              </div>
              <div className={styles.minimalItem}>
                <span className={styles.minimalLabel}>शिक्षण</span>
                <span className={styles.minimalValue}>
                  {user.education || "-"}
                </span>
              </div>
              <div className={styles.minimalItem}>
                <span className={styles.minimalLabel}>व्यवसाय</span>
                <span className={styles.minimalValue}>
                  {user.profession || "-"}
                </span>
              </div>
            </div>
          </div>

          {/* Family Info */}
          <div className={styles.minimalColumn}>
            <h3 className={styles.minimalColumnTitle}>कुटुंब माहिती</h3>
            <div className={styles.minimalList}>
              <div className={styles.minimalItem}>
                <span className={styles.minimalLabel}>वडिलांचे नाव</span>
                <span className={styles.minimalValue}>
                  {user.fatherName || "-"}
                </span>
              </div>
              <div className={styles.minimalItem}>
                <span className={styles.minimalLabel}>वडिलांचे व्यवसाय</span>
                <span className={styles.minimalValue}>
                  {user.fatherProfession || "-"}
                </span>
              </div>
              <div className={styles.minimalItem}>
                <span className={styles.minimalLabel}>आईचे नाव</span>
                <span className={styles.minimalValue}>
                  {user.motherName || "-"}
                </span>
              </div>
              <div className={styles.minimalItem}>
                <span className={styles.minimalLabel}>आईचे व्यवसाय</span>
                <span className={styles.minimalValue}>
                  {user.motherProfession || "-"}
                </span>
              </div>
              <div className={styles.minimalItem}>
                <span className={styles.minimalLabel}>भाऊ-बहिणी</span>
                <span className={styles.minimalValue}>
                  {user.siblings || "-"}
                </span>
              </div>
              <div className={styles.minimalItem}>
                <span className={styles.minimalLabel}>मामा</span>
                <span className={styles.minimalValue}>{user.mama || "-"}</span>
              </div>
              <div className={styles.minimalItem}>
                <span className={styles.minimalLabel}>काका</span>
                <span className={styles.minimalValue}>{user.kaka || "-"}</span>
              </div>
              <div className={styles.minimalItem}>
                <span className={styles.minimalLabel}>पत्ता</span>
                <span className={styles.minimalValue}>
                  {user.address || "-"}
                </span>
              </div>
              <div className={styles.minimalItem}>
                <span className={styles.minimalLabel}>मोबाइल</span>
                <span className={styles.minimalValue}>
                  {user.mobile || "-"}
                </span>
              </div>
            </div>
          </div>

          {/* Documents */}
          <div className={styles.minimalColumn}>
            <h3 className={styles.minimalColumnTitle}>दस्तऐवज</h3>
            <div className={styles.minimalDocuments}>
              <div className={styles.minimalDocItem}>
                <span className={styles.minimalDocLabel}>प्रोफाइल फोटो</span>
                {user.profilePhotoPath ? (
                  <a
                    href={user.profilePhotoPath}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.minimalDocLink}
                  >
                    View
                  </a>
                ) : (
                  <span className={styles.minimalDocMissing}>उपलब्ध नाही</span>
                )}
              </div>
              <div className={styles.minimalDocItem}>
                <span className={styles.minimalDocLabel}>आधार कार्ड</span>
                {user.aadhaarPath ? (
                  <a
                    href={user.aadhaarPath}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.minimalDocLink}
                  >
                    View
                  </a>
                ) : (
                  <span className={styles.minimalDocMissing}>उपलब्ध नाही</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  </div>
);

const UserProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [template, setTemplate] = useState(
    () => localStorage.getItem("up_template") || "card"
  );

  useEffect(() => {
    if (!id) {
      setLoading(false);
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
    fetchUser();
  }, [id]);

  useEffect(() => {
    localStorage.setItem("up_template", template);
  }, [template]);

  const handlePrint = () => {
    window.print();
  };

  const onUpdate = () => user?.id && navigate(`/update/${user.id}`);

  const handleDelete = async () => {
    if (!user?.id) return;
    const confirmDelete = window.confirm("ही प्रोफाइल हटवू इच्छिता?");
    if (!confirmDelete) return;

    try {
      await deleteUser(user.id);

      // If this was the current user in localStorage, clear it
      const storedId = localStorage.getItem("currentUserId");
      if (storedId && String(storedId) === String(user.id)) {
        localStorage.removeItem("currentUserId");
        localStorage.removeItem("currentUser");
        localStorage.removeItem("user");
      }

      navigate("/"); // or navigate("/cbaddda") if your home is the admin home
    } catch (err) {
      console.error("Failed to delete user:", err);
      alert("प्रोफाइल हटवण्यात त्रुटी आली. कृपया पुन्हा प्रयत्न करा.");
    }
  };

  const TemplateView = useMemo(() => {
    if (template === "glass") return TemplateGlass;
    if (template === "minimal") return TemplateMinimal;
    return TemplateCard;
  }, [template]);

  if (loading)
    return (
      <div className={styles.loadingWrap}>
        <div className={styles.loadingSpinner} />
        <div className={styles.loadingText}>लोड होत आहे...</div>
      </div>
    );

  if (!user) return <div className={styles.notFound}>युजर आढळला नाही.</div>;

  return (
    <div className={styles.profileContainer}>
      {/* Controls */}
      <div className={cn(styles.controls, "noPrint")}>
        <div className={styles.templateSelector}>
          <span className={styles.selectorLabel}>टेम्पलेट निवडा:</span>
          <div className={styles.templateButtons}>
            {templates.map((t) => (
              <button
                key={t.key}
                className={cn(
                  styles.templateButton,
                  template === t.key && styles.templateButtonActive
                )}
                onClick={() => setTemplate(t.key)}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        <div className={styles.actionButtons}>
          <button
            className={cn(styles.controlButton, styles.updateButton)}
            onClick={onUpdate}
          >
            प्रोफाइल अपडेट करा
          </button>
          <button
            className={cn(styles.controlButton, styles.printControlButton)}
            onClick={handlePrint}
          >
            प्रिंट प्रोफाइल
          </button>
          <button
            className={cn(styles.controlButton, styles.deleteControlButton)}
            onClick={handleDelete}
            title="Delete"
          >
            <span className={styles.btnIcon}>🗑️</span> प्रोफाइल हटवा
          </button>
        </div>
      </div>

      {/* Back Button */}
      <div className={cn(styles.backContainer, "noPrint")}>
        <button
          className={styles.backButton}
          onClick={() => navigate("/cbaddda")}
        >
          ← Back To Home
        </button>
      </div>

      {/* Profile Content */}
      <div className={cn(styles.profileContent, "printArea")}>
        <TemplateView
          user={user}
          onUpdate={onUpdate}
          onPrint={handlePrint}
          onDelete={handleDelete}
        />
      </div>
    </div>
  );
};

export default UserProfile;

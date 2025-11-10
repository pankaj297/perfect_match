import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import styles from "./design/SelfProfile.module.css";

const API_USERS = "https://perfect-match-server.onrender.com/api/users";

// LocalStorage keys
const LS_KEYS = {
  ids: "deviceProfileIds", // JSON array of user IDs created on this device
  active: "activeProfileId", // a single active profile ID
};

// Helpers to manage localStorage "device-scoped" IDs
const getDeviceProfileIds = () => {
  try {
    const raw = localStorage.getItem(LS_KEYS.ids);
    const arr = raw ? JSON.parse(raw) : [];
    return Array.isArray(arr) ? arr.map(String) : [];
  } catch {
    return [];
  }
};

const setDeviceProfileIds = (ids) => {
  const uniq = Array.from(new Set(ids.map(String)));
  localStorage.setItem(LS_KEYS.ids, JSON.stringify(uniq));
  return uniq;
};

const removeDeviceProfileId = (id) => {
  const s = String(id);
  const ids = getDeviceProfileIds().filter((x) => x !== s);
  setDeviceProfileIds(ids);
  const active = localStorage.getItem(LS_KEYS.active);
  if (active && active === s) {
    localStorage.removeItem(LS_KEYS.active);
  }
  return ids;
};

const getActiveProfileId = () => {
  const a = localStorage.getItem(LS_KEYS.active);
  if (a) return a;
  const ids = getDeviceProfileIds();
  return ids[ids.length - 1] || ""; // default to last created if any
};

const setActiveProfileId = (id) => {
  if (!id) {
    localStorage.removeItem(LS_KEYS.active);
    return;
  }
  localStorage.setItem(LS_KEYS.active, String(id));
};

const uiGender = (g) =>
  g === "MALE" ? "पुरुष" : g === "FEMALE" ? "महिला" : g || "-";
const formatDate = (dob) => (dob ? String(dob).substring(0, 10) : "-");

const SelfProfile = () => {
  const navigate = useNavigate();
  const [tab, setTab] = useState("active"); // "active" | "all"
  const [ids, setIds] = useState(() => getDeviceProfileIds());
  const [activeId, setActiveId] = useState(() => getActiveProfileId());
  const [activeUser, setActiveUser] = useState(null);
  const [activeLoading, setActiveLoading] = useState(false);
  const [activeError, setActiveError] = useState("");

  // all profiles on this device
  const [allUsers, setAllUsers] = useState([]); // [{id, ...user} | {id, _error: '...'}]
  const [allLoading, setAllLoading] = useState(false);

  // deletion state
  const [deletingId, setDeletingId] = useState("");

  // Fetch a single user
  const fetchUser = async (id) => {
    const res = await axios.get(`${API_USERS}/${id}`);
    return res.data;
  };

  // Load active profile
  const loadActive = async (id) => {
    if (!id) {
      setActiveUser(null);
      setActiveError("");
      return;
    }
    setActiveLoading(true);
    setActiveError("");
    try {
      const data = await fetchUser(id);
      setActiveUser(data);
    } catch (err) {
      const msg =
        err?.response?.data || err?.message || "प्रोफाइल लोड करण्यात अडचण आली.";
      setActiveUser(null);
      setActiveError(typeof msg === "string" ? msg : "त्रुटी आली.");
    } finally {
      setActiveLoading(false);
    }
  };

  // Load all local profiles
  const loadAll = async (idsList) => {
    if (!idsList || idsList.length === 0) {
      setAllUsers([]);
      return;
    }
    setAllLoading(true);
    try {
      const results = await Promise.allSettled(
        idsList.map((id) => fetchUser(id))
      );
      const mapped = results.map((r, idx) => {
        const id = idsList[idx];
        if (r.status === "fulfilled") return r.value;
        return { id, _error: r.reason?.message || "लोड होत नाही" };
      });
      setAllUsers(mapped);
    } finally {
      setAllLoading(false);
    }
  };

  // Init load
  useEffect(() => {
    // Ensure we sync from localStorage (in case other parts of app modified it)
    const freshIds = getDeviceProfileIds();
    setIds(freshIds);
    const freshActive = getActiveProfileId();
    setActiveId(freshActive);
    loadActive(freshActive);
    // Preload all tab
    loadAll(freshIds);
  }, []);

  // Update active when activeId changes
  useEffect(() => {
    loadActive(activeId);
  }, [activeId]);

  // When ids change, refresh all
  useEffect(() => {
    loadAll(ids);
  }, [ids]);

  const handleMakeActive = (id) => {
    setActiveProfileId(id);
    setActiveId(String(id));
    setTab("active");
  };

  // Permanently delete (DB + local)
  const handleDeleteProfile = async (id) => {
    const sId = String(id);
    const confirmDelete = window.confirm(
      "ही प्रोफाइल कायमची हटवायची का? ही क्रिया उलटवता येणार नाही."
    );
    if (!confirmDelete) return;

    try {
      setDeletingId(sId);
      await axios.delete(`${API_USERS}/delete/${sId}`);

      // Remove from device local storage
      const nextIds = removeDeviceProfileId(sId);
      setIds(nextIds);

      // If deleting the active one, pick fallback or clear
      if (String(activeId) === sId) {
        const fallback = nextIds[nextIds.length - 1] || "";
        setActiveProfileId(fallback);
        setActiveId(fallback);
        if (!fallback) setActiveUser(null);
      }

      // Refresh list
      if (nextIds.length) {
        await loadAll(nextIds);
      } else {
        setAllUsers([]);
      }

      window.alert("Profile Delete Successful ✅");
    } catch (err) {
      const msg =
        err?.response?.data || err?.message || "प्रोफाइल हटवता आले नाही.";
      window.alert(typeof msg === "string" ? msg : "त्रुटी आली.");
    } finally {
      setDeletingId("");
    }
  };

  const handleRegister = () => navigate("/register");
  const handleEdit = () =>
    activeUser?.id && navigate(`/update/${activeUser.id}`);
  const handleOpenProfile = (id) => navigate(`/profile/${id}`); // templates page
  const handlePrint = () => window.print();
  const handleRefreshActive = () => loadActive(activeId);

  const emptyState = ids.length === 0;

  return (
    <div className={styles.container}>
      {/* Hero Header */}
      <div className={styles.headerCard}>
        <div className={styles.headerLeft}>
          <h1 className={styles.title}>
            <span className={styles.titleIcon}>🧔‍♂️</span>
            तुमची प्रोफाइल
          </h1>
          <p className={styles.subtitle}>
            बंजारा मेळाव्यात नोंदणी केल्याबद्दल आपले मनःपूर्वक आभार! 👏✨
          </p>
        </div>

        <div className={styles.headerActions}>
          <button className={styles.primaryBtn} onClick={handleRegister}>
            + नवीन प्रोफाइल
          </button>
          <button className={styles.secondaryBtn} onClick={() => navigate("/")}>
            ⟵ Home
          </button>
        </div>
      </div>

      {/* Tabs */}
      {!emptyState && (
        <div className={styles.tabs}>
          <button
            className={`${styles.tab} ${
              tab === "active" ? styles.tabActive : ""
            }`}
            onClick={() => setTab("active")}
          >
            सक्रिय प्रोफाइल
          </button>
          <button
            className={`${styles.tab} ${tab === "all" ? styles.tabActive : ""}`}
            onClick={() => setTab("all")}
          >
            इतर तुमची प्रोफाइल्स
            <span className={styles.countBadge}>{ids.length}</span>
          </button>
        </div>
      )}

      {/* Content */}
      {emptyState ? (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>📱</div>
          <h3 className={styles.emptyTitle}>
            या डिव्हाइसवर अजून कोणतीही प्रोफाइल नाही
          </h3>
          <p className={styles.emptyText}>
            नोंदणी केल्यानंतर ती प्रोफाइल इथेच दिसेल.
          </p>
          <div className={styles.actionsRow}>
            <button className={styles.primaryBtn} onClick={handleRegister}>
              नोंदणी करा
            </button>
            <button
              className={styles.secondaryBtn}
              onClick={() => navigate("/")}
            >
              ⟵ Home
            </button>
          </div>
        </div>
      ) : tab === "active" ? (
        <div className={styles.activeWrap}>
          {!activeId ? (
            <div className={styles.infoCard}>
              <div className={styles.infoText}>
                कोणतेही सक्रिय प्रोफाइल निवडलेले नाही. खालील यादीतून एक निवडा.
              </div>
              <button className={styles.ghostBtn} onClick={() => setTab("all")}>
                यादी पाहा
              </button>
            </div>
          ) : activeLoading ? (
            <div className={styles.loader}>
              <div className={styles.spinner} />
              <div className={styles.abc}>
                सक्रिय प्रोफाइल लोड होत आहे...
              </div>
            </div>
          ) : activeError ? (
            <div className={styles.errorCard}>
              <div className={styles.errorIcon}>⚠️</div>
              <div className={styles.errorMsg}>{activeError}</div>
              <div className={styles.actionsRow}>
                <button
                  className={styles.ghostBtn}
                  onClick={handleRefreshActive}
                >
                  पुन्हा प्रयत्न करा
                </button>
                <button
                  className={styles.dangerBtn}
                  onClick={() => handleDeleteProfile(activeId)}
                  disabled={deletingId === String(activeId)}
                  title="प्रोफाइल कायमचे हटवा"
                >
                  {deletingId === String(activeId)
                    ? "हटवत आहे..."
                    : "प्रोफाइल हटवा"}
                </button>
              </div>
            </div>
          ) : activeUser ? (
            <div className={styles.activeCard}>
              <div className={styles.activeHeader}>
                <div className={styles.photoWrap}>
                  <img
                    src={activeUser.profilePhotoPath || "/default-avatar.png"}
                    alt={activeUser.name}
                    className={styles.photo}
                    onError={(e) =>
                      (e.currentTarget.src = "/default-avatar.png")
                    }
                  />
                  {activeUser.profilePhotoPath && (
                    <div className={styles.verifiedBadge}>
                      <span>✓</span> Verified
                    </div>
                  )}
                </div>

                <div className={styles.titleArea}>
                  <h2 className={styles.name}>{activeUser.name}</h2>
                  <div className={styles.meta}>
                    <span className={styles.chip}>
                      {uiGender(activeUser.gender)}
                    </span>
                    {activeUser.profession && (
                      <span className={styles.chip}>
                        {activeUser.profession}
                      </span>
                    )}
                  </div>

                  <div className={styles.contactRow}>
                    <div className={styles.contactItem}>
                      <span className={styles.contactIcon}>👤</span>
                      <span>{activeUser.name || "-"}</span>
                    </div>
                    <div className={styles.contactItem}>
                      <span className={styles.contactIcon}>📱</span>
                      <span>{activeUser.mobile || "-"}</span>
                    </div>
                    <div className={styles.contactItem}>
                      <span className={styles.contactIcon}>📍</span>
                      <span>{activeUser.address || "-"}</span>
                    </div>
                  </div>
                </div>

                <div className={`${styles.headerBtns} noPrint`}>
                  <button className={styles.primaryBtn} onClick={handleEdit}>
                    ✏️ Edit
                  </button>
                  <button className={styles.secondaryBtn} onClick={handlePrint}>
                    🖨️ Print
                  </button>
                  <button
                    className={styles.ghostBtn}
                    onClick={handleRefreshActive}
                  >
                    🔄 Refresh
                  </button>
                  <button
                    className={styles.dangerBtn}
                    onClick={() => handleDeleteProfile(activeId)}
                    disabled={deletingId === String(activeId)}
                    title="प्रोफाइल कायमचे हटवा"
                  >
                    {deletingId === String(activeId)
                      ? "हटवत आहे..."
                      : "प्रोफाइल हटवा"}
                  </button>
                </div>
              </div>

              <div className={styles.section}>
                <h3 className={styles.sectionTitle}>वैयक्तिक माहिती</h3>
                <div className={styles.infoGrid}>
                  <Info label="जन्म तारीख" value={formatDate(activeUser.dob)} />
                  <Info label="जन्म स्थळ" value={activeUser.birthplace} />
                  <Info label="कुळदेवत" value={activeUser.kuldevat} />
                  <Info label="गोत्र" value={activeUser.gotra} />
                  <Info label="उंची" value={activeUser.height} />
                  <Info label="रक्तगट" value={activeUser.bloodGroup} />
                  <Info label="शिक्षण" value={activeUser.education} />
                  <Info label="व्यवसाय" value={activeUser.profession} />
                </div>
              </div>

              <div className={styles.section}>
                <h3 className={styles.sectionTitle}>कौटुंबिक माहिती</h3>
                <div className={styles.infoGrid}>
                  <Info label="वडिलांचे नाव" value={activeUser.fatherName} />
                  <Info
                    label="वडिलांचे व्यवसाय"
                    value={activeUser.fatherProfession}
                  />
                  <Info label="आईचे नाव" value={activeUser.motherName} />
                  <Info
                    label="आईचा व्यवसाय"
                    value={activeUser.motherProfession}
                  />
                  <Info label="भाऊ-बहिणी" value={activeUser.siblings} />
                  <Info label="मामा" value={activeUser.mama} />
                  <Info label="काका" value={activeUser.kaka} />
                </div>
              </div>

              <div className={styles.section}>
                <h3 className={styles.sectionTitle}>दस्तऐवज</h3>
                <div className={styles.docs}>
                  <Doc
                    label="प्रोफाइल फोटो"
                    path={activeUser.profilePhotoPath}
                  />
                  <Doc label="आधार कार्ड" path={activeUser.aadhaarPath} />
                </div>
              </div>
            </div>
          ) : null}
        </div>
      ) : (
        // All on this device
        <div className={styles.listWrap}>
          {allLoading ? (
            <div className={styles.loader}>
              <div className={styles.spinner} />
              <div>प्रोफाइल्स लोड होत आहेत...</div>
            </div>
          ) : (
            <div className={styles.cardsGrid}>
              {ids.map((id) => {
                const u = allUsers.find((x) => String(x.id) === String(id)) || {
                  id,
                  _error: "लोड होत नाही",
                };
                const isDeleting = deletingId === String(id);
                return (
                  <div key={id} className={styles.card}>
                    <div className={styles.cardHeader}>
                      <div className={styles.cardPhotoWrap}>
                        <img
                          src={u.profilePhotoPath || "/default-avatar.png"}
                          alt={u.name || `User ${id}`}
                          className={styles.cardPhoto}
                          onError={(e) =>
                            (e.currentTarget.src = "/default-avatar.png")
                          }
                        />
                      </div>
                      <div className={styles.cardTitle}>
                        <div className={styles.cardName}>
                          {u.name || `User #${id}`}
                        </div>
                        <div className={styles.cardMeta}>
                          <span className={styles.chipSmall}>
                            {u._error ? "त्रुटी" : uiGender(u.gender)}
                          </span>
                          {!!u.profession && (
                            <span className={styles.chipSmall}>
                              {u.profession}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className={styles.cardBody}>
                      {u._error ? (
                        <div className={styles.errorTiny}>{u._error}</div>
                      ) : (
                        <div className={styles.smallList}>
                          <SmallInfo label="मोबाइल" value={u.mobile} />
                          <SmallInfo label="पत्ता" value={u.address} />
                        </div>
                      )}
                    </div>

                    <div className={styles.cardActions}>
                      <button
                        className={styles.primaryBtn}
                        disabled={
                          String(activeId) === String(id) ||
                          !!u._error ||
                          isDeleting
                        }
                        onClick={() => handleMakeActive(id)}
                      >
                        {String(activeId) === String(id)
                          ? "सक्रिय"
                          : "सक्रिय करा"}
                      </button>
                      <button
                        className={styles.secondaryBtn}
                        onClick={() => handleOpenProfile(id)}
                        disabled={!!u._error || isDeleting}
                      >
                        Templates
                      </button>
                      <button
                        className={styles.dangerBtn}
                        onClick={() => handleDeleteProfile(id)}
                        disabled={isDeleting}
                        title="प्रोफाइल कायमचे हटवा"
                      >
                        {isDeleting ? "हटवत आहे..." : "हटवा"}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// Presentational little helpers
const Info = ({ label, value }) => (
  <div className={styles.infoItem}>
    <span className={styles.infoLabel}>{label}</span>
    <span className={styles.infoValue}>{value || "-"}</span>
  </div>
);

const Doc = ({ label, path }) => (
  <div className={styles.docItem}>
    <span className={styles.docLabel}>{label}</span>
    {path ? (
      <a
        href={path}
        target="_blank"
        rel="noopener noreferrer"
        className={styles.docLink}
      >
        View
      </a>
    ) : (
      <span className={styles.docMissing}>उपलब्ध नाही</span>
    )}
  </div>
);

const SmallInfo = ({ label, value }) => (
  <div className={styles.smallInfo}>
    <span className={styles.smallLabel}>{label}</span>
    <span className={styles.smallValue}>{value || "-"}</span>
  </div>
);

export default SelfProfile;

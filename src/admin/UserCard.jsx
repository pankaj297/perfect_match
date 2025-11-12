import React, { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./design/UserCard.module.css";

// Memoized card to avoid re-renders when unrelated parent state changes
const UserCard = React.memo(({ user, onView, onPrefetch }) => {
  const navigate = useNavigate();

  const handleView = useCallback(() => {
    if (onView) return onView();
    navigate(`/cbaddda/user/${user.id}`);
  }, [navigate, onView, user.id]);

  // small helpers
  const getGenderIcon = (gender) =>
    gender === "MALE" ? "👨" : gender === "FEMALE" ? "👩" : "👤";

  const getProfessionIcon = (profession) => {
    if (!profession) return "💼";
    const prof = profession.toLowerCase();
    if (prof.includes("student") || prof.includes("study")) return "🎓";
    if (prof.includes("engineer")) return "⚙️";
    if (prof.includes("doctor") || prof.includes("medical")) return "⚕️";
    if (prof.includes("teacher") || prof.includes("professor")) return "📚";
    if (prof.includes("business")) return "💼";
    if (prof.includes("farmer")) return "👨‍🌾";
    if (prof.includes("driver")) return "🚗";
    return "💼";
  };

  const formatMobile = (mobile) => {
    if (!mobile) return "Not provided";
    const cleaned = String(mobile).replace(/\D/g, "");
    if (cleaned.length === 10) {
      return cleaned.replace(/(\d{3})(\d{3})(\d{4})/, "$1-$2-$3");
    }
    return mobile;
  };

  return (
    <div className={styles.card}>
      {/* Header */}
      <div className={styles.cardHeader}>
        <div className={styles.photoContainer}>
          <img
            src={user.profilePhotoPath || "/default-avatar.png"}
            alt={user.name || "User"}
            className={styles.userPhoto}
            width={120}
            height={120}
            loading="lazy"
            onError={(e) => {
              e.currentTarget.src = "/default-avatar.png";
            }}
          />
          <div className={styles.photoOverlay}>
            <span className={styles.viewProfileText}>View Profile</span>
          </div>
        </div>

        <div className={styles.userBasicInfo}>
          <h3 className={styles.userName}>{user.name || "Unknown User"}</h3>
          <div className={styles.genderBadge}>
            <span className={styles.genderIcon}>
              {getGenderIcon(user.gender)}
            </span>
            <span className={styles.genderText}>
              {user.gender === "MALE"
                ? "Male"
                : user.gender === "FEMALE"
                ? "Female"
                : "Other"}
            </span>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className={styles.cardBody}>
        <div className={styles.infoItem}>
          <div className={styles.infoIcon}>
            {getProfessionIcon(user.profession)}
          </div>
          <div className={styles.infoContent}>
            <span className={styles.infoLabel}>Profession</span>
            <span className={styles.infoValue}>
              {user.profession || "Not specified"}
            </span>
          </div>
        </div>

        <div className={styles.infoItem}>
          <div className={styles.infoIcon}>📱</div>
          <div className={styles.infoContent}>
            <span className={styles.infoLabel}>Mobile</span>
            <span className={styles.infoValue}>
              {formatMobile(user.mobile)}
            </span>
          </div>
        </div>

        {user.education && (
          <div className={styles.infoItem}>
            <div className={styles.infoIcon}>🎓</div>
            <div className={styles.infoContent}>
              <span className={styles.infoLabel}>Education</span>
              <span className={styles.infoValue}>{user.education}</span>
            </div>
          </div>
        )}

        {user.address && (
          <div className={styles.infoItem}>
            <div className={styles.infoIcon}>📍</div>
            <div className={styles.infoContent}>
              <span className={styles.infoLabel}>Location</span>
              <span className={styles.infoValue}>
                {user.address.length > 30
                  ? `${user.address.substring(0, 30)}...`
                  : user.address}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className={styles.cardFooter}>
        <button
          className={`${styles.profileButton} ${styles.primaryButton}`}
          onClick={handleView}
          onMouseEnter={onPrefetch} // prefetch heavy chunk when user is likely to click
          onFocus={onPrefetch}
        >
          👁️ View Profile
        </button>
      </div>

      {/* Verified */}
      {user.profilePhotoPath && (
        <div className={styles.verifiedBadge}>
          <span className={styles.verifiedIcon}>✓</span> Verified
        </div>
      )}
    </div>
  );
});

export default UserCard;

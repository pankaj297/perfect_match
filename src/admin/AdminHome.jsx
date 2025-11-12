import React, {
  useEffect,
  useMemo,
  useState,
  useRef,
  useCallback,
} from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import UserCard from "./UserCard.jsx"; // adjust path if needed
import styles from "./design/AdminHome.module.css";

// API
const API_USERS_URL = "https://perfect-match-server.onrender.com/api/users/";

// Axios instance
const api = axios.create({
  baseURL: API_USERS_URL,
  timeout: 30000,
});

// Prefetch helper for heavy admin full-profile page (call on hover/focus)
export const prefetchAdminFullProfile = () =>
  import("../admin/AdminFullProfile.jsx"); // path must match your project structure

const PAGE_SIZE = 10; // configurable

const AdminHome = () => {
  const navigate = useNavigate();

  // data + UI state
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [filterGender, setFilterGender] = useState("all");

  // pagination
  const [page, setPage] = useState(1);
  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(users.length / PAGE_SIZE)),
    [users.length]
  );

  // keep abort controller ref to cancel fetch on unmount or refetch
  const controllerRef = useRef(null);

  // ---------------------------------------------------------------------------
  // Fetch users (with AbortController). Only fetch when admin logged in.
  // ---------------------------------------------------------------------------
  const fetchUsers = useCallback(async () => {
    // cancel any existing request
    if (controllerRef.current) {
      try {
        controllerRef.current.abort();
      } catch {}
    }
    const controller = new AbortController();
    controllerRef.current = controller;

    setLoading(true);
    setErrorMsg("");

    try {
      const res = await api.get("", { signal: controller.signal }); // baseURL already set
      const payload = Array.isArray(res.data) ? res.data : [];
      setUsers(payload);
    } catch (err) {
      if (axios.isCancel?.(err)) {
        // aborted -> no-op
      } else {
        console.error(
          "Error fetching users:",
          err?.response?.data || err.message
        );
        setErrorMsg("Unable to load users. Please try again.");
      }
    } finally {
      setLoading(false);
      controllerRef.current = null;
    }
  }, []);

  // mount: check auth + fetch
  useEffect(() => {
    const isLoggedIn = localStorage.getItem("adminLoggedIn") === "true";
    if (!isLoggedIn) {
      navigate("/admin-login");
      return;
    }

    fetchUsers();

    return () => {
      // cleanup abort on unmount
      if (controllerRef.current) {
        try {
          controllerRef.current.abort();
        } catch {}
      }
    };
  }, [navigate, fetchUsers]);

  // ---------------------------------------------------------------------------
  // Debounce the search input so we don't filter on every keystroke
  // ---------------------------------------------------------------------------
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(searchTerm.trim()), 300);
    return () => clearTimeout(t);
  }, [searchTerm]);

  // ---------------------------------------------------------------------------
  // Filter + search logic (memoized)
  // ---------------------------------------------------------------------------
  const filteredUsers = useMemo(() => {
    const s = debouncedSearch.toLowerCase();
    return users.filter((user) => {
      const matchesSearch =
        !s ||
        (user.name && user.name.toLowerCase().includes(s)) ||
        (user.profession && user.profession.toLowerCase().includes(s)) ||
        (user.mobile && String(user.mobile).includes(s));

      const matchesGender =
        filterGender === "all" ||
        (filterGender === "male" && user.gender === "MALE") ||
        (filterGender === "female" && user.gender === "FEMALE");

      return matchesSearch && matchesGender;
    });
  }, [users, debouncedSearch, filterGender]);

  // reset page when filters change
  useEffect(() => setPage(1), [debouncedSearch, filterGender]);

  // current page slice
  const pageUsers = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filteredUsers.slice(start, start + PAGE_SIZE);
  }, [filteredUsers, page]);

  const handleLogout = useCallback(() => {
    localStorage.removeItem("adminLoggedIn");
    navigate("/");
  }, [navigate]);

  const handleRetry = () => {
    fetchUsers();
  };

  // small navigation wrapper to admin user detail (prefetch on hover is in UserCard)
  const openAdminUser = (id) => navigate(`/cbaddda/user/${id}`);

  return (
    <div className={styles.container}>
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.titleSection}>
            <h1 className={styles.mainTitle}>
              <span className={styles.titleIcon}>👥</span> All User Profiles
            </h1>
            <p className={styles.subtitle}>
              Manage and view all registered user profiles
            </p>
          </div>

          <div className={styles.headerActions}>
            <div className={styles.stats}>
              <div className={styles.statItem}>
                <span className={styles.statNumber}>{users.length}</span>
                <span className={styles.statLabel}>Total Users</span>
              </div>
              <div className={styles.statItem}>
                <span className={styles.statNumber}>
                  {users.filter((u) => u.gender === "MALE").length}
                </span>
                <span className={styles.statLabel}>Male</span>
              </div>
              <div className={styles.statItem}>
                <span className={styles.statNumber}>
                  {users.filter((u) => u.gender === "FEMALE").length}
                </span>
                <span className={styles.statLabel}>Female</span>
              </div>
            </div>

            <button className={styles.logoutButton} onClick={handleLogout}>
              <span className={styles.logoutIcon}>🚪</span> Logout
            </button>
          </div>
        </div>
      </header>

      {/* Filters */}
      <div className={styles.filters}>
        <div className={styles.searchBox}>
          <div className={styles.searchIcon}>🔍</div>
          <input
            type="text"
            placeholder="Search by name, profession, or mobile..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={styles.searchInput}
          />
        </div>

        <div className={styles.filterGroup}>
          <label className={styles.filterLabel}>Filter by Gender:</label>
          <select
            value={filterGender}
            onChange={(e) => setFilterGender(e.target.value)}
            className={styles.filterSelect}
          >
            <option value="all">All Genders</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
          </select>
          <button
            className={styles.resetFilters}
            onClick={() => {
              setSearchTerm("");
              setFilterGender("all");
            }}
          >
            Reset
          </button>
        </div>
      </div>

      {/* Results Info */}
      <div className={styles.resultsInfo}>
        <span className={styles.resultsCount}>
          Showing {filteredUsers.length} result(s) — page {page} of{" "}
          {Math.max(1, Math.ceil(filteredUsers.length / PAGE_SIZE))}
        </span>
        {debouncedSearch && (
          <span className={styles.searchTerm}>
            for "<strong>{debouncedSearch}</strong>"
          </span>
        )}
      </div>

      {/* Content */}
      {loading ? (
        <div className={styles.loadingContainer}>
          <div className={styles.loadingSpinner}></div>
          <p className={styles.loadingText}>Loading profiles...</p>
        </div>
      ) : errorMsg ? (
        <div className={styles.errorCard}>
          <div className={styles.errorText}>{errorMsg}</div>
          <div className={styles.errorActions}>
            <button className={styles.primaryBtn} onClick={handleRetry}>
              Retry
            </button>
            <button
              className={styles.secondaryBtn}
              onClick={() => navigate("/")}
            >
              Go Home
            </button>
          </div>
        </div>
      ) : filteredUsers.length === 0 ? (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>👀</div>
          <h3 className={styles.emptyTitle}>No users found</h3>
          <p className={styles.emptyText}>
            {debouncedSearch || filterGender !== "all"
              ? "Try adjusting your search or filters"
              : "No users have registered yet"}
          </p>
        </div>
      ) : (
        <>
          <div className={styles.cardsGrid}>
            {pageUsers.map((user) => (
              <UserCard
                key={user.id}
                user={user}
                onView={() => openAdminUser(user.id)}
                onPrefetch={() => prefetchAdminFullProfile()}
              />
            ))}
          </div>

          {/* Pagination */}
          <div className={styles.pagination}>
            <button
              className={styles.pageBtn}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              ← Prev
            </button>
            <span className={styles.pageInfo}>
              Page {page} of{" "}
              {Math.max(1, Math.ceil(filteredUsers.length / PAGE_SIZE))}
            </span>
            <button
              className={styles.pageBtn}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
            >
              Next →
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default AdminHome;

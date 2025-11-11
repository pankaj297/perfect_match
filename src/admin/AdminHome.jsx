import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import UserCard from "./UserCard";
import styles from "./design/AdminHome.module.css";

const API_USERS_URL = "https://perfect-match-server.onrender.com/api/users/";

// Simple API helper
const getAllUsers = async () => {
  const res = await axios.get(API_USERS_URL);
  return res.data;
};

const AdminHome = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterGender, setFilterGender] = useState("all");
  const navigate = useNavigate();

  // Simple auth guard + fetch users
  useEffect(() => {
    const isLoggedIn = localStorage.getItem("adminLoggedIn") === "true";
    if (!isLoggedIn) {
      navigate("/admin-login");
      return;
    }

    const fetchUsers = async () => {
      try {
        const response = await getAllUsers();
        setUsers(Array.isArray(response) ? response : []);
      } catch (error) {
        console.error(
          "Error fetching users:",
          error?.response?.data || error.message
        );
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [navigate]);

  // Filter users based on search and gender
  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.profession?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.mobile?.includes(searchTerm);

    const matchesGender =
      filterGender === "all" ||
      (filterGender === "male" && user.gender === "MALE") ||
      (filterGender === "female" && user.gender === "FEMALE");

    return matchesSearch && matchesGender;
  });

  const handleLogout = () => {
    localStorage.removeItem("adminLoggedIn");
    navigate("/");
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loadingContainer}>
          <div className={styles.loadingSpinner}></div>
          <p className={styles.loadingText}>Loading profiles...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.titleSection}>
            <h1 className={styles.mainTitle}>
              <span className={styles.titleIcon}>👥</span>
              All User Profiles
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
              <span className={styles.logoutIcon}>🚪</span>
              Logout
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
        </div>
      </div>

      {/* Results Info */}
      <div className={styles.resultsInfo}>
        <span className={styles.resultsCount}>
          Showing {filteredUsers.length} of {users.length} users
        </span>
        {searchTerm && (
          <span className={styles.searchTerm}>
            for "<strong>{searchTerm}</strong>"
          </span>
        )}
      </div>

      {/* User Cards Grid */}
      {filteredUsers.length === 0 ? (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>👀</div>
          <h3 className={styles.emptyTitle}>No users found</h3>
          <p className={styles.emptyText}>
            {searchTerm || filterGender !== "all"
              ? "Try adjusting your search or filters"
              : "No users have registered yet"}
          </p>
          {(searchTerm || filterGender !== "all") && (
            <button
              className={styles.resetFilters}
              onClick={() => {
                setSearchTerm("");
                setFilterGender("all");
              }}
            >
              Reset Filters
            </button>
          )}
        </div>
      ) : (
        <div className={styles.cardsGrid}>
          {filteredUsers.map((user) => (
            <UserCard key={user.id} user={user} />
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminHome;

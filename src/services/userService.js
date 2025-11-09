import axios from "axios";

const API_BASE = (
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api"
).replace(/\/$/, "");

// Helpers
const isFormData = (val) =>
  typeof FormData !== "undefined" && val instanceof FormData;

export async function registerUser(payload) {
  // Accepts either FormData or plain object (with File fields)
  const fd = isFormData(payload) ? payload : buildFormData(payload);

  const res = await axios.post(`${API_BASE}/users/register`, fd);
  return res.data; // { id, user, profilePhotoUrl, aadhaarUrl }
}

export async function getAllUsers() {
  const res = await axios.get(`${API_BASE}/users`);
  return res.data;
}

export async function getUserById(id) {
  const res = await axios.get(`${API_BASE}/users/${id}`);
  return res.data; // User object or 404
}

export async function updateUser(id, payload) {
  const fd = isFormData(payload) ? payload : buildFormData(payload);
  const res = await axios.put(`${API_BASE}/users/update/${id}`, fd);
  return res.data; // { user, profilePhotoUrl, aadhaarUrl }
}

export async function deleteUser(id) {
  const res = await axios.delete(`${API_BASE}/users/delete/${id}`);
  return res.data; // "User deleted successfully!"
}

export async function adminLogin(username, password) {
  const res = await axios.post(`${API_BASE}/users/admin/login`, {
    username,
    password,
  });
  return res.data; // "Login successful"
}

// Build FormData from plain object
function buildFormData(obj = {}) {
  const fd = new FormData();
  // Text fields
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
  ].forEach((k) => {
    if (obj[k] !== undefined && obj[k] !== null) fd.append(k, obj[k]);
  });

  // Files
  if (obj.profilePhoto) fd.append("profilePhoto", obj.profilePhoto);
  if (obj.aadhaar) fd.append("aadhaar", obj.aadhaar);

  return fd;
}

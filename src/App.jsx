import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./components/HomePage.jsx";
import { AdminLogin } from "./admin/AdminLogin.jsx";
import AdminHome from "./admin/AdminHome.jsx";
import UserProfile from "./admin/UserProfile.jsx";
import RegisterForm from "./components/RegisterForm.jsx";
import AdminFullProfile from "./admin/AdminFullProfile.jsx";
import Update from "./components/Update.jsx";


import "./styles/global.css";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="admin-login" element={<AdminLogin />} />
        <Route path="/cbaddda" element={<AdminHome />} />
        {/* Admin full profile */}
        <Route path="/cbaddda/user/:id" element={<AdminFullProfile />} />
        {/* Regular user profile */}
        <Route path="/register" element={<RegisterForm />} />
        <Route path="/cbaddda/profile/:id" element={<UserProfile />} />
        <Route path="/update/:id" element={<Update />} /> {/* 🔹 Added */}
      </Routes>
    </Router>
  );
}

export default App;

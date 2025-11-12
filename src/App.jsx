// App.jsx (replace your current imports for big pages)
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Suspense, lazy } from "react";
import Home from "./components/HomePage.jsx"; // keep tiny, or lazy if large
import ProtectedRoute from "./utils/ProtectedRoute.jsx";
import "./styles/global.css";

// lazy components
const AdminLogin = lazy(() => import("./admin/AdminLogin.jsx"));
const AdminHome = lazy(() => import("./admin/AdminHome.jsx"));
const UserProfile = lazy(() => import("./components/UserProfile.jsx"));
const RegisterForm = lazy(() => import("./components/RegisterForm.jsx"));
const AdminFullProfile = lazy(() => import("./admin/AdminFullProfile.jsx"));
const Update = lazy(() => import("./components/Update.jsx"));
const SelfProfile = lazy(() => import("./components/SelfProfile.jsx"));


// --- 🔥 prefetch helper (optional) ---
export const prefetchSelfProfile = () => import("./components/SelfProfile.jsx");

function App() {
  return (
    <Router>
      <Suspense fallback={<div style={{padding:40,textAlign:'center'}}>Loading…</div>}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/admin-login" element={<AdminLogin />} />
          <Route path="/register" element={<RegisterForm />} />
          <Route path="/profile/:id" element={<UserProfile />} />

          <Route
            path="/cbaddda"
            element={
              <ProtectedRoute role="admin">
                <AdminHome />
              </ProtectedRoute>
            }
          />
          <Route
            path="/cbaddda/user/:id"
            element={
              <ProtectedRoute role="admin">
                <AdminFullProfile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/update/:id"
            element={
              <ProtectedRoute role="user">
                <Update />
              </ProtectedRoute>
            }
          />
          <Route
            path="/me"
            element={
              <ProtectedRoute role="user">
                <SelfProfile />
              </ProtectedRoute>
            }
          />
        </Routes>
      </Suspense>
    </Router>
  );
}
export default App;





// Old Code App before lazy loading

// import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
// import Home from "./components/HomePage.jsx";
// import { AdminLogin } from "./admin/AdminLogin.jsx";
// import AdminHome from "./admin/AdminHome.jsx";
// import UserProfile from "./components/UserProfile.jsx";
// import RegisterForm from "./components/RegisterForm.jsx";
// import AdminFullProfile from "./admin/AdminFullProfile.jsx";
// import Update from "./components/Update.jsx";
// import SelfProfile from "./components/SelfProfile.jsx";
// import ProtectedRoute from "./utils/ProtectedRoute.jsx";

// import "./styles/global.css";

// function App() {
//   return (
//     <Router>
//       <Routes>
//         {/* Public routes */}
//         <Route path="/" element={<Home />} />
//         <Route path="/admin-login" element={<AdminLogin />} />
//         <Route path="/register" element={<RegisterForm />} />
//         <Route path="/profile/:id" element={<UserProfile />} />

//         {/* ✅ Protected Admin Routes */}
//         <Route
//           path="/cbaddda"
//           element={
//             <ProtectedRoute role="admin">
//               <AdminHome />
//             </ProtectedRoute>
//           }
//         />
//         <Route
//           path="/cbaddda/user/:id"
//           element={
//             <ProtectedRoute role="admin">
//               <AdminFullProfile />
//             </ProtectedRoute>
//           }
//         />

//         {/* ✅ Protected User Routes */}
//         <Route
//           path="/update/:id"
//           element={
//             <ProtectedRoute role="user">
//               <Update />
//             </ProtectedRoute>
//           }
//         />
//         <Route
//           path="/me"
//           element={
//             <ProtectedRoute role="user">
//               <SelfProfile />
//             </ProtectedRoute>
//           }
//         />
//       </Routes>
//     </Router>
//   );
// }

// export default App;

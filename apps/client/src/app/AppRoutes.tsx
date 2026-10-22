import { Navigate, Route, Routes } from "react-router";
import HomePage from "../pages/HomePage";
import LoginPage from "../pages/LoginPage";

/** Alle Seiten der App. Die Website (Landingpage) kommt später, bis dahin startet die App beim Login. */
export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/onboarding" element={<LoginPage />} />
      <Route path="/dashboard" element={<HomePage />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

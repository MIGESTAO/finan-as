import { BrowserRouter as Router, Routes, Route } from "react-router";
import { AuthProvider } from '@getmocha/users-service/react';
import HomePage from "@/react-app/pages/Home";
import AuthCallbackPage from "@/react-app/pages/AuthCallback";
import DashboardPage from "@/react-app/pages/Dashboard";
import FinanceProvider from "@/react-app/context/FinanceContext";

export default function App() {
  return (
    <AuthProvider>
      <FinanceProvider>
        <Router>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/auth/callback" element={<AuthCallbackPage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
          </Routes>
        </Router>
      </FinanceProvider>
    </AuthProvider>
  );
}

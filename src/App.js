// src/App.js
import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

// pages
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import Dashboard from "./pages/Dashboard";
import AddCustomer from "./pages/AddCustomer";
import DayWiseEntry from "./pages/DayWiseEntry";
import Overview from "./pages/Overview";
import PaymentSummary from "./pages/PaymentSummary";
import PdfDownload from "./pages/PdfDownload";

// new pages
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";

function App() {
  const [loggedIn, setLoggedIn] = useState(true); // temp for testing

  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginPage onLogin={() => setLoggedIn(true)} />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Forgot / Reset */}
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/dashboard/add-customer" element={<AddCustomer />} />
        <Route path="/dashboard/day-wise" element={<DayWiseEntry />} />
        <Route path="/dashboard/overview" element={<Overview />} />
        <Route path="/dashboard/payments" element={<PaymentSummary />} />
        <Route path="/dashboard/pdf" element={<PdfDownload />} />
      </Routes>
    </Router>
  );
}

export default App;

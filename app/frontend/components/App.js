import { BrowserRouter, Route, Routes } from "react-router-dom";
import { AuthProvider } from "~/lib/auth";
import Home from "~/pages/Home";
import About from "~/pages/About";
import Installation from "~/pages/Installation";
import Contribute from "~/pages/Contribute";
import Moderation from "~/pages/Moderation";
import AdminDashboard from "~/pages/admin/AdminDashboard";
import AdminCallsToAction from "~/pages/admin/AdminCallsToAction";
import AdminSettings from "~/pages/admin/AdminSettings";
import AdminLookup from "~/pages/admin/AdminLookup";
import Login from "~/pages/Login";
import ForgotPassword from "~/pages/ForgotPassword";
import ResetPassword from "~/pages/ResetPassword";

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/installation" element={<Installation />} />
          <Route path="/contribute/*" element={<Contribute />} />
          <Route path="/moderation" element={<Moderation />} />
          <Route path="/moderation/:id" element={<Moderation />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route
            path="/admin/calls-to-action"
            element={<AdminCallsToAction />}
          />
          <Route path="/admin/settings" element={<AdminSettings />} />
          <Route path="/admin/lookup" element={<AdminLookup />} />
          <Route path="/login" element={<Login />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

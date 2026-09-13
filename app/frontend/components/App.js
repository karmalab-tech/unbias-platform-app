import { BrowserRouter, Route, Routes } from "react-router-dom";
import { AuthProvider } from "~/lib/auth";
import Home from "~/pages/Home";
import Contribute from "~/pages/Contribute";
import Moderation from "~/pages/Moderation";
import Login from "~/pages/Login";
import ForgotPassword from "~/pages/ForgotPassword";
import ResetPassword from "~/pages/ResetPassword";

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/contribute/*" element={<Contribute />} />
          <Route path="/moderation" element={<Moderation />} />
          <Route path="/moderation/:id" element={<Moderation />} />
          <Route path="/login" element={<Login />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

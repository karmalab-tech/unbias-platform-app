import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import AuthLayout, { buttonClass, fieldClass } from "~/components/AuthLayout";
import FormError from "~/components/FormError";
import { api } from "~/lib/api";

export default function ResetPassword() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const resetPasswordToken = params.get("reset_password_token");
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await api.put("/users/password", {
        user: {
          reset_password_token: resetPasswordToken,
          password,
          password_confirmation: passwordConfirmation,
        },
      });
      navigate("/login");
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthLayout title="Choose a new password">
      <form className="space-y-4" onSubmit={handleSubmit}>
        <FormError message={error} />
        {!resetPasswordToken && (
          <FormError message="Missing reset token. Please use the link from your email." />
        )}
        <div>
          <label className="mono-caps mb-2 block text-[12px] font-bold tracking-[0.08em]">
            New password
          </label>
          <input
            type="password"
            className={fieldClass}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="mono-caps mb-2 block text-[12px] font-bold tracking-[0.08em]">
            Confirm new password
          </label>
          <input
            type="password"
            className={fieldClass}
            value={passwordConfirmation}
            onChange={(e) => setPasswordConfirmation(e.target.value)}
            required
          />
        </div>
        <button
          type="submit"
          className={buttonClass}
          disabled={submitting || !resetPasswordToken}
        >
          {submitting ? "Updating…" : "Update password"}
        </button>
      </form>
      <p className="mono-caps text-[12px] font-bold">
        <Link
          className="hover:bg-lime underline underline-offset-4"
          to="/login"
        >
          Back to sign in
        </Link>
      </p>
    </AuthLayout>
  );
}

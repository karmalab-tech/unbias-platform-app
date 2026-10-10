import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import AuthLayout, { buttonClass, fieldClass } from "~/components/AuthLayout";
import FormError from "~/components/FormError";
import { useAuth } from "~/lib/auth";
import { t } from "~/i18n";

export default function Login() {
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const [search] = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await signIn(email, password);
      const target = search.get("return");
      navigate(target && target.startsWith("/") ? target : "/moderation");
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthLayout
      title={t("staff.signInTitle")}
      subtitle={t("staff.signInSubtitle")}
    >
      <form className="space-y-4" onSubmit={handleSubmit}>
        <FormError message={error} />
        <div>
          <label
            className="mono-caps mb-2 block text-[12px] font-bold tracking-[0.08em]"
            htmlFor="email"
          >
            {t("staff.email")}
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            className={fieldClass}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div>
          <label
            className="mono-caps mb-2 block text-[12px] font-bold tracking-[0.08em]"
            htmlFor="password"
          >
            {t("staff.password")}
          </label>
          <input
            id="password"
            type="password"
            autoComplete="current-password"
            className={fieldClass}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit" className={buttonClass} disabled={submitting}>
          {submitting ? t("staff.signingIn") : t("staff.signIn")}
        </button>
      </form>
      <p className="mono-caps text-[12px] font-bold">
        <Link
          className="hover:bg-lime underline underline-offset-4"
          to="/forgot-password"
        >
          {t("staff.forgot")}
        </Link>
      </p>
    </AuthLayout>
  );
}

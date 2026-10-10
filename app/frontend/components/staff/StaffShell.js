import { Link, Navigate, NavLink, useLocation } from "react-router-dom";
import iconEye from "~/images/icons/icon_eye.png";
import { useAuth } from "~/lib/auth";
import { t } from "~/i18n";

// Desktop-first frame for moderators and admins. Redirects anonymous visitors to sign in.
export default function StaffShell({ children, wide = true }) {
  const { user, loading, isAdmin, signOut } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div
        className="bg-canvas text-ink-60 mono-caps flex min-h-dvh items-center justify-center"
        role="status"
      >
        {t("common.loading")}
      </div>
    );
  }
  if (!user) {
    return (
      <Navigate
        to={`/login?return=${encodeURIComponent(location.pathname)}`}
        replace
      />
    );
  }

  const link = ({ isActive }) =>
    `px-3.5 py-2.5 ${isActive ? "bg-signal font-bold text-ink" : "text-peach hover:text-cream"}`;

  return (
    <div className="bg-canvas text-ink min-h-dvh">
      <header className="bg-ink text-cream border-ink border-b-2">
        <div
          className={`mx-auto flex min-h-19 items-center gap-8 px-6 ${wide ? "max-w-[1600px]" : "max-w-5xl"}`}
        >
          <Link
            to="/"
            aria-label={t("home.title")}
            className="flex items-center gap-3"
          >
            <img src={iconEye} alt="" className="h-13 w-13" />
            <span className="display-caps text-[30px] leading-none tracking-[0.04em]">
              Unbias
            </span>
          </Link>
          <nav className="mono-caps flex items-center gap-1 text-[13px] tracking-[0.08em]">
            <NavLink to="/moderation" className={link}>
              {t("nav.moderation")}
            </NavLink>
            {isAdmin && (
              <NavLink to="/admin" className={link}>
                {t("nav.admin")}
              </NavLink>
            )}
          </nav>
          <div className="mono-caps text-peach ml-auto flex items-center gap-4 text-[12px]">
            <span className="hidden sm:inline">{user.email}</span>
            <button
              type="button"
              onClick={signOut}
              className="hover:text-cream cursor-pointer font-bold"
            >
              {t("staff.signOut")}
            </button>
          </div>
        </div>
      </header>
      <main
        className={`mx-auto px-6 py-6 ${wide ? "max-w-[1600px]" : "max-w-5xl"}`}
      >
        {children}
      </main>
    </div>
  );
}

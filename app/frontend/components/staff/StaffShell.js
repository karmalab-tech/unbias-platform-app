import { Link, Navigate, NavLink, useLocation } from "react-router-dom";
import { useAuth } from "~/lib/auth";
import { t } from "~/i18n";

// Desktop-first frame for moderators and admins. Redirects anonymous visitors to sign in.
export default function StaffShell({ children, wide = true }) {
  const { user, loading, isAdmin, signOut } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div
        className="bg-canvas text-ink-60 flex min-h-dvh items-center justify-center"
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
    `rounded-full px-3 py-1.5 text-[14px] font-medium ${isActive ? "bg-ink text-on-dark" : "text-ink-72 hover:text-ink"}`;

  return (
    <div className="bg-canvas text-ink min-h-dvh">
      <header className="border-hairline border-b">
        <div
          className={`mx-auto flex h-14 items-center gap-6 px-6 ${wide ? "max-w-[1600px]" : "max-w-5xl"}`}
        >
          <Link
            to="/"
            className="font-display text-[17px] font-bold tracking-[-0.01em]"
          >
            {t("home.title")}
          </Link>
          <nav className="flex items-center gap-1">
            <NavLink to="/moderation" className={link}>
              {t("nav.moderation")}
            </NavLink>
            {isAdmin && (
              <NavLink to="/admin" className={link}>
                {t("nav.admin")}
              </NavLink>
            )}
          </nav>
          <div className="text-ink-60 ml-auto flex items-center gap-4 text-[13.5px]">
            <span className="hidden sm:inline">{user.email}</span>
            <button
              type="button"
              onClick={signOut}
              className="text-ink-72 hover:text-ink font-medium"
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

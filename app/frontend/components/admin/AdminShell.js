import { Navigate, NavLink } from "react-router-dom";
import StaffShell from "~/components/staff/StaffShell";
import { useAuth } from "~/lib/auth";
import { t } from "~/i18n";

const TABS = [
  { to: "/admin", key: "dashboard", end: true },
  { to: "/admin/calls-to-action", key: "ctas" },
  { to: "/admin/settings", key: "settings" },
  { to: "/admin/lookup", key: "lookup" },
];

export default function AdminShell({ title, children }) {
  return (
    <StaffShell wide={false}>
      <AdminGuard>
        <nav className="border-hairline mb-8 flex flex-wrap gap-1 border-b pb-3">
          {TABS.map((tab) => (
            <NavLink
              key={tab.to}
              to={tab.to}
              end={tab.end}
              className={({ isActive }) =>
                `rounded-full px-3 py-1.5 text-[14px] font-medium ${isActive ? "bg-surface text-ink" : "text-ink-60 hover:text-ink"}`
              }
            >
              {t(`admin.tabs.${tab.key}`)}
            </NavLink>
          ))}
        </nav>
        <h1 className="font-display mb-6 text-[30px] leading-none font-bold tracking-[-0.025em]">
          {title}
        </h1>
        {children}
      </AdminGuard>
    </StaffShell>
  );
}

function AdminGuard({ children }) {
  const { isAdmin } = useAuth();
  if (!isAdmin) return <Navigate to="/moderation" replace />;
  return children;
}

export const inputClass =
  "rounded-btn border border-ink/20 bg-white/60 px-3 py-2 text-[14.5px] text-ink focus:border-ink focus:outline-none";

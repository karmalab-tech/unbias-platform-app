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
        <nav className="border-ink mb-8 flex flex-wrap gap-1 border-b-2 pb-3">
          {TABS.map((tab) => (
            <NavLink
              key={tab.to}
              to={tab.to}
              end={tab.end}
              className={({ isActive }) =>
                `mono-caps px-3.5 py-2.5 text-[13px] ${isActive ? "bg-signal text-ink font-bold" : "text-ink hover:bg-peach"}`
              }
            >
              {t(`admin.tabs.${tab.key}`)}
            </NavLink>
          ))}
        </nav>
        <h1 className="display-caps mb-6 text-[34px] leading-[0.95]">
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
  "border-2 border-ink bg-cream px-3 py-2 text-[14.5px] text-ink";

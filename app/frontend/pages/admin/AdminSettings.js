import { useEffect, useState } from "react";
import AdminShell, { inputClass } from "~/components/admin/AdminShell";
import Button from "~/components/ui/Button";
import { adminApi } from "~/lib/admin";
import { useAuth } from "~/lib/auth";
import { bucketLabel, DIMENSIONS } from "~/lib/coverage";
import { formatDate } from "~/lib/format";
import { t } from "~/i18n";

export default function AdminSettings() {
  return (
    <AdminShell title={t("admin.tabs.settings")}>
      <Targets />
      <Moderators />
    </AdminShell>
  );
}

function Targets() {
  const [buckets, setBuckets] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    adminApi
      .buckets()
      .then(setBuckets)
      .catch((err) => setError(err.message));
  }, []);

  const save = async (bucket, target) => {
    if (Number(target) === bucket.target_count) return;
    try {
      const updated = await adminApi.updateBucket(bucket.id, Number(target));
      setBuckets((current) =>
        current.map((b) => (b.id === updated.id ? updated : b))
      );
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <section>
      <h2 className="font-display text-[21px] font-bold tracking-[-0.015em]">
        {t("admin.settings.targets")}
      </h2>
      <p className="text-ink-60 mt-1 mb-5 max-w-[65ch] text-[14.5px]">
        {t("admin.settings.targetsIntro")}
      </p>
      {error && <p className="text-accent mb-4 text-[14px]">{error}</p>}
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {DIMENSIONS.map((dimension) => (
          <div key={dimension.id}>
            <h3 className="font-display mb-2 text-[15px] font-bold">
              {t(`taxonomy.${dimension.id}.label`)}
            </h3>
            <ul className="divide-hairline divide-y">
              {buckets
                .filter((b) => b.dimension === dimension.id)
                .map((bucket) => (
                  <li
                    key={bucket.id}
                    className="flex items-center justify-between gap-3 py-1.5 text-[14px]"
                  >
                    <span className="flex items-center gap-2">
                      {bucket.swatch && (
                        <span
                          className="border-ink/10 h-4 w-4 rounded border"
                          style={{ background: bucket.swatch }}
                        />
                      )}
                      {bucketLabel(dimension.id, bucket.value)}
                    </span>
                    <input
                      type="number"
                      min="0"
                      step="100"
                      defaultValue={bucket.target_count}
                      onBlur={(e) => save(bucket, e.target.value)}
                      onKeyDown={(e) =>
                        e.key === "Enter" && e.currentTarget.blur()
                      }
                      className={`${inputClass} tabular w-24 text-right`}
                      aria-label={`${bucketLabel(dimension.id, bucket.value)} ${t("admin.settings.target")}`}
                    />
                  </li>
                ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}

function Moderators() {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("moderator");
  const [error, setError] = useState(null);
  const [notice, setNotice] = useState(null);

  const load = () =>
    adminApi
      .moderators()
      .then(setUsers)
      .catch((err) => setError(err.message));
  useEffect(() => {
    load();
  }, []);

  const run = async (action, message) => {
    setError(null);
    setNotice(null);
    try {
      await action();
      await load();
      if (message) setNotice(message);
    } catch (err) {
      setError(err.message);
    }
  };

  const invite = (event) => {
    event.preventDefault();
    run(
      async () => {
        await adminApi.invite(email, role);
        setEmail("");
      },
      t("admin.settings.invited", { email })
    );
  };

  return (
    <section className="mt-14">
      <h2 className="font-display text-[21px] font-bold tracking-[-0.015em]">
        {t("admin.settings.moderators")}
      </h2>
      <p className="text-ink-60 mt-1 mb-5 max-w-[65ch] text-[14.5px]">
        {t("admin.settings.moderatorsIntro")}
      </p>
      {error && <p className="text-accent mb-4 text-[14px]">{error}</p>}
      {notice && <p className="text-ink-72 mb-4 text-[14px]">{notice}</p>}

      <table className="w-full text-[14px]">
        <thead className="text-ink-55 text-left text-[12px] tracking-[0.08em] uppercase">
          <tr>
            <th className="py-2 pr-4 font-semibold">{t("staff.email")}</th>
            <th className="py-2 pr-4 font-semibold">
              {t("admin.settings.role")}
            </th>
            <th className="py-2 pr-4 font-semibold">
              {t("admin.settings.added")}
            </th>
            <th className="py-2" />
          </tr>
        </thead>
        <tbody className="divide-hairline divide-y">
          {users.map((u) => (
            <tr key={u.id}>
              <td className="py-2 pr-4">{u.email}</td>
              <td className="py-2 pr-4">
                <select
                  className={inputClass}
                  value={u.role}
                  disabled={u.id === user.id}
                  onChange={(e) =>
                    run(() => adminApi.updateRole(u.id, e.target.value))
                  }
                >
                  <option value="moderator">
                    {t("admin.settings.roles.moderator")}
                  </option>
                  <option value="admin">
                    {t("admin.settings.roles.admin")}
                  </option>
                </select>
              </td>
              <td className="text-ink-60 py-2 pr-4">
                {formatDate(u.created_at)}
              </td>
              <td className="py-2 text-right">
                {u.id !== user.id && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => run(() => adminApi.removeModerator(u.id))}
                  >
                    {t("common.remove")}
                  </Button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <form
        onSubmit={invite}
        className="rounded-card bg-surface mt-6 flex flex-wrap items-end gap-3 p-4"
      >
        <label className="text-ink-72 text-[13px] font-medium">
          {t("staff.email")}
          <input
            type="email"
            required
            className={`${inputClass} mt-1 block w-64`}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </label>
        <label className="text-ink-72 text-[13px] font-medium">
          {t("admin.settings.role")}
          <select
            className={`${inputClass} mt-1 block`}
            value={role}
            onChange={(e) => setRole(e.target.value)}
          >
            <option value="moderator">
              {t("admin.settings.roles.moderator")}
            </option>
            <option value="admin">{t("admin.settings.roles.admin")}</option>
          </select>
        </label>
        <Button type="submit" size="sm" variant="ink">
          {t("admin.settings.invite")}
        </Button>
      </form>
    </section>
  );
}

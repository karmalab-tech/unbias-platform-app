import { useState } from "react";
import AdminShell, { inputClass } from "~/components/admin/AdminShell";
import Button from "~/components/ui/Button";
import { adminApi } from "~/lib/admin";
import { formatDate } from "~/lib/format";
import { t } from "~/i18n";

export default function AdminLookup() {
  const [code, setCode] = useState("");
  const [submission, setSubmission] = useState(null);
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);

  const run = async (action) => {
    setBusy(true);
    setError(null);
    try {
      setSubmission(await action());
    } catch (err) {
      setError(err.status === 404 ? t("admin.lookup.notFound") : err.message);
    } finally {
      setBusy(false);
    }
  };

  const search = (event) => {
    event.preventDefault();
    run(() => adminApi.lookup(code));
  };

  const confirmThen = (message, action) => {
    if (window.confirm(message)) run(action);
  };

  return (
    <AdminShell title={t("admin.tabs.lookup")}>
      <p className="text-ink-60 mb-6 max-w-[65ch] text-[15px]">
        {t("admin.lookup.intro")}
      </p>
      <form onSubmit={search} className="flex flex-wrap items-center gap-3">
        <input
          className={`${inputClass} font-display tabular w-56 text-[16px] font-bold tracking-[0.06em] uppercase`}
          placeholder="UNB-XXXX-XXXX"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          aria-label={t("admin.lookup.code")}
        />
        <Button
          type="submit"
          size="sm"
          variant="ink"
          disabled={busy || code.length < 8}
        >
          {t("admin.lookup.search")}
        </Button>
      </form>
      {error && <p className="notice mt-4">{error}</p>}

      {submission && (
        <section className="mt-8">
          <div className="border-ink bg-surface flex flex-wrap items-baseline justify-between gap-3 border-2 p-4 text-[14px]">
            <div>
              <span className="font-display tabular text-[19px] font-extrabold tracking-[0.04em] font-stretch-75%">
                {submission.public_code}
              </span>
              <span className="text-ink-60 ml-3">
                {formatDate(submission.submitted_at)}
              </span>
            </div>
            <span className="font-medium">
              {t(`admin.lookup.status.${submission.status}`)}
            </span>
          </div>
          <p className="text-ink-60 mt-3 text-[13.5px]">
            {t("admin.lookup.consent", {
              training: submission.consent?.training_allowed
                ? t("admin.lookup.yes")
                : t("admin.lookup.no"),
              display: submission.consent?.public_display_allowed
                ? t("admin.lookup.yes")
                : t("admin.lookup.no"),
              email: submission.email_present
                ? t("admin.lookup.yes")
                : t("admin.lookup.no"),
            })}
          </p>

          <ul className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {submission.assets.map((asset) => (
              <li
                key={asset.id}
                className="border-ink overflow-hidden border-2"
              >
                <div className="bg-surface aspect-[4/5]">
                  {asset.image_url && (
                    <img
                      src={asset.image_url}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  )}
                </div>
                <div className="p-3 text-[13px]">
                  <p className="font-medium">
                    {t(`moderation.decided.${asset.status}`, {
                      defaultValue: asset.status,
                    }) || asset.status}
                  </p>
                  <p className="text-ink-60">
                    {t("review.peopleCount", { count: asset.people_count })}
                  </p>
                  {asset.status !== "withdrawn" && (
                    <Button
                      size="sm"
                      variant="secondary"
                      className="mt-2 w-full"
                      disabled={busy}
                      onClick={() =>
                        confirmThen(t("admin.lookup.confirmAsset"), () =>
                          adminApi.withdrawAsset(asset.id)
                        )
                      }
                    >
                      {t("admin.lookup.withdrawPhoto")}
                    </Button>
                  )}
                </div>
              </li>
            ))}
          </ul>

          {submission.status !== "withdrawn" && (
            <Button
              className="mt-6"
              variant="primary"
              disabled={busy}
              onClick={() =>
                confirmThen(t("admin.lookup.confirmAll"), () =>
                  adminApi.withdrawSubmission(submission.id)
                )
              }
            >
              {t("admin.lookup.withdrawAll")}
            </Button>
          )}
        </section>
      )}
    </AdminShell>
  );
}

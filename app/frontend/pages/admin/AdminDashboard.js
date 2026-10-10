import { useEffect, useState } from "react";
import AdminShell from "~/components/admin/AdminShell";
import { adminApi } from "~/lib/admin";
import { groupBuckets, percent } from "~/lib/coverage";
import { formatNumber } from "~/lib/format";
import { t } from "~/i18n";

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    adminApi
      .dashboard()
      .then(setData)
      .catch((err) => setError(err.message));
  }, []);

  const coverage = data?.coverage;

  return (
    <AdminShell title={t("admin.tabs.dashboard")}>
      {error && <p className="notice">{error}</p>}
      {data && (
        <>
          <dl className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Tile
              label={t("admin.dash.peopleApproved")}
              value={coverage.total.approved}
            />
            <Tile
              label={t("admin.dash.peoplePending")}
              value={coverage.total.pending}
            />
            <Tile label={t("admin.dash.images")} value={coverage.images} />
            <Tile
              label={t("admin.dash.pendingImages")}
              value={data.moderation.pending}
            />
            <Tile
              label={t("admin.dash.approvedImages")}
              value={data.assets_by_status.approved ?? 0}
            />
            <Tile
              label={t("admin.dash.rejectedImages")}
              value={data.assets_by_status.rejected ?? 0}
            />
            <Tile
              label={t("admin.dash.withdrawnImages")}
              value={data.assets_by_status.withdrawn ?? 0}
            />
            <Tile
              label={t("admin.dash.submissions")}
              value={data.submissions.submitted}
            />
          </dl>

          <h2 className="display-caps mt-12 mb-4 text-[24px] leading-none">
            {t("admin.dash.coverage")}
          </h2>
          <div className="overflow-x-auto">
            <table className="tabular w-full text-[14px]">
              <thead className="mono-caps text-left text-[11px] font-bold tracking-[0.08em]">
                <tr>
                  <th className="py-2 pr-4 font-semibold">
                    {t("admin.dash.bucket")}
                  </th>
                  <th className="py-2 pr-4 text-right font-semibold">
                    {t("dashboard.approved")}
                  </th>
                  <th className="py-2 pr-4 text-right font-semibold">
                    {t("dashboard.pending")}
                  </th>
                  <th className="py-2 pr-4 text-right font-semibold">
                    {t("admin.settings.target")}
                  </th>
                  <th className="py-2 text-right font-semibold">%</th>
                </tr>
              </thead>
              {groupBuckets(coverage.buckets).map((dimension) => (
                <tbody key={dimension.id} className="border-ink border-t-2">
                  <tr>
                    <th
                      colSpan={5}
                      className="mono-caps pt-4 pb-1 text-left text-[13px] font-bold tracking-[0.12em]"
                    >
                      {dimension.title}
                    </th>
                  </tr>
                  {dimension.buckets.map((bucket) => (
                    <tr key={bucket.value} className="text-ink-72">
                      <td className="text-ink py-1 pr-4">{bucket.label}</td>
                      <td className="py-1 pr-4 text-right">
                        {formatNumber(bucket.approved)}
                      </td>
                      <td className="py-1 pr-4 text-right">
                        {formatNumber(bucket.pending)}
                      </td>
                      <td className="py-1 pr-4 text-right">
                        {formatNumber(bucket.target)}
                      </td>
                      <td className="py-1 text-right">
                        {Math.round(percent(bucket.approved, bucket.target))}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              ))}
            </table>
          </div>
        </>
      )}
    </AdminShell>
  );
}

function Tile({ label, value }) {
  return (
    <div className="border-ink bg-surface border-2 p-4">
      <dt className="text-ink-60 text-[13.5px]">{label}</dt>
      <dd className="font-display tabular mt-1 text-[28px] leading-none font-extrabold font-stretch-75%">
        {formatNumber(value)}
      </dd>
    </div>
  );
}

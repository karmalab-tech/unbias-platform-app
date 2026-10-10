import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import StaffShell from "~/components/staff/StaffShell";
import ModerationReview from "~/components/staff/ModerationReview";
import { moderationApi } from "~/lib/staff";
import { useSettings } from "~/lib/settings";
import { t } from "~/i18n";
import { formatNumber } from "~/lib/format";

export default function Moderation() {
  return (
    <StaffShell>
      <ModerationScreen />
    </StaffShell>
  );
}

// Rendered only once StaffShell has confirmed a signed-in staff member.
function ModerationScreen() {
  const { id } = useParams();
  const navigate = useNavigate();
  const settings = useSettings();
  const [queue, setQueue] = useState(null);
  const [asset, setAsset] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  const loadQueue = useCallback(async () => {
    const data = await moderationApi.queue();
    setQueue(data);
    return data;
  }, []);

  useEffect(() => {
    loadQueue().catch((err) => setError(err.message));
  }, [loadQueue]);

  // No id in the URL means "the oldest pending photo".
  useEffect(() => {
    if (!queue) return;
    if (!id) {
      if (queue.items[0])
        navigate(`/moderation/${queue.items[0].id}`, { replace: true });
      return;
    }
    if (asset?.id === Number(id)) return;
    moderationApi
      .asset(id)
      .then((data) => setAsset(data.asset))
      .catch((err) => setError(err.message));
  }, [id, queue, asset?.id, navigate]);

  const items = queue?.items ?? [];
  const index = items.findIndex((item) => item.id === Number(id));
  const prev = index > 0 ? items[index - 1] : null;
  const next = index >= 0 && index < items.length - 1 ? items[index + 1] : null;

  const decide = async (action) => {
    setBusy(true);
    setError(null);
    try {
      const data = await action();
      setQueue((current) => ({
        ...current,
        summary: data.summary,
        total: (current?.total ?? 1) - 1,
        items: current.items.filter((item) => item.id !== data.asset.id),
      }));
      const following = next ?? prev;
      if (following) navigate(`/moderation/${following.id}`);
      else setAsset(data.asset);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  const summary = queue?.summary;

  return (
    <>
      <div className="mb-5 flex flex-wrap items-baseline justify-between gap-3">
        <h1 className="display-caps text-[34px] leading-[0.95]">
          {t("moderation.title")}
        </h1>
        {summary && (
          <p className="text-ink-72 tabular text-[14.5px]">
            {t("moderation.summary", {
              pending: formatNumber(summary.pending),
              approved: formatNumber(summary.approved_today),
              rejected: formatNumber(summary.rejected_today),
            })}
          </p>
        )}
      </div>

      {error && <p className="notice mb-4">{error}</p>}

      {queue && items.length === 0 && !asset && (
        <div className="border-ink bg-surface border-2 p-10 text-center">
          <p className="display-caps text-[24px] leading-none">
            {t("moderation.emptyTitle")}
          </p>
          <p className="text-ink-60 mt-2 text-[15.5px]">
            {t("moderation.emptyBody")}
          </p>
        </div>
      )}

      {asset && settings && queue && (
        <ModerationReview
          asset={asset}
          swatches={settings.taxonomy.monk_swatches}
          reasons={queue.reasons}
          position={index + 1}
          total={queue.total}
          busy={busy}
          onApprove={() => decide(() => moderationApi.approve(asset.id))}
          onReject={(reason) =>
            decide(() => moderationApi.reject(asset.id, reason))
          }
          onPrev={prev ? () => navigate(`/moderation/${prev.id}`) : null}
          onNext={next ? () => navigate(`/moderation/${next.id}`) : null}
        />
      )}
    </>
  );
}

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  CheckIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import Button from "~/components/ui/Button";
import PhotoWithMarkers from "~/components/contribute/PhotoWithMarkers";
import useShortcuts from "~/components/staff/useShortcuts";
import { t } from "~/i18n";
import { formatDate } from "~/lib/format";

export default function ModerationReview({
  asset,
  swatches,
  reasons,
  position,
  total,
  onApprove,
  onReject,
  onPrev,
  onNext,
  busy,
}) {
  const [rejecting, setRejecting] = useState(false);

  useEffect(() => setRejecting(false), [asset.id]);

  useShortcuts(
    (event) => {
      const key = event.key.toLowerCase();
      if (rejecting) {
        const index = Number(event.key) - 1;
        if (index >= 0 && index < reasons.length)
          return onReject(reasons[index]);
        if (key === "escape") return setRejecting(false);
      }
      if (busy || asset.status !== "pending_moderation") return undefined;
      if (key === "a") return onApprove();
      if (key === "r") return setRejecting(true);
      if (key === "arrowleft") return onPrev?.();
      if (key === "arrowright") return onNext?.();
      return undefined;
    },
    [rejecting, busy, asset.id, reasons]
  );

  const pending = asset.status === "pending_moderation";

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_420px]">
      <div>
        <PhotoWithMarkers
          src={asset.image_url}
          people={asset.people}
          className="bg-surface"
        />
        <div className="text-ink-55 tabular mt-3 flex items-center justify-between text-[13px]">
          <span>
            {asset.width} × {asset.height} ·{" "}
            {Math.round((asset.byte_size ?? 0) / 1024)} KB ·{" "}
            {asset.content_type}
          </span>
          <span>{t("moderation.position", { position, total })}</span>
        </div>
      </div>

      <aside className="space-y-6 lg:sticky lg:top-6 lg:self-start">
        <section className="rounded-card bg-surface p-4 text-[14px] leading-snug">
          <div className="flex items-baseline justify-between gap-3">
            <span className="font-display tabular text-[17px] font-bold tracking-[0.04em]">
              {asset.submission.public_code}
            </span>
            <span className="text-ink-60">
              {formatDate(asset.submission.submitted_at)}
            </span>
          </div>
          <p className="text-ink-60 mt-1">
            {t("moderation.photoOf", {
              n: asset.submission.asset_position,
              total: asset.submission.asset_count,
            })}
            {" · "}
            {asset.submission.public_display_allowed
              ? t("moderation.displayAllowed")
              : t("moderation.displayNotAllowed")}
          </p>
        </section>

        <section className="border-hairline border-b pb-5">
          {pending ? (
            <>
              {!rejecting && (
                <div className="grid grid-cols-2 gap-2">
                  <Button variant="ink" onClick={onApprove} disabled={busy}>
                    <CheckIcon className="h-5 w-5" />
                    {t("moderation.approve")} <Key>A</Key>
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={() => setRejecting(true)}
                    disabled={busy}
                  >
                    <XMarkIcon className="h-5 w-5" />
                    {t("moderation.reject")} <Key>R</Key>
                  </Button>
                </div>
              )}
              {rejecting && (
                <div>
                  <p className="mb-2 text-[14px] font-medium">
                    {t("moderation.pickReason")}
                  </p>
                  <ol className="space-y-1.5">
                    {reasons.map((reason, index) => (
                      <li key={reason}>
                        <button
                          type="button"
                          onClick={() => onReject(reason)}
                          disabled={busy}
                          className="rounded-btn border-hairline-strong hover:border-ink flex w-full items-center gap-3 border px-3 py-2 text-left text-[14px]"
                        >
                          <Key>{index + 1}</Key>
                          {t(`moderation.reason.${reason}`)}
                        </button>
                      </li>
                    ))}
                  </ol>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="mt-2"
                    onClick={() => setRejecting(false)}
                  >
                    {t("common.cancel")} <Key>Esc</Key>
                  </Button>
                </div>
              )}
            </>
          ) : (
            <p className="rounded-card bg-surface p-4 text-[14px]">
              {t(`moderation.decided.${asset.status}`)}
              {asset.decision?.reason &&
                ` · ${t(`moderation.reason.${asset.decision.reason}`)}`}
              {asset.decision && (
                <span className="text-ink-55 block text-[12.5px]">
                  {asset.decision.moderator} · {formatDate(asset.decision.at)}
                </span>
              )}
            </p>
          )}

          <div className="text-ink-60 mt-4 flex items-center justify-between text-[13px]">
            <button
              type="button"
              onClick={onPrev}
              disabled={!onPrev}
              className="flex items-center gap-1 disabled:opacity-30"
            >
              <ArrowLeftIcon className="h-4 w-4" /> {t("moderation.previous")}
            </button>
            <button
              type="button"
              onClick={onNext}
              disabled={!onNext}
              className="flex items-center gap-1 disabled:opacity-30"
            >
              {t("moderation.next")} <ArrowRightIcon className="h-4 w-4" />
            </button>
          </div>
        </section>

        <section>
          <h2 className="font-display mb-3 text-[17px] font-bold tracking-[-0.01em]">
            {t("moderation.people", { count: asset.people.length })}
          </h2>
          <ol className="space-y-3">
            {asset.people.map((person, index) => (
              <li
                key={person.id}
                className="rounded-card border-hairline-strong border p-4"
              >
                <div className="mb-3 flex items-center gap-2">
                  <span className="bg-ink font-display text-canvas flex h-7 w-7 items-center justify-center rounded-full text-[13px] font-bold">
                    {index + 1}
                  </span>
                  <span className="text-ink-55 text-[12px]">
                    {person.detection_source === "detector"
                      ? t("moderation.detected")
                      : t("moderation.manual")}
                  </span>
                </div>
                <dl className="grid grid-cols-[110px_1fr] gap-x-3 gap-y-1.5 text-[14px]">
                  <Row
                    label={t("taxonomy.age.label")}
                    value={
                      person.age_bucket &&
                      t(`taxonomy.age.${person.age_bucket}`)
                    }
                  />
                  <dt className="text-ink-60">
                    {t("taxonomy.skin_tone.label")}
                  </dt>
                  <dd className="flex items-center gap-2">
                    {person.skin_tone_confirmed ? (
                      <>
                        <span
                          className="border-ink/15 inline-block h-4 w-4 rounded border"
                          style={{
                            background:
                              swatches[person.skin_tone_confirmed - 1],
                          }}
                        />
                        <span className="tabular">
                          {person.skin_tone_confirmed}
                        </span>
                        {person.skin_tone_auto &&
                          person.skin_tone_auto !==
                            person.skin_tone_confirmed && (
                            <span className="text-ink-55 text-[12px]">
                              {t("moderation.autoWas", {
                                tone: person.skin_tone_auto,
                              })}
                            </span>
                          )}
                      </>
                    ) : (
                      <span className="text-ink-45">—</span>
                    )}
                  </dd>
                  <Row
                    label={t("taxonomy.gender.label")}
                    value={
                      person.gender && t(`taxonomy.gender.${person.gender}`)
                    }
                  />
                  <Row
                    label={t("taxonomy.body.label")}
                    value={person.body && t(`taxonomy.body.${person.body}`)}
                  />
                  <Row
                    label={t("taxonomy.disability.short")}
                    value={
                      person.disability_tags?.length
                        ? person.disability_tags
                            .map((tag) => t(`taxonomy.disability.${tag}`))
                            .join(", ")
                        : t("moderation.none")
                    }
                  />
                </dl>
              </li>
            ))}
          </ol>
        </section>

        <Automatic asset={asset} />

        {asset.flags.length > 0 && (
          <section>
            <h2 className="font-display mb-2 text-[17px] font-bold tracking-[-0.01em]">
              {t("moderation.flags")}
            </h2>
            <ul className="flex flex-wrap gap-2">
              {asset.flags.map((flag) => (
                <li
                  key={flag}
                  className="bg-tint-skin text-ink rounded-full px-3 py-1 text-[12.5px] font-semibold"
                >
                  {t(`moderation.flag.${flag}`)}
                </li>
              ))}
            </ul>
            <Duplicates asset={asset} />
          </section>
        )}
      </aside>
    </div>
  );
}

function Row({ label, value }) {
  return (
    <>
      <dt className="text-ink-60">{label}</dt>
      <dd className={value ? "" : "text-ink-45"}>{value ?? "—"}</dd>
    </>
  );
}

function Key({ children }) {
  return (
    <kbd className="font-ui ml-1 rounded border border-current/30 px-1.5 py-0.5 text-[11px] font-semibold opacity-70">
      {children}
    </kbd>
  );
}

function Automatic({ asset }) {
  const byKind = Object.fromEntries(asset.enrichments.map((e) => [e.kind, e]));
  const context = byKind.vlm_context_caption;
  const result = context?.result ?? {};

  return (
    <section>
      <h2 className="font-display mb-2 text-[17px] font-bold tracking-[-0.01em]">
        {t("moderation.automatic")}
      </h2>
      {context?.status === "done" ? (
        <div className="space-y-2 text-[14px] leading-snug">
          {result.setting && (
            <p>
              <span className="text-ink-60">{t("moderation.setting")}: </span>
              {[...(result.setting ?? []), ...(result.context ?? [])].join(
                ", "
              )}
            </p>
          )}
          {result.description && (
            <p className="text-ink-72">{result.description}</p>
          )}
          {result.caption && (
            <p className="text-ink-60 italic">{result.caption}</p>
          )}
          <p className="text-ink-45 text-[12px]">
            {context.provider} · {context.model} · {context.prompt_version}
          </p>
        </div>
      ) : (
        <p className="text-ink-55 text-[14px]">
          {context?.status === "failed"
            ? t("moderation.automaticFailed")
            : t("moderation.automaticPending")}
        </p>
      )}
    </section>
  );
}

function Duplicates({ asset }) {
  const duplicate = asset.enrichments.find((e) => e.kind === "duplicate");
  const matches = [
    ...(duplicate?.result?.exact ?? []),
    ...(duplicate?.result?.near ?? []),
  ];
  if (!matches.length) return null;
  return (
    <ul className="text-ink-72 mt-3 space-y-1 text-[13px]">
      {matches.map((match) => (
        <li key={match.asset_id}>
          <Link
            to={`/moderation/${match.asset_id}`}
            className="text-ink hover:text-accent font-medium"
          >
            {match.public_code}
          </Link>{" "}
          ·{" "}
          {t(`moderation.decided.${match.status}`, {}) ===
          `moderation.decided.${match.status}`
            ? match.status
            : t(`moderation.decided.${match.status}`)}
          {match.distance > 0 &&
            ` · ${t("moderation.distance", { distance: match.distance })}`}
        </li>
      ))}
    </ul>
  );
}

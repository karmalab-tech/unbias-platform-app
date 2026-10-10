import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import {
  ArrowTopRightOnSquareIcon,
  ClipboardDocumentIcon,
  EnvelopeIcon,
} from "@heroicons/react/24/outline";
import Button from "~/components/ui/Button";
import Field, { Checkbox, inputClass } from "~/components/ui/Field";
import Modal from "~/components/ui/Modal";
import StepShell from "~/components/contribute/StepShell";
import { useContribution } from "~/components/contribute/ContributionContext";
import { t } from "~/i18n";

export default function SuccessStep() {
  const navigate = useNavigate();
  const { submission, emailCode, reset } = useContribution();
  const [copied, setCopied] = useState(false);
  const [modal, setModal] = useState(false);
  const [sentTo, setSentTo] = useState(null);

  if (!submission) return <Navigate to="/contribute/upload" replace />;
  if (submission.status !== "submitted")
    return <Navigate to="/contribute/review" replace />;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(submission.public_code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard blocked: the code stays visible on screen.
    }
  };

  const startOver = () => {
    reset();
    navigate("/contribute/upload");
  };

  return (
    <StepShell
      back={false}
      title={t("success.heading")}
      footer={
        <div className="flex flex-col gap-2 sm:flex-row">
          <Button full variant="secondary" onClick={startOver}>
            {t("success.another")}
          </Button>
          <Button full variant="ink" to="/">
            {t("success.dashboard")}
          </Button>
        </div>
      }
    >
      <p className="display-caps text-[24px] leading-none">
        {t("success.added", { count: submission.people_count })}
      </p>
      <p className="text-ink-60 mt-3 text-[15.5px] leading-[1.5]">
        {t("success.pending")}
      </p>

      <section className="border-ink bg-peach mt-8 border-2 p-6">
        <h2 className="display-caps text-[24px] leading-none">
          {t("success.keep")}
        </h2>
        <p className="text-ink-60 mt-1 text-[14.5px]">
          {t("success.keepBody")}
        </p>
        <div className="bg-canvas border-ink mt-5 flex border-2 px-3 py-3">
          <code className="font-display tabular block grow text-center text-[26px] font-extrabold tracking-[0.08em] font-stretch-75%">
            {submission.public_code}
          </code>
          <div className="flex justify-end">
            <Button variant="ink" size="sm" onClick={copy} aria-live="polite">
              <ClipboardDocumentIcon className="h-5 w-5" />
              {copied ? t("common.copied") : t("common.copy")}
            </Button>
          </div>
        </div>
        <div className="mt-4">
          {sentTo || submission.email_sent ? (
            <p className="text-ink-72 text-[14.5px]">
              {t("success.emailSent", { email: sentTo ?? "…" })}
            </p>
          ) : (
            <Button variant="secondary" onClick={() => setModal(true)} full>
              <EnvelopeIcon className="h-5 w-5" />
              {t("success.emailCta")}
            </Button>
          )}
        </div>
      </section>

      <section className="border-ink mt-4 border-2 p-6">
        <h2 className="display-caps text-[24px] leading-none">
          {t("success.followTitle")}
        </h2>
        <p className="text-ink-60 mt-1 text-[14.5px]">
          {t("success.followBody")}
        </p>
        <Button
          variant="secondary"
          className="mt-4"
          href="https://www.instagram.com/karmalab.tech"
          target="_blank"
          rel="noopener noreferrer"
          full
        >
          {t("success.followCta")}
          <ArrowTopRightOnSquareIcon className="h-5 w-5" />
        </Button>
      </section>

      <EmailCodeModal
        open={modal}
        onClose={() => setModal(false)}
        onSend={async (body) => {
          await emailCode(body);
          setSentTo(body.email);
          setModal(false);
        }}
      />
    </StepShell>
  );
}

function EmailCodeModal({ open, onClose, onSend }) {
  const [email, setEmail] = useState("");
  const [updates, setUpdates] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  const submit = async (event) => {
    event.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await onSend({ email, updates_opt_in: updates });
    } catch (err) {
      setError(err.message || t("errors.generic"));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title={t("emailModal.title")}>
      <form onSubmit={submit} className="space-y-5">
        <Field label={t("emailModal.email")} error={error}>
          <input
            type="email"
            required
            autoComplete="email"
            className={inputClass}
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
        </Field>
        <Checkbox checked={updates} onChange={setUpdates}>
          {t("emailModal.updates")}
        </Checkbox>
        <p className="text-ink-55 text-[13px] leading-snug">
          {t("emailModal.privacy")}
        </p>
        <Button type="submit" full disabled={busy}>
          {busy ? t("emailModal.sending") : t("emailModal.send")}
        </Button>
      </form>
    </Modal>
  );
}

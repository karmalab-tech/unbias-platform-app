import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import {
  ContributionProvider,
  useContribution,
} from "~/components/contribute/ContributionContext";
import UploadStep from "~/components/contribute/UploadStep";
import PermissionStep from "~/components/contribute/PermissionStep";
import PeopleStep from "~/components/contribute/PeopleStep";
import AnnotationStep from "~/components/contribute/AnnotationStep";
import ReviewStep from "~/components/contribute/ReviewStep";
import ConsentStep from "~/components/contribute/ConsentStep";
import SuccessStep from "~/components/contribute/SuccessStep";
import { t } from "~/i18n";

export default function Contribute() {
  return (
    <ContributionProvider>
      <Guard>
        <Routes>
          <Route index element={<Navigate to="upload" replace />} />
          <Route path="upload" element={<UploadStep />} />
          <Route path="permission" element={<PermissionStep />} />
          <Route path="photos/:index/people" element={<PeopleStep />} />
          <Route
            path="photos/:index/people/:person"
            element={<AnnotationStep />}
          />
          <Route path="review" element={<ReviewStep />} />
          <Route path="consent" element={<ConsentStep />} />
          <Route path="done" element={<SuccessStep />} />
          <Route path="*" element={<Navigate to="upload" replace />} />
        </Routes>
      </Guard>
    </ContributionProvider>
  );
}

// Keeps deep links honest: no draft means upload, a submitted draft means the code screen.
function Guard({ children }) {
  const { loading, submission } = useContribution();
  const { pathname } = useLocation();
  const atUpload = pathname.endsWith("/upload");
  const atDone = pathname.endsWith("/done");

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
  if (!submission && !atUpload)
    return <Navigate to="/contribute/upload" replace />;
  if (submission?.status === "submitted" && !atDone)
    return <Navigate to="/contribute/done" replace />;
  return children;
}

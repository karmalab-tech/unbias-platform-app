import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { locale } from "~/i18n";
import { useSettings } from "~/lib/settings";
import {
  contributionApi,
  directUpload,
  readToken,
  tokenizedUrl,
  writeToken,
} from "~/lib/contribution";
import { detectRaw, proposePeople, warmDetector } from "~/lib/detection";

const ContributionContext = createContext(null);

export function ContributionProvider({ children }) {
  const settings = useSettings();
  const [token, setToken] = useState(() => readToken());
  const [submission, setSubmission] = useState(null);
  const [loading, setLoading] = useState(Boolean(readToken()));
  const previews = useRef(new Map());
  const files = useRef(new Map());
  const starting = useRef(null);
  const [detections, setDetections] = useState({});

  // Loading the models takes a few seconds: start while the contributor picks photos.
  useEffect(() => {
    warmDetector();
  }, []);

  // Resume a draft left on this device; a stale token is simply dropped.
  useEffect(() => {
    const stored = readToken();
    if (!stored) return;
    contributionApi
      .current(stored)
      .then(setSubmission)
      .catch(() => {
        writeToken(null);
        setToken(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const ensureSubmission = useCallback(async () => {
    if (token && submission) return { token, submission };
    starting.current ||= contributionApi.start(locale).then((data) => {
      const { session_token: newToken, ...created } = data;
      writeToken(newToken);
      setToken(newToken);
      setSubmission(created);
      starting.current = null;
      return { token: newToken, submission: created };
    });
    return starting.current;
  }, [token, submission]);

  const replaceAsset = useCallback((asset) => {
    setSubmission((current) => ({
      ...current,
      assets: current.assets.some((a) => a.id === asset.id)
        ? current.assets.map((a) => (a.id === asset.id ? asset : a))
        : [...current.assets, asset],
    }));
  }, []);

  const addPhoto = useCallback(
    async (file, size, onProgress) => {
      const { token: activeToken, submission: active } =
        await ensureSubmission();
      const blob = await directUpload(file, activeToken, onProgress);
      const asset = await contributionApi.createAsset(activeToken, {
        signed_blob_id: blob.signed_id,
        position: active.assets?.length ?? 0,
        width: size?.width,
        height: size?.height,
      });
      previews.current.set(asset.id, URL.createObjectURL(file));
      files.current.set(asset.id, file);
      replaceAsset(asset);
      return asset;
    },
    [ensureSubmission, replaceAsset]
  );

  const removePhoto = useCallback(
    async (id) => {
      await contributionApi.deleteAsset(token, id);
      const url = previews.current.get(id);
      if (url) URL.revokeObjectURL(url);
      previews.current.delete(id);
      files.current.delete(id);
      setSubmission((current) => ({
        ...current,
        assets: current.assets.filter((a) => a.id !== id),
      }));
    },
    [token]
  );

  const confirmPermission = useCallback(async () => {
    setSubmission(await contributionApi.confirmPermission(token));
  }, [token]);

  const savePeople = useCallback(
    async (assetId, people, confirmed) => {
      const asset = await contributionApi.savePeople(
        token,
        assetId,
        people,
        confirmed
      );
      replaceAsset(asset);
      return asset;
    },
    [token, replaceAsset]
  );

  const saveConsent = useCallback(
    async (body) => {
      setSubmission(await contributionApi.saveConsent(token, body));
    },
    [token]
  );

  const submit = useCallback(async () => {
    const submitted = await contributionApi.submit(token);
    setSubmission(submitted);
    return submitted;
  }, [token]);

  const emailCode = useCallback(
    async (body) => {
      await contributionApi.emailCode(token, body);
      setSubmission((current) => ({ ...current, email_sent: true }));
    },
    [token]
  );

  // Proposes people for a photo once; failures simply leave the contributor tapping manually.
  const detect = useCallback(
    async (asset) => {
      if (!settings || detections[asset.id]) return;
      setDetections((current) => ({
        ...current,
        [asset.id]: { status: "running" },
      }));
      try {
        const blob =
          files.current.get(asset.id) ??
          (await (await fetch(tokenizedUrl(asset.image_url, token))).blob());
        const raw = await detectRaw(blob);
        const thresholds = {
          minScore: settings.limits.detection_min_score,
          minAreaRatio: settings.limits.detection_min_area_ratio,
          iou: 0.5,
          containment: 0.8,
        };
        const people = proposePeople(
          raw,
          settings.taxonomy.monk_swatches,
          thresholds
        );
        setDetections((current) => ({
          ...current,
          [asset.id]: { status: "done", people },
        }));
      } catch {
        setDetections((current) => ({
          ...current,
          [asset.id]: { status: "failed", people: [] },
        }));
      }
    },
    [settings, detections, token]
  );

  const reset = useCallback(() => {
    previews.current.forEach((url) => URL.revokeObjectURL(url));
    previews.current.clear();
    files.current.clear();
    setDetections({});
    writeToken(null);
    setToken(null);
    setSubmission(null);
  }, []);

  const photos = useMemo(
    () =>
      [...(submission?.assets ?? [])].sort(
        (a, b) => a.position - b.position || a.id - b.id
      ),
    [submission]
  );

  const imageUrl = useCallback(
    (asset) =>
      previews.current.get(asset.id) ?? tokenizedUrl(asset.image_url, token),
    [token]
  );

  const value = {
    settings,
    loading,
    submission,
    photos,
    imageUrl,
    addPhoto,
    removePhoto,
    confirmPermission,
    savePeople,
    saveConsent,
    submit,
    emailCode,
    reset,
    detect,
    detections,
  };

  return (
    <ContributionContext.Provider value={value}>
      {children}
    </ContributionContext.Provider>
  );
}

export function useContribution() {
  return useContext(ContributionContext);
}

// Next photo without complete labels, or null when every photo is done.
export function nextIncompletePhoto(photos, after = -1) {
  const index = photos.findIndex((asset, i) => i > after && !asset.complete);
  return index === -1 ? null : index;
}

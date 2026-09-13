import { DirectUpload } from "@rails/activestorage";
import { api } from "~/lib/api";

const TOKEN_KEY = "unbias.submissionToken";

export function readToken() {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function writeToken(token) {
  try {
    if (token) localStorage.setItem(TOKEN_KEY, token);
    else localStorage.removeItem(TOKEN_KEY);
  } catch {
    // Private mode or blocked storage: the flow still works for this page load.
  }
}

const withToken = (token) => ({ headers: { "X-Submission-Token": token } });

export function tokenizedUrl(url, token) {
  if (!url) return url;
  return `${url}${url.includes("?") ? "&" : "?"}token=${encodeURIComponent(token)}`;
}

export const contributionApi = {
  start: (locale) => api.post("/api/submissions", { locale }),
  current: (token) => api.get("/api/submissions/current", withToken(token)),
  confirmPermission: (token) =>
    api.patch(
      "/api/submissions/current",
      { permission_confirmed: true },
      withToken(token)
    ),
  createAsset: (token, body) =>
    api.post("/api/submissions/current/assets", body, withToken(token)),
  deleteAsset: (token, id) =>
    api.delete(`/api/submissions/current/assets/${id}`, withToken(token)),
  savePeople: (token, id, people, peopleConfirmed) =>
    api.put(
      `/api/submissions/current/assets/${id}/people`,
      { people, people_confirmed: peopleConfirmed },
      withToken(token)
    ),
  saveConsent: (token, body) =>
    api.post("/api/submissions/current/consent", body, withToken(token)),
  submit: (token) =>
    api.post("/api/submissions/current/submit", {}, withToken(token)),
  emailCode: (token, body) =>
    api.post("/api/submissions/current/email_code", body, withToken(token)),
};

// Uploads straight to storage through the token-scoped direct-upload endpoint.
export function directUpload(file, token, onProgress) {
  return new Promise((resolve, reject) => {
    const delegate = {
      directUploadWillStoreFileWithXHR(xhr) {
        xhr.upload.addEventListener("progress", (event) => {
          if (event.lengthComputable) onProgress?.(event.loaded / event.total);
        });
      },
    };
    // DirectUpload adds the CSRF header itself from the meta tag.
    const upload = new DirectUpload(file, "/api/direct_uploads", delegate, {
      "X-Submission-Token": token,
    });
    upload.create((error, blob) => (error ? reject(error) : resolve(blob)));
  });
}

export function readImageSize(file) {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => {
      resolve({ width: image.naturalWidth, height: image.naturalHeight });
      URL.revokeObjectURL(url);
    };
    image.onerror = () => {
      resolve(null);
      URL.revokeObjectURL(url);
    };
    image.src = url;
  });
}

export function isHeic(file) {
  return /hei[cf]/i.test(file.type) || /\.hei[cf]$/i.test(file.name);
}

import { ApiError, api, csrfToken } from "~/lib/api";

export const adminApi = {
  dashboard: () => api.get("/api/admin/dashboard"),
  ctas: () => api.get("/api/admin/calls_to_action"),
  createCta: (body) =>
    api.post("/api/admin/calls_to_action", { call_to_action: body }),
  updateCta: (id, body) =>
    api.patch(`/api/admin/calls_to_action/${id}`, { call_to_action: body }),
  deleteCta: (id) => api.delete(`/api/admin/calls_to_action/${id}`),
  buckets: () => api.get("/api/admin/buckets"),
  updateBucket: (id, target) =>
    api.patch(`/api/admin/buckets/${id}`, { target_count: target }),
  moderators: () => api.get("/api/admin/moderators"),
  invite: (email, role) => api.post("/api/admin/moderators", { email, role }),
  updateRole: (id, role) => api.patch(`/api/admin/moderators/${id}`, { role }),
  removeModerator: (id) => api.delete(`/api/admin/moderators/${id}`),
  lookup: (code) =>
    api.get(`/api/admin/submissions/lookup?code=${encodeURIComponent(code)}`),
  withdrawSubmission: (id) =>
    api.post(`/api/admin/submissions/${id}/withdraw`, {}),
  withdrawAsset: (id) => api.post(`/api/admin/assets/${id}/withdraw`, {}),
  experiencePrompt: (id) => api.get(`/api/admin/experience_prompts/${id}`),
  updateExperiencePrompt: (id, body) =>
    api.patch(`/api/admin/experience_prompts/${id}`, {
      experience_prompt: body,
    }),
  generateExperiencePrompt: (id) =>
    api.post(`/api/admin/experience_prompts/${id}/generate`, {}),
  generateAllExperience: () =>
    api.post("/api/admin/experience_prompts/generate_all", {}),
  clearExperienceImage: (id) =>
    api.delete(`/api/admin/experience_images/${id}`),
  uploadExperienceImage: (promptId, file, position) =>
    upload(`/api/admin/experience_prompts/${promptId}/upload`, file, position),
  regenerateExperienceImage: (id) =>
    api.post(`/api/admin/experience_images/${id}/regenerate`, {}),
};

// Multipart, so it bypasses the JSON `api` helper.
async function upload(url, file, position) {
  const body = new FormData();
  body.append("file", file);
  if (position) body.append("position", position);
  const res = await fetch(url, {
    method: "POST",
    headers: { Accept: "application/json", "X-CSRF-Token": csrfToken() },
    body,
    credentials: "same-origin",
  });
  const data = await res.json().catch(() => null);
  if (!res.ok) {
    throw new ApiError(
      data?.error || `Upload failed (${res.status})`,
      res.status,
      data
    );
  }
  return data;
}

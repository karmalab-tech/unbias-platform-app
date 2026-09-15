import { api } from "~/lib/api";

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
};

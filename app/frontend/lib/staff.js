import { api } from "~/lib/api";

export const moderationApi = {
  queue: () => api.get("/api/moderation/queue"),
  asset: (id) => api.get(`/api/moderation/assets/${id}`),
  approve: (id) => api.post(`/api/moderation/assets/${id}/approve`, {}),
  reject: (id, reason) =>
    api.post(`/api/moderation/assets/${id}/reject`, { reason }),
};

function csrfMetaTag() {
  return document.querySelector('meta[name="csrf-token"]');
}

export function csrfToken() {
  return csrfMetaTag()?.content;
}

function updateCsrfToken(res) {
  const token = res.headers.get("X-CSRF-Token");
  const meta = csrfMetaTag();
  if (token && meta) meta.content = token;
}

export class ApiError extends Error {
  constructor(message, status, data) {
    super(message);
    this.status = status;
    this.data = data;
  }
}

async function request(url, { method = "GET", body, headers = {} } = {}) {
  const res = await fetch(url, {
    method,
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      "X-CSRF-Token": csrfToken(),
      ...headers,
    },
    body: body ? JSON.stringify(body) : undefined,
    credentials: "same-origin",
  });

  updateCsrfToken(res);

  const text = await res.text();
  const isJson = res.headers.get("content-type")?.includes("application/json");
  const data = isJson && text ? JSON.parse(text) : null;

  if (!res.ok) {
    const message =
      data?.errors?.join(", ") ||
      data?.error ||
      `Request failed (${res.status})`;
    throw new ApiError(message, res.status, data);
  }

  return data;
}

export const api = {
  get: (url, options) => request(url, options),
  post: (url, body, options) =>
    request(url, { ...options, method: "POST", body }),
  put: (url, body, options) =>
    request(url, { ...options, method: "PUT", body }),
  patch: (url, body, options) =>
    request(url, { ...options, method: "PATCH", body }),
  delete: (url, options) => request(url, { ...options, method: "DELETE" }),
};

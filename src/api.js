const BASE = import.meta.env.VITE_API_URL ?? "https://eastcape-backend.onrender.com";

export const apiFetch = (path, options = {}) =>
  fetch(`${BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });

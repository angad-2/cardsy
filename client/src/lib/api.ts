import axios from "axios";

// Base URL comes from .env (VITE_API_URL); falls back to the local server.
const baseURL = import.meta.env.VITE_API_URL || "http://localhost:5002/api";

export const TOKEN_KEY = "cardsy_token";

export const getToken = () => localStorage.getItem(TOKEN_KEY);
export const setToken = (t: string) => localStorage.setItem(TOKEN_KEY, t);
export const clearToken = () => localStorage.removeItem(TOKEN_KEY);
export const isLoggedIn = () => !!getToken();

const api = axios.create({ baseURL });

// Attach the JWT to every request when we have one.
api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// On 401 (expired/invalid token) drop the token and bounce to /auth.
api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      clearToken();
      if (window.location.pathname !== "/auth") window.location.href = "/auth";
    }
    return Promise.reject(error);
  }
);

// Every backend response is { status, message, data } — unwrap to `data`.
export const unwrap = <T = any>(res: { data: { data: T } }): T => res.data.data;

// Pull a human-readable message out of an axios error.
export const errMessage = (e: any, fallback = "Something went wrong") =>
  e?.response?.data?.message || e?.message || fallback;

export default api;

import { api } from "./api";

export const request = {
  get: async (url, params = {}) => {
    const res = await api.get(url, { params });
    return res.data;
  },
  post: async (url, data = {}) => {
    const res = await api.post(url, data);
    return res.data;
  },
  put: async (url, data = {}) => {
    const res = await api.put(url, data);
    return res.data;
  },
  delete: async (url) => {
    const res = await api.delete(url);
    return res.data;
  }
};

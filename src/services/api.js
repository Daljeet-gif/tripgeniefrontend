import axiosInstance from './axios';

// ─── Trip planning & history ──────────────────────────────────────────────────
export const planTripAPI = (data) => axiosInstance.post('/trips/plan', data);
export const getUserTripsAPI = () => axiosInstance.get('/trips/my-trips');
export const getTripByIdAPI = (id) => axiosInstance.get(`/trips/${id}`);
export const deleteTripAPI = (id) => axiosInstance.delete(`/trips/${id}`);

// ─── AI assistant ─────────────────────────────────────────────────────────────
export const chatTripAPI = (id, message, history) =>
  axiosInstance.post(`/trips/${id}/chat`, { message, history });

// ─── Packing list & local info ────────────────────────────────────────────────
export const getPackingListAPI = (id, refresh = false) =>
  axiosInstance.get(`/trips/${id}/packing${refresh ? '?refresh=1' : ''}`);
export const getLocalInfoAPI = (id, refresh = false) =>
  axiosInstance.get(`/trips/${id}/local-info${refresh ? '?refresh=1' : ''}`);

// ─── Sharing ──────────────────────────────────────────────────────────────────
export const shareTripAPI = (id) => axiosInstance.post(`/trips/${id}/share`);
export const unshareTripAPI = (id) => axiosInstance.post(`/trips/${id}/unshare`);
export const getSharedTripAPI = (shareId) => axiosInstance.get(`/trips/share/${shareId}`);

// ─── Profile (used by Profile page) ───────────────────────────────────────────
export const getProfileAPI = () => axiosInstance.get('/users/profile');
export const updateProfileAPI = (data) => axiosInstance.put('/users/profile', data);
export const deleteAccountAPI = (id) => axiosInstance.delete(`/users/${id}`);

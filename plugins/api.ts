export default defineNuxtPlugin((nuxtApp) => {
  const { logout, bearerToken } = useAuthStore();
  const {
    public: { apiBaseUrl },
  } = useRuntimeConfig();

  const api = $fetch.create({
    baseURL: apiBaseUrl,
    onRequest({ options }) {
      const token = useAuthStore().bearerToken;
      if (token) {
        options.headers = {
          ...options.headers,
          Authorization: `Bearer ${token}`,
        };
      }
    },
    onResponseError: (error) => {
      if (error.response?.status === 401) {
        logout();
      }
      if (error.response?.status === 403) {
        // TODO: Handle forbidden error
      }
    },
  });

  return {
    provide: { api },
  };
});

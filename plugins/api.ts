export default defineNuxtPlugin((nuxtApp) => {
  const { logout, bearerToken } = useAuthStore();
  const {
    public: { apiBaseUrl },
  } = useRuntimeConfig();

  const api = $fetch.create({
    baseURL: apiBaseUrl,
    headers: {
      Authorization: `Bearer ${bearerToken}`,
    },
    onResponseError: (error) => {
      if (error.response?.status === 401) {
        logout();
      }
      if (error.response?.status === 403) {
        // Todo: Handle forbidden error
      }
    },
  });

  return {
    provide: { api },
  };
});

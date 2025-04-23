import type { UseFetchOptions } from "nuxt/app";

type Path = string | Ref<string> | (() => string);

export const useApi = <T>(path: Path, opt?: UseFetchOptions<T>) => {
  const options: UseFetchOptions<T> = {
    ...opt,
    $fetch: useNuxtApp().$api as typeof $fetch,
  };
  
  if (opt?.body instanceof FormData) {
    options.headers = {
      ...options.headers,
      // "Content-Type": "multipart/form-data",
    };
  }
  
  return useFetch(path, options);
};

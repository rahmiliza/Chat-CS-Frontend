<template>
  <div class="flex h-full w-full flex-col items-center justify-center">
    <div
      class="sm:max-0 mx-4 grid w-full max-w-sm grid-cols-1 gap-y-4 rounded-lg bg-gray-50 p-4 dark:bg-gray-800"
    >
      <div class="flex flex-col items-center justify-center gap-2">
        <Icon
          name="uil:process"
          size="2rem"
          class="text-primary dark:text-primaryDark"
        />
        <span class="font-bold">{{ $t("auth.callback.authenticating") }}</span>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
definePageMeta({
  layout: "blank",
  auth: "guest",
});

const auth = useAuthStore();
if (auth.isLoggedIn) {
  navigateTo("/");
}

import type { AccessToken } from "~/stores/auth";

const code = useRequestURL().searchParams.get("code") ?? "Not Found";

const { data, error } = await useApi<AccessToken>("/auth/customer", {
  method: "POST",
  body: {
    access_key: "AABBCC",
    fingerprint: "WEB",
    info: "Info",
  },
});

if (error.value != null || data.value == null) {
  navigateTo("/auth/login?error=invalid_response");
} else {
  const success = await auth.setAccessToken("customer", data.value.data);
  auth.$persist(); // Force Persist
  if (success) {
    navigateTo("/");
  } else {
    navigateTo("/auth/login?error=failed_to_verify_jwt");
  }
}
</script>

<style></style>

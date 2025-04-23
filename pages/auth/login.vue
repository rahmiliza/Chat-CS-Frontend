<template>
  <div class="flex h-full w-full flex-col items-center justify-center">
    <div
      class="sm:max-0 mx-4 grid w-full max-w-sm grid-cols-1 gap-y-4 rounded-lg bg-gray-50 p-4 dark:bg-gray-800"
    >
      <div class="flex flex-col items-center justify-center">
        <span class="text-2xl font-bold">
          {{ $t("auth.login.loginToService", { service: "Admin" }) }}
        </span>
      </div>
      <Button
        icon="uil:sign-in-alt"
        class="bg-primary dark:bg-primaryDark text-white hover:brightness-125 dark:text-gray-50 justify-center"
        @click="loginAdmin"
      >
        {{ $t("auth.login.loginViaXinchuanAuth") }}
      </Button>
      <Button
        icon="uil:sign-in-alt"
        class="bg-primary dark:bg-primaryDark text-white hover:brightness-125 dark:text-gray-50 justify-center"
        @click="loginCustomer"
      >
        Login Customer
      </Button>
    </div>
  </div>
</template>

<script lang="ts" setup>
definePageMeta({
  layout: "blank",
  auth: "guest",
});

const login = () => {
  const config = useRuntimeConfig();

  const url = new URL(config.public.auth.url);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("client_id", config.public.auth.clientId);
  url.searchParams.set("redirect_uri", config.public.auth.callbackUrl);

  window.location.replace(url.href);
};

const loginAdmin = () => {
  window.location.replace("http://localhost:3000/auth/callback?code=def502002ac0d17048636fd005f79807179750e524edaa2015eac67d0b023c42f3acc9f1f6f15945ed50615bc737389e447f8a175e40fca4c3ef38ff821a38a446e4a4f2457a3cf7567b80adf01f7a3a70d07de635822e498008115bfcc521f42a105b425963185394e13460d5848ded2e5ea9ab39768382db83a09f32b6b7c34e2e9c2f22515a4c2802c6b1f86e7525ed8cad45cd45e248eeda09ebe82a75f32254ab2858959354dd798421dae0668c98893fc7f48e605bf65fc5bd5f5d417679e6b62f740b1753e4830dd825829878ecda1c7d8239127db67f140a978c1912cb0a969c7959b4a67bf46981d6f96d0397417e4164670115e6085e9e36d34329e27129a651c14b458932be6bb0f381c14975734ce54d94c58fc0ce9f9488b11e659954fc8399bbc3c3bf84c3a651af016c68d524e06fd5854331e1f2aac2b891c63d0e5bce9992caaee158cc5c1fbbcdd7c04c88070cf4f95de2ad843e0f6d8a616392770ae7fa&state=Zw5q1hXQjArgVy6xI213g");
};

const loginCustomer = () => {
  window.location.replace("http://localhost:3000/auth/callback-customer?code=def502002ac0d17048636fd005f79807179750e524edaa2015eac67d0b023c42f3acc9f1f6f15945ed50615bc737389e447f8a175e40fca4c3ef38ff821a38a446e4a4f2457a3cf7567b80adf01f7a3a70d07de635822e498008115bfcc521f42a105b425963185394e13460d5848ded2e5ea9ab39768382db83a09f32b6b7c34e2e9c2f22515a4c2802c6b1f86e7525ed8cad45cd45e248eeda09ebe82a75f32254ab2858959354dd798421dae0668c98893fc7f48e605bf65fc5bd5f5d417679e6b62f740b1753e4830dd825829878ecda1c7d8239127db67f140a978c1912cb0a969c7959b4a67bf46981d6f96d0397417e4164670115e6085e9e36d34329e27129a651c14b458932be6bb0f381c14975734ce54d94c58fc0ce9f9488b11e659954fc8399bbc3c3bf84c3a651af016c68d524e06fd5854331e1f2aac2b891c63d0e5bce9992caaee158cc5c1fbbcdd7c04c88070cf4f95de2ad843e0f6d8a616392770ae7fa&state=Zw5q1hXQjArgVy6xI213g");
}

</script>

<style></style>

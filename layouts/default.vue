<template>
  <div class="flex h-screen w-screen flex-row dark:bg-slate-50 dark:text-gray-50">
    <Sidebar />
    <div class="flex w-[calc(100vw-theme(spacing.64))] flex-1 flex-col">
      <header class="flex h-16 justify-end border-b px-4 py-2 dark:border-gray-800">
        <div class="flex items-center gap-4">
          <ClientOnly>
            <button @click="toggleColorMode" class="items -center flex justify-center">
              <Icon :name="colorMode.value === 'light' ? 'uil:sun' : 'uil:moon'" size="2rem"
                class="dark:text-black" />
            </button>
          </ClientOnly>
          <select v-model="currentLocale" @change="setLocale(currentLocale)"
            class="flex items-center rounded-lg bg-gray-50 px-2 py-1 dark:bg-gray-800">
            <option v-for="locale in availableLocales" :key="locale.code" :value="locale.code">
              {{ locale.name }}
            </option>
          </select>
          <!-- Separator -->
          <div class="h-6 w-0.5 bg-gray-300 dark:bg-gray-700"></div>
          <div class="flex items-center gap-4">
            <!-- Todo: Handle profile image, pending auth service to provide profile image -->
            <div class="flex h-10 w-10 items-center justify-center rounded-full bg-gray-300 dark:bg-gray-700">
              <span class="text-lg">{{ userInitials }}</span>
            </div>
            <div class="flex flex-col -space-y-1">
              <span class="font-bold">{{ user?.name }}</span>
              <span class="text-sm">{{ user?.username }}</span>
            </div>
          </div>
        </div>
      </header>
      <main class="grow overflow-auto p-2 lg:p-4">
        <div class="flex items-center justify-between pb-4">
          <h1 class="text-2xl font-bold">{{ $t(title) }}</h1>
          <!-- <slot name="page-header" /> -->
          <!-- This is currently not supported by Nuxt -->
        </div>
        <slot />
      </main>
    </div>
  </div>
  <OverlayToastContainer />
</template>

<script lang="ts" setup>
const route = useRoute();
const title = computed<string>(() => (route.meta.title as string) ?? "");

// Auth
const { user } = useAuthStore();

// Language Selector
const { locale, setLocale } = useI18n();
const currentLocale = ref(locale.value);
const availableLocales = [
  { code: "en", name: "English" },
  { code: "id", name: "Bahasa Indonesia" },
  { code: "zh-Hant-TW", name: "繁體中文" },
];

// Color Mode
const colorMode = useColorMode();

const toggleColorMode = () => {
  colorMode.preference = colorMode.value === "light" ? "dark" : "light";
};

const userInitials = computed(() => {
  // If user's name is entirely alphabetical, return the first two characters
  if (user?.name && /^[a-zA-Z]+$/.test(user.name)) {
    return user.name
      .split(" ")
      .map((name) => name[0])
      .join("");
  }

  // Else, grab the first character of the username
  if (user?.username) {
    return user.username[0];
  }

  return "";
});
</script>

<style></style>

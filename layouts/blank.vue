<template>
  <div class="dark:text-gray-50">
    <div class="absolute right-4 top-4 flex items-center gap-4">
      <ClientOnly>
        <button
          @click="toggleColorMode"
          class="flex items-center justify-center"
        >
          <Icon
            :name="colorMode.value === 'light' ? 'uil:sun' : 'uil:moon'"
            size="2rem"
            class="text-gray-50"
          />
        </button>
      </ClientOnly>
      <select
        v-model="currentLocale"
        @change="setLocale(currentLocale)"
        class="flex items-center rounded-lg bg-gray-50 px-2 py-1 dark:bg-gray-800"
      >
        <option
          v-for="locale in availableLocales"
          :key="locale.code"
          :value="locale.code"
        >
          {{ locale.name }}
        </option>
      </select>
    </div>
    <div class="bg-babyBlue flex h-screen w-screen flex-col dark:bg-gray-900">
      <slot />
    </div>
  </div>
</template>

<script lang="ts" setup>
// i18n
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
</script>

<style></style>

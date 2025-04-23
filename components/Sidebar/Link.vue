<template>
  <NuxtLink
    :to="link.to"
    class="inline-flex w-full items-center gap-2 rounded-lg px-4 py-2 transition-all duration-200"
    :class="{
      'bg-primary text-gray-50 hover:brightness-125 dark:bg-gray-700':
        isCurrentRoute(link.to),
      'hover:bg-gray-100 dark:hover:bg-gray-700': !isCurrentRoute(link.to),
    }"
  >
    <Icon v-if="link.icon" :name="link.icon" size="1.5rem" />
    {{ $t(link.label) }}
  </NuxtLink>
</template>

<script lang="ts" setup>
import type { Link } from "./sidebarMeta";

const props = defineProps<{
  link: Link;
}>();
</script>

<style></style>

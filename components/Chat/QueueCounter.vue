<template>
  <div class="w-[calc(100%-336px)] h-full flex flex-col justify-center items-center rounded-md">
    <div class="text-slate-600 text-8xl font-bold tracking-wider">{{ adminChatQueue?.queue?.length ?? 0 }}</div>
    <div class="text-slate-600 text-2xl">Chat Queue Remaining</div>
  </div>
</template>

<script setup lang="ts">
import type { AdminChatQueue } from '~/models/chat';

interface Prop {
  adminChatQueue?: AdminChatQueue
}

withDefaults(defineProps<Prop>(), {})
</script>

<style scoped></style>

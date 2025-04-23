<template>
  <div :class="className">
    <div class="flex items-center justify-center gap-2">
      <div class="bg-primary h-2 w-2 animate-bounce rounded-full" style="animation-delay:75ms;"></div>
      <div class="bg-primary h-2 w-2 animate-bounce rounded-full" style="animation-delay:150ms;"></div>
      <div class="bg-primary h-2 w-2 animate-bounce rounded-full" style="animation-delay:250ms;"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    class?: string
  }>(),
  {
    class:
      'absolute z-20 backdrop-filter backdrop-blur-sm inset-0 bg-white bg-opacity-70 flex items-center justify-center rounded-lg',
  }
)

const className = computed(() => props.class)
</script>

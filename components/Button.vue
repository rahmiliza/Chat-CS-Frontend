<template>
  <button :class="buttonClasses" :disabled="disabled">
    <Icon
      v-if="icon && iconPosition != 'right'"
      :name="icon"
      :size="iconSize || '1.5rem'"
      :class="iconClass"
    />
    <slot />
    <Icon
      v-if="icon && iconPosition == 'right'"
      :name="icon"
      :size="iconSize || '1.5rem'"
      :class="iconClass"
    />
  </button>
</template>

<script lang="ts" setup>
const { icon, href, disabled } = defineProps<{
  icon?: string;
  iconSize?: string;
  iconPosition?: "left" | "right";
  iconClass?: string;
  href?: string;
  disabled?: boolean;
}>();

const buttonClasses = computed(() => {
  const baseClasses =
    "inline-flex items-center gap-2 rounded-lg px-4 py-2 transition-all duration-200";

  const disabledClasses = "cursor-not-allowed opacity-50";

  return [baseClasses, disabled ? disabledClasses : ""];
});
</script>

<style></style>

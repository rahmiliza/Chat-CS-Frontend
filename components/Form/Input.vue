<template>
  <div class="flex flex-col gap-1">
    <label
      v-if="label"
      :for="id"
      class="text-sm font-medium text-gray-500 dark:text-gray-300"
    >
      {{ label }}
    </label>

    <input
      :id="id"
      :type="type"
      :value="modelValue"
      @input="
        $emit('update:modelValue', ($event.target as HTMLInputElement).value)
      "
      :placeholder="placeholder"
      :disabled="disabled"
      :class="[
        'w-full rounded-lg border px-3 py-2 outline-none transition-colors',
        'focus:border-primary focus:ring-primary focus:ring-1',
        error
          ? 'border-red-500 dark:border-red-400'
          : 'border-gray-300 dark:border-gray-600',
        disabled && 'cursor-not-allowed opacity-50',
        'dark:bg-gray-800 dark:text-white',
      ]"
      :min="min"
      :max="max"
    />

    <span v-if="error" class="text-xs text-red-500 dark:text-red-400">
      {{ error }}
    </span>
  </div>
</template>

<script lang="ts" setup>
defineProps<{
  modelValue: string | number;
  label?: string;
  placeholder?: string;
  type?: "text" | "email" | "password" | "number";
  error?: string;
  disabled?: boolean;
  id?: string;
  min?: string | number;
  max?: string | number;
}>();

defineEmits<{
  "update:modelValue": [value: string];
}>();
</script>

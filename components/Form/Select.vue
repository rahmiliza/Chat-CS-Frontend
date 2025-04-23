<template>
  <div class="flex flex-col gap-1">
    <!-- Label -->
    <label
      v-if="label"
      :for="id"
      class="text-sm font-medium text-gray-500 dark:text-gray-300"
    >
      {{ label }}
    </label>

    <!-- Select Dropdown -->
    <select
      :id="id"
      :value="modelValue"
      @change="$emit('update:modelValue', ($event.target as HTMLSelectElement).value)"
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
    >
      <option v-if="placeholder" value="" disabled selected>
        {{ placeholder }}
      </option>
      <option
        v-for="(option, index) in options"
        :key="index"
        :value="option.value"
      >
        {{ option.label }}
      </option>
    </select>

    <!-- Error Message -->
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
  error?: string;
  disabled?: boolean;
  id?: string;
  options: { value: string | number; label: string }[];
}>();

defineEmits<{
  "update:modelValue": [value: string];
}>();
</script>

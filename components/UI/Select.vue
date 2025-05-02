<template>
  <div class="relative w-full">
    <input v-model="searchQuery" type="text" :placeholder="selectedOptionLabel || placeholder"
      class="w-full h-[30px] px-3 py-1 rounded-md border border-slate-400 hover:border-red-200 active:border-red-500 focus:border-red-400 focus:outline-none cursor-pointer flex justify-between items-center"
      :class="!modelValue ? 'placeholder-slate-400' : 'placeholder-black'" @focus="showDropdown = true"
      @blur="hideDropdown" />
    <Icon v-if="modelValue" name="hugeicons:cancel-01"
      class="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-red-500 cursor-pointer"
      @mousedown.prevent="clearSelection" />
    <Icon v-else name="hugeicons:arrow-down-01" class="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
    <div v-if="showDropdown" class="absolute w-full mt-1 bg-white border border-slate-400 rounded-md top-7.5 z-50">
      <div class="max-h-[120px] overflow-y-auto py-1">
        <div v-if="filteredOptions.length === 0" class="px-3 py-1 text-sm text-center text-gray-500">No items</div>
        <div v-for="option in filteredOptions" :key="option.value" class="mx-1 px-3 py-1" :class="[
          option.value === modelValue ? 'bg-red-200/50' : 'hover:bg-slate-200/50',
          option.disabled ? 'hover:cursor-not-allowed text-gray-400' : 'cursor-pointer',
        ]" @mousedown.prevent="!option.disabled && selectOption(option)">
          {{ option.label }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

interface Option {
  value: string
  label: string
  disabled?: boolean
}

interface Props {
  placeholder?: string
  options?: Option[]
  modelValue: string | number
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: '',
})

const emit = defineEmits(['update:modelValue'])

const showDropdown = ref(false)
const searchQuery = ref('')

const hideDropdown = () => {
  setTimeout(() => {
    showDropdown.value = false
  }, 200)
}

const selectOption = (option: Option) => {
  emit('update:modelValue', option.value)
  searchQuery.value = ''
  showDropdown.value = false
}

const clearSelection = () => {
  emit('update:modelValue', '')
  searchQuery.value = ''
  showDropdown.value = false
}

const selectedOptionLabel = computed(() => {
  const selectedOption = props.options?.find((option) => option.value === props.modelValue)
  return selectedOption ? selectedOption.label : ''
})

const filteredOptions = computed<Option[]>(() => {
  return (props.options ?? []).filter((option) => option.label.toLowerCase().includes(searchQuery.value.toLowerCase()))
})
</script>

<style scoped></style>

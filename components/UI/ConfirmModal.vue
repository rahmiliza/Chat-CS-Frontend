<template>
  <transition name="fade">
    <div v-if="modelValue" class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div class="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full">
        <h2 class="text-lg font-semibold mb-2 text-gray-800">{{ title }}</h2>
        <p class="mb-4 text-gray-800">{{ message }}</p>
        <div class="flex justify-end space-x-4">
          <button @click="cancel" class="px-4 py-2 bg-yellow-500 rounded-lg hover:bg-red-500 capitalize">{{ $t('cancel') }}</button>
          <button @click="confirm" class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-red-600 capitalize">{{ $t('yes') }}</button>
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup>
defineProps({
  modelValue: Boolean,
  title: {
    type: String,
    default: 'Confirmation'
  },
  message: {
    type: String,
    default: 'Are you sure?'
  }

})

const emit = defineEmits(['update:modelValue', 'confirm', 'cancel'])

const confirm = () => {
  emit('confirm')
  emit('update:modelValue', false)
}

const cancel = () => {
  emit('cancel')
  emit('update:modelValue', false)
}
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>

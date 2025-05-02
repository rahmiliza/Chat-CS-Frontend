<template>
  <div
    class="flex group items-center gap-2 border border-gray-200 rounded-md bg-white hover:border-red-400 focus-within:!border-red-600 overflow-hidden disabled:opacity-80 disabled:pointer-events-none">
    <Icon name="uil:search" class="text-2xl ml-2 text-gray-600 group-hover:text-gray-800 px-2 py-2 cursor-pointer" @click="submit" />
    <input v-model="state" type="text" :placeholder="placeholder"
      class="px-2 py-[0.43rem] outline-none max-w-[120px] placeholder:select-none" :disabled="disabled" @keypress.enter="submit" />
    <Icon name="uil:multiply" class="me-2 text-gray-400 hover:text-red-600 cursor-pointer px-2"
      :class="state === '' ? 'opacity-0 pointer-events-none' : 'opacity-100'" @click="clear" />
  </div>
</template>

<script setup lang="ts">
interface Props {
  initial?: string
  disabled?: boolean
  placeholder?: string
}

const props = withDefaults(defineProps<Props>(), {
  initial: '',
  disabled: false,
  placeholder: 'Search',
})

const emit = defineEmits<{
  (event: 'submit', query: string): void
}>()

const state = ref(props.initial)

const clear = () => {
  if (props.disabled) {
    return
  }

  state.value = ''
  submit()
}

const submit = () => {
  if (props.disabled) {
    return
  }

  emit('submit', state.value)
}
</script>

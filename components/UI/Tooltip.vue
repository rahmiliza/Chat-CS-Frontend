<template>
  <div class="relative flex" @mouseover="showTooltip" @mouseleave="hideTooltip">
    <slot></slot>
    <div v-if="isTooltipVisible" :class="tooltipClasses" class="z-50 min-w-[120px] max-w-[400px] w-max">
      <template v-if="tooltipText">
        {{ props.tooltipText }}
      </template>
      <template v-else>
        <slot name="tooltip-content"></slot>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps({
  direction: {
    type: String,
    default: 'top',
  },
  tooltipText: {
    type: String,
  },
})

const isTooltipVisible = ref(false)

const tooltipClasses = computed(() => {
  let positionClass = ''
  switch (props.direction) {
    case 'top':
      positionClass = 'bottom-full mb-2'
      break
    case 'bottom':
      positionClass = 'top-full mt-2'
      break
    case 'left':
      positionClass = 'right-full top-1/2 transform -translate-y-1/2 mr-2'
      break
    case 'right':
      positionClass = 'left-full top-1/2 transform -translate-y-1/2 ml-2'
      break
    case 'bottom-left':
      positionClass = 'top-full mt-2 left-0'
      break
    case 'bottom-right':
      positionClass = 'top-full mt-2 right-0'
      break
    case 'top-left':
      positionClass = 'bottom-full mb-2 left-0'
      break
    case 'top-right':
      positionClass = 'bottom-full mb-2 right-0'
      break
  }
  return `absolute bg-white text-slate-600 rounded py-1 px-2 shadow-lg border border-slate-200 ${positionClass}`
})

function showTooltip() {
  isTooltipVisible.value = true
}

function hideTooltip() {
  isTooltipVisible.value = false
}
</script>

<style scoped></style>

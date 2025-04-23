<template>
  <div ref="dropdown" class="relative">
    <UiButton :icon="'mdi:chevron-down'" :icon-position="'right'" :variant="'secondary'" :type="'outline'"
      class="flex items-center justify-between gap-2 !px-2 !py-1" @click="toggleDropdown">
      <slot name="button">Action</slot>
    </UiButton>
    <teleport to="body">
      <transition name="fade" @before-enter="beforeEnter" @enter="onEnter" @leave="onLeave">
        <div v-if="isOpen" ref="menu" class="absolute min-w-48 bg-white shadow-xl rounded-md z-10 border"
          :style="dropdownStyles">
          <ul>
            <li v-for="item in items" :key="item.text">
              <a href="#" class="block px-4 py-2 text-gray-800 hover:bg-gray-200" @click="item.action">
                {{ item.text }}
              </a>
            </li>
          </ul>
        </div>
      </transition>
    </teleport>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, watch, nextTick } from 'vue'

const isOpen = ref(false)
const dropdown = ref(null)
const menu = ref(null)
const dropdownStyles = ref({ top: '0px', left: '0px' })

const _props = defineProps({
  items: {
    type: Array,
    required: true,
  }
})

const toggleDropdown = () => {
  isOpen.value = !isOpen.value
}

const closeDropdown = () => {
  isOpen.value = false
}
const calculatePosition = () => {
  if (dropdown.value && menu.value) {
    const rect = dropdown.value.getBoundingClientRect();
    const menuRect = menu.value.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    const viewportWidth = window.innerWidth;

    let top = rect.bottom + window.scrollY;
    let left = rect.left + window.scrollX;

    const spaceBelow = viewportHeight - rect.bottom;
    const spaceAbove = rect.top;

    if (spaceBelow >= menuRect.height) {
      top = rect.bottom + window.scrollY;
    } else if (spaceAbove >= menuRect.height) {
      top = rect.top + window.scrollY - menuRect.height;
    } else {
      top = rect.top + window.scrollY;
    }

    if (left + menuRect.width > viewportWidth + window.scrollX) {
      left = rect.right + window.scrollX - menuRect.width;
    }

    dropdownStyles.value = { top: `${top}px`, left: `${left}px` };
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
  window.addEventListener('resize', calculatePosition)
  window.addEventListener('scroll', calculatePosition)

  nextTick(() => {
    if (isOpen.value) {
      calculatePosition()
    }
  })
})

onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside)
  window.removeEventListener('resize', calculatePosition)
  window.removeEventListener('scroll', calculatePosition)
})

const handleClickOutside = (event) => {
  if (dropdown.value && !dropdown.value.contains(event.target)) {
    closeDropdown()
  }
}

watch(isOpen, (newVal) => {
  if (newVal) {
    nextTick(() => calculatePosition())
  }
})

const beforeEnter = () => {
  dropdownStyles.value = { ...dropdownStyles.value, opacity: 0 }
}

const onEnter = () => {
  dropdownStyles.value = { ...dropdownStyles.value, opacity: 1, transition: 'opacity 0.3s ease, top 0.3s ease, left 0.3s ease' }
}

const onLeave = () => {
  dropdownStyles.value = { ...dropdownStyles.value, opacity: 0, transition: 'opacity 0.3s ease' }
}
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter,
.fade-leave-to {
  opacity: 0;
}
</style>

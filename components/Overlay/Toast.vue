<template>
  <div
    class="min-w-64 rounded-lg bg-white p-2 shadow-md dark:border dark:border-gray-700 dark:bg-gray-900"
  >
    <!-- Title -->
    <div class="flex items-center justify-between" v-if="notification.title">
      <div class="inline-flex items-center gap-2">
        <div
          class="h-2 w-2 rounded-full ml-1"
          :class="{ [elementColor]: true }"
        ></div>
        <span class="font-bold">{{ notification.title }}</span>
      </div>
      <button @click="toast.remove(notification.id)">
        <Icon name="uil:times" size="1rem" />
      </button>
    </div>
    <!-- Message -->
    <div class="flex items-center justify-between">
      <span class="text-sm">{{ notification.message }}</span>
      <button @click="toast.remove(notification.id)" v-if="!notification.title">
        <Icon name="uil:times" size="1rem" />
      </button>
    </div>
    <div class="w-full mt-2">
      <div
        class="h-1 rounded-full"
        :class="{ [elementColor]: true }"
        :style="{ width: `${(remainingTime / displayTime) * 100}%` }"
      ></div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import type { Notification } from "~/types/notification";
const toast = useToast();
const props = defineProps<{
  notification: Notification;
}>();

const displayTime = ref(2000); // Display this component for 2 seconds
const remainingTime = ref(displayTime.value); // By default, display this component for 2 seconds

onMounted(() => {
  if (!props.notification.persist) {
    const timer = setInterval(() => {
      remainingTime.value -= 10;
      if (remainingTime.value <= 0) {
        clearInterval(timer);
        toast.remove(props.notification.id);
      }
    }, 10);
  }
});

const elementColor = computed(() => {
  switch (props.notification.type) {
    case "success":
      return "bg-green-500";
    case "error":
      return "bg-red-500";
    case "warning":
      return "bg-yellow-500";
    case "info":
      return "bg-blue-500";
    default:
      return "bg-primary";
  }
});

onUnmounted(() => {
  remainingTime.value = 0;
});
</script>

<style></style>

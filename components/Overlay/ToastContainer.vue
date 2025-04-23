<template>
  <Teleport to="body">
    <div class="fixed flex-row space-y-2 p-2 dark:text-gray-50 z-40" :class="notificationPosition"
      v-if="notifications.length">
      <OverlayToast v-for="notification in notifications" :key="notification.id" :notification="notification" />
    </div>
  </Teleport>
</template>

<script lang="ts" setup>
import type { Notification } from "~/types/notification";
const notifications = useState<Notification[]>("notifications", () => []);

const notificationPosition = computed(() => {
  if (notifications.value.length > 0) {
    switch (notifications.value[0]?.position) {
      case "center":
        return "top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2";
      case "topleft":
        return "top-4 left-4";
      case "bottomleft":
        return "bottom-4 left-4";
      case "topright":
        return "top-4 right-4";
      case "bottomright":
        return "bottom-4 right-4";
      default:
        return "top-4 right-4";
    }
  }
});

</script>

<style></style>

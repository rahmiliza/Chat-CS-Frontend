<template>
  <div class="w-96 h-full border-r border-slate-300/50">
    <div class="h-full mt-4 pr-4 overflow-y-auto">
      <template v-if="listChatRoom?.length > 0">
        <template v-for="chatRoomData in listChatRoom" :key="chatRoomData?.id">
          <ChatUnassignedRoomInfo :chat-room-data="chatRoomData" :active-chat-data="activeChatData"
            @update-active-chat="$emit('update-active-chat', $event)"
            @update-active-chat-details="$emit('updateActiveChatDetails', $event)" />
        </template>
      </template>
      <template v-else>
        <div class="flex justify-center items-center h-full text-gray-400">No Chat History</div>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">

import type { ChatRoom, AdminChatQueueExtended, AdminChatQueue } from '~/models/chat'
import PermissionGuard from '../PermissionGuard.vue'

interface Props {
  listChatRoom: ChatRoom[]
  activeChatData?: ChatRoom | null
  adminChatQueue?: AdminChatQueue | null
}

const props = withDefaults(defineProps<Props>(), {})

const emits = defineEmits([
  'update-active-chat',
  'updateChatListLoading',
  'updateAdminChatQueue',
  'toggleGlobalLoading',
  'updateChatListData',
  'updateActiveChatDetails',
])

</script>

<style scoped></style>

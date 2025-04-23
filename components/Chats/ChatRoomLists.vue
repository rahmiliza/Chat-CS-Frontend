<template>
  <div class="w-96 h-full border-r border-slate-300/50">
    <div class="h-[calc(100%-56px)] mt-1 pr-2 overflow-y-auto">
      <template v-if="listChatRoom?.length > 0">
        <template v-for="chatRoomData in listChatRoom" :key="chatRoomData?.id">
          <ChatsChatRoomInfo :chat-room-data="chatRoomData" :active-chat-data="activeChatData"
            @update-active-chat="$emit('update-active-chat', $event)"
            @update-active-chat-details="$emit('updateActiveChatDetails', $event)" />
        </template>
      </template>
      <template v-else>
        <div class="flex justify-center items-center h-full text-xl">No Chat</div>
      </template>
    </div>
  </div>
</template>
<script lang="ts" setup>
import { ChatsChatRoomInfo } from '#components';
import type { ChatRoom } from '~/models/chat';


interface Props {
  listChatRoom: ChatRoom[]
  activeChatData?: ChatRoom | null
  // adminChatQueue?: AdminChatQueue | null
}

const props = withDefaults(defineProps<Props>(), {})

console.log(props)
</script>
<style lang="css" scoped></style>
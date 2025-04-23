<template>
  <div
    class="relative w-full flex items-center border border-white gap-4 p-2 duration-300 rounded-lg hover:cursor-pointer hover:bg-red-300/50"
    :class="[activeChatData?.id === chatRoomData?.id ? 'bg-red-200/50 !border-red-300' : '']" @click="selectChatRoom">
    <div class="flex w-12 h-12 aspect-square items-center justify-center rounded-full bg-red-300 dark:bg-gray-700 uppercase">
      <span>{{ chatRoomData?.participant[getOtherParticipantIndex()]?.display_name[0] }}</span>
    </div>
    <div class="w-full overflow-hidden">
      <template v-if="chatRoomData?.participant && chatRoomData.participant.length > 2">
        <div class="w-full truncate font-bold">
          {{
            chatRoomData?.participant
              .filter((p) => p.display_name !== user?.name)
              .map((p) => p.display_name)
              .join(', ')
          }}
        </div>
      </template>
      <div v-else class="w-full truncate font-bold text-gray-600 flex items-center gap-2">
        {{ chatRoomData?.participant[getOtherParticipantIndex()]?.display_name }}
      </div>
      <template v-if="chatRoomData?.last_message">
        <div class="w-full truncate text-sm">
          <div v-if="chatRoomData?.last_message?.message_type === 'TEXT'" class="text-slate-600">
            {{ chatRoomData?.last_message?.message }}
          </div>
          <div v-else class="flex gap-1 items-center text-slate-500">
            <fa-icon icon="image" />
            <div class="text-sm">Image</div>
          </div>
        </div>
        <div class="absolute top-2 right-2 text-[10px] text-slate-600">
          {{ formatDatetime(chatRoomData.created_at) }}
        </div>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">

import type { ChatRoom } from '~/models/chat'

interface Props {
  chatRoomData: ChatRoom
  activeChatData?: ChatRoom | null
}

const props = withDefaults(defineProps<Props>(), {})

const emits = defineEmits(['updateActiveChat', 'updateActiveChatDetails'])

const { user } = useAuthStore()

function selectChatRoom() {
  emits('updateActiveChatDetails', null)
  emits('updateActiveChat', props.chatRoomData)
}

function getOtherParticipantIndex() {
  const otherParticipantIndex = props.chatRoomData?.participant?.findIndex((item) => item?.user_id !== user?.id)

  if (otherParticipantIndex > -1) return otherParticipantIndex

  return 0
}

function getRoleIcon(userId: string) {
  if (userId.startsWith('drivers:')) {
    return 'moped'
  } else if (userId.startsWith('merchants:')) {
    return 'store'
  } else {
    return 'user-shield'
  }
}

getOtherParticipantIndex()
</script>

<style scoped></style>

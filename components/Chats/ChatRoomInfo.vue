<template>
  <div
    class="relative w-full mb-1 flex items-center gap-4 px-2 pt-3 pb-4 rounded-lg hover:cursor-pointer hover:bg-blue-300/50"
    :class="[activeChatData?.id === chatRoomData?.id ? 'bg-blue-200/50' : '']"
    @click="selectChatRoom"
  >
    <div class="w-16 h-16 aspect-square">
      <img
        :src="chatRoomData?.participant[getOtherParticipantIndex()]?.image_url"
        alt="A"
        class="rounded-full bg-blue-300 w-full h-full object-cover"
      />
    </div>
    <div class="w-full overflow-hidden">
      <template v-if="chatRoomData?.participant && chatRoomData.participant.length > 2">
        <div class="w-full truncate font-bold">
          {{
            chatRoomData?.participant
              .filter((p: Participant) => p.display_name !== user?.name)
              .map((p: Participant) => p.display_name)
              .join(', ')
          }}
        </div>
      </template>
      <div v-else class="w-full truncate font-bold flex items-center gap-2">
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
        <div class="absolute top-2 right-2 text-xs text-slate-600">
          {{ formatDatetime(chatRoomData.created_at) }}
        </div>
        <div
          class="absolute bottom-1 right-2 text-xs border rounded-lg px-2 py-0.5 bg-white font-bold capitalize"
          :class="chatRoomData?.closed_at ? 'border-red-700 text-red-600' : 'border-green-700 text-green-600'"
        >
          {{ chatRoomData?.closed_at ? $t('closed') : $t('active') }}
        </div>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Participant, ChatRoom } from '~/models/chat';


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

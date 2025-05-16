<template>
  <div
    class="relative w-full flex items-center border border-white gap-4 p-2 duration-300 rounded-lg hover:cursor-pointer hover:bg-blue-300/50"
    :class="[activeChatData?.id === chatRoomData?.id ? 'bg-blue-200/50 !border-blue-300' : '']" @click="selectChatRoom">
    <div
      class="flex w-12 h-12 aspect-square items-center justify-center rounded-full bg-blue-300 dark:bg-blue-300 uppercase">
      <span>{{ chatRoomData?.participant?.[getOtherParticipantIndex()]?.display_name?.[0] }}</span>
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
      <div v-else class="w-full truncate font-semibold flex items-center gap-2">
        <Icon :name="getRoleIcon(chatRoomData?.participant?.[getOtherParticipantIndex()]?.user_id)"
          class="text-sm text-slate-500" />
        {{ chatRoomData?.participant?.[getOtherParticipantIndex()]?.display_name }}
      </div>
      <template v-if="chatRoomData?.last_message">
        <div class="w-full truncate text-sm">
          <div v-if="chatRoomData?.last_message?.message_type === 'TEXT'" class="text-slate-600">
            {{ chatRoomData?.last_message?.message }}
          </div>
          <div v-else class="flex gap-1 items-center text-slate-500">
            <Icon name="hugeicons:image-03" />
            <div class="text-sm">Image</div>
          </div>
        </div>
        <div class="absolute top-2 right-2 text-[10px] text-slate-600">
          {{ formatDatetime(chatRoomData.created_at) }}
        </div>
        <div v-if="chatRoomData?.closed_at" class="absolute bottom-2 right-2 capitalize text-green-600">
          <UITooltip :tooltip-text="chatRoomData?.closed_at ? $t('closed') : $t('active')" direction="bottom-right">
            <Icon name="hugeicons:toggle-on" />
            <!-- {{ chatRoomData?.closed_at ? $t('closed') : $t('active') }} -->
          </UITooltip>
        </div>
        <div v-else class="absolute bottom-2 right-2 capitalize text-red-600">
          <UITooltip :tooltip-text="chatRoomData?.closed_at ? $t('closed') : $t('active')" direction="bottom-right">
            <Icon name="hugeicons:toggle-off" />
            <!-- {{ chatRoomData?.closed_at ? $t('closed') : $t('active') }} -->
          </UITooltip>
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
  if (userId?.startsWith('customers:')) {
    return 'hugeicons:shopping-cart-02'
  } else if (userId?.startsWith('merchants:')) {
    return 'store'
  } else {
    return 'hugeicons:shield-user'
  }
}

getOtherParticipantIndex()
console.log(props.chatRoomData?.participant.length)
</script>

<style scoped></style>

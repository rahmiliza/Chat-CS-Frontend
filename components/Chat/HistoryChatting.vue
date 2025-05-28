<template>
  <div class="flex flex-col grow relative h-full" v-if="activeChatDetails?.chat_room?.status !== 'CLOSED'">
    <template v-if="chattingContainerLoading">
      <LoadingIndicator />
    </template>

    <div class=" w-full flex justify-between items-center border-b border-slate-300/50 px-2 py-3 bg-blue-400/20">
      <div class="w-full text font-semibold truncate ml-2 text-gray-800">

        <template v-if="activeChatData?.participant && activeChatData.participant.length > 2">
          {{
            activeChatData?.participant
              .filter((p) => p.display_name !== user?.name)
              .map((p) => p.display_name)
              .join(', ')
          }}
        </template>
        <template v-else class="text-black">
          {{ activeChatData?.participant[getOtherParticipantIndex()]?.display_name }}
        </template>
      </div>
      <div class="flex gap-2">
      </div>
    </div>
    <div class="w-full flex flex-col flex-1 h-[calc(100%-87px)]">
      <div ref="chatList" v-scroll="onScroll"
        class="h-full w-full bg-blue-50/20 overflow-y-auto flex flex-col-reverse p-4 gap-2">
        <template v-for="chat in activeChatDetails?.chats" :key="chat?.id">
          <ChatBubble :chat="chat" :active-chat-details="activeChatDetails" />
        </template>
      </div>
    </div>
  </div>



</template>

<script setup lang="ts">

import { vScroll } from '@vueuse/components'
import type { UseScrollReturn } from '@vueuse/core'



import type {
  ChatRoom,
  ChatRoomDetails,
  Chat,
} from '~/models/chat'
import type { PaginationResponse } from '~/models/response'

interface Props {
  activeChatData?: ChatRoom | null
  activeChatDetails: ChatRoomDetails
  activeChatDetailsPagination?: PaginationResponse
  listChatRoom?: ChatRoom[]
  chattingContainerLoading: boolean
}

const props = withDefaults(defineProps<Props>(), {})

const emits = defineEmits([
  'updateChattingContainerLoading',
  'updateActiveChatDetails',
  'triggerFetchChatRoomDetails',
  'updateActiveChat',
  'updateChatListData',
  'toggleGlobalLoading',
])

const { user } = useAuthStore();

const {
  public: { socketUrl },
} = useRuntimeConfig()


const chatList = ref<HTMLElement | null>(null)
const fileInput = ref<HTMLInputElement | null>(null)



let debounceTimeout: ReturnType<typeof setTimeout> | null = null

function onScroll(state: UseScrollReturn) {
  if (debounceTimeout) {
    clearTimeout(debounceTimeout)
  }

  debounceTimeout = setTimeout(() => {
    const { arrivedState } = state
    const { top } = arrivedState

    if (top && props?.activeChatDetailsPagination?.next_page_cursor) {
      emits('triggerFetchChatRoomDetails')
    }
  }, 200) // Adjust the debounce delay as needed
}

function triggerFileInputClick() {
  fileInput.value?.click()
}


function emitLoading(isLoading: boolean) {
  emits('updateChattingContainerLoading', isLoading)
}

function getOtherParticipantIndex() {
  if (!props.activeChatData) return 0

  const otherParticipantIndex = props?.activeChatData?.participant?.findIndex((item) => item?.user_id !== user?.id)

  if (otherParticipantIndex > -1) return otherParticipantIndex

  return 0
}


</script>

<style scoped></style>
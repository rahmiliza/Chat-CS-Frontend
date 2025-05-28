<template>
  <div class="flex flex-col grow relative h-full">
    <template v-if="chattingContainerLoading">
      <LoadingIndicator />
    </template>

    <div class=" w-full flex justify-between items-center border-b border-slate-300/50 px-2 py-1.5">
      <div class="w-full text-lg font-bold truncate ml-2 text-black">
        <template v-if="activeChatData?.participant && activeChatData.participant.length > 2">
          {{
            activeChatData?.participant
              .filter((p) => p.display_name !== user?.name)
              .map((p) => p.display_name)
              .join(', ')
          }}
        </template>
        <template v-else class="text-black">
          <div class="text-xs font-normal text-gray-400">Customer</div>
          <div>{{ activeChatData?.participant?.[getOtherParticipantIndex()]?.display_name }}</div>

        </template>
      </div>

      <div class="flex items-center gap-2">
        <!-- <DPermissionGuard v-if="!activeChatData?.closed_at" permission="chat_room::add_participant"> -->
        <UITooltip tooltip-text="Accept Chat" direction="bottom-right">
          <Icon name="hugeicons:checkmark-badge-01"
            class="ml-auto font-bold p-2 rounded-lg text-2xl text-red-500 hover:cursor-pointer hover:brightness-110 active:brightness-90 hover:bg-red-700"
            @click="handleAssigned" />
        </UITooltip>
        <!-- </DPermissionGuard> -->
        <UITooltip tooltip-text="Minimize Chat" direction="bottom-right">
          <Icon name="hugeicons:cancel-01"
            class="font-bold p-2 rounded-lg text-2xl text-red-500 hover:cursor-pointer hover:brightness-110 active:brightness-90 hover:bg-red-700"
            @click="
              () => {
                emits('updateActiveChat', null)
              }
            " />
        </UITooltip>
      </div>
    </div>
    <div class="w-full flex flex-col flex-1 h-[calc(100%-50px)]">
      <div ref="chatList" v-scroll="onScroll" class="h-full w-full overflow-y-auto flex flex-col p-4 gap-2">
        <template v-for="chat in activeChatDetails?.chats" :key="chat?.id">
          <ChatUnassignedBubble :chat="chat" :active-chat-details="activeChatDetails" />
        </template>
      </div>
    </div>
  </div>
  

  <UIConfirmModal v-model="showConfirm" class="text-lg font-bold" title="Chat Acceptance Confirmation" message="Will you accept this Chat Room?"
    @confirm="handleAssignedChatRoom"/>
</template>

<script setup lang="ts">

import { io } from 'socket.io-client'

import { vScroll } from '@vueuse/components'
import type { UseScrollReturn } from '@vueuse/core'
import type { PaginationResponse, Response, ResponseWithPagination } from '~/models/response'


import type {
  ChatRoom,
  ChatRoomDetails,
  Chat,
} from '~/models/chat'

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
const toast = useToast();
const showConfirm = ref(false)

const {
  public: { socketUrl },
} = useRuntimeConfig()
const socket = io(socketUrl)

const chatList = ref<HTMLElement | null>(null)
const message = ref()

const openModalAddNewParticipant = ref(false)


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


const handleAssigned = () => {
  if (props?.activeChatData?.closed_at) return

  showConfirm.value = true
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



async function handleAssignedChatRoom() {
  emitLoading(true)

  try {
    const { data, error } = await useApi<Response<ChatRoom>>('new/admin/chat-rooms/' + props?.activeChatData?.id + '/chat-participant', {
      method: 'POST',
      body: {
        room_id: props?.activeChatData?.id ?? '',
        users: [user],
      },
    })

    if (data.value?.ok) {
      toast.add({ message: 'Assigned chat successfully', type: "success" })

      const updatedList = props.listChatRoom?.filter(item => item?.id !== data.value?.data?.id)
      emits('updateChatListData', updatedList)
      emits('updateActiveChat', null)

      socket.emit('accept-admin-chat', data.value?.data, data.value?.data?.id, data.value?.data?.participant[getOtherParticipantIndex()]?.user_id ?? '');

    } else {
      const errMsg = error.value?.data?.message ?? 'Failed to add participant, please try again'
      toast.add({ message: errMsg, type: "error" })
    }
  } catch (e: any) {
    const errMsg = e?.value?.data?.message || 'Failed to add participant, please try again'
    toast.add({ message: errMsg, type: "error" })
  } finally {
    emitLoading(false)
    openModalAddNewParticipant.value = false
  }
}

</script>

<style scoped></style>

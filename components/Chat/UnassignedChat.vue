<template>
  <div class="w-full  h-[calc(100%-34px)]">
    <template v-if="unassignedChatRoomsStatus === 'pending' || globalLoading">
      <LoadingIndicator />
    </template>
    <div class="w-full h-full flex bg-white overflow-hidden min-w-[800px]">
      <ChatUnassignedRoomList :list-chat-room="unassignedListChatRoom" :active-chat-data="activeUnassignedChatData"
        :admin-chat-queue="adminChatQueue" @update-chat-list-loading="toggleChatListLoading"
        @update-active-chat="handleSetActiveChatData" @toggle-global-loading="toggleGlobalLoading"
        @update-chat-list-data="updateChatListData" @update-active-chat-details="updateActiveChatDetails" />
      <template v-if="activeUnassignedChatData && activeUnassignedChatDetails">
        <ChatUnassignedDetail :active-chat-data="activeUnassignedChatData"
          :active-chat-details="activeUnassignedChatDetails" :chatting-container-loading="chattingContainerLoading"
          :active-chat-details-pagination="activeUnassignedChatDetailsPagination"
          :list-chat-room="unassignedListChatRoom" @update-active-chat="handleSetActiveChatData"
          @update-active-chat-details="updateActiveChatDetails"
          @update-chatting-container-loading="toggleChattingContainerLoading"
          @update-chat-list-data="updateChatListData" @toggle-global-loading="toggleGlobalLoading"
          @trigger-fetch-chat-room-details="triggerFetchChatRoomDetails" />
      </template>
      <template v-else>
        <!-- <pages-manage-customer-chat-queue-counter :admin-chat-queue="adminChatQueue" /> -->
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { io } from 'socket.io-client'
import type { AdminChatQueue, Chat, ChatQueue, ChatRoom, ChatRoomDetails } from '~/models/chat'
import type { Response, ResponseWithPagination } from '~/models/response'

const { user } = useAuthStore();
const toast = useToast();

const {
  public: { socketUrl },
} = useRuntimeConfig()
const socket = io(socketUrl)

const globalLoading = ref(false)
const chattingContainerLoading = ref(false)
const listChatLoading = ref(false)

const unassignedListChatRoom = ref<ChatRoom[]>([])
const adminChatQueue = ref<AdminChatQueue>()

const activeUnassignedChatData = ref<ChatRoom | null>()
const activeUnassignedChatDetails = ref<ChatRoomDetails>()
const activeUnassignedChatDetailsPagination = ref()

const { data: unassignedChatRooms, status: unassignedChatRoomsStatus } = await useAsyncData('unassignedChatRooms', () =>
  useApi<Response<ChatRoom[]>>('new/admin/chat-rooms/?unassigned=true', {
    method: 'GET',
  }).then((res) => res.data.value?.data)
)

watchEffect(async () => {
  if (Array.isArray(unassignedChatRooms.value)) {
    unassignedListChatRoom.value = [...unassignedChatRooms.value].sort(sortChatRoom)
  }
})
function sortChatRoom(a: ChatRoom, b: ChatRoom) {
  return b?.last_message?.created_at - a?.last_message?.created_at
}

function toggleGlobalLoading(loadingValue: boolean) {
  globalLoading.value = loadingValue
}

function toggleChatListLoading(loadingValue: boolean) {
  listChatLoading.value = loadingValue
}

function toggleChattingContainerLoading(loadingValue: boolean) {
  chattingContainerLoading.value = loadingValue
}

function handleSetActiveChatData(chatRoomData: ChatRoom) {
  if (chatRoomData == null) {
    activeUnassignedChatData.value = null
    return
  }

  activeUnassignedChatData.value = { ...chatRoomData }
  fetchChatRoomDetails()
}

function updateActiveChatDetails(newChatDetails: ChatRoomDetails) {
  activeUnassignedChatDetails.value = { ...newChatDetails }
}

function updateChatListData(newChatListData: ChatRoom[]) {
  unassignedListChatRoom.value = [...newChatListData]
}

function triggerFetchChatRoomDetails() {
  fetchChatRoomDetails(activeUnassignedChatDetailsPagination.value?.next_page_cursor || '')
}

async function fetchChatRoomDetails(nextCursor: string = '') {
  if (activeUnassignedChatData.value == null) return

  chattingContainerLoading.value = true

  try {
    const { data, error } = await useApi<ResponseWithPagination>(
      `/new/admin/chat-rooms/${activeUnassignedChatData.value?.id}/chats`,
      { method: 'GET' }
    )
    if (data.value?.data) {
      if (nextCursor) {
        activeUnassignedChatDetails.value?.chats.push(...data.value?.data)
      } else {
        activeUnassignedChatDetails.value = { chat_room: activeUnassignedChatData.value, chats: data.value?.data }
      }

      activeUnassignedChatDetailsPagination.value = data.value?.pagination
    } else {
      const errMsg = error.value?.data?.message ?? 'An Error was Accrued, Please try again'
      toast.add({ message: errMsg, type: "error" })
    }
  } catch (e: any) {
    const errMsg = e?.value?.data?.message || 'An Error was Accrued, Please try again'
    toast.add({ message: errMsg, type: "error" })
  } finally {
    chattingContainerLoading.value = false
  }
}


watch(activeUnassignedChatData, (_) => {
  socket.off('receive-message')

  socket.emit('join-room', user?.id)

  if (activeUnassignedChatData.value) {
    socket.emit('join-room', activeUnassignedChatData.value?.id)
  }

  socket.on('receive-message', (lastMessage: Chat) => {
    if (activeUnassignedChatDetails.value?.chat_room?.id !== lastMessage?.chat_room_id) return

    activeUnassignedChatDetails.value?.chats?.splice(0, 0, lastMessage)

    const lastMessageIndexRoom = unassignedListChatRoom.value?.findIndex((item) => item?.id === lastMessage?.chat_room_id)

    if (lastMessageIndexRoom > -1 && unassignedListChatRoom.value[lastMessageIndexRoom]) {
      unassignedListChatRoom.value[lastMessageIndexRoom].last_message = { ...lastMessage }

      unassignedListChatRoom.value.sort((a, b) => {
        return b.last_message.created_at - a.last_message.created_at
      })
    }
  })
})

onMounted(() => {
  socket.on('connection', () => { })

  socket.emit('join-room', user?.id)

  socket.on('receive-new-message-queue', (newSubmittedMsgQueue: ChatQueue[] | string) => {
    if (adminChatQueue.value) {
      if (typeof newSubmittedMsgQueue === 'string') {
        adminChatQueue.value.queue = JSON.parse(newSubmittedMsgQueue)
      } else {
        adminChatQueue.value.queue = [...newSubmittedMsgQueue]
      }
    }
  })


  socket.on('last-message-room', (lastMessage: Chat) => {
    const lastMessageIndexRoom = unassignedListChatRoom.value?.findIndex((item) => item?.id === lastMessage?.chat_room_id)

    if (lastMessageIndexRoom > -1 && unassignedListChatRoom.value[lastMessageIndexRoom]) {
      unassignedListChatRoom.value[lastMessageIndexRoom].last_message = { ...lastMessage }

      unassignedListChatRoom.value.sort((a, b) => {
        return b.last_message.created_at - a.last_message.created_at
      })
    }
  })

  socket.on('unassigned-room', (chatRoom: ChatRoom) => {
    if (unassignedListChatRoom.value.findIndex((item) => item?.id === chatRoom?.id) < 0) {
      unassignedListChatRoom.value.push(chatRoom)
    } else {
      unassignedListChatRoom.value[unassignedListChatRoom.value.findIndex((item) => item?.id === chatRoom?.id)] = { ...chatRoom }
    }
  })
})

onUnmounted(() => {
  socket.off('receive-new-message-queue')
  socket.off('receive-message')
  socket.disconnect()
})

onBeforeMount(() => {
  // checkPermission('chat_room::index')
})
</script>

<style scoped></style>

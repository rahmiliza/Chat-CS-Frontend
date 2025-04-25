<template>
  <div class="w-full h-full">
    <template v-if="pendingChatRooms || globalLoading">
      <LoadingIndicator />
    </template>
    <div class="w-full h-full flex bg-white overflow-hidden min-w-[800px]">
      <ChatRoomList :list-chat-room="listChatRoom" :active-chat-data="activeChatData" :admin-chat-queue="adminChatQueue"
        @update-chat-list-loading="toggleChatListLoading" @update-active-chat="handleSetActiveChatData"
        @update-admin-chat-queue="updateAdminChatQueue" @toggle-global-loading="toggleGlobalLoading"
        @update-chat-list-data="updateChatListData" @update-active-chat-details="updateActiveChatDetails" />
      <template v-if="activeChatData && activeChatDetails">
        <ChatChatting :active-chat-data="activeChatData" :active-chat-details="activeChatDetails"
          :chatting-container-loading="chattingContainerLoading"
          :active-chat-details-pagination="activeChatDetailsPagination" :list-chat-room="listChatRoom"
          @update-active-chat="handleSetActiveChatData" @update-active-chat-details="updateActiveChatDetails"
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

const listChatRoom = ref<ChatRoom[]>([])
const adminChatQueue = ref<AdminChatQueue>()

const activeChatData = ref<ChatRoom | null>()
const activeChatDetails = ref<ChatRoomDetails>()
const activeChatDetailsPagination = ref()

const { data: chatRooms, pending: pendingChatRooms } = await useAsyncData('chatRooms', () =>
  useApi<Response<ChatRoom[]>>('/admin/chat-rooms', {
    method: 'GET',
  }).then((res) => res.data.value?.data)
)

watchEffect(() => {
  if (Array.isArray(chatRooms.value)) {
    listChatRoom.value = [...chatRooms.value].sort(sortChatRoom)
  }
})

function sortChatRoom(a: ChatRoom, b: ChatRoom) {
  if (a.status === 'ACTIVE' && b.status !== 'ACTIVE') return -1
  if (a.status !== 'ACTIVE' && b.status === 'ACTIVE') return 1
  return b.last_message.created_at - a.last_message.created_at
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
    activeChatData.value = null
    return
  }

  activeChatData.value = { ...chatRoomData }
  fetchChatRoomDetails()
}

function updateAdminChatQueue(newAdminChatQueue: AdminChatQueue) {
  adminChatQueue.value = { ...newAdminChatQueue }
}

function updateActiveChatDetails(newChatDetails: ChatRoomDetails) {
  activeChatDetails.value = { ...newChatDetails }
}

function updateChatListData(newChatListData: ChatRoom[]) {
  listChatRoom.value = [...newChatListData]
}

function triggerFetchChatRoomDetails() {
  fetchChatRoomDetails(activeChatDetailsPagination.value?.next_page_cursor || '')
}

async function fetchChatRoomDetails(nextCursor: string = '') {
  if (activeChatData.value == null) return

  chattingContainerLoading.value = true

  try {
    const { data, error } = await useApi<ResponseWithPagination>(
      `/admin/chat-rooms/${activeChatData.value?.id}/chats?offset=${nextCursor}&sortBy=created_at&order=DESC`,
      { method: 'GET' }
    )
    if (data.value?.data) {
      if (nextCursor) {
        activeChatDetails.value?.chats.push(...data.value?.data)
      } else {
        activeChatDetails.value = { chat_room: activeChatData.value, chats: data.value?.data }
      }
      console.log(nextCursor)
      console.log(activeChatDetails.value)

      activeChatDetailsPagination.value = data.value?.pagination
    } else {
      const errMsg = error.value?.data?.message ?? 'An Error was Accrued, Please try again1'
      toast.add({ message: errMsg, type: "error" })
    }
  } catch (e: any) {
    const errMsg = e?.value?.data?.message || 'An Error was Accrued, Please try again2'
    toast.add({ message: errMsg, type: "error" })
  } finally {
    chattingContainerLoading.value = false
  }
}

// const { data, pending } = await useApi<Response<ChatRoom[]>>('/admin/chat-rooms', {
//   method: 'GET',
// })


// const { data: adminChatQueueData, pending: adminChatQueuePending } = await useApi<Response<AdminChatQueue>>(
//   '/admin/chats/admin-queues',
//   {
//     method: 'GET',
//   }
// )

// watch(
//   [data, adminChatQueueData],
//   (_) => {
//     adminChatQueue.value = adminChatQueueData.value?.data
//     listChatRoom.value = data.value?.data ?? []
//     listChatRoom.value.sort((a, b) => {
//       if (a.status === 'ACTIVE' && b.status !== 'ACTIVE') {
//         return -1
//       } else if (a.status !== 'ACTIVE' && b.status === 'ACTIVE') {
//         return 1
//       } else {
//         return b.last_message.created_at - a.last_message.created_at
//       }
//     });
//     console.log(listChatRoom.value)
//   },
//   { immediate: true }
// )

watch(activeChatData, (_) => {
  socket.off('receive-message')

  socket.emit('join-room', user?.id)

  if (activeChatData.value) {
    socket.emit('join-room', activeChatData.value?.id)
  }

  socket.on('receive-message', (lastMessage: Chat) => {
    if (activeChatDetails.value?.chat_room?.id !== lastMessage?.chat_room_id) return

    activeChatDetails.value?.chats?.splice(0, 0, lastMessage)

    const lastMessageIndexRoom = listChatRoom.value?.findIndex((item) => item?.id === lastMessage?.chat_room_id)

    if (lastMessageIndexRoom > -1 && listChatRoom.value[lastMessageIndexRoom]) {
      listChatRoom.value[lastMessageIndexRoom].last_message = { ...lastMessage }

      // Sorting listChatRoom based on last_message.created_at and status
      listChatRoom.value.sort((a, b) => {
        if (a.status === 'ACTIVE' && b.status !== 'ACTIVE') {
          return -1
        } else if (a.status !== 'ACTIVE' && b.status === 'ACTIVE') {
          return 1
        } else {
          return b.last_message.created_at - a.last_message.created_at
        }
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

  socket.on('chat-room', (chatRoom: ChatRoom) => {
    if (listChatRoom.value.findIndex((item) => item?.id === chatRoom?.id) < 0) {
      listChatRoom.value.push(chatRoom)
    } else {
      listChatRoom.value[listChatRoom.value.findIndex((item) => item?.id === chatRoom?.id)] = { ...chatRoom }
    }

    // Sorting listChatRoom based on last_message.created_at and status
    listChatRoom.value.sort((a, b) => {
      if (a.status === 'ACTIVE' && b.status !== 'ACTIVE') {
        return -1
      } else if (a.status !== 'ACTIVE' && b.status === 'ACTIVE') {
        return 1
      } else {
        return b.last_message.created_at - a.last_message.created_at
      }
    })
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

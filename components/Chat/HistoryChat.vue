<template>
  <div class="w-full h-[calc(100%-34px)]">
    <template v-if="globalLoading">
      <LoadingIndicator />
    </template>
    <div class="w-full h-full flex bg-white overflow-hidden min-w-[800px]">
      <ChatHistoryRoomList :list-chat-room="listChatRoom" :active-chat-data="activeChatData"
        :admin-chat-queue="adminChatQueue" @update-chat-list-loading="toggleChatListLoading"
        @update-active-chat="handleSetActiveChatData" @update-admin-chat-queue="updateAdminChatQueue"
        @toggle-global-loading="toggleGlobalLoading" @update-chat-list-data="updateChatListData"
        @update-active-chat-details="updateActiveChatDetails" />
      <template v-if="activeChatData && activeChatDetails">
        <ChatHistoryChatting :active-chat-data="activeChatData" :active-chat-details="activeChatDetails"
          :chatting-container-loading="chattingContainerLoading"
          :active-chat-details-pagination="activeChatDetailsPagination" :list-chat-room="listChatRoom"
          @update-active-chat="handleSetActiveChatData" @update-active-chat-details="updateActiveChatDetails"
          @update-chatting-container-loading="toggleChattingContainerLoading"
          @update-chat-list-data="updateChatListData" @toggle-global-loading="toggleGlobalLoading"
          @trigger-fetch-chat-room-details="triggerFetchChatRoomDetails" />
      </template>
      <template v-else>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { AdminChatQueue, Chat, ChatQueue, ChatRoom, ChatRoomDetails } from '~/models/chat'
import type { Response, ResponseWithPagination } from '~/models/response'

const { user } = useAuthStore();
const toast = useToast();

const globalLoading = ref(false)
const chattingContainerLoading = ref(false)
const listChatLoading = ref(false)

const listChatRoom = ref<ChatRoom[]>([])
const adminChatQueue = ref<AdminChatQueue>()

const activeChatData = ref<ChatRoom | null>()
const activeChatDetails = ref<ChatRoomDetails>()
const activeChatDetailsPagination = ref()

const { data: chatRooms, pending: pendingChatRooms } = await useAsyncData('chatRooms', () =>
  useApi<Response<ChatRoom[]>>('/admin/chat-rooms/history', {
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


onMounted(() => {
})

onUnmounted(() => {
})

onBeforeMount(() => {
  // checkPermission('chat_room::index')
})
</script>

<style scoped></style>

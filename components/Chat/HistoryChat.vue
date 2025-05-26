<template>
  <div class="w-full h-[calc(100%-34px)]">
    <template v-if="globalLoading">
      <LoadingIndicator />
    </template>
    <div class="w-full h-full flex bg-white overflow-hidden min-w-[800px]">
      <ChatHistoryRoomList :list-chat-room="historyListChatRoom" :active-chat-data="historyActiveChatData"
        :admin-chat-queue="adminChatQueue" @update-chat-list-loading="toggleChatListLoading"
        @update-active-chat="handleSetActiveChatData" @update-admin-chat-queue="updateAdminChatQueue"
        @toggle-global-loading="toggleGlobalLoading" @update-chat-list-data="updateChatListData"
        @update-active-chat-details="updateActiveChatDetails" />
      <template v-if="historyActiveChatData && historyActiveChatDetails">
        <ChatHistoryChatting :active-chat-data="historyActiveChatData" :active-chat-details="historyActiveChatDetails"
          :chatting-container-loading="chattingContainerLoading"
          :active-chat-details-pagination="historyActiveChatDetailsPagination" :list-chat-room="historyListChatRoom"
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

const historyListChatRoom = ref<ChatRoom[]>([])
const adminChatQueue = ref<AdminChatQueue>()

const historyActiveChatData = ref<ChatRoom | null>()
const historyActiveChatDetails = ref<ChatRoomDetails>()
const historyActiveChatDetailsPagination = ref()

const { data: historyChatRooms } = await useAsyncData('historyChatRooms', () =>
  useApi<Response<ChatRoom[]>>('/new/admin/chat-rooms/?is_active=false', {
    method: 'GET',
  }).then((res) => res.data.value?.data)
)

watchEffect(async () => {
  if (Array.isArray(historyChatRooms.value)) {
    // await fetchHistoryChatRoomDetailsForAll(historyChatRooms.value)
    historyListChatRoom.value = [...historyChatRooms.value].sort(sortChatRoom)
  }
})

// async function fetchHistoryChatRoomDetailsForAll(historyChatRooms: ChatRoom[]) {
//   try {
//     const historyChatRoomsWithDetails = await Promise.all(
//       historyChatRooms.map(async (chatRoom) => {
//         const participantsResponse = await useApi<Response<Participant[]>>(
//           `/new/admin/chat-rooms/${chatRoom.id}/chat-participant`
//         );
//         const messagesResponse = await useApi<ResponseWithPagination>(
//           `/new/admin/chat-rooms/${chatRoom.id}/chats`
//         );

//         return {
//           ...chatRoom,
//           participant: participantsResponse.data.value?.data || [],
//           chats: messagesResponse.data.value?.data || [],
//         };
//       })
//     );

//     historyListChatRoom.value = historyChatRoomsWithDetails;
//     console.log('Chat rooms with details:', historyListChatRoom);
//   } catch (e) {
//     console.error('Error fetching chat room details:', e);
//     toast.add({ message: 'Failed to fetch chat room details', type: 'error' });
//   }
// }
// watchEffect(() => {
//   if (Array.isArray(historyChatRooms.value)) {
//     historyListChatRoom.value = [...historyChatRooms.value].sort(sortChatRoom)
//   }
// })

function sortChatRoom(a: ChatRoom, b: ChatRoom) {
  return b.updated_at - a.updated_at
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
    historyActiveChatData.value = null
    return
  }

  historyActiveChatData.value = { ...chatRoomData }
  fetchChatRoomDetails()
}

function updateAdminChatQueue(newAdminChatQueue: AdminChatQueue) {
  adminChatQueue.value = { ...newAdminChatQueue }
}

function updateActiveChatDetails(newChatDetails: ChatRoomDetails) {
  historyActiveChatDetails.value = { ...newChatDetails }
}

function updateChatListData(newChatListData: ChatRoom[]) {
  historyListChatRoom.value = [...newChatListData]
}

function triggerFetchChatRoomDetails() {
  fetchChatRoomDetails(historyActiveChatDetailsPagination.value?.next_page_cursor || '')
}

async function fetchChatRoomDetails(nextCursor: string = '') {
  if (historyActiveChatData.value == null) return

  chattingContainerLoading.value = true

  try {
    const { data, error } = await useApi<ResponseWithPagination>(
      `/new/admin/chat-rooms/${historyActiveChatData.value?.id}/chats`,
      { method: 'GET' }
    )
    if (data.value?.data) {
      if (nextCursor) {
        historyActiveChatDetails.value?.chats.push(...data.value?.data)
      } else {
        historyActiveChatDetails.value = { chat_room: historyActiveChatData.value, chats: data.value?.data }
      }
      console.log(nextCursor)
      console.log(historyActiveChatDetails.value)

      historyActiveChatDetailsPagination.value = data.value?.pagination
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

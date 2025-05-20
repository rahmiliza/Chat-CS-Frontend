<template>
  <div class="w-full h-[calc(100%-34px)]">
    <template v-if="chatRoomsStatus === 'pending' || globalLoading">
      <LoadingIndicator />
    </template>
    <div class="w-full h-full flex bg-white overflow-hidden min-w-[800px]">
      <ChatRoomList ref="roomListRef" :list-chat-room="listChatRoom" :active-chat-data="activeChatData"
        :admin-chat-queue="adminChatQueue" @update-chat-list-loading="toggleChatListLoading"
        @update-active-chat="handleSetActiveChatData" @update-admin-chat-queue="updateAdminChatQueue"
        @toggle-global-loading="toggleGlobalLoading" @update-chat-list-data="updateChatListData"
        @update-active-chat-details="updateActiveChatDetails" />
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
import type { AdminChatQueue, Chat, ChatQueue, ChatRoom, ChatRoomDetails, Participant } from '~/models/chat'
import type { Response, ResponseWithPagination } from '~/models/response'
import RoomList from './RoomList.vue';

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

const roomListRef = ref()

const { data: chatRooms, status: chatRoomsStatus } = await useAsyncData('chatRooms', () =>
  useApi<Response<ChatRoom[]>>('new/admin/chat-rooms/?is_active=true', {
    method: 'GET',
  }).then((res) => res.data.value?.data)
)

watchEffect(async () => {
  if (Array.isArray(chatRooms.value)) {
    await fetchChatRoomDetailsForAll(chatRooms.value)
    // listChatRoom.value = [...chatRooms.value].sort(sortChatRoom)
  }
})

async function fetchChatRoomDetailsForAll(chatRooms: ChatRoom[]) {
  try {
    const chatRoomsWithDetails = await Promise.all(
      chatRooms.map(async (chatRoom) => {
        const participantsResponse = await useApi<Response<Participant[]>>(
          `/new/admin/chat-rooms/${chatRoom.id}/chat-participant`
        );
        const messagesResponse = await useApi<ResponseWithPagination>(
          `/new/admin/chat-rooms/${chatRoom.id}/chats?page=1&per_page=10`
        );

        return {
          ...chatRoom,
          participant: participantsResponse.data.value?.data || [],
          chats: messagesResponse.data.value?.data || [],
          last_message: messagesResponse.data.value?.data[0] || null,
        };
      })
    );

    listChatRoom.value = chatRoomsWithDetails;
    console.log('Chat rooms with details:', listChatRoom);
  } catch (e) {
    console.error('Error fetching chat room details:', e);
    toast.add({ message: 'Failed to fetch chat room details', type: 'error' });
  }
}


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

  console.log('activeChatData', activeChatData)
  chattingContainerLoading.value = true

  try {
    const { data, error } = await useApi<ResponseWithPagination>(
      `/new/admin/chat-rooms/${activeChatData.value?.id}/chats`,
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

  socket.on('last-message-room', (lastMessage: Chat) => {
    const lastMessageIndexRoom = listChatRoom.value?.findIndex((item) => item?.id === lastMessage?.chat_room_id)

    if (lastMessageIndexRoom > -1 && listChatRoom.value[lastMessageIndexRoom]) {
      listChatRoom.value[lastMessageIndexRoom].last_message = { ...lastMessage }

      listChatRoom.value.sort((a, b) => {
        return b.last_message.created_at - a.last_message.created_at
      })
    }
  })

  socket.on('chat-room', async (chatRoom: ChatRoom) => {
    const index = listChatRoom.value.findIndex(item => item?.id === chatRoom?.id)

    if (index < 0) {
      listChatRoom.value.push(chatRoom)
    } else {
      listChatRoom.value[index] = { ...chatRoom }
    }

    const currentChatRoom = listChatRoom.value.find(item => item?.id === chatRoom?.id)

    if (!currentChatRoom?.last_message || !currentChatRoom?.chats || currentChatRoom.chats.length === 0) {
      try {
        const { data, error } = await useApi<ResponseWithPagination>(`new/admin/chat-rooms/${chatRoom.id}/chats`, {
          method: 'GET',
        })

        if (data.value?.data && !error.value) {
          const updatedIndex = listChatRoom.value.findIndex(item => item?.id === chatRoom?.id)
          if (updatedIndex > -1) {
            listChatRoom.value[updatedIndex] = {
              ...listChatRoom.value[updatedIndex],
              chats: data.value.data,
              last_message: data.value.data[0] || null,
            }
          }
        } else {
          console.error('Failed to fetch chat room details:', error.value)
        }
      } catch (e) {
        console.error('Error fetching chat room:', e)
      }
    }

    listChatRoom.value.sort((a, b) => {
      const aTime = a.last_message?.created_at ?? 0
      const bTime = b.last_message?.created_at ?? 0
      return bTime - aTime
    })

    // listChatRoom.value.sort((a, b) => {
    //   return b.last_message.created_at - a.last_message.created_at
    // })
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

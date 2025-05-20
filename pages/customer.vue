<template>
  <div class="w-full min-h-screen px-4 py-6 bg-gray-50 dark:bg-slate-100 shadow-xl -p-2">
    <template v-if="activeChat">
      <!-- Active Chat Container -->
      <ChatCustomersChattingContainer ref="chatting" :active-chat="activeChat" :active-chat-details="activeChatDetails"
        :chatting-container-loading="chattingContainerLoading"
        :active-chat-details-pagination="activeChatDetailsPagination" :list-chat-room="listChatRoom"
        @update-active-chat="handleSetActiveChatData" @update-active-chat-details="updateActiveChatDetails"
        @update-chatting-container-loading="toggleChattingContainerLoading" @update-chat-list-data="updateChatListData"
        @toggle-global-loading="toggleGlobalLoading" @trigger-fetch-chat-room-details="triggerFetchChatRoomDetails" />
    </template>

    <!-- Empty State - No Active Chat -->
    <div v-else
      class="max-w-md mx-auto flex flex-col items-center justify-center border-slate-900 bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md mt-20 space-y-4">
      <h2 class="text-lg font-semibold text-gray-500 dark:text-white text-center">
        Create Chat Room Now
      </h2>
      <textarea v-model="message"
        class="w-full h-24 rounded-lg border border-gray-300 dark:border-gray-600 px-4 py-3 resize-none text-slate-900 dark:text-slate-900 bg-white dark:bg-slate-100 focus:border-slate-400 focus:ring-slate-400  focus:ring-1 outline-none transition"
        placeholder="Enter your question here..." />
      <Button
        class="w-full bg-primary text-white hover:brightness-110 py-2 rounded-lg font-medium shadow disabled:opacity-50 disabled:cursor-not-allowed transition"
        @click="startChat" :disabled="!message">
        Start Chat
      </Button>
    </div>
  </div>
</template>



<script lang="ts" setup>
import { io } from 'socket.io-client'
import Button from '~/components/Button.vue'
import type { Chat, ChatRoom, ChatRoomDetails } from '~/models/chat'
import type { Response, ResponseWithPagination } from '~/models/response'
import type ChatCustomersChattingContainer from '~/components/ChatCustomers/ChattingContainer.vue'

const config = useRuntimeConfig()
const toast = useToast()
const { user } = useAuthStore()

const chatting = ref<InstanceType<typeof ChatCustomersChattingContainer> | null>(null)
const message = ref('')
const activeChat = ref<ChatRoom | null>(null)
const activeChatDetails = ref<ChatRoomDetails>()
const activeChatDetailsPagination = ref()
const chattingContainerLoading = ref(false)

const socket = io(config.public.socketUrl, {
  auth: { userId: user?.id },
})

const fetchExistingChatRoom = async () => {
  try {
    const { data } = await useAsyncData('chatRooms', () =>
      useApi<Response<ChatRoom[]>>(`/chat-rooms/`, {
        method: 'GET',
      }).then(res => res.data.value?.data ?? [])
    )

    if (data.value && data.value.length > 0) {
      activeChat.value = data.value[0]
    } else {
      activeChat.value = null
    }
  } catch (e) {
    toast.add({ message: 'Gagal mengambil chat room.', type: 'error' })
  }
}

await fetchExistingChatRoom()

watch(activeChat, (chatRoom) => {
  if (!chatRoom) return

  socket.emit('join', user?.id)
  socket.emit('join-room', chatRoom.id)
  fetchActiveChatDetails()

  socket.off('receive-message')
  socket.on('receive-message', (lastMessage: Chat) => {
    if (activeChatDetails.value?.chat_room?.id !== lastMessage?.chat_room_id) return
    activeChatDetails.value?.chats?.unshift(lastMessage)
  })
}, { immediate: true })

const startChat = async () => {
  const { data } = await useApi<Response>(config.public.apiBaseUrl + '/chat-rooms/', {
    method: "POST",
    // body: {
    //   participants: [
    //     { id: user?.id, display_name: user?.name }
    //   ]
    // }
  })

  if (data.value?.ok) {
    activeChat.value = data.value?.data
    socket.emit('unassigned-room', data.value?.data);
    await nextTick();
    chatting.value?.startChatMessage(message.value);
  } else {
    toast.add({ message: 'Gagal memulai chat.', type: 'error' })
  }
}


async function fetchActiveChatDetails(nextCursor: string = '') {
  if (!activeChat.value) return

  try {
    const { data } = await useApi<ResponseWithPagination>(
      `/chat-rooms/${activeChat.value.id}/chats?offset=${nextCursor}&sortBy=created_at&order=DESC`,
      { method: 'GET' }
    )

    if (data.value?.data) {
      if (nextCursor) {
        activeChatDetails.value?.chats.push(...data.value.data)
      } else {
        activeChatDetails.value = {
          chat_room: activeChat.value,
          chats: data.value.data
        }
      }
      activeChatDetailsPagination.value = data.value.pagination
    } else {
      activeChatDetails.value = { chat_room: activeChat.value, chats: [] }
    }
  } catch (e) {
    toast.add({ message: 'Gagal mengambil detail chat.', type: 'error' })
  }
}

onMounted(() => {
  socket.emit('join', user?.id)

  socket.on('new-chat-room', async () => {
    await fetchExistingChatRoom()
  })
})

onUnmounted(() => {
  socket.off('receive-message')
  socket.disconnect()
})
</script>

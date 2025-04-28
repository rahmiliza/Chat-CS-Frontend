<template>
  <div class="w-full px-2">
    <template v-if="activeChat && activeChat.status !== 'closed'">
      <ChatCustomersChattingContainer
        ref="chatting"
        :active-chat="activeChat"
        :active-chat-details="activeChatDetails"
        :chatting-container-loading="chattingContainerLoading"
        :active-chat-details-pagination="activeChatDetailsPagination"
        :list-chat-room="listChatRoom"
        @update-active-chat="handleSetActiveChatData"
        @update-active-chat-details="updateActiveChatDetails"
        @update-chatting-container-loading="toggleChattingContainerLoading"
        @update-chat-list-data="updateChatListData"
        @toggle-global-loading="toggleGlobalLoading"
        @trigger-fetch-chat-room-details="triggerFetchChatRoomDetails"
      />
    </template>

    <!-- Display a message or a placeholder for closed chat rooms -->
    <!-- <div v-else>
      <p class="text-center text-gray-500">This chat room is closed.</p>
    </div> -->

    <div
      v-else-if="!activeChat"
      class="max-w-[400px] mx-auto flex flex-col items-center justify-center gap-4 dark:text-black text-black"
    >
      <textarea
        v-model="message"
        class="w-full rounded-lg border px-3 py-2 outline-none transition-colors text-black focus:border-primary focus:ring-primary focus:ring-1"
        placeholder="Masukan Pertanyaan"
      />
      <Button
        class="bg-primary text-gray-50 hover:brightness-125 my-1 mr-3 h-[36px]"
        @click="startChat"
        :disabled="!message"
      >
        Mulai Chat
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
      useApi<Response<ChatRoom[]>>(`/chat-rooms?skip_closed=true&participantID=${user?.id}`, {
        method: 'GET',
      }).then(res => res.data.value?.data ?? [])
    );

    if (data.value?.data) {
      // Filter out closed chat rooms
      const openChatRooms = data.value.data.filter(chatRoom => chatRoom.status !== 'closed');
      
      if (openChatRooms.length > 0) {
        activeChat.value = openChatRooms[0]; // Set the first open chat room
        await fetchActiveChatDetails();
      } else {
        activeChat.value = null; // No open chat rooms
      }
    } else {
      activeChat.value = null; // No data, set as null
    }
    
  } catch (e) {
    toast.add({ message: 'Gagal mengambil chat room.', type: 'error' });
  }
};



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
  const { data } = await useApi<Response>(config.public.apiBaseUrl + '/chat-rooms', {
    method: "POST",
    body: {
      participants: [
        { id: user?.id, display_name: user?.name }
      ]
    }
  })

  if (data.value?.ok) {
    activeChat.value = data.value?.data
    await nextTick()
    chatting.value?.startChatMessage(message.value)
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
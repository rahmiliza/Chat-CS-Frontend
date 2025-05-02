<template>
    <div class="w-full h-full relative">
      <!-- Add Participant Button -->
      <div v-if="activeChatData" class="absolute top-4 right-4 z-20">
        <button @click="showAddParticipantModal = true" class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
          Add Participant
        </button>
      </div>
  
      <!-- Add Participant Modal -->
      <div
        v-if="showAddParticipantModal"
        class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      >
        <div class="bg-white rounded-xl p-6 w-full max-w-md">
          <div class="flex justify-between items-center mb-4">
            <h2 class="text-lg font-semibold">Add Customer</h2>
            <button @click="showAddParticipantModal = false" class="text-gray-500 hover:text-black text-2xl leading-none">
              &times;
            </button>
          </div>
  
          <form @submit.prevent="handleAddParticipant">
            <div class="mb-4">
              <label class="block text-sm font-medium mb-1">Id Customers</label>
              <input v-model="participantInput" class="w-full border px-3 py-2 rounded" required />
            </div>
            <div class="mb-4">
                <label class="block text-sm font-medium mb-1">Name </label>
                <input v-model="participantInput" class="w-full border px-3 py-2 rounded" required />
            </div>
            <div class="flex justify-end">
              <button type="button" @click="showAddParticipantModal = false" class="mr-2 px-4 py-2 border rounded">
                Cancel
              </button>
              <button type="submit" class="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
                Add
              </button>
            </div>
          </form>
        </div>
      </div>
  
      <template v-if="pending || adminChatQueuePending || globalLoading">
        <LoadingIndicator />
      </template>
      <div class="w-full h-full flex bg-white overflow-hidden min-w-[800px]">
        <ChatRoomList
          :list-chat-room="listChatRoom"
          :active-chat-data="activeChatData"
          :admin-chat-queue="adminChatQueue"
          @update-chat-list-loading="toggleChatListLoading"
          @update-active-chat="handleSetActiveChatData"
          @update-admin-chat-queue="updateAdminChatQueue"
          @toggle-global-loading="toggleGlobalLoading"
          @update-chat-list-data="updateChatListData"
          @update-active-chat-details="updateActiveChatDetails"
        />
        <template v-if="activeChatData && activeChatDetails">
          <ChatChatting
            :active-chat-data="activeChatData"
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
        <template v-else>
          <pages-manage-customer-chat-queue-counter :admin-chat-queue="adminChatQueue" />
        </template>
      </div>
    </div>
  </template>
  
  <script setup lang="ts">
  import { io } from 'socket.io-client'
  import { ref, watch, onMounted, onBeforeMount, onUnmounted } from 'vue'
  import type { AdminChatQueue, Chat, ChatQueue, ChatRoom, ChatRoomDetails } from '~/models/chat'
  import type { Response, ResponseWithPagination } from '~/models/response'
  
  const { user } = useAuthStore()
  const toast = useToast()
  
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
        `/admin/chat-rooms/${activeChatData.value.id}/chats?offset=${nextCursor}&sortBy=created_at&order=DESC`,
        { method: 'GET' }
      )
      if (data.value?.data) {
        if (nextCursor) {
          activeChatDetails.value?.chats.push(...data.value?.data)
        } else {
          activeChatDetails.value = {
            chat_room: activeChatData.value,
            chats: data.value?.data,
          }
        }
        activeChatDetailsPagination.value = data.value?.pagination
      } else {
        toast.add({ message: error.value?.data?.message ?? 'An error occurred. Try again.', type: 'error' })
      }
    } catch (e: any) {
      toast.add({ message: e?.value?.data?.message || 'Fetch failed. Try again.', type: 'error' })
    } finally {
      chattingContainerLoading.value = false
    }
  }
  
  const { data, pending } = await useApi<Response<ChatRoom[]>>('/admin/chat-rooms', { method: 'GET' })
  const { data: adminChatQueueData, pending: adminChatQueuePending } = await useApi<Response<AdminChatQueue>>(
    '/admin/chats/admin-queues',
    { method: 'GET' }
  )
  
  watch(
    [data, adminChatQueueData],
    () => {
      adminChatQueue.value = adminChatQueueData.value?.data
      listChatRoom.value = data.value?.data ?? []
      listChatRoom.value.sort((a, b) => {
        if (a.status === 'ACTIVE' && b.status !== 'ACTIVE') return -1
        if (a.status !== 'ACTIVE' && b.status === 'ACTIVE') return 1
        return b.last_message.created_at - a.last_message.created_at
      })
    },
    { immediate: true }
  )
  
  watch(activeChatData, () => {
    socket.off('receive-message')
    socket.emit('join-room', user?.id)
  
    if (activeChatData.value) {
      socket.emit('join-room', activeChatData.value.id)
    }
  
    socket.on('receive-message', (lastMessage: Chat) => {
      if (activeChatDetails.value?.chat_room?.id !== lastMessage?.chat_room_id) return
  
      activeChatDetails.value?.chats.unshift(lastMessage)
  
      const index = listChatRoom.value.findIndex((item) => item?.id === lastMessage?.chat_room_id)
      if (index > -1) {
        listChatRoom.value[index].last_message = { ...lastMessage }
        listChatRoom.value.sort((a, b) => {
          if (a.status === 'ACTIVE' && b.status !== 'ACTIVE') return -1
          if (a.status !== 'ACTIVE' && b.status === 'ACTIVE') return 1
          return b.last_message.created_at - a.last_message.created_at
        })
      }
    })
  })
  
  onMounted(() => {
    socket.emit('join-room', user?.id)
  
    socket.on('receive-new-message-queue', (newQueue: ChatQueue[] | string) => {
      adminChatQueue.value!.queue = typeof newQueue === 'string' ? JSON.parse(newQueue) : [...newQueue]
    })
  
    socket.on('chat-room', (chatRoom: ChatRoom) => {
      const index = listChatRoom.value.findIndex((item) => item.id === chatRoom.id)
      if (index < 0) {
        listChatRoom.value.push(chatRoom)
      } else {
        listChatRoom.value[index] = { ...chatRoom }
      }
      listChatRoom.value.sort((a, b) => {
        if (a.status === 'ACTIVE' && b.status !== 'ACTIVE') return -1
        if (a.status !== 'ACTIVE' && b.status === 'ACTIVE') return 1
        return b.last_message.created_at - a.last_message.created_at
      })
    })
  })
  
  onUnmounted(() => {
    socket.off('receive-new-message-queue')
    socket.off('receive-message')
    socket.disconnect()
  })
  
  // Add Participant Modal Logic
  const showAddParticipantModal = ref(false)
  const participantInput = ref('')
  
  async function handleAddParticipant() {
    if (!activeChatData.value) return
  
    try {
      const { data, error } = await useApi<Response>(
        `/admin/chat-rooms/${activeChatData.value.id}/chat-participant`,
        {
          method: 'POST',
          body: { user_identifier: participantInput.value },
        }
      )
      if (data.value) {
        toast.add({ message: 'Participant added successfully!', type: 'success' })
        showAddParticipantModal.value = false
        participantInput.value = ''
        fetchChatRoomDetails()
      } else {
        throw error.value
      }
    } catch (e: any) {
      toast.add({ message: e?.message || 'Failed to add participant', type: 'error' })
    }
  }
  </script>
  
  <style scoped></style>
  
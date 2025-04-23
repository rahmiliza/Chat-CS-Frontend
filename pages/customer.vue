<template>
  <div class="w-full px-2">
    <template v-if="activeChat">
      <ChatCustomersChattingContainer ref="chatting" :active-chat="activeChat" :active-chat-details="activeChatDetails"
        :chatting-container-loading="chattingContainerLoading"
        :active-chat-details-pagination="activeChatDetailsPagination" :list-chat-room="listChatRoom"
        @update-active-chat="handleSetActiveChatData" @update-active-chat-details="updateActiveChatDetails"
        @update-chatting-container-loading="toggleChattingContainerLoading" @update-chat-list-data="updateChatListData"
        @toggle-global-loading="toggleGlobalLoading" @trigger-fetch-chat-room-details="triggerFetchChatRoomDetails" />
    </template>
    <div v-else class="max-w-[400px] mx-auto flex flex-col items-center justify-center gap-4 dark:text-black">
      <textarea v-model="message" class="w-full rounded-lg border px-3 py-2 outline-none transition-colors dark:text-black',
        'focus:border-primary focus:ring-primary focus:ring-1" placeholder="Masukan Pertanyaan"></textarea>
      <Button class="bg-primary text-gray-50 hover:brightness-125 my-1 mr-3 h-[36px]" @click="startChat"
        :disabled="!message">Mulai Chat</Button>
    </div>

  </div>
</template>
<script lang="ts" setup>

import { io } from 'socket.io-client'
import Button from '~/components/Button.vue';
import type { Chat, ChatRoom, ChatRoomDetails } from '~/models/chat';
import type { Response, ResponseWithPagination } from '~/models/response';
import type ChatCustomersChattingContainer from '~/components/ChatCustomers/ChattingContainer.vue';

const config = useRuntimeConfig();
const toast = useToast();
const loading = ref(true);
const { user, bearerToken } = useAuthStore();


const chatting = ref<InstanceType<typeof ChatCustomersChattingContainer> | null>(null)
const message = ref()

const activeChat = ref<ChatRoom | null>(null);
const activeChatDetails = ref<ChatRoomDetails>();
const activeChatDetailsPagination = ref();

const socket = io(config.public.socketUrl, {
  auth: { userId: user?.id }
})

const startChat = async () => {

  const { data } = await useApi<Response>(config.public.apiBaseUrl + '/chat-rooms', {
    method: "POST",
    body: {
      participants: [
        { id: user?.id, display_name: user?.name }
      ]
    }
  });

  if (data.value?.ok) {
    activeChat.value = data.value?.data;
    await nextTick()
    if (chatting.value) {
      chatting.value.startChatMessage(message.value);
    }

  } else {
    activeChat.value = null;
  }
}

// watch(
//   [data,],
//   (_) => {
//     activeChat.value = data.value?.data?.[0] ?? null
//     console.log(activeChat);
//   },
//   { immediate: true }
// )

async function fetchActiveChatDetails(nextCursor: string = '') {
  if (activeChat.value == null) return

  // chattingContainerLoading.value = true

  try {
    const { data, error } = await useApi<ResponseWithPagination>(
      `/chat-rooms/${activeChat.value?.id}/chats/?offset=${nextCursor}&sortBy=created_at&order=DESC`,
      { method: 'GET' }
    )

    if (data.value?.data) {
      if (nextCursor) {
        activeChatDetails.value?.chats.push(...data.value?.data)
      } else {
        activeChatDetails.value = { chat_room: activeChat.value, chats: data.value?.data }
      }
      activeChatDetailsPagination.value = data.value?.pagination
    } else {
      activeChatDetails.value = { chat_room: activeChat.value, chats: [] }
      // const errMsg = error.value?.data?.message ?? 'An Error was Accrued, Please try again'
      // toast.add({ message: errMsg, type: "error" })
    }
  } catch (e: any) {
    const errMsg = e?.value?.data?.message || 'An Error was Accrued, Please try again'
    toast.add({ message: errMsg, type: "error" })
  } finally {
    // chattingContainerLoading.value = false
  }
}

watch([activeChat], (_) => {

  // activeChatDetails.value = activeChat.value ? { chat_room: activeChat.value, chats: [] } : undefined

  socket.emit('join', user?.id);

  if (activeChat.value) {
    socket.emit('join-room', activeChat.value.id);
  }
  fetchActiveChatDetails();

  socket.on('receive-message', (lastMessage: Chat) => {
    if (activeChatDetails.value?.chat_room?.id !== lastMessage?.chat_room_id) return

    activeChatDetails.value?.chats?.splice(0, 0, lastMessage)

    // const lastMessageIndexRoom = listChatRoom.value?.findIndex((item) => item?.id === lastMessage?.chat_room_id)

    // if (lastMessageIndexRoom > -1 && listChatRoom.value[lastMessageIndexRoom]) {
    //   listChatRoom.value[lastMessageIndexRoom].last_message = { ...lastMessage }

    //   // Sorting listChatRoom based on last_message.created_at and status
    //   listChatRoom.value.sort((a, b) => {
    //     if (a.status === 'ACTIVE' && b.status !== 'ACTIVE') {
    //       return -1
    //     } else if (a.status !== 'ACTIVE' && b.status === 'ACTIVE') {
    //       return 1
    //     } else {
    //       return b.last_message.created_at - a.last_message.created_at
    //     }
    //   })
    // }
  })
})


const { data: chatRoom, pending } = await useApi<Response<ChatRoom[]>>(`/chat-rooms/${user?.id}?skip_closed=true`, {
  method: 'GET',
})
// if (chatRoom.value?.data) {
//   activeChat.value = chatRoom.value?.data?.[0] ?? null
// }


onMounted(() => {
  socket.on('connection', () => { })

  if (chatRoom.value?.data) {
    activeChat.value = chatRoom.value?.data?.[0] ?? null
  }

  socket.on('new-chat-room', (res) => {
    chatRoom.value = res
    console.log(res)
    // if (listChatRoom.value.findIndex((item) => item?.id === chatRoom?.id) < 0) {
    //   listChatRoom.value.push(chatRoom)
    // } else {
    //   listChatRoom.value[listChatRoom.value.findIndex((item) => item?.id === chatRoom?.id)] = { ...chatRoom }
    // }

    // // Sorting listChatRoom based on last_message.created_at and status
    // listChatRoom.value.sort((a, b) => {
    //   if (a.status === 'ACTIVE' && b.status !== 'ACTIVE') {
    //     return -1
    //   } else if (a.status !== 'ACTIVE' && b.status === 'ACTIVE') {
    //     return 1
    //   } else {
    //     return b.last_message.created_at - a.last_message.created_at
    //   }
    // })
  })
})

onUnmounted(() => {
  socket.off('receive-new-message-queue')
  socket.off('receive-message')
  socket.disconnect()
})
</script>

<style></style>

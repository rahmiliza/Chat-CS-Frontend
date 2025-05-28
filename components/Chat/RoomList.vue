<template>
  <div class="w-96 h-full flex flex-col border-r border-slate-300/70">
    <div
      class="w-full h-[49px] flex justify-between items-center px-2 py-1 border-b border-slate-300/50 bg-blue-400/20 dark:text-black">
      <div class="relative w-full">
        <div @click="handleSearch" class="absolute inset-y-0 end-0 flex items-center pe-3 cursor-pointer">
          <svg class="w-4 h-4 text-gray-500 dark:text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg"
            fill="none" viewBox="0 0 20 20">
            <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z" />
          </svg>
        </div>
        <input type="search" v-model="searchQuery" @keyup.enter.prevent="handleSearch"
          class="block w-full p-2.5 pe-10 text-sm text-gray-900 border-0 rounded-lg bg-transparent outline-none dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
          placeholder="Search chat" />
      </div>
    </div>
    <div class="h-full my-4 pr-4 flex flex-col gap-2.5 overflow-y-auto">
      <template v-if="filteredChatRooms?.length > 0">
        <template v-for="chatRoomData in filteredChatRooms" :key="chatRoomData?.id" class="dark:text-black text-black">
          <ChatRoomInfo :chat-room-data="chatRoomData" :active-chat-data="activeChatData"
            @update-active-chat="$emit('update-active-chat', $event)"
            @update-active-chat-details="$emit('updateActiveChatDetails', $event)"
            class="dark:text-black text-black " />
        </template>
      </template>
      <template v-else>
        <div class="flex justify-center items-center h-full text-gray-400">{{ $t('Chat.no-chat') }}</div>
      </template>
    </div>
  </div>

  <UIModals v-model="openModalCreateChat" modal-title="Create New Chat" :show-overflow="true"
    :on-ok="handleOkCreateChat" :on-close-modal="handleCloseModalCreateChat"
    :disabled-btn-ok="!selectedParticipantToAddToChat" class="dark:text-black">
    <template #modal-content>
      <div class="w-[400px] h-[80px] select-none overflow-y-visible">
        <template v-if="loadingGetListCustomer">
          <UISkeleton />
        </template>
        <template v-else>
          <div class="mt-2 mb-1  text-medium text-gray-600 text-lg">Add Customer</div>
          <UISelect v-model="selectedParticipantToAddToChat" placeholder="Choose one Customer"
            :options="listCustomerOpt" class="text-medium text-lg" />
        </template>
      </div>
    </template>
  </UIModals>
</template>

<script setup lang="ts">
import { io } from 'socket.io-client'

import type { ChatRoom } from '~/models/chat'
import PermissionGuard from '../PermissionGuard.vue'
import type { Response } from '~/models/response';

interface Option {
  value: string
  label: string
  disabled?: boolean
}

const { user } = useAuthStore();
const toast = useToast();

const loadingGetListCustomer = ref(false)
const openModalCreateChat = ref(false)
const listCustomerOpt = ref<Option[]>([])
const selectedParticipantToAddToChat = ref<string | number>('')
interface Props {
  listChatRoom: ChatRoom[]
  activeChatData?: ChatRoom | null
}

const props = withDefaults(defineProps<Props>(), {})

const emits = defineEmits([
  'update-active-chat',
  'updateChatListLoading',
  'toggleGlobalLoading',
  'updateChatListData',
  'updateActiveChatDetails',
  'updateChattingContainerLoading',
])
const searchQuery = ref('');
const {
  public: { socketUrl },
} = useRuntimeConfig()
const socket = io(socketUrl)


function emitLoading(isLoading: boolean) {
  emits('updateChattingContainerLoading', isLoading)
}

function handleCloseModalCreateChat() {
  openModalCreateChat.value = false
}


const handleCreateChat = async () => {
  openModalCreateChat.value = true
  selectedParticipantToAddToChat.value = ''
  loadingGetListCustomer.value = true

  try {
    const { data, error } = await useApi<Response<User[]>>('/new/admin/chat-rooms/customer?per_page=100', {
      method: 'GET',
    })

    if (data.value?.data) {
      listCustomerOpt.value =
        data.value?.data?.map((item: User) => {
          const isParticipant = props.activeChatData?.participant.some((participant) => participant.user_id === item.id)
          return { value: item?.id ?? '', label: item?.display_name ?? '', disabled: isParticipant }
        }) ?? []
    } else {
      const errMsg = error.value?.data?.message ?? 'Failed to fetch admin list, please try again'
      toast.add({ message: errMsg, type: "error" })
    }
  } catch (e: any) {
    const errMsg = e?.value?.data?.message || 'Failed to fetch admin list, please try again'
    toast.add({ message: errMsg, type: "error" })
  } finally {
    loadingGetListCustomer.value = false
  }
}


async function handleOkCreateChat() {
  emitLoading(true)

  try {
    const { data, error } = await useApi<Response<ChatRoom>>('/new/admin/chat-rooms/', {
      method: 'POST',
      body: {
        participants: [
          { id: selectedParticipantToAddToChat.value ?? '' },
        ]
      },
    })

    if (data.value?.ok) {
      toast.add({ message: 'Participant added successfully', type: "success" })

      const chatIndex = props?.listChatRoom?.findIndex((item) => item?.id === data.value?.data?.id)
      if (chatIndex !== undefined && chatIndex == -1) {
        const tempListChat = [...props.listChatRoom]
        tempListChat[chatIndex] = { ...tempListChat[chatIndex], ...data.value?.data }

        emits('updateChatListData', tempListChat)
        // emits('triggerFetchChatRoomDetails')
      }
    }
    else if (data.value?.ok === false) {
      toast.add({ message: 'Participant already exists in this chat', type: "error" })
    }
    else {
      const errMsg = error.value?.data?.message ?? 'Failed to add participant, please try again1'
      toast.add({ message: errMsg, type: "error" })
    }
  } catch (e: any) {
    const errMsg = e?.value?.data?.message || 'Failed to add participant, please try again2'
    toast.add({ message: errMsg, type: "error" })
  } finally {
    emitLoading(false)
    openModalCreateChat.value = false
  }
}

const filteredChatRooms = computed(() => {
  if (!searchQuery.value) return props.listChatRoom;

  return props.listChatRoom.filter((chatRoom) => {
    return chatRoom.participant?.some((p) =>
      p?.display_name?.toLowerCase().includes(searchQuery.value.toLowerCase())
    );
  });
});

function handleSearch() {

}

defineExpose({
  handleCreateChat,
})
</script>

<style scoped></style>

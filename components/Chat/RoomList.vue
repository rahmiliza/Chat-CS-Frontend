<template>
  <div class="w-96 h-full flex flex-col border-r border-slate-300/50">
    <!-- <div class="h-14 flex justify-between items-center border-b border-black px-2 pb-1">
      <div class="text-2xl font-bold">Chats</div>
      <DPermissionGuard permission="chat_room::assign">
        <Icon name="uil:comment-plus" size="1.5rem" class="font-bold p-2 rounded-lg text-2xl" :class="!adminChatQueue?.queue?.length || listChatRoom.filter((chatRoom) => !chatRoom.closed_at).length >= 3
          ? 'text-slate-400 cursor-not-allowed'
          : 'text-red-600 hover:cursor-pointer hover:brightness-110 active:brightness-90 hover:bg-red-300/50'
          " @click="handleAddAdminChatIndex" />
      </DPermissionGuard>
    </div> -->
    <div class="h-full my-4 pr-4 flex flex-col gap-2.5 overflow-y-auto">
      <template v-if="listChatRoom?.length > 0">
        <template v-for="chatRoomData in listChatRoom" :key="chatRoomData?.id">
          <ChatRoomInfo :chat-room-data="chatRoomData" :active-chat-data="activeChatData"
            @update-active-chat="$emit('update-active-chat', $event)"
            @update-active-chat-details="$emit('updateActiveChatDetails', $event)" />
        </template>
      </template>
      <template v-else>
        <div class="flex justify-center items-center h-full text-gray-400">No Chat</div>
      </template>
    </div>
    <div class="flex flex-col">
      <button
        class="h-10 mr-4 bg-white border rounded-lg hover:bg-blue-600 active:bg-blue-700 hover:text-white transition duration-200 ease-in-out"
        @click="handleCreateChat">Create New Chat</button>
    </div>
  </div>

  <UIModals v-model="openModalCreateChat" modal-title="Create New Chat" :show-overflow="true"
    :on-ok="handleOkCreateChat" :on-close-modal="handleCloseModalCreateChat"
    :disabled-btn-ok="!selectedParticipantToAddToChat">
    <template #modal-content>
      <div class="w-[400px] h-[80px] select-none overflow-y-visible">
        <template v-if="loadingGetListCustomer">
          <UISkeleton />
        </template>
        <template v-else>
          <div class="mt-2 mb-1 text-gray-500 text-sm">Customer</div>
          <UISelect v-model="selectedParticipantToAddToChat" placeholder="Choose one Customer"
            :options="listCustomerOpt" />
        </template>
      </div>
    </template>
  </UIModals>
</template>

<script setup lang="ts">
import { io } from 'socket.io-client'

import type { ChatRoom, AdminChatQueueExtended, AdminChatQueue } from '~/models/chat'
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
const selectedParticipantToAddToChat = ref()

interface Props {
  listChatRoom: ChatRoom[]
  activeChatData?: ChatRoom | null
  adminChatQueue?: AdminChatQueue | null
}

const props = withDefaults(defineProps<Props>(), {})

const emits = defineEmits([
  'update-active-chat',
  'updateChatListLoading',
  'updateAdminChatQueue',
  'toggleGlobalLoading',
  'updateChatListData',
  'updateActiveChatDetails',
  'updateChattingContainerLoading',
])

const {
  public: { socketUrl },
} = useRuntimeConfig()
const socket = io(socketUrl)


function emitLoading(isLoading: boolean) {
  emits('updateChattingContainerLoading', isLoading)
}

async function handleAddAdminChatIndex() {
  if (
    !props.adminChatQueue?.queue?.length ||
    props.listChatRoom.filter((chatRoom) => !chatRoom.closed_at).length >= 3
  ) {
    return
  }

  emits('toggleGlobalLoading', true)

  try {
    const { data, error } = await useApi<Response<AdminChatQueueExtended>>('/chats/assign', {
      method: 'POST',
    })

    if (data.value?.ok) {
      const tempListChatRoom = [...props.listChatRoom]
      tempListChatRoom.push(data.value?.data?.assigned_chat_room)

      // Sorting listChatRoom based on last_message.created_at and status
      tempListChatRoom.sort((a, b) => {
        if (a.status === 'ACTIVE' && b.status !== 'ACTIVE') {
          return -1
        } else if (a.status !== 'ACTIVE' && b.status === 'ACTIVE') {
          return 1
        } else {
          return b.last_message.created_at - a.last_message.created_at
        }
      })

      const otherParticipantIndex =
        data.value?.data?.assigned_chat_room?.participant?.findIndex((item) => item?.user_id !== user?.id) ?? 0

      emits('updateChatListData', tempListChatRoom)
      socket.emit('submit-message-queue', data.value?.data?.remaining_queue ?? [])
      socket.emit(
        'accept-admin-chat',
        data.value?.data?.assigned_chat_room ?? {},
        data.value?.data?.assigned_chat_room?.participant[otherParticipantIndex]?.user_id ?? ''
      )
    } else {
      const errMsg = error.value?.data?.message ?? 'An Error was Accrued, Please try again6'
      toast.add({ message: errMsg, type: "error" })
    }
  } catch (e: any) {
    const errMsg = e?.value?.data?.message || 'An Error was Accrued, Please try again7'
    toast.add({ message: errMsg, type: "error" })
  } finally {
    emits('toggleGlobalLoading', false)
  }
}

function handleCloseModalCreateChat() {
  openModalCreateChat.value = false
}

const handleCreateChat = async () => {
  openModalCreateChat.value = true
  selectedParticipantToAddToChat.value = ''
  openModalCreateChat.value = true
  loadingGetListCustomer.value = true

  try {
    const { data, error } = await useApi<Response<User[]>>('/admin/chat-rooms/customer?per_page=1000', {
      method: 'GET',
    })

    if (data.value?.data) {
      console.log(data.value?.data)
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
    const { data, error } = await useApi<UpsertResponse<ChatRoom>>('/chats/add-participant', {
      method: 'POST',
      body: {
        room_id: props?.activeChatData?.id ?? '',
        admin_id: selectedParticipantToAddToChat.value ?? '',
      },
    })

    if (data.value?.ok) {
      toast.add({ message: 'Participant added successfully', type: "success" })

      const chatIndex = props?.listChatRoom?.findIndex((item) => item?.id === props?.activeChatDetails?.chat_room?.id)

      if (chatIndex !== undefined && chatIndex > -1 && props.listChatRoom) {
        const tempListChat = [...props.listChatRoom]
        tempListChat[chatIndex] = { ...tempListChat[chatIndex], ...data.value?.data }

        emits('updateChatListData', tempListChat)
        emits('triggerFetchChatRoomDetails')
      }
    }
    else if (data.value?.status === false) {
      toast.add({ message: 'Participant already exists in this chat', type: "error" })
    }
    else {
      const errMsg = error.value?.data?.message ?? 'Failed to add participant, please try again1'
      toast.add({ message: errMsg, type: "error" })
    }
  } catch (e: any) {
    console.log(e)
    const errMsg = e?.value?.data?.message || 'Failed to add participant, please try again2'
    toast.add({ message: errMsg, type: "error" })
  } finally {
    emitLoading(false)
    openModalAddNewParticipant.value = false
  }
}
</script>

<style scoped></style>

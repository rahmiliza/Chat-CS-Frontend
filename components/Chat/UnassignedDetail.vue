<template>
  <div class="flex flex-col grow relative h-full">
    <template v-if="chattingContainerLoading">
      <LoadingIndicator />
    </template>

    <div class=" w-full flex justify-between items-center border-b border-slate-300/50 px-2 py-1.5">
      <div class="w-full text-lg font-bold truncate ml-2 text-black">
        <template v-if="activeChatData?.participant && activeChatData.participant.length > 2">
          {{
            activeChatData?.participant
              .filter((p) => p.display_name !== user?.name)
              .map((p) => p.display_name)
              .join(', ')
          }}
        </template>
        <template v-else class="text-black">
          <div class="text-xs font-normal text-gray-400">Customer</div>
          <div>{{ activeChatData?.participant?.[getOtherParticipantIndex()]?.display_name }}</div>

        </template>
      </div>

      <div class="flex items-center gap-2">
        <!-- <DPermissionGuard v-if="!activeChatData?.closed_at" permission="chat_room::add_participant"> -->
        <UITooltip tooltip-text="Accept Chat" direction="bottom-right">
          <Icon name="hugeicons:checkmark-badge-01"
            class="ml-auto font-bold p-2 rounded-lg text-2xl text-red-500 hover:cursor-pointer hover:brightness-110 active:brightness-90 hover:bg-red-700"
            @click="handleAssigned" />
        </UITooltip>
        <!-- </DPermissionGuard> -->
        <!-- <DPermissionGuard v-if="!activeChatData?.closed_at" permission="chat_room::finish">
      <UITooltip tooltip-text="Finish Chat" direction="bottom-right">
        <Icon name="uil:plus"
          class="ml-2 font-bold p-2 rounded-lg text-2xl text-red-600 hover:cursor-pointer hover:brightness-110 active:brightness-90 hover:bg-red-300/50"
          @click="handleFinishChat" />
      </UITooltip>
      </DPermissionGuard> -->
        <UITooltip tooltip-text="Minimize Chat" direction="bottom-right">
          <Icon name="hugeicons:cancel-01"
            class="font-bold p-2 rounded-lg text-2xl text-red-500 hover:cursor-pointer hover:brightness-110 active:brightness-90 hover:bg-red-700"
            @click="
              () => {
                emits('updateActiveChat', null)
              }
            " />
        </UITooltip>
      </div>
    </div>
    <div class="w-full flex flex-col flex-1 h-[calc(100%-50px)]">
      <div ref="chatList" v-scroll="onScroll" class="h-full w-full overflow-y-auto flex flex-col p-4 gap-2">
        <template v-for="chat in activeChatDetails?.chats" :key="chat?.id">
          <ChatUnassignedBubble :chat="chat" :active-chat-details="activeChatDetails" />
        </template>
      </div>
    </div>
  </div>
  <div v-if="uploadedFiles.length > 0"
    class="absolute flex items-center justify-center z-50 top-0 left-0 w-screen h-screen bg-slate-500/50 px-20">
    <div class="relative flex flex-col w-fit h-fit bg-white rounded-lg justify-between shadow-xl">
      <div v-if="uploadedFiles[0].loading" class="w-full h-full flex justify-center items-center">
        <LoadingIndicator />
      </div>
      <div class="mt-4 pr-4 flex items-center justify-end">
        <Icon name="hugeicons:cancel-01" class="text-2xl hover:cursor-pointer hover:text-red-500 active:text-red-700" @click="
          () => {
            uploadedFiles = []
          }
        " />
      </div>
      <div
        class="mt-4 bg-slate-200 w-[500px] min-h-[400px] bg-contain bg-no-repeat flex overflow-hidden bg-center justify-center items-center"
        :style="{
          'background-image': `url('${uploadedFiles[0]?.url}')`,
        }"></div>
      <div class="mt-4 pb-4 pr-4 flex items-center justify-end">
        <button
          class="text-white bg-red-700 hover:bg-red-800 focus:ring-2 focus:ring-red-300 font-medium rounded-lg text-sm px-5 py-2.5 mb-2 w-28"
          @click="() => handleRequestSendMessage('IMAGE')">
          Send
        </button>
      </div>
    </div>
  </div>
  <input ref="fileInput" type="file" accept="image/*" :multiple="false" class="hidden" @input="handleFileInput" />

  <!-- * Modal Adding Participant -->
  <UIModals v-model="openModalAddNewParticipant" modal-title="Add Participant" :show-overflow="true"
    :on-ok="handleOkAddNewParticipant" :on-close-modal="handleCloseModalAddNewParticipant"
    :disabled-btn-ok="!selectedParticipantToAddToChat">
    <template #modal-content>
      <div class="w-[400px] h-[80px] select-none overflow-y-visible">
        <template v-if="loadingGetListAdmin">
          <UISkeleton />
        </template>
        <template v-else>
          <div class="mt-2 mb-1 text-gray-500 text-sm">Admin</div>
          <UISelect v-model="selectedParticipantToAddToChat" placeholder="Choose one Admin"
            :options="listAdminOptions" />
        </template>
      </div>
    </template>
  </UIModals>

  <UIConfirmModal v-model="showConfirm" class="text-lg font-bold" title="Chat Acceptance Confirmation" message="Will you accept this chat?"
    @confirm="handleOkAddNewParticipant"/>
</template>

<script setup lang="ts">

import { io } from 'socket.io-client'

import { vScroll } from '@vueuse/components'
import type { UseScrollReturn } from '@vueuse/core'

import { Menu, MenuButton, MenuItems, MenuItem } from '@headlessui/vue'


import type {
  ChatRoom,
  ChatRoomDetails,
  Chat,
} from '~/models/chat'

interface Props {
  activeChatData?: ChatRoom | null
  activeChatDetails: ChatRoomDetails
  activeChatDetailsPagination?: CursorPaginationResponse
  listChatRoom?: ChatRoom[]
  chattingContainerLoading: boolean
}

const props = withDefaults(defineProps<Props>(), {})

const emits = defineEmits([
  'updateChattingContainerLoading',
  'updateActiveChatDetails',
  'triggerFetchChatRoomDetails',
  'updateActiveChat',
  'updateChatListData',
  'toggleGlobalLoading',
])

const { user } = useAuthStore();
const toast = useToast();
const showConfirm = ref(false)

const {
  public: { socketUrl },
} = useRuntimeConfig()
const socket = io(socketUrl)

const loadingGetListAdmin = ref(false)

const listAdminOptions = ref<Option[]>([])

const chatList = ref<HTMLElement | null>(null)
const fileInput = ref<HTMLInputElement | null>(null)
const message = ref()

const uploadedFiles = ref<TemporaryFileUpload[]>([])

const openModalAddNewParticipant = ref(false)

const selectedParticipantToAddToChat = ref()

let debounceTimeout: ReturnType<typeof setTimeout> | null = null

function onScroll(state: UseScrollReturn) {
  if (debounceTimeout) {
    clearTimeout(debounceTimeout)
  }

  debounceTimeout = setTimeout(() => {
    const { arrivedState } = state
    const { top } = arrivedState

    if (top && props?.activeChatDetailsPagination?.has_next) {
      emits('triggerFetchChatRoomDetails')
    }
  }, 200) // Adjust the debounce delay as needed
}

function triggerFileInputClick() {
  fileInput.value?.click()
}

const handleAssigned = () => {
  if (props?.activeChatData?.closed_at) return

  showConfirm.value = true
}

function emitLoading(isLoading: boolean) {
  emits('updateChattingContainerLoading', isLoading)
}

function getOtherParticipantIndex() {
  if (!props.activeChatData) return 0

  const otherParticipantIndex = props?.activeChatData?.participant?.findIndex((item) => item?.user_id !== user?.id)

  if (otherParticipantIndex > -1) return otherParticipantIndex

  return 0
}

async function handleAddingParticipant() {
  selectedParticipantToAddToChat.value = ''
  openModalAddNewParticipant.value = true
  loadingGetListAdmin.value = true
  try {
    const { data, error } = await useApi<UpsertResponse<User[]>>('/admins?per_page=1000', {
      method: 'GET',
    })

    if (data.value?.data) {
      listAdminOptions.value =
        data.value?.data?.map((item: User) => {
          const isParticipant = props.activeChatData?.participant.some((participant) => participant.user_id === item.id)
          return { value: item?.id ?? '', label: item?.name ?? '', disabled: isParticipant }
        }) ?? []
    } else {
      const errMsg = error.value?.data?.message ?? 'Failed to fetch admin list, please try again'
      toast.add({ message: errMsg, type: "error" })
    }
  } catch (e: any) {
    const errMsg = e?.value?.data?.message || 'Failed to fetch admin list, please try again'
    toast.add({ message: errMsg, type: "error" })
  } finally {
    loadingGetListAdmin.value = false
  }
}

function handleCloseModalAddNewParticipant() {
  openModalAddNewParticipant.value = false
}

async function handleOkAddNewParticipant() {
  emitLoading(true)

  try {
    const { data, error } = await useApi<UpsertResponse<ChatRoom>>('new/admin/chat-rooms/' + props?.activeChatData?.id + '/chat-participant', {
      method: 'POST',
      body: {
        room_id: props?.activeChatData?.id ?? '',
        users: [user],
      },
    })

    if (data.value?.ok) {
      toast.add({ message: 'Assigned chat successfully', type: "success" })

      const updatedList = props.listChatRoom?.filter(item => item?.id !== data.value?.data?.id)
      emits('updateChatListData', updatedList)
      emits('updateActiveChat', null)

      socket.emit('accept-admin-chat', data.value?.data, data.value?.data?.id, data.value?.data?.participant[getOtherParticipantIndex()]?.user_id ?? '');

    } else {
      const errMsg = error.value?.data?.message ?? 'Failed to add participant, please try again'
      toast.add({ message: errMsg, type: "error" })
    }
  } catch (e: any) {
    const errMsg = e?.value?.data?.message || 'Failed to add participant, please try again'
    toast.add({ message: errMsg, type: "error" })
  } finally {
    emitLoading(false)
    openModalAddNewParticipant.value = false
  }
}

async function handleRequestSendMessage(message_type: 'TEXT' | 'IMAGE' = 'TEXT') {
  let chatMessage = message.value

  if (message_type === 'IMAGE') {
    chatMessage = uploadedFiles.value[0]?.id
    uploadedFiles.value = []
  }

  emitLoading(true)

  try {
    const otherParticipantId = props?.activeChatData?.participant[getOtherParticipantIndex()]?.user_id

    const { data, error } = await useApi<UpsertResponse<Chat>>(`new/admin/chat-rooms/${props?.activeChatData?.id}/chat`, {
      method: 'POST',
      body: {
        message: chatMessage ?? '',
        chat_room_id: props?.activeChatData?.id ?? '',
        message_type: message_type ?? 'TEXT',
      },
    })

    if (data.value?.status) {
      message.value = null

      const roomValue = {
        ...props.activeChatDetails?.chat_room,
        last_message: data.value?.data,
      }

      socket.emit('send-message', roomValue, props.activeChatData?.id, otherParticipantId)
    } else {
      const errMsg = error.value?.data?.message ?? 'An Error was Accrued, Please try again'
      toast.add({ message: errMsg, type: "error" })
    }
  } catch (e: any) {
    const errMsg = e?.value?.data?.message || 'An Error was Accrued, Please try again'
    toast.add({ message: errMsg, type: "error" })
  } finally {
    emitLoading(false)
  }
}
</script>

<style scoped></style>

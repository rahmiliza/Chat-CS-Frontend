<template>
  <div class="relative h-full w-[calc(100%-336px)]">
    <template v-if="chattingContainerLoading">
      <!-- <shell-indicator-loading /> -->
       
       
    </template>
    <div>
      <h1 class="text-xl overflow font-semibold text-slate-700  my-3"> Now, You have chat room with Admin Xinchuan </h1>
    </div>
    <div class="h-14 bg-blue-300 w-full flex justify-between items-center border-b border-black px-2 ">
    
      <div class="w-full text-lg font-bold truncate ml-2 dark:text-black">
        <template v-if="activeChat?.participant && activeChat.participant.length > 2">
          {{
            activeChat?.participant
              .filter((p) => p.display_name !== user?.name)
              .map((p) => p.display_name)
              .join(', ')
          }}
        </template>
        <template v-else class= "text-black">
          {{ activeChat?.participant[getOtherParticipantIndex()]?.display_name  + '"Admin"'
          
          
          }}
        </template>
      </div>

      <!-- <decorators-permission-guard v-if="!activeChat?.closed_at" permission="chat_room::add_participant">
        <shell-tooltip tooltip-text="Add Participant" direction="bottom-right">
          <fa-icon icon="user-plus"
            class="ml-auto font-bold p-2 rounded-lg text-2xl text-red-600 hover:cursor-pointer hover:brightness-110 active:brightness-90 hover:bg-red-300/50"
            @click="handleAddingParticipant" />
        </shell-tooltip>
      </decorators-permission-guard>
      <decorators-permission-guard v-if="!activeChat?.closed_at" permission="chat_room::finish">
        <shell-tooltip tooltip-text="Finish Chat" direction="bottom-right">
          <fa-icon icon="flag-checkered"
            class="ml-2 font-bold p-2 rounded-lg text-2xl text-red-600 hover:cursor-pointer hover:brightness-110 active:brightness-90 hover:bg-red-300/50"
            @click="handleFinishChat" />
        </shell-tooltip>
      </decorators-permission-guard> -->
      <!-- <shell-tooltip tooltip-text="Minimize Chat" direction="bottom-right">
        <fa-icon icon="down-left-and-up-right-to-center"
          class="ml-2 font-bold p-2 rounded-lg text-2xl text-red-600 hover:cursor-pointer hover:brightness-110 active:brightness-90 hover:bg-red-300/50"
          @click="
            () => {
              emits('updateActiveChat', null)
            }
          " />
      </shell-tooltip> -->
    </div>
    <div class="h-[calc(100%-56px)] w-full flex flex-col">
      <div ref="chatList" v-scroll="onScroll" class="h-full bg-blue-50 w-full overflow-y-auto flex flex-col-reverse px-4 mb-2 py-4">
        <template v-for="chat in activeChatDetails?.chats" :key="chat?.id">
          <ChatBubble :chat="chat" :active-chat-details="activeChatDetails" />
        </template>
      </div>
      <decorators-permission-guard v-if="!activeChat?.closed_at" permission="chat::store">
        <div class="flex items-center">
          <Menu>
            <div>
              <MenuButton class=" inline-flex w-full relative">
                <fa-icon icon="paperclip"
                  class="font-bold rounded-sm text-xl text-red-600 hover:cursor-pointer hover:brightness-110 active:brightness-90 hover:bg-red-300/50" />
              </MenuButton>
            </div>

            <transition enter-active-class="transition duration-100 ease-out"
              enter-from-class="transform scale-95 opacity-0" enter-to-class="transform scale-100 opacity-100"
              leave-active-class="transition duration-75 ease-in" leave-from-class="transform scale-100 opacity-100"
              leave-to-class="transform scale-95 opacity-0">
              <MenuItems
                class="absolute z-50 left-[12px] bottom-[48px] mt-2 w-56 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black/5 focus:outline-none">
                <div class="px-1 py-1">
                  <MenuItem v-slot="{ active }">
                  <button :class="[
                    active ? 'bg-red-500 text-white' : 'text-black',
                    'group flex w-full items-center rounded-md px-2 py-2 text-sm',
                  ]" @click="triggerFileInputClick">
                    <fa-icon icon="image" class="mr-2" :class="active ? 'bg-red-500 text-white' : 'text-red-600'" />
                    Image
                  </button>
                  </MenuItem>
                </div>
              </MenuItems>
            </transition>
          </Menu>
          <input v-model="message" placeholder="Enter Message"
            class="w-full p-2 dark:bg-slate-900 bg-white rounded-lg border border-slate-400 resize-none overflow-hidden max-h-20 text-sm outline-none focus:border-red-500"
            rows="1" @keydown.enter="() => handleRequestSendMessage('TEXT')" />
        </div>
      </decorators-permission-guard>
    </div>
  </div>
  <div v-if="uploadedFiles.length > 0"
    class="absolute flex items-center justify-center z-50 top-0 left-0 w-screen h-screen bg-slate-500/50 px-20">
    <div class="relative flex flex-col w-fit h-fit bg-white rounded-lg justify-between shadow-xl">
      <div v-if="uploadedFiles[0].loading" class="w-full h-full flex justify-center items-center">
        <!-- <shell-indicator-loading /> -->
      </div>
      <div class="mt-4 pr-4 flex items-center justify-end">
     s

        <Icon name="hugeicons:cancel-01" class="text-2xl hover:cursor-pointer hover:text-blue-500 active:text-blue-700"
          @click="
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
  <!-- <modals v-model="openModalAddNewParticipant" modal-title="Add Participant" :show-overflow="true"
    :on-ok="handleOkAddNewParticipant" :on-close-modal="handleCloseModalAddNewParticipant"
    :disabled-btn-ok="!selectedParticipantToAddToChat">
    <template #modal-content>
      <div class="w-[400px] h-[80px] select-none overflow-y-visible">
        <template v-if="loadingGetListAdmin">
          <shell-indicator-skeleton />
        </template>
        <template v-else>
          <div class="mt-2 mb-1 text-gray-500 text-sm">Admin</div>
          <input-select v-model="selectedParticipantToAddToChat" placeholder="Choose one Admin"
            :options="listAdminOptions" />
        </template>
      </div>
    </template>
  </modals> -->
</template>

<script setup lang="ts">

import { io } from 'socket.io-client'


import { vScroll } from '@vueuse/components'
import type { UseScrollReturn } from '@vueuse/core'

import { Menu, MenuButton, MenuItems, MenuItem } from '@headlessui/vue'
import type { Chat, ChatRoom, ChatRoomDetails } from '~/models/chat'
import type { Response, ResponseWithMessage } from '~/models/response'
import { ChatChatting } from '#components'

const toast = useToast();

interface Props {
  activeChat?: ChatRoom | null
  activeChatDetails: ChatRoomDetails
  activeChatDetailsPagination?: CursorPaginationResponse
  listChatRoom?: ChatRoom[]
  chattingContainerLoading?: boolean
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

const { user } = useAuthStore()

const {
  public: { socketUrl },
} = useRuntimeConfig()
const socket = io(socketUrl)

const startChatMessage = (msg: string) => {
  message.value = msg;
  handleRequestSendMessage('TEXT')
}

defineExpose({
  startChatMessage
});

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

async function handleFileInput(event: Event) {
  const tempId = Math.random().toString(36).substr(2)
  const target = event.target as HTMLInputElement

  if (target.files && target.files[0]) {
    uploadedFiles.value = []
    uploadedFiles.value = [
      {
        id: tempId,
        type: 'x-temporary',
        loading: true,
      },
    ]

    const payload = new FormData()

    payload.append('file', target.files[0])

    try {
      const { data } = await useApi<UpsertResponse<TemporaryFileUpload>>('/storage/temporary', {
        method: 'POST',
        body: payload,
      })

      uploadedFiles.value[0].url = data.value?.data?.url
      uploadedFiles.value[0].id = data.value?.data?.id
    } catch (error) {
      uploadedFiles.value[0].error = true
    } finally {
      uploadedFiles.value[0].loading = false
    }
  }

  target.value = ''
}

function emitLoading(isLoading: boolean) {
  emits('updateChattingContainerLoading', isLoading)
}

function getOtherParticipantIndex() {
  if (!props.activeChat) return 0

  const otherParticipantIndex = props?.activeChat?.participant?.findIndex((item) => item?.user_id !== user?.id)

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
        data.value?.data?.map((item) => {
          const isParticipant = props.activeChat?.participant.some((participant) => participant.user_id === item.id)
          return { value: item?.id ?? '', label: item?.name ?? '', disabled: isParticipant }
        }) ?? []
    } else {
      const errMsg = error.value?.data?.message ?? 'Failed to fetch admin list, please try again'
      toast.error(errMsg)
    }
  } catch (e: any) {
    const errMsg = e?.value?.data?.message || 'Failed to fetch admin list, please try again'
    toast.error(errMsg)
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
    const { data, error } = await useApi<UpsertResponse<ChatRoom>>('/chats/add-participant', {
      method: 'POST',
      body: {
        room_id: props?.activeChat?.id ?? '',
        admin_id: selectedParticipantToAddToChat.value ?? '',
      },
    })

    if (data.value?.ok) {
      toast.success('Participant added successfully')

      const chatIndex = props?.listChatRoom?.findIndex((item) => item?.id === props?.activeChatDetails?.chat_room?.id)

      if (chatIndex !== undefined && chatIndex > -1 && props.listChatRoom) {
        const tempListChat = [...props.listChatRoom]
        tempListChat[chatIndex] = { ...tempListChat[chatIndex], ...data.value?.data }

        emits('updateChatListData', tempListChat)
        emits('triggerFetchChatRoomDetails')
      }
    } else {
      const errMsg = error.value?.data?.message ?? 'Failed to add participant, please try again'
      toast.error(errMsg)
    }
  } catch (e: any) {
    const errMsg = e?.value?.data?.message || 'Failed to add participant, please try again'
    toast.error(errMsg)
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
    const otherParticipantId = props?.activeChat?.participant[getOtherParticipantIndex()]?.user_id

    const { data, error } = await useApi<ResponseWithMessage<Chat>>(`/chat-rooms/${props?.activeChat?.id}/chat`, {
      method: 'POST',
      body: {
        message: chatMessage ?? '',
        chat_room_id: props?.activeChat?.id ?? '',
        message_type: message_type ?? 'TEXT',
      },
    })

    if (data.value?.status) {
      message.value = null

      const roomValue = {
        ...props.activeChatDetails?.chat_room,
        last_message: data.value?.data,
      }
      socket.emit('send-message', roomValue, props.activeChat?.id, otherParticipantId)
    } else {
      const errMsg = error.value?.data?.message ?? 'An Error was Accrued, Please try again1'
      toast.add({ message: errMsg, type: "error" })
    }
  } catch (e: any) {
    const errMsg = e?.value?.data?.message || 'An Error was Accrued, Please try again2'
    toast.add({ message: errMsg, type: "error" })
  } finally {
    emitLoading(false)
  }
}


async function handleFinishChat() {
  emits('toggleGlobalLoading', true)

  try {
    const { data, error } = await useApi<UpsertResponse<ChatRoom>>('/admin/chat-rooms/' + activeChatDetails?.chat_room?.id + '/close-chat', {
      method: 'PUT',
      body: {
        room_id: props.activeChatDetails?.chat_room?.id,
      },
    })

    if (data.value?.ok) {
      const chatIndex = props?.listChatRoom?.findIndex((item) => item?.id === props?.activeChatDetails?.chat_room?.id)

      if (chatIndex !== undefined && chatIndex > -1 && props.listChatRoom) {
        socket.emit(
          'finish-chat-room',
          props?.activeChatDetails?.chat_room?.id,
          props?.activeChatDetails?.chat_room?.participant?.[getOtherParticipantIndex()]?.user_id ?? ''
        )

        const tempListChat = [...props.listChatRoom]
        tempListChat[chatIndex] = { ...tempListChat[chatIndex], ...data.value?.data }

        // Sorting listChatRoom based on last_message.created_at and status
        tempListChat.sort((a, b) => {
          if (a.status === 'ACTIVE' && b.status !== 'ACTIVE') {
            return -1
          } else if (a.status !== 'ACTIVE' && b.status === 'ACTIVE') {
            return 1
          } else {
            return b.last_message.created_at - a.last_message.created_at
          }
        })
        emits('updateChatListData', tempListChat)
        emits('updateActiveChat', null)
      }
    } else {
      const errMsg = error.value?.data?.message ?? 'An Error was Accrued, Please try again'
      toast.error(errMsg)
    }
  } catch (e: any) {
    const errMsg = e?.value?.data?.message || 'An Error was Accrued, Please try again'
    toast.error(errMsg)
  } finally {
    emits('toggleGlobalLoading', false)
  }
}

</script>

<style scoped></style>

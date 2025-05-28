<template>
  <div class="flex flex-col grow relative h-full" v-if="activeChatDetails?.chat_room?.status !== 'CLOSED'">
    <template v-if="chattingContainerLoading">
      <LoadingIndicator />
    </template>


    <div
      class=" w-full flex justify-between items-center border-b border-slate-300/50 px-2 py-3 bg-blue-400/20 dark:text-black">
      <div class="w-full text font-semibold truncate ml-2 text-gray-800">

        <template v-if="activeChatData?.participant && activeChatData.participant.length > 2">
          {{
            activeChatData?.participant
              .filter((p) => p.display_name !== user?.name)
              .map((p) => p.display_name)
              .join(', ')
          }}
        </template>
        <template v-else class="text-black">
          {{ activeChatData?.participant?.[getOtherParticipantIndex()]?.display_name }}
        </template>
      </div>
      <div class="flex gap-2">
        <DPermissionGuard v-if="!activeChatData?.closed_at" permission="chat_room::add_participant">
          <!-- <UITooltip tooltip-text="Add Participant" direction="bottom-right">
          <Icon name="hugeicons:user-add-02"
            class="ml-auto font-bold p-2 rounded-lg text-2xl text-blue-500 hover:cursor-pointer hover:brightness-110 active:brightness-90 hover:bg-blue-800"
            @click="handleAddingParticipant" />
        </UITooltip> -->
        </DPermissionGuard>
        <DPermissionGuard v-if="!activeChatData?.closed_at" permission="chat_room::finish">
          <UITooltip tooltip-text="Finish Chat" direction="bottom-right">
            <Icon name="hugeicons:flag-01"
              class="font-bold p-2 rounded-lg text-2xl text-blue-500 hover:cursor-pointer hover:brightness-110 active:brightness-90 hover:bg-blue-800"
              @click="showFinishConfirm = true" />
          </UITooltip>
        </DPermissionGuard>
        <UITooltip tooltip-text="Minimize Chat" direction="bottom-right">
          <Icon name="hugeicons:arrow-shrink-02"
            class="font-bold p-2 rounded-lg text-2xl text-blue-500 hover:cursor-pointer hover:brightness-110 active:brightness-90 hover:bg-blue-800"
            @click="
              () => {
                emits('updateActiveChat', null)
              }
            " />
        </UITooltip>
      </div>
    </div>
    <div class="w-full flex flex-col flex-1 h-[calc(100%-87px)]">
      <div ref="chatList" v-scroll="onScroll"
        class="h-full w-full bg-blue-50/20 overflow-y-auto flex flex-col-reverse p-4 gap-2">
        <template v-for="chat in activeChatDetails?.chats" :key="chat?.id">
          <ChatBubble :chat="chat" :active-chat-details="activeChatDetails" />
        </template>
      </div>
      <!-- <DPermissionGuard v-if="!activeChatData?.closed_at" permission="chat::store"> -->
      <!-- <DPermissionGuard v-if="!activeChatData?.closed_at" permission="chat::store"> -->
      <div class="flex gap-2 items-center px-4">
        <Menu>
          <div>
            <MenuButton class="inline-flex w-full relative">
              <Icon name="hugeicons:attachment"
                class="font-bold p-2 rounded-lg text-xl text-blue-600 hover:cursor-pointer hover:brightness-110 active:brightness-90 hover:bg-blue-300/50" />
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
                  active ? 'bg-blue-500 text-white' : 'text-black',
                  'group flex w-full items-center rounded-md px-2 py-2 text-sm',
                ]" @click="triggerFileInputClick">
                  <Icon name="hugeicons:image-03" class="mr-2"
                    :class="active ? 'bg-blue-500 text-white' : 'text-blue-600'" />
                  Image
                </button>
                </MenuItem>
              </div>
            </MenuItems>
          </transition>
        </Menu>
        <input v-model="message" placeholder="Enter Message"
          class="w-full p-2 dark:bg-white bg-slate-100 rounded-lg text-black border border-slate-400 resize-none overflow-hidden max-h-20 text-sm outline-none focus:border-blue-500"
          rows="1" @keydown.enter="() => handleRequestSendMessage('TEXT')" />
      </div>
      <!-- </DPermissionGuard> -->
    </div>
  </div>
  <div v-if="uploadedFiles !== null"
    class="absolute flex items-center justify-center z-50 top-0 left-0 w-screen h-screen bg-slate-500/50 px-20">
    <div class="relative flex flex-col w-fit h-fit bg-white rounded-lg justify-between shadow-xl">
      <div class="mt-4 pr-4 flex items-center justify-end">
        <Icon name="hugeicons:cancel-01" class="text-2xl hover:cursor-pointer hover:text-blue-500 active:text-blue-700"
          @click="() => { uploadedFiles = null }" />
      </div>
      <div
        class="mt-4 bg-slate-200 w-[500px] min-h-[400px] bg-contain bg-no-repeat flex overflow-hidden bg-center justify-center items-center"
        :style="{ 'background-image': `url('${uploadedFiles?.url}')` }">
      </div>
      <div class="mt-4 pb-4 pr-4 flex items-center justify-end">
        <button
          class="text-white bg-blue-700 hover:bg-blue-800 focus:ring-2 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 mb-2 w-28"
          @click="() => handleRequestSendMessage('IMAGE')">
          Send
        </button>
      </div>
    </div>
  </div>
  <input ref="fileInput" type="file" accept="image/*" :multiple="false" class="hidden" @input="handleFileInput" />


  <UIConfirmModal v-model="showFinishConfirm" class="text-lg font-bold" title="Chat Close Confirmation"
    message="Will you close this chat?" @confirm="handleFinishChat" />
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
import type { PaginationResponse, Response } from '~/models/response'

interface Props {
  activeChatData?: ChatRoom | null
  activeChatDetails: ChatRoomDetails
  activeChatDetailsPagination?: PaginationResponse
  listChatRoom?: ChatRoom[]
  chattingContainerLoading: boolean
}

interface FileUpload {
  url?: string
  file?: File
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
const showFinishConfirm = ref(false)
const {
  public: { socketUrl },
} = useRuntimeConfig()
const socket = io(socketUrl)

const chatList = ref<HTMLElement | null>(null)
const fileInput = ref<HTMLInputElement | null>(null)
const message = ref()

const uploadedFiles = ref<FileUpload | null>(null)

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
  const target = event.target as HTMLInputElement

  if (target.files && target.files[0]) {
    const file = target.files[0]
    uploadedFiles.value = {
      file: file,
      url: URL.createObjectURL(file),
    };
  }

  target.value = ''
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


async function handleRequestSendMessage(message_type: 'TEXT' | 'IMAGE' = 'TEXT') {
  let chatMessage;

  if (message_type === 'IMAGE') {
    chatMessage = new FormData();
    chatMessage.append('image', uploadedFiles.value?.file);
    chatMessage.append('message', message.value);
    chatMessage.append('message_type', message_type);
    chatMessage.append('chat_room_id', props?.activeChatData?.id ?? '');
    uploadedFiles.value = null;
  } else {
    chatMessage = {
      message: message.value ?? '',
      chat_room_id: props?.activeChatData?.id ?? '',
      message_type: message_type ?? 'TEXT',
    };
  }

  emitLoading(true);

  try {
    const otherParticipantId = props?.activeChatData?.participant?.[getOtherParticipantIndex()]?.user_id;

    const { data, error } = await useApi<Response<Chat>>(`new/admin/chat-rooms/${props?.activeChatData?.id}/chat`, {
      method: 'POST',
      body: chatMessage,
    });

    if (data.value?.ok) {
      message.value = null;

      const roomValue = {
        ...props.activeChatDetails?.chat_room,
        last_message: data.value?.data,
      };

      socket.emit('send-message', roomValue, props.activeChatData?.id, otherParticipantId);
    } else {
      const errMsg = error.value?.data?.message ?? 'errorrr kenapa';
      toast.add({ message: errMsg, type: 'error' });
    }
  } catch (e: any) {
    const errMsg = e?.value?.data?.message || 'An Error was Accrued, Please try again2';
    toast.add({ message: errMsg, type: 'error' });
  } finally {
    emitLoading(false);
  }
}


async function handleFinishChat() {
  emits('toggleGlobalLoading', true)

  try {
    const { data, error } = await useApi<Response<ChatRoom>>('new/admin/chat-rooms/' + props.activeChatDetails?.chat_room?.id + '/close-chat', {
      method: 'POST',
      body: {
        room_id: props.activeChatDetails?.chat_room?.id,
      },
    })

    if (data.value?.ok) {
      const chatIndex = props?.listChatRoom?.findIndex((item) => item?.id === props?.activeChatDetails?.chat_room?.id)

      const tempListChat = props.listChatRoom?.filter(item => item?.id !== data.value?.data?.id)
      emits('updateChatListData', tempListChat)
      emits('updateActiveChat', null)
      if (chatIndex !== undefined && chatIndex > -1 && props.listChatRoom) {
        socket.emit(
          'finish-chat-room',
          props?.activeChatDetails?.chat_room?.id,
          props?.activeChatDetails?.chat_room?.participant?.[getOtherParticipantIndex()]?.user_id ?? ''
        )

        // const tempListChat = [...props.listChatRoom]
        // tempListChat[chatIndex] = { ...tempListChat[chatIndex], ...data.value?.data }

        // Sorting listChatRoom based on last_message.created_at and status
        // tempListChat.sort((a, b) => {
        //     return b.last_message.created_at - a.last_message.created_at
        // })
        // emits('updateChatListData', tempListChat)
        // emits('updateActiveChat', null)
      }
    } else {
      const errMsg = error.value?.data?.message ?? 'An Error was Accrued, Please try again4'
      toast.add({ message: errMsg, type: "error" })
    }
  } catch (e: any) {
    const errMsg = e?.value?.data?.message || 'An Error was Accrued, Please try again5'
    toast.add({ message: errMsg, type: "error" })
  } finally {
    emits('toggleGlobalLoading', false)
  }
}
</script>

<style scoped></style>
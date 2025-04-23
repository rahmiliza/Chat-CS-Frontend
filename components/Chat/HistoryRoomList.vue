<template>
  <div class="w-96 h-full border-r border-slate-300/50">
    <div class="h-[calc(100%-56px)] mt-4 pr-4 overflow-y-auto">
      <template v-if="listChatRoom?.length > 0">
        <template v-for="chatRoomData in listChatRoom" :key="chatRoomData?.id">
          <ChatUnassignedRoomInfo :chat-room-data="chatRoomData" :active-chat-data="activeChatData"
            @update-active-chat="$emit('update-active-chat', $event)"
            @update-active-chat-details="$emit('updateActiveChatDetails', $event)" />
        </template>
      </template>
      <template v-else>
        <div class="flex justify-center items-center h-full text-gray-400">No Chat History</div>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { io } from 'socket.io-client'

import type { ChatRoom, AdminChatQueueExtended, AdminChatQueue } from '~/models/chat'
import PermissionGuard from '../PermissionGuard.vue'


const { user } = useAuthStore();
const toast = useToast();

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
])

const {
  public: { socketUrl },
} = useRuntimeConfig()
const socket = io(socketUrl)

async function handleAddAdminChatIndex() {
  if (
    !props.adminChatQueue?.queue?.length ||
    props.listChatRoom.filter((chatRoom) => !chatRoom.closed_at).length >= 3
  ) {
    return
  }

  emits('toggleGlobalLoading', true)

  try {
    const { data, error } = await useApi<UpsertResponse<AdminChatQueueExtended>>('/chats/assign', {
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
      const errMsg = error.value?.data?.message ?? 'An Error was Accrued, Please try again'
      toast.add({message: errMsg, type: "error"})
    }
  } catch (e: any) {
    const errMsg = e?.value?.data?.message || 'An Error was Accrued, Please try again'
    toast.add({message: errMsg, type: "error"})
  } finally {
    emits('toggleGlobalLoading', false)
  }
}
</script>

<style scoped></style>

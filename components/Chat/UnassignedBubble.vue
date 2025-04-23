<template>
  <div class="w-fit max-w-[70%] px-2 pt-2 pb-1 rounded-lg text-black" :class="[
    chat?.sent_by === user?.id ? 'ml-auto' : '',
    chat?.message_type === 'TEXT' ? (chat?.sent_by === user?.id ? 'bg-red-300/60' : 'bg-slate-300/30') : 'bg-none',
  ]">
    <div v-if="activeChatDetails?.chat_room?.participant?.length > 2" class="mb-1 flex gap-2 items-center">
      <Icon :name="getRoleIcon(chat.sent_by)" :size="'1.5rem'" class="text-sm text-slate-500" />
      <div class="font-bold text-sm text-slate-700">
        {{
          activeChatDetails?.chat_room?.participant.find((participant) => participant.user_id === chat.sent_by)
            ?.display_name || 'Unknown User'
        }}
      </div>
    </div>
    <template v-if="chat?.message_type === 'TEXT'">
      <div class="break-words">
        {{ chat?.message }}
      </div>
    </template>
    <template v-if="chat?.message_type === 'IMAGE'">
      <img :src="chat?.message_attachment" alt="image"
        class="w-[260px] h-[260px] object-cover rounded-lg hover:cursor-pointer" @click="
          () => {
            selectedAttachmentUrl = chat?.message_attachment
            showModalAttachment = true
          }
        " />
    </template>
    <div class="text-[10px] text-slate-600 mt-1 text-right">
      {{ formatDatetime(chat.created_at) }}
    </div>
  </div>

  <!--* Show Attachment Modal -->
  <modals v-model="showModalAttachment" modal-title="Attachment" :footer="false" :on-close-modal="() => {
      selectedAttachmentUrl = ''
      showModalAttachment = false
    }
    ">
    <template #modal-content>
      <div class="w-[800px]">
        <div class="w-full h-[600px] bg-contain flex bg-center bg-no-repeat justify-center items-center" :style="{
          'background-image': `url('${selectedAttachmentUrl}')`,
        }"></div>
      </div>
    </template>
  </modals>
</template>

<script setup lang="ts">
import type { Chat, ChatRoomDetails } from '~/models/chat'

interface Props {
  chat: Chat
  activeChatDetails: ChatRoomDetails
}

const props = withDefaults(defineProps<Props>(), {})

const { user } = useAuthStore()

function getRoleIcon(userId: string) {
  if (userId.startsWith('drivers:')) {
    return 'moped'
  } else if (userId.startsWith('merchants:')) {
    return 'store'
  } else {
    return 'uil:house-user'
  }
}

const showModalAttachment = ref(false)
const selectedAttachmentUrl = ref('')

console.log(props.activeChatDetails);
</script>

<style scoped></style>

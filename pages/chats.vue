<template>
  <div class="flex flex-col w-full h-full -mt-5">
    <div class="flex justify-between border-b-2 border-slate-400">
      <div>
        <button v-for="(tab, index) in tabs" :key="index" @click="activeTab = index" :class="[
          'relative px-4 py-2 font-bold text-base ',
          activeTab === index
            ? 'border-b-2 border-blue-500 text-blue-600 -mb-[2px]'
            : 'text-gray-500 hover:text-blue-500'
        ]">
          {{ tab.label }}
          <!-- <div class="absolute top-0 right-0 rounded-full bg-red-500 text-white text-[8px] flex items-center justify-center px-0.5">242</div> -->
        </button>
      </div>
      <div>

        <Icon name="uil:comment-plus" size="1.8rem"
          class="font-extrabold p-2 rounded-lg text-2xl text-slate-600 hover:cursor-pointer hover:brightness-200 active:brightness-90 hover:bg-red-900"
          @click="handleCreateChat" />
      </div>
    </div>

    <ActiveChat ref="activeChatRef" v-show="activeTab === 0" />
    <UnassignedChat ref="unassignedChatRef"v-show="activeTab === 1"  />
    <HistoryChat v-if="activeTab === 2" ref="historyChatRef" />
  </div>
</template>

<script setup lang="ts">
import ActiveChat from '~/components/Chat/ActiveChat.vue'
import HistoryChat from '~/components/Chat/HistoryChat.vue'
import UnassignedChat from '~/components/Chat/UnassignedChat.vue'

const activeTab = ref(0)

const activeChatRef = ref<InstanceType<typeof ActiveChat> | null>(null)
// const unassignedChatRef = ref<InstanceType<typeof UnassignedChat> | null>(null)
// const historyChatRef = ref<InstanceType<typeof HistoryChat> | null>(null)

const tabs = [
  { label: 'Active Chats' },
  { label: 'Unassigned Chats' },
  { label: 'Chat History' },
]

const handleCreateChat = async () => {
  // Ensure roomListRef has the correct type
  const roomListRef = activeChatRef.value?.$refs?.roomListRef as { handleCreateChat: () => void } | undefined;
  roomListRef?.handleCreateChat();
}
</script>
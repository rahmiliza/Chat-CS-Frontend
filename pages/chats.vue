<template>
    <div class="flex flex-col w-full h-full -mt-4">
      <div class="flex border-b">
        <button v-for="(tab, index) in tabs" :key="index" @click="activeTab = index" :class="[
          'px-4 py-2 font-medium',
          activeTab === index
            ? 'border-b-2 border-blue-500 text-blue-600'
            : 'text-gray-500 hover:text-blue-500'
        ]">
          {{ tab.label }}
        </button>
      </div>
  
      <component :is="tabs[activeTab].component" />
    </div>
  </template>
  
  <script setup>
  import ActiveChat from '~/components/Chat/ActiveChat.vue'
  import HistoryChat from '~/components/Chat/HistoryChat.vue'
  import UnassignedChat from '~/components/Chat/UnassignedChat.vue'
  
  const activeTab = ref(0)
  const tabs = [
    { label: 'Active Chats', component: ActiveChat },
    { label: 'Unassigned Chats', component: UnassignedChat },
    { label: 'Chat History', component: HistoryChat },
  ]
  </script>
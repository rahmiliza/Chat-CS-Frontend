<template>
  <aside
    class="flex min-h-screen w-64 flex-col justify-between border-r p-2 dark:border-gray-800 dark:bg-gray-900"
  >
    <div class="flex flex-col items-center justify-center gap-2 -space-y-2">
      <span class="text-2xl font-bold mt-5">{{ $t ("sidebar.dashboard")}}</span>
      <!-- <span class="text-sm">Admin Panel</span> -->
    </div>
    <div class="flex flex-1 flex-col gap-2 py-8 font-semibold">
      <template v-for="item in menu">
        <SidebarLink v-if="'to' in item" :link="item" />
        <SidebarSection v-if="'links' in item" :item="item" />
      </template>
    </div>
    <div>
      <Button
        @click="logout"
        icon="uil:sign-out-alt"
        icon-class="text-red-500"
        class="w-full hover:bg-gray-100 dark:hover:bg-gray-700"
      >
        {{ $t("auth.logout") }}
      </Button>
    </div>
  </aside>
</template>

<script lang="ts" setup>
const { logout } = useAuthStore();
import type { Section, Link } from "~/components/Sidebar/sidebarMeta";

const menu = <Section[] | Link[]>[
  {
    label: "sidebar.dashboard",
    to: "/",
    icon: "uil:home",
  },
  {
    label: "sidebar.chats",
    to: "/chats",
    icon: "uil:comment-lines",
  },
  {
    label: "Customer Chat",
    to: "/customer",
    icon: "uil:user",
  },
  {
   label: " Manage Customers",
   to: "/listcustomer",
   icon: "uil:user",
  },
  {
    label: "Manage Roles",
    to: "/rolesUser",
    icon: "uil:user-check",
  },

  // {
  //   label: "sidebar.catalog_input",
  //   icon: "uil:file", 
  //   links: [
  //     { label:"sidebar.brand", to: "/brand", icon:"uil:book" },
  //     { label:"sidebar.category", to: "/category", icon:"uil:book" },
  //     { label:"sidebar.banner", to: "/banner", icon:"uil:book"},
  //   ],
  // },
];
</script>

<style></style>

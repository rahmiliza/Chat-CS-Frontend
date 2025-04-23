<template>
  <Button
    class="w-full bg-transparent hover:bg-gray-100 dark:hover:bg-gray-700"
    :icon="item.icon"
    @click="expanded = !expanded"
  >
    <div class="flex w-full items-center justify-between">
      {{ $t(item.label) }}
      <Icon
        :name="expanded ? 'uil:angle-up' : 'uil:angle-down'"
        size="1.5rem"
      />
    </div>
  </Button>
  <div class="flex flex-col gap-y-0.5 pl-4" v-if="expanded">
    <SidebarLink v-for="link in item.links" :key="link.to" :link="link" />
  </div>
</template>

<script lang="ts" setup>
import type { Section } from "./sidebarMeta";

const props = defineProps<{
  item: Section;
}>();

const expanded = ref(false);
const route = useRoute();

onMounted(() => {
  expanded.value = props.item.links.some((link) => isCurrentRoute(link.to));
});
</script>

<style></style>

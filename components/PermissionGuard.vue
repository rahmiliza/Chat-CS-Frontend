<script setup lang="ts">

const props = defineProps<{
  permission?: string | null
  permissions?: string[] | null
  operator?: string
}>()

const { user } = useAuthStore()
const slots = useSlots()

const allowed = computed(() => {
  if (props.permission == null && (props.permissions ?? []).length === 0) {
    return true
  }

  if (user == null) return false

  const userPermissions = (user as { userPermissions: string[] })?.userPermissions ?? []
  if (props.permissions != null) {
    const authorization = props.permissions.map((permission) => {
      return userPermissions?.includes(permission)
    })

    if (props.operator === 'or') {
      return authorization.includes(true)
    }
    return authorization.every((value) => value)
  }

  return userPermissions?.includes(props.permission!)
})

const renderSlot = () => {
  if (!allowed.value || !slots.default) {
    if (slots.placeholder) {
      return slots.placeholder()
    }
    return null
  }
  if (slots.default().length > 1) {
    return slots.default()
  }
  return slots.default()[0]
}
</script>
<template>
  <template v-if="renderSlot()">
    <slot>{{ renderSlot() }}</slot>
  </template>
</template>

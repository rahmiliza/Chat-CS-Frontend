<template>
  <div v-for="(module, moduleName, index) in modules" :key="moduleName">
    <div
      :class="['mb-1 flex gap-2 items-center', `${index !== 0 && level === 0 ? 'mt-8' : 'mt-3'}`]"
      :style="{ marginLeft: `${level * 1}rem` }"
    >
      <div class="relative">
        <input
          :id="`module-checkbox-${moduleName}`"
          type="checkbox"
          :checked="isModuleChecked(moduleName)"
          class="relative w-4 h-4 rounded-sm appearance-none border border-slate-500 hover:cursor-pointer hover:border-red-600 checked:bg-red-500 checked:border-red-500"
          @change="toggleModulePermissions(moduleName)"
        />
        <Icon
          v-if="isModuleChecked(moduleName)"
          name="hugeicons:checkmark-circle-01"
          class="absolute pointer-events-none w-4 h-4 left-0 top-[2px] text-sm font-bold text-white"
        />
      </div>
      <div :id="`module-${moduleName}`" class="font-bold text-lg">
        {{ moduleName }}
      </div>
    </div>

    <div
      v-for="permission in module.permissions"
      :key="permission.id"
      class="flex items-center mb-1 ml-4"
      :style="{ marginLeft: `${level * 1}rem` }"
    >
      <div class="relative">
        <input
          :id="`permission-${permission.id}`"
          type="checkbox"
          class="w-4 h-4 rounded-sm appearance-none border border-slate-500 hover:cursor-pointer hover:border-red-600 checked:bg-red-500 checked:border-red-500"
          :checked="formUserInputForEditingRole.permissions.includes(permission.id)"
          @change="updatePermissions(permission.id)"
        />
        <fa-icon
          v-if="formUserInputForEditingRole.permissions.includes(permission.id)"
          icon="check"
          class="absolute pointer-events-none w-4 h-4 left-0 top-[2px] text-sm font-bold text-white"
        />
      </div>
      <shell-tooltip :tooltip-text="permission.description" direction="right">
        <label :for="`permission-${permission.id}`" class="ml-2 select-none hover:cursor-pointer">
          {{ permission.name }}
        </label>
      </shell-tooltip>
    </div>

    <PermissionList
      v-if="Object.keys(module.sub_modules).length"
      :modules="module.sub_modules"
      :level="level + 1"
      :form-user-input-for-editing-role="formUserInputForEditingRole"
      @update-form-user-input-for-editing-role="emit('updateFormUserInputForEditingRole', $event)"
    />
  </div>
</template>

<script setup lang="ts">
const props = defineProps({
  modules: {
    type: Object,
    required: true,
  },
  level: {
    type: Number,
    default: 0,
  },
  formUserInputForEditingRole: {
    type: Object,
    required: true,
  },
})

const emit = defineEmits<{
  (event: 'updateFormUserInputForEditingRole', value: { name: string; permissions: number[] }): void
}>()

const isModuleChecked = (module: string) => {
  const permissions = props.modules[module]?.permissions ?? []
  return permissions.every((permission: any) => props.formUserInputForEditingRole.permissions.includes(permission?.id))
}

const toggleModulePermissions = (module: string) => {
  const permissions = props.modules[module]?.permissions ?? []
  const allChecked = isModuleChecked(module)
  let updatedPermissions = [...props.formUserInputForEditingRole.permissions]

  const updateSubModulePermissions = (subModules: any) => {
    for (const subModule of Object.keys(subModules)) {
      const subPermissions = subModules[subModule]?.permissions ?? []
      const permissionIds = subPermissions.map((permission: any) => permission.id)

      if (allChecked) {
        // Remove sub-module permissions if the module is being unchecked
        updatedPermissions = updatedPermissions.filter((permissionId: string) => !permissionIds.includes(permissionId))
      } else {
        // Add sub-module permissions if the module is being checked
        updatedPermissions = [...new Set([...updatedPermissions, ...permissionIds])]
      }
      // Recursively check sub-modules
      updateSubModulePermissions(subModules[subModule]?.sub_modules || {})
    }
  }

  // Update permissions for the current module
  if (allChecked) {
    updatedPermissions = updatedPermissions.filter(
      (permissionId: string) => !permissions.some((permission: any) => permission.id === permissionId)
    )
  } else {
    const permissionIds = permissions.map((permission: any) => permission.id)
    updatedPermissions = [...new Set([...updatedPermissions, ...permissionIds])]
  }

  // Update permissions for sub-modules
  updateSubModulePermissions(props.modules[module]?.sub_modules || {})

  emit('updateFormUserInputForEditingRole', {
    ...props.formUserInputForEditingRole,
    permissions: updatedPermissions,
    name: props.formUserInputForEditingRole.name,
  })
}

const updatePermissions = (permissionId: string) => {
  let updatedPermissions = props.formUserInputForEditingRole.permissions
  if (updatedPermissions.includes(permissionId)) {
    updatedPermissions = updatedPermissions.filter((id: any) => id !== permissionId)
  } else {
    updatedPermissions.push(permissionId)
  }
  emit('updateFormUserInputForEditingRole', {
    ...props.formUserInputForEditingRole,
    permissions: updatedPermissions,
    name: props.formUserInputForEditingRole.name,
  })
}
</script>

<style scoped></style>

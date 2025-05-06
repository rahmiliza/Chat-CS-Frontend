<template>
  <div v-for="(permissions, moduleName, index) in modules" :key="moduleName">
    <div :class="['mb-1 flex gap-2 items-center', `${index !== 0 && level === 0 ? 'mt-8' : 'mt-3'}`]"
      :style="{ marginLeft: `${level * 1}rem` }">
      <div class="relative">
        <input :id="`module-checkbox-${moduleName}`" type="checkbox" :checked="isModuleChecked(moduleName)"
          class="relative w-4 h-4 rounded-sm appearance-none border border-slate-500 hover:cursor-pointer hover:border-red-600 checked:bg-red-500 checked:border-red-500"
          @change="toggleModulePermissions(moduleName)" />
        <Icon v-if="isModuleChecked(moduleName)" name="hugeicons:checkmark-circle-01"
          class="absolute pointer-events-none w-4 h-4 left-0 top-[2px] text-sm font-bold text-white" />
      </div>
      <div :id="`module-${moduleName}`" class="font-bold text-lg">
        {{ moduleName }}
      </div>
    </div>

    <div v-for="permission in permissions" :key="permission.id" class="flex items-center mb-1 ml-4"
      :style="{ marginLeft: `${level * 1}rem` }">
      <div class="relative">
        <input :id="`permission-${permission.id}`" type="checkbox"
          class="w-4 h-4 rounded-sm appearance-none border border-slate-500 hover:cursor-pointer hover:border-red-600 checked:bg-red-500 checked:border-red-500"
          :checked="formUserInputForEditingRole.permissions.includes(permission.id)"
          @change="updatePermissions(permission.id)" />
        <fa-icon v-if="formUserInputForEditingRole.permissions.includes(permission.id)" icon="check"
          class="absolute pointer-events-none w-4 h-4 left-0 top-[2px] text-sm font-bold text-white" />
      </div>
      <shell-tooltip :tooltip-text="permission.description" direction="right">
        <label :for="`permission-${permission.id}`" class="ml-2 select-none hover:cursor-pointer">
          {{ permission.name }}
        </label>
      </shell-tooltip>
    </div>
  </div>
</template>


<script setup lang="ts">
import type { Permission } from '~/models/role';

const props = defineProps<{
  modules: Record<string, Permission[]>;
  level?: number;
  formUserInputForEditingRole: {
    name: string;
    permissions: number[];
  };
}>();

const emit = defineEmits<{
  (event: 'updateFormUserInputForEditingRole', value: { name: string; permissions: number[] }): void
}>()

const isModuleChecked = (module: string) => {
  const permissions = props.modules[module] ?? [];
  return permissions.every((permission) =>
    props.formUserInputForEditingRole.permissions.includes(permission.id)
  );
};

const toggleModulePermissions = (module: string) => {
  const permissions = props.modules[module] ?? [];
  const allChecked = isModuleChecked(module);
  let updatedPermissions = [...props.formUserInputForEditingRole.permissions];
  const permissionIds = permissions.map((p) => p.id);

  if (allChecked) {
    updatedPermissions = updatedPermissions.filter(id => !permissionIds.includes(id));
  } else {
    updatedPermissions = [...new Set([...updatedPermissions, ...permissionIds])];
  }

  emit('updateFormUserInputForEditingRole', {
    ...props.formUserInputForEditingRole,
    permissions: updatedPermissions,
    name: props.formUserInputForEditingRole.name,
  });
};

const updatePermissions = (permissionId: number) => {
  let updatedPermissions = [...props.formUserInputForEditingRole.permissions];
  if (updatedPermissions.includes(permissionId)) {
    updatedPermissions = updatedPermissions.filter(id => id !== permissionId);
  } else {
    updatedPermissions.push(permissionId);
  }

  emit('updateFormUserInputForEditingRole', {
    ...props.formUserInputForEditingRole,
    permissions: updatedPermissions,
    name: props.formUserInputForEditingRole.name,
  });
};

</script>

<style scoped></style>

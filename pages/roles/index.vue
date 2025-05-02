<template>
  <div class="w-full h-full">
    <div v-if="loading">
      <LoadingIndicator />
    </div>

    <div class="flex items-center justify-end mb-4 -mt-12">
      <div class="flex items-center gap-2">
        <UISearchBar @submit="(q) => handleSearchBar(q)" />
        <button
          class="flex gap-1 dark:text-black bg-blue-500 px-4 py-2 text-white leading-2 rounded-md hover:bg-blue-600 active:bg-blue-700"
          @click="
            () => {
              formUserInputForEditingRole.name = ''
              formUserInputForEditingRole.permissions = []
              openModalCreatingNewRole = true
            }
          ">
          <Icon name="uil:plus" class="text-2xl" />
          Role
        </button>
      </div>
    </div>

    <div class="min-w-full align-middle relative min-h-full inline-flex flex-col justify-between">
      <DataTable :columns="[
        { key: 'name', label: 'Role Name', cellClass: 'border-b border-gray-200 text-left dark:border-gray-700 dark:text-black py-2' },
        { key: 'created_at', label: 'Created At' },
        { key: 'action', label: 'Action' },
      ]" keyProp="id" :rows="listRoles" :loading="loading" :pagination="paginationParams"
        :onRowExpand="handleGetRoleDetailData" expandable>
        <template #cell-created_at="{ entry }">
          <div class="whitespace-nowrap p-2 text-sm font-medium text-gray-900">
            {{ formatDatetime(entry.created_at) }}
          </div>
        </template>
        <template #cell-action="{ entry }">
          <div class="flex items-center gap-2">
            <UITooltip tooltip-text="Edit Roles" direction="bottom-right">
              <Icon name="hugeicons:pen-01"
                class="ml-auto font-bold p-2 rounded-lg text-2xl text-blue-500 hover:cursor-pointer hover:brightness-110 active:brightness-90 hover:bg-blue-800"
                @click="
                  () => {
                    getRolePermissions(entry?.id)
                    selectedRole = entry
                    openModalCreatingNewRole = true
                    openModalEditingRole = true
                  }
                " />
            </UITooltip>
            <UITooltip tooltip-text="Delete Roles" direction="bottom-right">
              <Icon name="hugeicons:delete-02"
                class="ml-auto font-bold p-2 rounded-lg text-2xl text-blue-500 hover:cursor-pointer hover:brightness-110 active:brightness-90 hover:bg-blue-800"
                @click="
                  () => {
                    selectedRole = { ...entry }
                    openModalDeleteRole = true
                  }
                " />
            </UITooltip>
          </div>
        </template>
        <template #detail="{ entry }">
          <div class="p-4 max-h-[400px] overflow-auto">
            <UISkeleton v-if="roleDetailData[entry?.id].pending === true" />
            <div v-else class="w-[100%]">
              <div class="p-4 bg-gray-100 rounded-md">
                <h3 class="text-lg font-semibold mb-2">Role Permissions</h3>
                <ul class="list-disc list-outside pl-6">
                  <li v-for="permission in roleDetailData?.[entry?.id]?.data?.permissions ?? []" :key="permission.id"
                    class="mb-1 p-2 rounded-lg border-b border-gray-300 hover:bg-gray-200">
                    <div class="font-semibold">{{ permission.name }}.</div>
                    <div class="text-sm text-gray-600">{{ permission.description }}</div>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </template>
      </DataTable>
    </div>

    <div class="min-w-full align-middle relative min-h-full inline-flex flex-col justify-between">
      <table class="min-w-full divide-y divide-gray-300">
        <thead>
          <tr>
            <th scope="col"
              class="sticky z-[1] top-0 bg-gray-200 bg-opacity-75 backdrop-blur backdrop-filter whitespace-nowrap p-2 text-left text-sm font-semibold text-gray-900">
              fa
            </th>
            <th scope="col"
              class="sticky z-[1] top-0 bg-gray-200 bg-opacity-75 backdrop-blur backdrop-filter whitespace-nowrap px-2 text-left text-sm font-semibold dark:text-gray-900 text-gray-900 h-full"
              @click="toggleSort('name')">Role Name
              <!-- <shell-table-sort-indicator :is-sorted="sortField === 'name'" :sort-direction="sortOrder"
                column-title="Name" /> -->
            </th>
            <th scope="col"
              class="sticky z-[1] top-0 bg-gray-200 bg-opacity-75 backdrop-blur backdrop-filter whitespace-nowrap px-2 text-left text-sm font-semibold text-gray-900 h-full"
              @click="toggleSort('created_at')">Created At
              <!-- <shell-table-sort-indicator :is-sorted="sortField === 'created_at'" :sort-direction="sortOrder"
                column-title="Created At" /> -->
            </th>
            <th scope="col"
              class="sticky z-[1] top-0 bg-gray-200 bg-opacity-75 backdrop-blur backdrop-filter whitespace-nowrap p-2 text-left text-sm font-semibold text-gray-900">
              Action
            </th>
          </tr>
        </thead>
        <tbody v-if="(listRoles ?? []).length > 0" class="divide-y divide-gray-200 bg-white -z-10">
          <template v-for="entry in listRoles" :key="`role-${entry.id}`">
            <tr class="even:bg-gray-50">
              <td class="whitespace-nowrap p-2 text-sm text-gray-500 tabular-nums w-4">
                <!-- <shell-table-expand-button :active="rowIsExpanded(entry?.id)"
                  @expand-btn-click="() => toggleExpanded(entry?.id)" @click="() => handleGetRoleDetailData(entry)" /> -->
              </td>
              <td class="whitespace-nowrap p-2 text-sm font-medium text-gray-900">
                {{ entry?.name }}
              </td>
              <td class="whitespace-nowrap p-2 text-sm font-medium text-gray-900 tabular-nums tracking-wider">
                {{ formatDatetime(entry.created_at) }}
              </td>
              <td class="p-2 pr-4 text-sm font-medium text-gray-900 w-0">
                <Menu as="div" class="relative inline-block">
                  <div>
                    <MenuButton
                      class="inline-flex w-full border border-slate-200 shadow-sm text-slate-500 justify-center items-center rounded-lg px-2 py-0.5 text-sm font-medium hover:bg-slate-200 active:bg-slate-300">
                      Action
                      <Icon name="chevron-down" class="ml-2 -mr-1 h-5 w-4" />
                    </MenuButton>
                  </div>

                  <transition enter-active-class="transition duration-100 ease-out"
                    enter-from-class="transform scale-95 opacity-0" enter-to-class="transform scale-100 opacity-100"
                    leave-active-class="transition duration-75 ease-in"
                    leave-from-class="transform scale-100 opacity-100" leave-to-class="transform scale-95 opacity-0">
                    <MenuItems
                      class="absolute z-50 right-0 mt-2 w-56 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black/5 focus:outline-none">
                      <div class="px-1 py-1">
                        <MenuItem v-slot="{ active }">
                        <button :class="[
                          active ? 'bg-red-500 text-white' : 'text-black',
                          'group flex w-full items-center rounded-md px-2 py-2 text-sm',
                        ]" @click="
                          () => {
                            getRolePermissions(entry?.id)
                            selectedRole = entry
                            openModalCreatingNewRole = true
                            openModalEditingRole = true
                          }
                        ">
                          <Icon name="uil:pen-to-square" class="mr-2"
                            :class="active ? 'bg-red-500 text-white' : 'text-red-600'" />
                          Edit Role
                        </button>
                        </MenuItem>
                        <MenuItem v-slot="{ active }">
                        <button :class="[
                          active ? 'bg-red-500 text-white' : 'text-black',
                          'group flex w-full items-center rounded-md px-2 py-2 text-sm',
                        ]" @click="
                          () => {
                            selectedRole = { ...entry }
                            openModalDeleteRole = true
                          }
                        ">
                          <Icon name="uil:trash" class="mr-2 text-red-600"
                            :class="active ? 'bg-red-500 text-white' : ''" />
                          Delete Role
                        </button>
                        </MenuItem>
                      </div>
                    </MenuItems>
                  </transition>
                </Menu>
              </td>
            </tr>
            <tr v-if="rowIsExpanded(entry?.id)">
              <td :colspan="4">
                <div class="p-4 max-h-[400px] overflow-auto">
                  <UISkeleton v-if="roleDetailData[entry?.id].pending === true" />
                  <div v-else class="w-[100%]">
                    <div class="p-4 bg-gray-100 rounded-md">
                      <h3 class="text-lg font-semibold mb-2">Role Permissions</h3>
                      <ul class="list-disc list-outside pl-6">
                        <li v-for="permission in roleDetailData?.[entry?.id]?.data?.permissions ?? []"
                          :key="permission.id" class="mb-1 p-2 rounded-lg border-b border-gray-300 hover:bg-gray-200">
                          <div class="font-semibold">{{ permission.name }}.</div>
                          <div class="text-sm text-gray-600">{{ permission.description }}</div>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </td>
            </tr>
          </template>
        </tbody>
        <tbody v-else-if="errGetListRoles != null">
          <tr>
            <td>
              <!-- <shell-indicator-error :error="errGetListRoles" /> -->
            </td>
          </tr>
        </tbody>
        <tbody v-else>
          <tr>
            <td>
              <!-- <shell-indicator-no-data /> -->
            </td>
          </tr>
        </tbody>
      </table>
      <!-- <shell-pagination-next-prev-with-cursor v-model="paginationParams" :meta-data="paginationData"
        :curr-pagination-page="currPaginationPage" @set-curr-page="handleChangeCurrPaginationPage" /> -->
    </div>
  </div>

  <!-- * Modal Creating & Editing New Role -->
  <UIModals v-model="openModalCreatingNewRole" :modal-title="openModalEditingRole ? 'Edit Role' : 'Create New Role'"
    :on-ok="handleOkModalCreateNewRole" :on-close-modal="handleCloseModalCreateNewRole"
    :disabled-btn-ok="!formUserInputForEditingRole.name || formUserInputForEditingRole.permissions.length === 0" class="dark:text-gray-900 text-gray-900">
    <template #modal-content>
      <div class="w-[80vw] select-none">
        <shell-indicator-loading v-if="loading" />

        <div class="mt-2 mb-1 text-gray-500 text-sm">Name</div>
        <input v-model="formUserInputForEditingRole.name"
          class="w-full px-3 py-1 rounded-md border border-slate-400 hover:border-red-200 active:border-red-500 focus:border-red-400 focus:outline-none" />

        <div class="mt-4 mb-1 text-gray-500 text-sm">Select Permissions</div>
        <div class="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-4 text-sm" role="alert">
          <p>
            A role defines a set of permissions that can be assigned to users. By selecting permissions, you are
            specifying what actions users with this role can perform within the system.
          </p>
        </div>

        <div class="w-full max-h-[50vh] flex mt-2">
          <div class="w-1/3">
            <div class="tracking-widest text-slate-600 text-sm mb-1">Modules</div>
            <div v-for="(_permissions, module) in listPermissions" :key="`module-list-${module.toString()}`"
              class="p-2 flex items-center rounded-lg hover:bg-red-500 hover:text-white hover:cursor-pointer"
              @click="scrollToModule(module.toString())">
              <div class="text-sm">
                {{ module }}
              </div>
            </div>
          </div>
          <div class="w-full ml-2 pl-4 pb-4 bg-slate-400/10 rounded-md overflow-y-auto">
            <RolePermissionLists :modules="listPermissions"
              :form-user-input-for-editing-role="formUserInputForEditingRole"
              @update-form-user-input-for-editing-role="handleUpdateFormUserInputForEditingRole" />
          </div>
        </div>
      </div>
    </template>
  </UIModals>


  <UIConfirmModal v-model="openModalDeleteRole" class="text-lg font-bold" title="Deleting Role"
    message="Are you sure you want to delete this role?" @confirm="handleOkModalDeleteRole" />
</template>

<script setup lang="ts">
import { RolePermissionLists } from '#components'
import { Menu, MenuButton, MenuItems, MenuItem } from '@headlessui/vue'
import { toast } from 'vue3-toastify'
import type { Pagination } from '~/components/DataTable/datatableMeta'
import type { PaginationResponse, Response, ResponseWithPagination } from '~/models/response'
import type { Role, Permission, RoleDetails } from '~/models/role'

// import {
//   // ResponseWithPagination,
//   // UpsertResponse,
//   Role,
//   Permission,
//   Response,
//   RoleDetails,
//   // CursorPaginationResponse,
//   // CursorPagination,
// } f

const loading = ref(false)
const errGetListRoles = ref<Error | null>(null)
const errGetListPermissions = ref<Error | null>(null)

const listRoles = ref<Role[]>([])
const listPermissions = ref<Permission>({})

const sortField = ref('created_at') // Current field to sort by
const sortOrder = ref<'asc' | 'desc' | ''>('desc') // Current sort order

const expandedRows = ref<string[]>([])

const appliedFilter = ref({})

const currPaginationPage = ref<number>(1)
const paginationData = ref<PaginationResponse>({
  next_page_cursor: '',
  per_page: 25,
  // has_next: false,
  page: 1,
  total_pages: 0,
})
const paginationParams = ref<Pagination>({
  perPage: 25,
  totalPages: 0,
  page: 1,
})

const openModalCreatingNewRole = ref(false)
const openModalEditingRole = ref(false)
const openModalDeleteRole = ref(false)

const selectedRole = ref<Role | null>(null)

const roleDetailData = ref<Record<string, { pending: boolean; data: RoleDetails | null }>>({})

const formUserInputForEditingRole = ref<{
  name: string
  permissions: number[] // Specify the type as string[]
 
}>({
  name: '',
  permissions: [],
})

function rowIsExpanded(roleId: string) {
  return expandedRows.value.includes(roleId)
}

function toggleExpanded(driverId: string) {
  if (rowIsExpanded(driverId)) {
    expandedRows.value = expandedRows.value.filter((r) => r !== driverId)
    return
  }
  expandedRows.value.push(driverId)
}

function handleSearchBar(searchBarValue: string) {
  appliedFilter.value = { ...appliedFilter.value, name: searchBarValue }
  resetPagination()
}

const toggleSort = (field: string) => {
  if (sortField.value === field) {
    sortOrder.value = sortOrder.value === 'asc' ? 'desc' : sortOrder.value === 'desc' ? '' : 'asc'
  } else {
    sortField.value = field
    sortOrder.value = 'asc'
  }

  appliedFilter.value = {
    sort: sortOrder.value === '' ? '' : `${sortOrder.value === 'asc' ? '' : '-'}${sortField.value}`,
  }

  resetPagination()
}

const handleChangeCurrPaginationPage = (page: number) => {
  currPaginationPage.value = page
}

function resetPagination() {
  paginationParams.value = {
    ...paginationParams.value,
    cursor: '',
    page: 1,
  }
  currPaginationPage.value = 1
}

function handleUpdateFormUserInputForEditingRole(newValue: { name: string; permissions: number[] }) {
  formUserInputForEditingRole.value = { ...newValue }
}

const getRolePermissions = async (roleId: string) => {
  loading.value = true

  try {
    const { data } = await useApi<Response<RoleDetails>>(`/admin/roles/${roleId}`, { method: 'GET' })
    if (data.value?.data != null) {
      formUserInputForEditingRole.value.name = data.value.data.name
      formUserInputForEditingRole.value.permissions = data.value.data.permissions?.map((p) => p.id) ?? []
    }
  } catch (error) {
  } finally {
    loading.value = false
  }
}

async function handleGetRoleDetailData(entry: Role | null | undefined, isRefresh: boolean = false) {
  if (!entry) return

  if (roleDetailData.value?.[entry.id] && !isRefresh) {
    return
  }

  roleDetailData.value[entry.id] = {
    data: roleDetailData.value[entry.id]?.data ?? null,
    pending: true,
  }

  try {
    const { data } = await useApi<Response<RoleDetails>>(`/admin/roles/${entry?.id}`, { method: 'GET' })

    if (data.value?.data != null) {
      roleDetailData.value[entry.id] = {
        data: { ...data.value?.data },
        pending: false,
      }
    }
  } catch (error) {
  } finally {
    roleDetailData.value[entry.id].pending = false
  }
}

async function handleOkModalCreateNewRole() {
  loading.value = true

  try {
    const { data, error } = await useApi<Response<Role>>(
      `/admin/roles${openModalEditingRole.value ? `/${selectedRole.value?.id}` : ''}`,
      {
        method: openModalEditingRole.value ? 'PUT' : 'POST',
        body: {
          name: formUserInputForEditingRole.value.name ?? '',
          permission_ids: formUserInputForEditingRole.value.permissions ?? [],
        },
      }
    )

    if (data.value?.ok) {
      const resp = data?.value?.data ?? {}

      if (openModalEditingRole.value) {
        const index = listRoles.value.findIndex((role) => role.id === selectedRole.value?.id)
        if (index > -1) {
          listRoles.value[index] = { ...listRoles.value[index], ...resp }
        }
      } else {
        listRoles.value.push({ ...resp })
      }

      toast.success(openModalEditingRole.value ? 'Success updating Role' : 'Success creating new Role')

      handleCloseModalCreateNewRole()
    } else {
      const errMsg = error.value?.data?.message ?? 'An Error was Accrued, Please try again'
      toast.error(errMsg)
    }
  } catch (e: any) {
    const errMsg = e?.value?.data?.message || 'An Error was Accrued, Please try again'
    toast.error(`${errMsg}`)
  } finally {
    loading.value = false
  }
}

async function handleOkModalDeleteRole() {
  loading.value = true

  try {
    const { data, error } = await useApi<Response<Role>>(`/admin/roles/${selectedRole.value?.id}`, {
      method: 'DELETE',
    })

    if (data?.value?.ok) {
      const indexDeletedRole = listRoles.value.findIndex((role) => role?.id === selectedRole.value?.id)

      if (indexDeletedRole !== -1) {
        listRoles.value.splice(indexDeletedRole, 1)
        toast.success('Selected Role has been successfully deleted')
      }
    } else {
      const errMsg = error.value?.data?.message ?? 'An Error was Accrued, Please try again'
      toast.error(errMsg)
    }
  } catch (e: any) {
    const errMsg = e?.value?.data?.message || 'An Error was Accrued, Please try again'
    toast.error(`${errMsg}`)
  } finally {
    loading.value = false
  }
}

function handleCloseModalCreateNewRole() {
  openModalCreatingNewRole.value = false
  openModalEditingRole.value = false
}

function scrollToModule(module: string) {
  const element = document.getElementById(`module-${module}`)

  if (element) {
    element.scrollIntoView({ behavior: 'smooth' })
  }
}

const { data, pending, error } = await useApi<ResponseWithPagination<Role[]>>('/admin/roles/', {
  method: 'GET',
  query: appliedFilter,
  params: paginationParams,
})

const { data: dataPermissions, pending: pendingPermissions } = await useApi<ResponseWithPagination<Permission>>(
  '/admin/permissions',
  {
    method: 'GET',
  }
)

watch(
  [data, dataPermissions],
  (_) => {
    listRoles.value = data.value?.data ?? []
    errGetListRoles.value = error.value
    errGetListPermissions.value = error.value
    listPermissions.value = dataPermissions.value?.data ?? {}
    paginationData.value = data.value?.pagination ?? {
      next_page_cursor: '',
      per_page: 25,
      has_next: false,
    }
  },
  { immediate: true }
)

onBeforeMount(() => {
  // checkPermission('permission::index')
})

definePageMeta({
  title: 'Manage Roles',
})
</script>

<style scoped></style>

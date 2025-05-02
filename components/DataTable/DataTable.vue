<template>
  <table>
    <thead>
      <tr>
        <slot name="header-row">
          <th
            v-for="(column, index) in columns"
            :key="column.key"
            :class="[
              column.cellHeaderClass ??
                'border-b border-gray-200 bg-gray-100 px-2 py-4 text-left dark:border-gray-700 dark:bg-gray-800',
              {
                'rounded-tl-lg': index === 0,
                'rounded-tr-lg': index === columns.length - 1,
              },
            ]"
            :colspan="expandable && index === 0 ? 2 : 1"
          >
            <slot :name="`header-${String(column.key)}`" v-bind="{ column }">
              {{ $t(column.label) }}
            </slot>
          </th>
        </slot>
      </tr>
    </thead>
    <tbody>
      <template v-if="loading">
        <tr>
          <td
            :colspan="columnCount"
            class="border-b border-gray-200 p-4 text-center dark:border-gray-700"
          >
            <LoadingIndicator />
          </td>
        </tr>
      </template>
      <template v-for="(entry, index) in rows" v-else>
        <tr>
          <slot name="row" v-bind="{ entry, index }">
            <td
              v-if="expandable"
              :class="[
                columns[0].cellClass ??
                  'border-b border-gray-200 text-left dark:border-gray-700',
                'w-8',
              ]"
            >
              <button
                @click="toggleRow(index)"
                class="flex h-6 w-6 items-center justify-center rounded-lg border border-gray-400 hover:bg-gray-400 dark:border-gray-600"
              >
                <Icon
                  name="uil:angle-down"
                  size="1.5rem"
                  :class="[
                    'text-gray-600 transition-transform duration-200',
                    expandedRows.includes(index) ? '-rotate-180' : '',
                  ]"
                />
              </button>
            </td>
            <td
              v-for="column in columns"
              :key="column.key"
              :class="
                column.cellClass ??
                'border-b border-gray-200 text-left dark:border-gray-700'
              "
            >
              <slot
                :name="`cell-${String(column.key)}`"
                v-bind="{ entry, column }"
              >
                {{ getNestedValue(entry, column.key) }}
              </slot>
            </td>
          </slot>
        </tr>
        <tr v-if="expandable && isExpanded(index)">
          <slot name="detail-row" v-bind="{ entry, index }">
            <td :colspan="columns.length + (expandable ? 1 : 0)">
              <slot name="detail" v-bind="{ entry, index }" />
            </td>
          </slot>
        </tr>
      </template>
    </tbody>
    <tfoot>
      <!-- Pagination -->
      <tr>
        <td :colspan="columnCount">
          <div
            v-if="pagination"
            class="flex w-full flex-wrap items-center justify-between py-2 lg:flex-nowrap"
          >
            <div class="flex items-center gap-1">
              <button
                :disabled="!canGoBack"
                class="enabled:hover:bg-primary flex items-center rounded-lg bg-gray-100 enabled:hover:text-gray-50 enabled:hover:brightness-125 disabled:cursor-not-allowed dark:bg-gray-700"
                @click="navigate(pagination.page - 1)"
              >
                <Icon name="uil:angle-left" size="1.5rem" />
              </button>
              <button
                class="hover:bg-primary flex items-center rounded-lg px-2 hover:text-gray-50 hover:brightness-125"
                :class="{
                  'bg-primary text-gray-50 brightness-125':
                    pagination.page === index + 1,
                  'bg-gray-100 dark:bg-gray-700': pagination.page !== index + 1,
                }"
                @click="navigate(index + 1)"
                v-for="(_, index) in pagination?.totalPages"
              >
                {{ index + 1 }}
              </button>
              <button
                :disabled="!canGoForward"
                class="enabled:hover:bg-primary flex items-center rounded-lg bg-gray-100 enabled:hover:text-gray-50 enabled:hover:brightness-125 disabled:cursor-not-allowed dark:bg-gray-700"
                @click="navigate(pagination.page + 1)"
              >
                <Icon name="uil:angle-right" size="1.5rem" />
              </button>
            </div>
          </div>
        </td>
      </tr>
    </tfoot>
  </table>
</template>

<script lang="ts" generic="T extends { [key: PropertyKey]: any }" setup>
import type { ColumnDefinition, Pagination } from "./datatableMeta";

const props = defineProps<{
  columns: ColumnDefinition<T>[];
  rows: T[];
  keyProp: keyof T;
  loading?: boolean;

  pagination?: Pagination;
  expandable?: boolean;
  onRowExpand?: (entry: T, index: number) => void;
}>();

const columnCount = computed(
  () => props.columns.length + (props.expandable ? 1 : 0),
);

const emit = defineEmits<{
  navigate: [page: number];
  changePageSize: [size: number];
}>();

// Paginations
const canGoBack = computed(() => (props.pagination?.page ?? 0) > 1);
const canGoForward = computed(
  () => (props.pagination?.page ?? 0) < (props.pagination?.totalPages ?? 0),
);
const navigate = (page: number) => emit("navigate", page);

// Expandable Rows
const expandedRows = ref<number[]>([]);
const isExpanded = (index: number) => expandedRows.value.includes(index);
const toggleRow = (index: number) => {
  if (expandedRows.value.includes(index)) {
    expandedRows.value = expandedRows.value.filter((i) => i !== index);
  } else {
    expandedRows.value = [...expandedRows.value, index];
    props.onRowExpand?.(props.rows[index], index);
  }
};
</script>

<style></style>

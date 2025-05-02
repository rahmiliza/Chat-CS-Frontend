<template>
  <div
    id="confirmationModal"
    :class="modelValue ? '' : 'hidden'"
    class="flex overflow-y-auto overflow-x-hidden fixed top-0 right-0 left-0 z-20 justify-center items-center w-full md:inset-0 h-modal bg-slate-400/40 select-none"
  >
    <div class="relative h-full md:h-[90vh]">
      <div class="relative p-6 rounded-lg bg-white shadow">
        <div class="font-bold uppercase text-xl">{{ modalTitle }}</div>
        <button
          type="button"
          class="text-gray-400 absolute top-5 right-2.5 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm p-1.5 ml-auto inline-flex items-center"
          @click="
            () => {
              onCloseModal()
              isConfirming = false
            }
          "
        >
          <svg
            aria-hidden="true"
            class="w-5 h-5"
            fill="currentColor"
            viewBox="0 0 20 20"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fill-rule="evenodd"
              d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
              clip-rule="evenodd"
            ></path>
          </svg>
          <span class="sr-only">Close modal</span>
        </button>

        <hr class="h-px mt-2 bg-gray-400 border-0" />

        <div class="mt-4 max-h-[70vh]" :class="showOverflow ? 'overflow-y-visible' : 'overflow-y-auto pr-3'">
          <slot name="modal-content"></slot>
        </div>

        <template v-if="footer">
          <div :class="isConfirming ? 'mt-6' : 'mt-10'">
            <div
              v-if="isConfirming"
              class="w-full p-2 mb-4 border-l-4 border-orange-500 bg-amber-300/50 text-amber-600"
            >
              <div>
                <Icon name="hugeicons:alert-02" />
                <b>Warning</b>
              </div>
              <slot name="confirmation-content"></slot>
            </div>
            <div class="flex justify-end items-center space-x-2">
              <button
                class="py-2 px-3 min-w-[60px] text-sm font-medium text-gray-500 bg-white rounded-lg border border-gray-200 hover:bg-gray-100 focus:ring-4 focus:outline-none focus:ring-primary-300 hover:text-gray-900 focus:z-10"
                @click="
                  () => {
                    if (!isConfirming) onCloseModal()
                    else isConfirming = false
                  }
                "
              >
                {{ cancelBtnText }}
              </button>
              <button
                :disabled="disabledBtnOk"
                :class="
                  disabledBtnOk
                    ? 'bg-slate-300 text-slate-600 cursor-not-allowed'
                    : 'text-white bg-red-600  hover:bg-red-700 focus:ring-4 focus:outline-none focus:ring-red-300'
                "
                class="py-2 px-3 min-w-[60px] text-sm font-medium text-center rounded-lg"
                @click="
                  () => {
                    if (!confirmation) onOk()
                    else {
                      if (isConfirming) onOk()
                      isConfirming = !isConfirming
                    }
                  }
                "
              >
                {{ !isConfirming ? okBtnText : 'Yes, I`m sure' }}
              </button>
            </div>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Prop {
  icon?: string
  desc?: string
  cancelBtnText?: string
  okBtnText?: string
  modalTitle?: string
  modelValue: boolean
  modalWidth?: string | number
  disabledBtnOk?: boolean
  footer?: boolean
  confirmation?: boolean
  showOverflow?: boolean
  onOk?: () => void
  onCloseModal: () => void
}

withDefaults(defineProps<Prop>(), {
  cancelBtnText: 'No, Cancel',
  okBtnText: 'Yes, I`m Sure',
  modalWidth: 'full',
  footer: true,
  confirmation: false,
  showOverflow: false,
  onOk: () => {},
})

const emit = defineEmits<{
  (event: 'update:modelValue', value: boolean): void
}>()

const isConfirming = ref(false)
</script>

<style scoped></style>

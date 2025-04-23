<template>
  <div class="flex flex-col gap-2">
    <label class="text-sm font-medium text-gray-700 dark:text-gray-300">
      {{ label }}
    </label>

    <div
      class="border border-gray-300 dark:border-gray-600 p-2 rounded-lg flex items-center justify-center cursor-pointer"
      @click="triggerFileInput">
      <div v-if="previews.length" class="flex flex-wrap gap-2">
        <div v-for="(image, index) in previews" :key="index" class="relative">
          <img :src="image" alt="Preview" class="w-20 h-20 object-cover rounded-lg" />
          <button @click.stop="removeFile(index)"
            class="absolute top-0 right-0 bg-red-500 text-white text-xs px-1 rounded">
            ✕
          </button>
        </div>
      </div>
      <span v-else class="text-gray-500 dark:text-gray-400">Upload Images</span>
    </div>

    <input ref="fileInput" type="file" accept="image/*" class="hidden" multiple @change="handleFileChange" />

    <span v-if="error" class="text-sm text-red-500 dark:text-red-400">
      {{ error }}
    </span>
  </div>
</template>

<script setup>
import { ref, watch } from "vue";

const props = defineProps({
  label: {
    type: String,
    default: "Upload Images",
  },
  error: {
    type: String,
    default: "",
  },
  modelValue: Array,
});

const emit = defineEmits(["update:modelValue"]);

const fileInput = ref(null);
const previews = ref([]);
const uploadedFiles = ref([]);

const convertUrlToFile = async (url) => {
  const response = await fetch(url);
  const blob = await response.blob();
  const fileName = url.split("/").pop();
  return new File([blob], fileName, { type: blob.type });
};

watch(
  () => props.modelValue,
  async (newFiles) => {
    if (Array.isArray(newFiles)) {
      uploadedFiles.value = [];

      for (const file of newFiles) {
        if (typeof file === "string") {
          const convertedFile = await convertUrlToFile(file);
          uploadedFiles.value.push(convertedFile);
        } else if (file instanceof File) {
          uploadedFiles.value.push(file);
        }
      }

      updatePreviews();
      emit("update:modelValue", uploadedFiles.value);
    }
  },
  { immediate: true }
);

const updatePreviews = () => {
  previews.value = uploadedFiles.value.map(file => URL.createObjectURL(file));
};

const triggerFileInput = () => {
  fileInput.value.click();
};

const handleFileChange = (event) => {
  const files = Array.from(event.target.files);
  if (files.length) {
    uploadedFiles.value = files;
    updatePreviews();
    emit("update:modelValue", uploadedFiles.value);
  }
};

const removeFile = (index) => {
  uploadedFiles.value.splice(index, 1);
  updatePreviews();
  emit("update:modelValue", uploadedFiles.value);
};

</script>

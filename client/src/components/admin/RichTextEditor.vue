<template>
  <div class="rich-text-editor">
    <QuillEditor
      ref="quillEditor"
      v-model:content="content"
      :options="editorOptions"
      content-type="html"
      @update:content="handleContentChange"
      @ready="onEditorReady"
    />
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue'
import { QuillEditor } from '@vueup/vue-quill'
import '@vueup/vue-quill/dist/vue-quill.snow.css'

const props = defineProps({
  modelValue: {
    type: String,
    default: ''
  },
  placeholder: {
    type: String,
    default: '請輸入內容...'
  },
  height: {
    type: String,
    default: '400px'
  },
  readonly: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:modelValue', 'change'])

const quillEditor = ref(null)
const content = ref(props.modelValue)

// 編輯器配置
const editorOptions = {
  theme: 'snow',
  placeholder: props.placeholder,
  readOnly: props.readonly,
  modules: {
    toolbar: [
      ['bold', 'italic', 'underline', 'strike'],        // 基本格式
      ['blockquote', 'code-block'],                     // 引用和代碼塊
      [{ 'header': 1 }, { 'header': 2 }],               // 標題
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],     // 列表
      [{ 'script': 'sub'}, { 'script': 'super' }],      // 上下標
      [{ 'indent': '-1'}, { 'indent': '+1' }],          // 縮進
      [{ 'direction': 'rtl' }],                         // 文字方向
      [{ 'size': ['small', false, 'large', 'huge'] }],  // 字體大小
      [{ 'header': [1, 2, 3, 4, 5, 6, false] }],        // 標題級別
      [{ 'color': [] }, { 'background': [] }],          // 字體和背景色
      [{ 'font': [] }],                                 // 字體
      [{ 'align': [] }],                                // 對齊
      ['clean'],                                        // 清除格式
      ['link', 'image', 'video']                        // 連結、圖片、影片
    ]
  }
}

// 處理內容變化
const handleContentChange = (newContent) => {
  emit('update:modelValue', newContent)
  emit('change', newContent)
}

// 編輯器準備就緒
const onEditorReady = (quill) => {
  // 設定編輯器高度
  const editorContainer = quill.container.parentElement
  editorContainer.style.height = props.height
  
  // 自定義圖片上傳處理
  const toolbar = quill.getModule('toolbar')
  toolbar.addHandler('image', () => {
    selectLocalImage()
  })
}

// 監聽props變化
watch(() => props.modelValue, (newValue) => {
  if (newValue !== content.value) {
    content.value = newValue
  }
})

// 選擇本地圖片
const selectLocalImage = () => {
  const input = document.createElement('input')
  input.setAttribute('type', 'file')
  input.setAttribute('accept', 'image/*')
  input.click()

  input.onchange = () => {
    const file = input.files[0]
    if (file) {
      // 這裡可以整合圖片上傳API
      uploadImage(file)
    }
  }
}

// 上傳圖片
const uploadImage = async (file) => {
  try {
    // 先導入ContentService
    const { default: ContentService } = await import('@/services/content.service')
    
    // 調用實際的圖片上傳API
    const response = await ContentService.uploadImage(file)
    
    if (response.data.success) {
      const imageUrl = response.data.data.url
      insertImageToEditor(imageUrl)
    }
  } catch (error) {
    console.error('圖片上傳失敗:', error)
    
    // 降級處理：使用本地預覽URL
    const reader = new FileReader()
    reader.onload = (e) => {
      const imageUrl = e.target.result
      insertImageToEditor(imageUrl)
    }
    reader.readAsDataURL(file)
  }
}

// 插入圖片到編輯器
const insertImageToEditor = (imageUrl) => {
  const quill = quillEditor.value.getQuill()
  const range = quill.getSelection()
  if (range) {
    quill.insertEmbed(range.index, 'image', imageUrl)
    quill.setSelection(range.index + 1)
  }
}

// 暴露方法給父組件
defineExpose({
  getQuill: () => quillEditor.value?.getQuill(),
  setContent: (html) => {
    content.value = html
  },
  getContent: () => content.value,
  focus: () => quillEditor.value?.getQuill()?.focus(),
  blur: () => quillEditor.value?.getQuill()?.blur()
})
</script>

<style scoped>
.rich-text-editor {
  border: 1px solid #dcdfe6;
  border-radius: 4px;
}

:deep(.ql-container) {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
}

:deep(.ql-editor) {
  min-height: 200px;
  max-height: 600px;
  overflow-y: auto;
}

:deep(.ql-toolbar) {
  border-bottom: 1px solid #dcdfe6;
  background-color: #fafafa;
}

:deep(.ql-snow .ql-tooltip) {
  z-index: 9999;
}
</style>

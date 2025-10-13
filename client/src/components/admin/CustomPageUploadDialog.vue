<template>
  <el-dialog 
    v-model="dialogVisible" 
    title="上傳客製化頁面" 
    width="600px"
    :close-on-click-modal="false"
    @close="handleClose"
  >
    <el-form 
      ref="formRef" 
      :model="form" 
      :rules="rules" 
      label-width="120px"
      v-loading="uploading"
    >
      <el-form-item label="頁面標題" prop="title">
        <el-input 
          v-model="form.title" 
          placeholder="請輸入頁面標題"
          maxlength="200"
          show-word-limit
        />
      </el-form-item>
      
      <el-form-item label="頁面描述" prop="description">
        <el-input 
          v-model="form.description" 
          type="textarea" 
          :rows="3"
          placeholder="請輸入頁面描述"
          maxlength="500"
          show-word-limit
        />
      </el-form-item>
      
      <el-form-item label="ZIP檔案" prop="file">
        <el-upload
          ref="uploadRef"
          :auto-upload="false"
          :on-change="handleFileChange"
          :before-upload="beforeUpload"
          :on-remove="handleFileRemove"
          accept=".zip"
          :limit="1"
          drag
        >
          <el-icon class="el-icon--upload"><upload-filled /></el-icon>
          <div class="el-upload__text">
            將ZIP檔案拖到此處，或<em>點擊上傳</em>
          </div>
          <template #tip>
            <div class="el-upload__tip">
              只能上傳ZIP檔案，且不超過50MB
            </div>
          </template>
        </el-upload>
      </el-form-item>
      
      <el-form-item label="分類" prop="category">
        <el-input 
          v-model="form.category" 
          placeholder="請輸入分類"
        />
      </el-form-item>
      
      <el-form-item label="標籤" prop="tags">
        <div class="flex flex-wrap gap-2 mb-2">
          <el-tag
            v-for="tag in form.tags"
            :key="tag"
            closable
            @close="removeTag(tag)"
          >
            {{ tag }}
          </el-tag>
        </div>
        <el-input
          v-if="inputVisible"
          ref="inputRef"
          v-model="inputValue"
          size="small"
          @keyup.enter="addTag"
          @blur="addTag"
          placeholder="輸入標籤後按Enter"
        />
        <el-button 
          v-else 
          size="small" 
          @click="showInput"
          :disabled="form.tags.length >= 10"
        >
          + 新增標籤
        </el-button>
        <div class="text-sm text-gray-500 mt-1">
          最多可新增10個標籤
        </div>
      </el-form-item>
    </el-form>
    
    <template #footer>
      <div class="flex justify-end gap-2">
        <el-button @click="handleClose" :disabled="uploading">
          取消
        </el-button>
        <el-button 
          type="primary" 
          @click="handleUpload" 
          :loading="uploading"
          :disabled="!form.file"
        >
          上傳
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script>
import { ref, watch, nextTick, computed } from 'vue';
import { ElMessage } from 'element-plus';
import { UploadFilled } from '@element-plus/icons-vue';
import customPageService from '@/services/customPage.service';

export default {
  name: 'CustomPageUploadDialog',
  components: {
    UploadFilled
  },
  props: {
    modelValue: {
      type: Boolean,
      default: false
    }
  },
  emits: ['update:modelValue', 'success'],
  setup(props, { emit }) {
    const formRef = ref(null);
    const uploadRef = ref(null);
    const inputRef = ref(null);
    const uploading = ref(false);
    const inputVisible = ref(false);
    const inputValue = ref('');
    
    // 對話框顯示狀態
    const dialogVisible = computed({
      get: () => props.modelValue,
      set: (value) => emit('update:modelValue', value)
    });
    
    const form = ref({
      title: '',
      description: '',
      category: '客製化頁面',
      tags: [],
      file: null
    });
    
    const rules = {
      title: [
        { required: true, message: '請輸入頁面標題', trigger: 'blur' },
        { min: 1, max: 200, message: '標題長度應在1-200個字元之間', trigger: 'blur' }
      ],
      file: [
        { required: true, message: '請選擇ZIP檔案', trigger: 'change' }
      ]
    };
    
    // 監聽對話框顯示狀態
    watch(() => props.modelValue, (newVal) => {
      if (newVal) {
        resetForm();
      }
    });
    
    // 重置表單
    const resetForm = () => {
      form.value = {
        title: '',
        description: '',
        category: '客製化頁面',
        tags: [],
        file: null
      };
      inputVisible.value = false;
      inputValue.value = '';
      
      if (formRef.value) {
        formRef.value.clearValidate();
      }
      
      if (uploadRef.value) {
        uploadRef.value.clearFiles();
      }
    };
    
    // 檔案選擇處理
    const handleFileChange = (file) => {
      form.value.file = file.raw;
    };
    
    // 檔案移除處理
    const handleFileRemove = () => {
      form.value.file = null;
    };
    
    // 上傳前驗證
    const beforeUpload = (file) => {
      const isZip = file.type === 'application/zip' || file.name.endsWith('.zip');
      if (!isZip) {
        ElMessage.error('只能上傳ZIP檔案');
        return false;
      }
      
      const isLt50M = file.size / 1024 / 1024 < 50;
      if (!isLt50M) {
        ElMessage.error('檔案大小不能超過50MB');
        return false;
      }
      
      return false; // 阻止自動上傳
    };
    
    // 顯示標籤輸入框
    const showInput = () => {
      inputVisible.value = true;
      nextTick(() => {
        inputRef.value?.focus();
      });
    };
    
    // 新增標籤
    const addTag = () => {
      const value = inputValue.value.trim();
      if (value && !form.value.tags.includes(value) && form.value.tags.length < 10) {
        form.value.tags.push(value);
        inputValue.value = '';
      }
      inputVisible.value = false;
    };
    
    // 移除標籤
    const removeTag = (tag) => {
      const index = form.value.tags.indexOf(tag);
      if (index > -1) {
        form.value.tags.splice(index, 1);
      }
    };
    
    // 上傳處理
    const handleUpload = async () => {
      try {
        // 表單驗證
        await formRef.value.validate();
        
        if (!form.value.file) {
          ElMessage.error('請選擇ZIP檔案');
          return;
        }
        
        uploading.value = true;
        
        // 創建FormData
        const formData = new FormData();
        formData.append('file', form.value.file);
        formData.append('title', form.value.title);
        formData.append('description', form.value.description);
        formData.append('category', form.value.category);
        formData.append('tags', form.value.tags.join(','));
        
        // 上傳
        const response = await customPageService.uploadCustomPage(formData);
        
        ElMessage.success(response.message || '上傳成功');
        emit('success');
        handleClose();
        
      } catch (error) {
        console.error('上傳失敗:', error);
        ElMessage.error(error.message || '上傳失敗');
      } finally {
        uploading.value = false;
      }
    };
    
    // 關閉對話框
    const handleClose = () => {
      emit('update:modelValue', false);
    };
    
    return {
      dialogVisible,
      formRef,
      uploadRef,
      inputRef,
      uploading,
      inputVisible,
      inputValue,
      form,
      rules,
      handleFileChange,
      handleFileRemove,
      beforeUpload,
      showInput,
      addTag,
      removeTag,
      handleUpload,
      handleClose
    };
  }
};
</script>

<style scoped>
.el-upload__tip {
  color: #999;
  font-size: 12px;
  margin-top: 7px;
}
</style>

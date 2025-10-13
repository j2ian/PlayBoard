<template>
  <el-dialog 
    v-model="visible" 
    title="編輯客製化頁面" 
    width="600px"
    :close-on-click-modal="false"
    @close="handleClose"
  >
    <el-form 
      ref="formRef" 
      :model="form" 
      :rules="rules" 
      label-width="120px"
      v-loading="loading"
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
      
      <!-- 頁面設定 -->
      <el-divider content-position="left">頁面設定</el-divider>
      
      <el-form-item label="允許全螢幕">
        <el-switch v-model="form.settings.allowFullscreen" />
      </el-form-item>
      
      <el-form-item label="允許導航">
        <el-switch v-model="form.settings.allowNavigation" />
      </el-form-item>
      
      <el-form-item label="自動進度">
        <el-switch v-model="form.settings.autoProgress" />
      </el-form-item>
      
      <el-form-item label="進度觸發" v-if="form.settings.autoProgress">
        <el-select v-model="form.settings.progressTrigger" placeholder="選擇觸發方式">
          <el-option label="手動" value="manual" />
          <el-option label="計時" value="timer" />
          <el-option label="互動" value="interaction" />
          <el-option label="完成" value="completion" />
        </el-select>
      </el-form-item>
      
      <el-form-item label="延遲時間(秒)" v-if="form.settings.progressTrigger === 'timer'">
        <el-input-number 
          v-model="form.settings.progressDelay" 
          :min="0" 
          :max="3600"
          placeholder="延遲秒數"
        />
      </el-form-item>
      
      <el-form-item label="完成條件" v-if="form.settings.progressTrigger === 'completion'">
        <el-input 
          v-model="form.settings.completionCriteria" 
          placeholder="例如：達到100分"
        />
      </el-form-item>
      
      <!-- 狀態資訊 -->
      <el-divider content-position="left">狀態資訊</el-divider>
      
      <el-form-item label="當前狀態">
        <el-tag :type="getStatusType(customPage?.status)">
          {{ getStatusText(customPage?.status) }}
        </el-tag>
      </el-form-item>
      
      <el-form-item label="瀏覽次數">
        <span>{{ customPage?.viewCount || 0 }}</span>
      </el-form-item>
      
      <el-form-item label="創建時間">
        <span>{{ formatDate(customPage?.createdAt) }}</span>
      </el-form-item>
      
      <el-form-item label="錯誤訊息" v-if="customPage?.errorMessage">
        <el-alert 
          :title="customPage.errorMessage" 
          type="error" 
          show-icon 
          :closable="false"
        />
      </el-form-item>
    </el-form>
    
    <template #footer>
      <div class="flex justify-end gap-2">
        <el-button @click="handleClose" :disabled="loading">
          取消
        </el-button>
        <el-button 
          type="primary" 
          @click="handleSave" 
          :loading="loading"
        >
          儲存
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script>
import { ref, watch, nextTick, computed } from 'vue';
import { ElMessage } from 'element-plus';
import customPageService from '@/services/customPage.service';

export default {
  name: 'CustomPageEditDialog',
  props: {
    modelValue: {
      type: Boolean,
      default: false
    },
    customPage: {
      type: Object,
      default: null
    }
  },
  emits: ['update:modelValue', 'success'],
  setup(props, { emit }) {
    // 將父層 v-model(modelValue) 綁定到本地 visible
    const visible = computed({
      get: () => props.modelValue,
      set: (v) => emit('update:modelValue', v)
    });
    const formRef = ref(null);
    const inputRef = ref(null);
    const loading = ref(false);
    const inputVisible = ref(false);
    const inputValue = ref('');
    
    const form = ref({
      title: '',
      description: '',
      category: '',
      tags: [],
      status: '',
      settings: {
        allowFullscreen: false,
        allowNavigation: true,
        autoProgress: false,
        progressTrigger: 'manual',
        progressDelay: 0,
        completionCriteria: ''
      }
    });
    
    const rules = {
      title: [
        { required: true, message: '請輸入頁面標題', trigger: 'blur' },
        { min: 1, max: 200, message: '標題長度應在1-200個字元之間', trigger: 'blur' }
      ]
    };
    
    // 監聽客製化頁面變化
    watch(() => props.customPage, (newVal) => {
      if (newVal) {
        loadCustomPageData();
      }
    }, { immediate: true });
    
    // 載入客製化頁面資料
    const loadCustomPageData = () => {
      if (props.customPage) {
        console.log('[CustomPageEditDialog] 載入資料:', props.customPage);
        form.value = {
          title: props.customPage.title || '',
          description: props.customPage.description || '',
          category: props.customPage.category || '',
          tags: [...(props.customPage.tags || [])],
          status: props.customPage.status || 'processing',
          settings: {
            allowFullscreen: props.customPage.settings?.allowFullscreen || false,
            allowNavigation: props.customPage.settings?.allowNavigation !== false,
            autoProgress: props.customPage.settings?.autoProgress || false,
            progressTrigger: props.customPage.settings?.progressTrigger || 'manual',
            progressDelay: props.customPage.settings?.progressDelay || 0,
            completionCriteria: props.customPage.settings?.completionCriteria || ''
          }
        };
      }
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
    
    // 狀態類型
    const getStatusType = (status) => {
      const typeMap = {
        uploading: 'info',
        processing: 'warning',
        ready: 'success',
        error: 'danger',
        archived: 'info'
      };
      return typeMap[status] || 'info';
    };
    
    // 狀態文字
    const getStatusText = (status) => {
      const textMap = {
        uploading: '上傳中',
        processing: '處理中',
        ready: '就緒',
        error: '錯誤',
        archived: '已封存'
      };
      return textMap[status] || status;
    };
    
    // 格式化日期
    const formatDate = (dateString) => {
      if (!dateString) return '';
      return new Date(dateString).toLocaleString('zh-TW');
    };
    
    // 儲存處理
    const handleSave = async () => {
      try {
        // 表單驗證
        await formRef.value.validate();
        
        loading.value = true;
        console.log('[CustomPageEditDialog] 保存送出資料:', form.value);
        const updateData = {
          title: form.value.title,
          description: form.value.description,
          category: form.value.category,
          tags: form.value.tags.length > 0 ? form.value.tags.join(',') : '',
          status: form.value.status,
          settings: form.value.settings
        };
        const resp = await customPageService.updateCustomPage(props.customPage._id, updateData);
        console.log('[CustomPageEditDialog] 更新回應:', resp);
        
        ElMessage.success('更新成功');
        emit('success');
        handleClose();
        
      } catch (error) {
        console.error('[CustomPageEditDialog] 更新失敗:', error);
        ElMessage.error(error.message || '更新失敗');
      } finally {
        loading.value = false;
      }
    };
    
    // 關閉對話框
    const handleClose = () => {
      emit('update:modelValue', false);
    };
    
    return {
      visible,
      formRef,
      inputRef,
      loading,
      inputVisible,
      inputValue,
      form,
      rules,
      showInput,
      addTag,
      removeTag,
      getStatusType,
      getStatusText,
      formatDate,
      handleSave,
      handleClose
    };
  }
};
</script>

<style scoped>
.el-divider {
  margin: 20px 0;
}
</style>

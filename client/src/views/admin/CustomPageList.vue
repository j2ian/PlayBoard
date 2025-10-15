<template>
  <AdminLayout title="客製化頁面管理">
    <div class="custom-page-list">
      <el-card>
      <template #header>
        <div class="flex justify-between items-center">
          <span class="text-lg font-semibold">客製化頁面管理</span>
          <el-button type="primary" @click="handleUploadClick">
            <el-icon><Plus /></el-icon>
            上傳新頁面
          </el-button>
        </div>
      </template>
      
      <!-- 搜尋和篩選 -->
      <div class="mb-4 flex gap-4 items-center">
        <el-input
          v-model="searchQuery"
          placeholder="搜尋頁面標題或描述"
          class="w-64"
          clearable
          @input="handleSearch"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
        
        <el-select
          v-model="statusFilter"
          placeholder="狀態篩選"
          class="w-32"
          clearable
          @change="handleFilter"
        >
          <el-option label="全部" value="" />
          <el-option label="上傳中" value="uploading" />
          <el-option label="處理中" value="processing" />
          <el-option label="就緒" value="ready" />
          <el-option label="錯誤" value="error" />
          <el-option label="已封存" value="archived" />
        </el-select>
        
        <el-select
          v-model="categoryFilter"
          placeholder="分類篩選"
          class="w-32"
          clearable
          @change="handleFilter"
        >
          <el-option label="全部" value="" />
          <el-option
            v-for="category in categories"
            :key="category"
            :label="category"
            :value="category"
          />
        </el-select>
      </div>
      
      <!-- 表格 -->
      <el-table :data="customPages" v-loading="loading" stripe>
        <el-table-column prop="title" label="標題" min-width="200">
          <template #default="{ row }">
            <div class="flex flex-col">
              <span class="font-medium">{{ row.title }}</span>
              <span class="text-sm text-gray-500">{{ row.slug }}</span>
            </div>
          </template>
        </el-table-column>
        
        <el-table-column prop="description" label="描述" min-width="200" show-overflow-tooltip />
        
        <el-table-column prop="status" label="狀態" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">
              {{ getStatusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        
        <el-table-column prop="category" label="分類" width="120" />
        
        <el-table-column prop="viewCount" label="瀏覽次數" width="100" />
        
        <el-table-column prop="createdAt" label="創建時間" width="160">
          <template #default="{ row }">
            {{ formatDate(row.createdAt) }}
          </template>
        </el-table-column>
        
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button size="small" @click="viewPage(row)" :disabled="row.status !== 'ready'">
              查看
            </el-button>
            <el-button size="small" @click="editPage(row)">
              編輯
            </el-button>
            <el-button 
              size="small" 
              type="danger" 
              @click="deletePage(row)"
              :disabled="row.status === 'processing'"
            >
              刪除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      
      <!-- 分頁 -->
      <div class="mt-4 flex justify-center">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>
    
    <!-- 上傳對話框 -->
    <CustomPageUploadDialog 
      v-model="showUploadDialog"
      @success="handleUploadSuccess"
    />
    
    <!-- 編輯對話框 -->
    <CustomPageEditDialog
      v-model="showEditDialog"
      :custom-page="selectedCustomPage"
      @success="handleEditSuccess"
    />
    </div>
  </AdminLayout>
</template>

<script>
import { ref, onMounted, computed, nextTick } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Plus, Search } from '@element-plus/icons-vue';
import AdminLayout from '@/components/admin/AdminLayout.vue';
import customPageService from '@/services/customPage.service';
import CustomPageUploadDialog from '@/components/admin/CustomPageUploadDialog.vue';
import CustomPageEditDialog from '@/components/admin/CustomPageEditDialog.vue';

export default {
  name: 'CustomPageList',
  components: {
    AdminLayout,
    CustomPageUploadDialog,
    CustomPageEditDialog,
    Plus,
    Search
  },
  setup() {
    const loading = ref(false);
    const customPages = ref([]);
    const total = ref(0);
    const currentPage = ref(1);
    const pageSize = ref(10);
    const searchQuery = ref('');
    const statusFilter = ref('');
    const categoryFilter = ref('');
    const categories = ref([]);
    
    const showUploadDialog = ref(false);
    const showEditDialog = ref(false);
    const selectedCustomPage = ref(null);
    
    // 載入客製化頁面列表
    const loadCustomPages = async () => {
      try {
        loading.value = true;
        const params = {
          page: currentPage.value,
          pageSize: pageSize.value,
          search: searchQuery.value,
          status: statusFilter.value,
          category: categoryFilter.value
        };
        
        const response = await customPageService.getCustomPages(params);
        customPages.value = response.data.customPages;
        total.value = response.data.pagination.total;
        
        // 提取分類列表
        const uniqueCategories = [...new Set(customPages.value.map(page => page.category))];
        categories.value = uniqueCategories;
        
      } catch (error) {
        ElMessage.error('載入客製化頁面列表失敗');
        console.error('載入失敗:', error);
      } finally {
        loading.value = false;
      }
    };
    
    // 搜尋處理
    const handleSearch = () => {
      currentPage.value = 1;
      loadCustomPages();
    };
    
    // 篩選處理
    const handleFilter = () => {
      currentPage.value = 1;
      loadCustomPages();
    };
    
    // 分頁處理
    const handleSizeChange = (size) => {
      pageSize.value = size;
      currentPage.value = 1;
      loadCustomPages();
    };
    
    const handleCurrentChange = (page) => {
      currentPage.value = page;
      loadCustomPages();
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
      return new Date(dateString).toLocaleString('zh-TW');
    };
    
    // 查看頁面
    const viewPage = (customPage) => {
      if (customPage.status !== 'ready') {
        ElMessage.warning('頁面尚未準備就緒');
        return;
      }
      
      // 使用當前域名構建完整的查看 URL
      const baseUrl = window.location.origin;
      const url = `${baseUrl}/api/custom-pages/public/${customPage.slug}`;
      window.open(url, '_blank');
    };
    
    // 編輯頁面
    const editPage = (customPage) => {
      selectedCustomPage.value = customPage;
      showEditDialog.value = true;
    };
    
    // 刪除頁面
    const deletePage = async (customPage) => {
      try {
        await ElMessageBox.confirm(
          `確定要刪除客製化頁面「${customPage.title}」嗎？此操作無法復原。`,
          '確認刪除',
          {
            confirmButtonText: '確定',
            cancelButtonText: '取消',
            type: 'warning'
          }
        );
        
        await customPageService.deleteCustomPage(customPage._id);
        ElMessage.success('刪除成功');
        loadCustomPages();
        
      } catch (error) {
        if (error !== 'cancel') {
          ElMessage.error('刪除失敗');
          console.error('刪除失敗:', error);
        }
      }
    };
    
    // 上傳成功處理
    const handleUploadSuccess = () => {
      showUploadDialog.value = false;
      loadCustomPages();
    };
    
    // 編輯成功處理
    const handleEditSuccess = () => {
      showEditDialog.value = false;
      selectedCustomPage.value = null;
      loadCustomPages();
    };
    
    // 處理上傳按鈕點擊
    const handleUploadClick = () => {
      console.log('上傳按鈕被點擊');
      console.log('當前 showUploadDialog 值:', showUploadDialog.value);
      showUploadDialog.value = true;
      console.log('設置後 showUploadDialog 值:', showUploadDialog.value);
      
      // 強制更新組件
      nextTick(() => {
        console.log('nextTick 後 showUploadDialog 值:', showUploadDialog.value);
      });
    };
    
    onMounted(() => {
      loadCustomPages();
    });
    
    return {
      loading,
      customPages,
      total,
      currentPage,
      pageSize,
      searchQuery,
      statusFilter,
      categoryFilter,
      categories,
      showUploadDialog,
      showEditDialog,
      selectedCustomPage,
      loadCustomPages,
      handleSearch,
      handleFilter,
      handleSizeChange,
      handleCurrentChange,
      getStatusType,
      getStatusText,
      formatDate,
      viewPage,
      editPage,
      deletePage,
      handleUploadSuccess,
      handleEditSuccess,
      handleUploadClick
    };
  }
};
</script>

<style scoped>
.custom-page-list {
  padding: 20px;
}
</style>

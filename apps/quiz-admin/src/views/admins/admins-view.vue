<script setup lang="ts">
/**
 * 管理员管理页面
 * 仅超级管理员可访问，管理 Admin 后台的管理员账号
 *
 * 保护规则：
 * - 超级管理员不可被删除
 * - 超级管理员的权限不可被修改
 */
import { ref, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getAdminUsers, createAdmin, updateAdminPermissions, deleteAdmin } from '@/api/mock/admins'
import { ALL_MENU_PERMISSIONS, ALL_API_PERMISSIONS } from '@/types/permission'
import type { AdminUser } from '@/types/account'

/** 管理员列表 */
const admins = ref<AdminUser[]>([])

/** 加载中状态 */
const loading = ref(false)

/** 新增管理员对话框 */
const createDialogVisible = ref(false)

/** 权限配置对话框 */
const permissionDialogVisible = ref(false)

/** 当前编辑的管理员 */
const currentAdmin = ref<AdminUser | null>(null)

/** 新增管理员表单 */
const createForm = ref({
  username: '',
  nickname: '',
  menuPermissions: [] as string[],
  apiPermissions: [] as string[],
})

/** 选中的菜单权限 */
const selectedMenuPermissions = ref<string[]>([])

/** 选中的 API 权限 */
const selectedApiPermissions = ref<string[]>([])

/**
 * 普通管理员可分配的菜单权限（排除 admins）
 * admins 菜单权限仅超级管理员拥有，不可分配给普通管理员
 */
const assignableMenuPermissions = computed(() =>
  ALL_MENU_PERMISSIONS.filter((p) => p.key !== 'admins'),
)

/**
 * 普通管理员可分配的 API 权限（排除 admins 模块）
 */
const assignableApiPermissions = computed(() =>
  ALL_API_PERMISSIONS.filter((p) => p.module !== 'admins'),
)

/**
 * 加载管理员列表
 */
const loadAdmins = async () => {
  try {
    loading.value = true
    admins.value = await getAdminUsers()
  } catch (error) {
    const message = error instanceof Error ? error.message : '加载管理员列表失败'
    ElMessage.error(message)
  } finally {
    loading.value = false
  }
}

/**
 * 判断是否为超级管理员（受保护，不可删除/修改权限）
 */
const isSuperAdmin = (admin: AdminUser): boolean => {
  return admin.role === 'super_admin'
}

/**
 * 打开新增管理员对话框
 */
const openCreateDialog = () => {
  createForm.value = {
    username: '',
    nickname: '',
    menuPermissions: ['dashboard'],
    apiPermissions: [],
  }
  createDialogVisible.value = true
}

/**
 * 创建管理员
 */
const handleCreate = async () => {
  if (!createForm.value.username || !createForm.value.nickname) {
    ElMessage.warning('请填写用户名和昵称')
    return
  }

  try {
    loading.value = true
    await createAdmin(createForm.value)
    ElMessage.success('创建成功')
    createDialogVisible.value = false
    await loadAdmins()
  } catch (error) {
    const message = error instanceof Error ? error.message : '创建管理员失败'
    ElMessage.error(message)
  } finally {
    loading.value = false
  }
}

/**
 * 打开权限配置对话框
 */
const openPermissionDialog = (admin: AdminUser) => {
  if (isSuperAdmin(admin)) {
    ElMessage.warning('超级管理员的权限不可修改')
    return
  }

  currentAdmin.value = admin
  selectedMenuPermissions.value = [...admin.menuPermissions]
  selectedApiPermissions.value = [...admin.apiPermissions]
  permissionDialogVisible.value = true
}

/**
 * 保存权限
 */
const savePermissions = async () => {
  if (!currentAdmin.value) return

  try {
    loading.value = true
    await updateAdminPermissions(
      currentAdmin.value.id,
      selectedMenuPermissions.value,
      selectedApiPermissions.value,
    )
    ElMessage.success('权限更新成功')
    permissionDialogVisible.value = false
    await loadAdmins()
  } catch (error) {
    const message = error instanceof Error ? error.message : '权限更新失败'
    ElMessage.error(message)
  } finally {
    loading.value = false
  }
}

/**
 * 删除管理员
 */
const handleDelete = async (admin: AdminUser) => {
  if (isSuperAdmin(admin)) {
    ElMessage.warning('超级管理员不可被删除')
    return
  }

  try {
    await ElMessageBox.confirm(
      `确定要删除管理员 "${admin.nickname}" 吗？此操作不可恢复。`,
      '警告',
      { type: 'warning' },
    )

    loading.value = true
    await deleteAdmin(admin.id)
    ElMessage.success('删除成功')
    await loadAdmins()
  } catch (error) {
    if (error === 'cancel') return
    const message = error instanceof Error ? error.message : '删除失败'
    ElMessage.error(message)
  } finally {
    loading.value = false
  }
}

/**
 * 格式化日期
 */
const formatDate = (dateStr: string): string => {
  return new Date(dateStr).toLocaleDateString('zh-CN')
}

onMounted(() => {
  loadAdmins()
})
</script>

<template>
  <div class="admins-page">
    <!-- 页头 -->
    <div class="page-header">
      <h1 class="page-title">管理员管理</h1>
      <el-button type="primary" @click="openCreateDialog"> 新增管理员 </el-button>
    </div>

    <!-- 管理员列表 -->
    <el-table :data="admins" v-loading="loading">
      <el-table-column prop="id" label="ID" width="80" />
      <el-table-column prop="username" label="用户名" width="140" />
      <el-table-column prop="nickname" label="昵称" width="140" />
      <el-table-column prop="role" label="角色" width="120">
        <template #default="{ row }">
          <el-tag v-if="isSuperAdmin(row)" type="danger">超级管理员</el-tag>
          <el-tag v-else>普通管理员</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="菜单权限">
        <template #default="{ row }">
          <el-tag v-for="perm in row.menuPermissions" :key="perm" size="small" class="mr-1 mb-1">
            {{ perm }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="创建时间" width="140">
        <template #default="{ row }">
          {{ formatDate(row.createdAt) }}
        </template>
      </el-table-column>
      <el-table-column label="操作" width="180">
        <template #default="{ row }">
          <el-button
            link
            type="primary"
            :disabled="isSuperAdmin(row)"
            @click="openPermissionDialog(row)"
          >
            配置权限
          </el-button>
          <el-button link type="danger" :disabled="isSuperAdmin(row)" @click="handleDelete(row)">
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 新增管理员对话框 -->
    <el-dialog v-model="createDialogVisible" title="新增管理员" width="600px">
      <el-form :model="createForm" label-width="100px">
        <el-form-item label="用户名">
          <el-input v-model="createForm.username" placeholder="请输入用户名（同时作为初始密码）" />
        </el-form-item>
        <el-form-item label="昵称">
          <el-input v-model="createForm.nickname" placeholder="请输入昵称" />
        </el-form-item>

        <!-- 菜单权限 -->
        <el-form-item label="菜单权限">
          <el-checkbox-group v-model="createForm.menuPermissions">
            <el-checkbox
              v-for="perm in assignableMenuPermissions"
              :key="perm.key"
              :value="perm.key"
            >
              {{ perm.label }}
            </el-checkbox>
          </el-checkbox-group>
        </el-form-item>

        <!-- API 权限 -->
        <el-form-item label="API 权限">
          <el-checkbox-group v-model="createForm.apiPermissions">
            <el-checkbox
              v-for="perm in assignableApiPermissions"
              :key="perm.key"
              :value="perm.key"
              class="block mb-2"
            >
              {{ perm.label }}
            </el-checkbox>
          </el-checkbox-group>
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="createDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="loading" @click="handleCreate"> 创建 </el-button>
      </template>
    </el-dialog>

    <!-- 权限配置对话框 -->
    <el-dialog v-model="permissionDialogVisible" title="配置权限" width="600px">
      <div v-if="currentAdmin">
        <p class="mb-4 text-sm text-gray-500 dark:text-gray-400">
          为管理员 <strong>{{ currentAdmin.nickname }}</strong> 配置权限
        </p>

        <!-- 菜单权限 -->
        <div class="mb-6">
          <h3 class="section-title">菜单权限</h3>
          <el-checkbox-group v-model="selectedMenuPermissions">
            <el-checkbox
              v-for="perm in assignableMenuPermissions"
              :key="perm.key"
              :value="perm.key"
            >
              {{ perm.label }}
            </el-checkbox>
          </el-checkbox-group>
        </div>

        <!-- API 权限 -->
        <div>
          <h3 class="section-title">API 权限</h3>
          <el-checkbox-group v-model="selectedApiPermissions">
            <el-checkbox
              v-for="perm in assignableApiPermissions"
              :key="perm.key"
              :value="perm.key"
              class="block mb-2"
            >
              {{ perm.label }}
            </el-checkbox>
          </el-checkbox-group>
        </div>
      </div>

      <template #footer>
        <el-button @click="permissionDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="loading" @click="savePermissions"> 保存 </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style lang="scss" scoped>
.admins-page {
  @apply space-y-6;
}

.page-header {
  @apply flex items-center justify-between;
}

.page-title {
  @apply text-2xl font-bold;
  color: var(--color-text);
}

.section-title {
  @apply text-lg font-semibold mb-3;
  color: var(--color-text);
}
</style>

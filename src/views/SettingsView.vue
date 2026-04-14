<template>
  <div class="settings-page card-panel">
    <h2>个人设置</h2>
    
    <el-tabs v-model="activeTab">
      <el-tab-pane label="基本信息" name="profile">
        <div class="avatar-section">
          <el-avatar :size="100" :src="user && user.avatar" class="avatar-preview">
            {{ user && user.nickname && user.nickname[0] }}
          </el-avatar>
          <el-upload
            class="avatar-uploader"
            action=""
            :auto-upload="false"
            :show-file-list="false"
            :on-change="handleAvatarChange"
            accept="image/jpeg,image/png,image/gif,image/webp"
          >
            <el-button type="primary" plain :loading="avatarLoading">更换头像</el-button>
          </el-upload>
          <p class="avatar-tip">支持 JPG、PNG、GIF、WEBP 格式，大小不超过 5MB</p>
        </div>
        
        <el-form :model="profileForm" :rules="profileRules" ref="profileForm" label-width="80px" class="settings-form">
          <el-form-item label="昵称" prop="nickname">
            <el-input v-model="profileForm.nickname" maxlength="20" show-word-limit />
          </el-form-item>
          <el-form-item label="简介" prop="bio">
            <el-input 
              v-model="profileForm.bio" 
              type="textarea" 
              :rows="4" 
              maxlength="200" 
              show-word-limit 
              placeholder="介绍一下你自己..."
            />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="saveProfile" :loading="profileLoading">保存修改</el-button>
          </el-form-item>
        </el-form>
      </el-tab-pane>
      
      <el-tab-pane label="修改密码" name="password">
        <el-form :model="passwordForm" :rules="passwordRules" ref="passwordForm" label-width="100px" class="settings-form">
          <el-form-item label="原密码" prop="oldPassword">
            <el-input v-model="passwordForm.oldPassword" type="password" show-password />
          </el-form-item>
          <el-form-item label="新密码" prop="newPassword">
            <el-input v-model="passwordForm.newPassword" type="password" show-password />
          </el-form-item>
          <el-form-item label="确认密码" prop="confirmPassword">
            <el-input v-model="passwordForm.confirmPassword" type="password" show-password />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="savePassword" :loading="passwordLoading">修改密码</el-button>
          </el-form-item>
        </el-form>
      </el-tab-pane>
      
      <el-tab-pane label="账号安全" name="security">
        <div class="danger-zone">
          <h3>危险操作</h3>
          <div class="danger-item">
            <div class="danger-info">
              <h4>退出登录</h4>
              <p>退出当前账号，需要重新登录</p>
            </div>
            <el-button plain @click="handleLogout">退出登录</el-button>
          </div>
          <div class="danger-item">
            <div class="danger-info">
              <h4>注销账号</h4>
              <p>永久删除账号及所有数据，此操作不可恢复</p>
            </div>
            <el-button type="danger" plain @click="showDeleteAccountDialog">注销账号</el-button>
          </div>
        </div>
      </el-tab-pane>
    </el-tabs>
    
    <el-dialog
      title="注销账号"
      :visible.sync="deleteAccountDialogVisible"
      width="400px"
      :modal-append-to-body="false"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
    >
      <p style="color: #f56c6c; margin-bottom: 16px;">警告：此操作将永久删除您的账号及所有相关数据，无法恢复！</p>
      <el-form :model="deleteAccountForm" ref="deleteAccountForm">
        <el-form-item label="请输入密码确认" prop="password">
          <el-input v-model="deleteAccountForm.password" type="password" show-password />
        </el-form-item>
      </el-form>
      <span slot="footer">
        <el-button @click="deleteAccountDialogVisible = false">取消</el-button>
        <el-button type="danger" @click="handleDeleteAccount" :loading="deleteAccountLoading">确认注销</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import { mapState } from 'vuex';
import { updateProfile, updatePassword, uploadAvatar, deleteAccount } from '../api';

export default {
  name: 'SettingsView',
  data() {
    const validateConfirmPassword = (rule, value, callback) => {
      if (value !== this.passwordForm.newPassword) {
        callback(new Error('两次输入的密码不一致'));
      } else {
        callback();
      }
    };
    
    return {
      activeTab: 'profile',
      profileLoading: false,
      passwordLoading: false,
      avatarLoading: false,
      deleteAccountDialogVisible: false,
      deleteAccountLoading: false,
      deleteAccountForm: {
        password: ''
      },
      profileForm: {
        nickname: '',
        bio: ''
      },
      passwordForm: {
        oldPassword: '',
        newPassword: '',
        confirmPassword: ''
      },
      profileRules: {
        nickname: [
          { required: true, message: '请输入昵称', trigger: 'blur' },
          { min: 1, max: 20, message: '昵称长度在1-20个字符', trigger: 'blur' }
        ]
      },
      passwordRules: {
        oldPassword: [
          { required: true, message: '请输入原密码', trigger: 'blur' }
        ],
        newPassword: [
          { required: true, message: '请输入新密码', trigger: 'blur' },
          { min: 6, message: '密码至少6个字符', trigger: 'blur' }
        ],
        confirmPassword: [
          { required: true, message: '请确认密码', trigger: 'blur' },
          { validator: validateConfirmPassword, trigger: 'blur' }
        ]
      }
    };
  },
  computed: {
    ...mapState(['user'])
  },
  created() {
    this.initProfileForm();
  },
  methods: {
    initProfileForm() {
      if (this.user) {
        this.profileForm.nickname = this.user.nickname || '';
        this.profileForm.bio = this.user.bio || '';
      }
    },
    async handleAvatarChange(file) {
      const isJPG = file.raw.type === 'image/jpeg';
      const isPNG = file.raw.type === 'image/png';
      const isGIF = file.raw.type === 'image/gif';
      const isWEBP = file.raw.type === 'image/webp';
      const isLt5M = file.raw.size / 1024 / 1024 < 5;

      if (!isJPG && !isPNG && !isGIF && !isWEBP) {
        this.$message.error('只支持 JPG、PNG、GIF、WEBP 格式的图片');
        return;
      }
      if (!isLt5M) {
        this.$message.error('图片大小不能超过 5MB');
        return;
      }

      this.avatarLoading = true;
      try {
        const formData = new FormData();
        formData.append('avatar', file.raw);
        const { data } = await uploadAvatar(formData);
        this.$message.success(data.message || '头像上传成功');
        this.$store.commit('setProfile', data);
      } catch (error) {
        // 错误已在 request.js 拦截器中处理并显示
      } finally {
        this.avatarLoading = false;
      }
    },
    async saveProfile() {
      this.$refs.profileForm.validate(async (valid) => {
        if (!valid) return;
        
        this.profileLoading = true;
        try {
          const { data } = await updateProfile(this.profileForm);
          this.$message.success(data.message || '保存成功');
          this.$store.commit('setProfile', data);
        } catch (error) {
          // 错误已在 request.js 拦截器中处理并显示
        } finally {
          this.profileLoading = false;
        }
      });
    },
    async savePassword() {
      this.$refs.passwordForm.validate(async (valid) => {
        if (!valid) return;
        
        this.passwordLoading = true;
        try {
          const { data } = await updatePassword({
            oldPassword: this.passwordForm.oldPassword,
            newPassword: this.passwordForm.newPassword
          });
          this.$message.success(data.message || '密码修改成功');
          this.$refs.passwordForm.resetFields();
          
          setTimeout(() => {
            this.$store.dispatch('logout');
            this.$router.push('/auth');
          }, 1500);
        } catch (error) {
          // 错误已在 request.js 拦截器中处理并显示
        } finally {
          this.passwordLoading = false;
        }
      });
    },
    handleLogout() {
      this.$confirm('确定要退出登录吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.$store.dispatch('logout');
        this.$message.success('已退出登录');
        this.$router.push('/');
      }).catch(() => {});
    },
    showDeleteAccountDialog() {
      this.deleteAccountForm.password = '';
      this.deleteAccountDialogVisible = true;
    },
    async handleDeleteAccount() {
      if (!this.deleteAccountForm.password) {
        this.$message.error('请输入密码');
        return;
      }
      
      this.deleteAccountLoading = true;
      try {
        const { data } = await deleteAccount({ password: this.deleteAccountForm.password });
        this.$message.success(data.message || '账号已注销');
        this.deleteAccountDialogVisible = false;
        this.$store.commit('clearAuth');
        this.$router.push('/');
      } catch (error) {
        // 错误已在 request.js 拦截器中处理并显示
      } finally {
        this.deleteAccountLoading = false;
      }
    }
  },
  watch: {
    user: {
      handler(newUser) {
        if (newUser) {
          this.profileForm.nickname = newUser.nickname || '';
          this.profileForm.bio = newUser.bio || '';
        }
      },
      immediate: true
    }
  }
};
</script>

<style scoped>
.settings-page {
  max-width: 600px;
  margin: 0 auto;
  padding: 24px;
}

.settings-page h2 {
  margin: 0 0 24px 0;
  font-size: 24px;
}

.settings-form {
  margin-top: 20px;
}

.avatar-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px 0;
  border-bottom: 1px solid var(--line);
  margin-bottom: 20px;
}

.avatar-preview {
  margin-bottom: 16px;
  border: 2px solid var(--line);
}

.avatar-uploader {
  margin-bottom: 8px;
}

.avatar-tip {
  font-size: 12px;
  color: var(--subtext);
  margin: 0;
}

.danger-zone {
  padding: 20px 0;
}

.danger-zone h3 {
  margin: 0 0 20px 0;
  font-size: 18px;
  color: #f56c6c;
}

.danger-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px;
  border: 1px solid #fde2e2;
  border-radius: 8px;
  background: #fef0f0;
  margin-bottom: 16px;
}

.danger-info h4 {
  margin: 0 0 8px 0;
  font-size: 16px;
  color: #f56c6c;
}

.danger-info p {
  margin: 0;
  font-size: 14px;
  color: #909399;
}

:deep(.el-tabs__nav-wrap::after) {
  height: 1px;
  background-color: var(--line);
}

:deep(.el-tabs__item) {
  font-size: 15px;
}

:deep(.el-tabs__item.is-active) {
  color: var(--primary);
}

:deep(.el-tabs__active-bar) {
  background-color: var(--primary);
}

:deep(.el-dialog__wrapper) {
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  overflow: auto;
  margin: 0;
}

body.el-popup-parent--hidden {
  overflow: hidden !important;
}
</style>

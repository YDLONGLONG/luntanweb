<template>
  <div class="forgot-password-page card-panel">
    <div class="auth-banner">
      <h2>找回密码</h2>
      <p>通过安全问题验证后重置您的密码</p>
    </div>
    
    <el-steps :active="activeStep" finish-status="success" simple>
      <el-step title="输入用户名"></el-step>
      <el-step title="验证安全问题"></el-step>
      <el-step title="重置密码"></el-step>
    </el-steps>
    
    <!-- 步骤1：输入用户名 -->
    <div v-if="activeStep === 0" class="step-content">
      <el-form :model="step1Form" @submit.native.prevent>
        <el-form-item>
          <el-input v-model="step1Form.username" placeholder="请输入用户名" />
        </el-form-item>
        <el-button type="primary" round @click="handleStep1" :loading="loading">下一步</el-button>
      </el-form>
    </div>
    
    <!-- 步骤2：验证安全问题 -->
    <div v-if="activeStep === 1" class="step-content">
      <el-form :model="step2Form" @submit.native.prevent>
        <el-form-item>
          <p class="security-question">{{ securityQuestion }}</p>
        </el-form-item>
        <el-form-item>
          <el-input v-model="step2Form.answer" placeholder="请输入安全问题答案" />
        </el-form-item>
        <div class="step-actions">
          <el-button round @click="activeStep = 0">上一步</el-button>
          <el-button type="primary" round @click="handleStep2" :loading="loading">下一步</el-button>
        </div>
      </el-form>
    </div>
    
    <!-- 步骤3：重置密码 -->
    <div v-if="activeStep === 2" class="step-content">
      <el-form :model="step3Form" :rules="step3Rules" ref="step3Form" @submit.native.prevent>
        <el-form-item prop="newPassword">
          <el-input v-model="step3Form.newPassword" type="password" placeholder="请输入新密码" />
        </el-form-item>
        <el-form-item prop="confirmPassword">
          <el-input v-model="step3Form.confirmPassword" type="password" placeholder="请确认新密码" />
        </el-form-item>
        <div class="step-actions">
          <el-button round @click="activeStep = 1">上一步</el-button>
          <el-button type="primary" round @click="handleStep3" :loading="loading">重置密码</el-button>
        </div>
      </el-form>
    </div>
    
    <div class="back-link">
      <el-button type="text" @click="$router.push('/auth')">返回登录</el-button>
    </div>
  </div>
</template>

<script>
import { getUserSecurityQuestion, resetPassword } from '../api';

export default {
  name: 'ForgotPasswordView',
  data() {
    const validateConfirmPassword = (rule, value, callback) => {
      if (value !== this.step3Form.newPassword) {
        callback(new Error('两次输入的密码不一致'));
      } else {
        callback();
      }
    };
    
    return {
      activeStep: 0,
      loading: false,
      securityQuestion: '',
      step1Form: {
        username: ''
      },
      step2Form: {
        answer: ''
      },
      step3Form: {
        newPassword: '',
        confirmPassword: ''
      },
      step3Rules: {
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
  methods: {
    async handleStep1() {
      if (!this.step1Form.username) {
        this.$message.error('请输入用户名');
        return;
      }
      
      this.loading = true;
      try {
        const { data } = await getUserSecurityQuestion(this.step1Form.username);
        this.securityQuestion = data.question;
        this.activeStep = 1;
      } catch (error) {
        // 错误已在 request.js 拦截器中处理
      } finally {
        this.loading = false;
      }
    },
    async handleStep2() {
      if (!this.step2Form.answer) {
        this.$message.error('请输入安全问题答案');
        return;
      }
      
      this.activeStep = 2;
    },
    async handleStep3() {
      this.$refs.step3Form.validate(async (valid) => {
        if (!valid) return;
        
        this.loading = true;
        try {
          const { data } = await resetPassword({
            username: this.step1Form.username,
            answer: this.step2Form.answer,
            newPassword: this.step3Form.newPassword
          });
          this.$message.success(data.message || '密码重置成功');
          setTimeout(() => {
            this.$router.push('/auth');
          }, 1500);
        } catch (error) {
          // 错误已在 request.js 拦截器中处理
        } finally {
          this.loading = false;
        }
      });
    }
  }
};
</script>

<style scoped>
.forgot-password-page {
  padding: 28px;
  max-width: 560px;
  margin: 0 auto;
}

.auth-banner {
  margin-bottom: 20px;
}

.auth-banner h2 {
  margin: 0 0 8px;
  font-size: 28px;
}

.auth-banner p {
  margin: 0;
  line-height: 1.8;
  color: var(--subtext);
}

.step-content {
  margin-top: 24px;
}

.security-question {
  font-size: 16px;
  color: var(--primary);
  font-weight: 500;
  margin: 0;
  padding: 12px;
  background: #f5f9ff;
  border-radius: 8px;
  border-left: 4px solid var(--primary);
}

.step-actions {
  display: flex;
  gap: 12px;
}

.step-actions .el-button {
  flex: 1;
}

.back-link {
  text-align: center;
  margin-top: 20px;
}

.back-link .el-button {
  width: auto;
}

:deep(.el-steps) {
  margin-bottom: 20px;
}

:deep(.el-step__title) {
  font-size: 14px;
}
</style>

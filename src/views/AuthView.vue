<template>
  <div class="auth-page card-panel">
    <div class="auth-banner">
      <h2>开启你的高质量讨论</h2>
      <p>在知屿论坛里记录经验、提问、回答，也和关注你的人建立持续连接。</p>
    </div>
    <el-tabs v-model="activeTab" stretch>
      <el-tab-pane label="登录" name="login">
        <el-form :model="loginForm" @submit.native.prevent>
          <el-form-item>
            <el-input v-model="loginForm.username" placeholder="用户名" />
          </el-form-item>
          <el-form-item>
            <el-input v-model="loginForm.password" type="password" placeholder="密码" />
          </el-form-item>
          <el-button type="primary" round @click="handleLogin">立即登录</el-button>
        </el-form>
      </el-tab-pane>
      <el-tab-pane label="注册" name="register">
        <el-form :model="registerForm" @submit.native.prevent>
          <el-form-item>
            <el-input v-model="registerForm.nickname" placeholder="昵称" />
          </el-form-item>
          <el-form-item>
            <el-input v-model="registerForm.username" placeholder="用户名" />
          </el-form-item>
          <el-form-item>
            <el-input v-model="registerForm.password" type="password" placeholder="密码" />
          </el-form-item>
          <el-button type="primary" round @click="handleRegister">注册并登录</el-button>
        </el-form>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script>
import { login, register } from '../api';

export default {
  name: 'AuthView',
  data() {
    return {
      activeTab: 'login',
      loginForm: { username: '', password: '' },
      registerForm: { username: '', password: '', nickname: '' }
    };
  },
  methods: {
    async handleLogin() {
      const { data } = await login(this.loginForm);
      this.$store.commit('setAuth', data);
      this.$message.success('登录成功');
      this.$router.push('/');
    },
    async handleRegister() {
      const { data } = await register(this.registerForm);
      this.$store.commit('setAuth', data);
      this.$message.success('注册成功');
      this.$router.push('/');
    }
  }
};
</script>

<style scoped>
.auth-page {
  padding: 28px;
  max-width: 560px;
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
.el-button {
  width: 100%;
}
</style>

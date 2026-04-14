<template>
  <div class="shell">
    <header class="topbar card-panel">
      <div class="brand" @click="goHome">
        <span class="brand-mark">知</span>
        <div>
          <strong>知屿论坛</strong>
          <p>认真讨论每个值得被回答的问题</p>
        </div>
      </div>
      <div class="topbar-right">
        <el-input
          v-model="keyword"
          placeholder="搜索帖子、观点、经验"
          prefix-icon="el-icon-search"
          class="search-box"
          @keyup.enter.native="doSearch"
        />
        <template v-if="user">
          <el-badge :value="totalUnread" :hidden="totalUnread <= 0">
            <el-button icon="el-icon-chat-line-square" circle @click="$router.push('/messages')" />
          </el-badge>
          <el-button type="primary" round @click="$router.push('/publish')">提问 / 发帖</el-button>
          <div class="user-box" @click="$router.push('/profile')">
            <el-avatar :src="user.avatar">{{ user.nickname && user.nickname[0] }}</el-avatar>
            <div class="user-meta">
              <strong>{{ user.nickname }}</strong>
              <span>{{ stats.posts }} 篇内容</span>
            </div>
          </div>
          <el-button plain round @click="handleLogout">退出登录</el-button>
        </template>
        <template v-else>
          <el-button type="primary" round @click="$router.push('/auth')">登录 / 注册</el-button>
        </template>
      </div>
    </header>

    <div class="layout-grid page-shell">
      <main class="main-column">
        <router-view />
      </main>
      <aside class="side-column" v-if="showSidebar">
        <div class="card-panel profile-card" v-if="user">
          <div class="profile-top">
            <el-avatar :size="64" :src="user.avatar">{{ user.nickname && user.nickname[0] }}</el-avatar>
            <div>
              <h3>{{ user.nickname }}</h3>
              <p>{{ user.bio || '在这里分享你的观察与经验。' }}</p>
            </div>
          </div>
          <div class="profile-stats">
            <div><strong>{{ stats.follows }}</strong><span>关注</span></div>
            <div><strong>{{ stats.fans }}</strong><span>粉丝</span></div>
            <div><strong>{{ stats.posts }}</strong><span>帖子</span></div>
          </div>
          <div class="profile-actions">
            <el-button plain @click="$router.push('/follow')">我的关注</el-button>
            <el-button plain @click="$router.push('/profile')">个人主页</el-button>
            <el-button plain @click="$router.push('/settings')">个人设置</el-button>
          </div>
        </div>
        <div class="card-panel side-card">
          <div class="side-title">今日热议</div>
          <ul>
            <li v-for="item in hotTopics" :key="item">{{ item }}</li>
          </ul>
        </div>
      </aside>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex';

export default {
  name: 'AppLayout',
  data() {
    return {
      keyword: '',
      hotTopics: ['如何高效写出第一篇技术贴', '毕业生如何建立个人作品集', '产品经理和前端如何更好协作', '你最近一次被好答案打动是什么时候']
    };
  },
  computed: {
    ...mapState(['user', 'stats', 'unreadMap']),
    totalUnread() {
      return Object.values(this.unreadMap || {}).reduce((sum, count) => sum + Number(count || 0), 0);
    },
    showSidebar() {
      return this.$route.name !== 'messages';
    }
  },
  methods: {
    goHome() {
      if (this.$route.path !== '/') {
        this.$router.push('/');
      }
    },
    doSearch() {
      if (this.$route.name !== 'home') {
        this.$router.push({ path: '/', query: { keyword: this.keyword } });
      } else {
        this.$router.replace({ query: { keyword: this.keyword } });
      }
    },
    async handleLogout() {
      await this.$store.dispatch('logout');
      this.$message.success('已退出登录');
      if (this.$route.meta.auth) {
        this.$router.push('/');
      }
    }
  },
  watch: {
    '$route.query.keyword': {
      immediate: true,
      handler(value) {
        this.keyword = value || '';
      }
    }
  }
};
</script>

<style scoped>
.shell {
  min-height: 100vh;
}
.topbar {
  position: sticky;
  top: 0;
  z-index: 20;
  width: min(1200px, calc(100% - 24px));
  margin: 16px auto 0;
  padding: 12px 18px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}
.brand {
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
}
.brand-mark {
  width: 42px;
  height: 42px;
  display: grid;
  place-items: center;
  border-radius: 14px;
  background: linear-gradient(135deg, var(--primary), #61a8ff);
  color: #fff;
  font-size: 22px;
  font-weight: 700;
}
.brand p {
  margin: 4px 0 0;
  color: var(--subtext);
  font-size: 12px;
}
.topbar-right {
  display: flex;
  align-items: center;
  gap: 12px;
}
.search-box {
  width: 360px;
}
.layout-grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 320px;
  gap: 18px;
}
.user-box, .profile-top {
  display: flex;
  align-items: center;
  gap: 12px;
}
.user-box {
  cursor: pointer;
}
.user-meta, .profile-top div {
  display: flex;
  flex-direction: column;
}
.user-meta span, .profile-top p {
  color: var(--subtext);
  font-size: 12px;
}
.profile-card, .side-card {
  padding: 20px;
  margin-bottom: 16px;
}
.profile-stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  margin: 18px 0;
  text-align: center;
}
.profile-stats span {
  display: block;
  margin-top: 6px;
  color: var(--subtext);
  font-size: 12px;
}
.profile-actions {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}
.side-title {
  margin-bottom: 14px;
  font-size: 18px;
  font-weight: 700;
}
.side-card ul {
  margin: 0;
  padding-left: 18px;
  color: var(--subtext);
}
.side-card li + li {
  margin-top: 12px;
}
@media (max-width: 1024px) {
  .layout-grid {
    grid-template-columns: 1fr;
  }
  .side-column {
    order: -1;
  }
}
@media (max-width: 768px) {
  .topbar {
    width: calc(100% - 16px);
    padding: 12px;
    border-radius: 16px;
    flex-wrap: wrap;
  }
  .search-box {
    width: 100%;
  }
  .topbar-right {
    width: 100%;
    justify-content: space-between;
    flex-wrap: wrap;
  }
  .brand p {
    display: none;
  }
}
</style>

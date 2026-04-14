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
        <div class="search-wrapper">
          <el-input
            v-model="keyword"
            placeholder="搜索帖子、观点、经验"
            prefix-icon="el-icon-search"
            class="search-box"
            @keyup.enter.native="doSearch"
          />
          <el-button type="primary" icon="el-icon-search" @click="doSearch">搜索</el-button>
        </div>
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
        <div class="card-panel side-card" v-if="recommendedPosts.length">
          <div class="side-title">🔥 热门推荐</div>
          <ul class="recommended-list">
            <li v-for="post in recommendedPosts" :key="post.id" @click="$router.push(`/post/${post.id}`)">
              <span class="post-title">{{ post.title }}</span>
              <span class="post-views">{{ post.views }} 浏览</span>
            </li>
          </ul>
        </div>
      </aside>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex';
import { getRecommendedPosts } from '../api';

export default {
  name: 'AppLayout',
  data() {
    return {
      keyword: '',
      recommendedPosts: []
    };
  },
  created() {
    this.fetchRecommendedPosts();
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
      const currentKeyword = this.$route.query.keyword || '';
      if (this.keyword === currentKeyword) return;
      
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
    },
    async fetchRecommendedPosts() {
      try {
        const { data } = await getRecommendedPosts({ limit: 5 });
        this.recommendedPosts = data;
      } catch (error) {
        // 错误已在 request.js 拦截器中处理
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
.search-wrapper {
  display: flex;
  align-items: center;
  gap: 8px;
}
.search-box {
  width: 280px;
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
  grid-template-columns: 1fr 1fr 1fr;
  gap: 8px;
}
.profile-actions .el-button {
  padding: 8px 4px;
  font-size: 13px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.side-title {
  margin-bottom: 14px;
  font-size: 18px;
  font-weight: 700;
}
.side-card ul {
  margin: 0;
  padding-left: 0;
  list-style: none;
  color: var(--subtext);
}
.side-card li + li {
  margin-top: 12px;
}
.recommended-list li {
  display: flex;
  flex-direction: column;
  gap: 4px;
  cursor: pointer;
  padding: 8px;
  border-radius: 8px;
  transition: background 0.2s;
}
.recommended-list li:hover {
  background: #f5f9ff;
}
.post-title {
  color: var(--text);
  font-size: 14px;
  font-weight: 500;
  line-height: 1.5;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}
.post-views {
  font-size: 12px;
  color: var(--subtext);
}
@media (max-width: 1024px) {
  .layout-grid {
    grid-template-columns: 1fr;
    width: calc(100% - 16px);
    padding: 0 8px;
  }
  .side-column {
    order: -1;
  }
}
@media (max-width: 768px) {
  .topbar {
    width: calc(100% - 16px);
    padding: 8px 12px;
    border-radius: 12px;
    flex-wrap: wrap;
    margin-top: 8px;
  }
  .brand-mark {
    width: 32px;
    height: 32px;
    font-size: 16px;
    border-radius: 10px;
  }
  .brand strong {
    font-size: 14px;
  }
  .search-wrapper {
    width: 100%;
    order: 1;
  }
  .search-box {
    width: 100%;
  }
  .search-box :deep(.el-input__inner) {
    height: 32px;
    line-height: 32px;
  }
  .search-wrapper .el-button {
    padding: 8px 12px;
    font-size: 12px;
  }
  .topbar-right {
    width: 100%;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 8px;
  }
  .topbar-right > .el-button {
    padding: 8px 12px;
    font-size: 12px;
  }
  .user-box .el-avatar {
    width: 28px !important;
    height: 28px !important;
    line-height: 28px !important;
  }
  .user-meta strong {
    font-size: 12px;
  }
  .user-meta span {
    font-size: 10px;
  }
  .brand p {
    display: none;
  }
  
  /* 手机端个人信息卡片优化 */
  .profile-card {
    padding: 12px;
    margin-bottom: 12px;
  }
  .profile-top .el-avatar {
    width: 48px !important;
    height: 48px !important;
    line-height: 48px !important;
  }
  .profile-top h3 {
    font-size: 14px;
    margin: 0;
  }
  .profile-top p {
    font-size: 11px;
    margin: 4px 0 0;
  }
  .profile-stats {
    margin: 12px 0;
  }
  .profile-stats strong {
    font-size: 14px;
  }
  .profile-stats span {
    font-size: 10px;
    margin-top: 2px;
  }
  .profile-actions {
    gap: 6px;
  }
  .profile-actions .el-button {
    padding: 6px 2px;
    font-size: 11px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  
  /* 手机端今日热点优化 */
  .side-card {
    padding: 12px;
    margin-bottom: 12px;
    overflow: hidden;
  }
  .side-title {
    font-size: 14px;
    margin-bottom: 10px;
  }
  .side-card ul {
    padding-left: 0;
  }
  .side-card li {
    font-size: 12px;
  }
  .side-card li + li {
    margin-top: 8px;
  }
  .recommended-list li {
    padding: 6px;
  }
  .post-title {
    font-size: 13px;
    word-break: break-all;
  }
}
</style>

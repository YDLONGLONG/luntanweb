<template>
  <div class="profile-page" v-loading="loading">
    <div class="card-panel profile-hero" v-if="dashboard.user">
      <div class="hero-top">
        <div class="hero-user">
          <el-avatar :size="72" :src="dashboard.user.avatar">{{ dashboard.user.nickname && dashboard.user.nickname[0] }}</el-avatar>
          <div>
            <h2>{{ dashboard.user.nickname }}</h2>
            <p>@{{ dashboard.user.username }}</p>
            <span>{{ dashboard.user.bio || '分享真实经验，参与有价值讨论。' }}</span>
          </div>
        </div>
        <el-button plain round @click="handleLogout">退出登录</el-button>
      </div>
      <div class="hero-stats">
        <div><strong>{{ dashboard.stats.follows }}</strong><span>关注</span></div>
        <div><strong>{{ dashboard.stats.fans }}</strong><span>粉丝</span></div>
        <div><strong>{{ dashboard.stats.posts }}</strong><span>帖子</span></div>
      </div>
    </div>

    <div class="profile-grid">
      <div class="card-panel manager-card">
        <div class="section-title"><h3>我发布的帖子</h3></div>
        <el-empty v-if="!dashboard.posts.length" description="还没有发布帖子" />
        <div v-for="item in dashboard.posts" :key="item.id" class="manager-item">
          <div class="post-content" @click="$router.push(`/post/${item.id}`)">
            <strong>{{ item.title }}</strong>
            <p>{{ item.content }}</p>
          </div>
          <div class="manager-bottom">
            <div class="manager-stats">
              <span>{{ item.likeCount }} 赞</span>
              <span>{{ item.favoriteCount }} 收藏</span>
              <span>{{ item.commentCount }} 评论</span>
            </div>
            <div class="manager-actions">
              <el-button type="text" @click="$router.push(`/publish/${item.id}`)">编辑</el-button>
              <el-button type="text" class="danger" @click="handleDeletePost(item)">删除</el-button>
            </div>
          </div>
        </div>
      </div>

      <div class="card-panel manager-card">
        <div class="section-title"><h3>我的评论</h3></div>
        <el-empty v-if="!dashboard.comments.length" description="还没有评论记录" />
        <div v-for="item in dashboard.comments" :key="item.id" class="manager-item comment-row">
          <div class="comment-content" @click="$router.push(`/post/${item.postId}`)">
            <strong>评论于：{{ item.postTitle }}</strong>
            <p>
              <template v-if="item.replyToNickname">回复 @{{ item.replyToNickname }}：</template>
              {{ item.content }}
            </p>
            <span>{{ formatTime(item.createdAt) }}</span>
          </div>
          <el-button type="text" @click="handleDeleteComment(item)">删除</el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { deleteComment, deletePost, getDashboard } from '../api';

export default {
  name: 'ProfileView',
  data() {
    return {
      loading: false,
      dashboard: {
        user: null,
        stats: { follows: 0, fans: 0, posts: 0 },
        posts: [],
        comments: []
      }
    };
  },
  created() {
    this.fetchDashboard();
  },
  methods: {
    formatTime(value) {
      return String(value).replace('T', ' ').slice(0, 16);
    },
    async fetchDashboard() {
      this.loading = true;
      try {
        const { data } = await getDashboard();
        this.dashboard = data;
        await this.$store.dispatch('refreshProfile');
      } finally {
        this.loading = false;
      }
    },
    async handleDeleteComment(item) {
      await deleteComment(item.postId, item.id);
      this.$message.success('评论已删除');
      await this.fetchDashboard();
    },
    async handleDeletePost(item) {
      await deletePost(item.id);
      this.$message.success('帖子已删除');
      await this.fetchDashboard();
    },
    async handleLogout() {
      await this.$store.dispatch('logout');
      this.$message.success('已退出登录');
      this.$router.push('/');
    }
  }
};
</script>

<style scoped>
.profile-hero {
  padding: 24px;
  margin-bottom: 18px;
}
.hero-top, .hero-user {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}
.hero-user {
  justify-content: flex-start;
}
.hero-user h2 {
  margin: 0 0 6px;
  font-size: 28px;
}
.hero-user p,
.hero-user span {
  display: block;
  margin: 0;
  color: var(--subtext);
}
.hero-stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  margin-top: 18px;
}
.hero-stats div {
  padding: 18px;
  border-radius: 16px;
  background: var(--warm);
  text-align: center;
}
.hero-stats span {
  display: block;
  margin-top: 6px;
  color: var(--subtext);
}
.profile-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 18px;
}
.manager-card {
  padding: 22px;
}
.manager-item {
  padding: 14px 0;
  border-top: 1px solid var(--line);
}
.manager-item:first-of-type {
  border-top: none;
}
.post-content {
  cursor: pointer;
}
.manager-item strong {
  display: block;
  margin-bottom: 8px;
}
.manager-item p {
  margin: 0;
  line-height: 1.8;
  color: #384250;
}
.manager-bottom {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}
.manager-stats {
  display: flex;
  gap: 12px;
  margin-top: 10px;
  color: var(--subtext);
  font-size: 12px;
}
.manager-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}
.danger {
  color: #f56c6c;
}
.comment-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}
.comment-content {
  flex: 1;
  cursor: pointer;
}
.comment-content span {
  color: var(--subtext);
  font-size: 12px;
}
@media (max-width: 768px) {
  .profile-grid {
    grid-template-columns: 1fr;
  }
  .hero-top,
  .manager-bottom {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>

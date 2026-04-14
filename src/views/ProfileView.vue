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
        <el-empty v-if="!posts.list.length" description="还没有发布帖子" />
        <div v-for="item in posts.list" :key="item.id" class="manager-item">
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
        <el-pagination
          v-if="posts.total > posts.limit"
          class="pagination"
          background
          layout="prev, pager, next"
          :current-page="posts.page"
          :page-size="posts.limit"
          :total="posts.total"
          @current-change="handlePostsPageChange"
        />
      </div>

      <div class="card-panel manager-card">
        <div class="section-title"><h3>我的评论</h3></div>
        <el-empty v-if="!comments.list.length" description="还没有评论记录" />
        <div v-for="item in comments.list" :key="item.id" class="manager-item comment-row">
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
        <el-pagination
          v-if="comments.total > comments.limit"
          class="pagination"
          background
          layout="prev, pager, next"
          :current-page="comments.page"
          :page-size="comments.limit"
          :total="comments.total"
          @current-change="handleCommentsPageChange"
        />
      </div>
    </div>
  </div>
</template>

<script>
import { deleteComment, deletePost, getDashboard, getMyPosts, getMyComments } from '../api';

export default {
  name: 'ProfileView',
  data() {
    return {
      loading: false,
      dashboard: {
        user: null,
        stats: { follows: 0, fans: 0, posts: 0 }
      },
      posts: {
        list: [],
        total: 0,
        page: 1,
        limit: 5
      },
      comments: {
        list: [],
        total: 0,
        page: 1,
        limit: 5
      }
    };
  },
  created() {
    this.fetchDashboard();
    this.fetchPosts();
    this.fetchComments();
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
    async fetchPosts() {
      try {
        const { data } = await getMyPosts({
          page: this.posts.page,
          limit: this.posts.limit
        });
        this.posts = data;
      } catch (error) {
        this.$message.error('获取帖子列表失败');
      }
    },
    async fetchComments() {
      try {
        const { data } = await getMyComments({
          page: this.comments.page,
          limit: this.comments.limit
        });
        this.comments = data;
      } catch (error) {
        this.$message.error('获取评论列表失败');
      }
    },
    handlePostsPageChange(page) {
      this.posts.page = page;
      this.fetchPosts();
    },
    handleCommentsPageChange(page) {
      this.comments.page = page;
      this.fetchComments();
    },
    async handleDeleteComment(item) {
      await deleteComment(item.postId, item.id);
      this.$message.success('评论已删除');
      await this.fetchComments();
    },
    async handleDeletePost(item) {
      await deletePost(item.id);
      this.$message.success('帖子已删除');
      await this.fetchPosts();
      await this.fetchDashboard();
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
  grid-template-columns: repeat(2, 1fr);
  gap: 18px;
}
.manager-card {
  padding: 20px;
}
.section-title {
  margin-bottom: 14px;
  padding-bottom: 10px;
  border-bottom: 1px solid var(--border);
}
.section-title h3 {
  margin: 0;
  font-size: 18px;
}
.manager-item {
  padding: 14px 0;
  border-bottom: 1px solid var(--border);
}
.manager-item:last-child {
  border-bottom: none;
}
.post-content,
.comment-content {
  cursor: pointer;
}
.post-content strong,
.comment-content strong {
  display: block;
  margin-bottom: 6px;
  font-size: 16px;
}
.post-content p,
.comment-content p {
  margin: 0;
  color: var(--subtext);
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}
.comment-content span {
  display: block;
  margin-top: 6px;
  font-size: 12px;
  color: var(--subtext);
}
.manager-bottom {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 10px;
}
.manager-stats {
  display: flex;
  gap: 14px;
  font-size: 13px;
  color: var(--subtext);
}
.manager-actions {
  display: flex;
  gap: 8px;
}
.comment-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}
.comment-row .comment-content {
  flex: 1;
}
.pagination {
  margin-top: 20px;
  text-align: center;
}
@media (max-width: 1024px) {
  .profile-grid {
    grid-template-columns: 1fr;
  }
}
@media (max-width: 768px) {
  .profile-hero {
    padding: 16px;
  }
  .hero-user h2 {
    font-size: 20px;
  }
  .hero-stats div {
    padding: 12px;
  }
  .manager-card {
    padding: 16px;
  }
  .manager-bottom {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
  .comment-row {
    flex-direction: column;
    gap: 8px;
  }
  .comment-row .el-button {
    align-self: flex-end;
  }
}
</style>

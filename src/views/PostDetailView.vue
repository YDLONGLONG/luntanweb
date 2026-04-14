<template>
  <div class="detail-page card-panel" v-loading="loading">
    <template v-if="post.id">
      <div class="author-row">
        <div class="post-author">
          <el-avatar :size="54" :src="post.author.avatar">{{ post.author.nickname && post.author.nickname[0] }}</el-avatar>
          <div>
            <h2>{{ post.title }}</h2>
            <p>{{ post.author.nickname }} · {{ formatTime(post.createdAt) }}</p>
          </div>
        </div>
        <div class="author-actions">
          <el-button
            v-if="isLogin && post.author.id !== user.id"
            :type="post.followed ? 'default' : 'primary'"
            plain
            @click="handleFollow(post.author.id)"
          >
            {{ post.followed ? '取消关注' : '关注作者' }}
          </el-button>
          <template v-if="isLogin && post.canManage">
            <el-button plain @click="$router.push(`/publish/${post.id}`)">编辑帖子</el-button>
            <el-button type="danger" plain @click="handleDeletePost">删除帖子</el-button>
          </template>
        </div>
      </div>
      <div class="post-body">{{ post.content }}</div>
      <div class="image-grid" v-if="post.images && post.images.length">
        <img v-for="image in post.images" :key="image" :src="imageSrc(image)" alt="post image" @error="handleImageError">
      </div>
      <div class="action-row">
        <el-button :type="post.liked ? 'primary' : 'default'" icon="el-icon-thumb" @click="handleLike">{{ post.likeCount }}</el-button>
        <el-button :type="post.favorited ? 'warning' : 'default'" icon="el-icon-star-off" @click="handleFavorite">{{ post.favoriteCount }}</el-button>
      </div>
      <div class="comment-box">
        <div class="section-title"><h3>评论 {{ comments.length }}</h3></div>
        <div v-if="replyTarget" class="reply-tip">
          正在回复 <strong>@{{ replyTarget.user.nickname }}</strong>
          <div class="reply-origin">原评论：{{ replyTarget.content }}</div>
          <el-button type="text" @click="clearReply">取消</el-button>
        </div>
        <el-input v-if="isLogin" v-model="commentText" type="textarea" :rows="3" :placeholder="replyTarget ? '写下你的回复...' : '写下你的评论...'" />
        <el-button v-if="isLogin" type="primary" round class="comment-btn" @click="submitComment">{{ replyTarget ? '发送回复' : '发布评论' }}</el-button>
        <div v-for="item in comments" :key="item.id" class="comment-item" :class="{ reply: !!item.parentId }">
          <el-avatar :src="item.user.avatar">{{ item.user.nickname && item.user.nickname[0] }}</el-avatar>
          <div class="comment-main">
            <strong>{{ item.user.nickname }}</strong>
            <div v-if="item.parentId && item.parentContent" class="reply-reference">
              回复给 @{{ item.replyToNickname || item.parentNickname }}：{{ item.parentContent }}
            </div>
            <p>
              <template v-if="item.replyToNickname">回复 @{{ item.replyToNickname }}：</template>
              {{ item.content }}
            </p>
            <div class="comment-foot">
              <span>{{ formatTime(item.createdAt) }}</span>
              <div class="comment-actions">
                <el-button type="text" @click="startReply(item)">回复</el-button>
                <el-button v-if="item.canDelete" type="text" @click="handleDeleteComment(item)">删除</el-button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script>
import { createComment, deleteComment, deletePost, getPostDetail, toggleFavorite, toggleFollow, toggleLike } from '../api';
import { mapState } from 'vuex';

const fileBaseURL = process.env.VUE_APP_FILE_BASE_URL || 'http://localhost:3000';

export default {
  name: 'PostDetailView',
  data() {
    return {
      loading: false,
      post: {},
      comments: [],
      commentText: '',
      replyTarget: null,
      baseURL: fileBaseURL,
      placeholderImage: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100" preserveAspectRatio="none"%3E%3Crect fill="%23f0f2f5" width="100" height="100"/%3E%3Ctext fill="%23999" font-family="Arial" font-size="10" x="50%25" y="50%25" text-anchor="middle" dy=".3em"%3E图片加载失败%3C/text%3E%3C/svg%3E'
    };
  },
  computed: {
    ...mapState(['user']),
    isLogin() {
      return !!this.user;
    }
  },
  created() {
    this.fetchDetail();
  },
  methods: {
    imageSrc(image) {
      return /^https?:\/\//.test(image) ? image : `${this.baseURL}${image}`;
    },
    handleImageError(event) {
      event.target.src = this.placeholderImage;
      event.target.onerror = null;
    },
    formatTime(value) {
      return String(value).replace('T', ' ').slice(0, 16);
    },
    async fetchDetail() {
      this.loading = true;
      try {
        const { data } = await getPostDetail(this.$route.params.id, {
          currentUserId: this.user ? this.user.id : ''
        });
        this.post = data.post;
        this.comments = data.comments;
      } finally {
        this.loading = false;
      }
    },
    startReply(item) {
      if (!this.isLogin) return this.$router.push('/auth');
      this.replyTarget = item;
      this.commentText = '';
    },
    clearReply() {
      this.replyTarget = null;
      this.commentText = '';
    },
    async handleLike() {
      if (!this.isLogin) return this.$router.push('/auth');
      await toggleLike(this.post.id);
      await this.fetchDetail();
    },
    async handleFavorite() {
      if (!this.isLogin) return this.$router.push('/auth');
      await toggleFavorite(this.post.id);
      await this.fetchDetail();
    },
    async submitComment() {
      await createComment(this.post.id, {
        content: this.commentText,
        parentId: this.replyTarget ? this.replyTarget.id : null,
        replyToUserId: this.replyTarget ? this.replyTarget.user.id : null
      });
      this.clearReply();
      await this.fetchDetail();
      await this.$store.dispatch('refreshProfile');
    },
    async handleDeleteComment(item) {
      await deleteComment(this.post.id, item.id);
      this.$message.success('评论已删除');
      this.clearReply();
      await this.fetchDetail();
      await this.$store.dispatch('refreshProfile');
    },
    async handleDeletePost() {
      await deletePost(this.post.id);
      this.$message.success('帖子已删除');
      await this.$store.dispatch('refreshProfile');
      this.$router.push('/profile');
    },
    async handleFollow(id) {
      const { data } = await toggleFollow(id);
      this.$message.success(data.message || '操作成功');
      await this.$store.dispatch('refreshProfile');
      await this.fetchDetail();
    }
  }
};
</script>

<style scoped>
.detail-page {
  padding: 24px;
}
.author-row, .post-author, .author-actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}
.post-author h2 {
  margin: 0 0 6px;
  font-size: 30px;
}
.post-author p, .comment-item span {
  margin: 0;
  color: var(--subtext);
}
.post-body {
  margin: 24px 0;
  font-size: 16px;
  line-height: 1.9;
}
.image-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}
.image-grid img {
  width: 100%;
  height: 200px;
  object-fit: cover;
  border-radius: 16px;
  background-color: #f0f2f5;
}
.action-row {
  margin: 22px 0;
  display: flex;
  gap: 12px;
}
.reply-tip {
  margin-bottom: 10px;
  padding: 10px 14px;
  border-radius: 12px;
  background: #f5f9ff;
  color: var(--subtext);
}
.reply-origin,
.reply-reference {
  margin-top: 8px;
  padding: 8px 10px;
  border-left: 3px solid #9cc3ff;
  background: #eef5ff;
  border-radius: 8px;
  color: #5b6472;
  line-height: 1.7;
}
.comment-btn {
  margin: 12px 0 18px;
}
.comment-item {
  display: flex;
  gap: 12px;
  padding: 16px 0;
  border-top: 1px solid var(--line);
}
.comment-item.reply {
  margin-left: 42px;
}
.comment-main {
  flex: 1;
}
.comment-item p {
  margin: 10px 0 6px;
  line-height: 1.7;
}
.comment-foot {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.comment-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}
@media (max-width: 768px) {
  .image-grid {
    grid-template-columns: 1fr;
  }
  .post-author h2 {
    font-size: 22px;
  }
  .author-row,
  .author-actions {
    flex-direction: column;
    align-items: flex-start;
  }
  .comment-item.reply {
    margin-left: 20px;
  }
}
</style>

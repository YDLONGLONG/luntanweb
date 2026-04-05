<template>
  <div class="post-card card-panel" @click="$router.push(`/post/${post.id}`)">
    <div class="post-author">
      <el-avatar :src="post.author.avatar">{{ post.author.nickname && post.author.nickname[0] }}</el-avatar>
      <div>
        <strong>{{ post.author.nickname }}</strong>
        <p>{{ post.author.bio || '分享真实、专业、有用的见解' }}</p>
      </div>
      <span class="post-time">{{ formatTime(post.createdAt) }}</span>
    </div>
    <h3>{{ post.title }}</h3>
    <p class="post-content">{{ post.content }}</p>
    <div v-if="post.images && post.images.length" class="image-grid">
      <img v-for="image in post.images.slice(0, 3)" :key="image" :src="imageSrc(image)" alt="cover">
    </div>
    <div class="post-actions" @click.stop>
      <span><i class="el-icon-thumb"></i>{{ post.likeCount }} 点赞</span>
      <span><i class="el-icon-star-off"></i>{{ post.favoriteCount }} 收藏</span>
      <span><i class="el-icon-chat-dot-round"></i>{{ post.commentCount }} 评论</span>
    </div>
  </div>
</template>

<script>
const fileBaseURL = process.env.VUE_APP_FILE_BASE_URL || 'http://localhost:3000';

export default {
  name: 'PostCard',
  props: {
    post: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      baseURL: fileBaseURL
    };
  },
  methods: {
    formatTime(value) {
      return String(value).replace('T', ' ').slice(0, 16);
    },
    imageSrc(image) {
      return /^https?:\/\//.test(image) ? image : `${this.baseURL}${image}`;
    }
  }
};
</script>

<style scoped>
.post-card {
  padding: 20px 22px;
  margin-bottom: 16px;
  cursor: pointer;
  transition: transform .2s ease, box-shadow .2s ease;
}
.post-card:hover {
  transform: translateY(-2px);
}
.post-author {
  display: flex;
  align-items: center;
  gap: 12px;
}
.post-author p {
  margin: 4px 0 0;
  color: var(--subtext);
  font-size: 13px;
}
.post-time {
  margin-left: auto;
  color: var(--subtext);
  font-size: 12px;
}
h3 {
  margin: 18px 0 10px;
  font-size: 22px;
}
.post-content {
  margin: 0;
  line-height: 1.8;
  color: #384250;
}
.image-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
  margin-top: 16px;
}
.image-grid img {
  width: 100%;
  height: 138px;
  object-fit: cover;
  border-radius: 14px;
}
.post-actions {
  display: flex;
  gap: 18px;
  margin-top: 16px;
  color: var(--subtext);
}
.post-actions span {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}
@media (max-width: 768px) {
  .image-grid {
    grid-template-columns: 1fr;
  }
  .image-grid img {
    height: 180px;
  }
  h3 {
    font-size: 18px;
  }
}
</style>

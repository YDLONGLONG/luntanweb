<template>
  <div class="follow-page">
    <div class="follow-grid">
      <div class="card-panel list-card">
        <div class="section-title"><h3>我的关注</h3></div>
        <div v-for="item in following" :key="`follow-${item.id}`" class="person-item">
          <div class="person-meta">
            <el-avatar :src="item.avatar">{{ item.nickname && item.nickname[0] }}</el-avatar>
            <div>
              <strong>{{ item.nickname }}</strong>
              <p>{{ item.bio }}</p>
            </div>
          </div>
          <el-button size="mini" @click="openChat(item)">私聊</el-button>
        </div>
      </div>
      <div class="card-panel list-card">
        <div class="section-title"><h3>我的粉丝</h3></div>
        <div v-for="item in fans" :key="`fan-${item.id}`" class="person-item">
          <div class="person-meta">
            <el-avatar :src="item.avatar">{{ item.nickname && item.nickname[0] }}</el-avatar>
            <div>
              <strong>{{ item.nickname }}</strong>
              <p>{{ item.bio }}</p>
            </div>
          </div>
          <el-button size="mini" @click="openChat(item)">私聊</el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { getFans, getFollowing } from '../api';

export default {
  name: 'FollowView',
  data() {
    return {
      following: [],
      fans: []
    };
  },
  async created() {
    const [followingRes, fansRes] = await Promise.all([getFollowing(), getFans()]);
    this.following = followingRes.data;
    this.fans = fansRes.data;
  },
  methods: {
    openChat(item) {
      this.$router.push({ path: '/messages', query: { userId: item.id, nickname: item.nickname } });
    }
  }
};
</script>

<style scoped>
.follow-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 18px;
}
.list-card {
  padding: 22px;
}
.person-item, .person-meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}
.person-item {
  padding: 14px 0;
  border-top: 1px solid var(--line);
}
.person-item:first-of-type {
  border-top: none;
}
.person-meta p {
  margin: 4px 0 0;
  color: var(--subtext);
}
@media (max-width: 768px) {
  .follow-grid {
    grid-template-columns: 1fr;
  }
}
</style>

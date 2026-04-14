<template>
  <div class="follow-page">
    <div class="follow-grid">
      <div class="card-panel list-card">
        <div class="section-title"><h3>我的关注</h3></div>
        <el-empty v-if="!following.list.length" description="还没有关注任何人" />
        <div v-for="item in following.list" :key="`follow-${item.id}`" class="person-item">
          <div class="person-meta">
            <el-avatar :src="item.avatar">{{ item.nickname && item.nickname[0] }}</el-avatar>
            <div>
              <strong>{{ item.nickname }}</strong>
              <p>{{ item.bio }}</p>
            </div>
          </div>
          <el-button size="mini" @click="openChat(item)">私聊</el-button>
        </div>
        <el-pagination
          v-if="following.total > following.limit"
          class="pagination"
          background
          layout="prev, pager, next"
          :current-page="following.page"
          :page-size="following.limit"
          :total="following.total"
          @current-change="handleFollowingPageChange"
        />
      </div>
      <div class="card-panel list-card">
        <div class="section-title"><h3>我的粉丝</h3></div>
        <el-empty v-if="!fans.list.length" description="还没有粉丝" />
        <div v-for="item in fans.list" :key="`fan-${item.id}`" class="person-item">
          <div class="person-meta">
            <el-avatar :src="item.avatar">{{ item.nickname && item.nickname[0] }}</el-avatar>
            <div>
              <strong>{{ item.nickname }}</strong>
              <p>{{ item.bio }}</p>
            </div>
          </div>
          <el-button size="mini" @click="openChat(item)">私聊</el-button>
        </div>
        <el-pagination
          v-if="fans.total > fans.limit"
          class="pagination"
          background
          layout="prev, pager, next"
          :current-page="fans.page"
          :page-size="fans.limit"
          :total="fans.total"
          @current-change="handleFansPageChange"
        />
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
      following: {
        list: [],
        total: 0,
        page: 1,
        limit: 5
      },
      fans: {
        list: [],
        total: 0,
        page: 1,
        limit: 5
      }
    };
  },
  created() {
    this.fetchFollowing();
    this.fetchFans();
  },
  methods: {
    async fetchFollowing() {
      try {
        const { data } = await getFollowing({
          page: this.following.page,
          limit: this.following.limit
        });
        this.following = data;
      } catch (error) {
        this.$message.error('获取关注列表失败');
      }
    },
    async fetchFans() {
      try {
        const { data } = await getFans({
          page: this.fans.page,
          limit: this.fans.limit
        });
        this.fans = data;
      } catch (error) {
        this.$message.error('获取粉丝列表失败');
      }
    },
    handleFollowingPageChange(page) {
      this.following.page = page;
      this.fetchFollowing();
    },
    handleFansPageChange(page) {
      this.fans.page = page;
      this.fetchFans();
    },
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
.pagination {
  margin-top: 20px;
  text-align: center;
}
@media (max-width: 768px) {
  .follow-grid {
    grid-template-columns: 1fr;
  }
}
</style>

<template>
  <div class="home-view">
    <post-card v-for="post in posts" :key="post.id" :post="post" />
    <div v-if="loading" class="loading-more">
      <i class="el-icon-loading"></i> 加载中...
    </div>
    <div v-if="!loading && !hasMore && posts.length > 0" class="no-more">
      没有更多了
    </div>
    <el-empty v-if="!loading && !posts.length" description="还没有内容，发布第一篇帖子吧" />
    
    <transition name="fade">
      <el-button
        v-show="showBackTop"
        class="back-top-btn"
        type="primary"
        circle
        icon="el-icon-top"
        @click="scrollToTop"
      />
    </transition>
  </div>
</template>

<script>
import { getPosts } from '../api';
import { mapState } from 'vuex';
import PostCard from '../components/PostCard.vue';

export default {
  name: 'HomeView',
  components: { PostCard },
  data() {
    return {
      loading: false,
      posts: [],
      page: 1,
      limit: 10,
      hasMore: true,
      showBackTop: false
    };
  },
  computed: {
    ...mapState(['user'])
  },
  created() {
    this.fetchPosts();
    this.bindScroll();
  },
  beforeDestroy() {
    this.unbindScroll();
  },
  methods: {
    bindScroll() {
      window.addEventListener('scroll', this.handleScroll);
    },
    unbindScroll() {
      window.removeEventListener('scroll', this.handleScroll);
    },
    handleScroll() {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      
      // 控制回到顶部按钮显示
      this.showBackTop = scrollTop > 300;
      
      // 加载更多
      if (this.loading || !this.hasMore) return;
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      
      if (scrollTop + windowHeight >= documentHeight - 100) {
        this.loadMore();
      }
    },
    scrollToTop() {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    },
    async fetchPosts(reset = false) {
      if (reset) {
        this.page = 1;
        this.posts = [];
        this.hasMore = true;
      }
      
      this.loading = true;
      try {
        const { data } = await getPosts({
          keyword: this.$route.query.keyword || '',
          currentUserId: this.user ? this.user.id : '',
          page: this.page,
          limit: this.limit
        });
        
        if (reset) {
          this.posts = data.list;
        } else {
          this.posts = [...this.posts, ...data.list];
        }
        
        this.hasMore = data.hasMore;
        this.page = data.page + 1;
      } finally {
        this.loading = false;
      }
    },
    loadMore() {
      if (!this.hasMore || this.loading) return;
      this.fetchPosts();
    }
  },
  watch: {
    '$route.query.keyword'() {
      this.fetchPosts(true);
    }
  }
};
</script>

<style scoped>
.home-view {
  min-height: 100vh;
}
.loading-more,
.no-more {
  text-align: center;
  padding: 20px;
  color: var(--subtext);
  font-size: 14px;
}
.back-top-btn {
  position: fixed;
  right: 24px;
  bottom: 24px;
  z-index: 100;
  width: 48px;
  height: 48px;
  font-size: 20px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s;
}
.fade-enter,
.fade-leave-to {
  opacity: 0;
}
@media (max-width: 768px) {
  .back-top-btn {
    right: 16px;
    bottom: 16px;
    width: 40px;
    height: 40px;
    font-size: 16px;
  }
}
</style>

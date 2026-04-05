<template>
  <div>
    <div class="section-title">
      <h3>推荐讨论</h3>
      <el-input
        v-model="localKeyword"
        placeholder="搜索你关心的话题"
        prefix-icon="el-icon-search"
        class="mobile-search"
        @keyup.enter.native="search"
      />
    </div>
    <post-card v-for="post in posts" :key="post.id" :post="post" />
    <el-empty v-if="!loading && !posts.length" description="还没有内容，发布第一篇帖子吧" />
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
      localKeyword: ''
    };
  },
  computed: {
    ...mapState(['user'])
  },
  methods: {
    async fetchPosts() {
      this.loading = true;
      try {
        const { data } = await getPosts({
          keyword: this.$route.query.keyword || '',
          currentUserId: this.user ? this.user.id : ''
        });
        this.posts = data;
      } finally {
        this.loading = false;
      }
    },
    search() {
      this.$router.replace({ query: { keyword: this.localKeyword } });
    }
  },
  watch: {
    '$route.query.keyword': {
      immediate: true,
      handler(value) {
        this.localKeyword = value || '';
        this.fetchPosts();
      }
    }
  }
};
</script>

<style scoped>
.mobile-search {
  display: none;
}
@media (max-width: 768px) {
  .mobile-search {
    display: block;
    width: 180px;
  }
}
</style>

<template>
  <div class="publish-page card-panel" v-loading="loading">
    <div class="section-title">
      <h3>{{ isEdit ? '编辑帖子' : '发布新帖子' }}</h3>
      <span>{{ isEdit ? '修改你的内容表达' : '分享见解、经验或问题' }}</span>
    </div>
    <el-form label-position="top" @submit.native.prevent>
      <el-form-item label="标题">
        <el-input v-model="form.title" maxlength="120" placeholder="用一句话概括你的问题或观点" />
      </el-form-item>
      <el-form-item label="内容">
        <el-input v-model="form.content" type="textarea" :rows="10" placeholder="补充背景、细节、观点与证据，让讨论更有价值" />
      </el-form-item>
      <el-form-item label="配图">
        <div v-if="existingImages.length" class="existing-grid">
          <div v-for="(image, index) in existingImages" :key="image + index" class="existing-item">
            <img :src="imageSrc(image)" alt="existing image">
            <el-button size="mini" type="danger" circle icon="el-icon-delete" class="delete-btn" @click.prevent="removeExisting(index)" />
          </div>
        </div>
        <el-upload
          action="#"
          :auto-upload="false"
          list-type="picture-card"
          :file-list="uploadList"
          :on-change="handleFileChange"
          :on-remove="handleRemove"
          :limit="9"
        >
          <i class="el-icon-plus"></i>
        </el-upload>
      </el-form-item>
      <el-button type="primary" round @click="submitPost">{{ isEdit ? '保存修改' : '立即发布' }}</el-button>
    </el-form>
  </div>
</template>

<script>
import request from '../api/request';
import { getPostDetail, updatePost } from '../api';

const fileBaseURL = process.env.VUE_APP_FILE_BASE_URL || 'http://localhost:3000';

export default {
  name: 'PublishView',
  data() {
    return {
      files: [],
      uploadList: [],
      existingImages: [],
      loading: false,
      baseURL: fileBaseURL,
      form: {
        title: '',
        content: ''
      }
    };
  },
  computed: {
    isEdit() {
      return !!this.$route.params.id;
    }
  },
  created() {
    if (this.isEdit) {
      this.fetchPost();
    }
  },
  methods: {
    imageSrc(image) {
      return /^https?:\/\//.test(image) ? image : `${this.baseURL}${image}`;
    },
    handleFileChange(file, fileList) {
      this.uploadList = fileList;
      this.files = fileList.map((item) => item.raw).filter(Boolean);
    },
    handleRemove(file, fileList) {
      this.uploadList = fileList;
      this.files = fileList.map((item) => item.raw).filter(Boolean);
    },
    removeExisting(index) {
      this.existingImages.splice(index, 1);
    },
    async fetchPost() {
      this.loading = true;
      try {
        const { data } = await getPostDetail(this.$route.params.id, {
          currentUserId: this.$store.state.user ? this.$store.state.user.id : ''
        });
        this.form.title = data.post.title;
        this.form.content = data.post.content;
        this.existingImages = data.post.images || [];
      } finally {
        this.loading = false;
      }
    },
    async submitPost() {
      if (this.isEdit) {
        const data = new FormData();
        data.append('title', this.form.title);
        data.append('content', this.form.content);
        data.append('existingImages', JSON.stringify(this.existingImages));
        this.files.forEach((file) => data.append('images', file));
        await updatePost(this.$route.params.id, data);
        await this.$store.dispatch('refreshProfile');
        this.$message.success('帖子已更新');
        this.$router.push(`/post/${this.$route.params.id}`);
        return;
      }

      const data = new FormData();
      data.append('title', this.form.title);
      data.append('content', this.form.content);
      this.files.forEach((file) => data.append('images', file));
      await request.post('/posts', data);
      await this.$store.dispatch('refreshProfile');
      this.$message.success('发布成功');
      this.$router.push('/');
    }
  }
};
</script>

<style scoped>
.publish-page {
  padding: 24px;
}
.existing-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 12px;
  margin-bottom: 16px;
}
.existing-item {
  position: relative;
  border-radius: 12px;
  overflow: hidden;
}
.existing-item img {
  width: 100%;
  height: 120px;
  object-fit: cover;
  display: block;
}
.delete-btn {
  position: absolute;
  top: 8px;
  right: 8px;
}
</style>

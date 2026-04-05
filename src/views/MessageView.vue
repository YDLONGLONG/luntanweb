<template>
  <div class="message-page">
    <div class="message-grid">
      <div class="card-panel conversation-card">
        <div class="section-title"><h3>私聊列表</h3></div>
        <div
          v-for="item in conversations"
          :key="item.partnerId"
          class="conversation-item"
          :class="{ active: activeUserId === item.partnerId }"
          @click="selectConversation(item)"
        >
          <div>
            <strong>{{ item.nickname }}</strong>
            <p>{{ item.latestContent }}</p>
          </div>
          <el-badge :value="getUnreadCount(item)" :hidden="getUnreadCount(item) <= 0" />
        </div>
        <div class="section-title group-title"><h3>论坛群聊</h3></div>
        <el-button round @click="loadGroup">进入群聊</el-button>
      </div>

      <div class="card-panel chat-card">
        <div class="chat-header">
          <h3>{{ isGroup ? '论坛群聊' : (activeNickname || '选择一个会话') }}</h3>
        </div>
        <div class="chat-body">
          <div v-for="item in messages" :key="item.id + '-' + item.created_at" class="chat-item" :class="{ mine: item.sender_id === user.id || item.user_id === user.id }">
            <div class="bubble">
              <strong>{{ item.nickname }}</strong>
              <p>{{ item.content }}</p>
            </div>
          </div>
        </div>
        <div class="chat-input">
          <el-input v-model="content" type="textarea" :rows="3" placeholder="输入消息，按按钮发送" />
          <el-button type="primary" round @click="sendMessage">发送</el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import io from 'socket.io-client';
import { getConversations, getGroupHistory, getPrivateHistory, sendGroup, sendPrivate } from '../api';
import { mapState } from 'vuex';

const socketURL = process.env.VUE_APP_SOCKET_URL || 'http://localhost:3000';

export default {
  name: 'MessageView',
  data() {
    return {
      socket: null,
      conversations: [],
      activeUserId: null,
      activeNickname: '',
      messages: [],
      content: '',
      isGroup: false
    };
  },
  computed: {
    ...mapState(['user', 'unreadMap'])
  },
  async created() {
    await this.$store.dispatch('initUnread');
    await this.loadConversations();
    this.initSocket();
    if (this.$route.query.userId) {
      this.selectConversation({ partnerId: Number(this.$route.query.userId), nickname: this.$route.query.nickname || '私聊对象' });
    }
  },
  beforeDestroy() {
    if (this.socket) {
      this.socket.disconnect();
    }
  },
  methods: {
    getUnreadCount(item) {
      const fromStore = this.unreadMap[String(item.partnerId)];
      if (fromStore !== undefined) {
        return Number(fromStore || 0);
      }
      return Number(item.unreadCount || 0);
    },
    async loadConversations() {
      const { data } = await getConversations();
      this.conversations = data.map((item) => ({
        ...item,
        unreadCount: Number(item.unreadCount || 0)
      }));
    },
    initSocket() {
      this.socket = io(socketURL);
      this.socket.emit('login', this.user.id);
      this.socket.on('private-message', (payload) => {
        if (!this.isGroup && Number(payload.senderId) === this.activeUserId) {
          this.messages.push({
            id: Date.now(),
            sender_id: payload.senderId,
            nickname: payload.senderNickname,
            content: payload.content
          });
        }
      });
      this.socket.on('private-unread', ({ senderId }) => {
        if (Number(senderId) !== this.activeUserId) {
          this.$store.commit('increaseUnread', senderId);
        }
      });
      this.socket.on('group-message', (payload) => {
        if (this.isGroup) {
          this.messages.push({
            id: Date.now(),
            user_id: payload.userId,
            nickname: payload.nickname,
            content: payload.content
          });
        }
      });
    },
    async selectConversation(item) {
      this.isGroup = false;
      this.activeUserId = Number(item.partnerId);
      this.activeNickname = item.nickname;
      const { data } = await getPrivateHistory(this.activeUserId);
      this.messages = data;
      this.$store.commit('clearUnread', this.activeUserId);
      await this.loadConversations();
    },
    async loadGroup() {
      this.isGroup = true;
      this.activeUserId = null;
      this.activeNickname = '论坛群聊';
      const { data } = await getGroupHistory();
      this.messages = data;
    },
    async sendMessage() {
      if (!this.content) return;
      if (this.isGroup) {
        await sendGroup({ content: this.content });
        this.socket.emit('group-message', { userId: this.user.id, nickname: this.user.nickname, content: this.content });
        await this.loadGroup();
      } else if (this.activeUserId) {
        await sendPrivate(this.activeUserId, { content: this.content });
        this.socket.emit('private-message', {
          senderId: this.user.id,
          senderNickname: this.user.nickname,
          receiverId: this.activeUserId,
          content: this.content
        });
        await this.selectConversation({ partnerId: this.activeUserId, nickname: this.activeNickname });
      }
      this.content = '';
    }
  }
};
</script>

<style scoped>
.message-grid {
  display: grid;
  grid-template-columns: 320px 1fr;
  gap: 18px;
}
.conversation-card, .chat-card {
  padding: 20px;
}
.conversation-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 14px 0;
  border-top: 1px solid var(--line);
  cursor: pointer;
}
.conversation-item.active {
  color: var(--primary);
}
.conversation-item p {
  margin: 6px 0 0;
  color: var(--subtext);
  font-size: 12px;
}
.group-title {
  margin-top: 18px;
}
.chat-body {
  min-height: 480px;
  max-height: 480px;
  overflow-y: auto;
  padding: 12px 0;
}
.chat-item {
  display: flex;
  margin-bottom: 12px;
}
.chat-item.mine {
  justify-content: flex-end;
}
.bubble {
  max-width: 72%;
  padding: 12px 14px;
  border-radius: 16px;
  background: #f4f7fb;
}
.chat-item.mine .bubble {
  background: #e8f1ff;
}
.bubble strong {
  display: block;
  margin-bottom: 6px;
}
.bubble p {
  margin: 0;
  line-height: 1.7;
}
.chat-input {
  display: grid;
  grid-template-columns: 1fr 120px;
  gap: 12px;
}
@media (max-width: 768px) {
  .message-grid {
    grid-template-columns: 1fr;
  }
  .chat-input {
    grid-template-columns: 1fr;
  }
}
</style>

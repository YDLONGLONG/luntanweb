import Vue from 'vue';
import Vuex from 'vuex';
import { getConversations, getProfile, logout } from '../api';

Vue.use(Vuex);

const savedToken = localStorage.getItem('forum-token') || '';
const savedUser = localStorage.getItem('forum-user');
const savedStats = localStorage.getItem('forum-stats');
const savedUnreadMap = localStorage.getItem('forum-unread-map');

const parseLocalStorage = (value) => {
  if (!value || value === 'undefined' || value === 'null') return null;
  try {
    return JSON.parse(value);
  } catch (error) {
    console.error('Failed to parse localStorage value:', error);
    return null;
  }
};

export default new Vuex.Store({
  state: {
    token: savedToken,
    user: parseLocalStorage(savedUser),
    stats: parseLocalStorage(savedStats) || { follows: 0, fans: 0, posts: 0 },
    unreadMap: parseLocalStorage(savedUnreadMap) || {}
  },
  mutations: {
    setAuth(state, payload) {
      state.token = payload.token;
      state.user = payload.user;
      state.stats = payload.stats || state.stats;
      localStorage.setItem('forum-token', payload.token);
      localStorage.setItem('forum-user', JSON.stringify(payload.user));
      localStorage.setItem('forum-stats', JSON.stringify(state.stats));
    },
    clearAuth(state) {
      state.token = '';
      state.user = null;
      state.stats = { follows: 0, fans: 0, posts: 0 };
      state.unreadMap = {};
      localStorage.removeItem('forum-token');
      localStorage.removeItem('forum-user');
      localStorage.removeItem('forum-stats');
      localStorage.removeItem('forum-unread-map');
    },
    setProfile(state, payload) {
      Vue.set(state, 'user', payload.user);
      Vue.set(state, 'stats', payload.stats || state.stats);
      localStorage.setItem('forum-user', JSON.stringify(payload.user));
      localStorage.setItem('forum-stats', JSON.stringify(state.stats));
    },
    setUnreadMap(state, unreadMap) {
      state.unreadMap = unreadMap;
      localStorage.setItem('forum-unread-map', JSON.stringify(unreadMap));
    },
    increaseUnread(state, userId) {
      const key = String(userId);
      Vue.set(state.unreadMap, key, (state.unreadMap[key] || 0) + 1);
      localStorage.setItem('forum-unread-map', JSON.stringify(state.unreadMap));
    },
    clearUnread(state, userId) {
      Vue.set(state.unreadMap, String(userId), 0);
      localStorage.setItem('forum-unread-map', JSON.stringify(state.unreadMap));
    }
  },
  actions: {
    async refreshProfile({ commit, state }) {
      if (!state.token) return;
      const { data } = await getProfile();
      commit('setProfile', data);
    },
    async initUserSession({ dispatch, state }) {
      if (!state.token) return;
      await dispatch('refreshProfile');
      await dispatch('initUnread');
    },
    async initUnread({ commit, state }) {
      if (!state.token) return;
      const { data } = await getConversations();
      const unreadMap = {};
      data.forEach((item) => {
        unreadMap[String(item.partnerId)] = Number(item.unreadCount || 0);
      });
      commit('setUnreadMap', unreadMap);
    },
    async logout({ commit, state }) {
      if (state.token) {
        try {
          await logout();
        } catch (error) {
          // ignore
        }
      }
      commit('clearAuth');
    }
  }
});

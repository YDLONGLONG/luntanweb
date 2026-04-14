import Vue from 'vue';
import Router from 'vue-router';
import store from '../store';
import HomeView from '../views/HomeView.vue';
import PostDetailView from '../views/PostDetailView.vue';
import AuthView from '../views/AuthView.vue';
import PublishView from '../views/PublishView.vue';
import FollowView from '../views/FollowView.vue';
import MessageView from '../views/MessageView.vue';
import ProfileView from '../views/ProfileView.vue';
import SettingsView from '../views/SettingsView.vue';
import ForgotPasswordView from '../views/ForgotPasswordView.vue';

Vue.use(Router);

const router = new Router({
  mode: 'hash',
  routes: [
    { path: '/', name: 'home', component: HomeView },
    { path: '/auth', name: 'auth', component: AuthView },
    { path: '/post/:id', name: 'post-detail', component: PostDetailView },
    { path: '/publish', name: 'publish', component: PublishView, meta: { auth: true } },
    { path: '/publish/:id', name: 'publish-edit', component: PublishView, meta: { auth: true } },
    { path: '/follow', name: 'follow', component: FollowView, meta: { auth: true } },
    { path: '/messages', name: 'messages', component: MessageView, meta: { auth: true } },
    { path: '/profile', name: 'profile', component: ProfileView, meta: { auth: true } },
    { path: '/settings', name: 'settings', component: SettingsView, meta: { auth: true } },
    { path: '/forgot-password', name: 'forgot-password', component: ForgotPasswordView }
  ]
});

router.beforeEach((to, from, next) => {
  if (to.meta.auth && !store.state.token) {
    return next('/auth');
  }
  next();
});

export default router;

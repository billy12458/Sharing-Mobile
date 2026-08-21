import {
  createRouter,
  createWebHistory,
  type RouteRecordRaw,
} from "vue-router";
import i18n from "@/i18n";
import { tags, DEFAULT_TAG } from "@/constants/tags";

const routes: RouteRecordRaw[] = [
  {
    path: "/",
    name: "home",
    component: () => import("@/views/Home.vue"),
    meta: { title: "home" },
  },
  {
    path: "/files",
    name: "files",
    component: () => import("@/views/Files.vue"),
    meta: { title: "files", requiresAuth: true },
  },
  {
    path: "/files/:id",
    name: "file-detail",
    component: () => import("@/views/FileDetail.vue"),
    props: true,
    meta: { title: "files" },
  },
  {
    path: "/search",
    name: "search",
    component: () => import("@/views/Search.vue"),
    meta: { title: "search" },
  },
  {
    path: "/profile",
    name: "profile",
    component: () => import("@/views/Profile.vue"),
    meta: { title: "profile" },
  },
  {
    path: "/login",
    name: "login",
    component: () => import("@/views/Login.vue"),
    meta: { title: "login" },
  },
  {
    path: "/register",
    name: "register",
    component: () => import("@/views/Register.vue"),
    meta: { title: "register" },
  },
  {
    path: "/extract",
    name: "extract",
    component: () => import("@/views/Extract.vue"),
    meta: { title: "extract" },
  },
  {
    path: "/ranking",
    name: "ranking",
    component: () => import("@/views/Ranking.vue"),
    meta: { title: "ranking" },
  },
  {
    path: "/Tags",
    name: "tags",
    redirect: "/Tags/其他",
  },
  {
    path: "/Tags/:tag",
    name: "tag-detail",
    component: () => import("@/views/Tags.vue"),
    props: true,
    meta: { title: "tags" },
  },
  {
    path: "/documents",
    name: "documents",
    component: () => import("@/views/PlaceholderPage.vue"),
    props: { pageKey: "documents" },
    meta: { title: "documents" },
  },
  {
    path: "/suggestions",
    name: "suggestions",
    component: () => import("@/views/PlaceholderPage.vue"),
    props: { pageKey: "suggestions" },
    meta: { title: "suggestions" },
  },
  {
    path: "/:pathMatch(.*)*",
    name: "not-found",
    component: () => import("@/views/PlaceholderPage.vue"),
    props: { pageKey: "home" },
  },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior: () => ({ top: 0 }),
});

router.beforeEach((to) => {
  if (to.name === "tag-detail") {
    const tag = String(to.params.tag);

    if (!tags.includes(tag as any)) {
      return {
        name: "tag-detail",
        params: {
          tag: DEFAULT_TAG,
        },
      };
    }
  }
});

router.afterEach((to) => {
  const key = String(to.meta.title || "home");

  if (to.name === "tag-detail" && to.params.tag) {
    document.title = i18n.global.t("app.pageTitle.tag", {
      tag: String(to.params.tag),
    });
    return;
  }

  document.title = i18n.global.t(`app.pageTitle.${key}`);
});

export default router;

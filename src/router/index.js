import { createRouter, createWebHistory } from "vue-router";
import { ElMessage } from "element-plus";

const routes = [
  {
    path: "/",
    redirect: "/user",
  },
  {
    path: "/login",
    name: "login",
    component: () => import("@/views/auth/login.vue"),
  },
  {
    path: "/register",
    name: "register",
    component: () => import("@/views/auth/register.vue"),
  },
  {
    path: "/user",
    component: () => import("@/views/user/user-layout.vue"),
    children: [
      {
        path: "",
        name: "user-home",
        component: () => import("@/views/home.vue"),
      },
      {
        path: "thuoc",
        name: "thuoc-list",
        component: () => import("@/views/user/thuoc-list.vue"),
      },
      {
        path: "thuoc/:maThuoc",
        name: "thuoc-detail",
        component: () => import("@/views/user/thuoc-detail.vue"),
      },
      {
        path: "cart",
        name: "cart",
        component: () => import("@/views/user/cart.vue"),
      },
      {
        path: "profile",
        name: "profile",
        component: () => import("@/views/user/profile.vue"),
      },
      {
        path: "complete-profile",
        name: "complete-profile",
        component: () => import("@/views/user/complete-profile.vue"),
      },
      {
        path: "orders",
        name: "orders",
        component: () => import("@/views/user/orders.vue"),
      },
    ],
  },
  {
    path: "/admin",
    name: "admin",
    meta: { requiresAdmin: true },
    component: () => import("@/views/admin/admin-layout.vue"),
    children: [
      {
        path: "",
        redirect: "/admin/thuoc",
      },
      {
        path: "thuoc",
        name: "admin-thuoc",
        component: () => import("@/views/admin/thuoc.vue"),
      },
      {
        path: "nhacungcap",
        name: "admin-nhacungcap",
        component: () => import("@/views/admin/nhacungcap.vue"),
      },
      {
        path: "phieunhap",
        name: "admin-phieunhap",
        component: () => import("@/views/admin/phieunhap.vue"),
      },
      {
        // allow maPN containing slashes (e.g. "PN0001/25-11") by matching the rest of the path
        path: "phieunhap/:maPN(.*)",
        name: "admin-phieunhap-detail",
        component: () => import("@/views/admin/phieunhap-detail.vue"),
      },
      {
        path: "phieunhap/them",
        name: "admin-them-phieunhap",
        component: () => import("@/views/admin/them-phieunhap.vue"),
      },
      {
        path: "hoadon",
        name: "admin-hoadon",
        component: () => import("@/views/admin/hoadon.vue"),
      },
      {
        path: "hoadon/them",
        name: "admin-them-hoadon",
        component: () => import("@/views/admin/them-hoadon.vue"),
      },
      {
        path: "kho",
        name: "admin-kho",
        component: () => import("@/views/admin/kho.vue"),
      },
      {
        path: "lieudung",
        name: "admin-lieudung",
        component: () => import("@/views/admin/lieudung.vue"),
      },
      {
        path: "loaidonvi",
        name: "admin-loaidonvi",
        component: () => import("@/views/admin/loaidonvi.vue"),
      },
      {
        path: "loaithuoc",
        name: "admin-loaithuoc",
        component: () => import("@/views/admin/loaithuoc.vue"),
      },
      {
        path: "nhomloai",
        name: "admin-nhomloai",
        component: () => import("@/views/admin/nhomloai.vue"),
      },
    ],
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) return savedPosition;
    return { left: 0, top: 0, behavior: "auto" };
  },
});

router.beforeEach((to, from, next) => {
  const userStr = localStorage.getItem("user");
  
  if (to.meta.requiresAdmin) {
    if (!userStr) {
      ElMessage.error("Vui lòng đăng nhập để tiếp tục!");
      next("/login");
      return;
    }
    
    const user = JSON.parse(userStr);
    const isAdmin = user.IsAdmin === true || user.MaNV || user.VaiTro === "Admin";
    
    if (!isAdmin) {
      ElMessage.error("Bạn không có quyền truy cập trang này!");
      next("/user");
      return;
    }
  }
  
  next();
});

export default router;

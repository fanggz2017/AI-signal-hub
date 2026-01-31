import axios from "axios";
import { toast } from "sonner";

const request = axios.create({
  baseURL: "/api",
  timeout: 10000,
});

// 防止循环刷新标记
let isRefreshing = false;
// 存储因 Token 过期而挂起的请求队列
let failedQueue: any[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });

  failedQueue = [];
};

request.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

request.interceptors.response.use(
  (response) => {
    return response.data;
  },
  async (error) => {
    const originalRequest = error.config;

    // 处理 401 未授权情况
    if (error.response?.status === 401 && !originalRequest._retry) {
      const isLoginRequest = originalRequest.url?.includes("/auth/login");
      const isRefreshRequest = originalRequest.url?.includes("/auth/refresh");

      // 如果是登录或刷新接口本身的 401，说明凭证完全无效，直接放弃
      if (isLoginRequest || isRefreshRequest) {
        if (!isLoginRequest) {
          localStorage.removeItem("token");
          localStorage.removeItem("refreshToken");
          if (!window.location.pathname.includes("/auth/login")) {
            window.location.href = "/auth/login";
          }
        }
        return Promise.reject(error);
      }

      // 如果正在刷新中，将当前请求加入队列等待
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers["Authorization"] = "Bearer " + token;
            return request(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshToken = localStorage.getItem("refreshToken");
        if (!refreshToken) {
            throw new Error("No refresh token");
        }
        
        // 使用独立的 axios 实例或直接 fetch，避免死循环拦截
        // 这里为了简单复用 baseURL，我们构建一个临时请求
        const response = await axios.post("/api/auth/refresh", {
            refreshToken
        });

        const { accessToken } = response.data.data; // 根据 ResultUtil 结构: { code, message, data: { accessToken } }

        localStorage.setItem("token", accessToken);
        
        request.defaults.headers.common["Authorization"] = "Bearer " + accessToken;
        originalRequest.headers["Authorization"] = "Bearer " + accessToken;

        processQueue(null, accessToken);
        
        // 重发原始请求
        return request(originalRequest);

      } catch (err) {
        processQueue(err, null);
        localStorage.removeItem("token");
        localStorage.removeItem("refreshToken");
        if (!window.location.pathname.includes("/auth/login")) {
             window.location.href = "/auth/login";
        }
        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }

    if (!error.config?.skipErrorHandler) {
      const msg = error.response?.data?.message || "请求失败";
      toast.error(msg);
    }
    return Promise.reject(error);
  },
);

export default request;

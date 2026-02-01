import axios, {
  type AxiosInstance,
  type AxiosRequestConfig,
  type AxiosError,
  type InternalAxiosRequestConfig,
  type AxiosResponse,
} from "axios";
import { toast } from "sonner";
import router from "@/router";

interface Result<T = any> {
  code: number;
  message: string;
  data: T;
}

interface CustomRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
  skipErrorHandler?: boolean;
}

const service: AxiosInstance = axios.create({
  baseURL: "/api",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// 防止循环刷新标记
let isRefreshing = false;

// 失败队列
interface FailedQueueItem {
  resolve: (value?: unknown) => void;
  reject: (reason?: any) => void;
}
let failedQueue: FailedQueueItem[] = [];

const processQueue = (error: Error | null, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// 辅助函数：统一登出逻辑
const handleLogout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("refreshToken");

  if (!window.location.pathname.includes("/login")) {
    toast.error("会话已过期，请重新登录");
    if (router && router.navigate) {
      router.navigate("/login");
    } else {
      window.location.href = "/login";
    }
  }
};

// --- 请求拦截器 ---
service.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem("token");
    if (token && config.headers) {
      config.headers.set("Authorization", `Bearer ${token}`);
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// --- 响应拦截器 ---
service.interceptors.response.use(
  (response: AxiosResponse) => {
    return response.data;
  },
  async (error: AxiosError<Result>) => {
    const originalRequest = error.config as CustomRequestConfig;

    if (!originalRequest) {
      return Promise.reject(error);
    }

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (
        originalRequest.url?.includes("/auth/login") ||
        originalRequest.url?.includes("/auth/refresh")
      ) {
        handleLogout();
        return Promise.reject(error);
      }

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            if (originalRequest.headers) {
              originalRequest.headers.set("Authorization", `Bearer ${token}`);
            }
            return service({ ...originalRequest });
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshToken = localStorage.getItem("refreshToken");
        if (!refreshToken) {
          throw new Error("No refresh token");
        }

        const { data } = await axios.post<Result<{ accessToken: string }>>(
          `${service.defaults.baseURL}/auth/refresh`,
          { refreshToken },
        );

        const newAccessToken = data.data.accessToken;

        localStorage.setItem("token", newAccessToken);

        processQueue(null, newAccessToken);
        if (originalRequest.headers) {
          originalRequest.headers.set(
            "Authorization",
            `Bearer ${newAccessToken}`,
          );
        }
        return service({ ...originalRequest });
      } catch (refreshErr) {
        processQueue(refreshErr as Error, null);
        handleLogout();
        return Promise.reject(refreshErr);
      } finally {
        isRefreshing = false;
      }
    }

    if (!originalRequest.skipErrorHandler) {
      const msg = error.response?.data?.message || error.message || "请求失败";
      toast.error(msg);
    }

    return Promise.reject(error);
  },
);

const request = <T = any>(config: AxiosRequestConfig): Promise<Result<T>> => {
  return service(config) as any;
};

request.get = <T = any>(
  url: string,
  config?: AxiosRequestConfig,
): Promise<Result<T>> => {
  return service.get(url, config) as any;
};
request.post = <T = any>(
  url: string,
  data?: any,
  config?: AxiosRequestConfig,
): Promise<Result<T>> => {
  return service.post(url, data, config) as any;
};
request.put = <T = any>(
  url: string,
  data?: any,
  config?: AxiosRequestConfig,
): Promise<Result<T>> => {
  return service.put(url, data, config) as any;
};
request.delete = <T = any>(
  url: string,
  config?: AxiosRequestConfig,
): Promise<Result<T>> => {
  return service.delete(url, config) as any;
};

export default request;

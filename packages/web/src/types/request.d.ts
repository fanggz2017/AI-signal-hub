export interface ApiOptions {
  /**
   * 是否静默失败（不触发全局错误弹窗）
   * @default false
   */
  isSilent?: boolean;
}

export interface ApiResponse<T = any> {
  code: number;
  message: string;
  data: T;
}

export interface ApiErrorResponse {
  message: string;
  code?: number;
  field?: "email" | "username" | "password" | "code";
}

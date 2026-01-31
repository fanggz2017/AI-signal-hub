import "axios";

declare module "axios" {
  export interface AxiosRequestConfig {
    skipErrorHandler?: boolean;
  }
}

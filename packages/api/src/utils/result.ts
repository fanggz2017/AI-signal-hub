// src/utils/result.ts
import { Context } from 'hono'
import { ContentfulStatusCode } from 'hono/utils/http-status'

export class ResultUtil {
  static success<T>(c: Context, data: T, message: string = '操作成功') {
    return c.json(
      {
        code: 200,
        message,
        data,
        success: true,
      },
      200
    )
  }

  static error(c: Context, code: number = 500, message: string = '服务器内部错误') {
    return c.json(
      {
        code,
        message,
        success: false,
        data: null,
      },
      code as ContentfulStatusCode
    )
  }
}
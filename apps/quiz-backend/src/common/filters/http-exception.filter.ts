import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from "@nestjs/common";
import { Response } from "express";

/**
 * 异常响应接口
 */
interface ExceptionResponse {
  message: string | string[];
  error?: string;
  statusCode?: number;
}

/**
 * 全局 HTTP 异常过滤器
 * 统一处理所有 HTTP 异常，返回标准格式的错误响应
 */
@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = "服务器内部错误";

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      // 处理验证错误（class-validator）
      if (
        typeof exceptionResponse === "object" &&
        "message" in exceptionResponse
      ) {
        const msg = (exceptionResponse as ExceptionResponse).message;
        message = Array.isArray(msg) ? msg.join(", ") : msg;
      } else if (typeof exceptionResponse === "string") {
        message = exceptionResponse;
      }
    } else if (exception instanceof Error) {
      message = exception.message;
    }

    // 返回统一格式
    response.status(status).json({
      code: status,
      message,
      data: null,
    });
  }
}

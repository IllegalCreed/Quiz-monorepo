import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";
import { SKIP_TRANSFORM_KEY } from "../decorators/skip-transform.decorator";

/**
 * 统一响应格式
 */
export interface Response<T> {
  code: number;
  message: string;
  data: T;
}

/**
 * 响应转换拦截器
 * 将所有成功响应包装为统一格式：{ code: 0, message: 'success', data: ... }
 * 使用 @SkipTransform() 装饰器可跳过转换（如 SSE 端点）
 */
@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<
  T,
  Response<T>
> {
  constructor(private readonly reflector: Reflector) {}

  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<Response<T>> {
    // 检查是否标记为跳过转换（SSE 端点等）
    const skip = this.reflector.getAllAndOverride<boolean>(SKIP_TRANSFORM_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (skip) {
      return next.handle() as Observable<Response<T>>;
    }

    return next.handle().pipe(
      map((data: T) => ({
        code: 0,
        message: "success",
        data,
      })),
    );
  }
}

import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from "@nestjs/common";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";

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
 */
@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<
  T,
  Response<T>
> {
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<Response<T>> {
    return next.handle().pipe(
      map((data: T) => ({
        code: 0,
        message: "success",
        data,
      })),
    );
  }
}

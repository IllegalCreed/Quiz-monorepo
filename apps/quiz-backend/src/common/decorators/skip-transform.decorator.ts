import { SetMetadata } from "@nestjs/common";

/**
 * 跳过响应转换元数据键
 */
export const SKIP_TRANSFORM_KEY = "skipTransform";

/**
 * 标记接口跳过全局响应格式转换
 * SSE 端点需要直接返回 Observable，不能被包装为 { code, data, message }
 *
 * @example
 * ```typescript
 * @Sse('stream')
 * @SkipTransform()
 * stream(): Observable<MessageEvent> { ... }
 * ```
 */
export const SkipTransform = () => SetMetadata(SKIP_TRANSFORM_KEY, true);

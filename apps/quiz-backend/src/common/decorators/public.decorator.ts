import { SetMetadata } from "@nestjs/common";

/**
 * 公开接口元数据键
 */
export const IS_PUBLIC_KEY = "isPublic";

/**
 * 标记接口为公开（不需要 JWT 认证）
 * 通常用于登录、注册等接口
 *
 * @example
 * ```typescript
 * @Post('login')
 * @Public()
 * async login(@Body() loginDto: LoginDto) {
 *   return this.authService.login(loginDto);
 * }
 * ```
 */
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);

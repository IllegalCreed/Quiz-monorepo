import {
  HttpException,
  HttpStatus,
  BadRequestException,
  UnauthorizedException,
  ForbiddenException,
  NotFoundException,
} from "@nestjs/common";
import { HttpExceptionFilter } from "../http-exception.filter";
import type { ArgumentsHost } from "@nestjs/common";

/**
 * HttpExceptionFilter 单元测试
 * 测试全局异常过滤器的统一错误响应格式
 */
describe("HttpExceptionFilter", () => {
  let filter: HttpExceptionFilter;
  let mockJson: jest.Mock;
  let mockStatus: jest.Mock;
  let mockHost: ArgumentsHost;

  beforeEach(() => {
    mockJson = jest.fn();
    mockStatus = jest.fn().mockReturnValue({ json: mockJson });
    mockHost = {
      switchToHttp: () => ({
        getResponse: () => ({ status: mockStatus }),
      }),
    } as unknown as ArgumentsHost;

    filter = new HttpExceptionFilter();
  });

  it("应该被正确实例化", () => {
    expect(filter).toBeDefined();
  });

  describe("HttpException 处理", () => {
    it("处理 BadRequestException（字符串消息）", () => {
      const exception = new BadRequestException("参数错误");

      filter.catch(exception, mockHost);

      expect(mockStatus).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
      expect(mockJson).toHaveBeenCalledWith({
        code: HttpStatus.BAD_REQUEST,
        message: "参数错误",
        data: null,
      });
    });

    it("处理 UnauthorizedException", () => {
      const exception = new UnauthorizedException("未登录或登录已过期");

      filter.catch(exception, mockHost);

      expect(mockStatus).toHaveBeenCalledWith(HttpStatus.UNAUTHORIZED);
      expect(mockJson).toHaveBeenCalledWith({
        code: HttpStatus.UNAUTHORIZED,
        message: "未登录或登录已过期",
        data: null,
      });
    });

    it("处理 ForbiddenException", () => {
      const exception = new ForbiddenException("权限不足");

      filter.catch(exception, mockHost);

      expect(mockStatus).toHaveBeenCalledWith(HttpStatus.FORBIDDEN);
      expect(mockJson).toHaveBeenCalledWith({
        code: HttpStatus.FORBIDDEN,
        message: "权限不足",
        data: null,
      });
    });

    it("处理 NotFoundException", () => {
      const exception = new NotFoundException("资源不存在");

      filter.catch(exception, mockHost);

      expect(mockStatus).toHaveBeenCalledWith(HttpStatus.NOT_FOUND);
      expect(mockJson).toHaveBeenCalledWith({
        code: HttpStatus.NOT_FOUND,
        message: "资源不存在",
        data: null,
      });
    });

    it("处理 class-validator 验证错误（message 为数组）", () => {
      const exception = new BadRequestException({
        message: ["用户名不能为空", "密码长度至少6位"],
        error: "Bad Request",
        statusCode: 400,
      });

      filter.catch(exception, mockHost);

      expect(mockStatus).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
      expect(mockJson).toHaveBeenCalledWith({
        code: HttpStatus.BAD_REQUEST,
        message: "用户名不能为空, 密码长度至少6位",
        data: null,
      });
    });

    it("处理 HttpException 字符串 response", () => {
      const exception = new HttpException("自定义错误", HttpStatus.CONFLICT);

      filter.catch(exception, mockHost);

      expect(mockStatus).toHaveBeenCalledWith(HttpStatus.CONFLICT);
      expect(mockJson).toHaveBeenCalledWith({
        code: HttpStatus.CONFLICT,
        message: "自定义错误",
        data: null,
      });
    });
  });

  describe("非 HttpException 处理", () => {
    it("处理普通 Error → 500 + error.message", () => {
      const exception = new Error("数据库连接失败");

      filter.catch(exception, mockHost);

      expect(mockStatus).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
      expect(mockJson).toHaveBeenCalledWith({
        code: HttpStatus.INTERNAL_SERVER_ERROR,
        message: "数据库连接失败",
        data: null,
      });
    });

    it("处理未知异常（非 Error 对象）→ 500 + 默认消息", () => {
      const exception = "unexpected string error";

      filter.catch(exception, mockHost);

      expect(mockStatus).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
      expect(mockJson).toHaveBeenCalledWith({
        code: HttpStatus.INTERNAL_SERVER_ERROR,
        message: "服务器内部错误",
        data: null,
      });
    });

    it("处理 null 异常 → 500 + 默认消息", () => {
      filter.catch(null, mockHost);

      expect(mockStatus).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
      expect(mockJson).toHaveBeenCalledWith({
        code: HttpStatus.INTERNAL_SERVER_ERROR,
        message: "服务器内部错误",
        data: null,
      });
    });
  });
});

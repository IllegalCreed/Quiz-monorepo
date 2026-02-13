import "reflect-metadata";
import { validate } from "class-validator";
import { plainToInstance } from "class-transformer";
import { CheckAnswerDto } from "../check-answer.dto";

describe("CheckAnswerDto", () => {
  describe("验证规则", () => {
    it("应该接受有效的数据", async () => {
      // Arrange
      const plainDto = {
        questionId: 1,
        selectedOptionId: 10,
        elapsedMs: 5000,
      };

      // Act
      const dto = plainToInstance(CheckAnswerDto, plainDto);
      const errors = await validate(dto);

      // Assert
      expect(errors).toHaveLength(0);
      expect(dto.questionId).toBe(1);
      expect(dto.selectedOptionId).toBe(10);
      expect(dto.elapsedMs).toBe(5000);
    });

    it("应该接受没有 elapsedMs 的数据（可选字段）", async () => {
      // Arrange
      const plainDto = {
        questionId: 1,
        selectedOptionId: 10,
      };

      // Act
      const dto = plainToInstance(CheckAnswerDto, plainDto);
      const errors = await validate(dto);

      // Assert
      expect(errors).toHaveLength(0);
      expect(dto.elapsedMs).toBeUndefined();
    });

    it("应该拒绝缺少 questionId 的数据", async () => {
      // Arrange
      const plainDto = {
        selectedOptionId: 10,
      };

      // Act
      const dto = plainToInstance(CheckAnswerDto, plainDto);
      const errors = await validate(dto);

      // Assert
      expect(errors.length).toBeGreaterThan(0);
      const questionIdError = errors.find((e) => e.property === "questionId");
      expect(questionIdError).toBeDefined();
    });

    it("应该拒绝缺少 selectedOptionId 的数据", async () => {
      // Arrange
      const plainDto = {
        questionId: 1,
      };

      // Act
      const dto = plainToInstance(CheckAnswerDto, plainDto);
      const errors = await validate(dto);

      // Assert
      expect(errors.length).toBeGreaterThan(0);
      const selectedOptionIdError = errors.find(
        (e) => e.property === "selectedOptionId",
      );
      expect(selectedOptionIdError).toBeDefined();
    });

    it("应该拒绝非整数的 questionId", async () => {
      // Arrange
      const plainDto = {
        questionId: 1.5, // 小数
        selectedOptionId: 10,
      };

      // Act
      const dto = plainToInstance(CheckAnswerDto, plainDto);
      const errors = await validate(dto);

      // Assert
      expect(errors.length).toBeGreaterThan(0);
    });

    it("应该拒绝负数的 selectedOptionId", async () => {
      // Arrange
      const plainDto = {
        questionId: 1,
        selectedOptionId: -10, // 负数
      };

      // Act
      const dto = plainToInstance(CheckAnswerDto, plainDto);
      const errors = await validate(dto);

      // Assert
      expect(errors.length).toBeGreaterThan(0);
    });

    it("应该拒绝 0 作为 questionId（必须是正整数）", async () => {
      // Arrange
      const plainDto = {
        questionId: 0,
        selectedOptionId: 10,
      };

      // Act
      const dto = plainToInstance(CheckAnswerDto, plainDto);
      const errors = await validate(dto);

      // Assert
      expect(errors.length).toBeGreaterThan(0);
    });
  });

  describe("类型转换（@Type 装饰器）", () => {
    it("应该将字符串数字转换为数字类型", () => {
      // Arrange - 模拟从 HTTP 请求接收到的字符串类型数据
      const plainDto = {
        questionId: "1", // 字符串
        selectedOptionId: "10", // 字符串
        elapsedMs: "5000", // 字符串
      };

      // Act
      const dto = plainToInstance(CheckAnswerDto, plainDto);

      // Assert
      expect(typeof dto.questionId).toBe("number");
      expect(typeof dto.selectedOptionId).toBe("number");
      expect(typeof dto.elapsedMs).toBe("number");
      expect(dto.questionId).toBe(1);
      expect(dto.selectedOptionId).toBe(10);
      expect(dto.elapsedMs).toBe(5000);
    });

    it("应该在转换后仍然通过验证", async () => {
      // Arrange
      const plainDto = {
        questionId: "1",
        selectedOptionId: "10",
      };

      // Act
      const dto = plainToInstance(CheckAnswerDto, plainDto);
      const errors = await validate(dto);

      // Assert
      expect(errors).toHaveLength(0);
    });

    it("应该拒绝无法转换为数字的字符串", async () => {
      // Arrange
      const plainDto = {
        questionId: "abc", // 无法转换
        selectedOptionId: 10,
      };

      // Act
      const dto = plainToInstance(CheckAnswerDto, plainDto);
      const errors = await validate(dto);

      // Assert
      expect(errors.length).toBeGreaterThan(0);
    });
  });

  describe("边界情况", () => {
    it("应该接受大整数", async () => {
      // Arrange
      const plainDto = {
        questionId: 999999,
        selectedOptionId: 999999,
      };

      // Act
      const dto = plainToInstance(CheckAnswerDto, plainDto);
      const errors = await validate(dto);

      // Assert
      expect(errors).toHaveLength(0);
    });

    it("应该拒绝 null 值", async () => {
      // Arrange
      const plainDto = {
        questionId: null,
        selectedOptionId: 10,
      };

      // Act
      const dto = plainToInstance(CheckAnswerDto, plainDto);
      const errors = await validate(dto);

      // Assert
      expect(errors.length).toBeGreaterThan(0);
    });

    it("应该拒绝 undefined 值", async () => {
      // Arrange
      const plainDto = {
        questionId: 1,
        selectedOptionId: undefined,
      };

      // Act
      const dto = plainToInstance(CheckAnswerDto, plainDto);
      const errors = await validate(dto);

      // Assert
      expect(errors.length).toBeGreaterThan(0);
    });
  });
});

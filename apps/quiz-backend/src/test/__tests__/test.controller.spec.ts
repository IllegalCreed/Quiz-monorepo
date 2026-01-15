import {
  ForbiddenException,
  InternalServerErrorException,
} from "@nestjs/common";
import { validateResetRequest } from "../test.controller";
import type { Request } from "express";

function makeReq(
  headers: Record<string, string | string[] | undefined>,
): Request {
  // Build a minimal fake Request shape that satisfies the validator.
  return {
    headers,
  } as unknown as Request;
}

describe("validateResetRequest", () => {
  const OLD_ENV = process.env;

  beforeEach(() => {
    process.env = { ...OLD_ENV };
  });
  afterEach(() => {
    process.env = OLD_ENV;
  });

  test("throws if ENABLE_TEST_ENDPOINT not enabled", () => {
    delete process.env.ENABLE_TEST_ENDPOINT;
    expect(() => validateResetRequest(makeReq({}))).toThrow(ForbiddenException);
  });

  test("throws InternalServerError if TEST_RESET_SECRET not configured", () => {
    process.env.ENABLE_TEST_ENDPOINT = "true";
    delete process.env.TEST_RESET_SECRET;
    expect(() => validateResetRequest(makeReq({}))).toThrow(
      InternalServerErrorException,
    );
  });

  test("throws Forbidden if secret missing or wrong", () => {
    process.env.ENABLE_TEST_ENDPOINT = "true";
    process.env.TEST_RESET_SECRET = "s3cr3t";

    expect(() => validateResetRequest(makeReq({}))).toThrow(ForbiddenException);
    expect(() =>
      validateResetRequest(makeReq({ "x-reset-secret": "bad" })),
    ).toThrow(ForbiddenException);
  });

  test("throws Forbidden if database name doesn't contain test", () => {
    process.env.ENABLE_TEST_ENDPOINT = "true";
    process.env.TEST_RESET_SECRET = "s3cr3t";
    process.env.DATABASE_NAME = "dev_db";

    expect(() =>
      validateResetRequest(makeReq({ "x-reset-secret": "s3cr3t" })),
    ).toThrow(ForbiddenException);
  });

  test("passes when everything set and db name includes test", () => {
    process.env.ENABLE_TEST_ENDPOINT = "true";
    process.env.TEST_RESET_SECRET = "s3cr3t";
    process.env.DATABASE_NAME = "my_test_db";

    expect(() =>
      validateResetRequest(makeReq({ "x-reset-secret": "s3cr3t" })),
    ).not.toThrow();
  });
  test("throws InternalServerError if TEST_RESET_SECRET not configured", () => {
    process.env.ENABLE_TEST_ENDPOINT = "true";
    delete process.env.TEST_RESET_SECRET;
    expect(() => validateResetRequest(makeReq({}))).toThrow(
      InternalServerErrorException,
    );
  });

  test("throws Forbidden if secret missing or wrong", () => {
    process.env.ENABLE_TEST_ENDPOINT = "true";
    process.env.TEST_RESET_SECRET = "s3cr3t";

    expect(() => validateResetRequest(makeReq({}))).toThrow(ForbiddenException);
    expect(() =>
      validateResetRequest(makeReq({ "x-reset-secret": "bad" })),
    ).toThrow(ForbiddenException);
  });

  test("throws Forbidden if database name doesn't contain test", () => {
    process.env.ENABLE_TEST_ENDPOINT = "true";
    process.env.TEST_RESET_SECRET = "s3cr3t";
    process.env.DATABASE_NAME = "dev_db";

    expect(() =>
      validateResetRequest(makeReq({ "x-reset-secret": "s3cr3t" })),
    ).toThrow(ForbiddenException);
  });

  test("passes when everything set and db name includes test", () => {
    process.env.ENABLE_TEST_ENDPOINT = "true";
    process.env.TEST_RESET_SECRET = "s3cr3t";
    process.env.DATABASE_NAME = "my_test_db";

    expect(() =>
      validateResetRequest(makeReq({ "x-reset-secret": "s3cr3t" })),
    ).not.toThrow();
  });
});

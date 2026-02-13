// ***********************************************************
// This example support/index.js is processed and
// loaded automatically before your test files.
//
// This is a great place to put global configuration and
// behavior that modifies Cypress.
//
// You can change the location of this file or turn off
// automatically serving support files with the
// 'supportFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/configuration
// ***********************************************************

// Import commands.js using ES2015 syntax:
import "./commands";

// Alternatively you can use CommonJS syntax:
// require('./commands')

/**
 * 忽略无害的 ResizeObserver 错误
 * 这个错误在 Element Plus 组件（如 el-dialog）快速打开/关闭时可能会触发
 * 参考：https://github.com/quasarframework/quasar/issues/2233
 */
Cypress.on("uncaught:exception", (err) => {
  // 忽略 ResizeObserver 错误
  if (err.message.includes("ResizeObserver loop")) {
    return false;
  }
  // 其他错误正常抛出
  return true;
});

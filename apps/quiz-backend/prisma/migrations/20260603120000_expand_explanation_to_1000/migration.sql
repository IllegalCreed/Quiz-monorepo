-- 扩展 Question.explanation 长度：500 → 1000
-- 背景：构建工具章节（Vite/Webpack/Turbopack/Parcel/Rsbuild）题解写得较详细，
-- 部分超过 500（最长 977），导入时触发 P2000 LengthMismatch。
-- explanation 未建索引，加宽安全；stem / Option.text / Option.description 仍在 500 内，保持不动。
ALTER TABLE `Question` MODIFY `explanation` VARCHAR(1000) NULL;

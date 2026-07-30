<script setup lang="ts">
const updatedAt = "2026 年 7 月 30 日";
</script>

<template>
  <article class="privacy-page">
    <header>
      <a class="back-link" href="/">← 返回 IllegalCreed Quiz</a>
      <h1>隐私政策</h1>
      <p>最近更新：{{ updatedAt }}</p>
    </header>

    <section>
      <h2>适用范围</h2>
      <p>
        本页面说明
        <code>quiz.illegalscreed.cn</code> 用户端如何处理数据。个人站、算法可视化站和第一阶段 Type
        Pal 的统一说明见 <a href="https://illegalscreed.cn/zh/privacy">IllegalCreed 总隐私政策</a>。
      </p>
    </section>

    <section>
      <h2>账号与答题数据</h2>
      <p>
        你可以作为游客答题，也可以使用可选账号。注册账号时，服务端保存用户名、密码哈希，以及你主动提供的可选昵称或邮箱；不会保存明文密码。
      </p>
      <p>
        游客答题不会保存答题历史。登录后，为提供历史与学习偏好功能，服务端会保存题目
        ID、所选答案、正误、答题时间和分类偏好。
        通用操作日志还可能为安全与故障排查包含答题提交和结果元数据、IP、请求路径、成功状态与时间；它与登录后的答题历史功能分开保存。
      </p>
    </section>

    <section>
      <h2>浏览器与在线状态</h2>
      <p>
        浏览器本地可能保存登录令牌、游客分类选择、主题、提示偏好和访问统计选择。每个标签页还会在
        sessionStorage 中生成临时客户端 ID。
      </p>
      <p>
        为接收公告和刷新通知，在线客户端服务会在连接期间于服务器内存中处理客户端
        ID、IP、登录状态和当前 pathname； 不发送 URL 查询参数，断开连接后从在线列表移除。
      </p>
    </section>

    <section>
      <h2>访问统计</h2>
      <p>
        只有你选择“允许”后，站点才会加载独立的 Google Analytics 4
        和百度统计脚本。发送的页面位置只保留 pathname 与经过校验的
        <code>utm_source</code>、<code>utm_medium</code>、
        <code>utm_campaign</code>、<code>utm_content</code>；不会发送题目、答案或账号标识。
      </p>
      <p>
        GA4 Enhanced Measurement
        已关闭，不自动采集滚动、出站点击或站内搜索。你可以拒绝，或之后通过“隐私设置”修改选择。
        在没有明确选择、检测到 DNT/GPC 或本地存储不可用时，统计默认关闭。
      </p>
    </section>

    <section>
      <h2>广告</h2>
      <p>
        Quiz 的 Google AdSense 仍处于准备/审核阶段。本轮不会加载 AdSense
        广告脚本，也不会启用个性化广告。 未来若启用，会先补齐适用地区所需的 Google
        认证同意管理路径并更新本政策。
      </p>
    </section>

    <section>
      <h2>服务日志与安全</h2>
      <p>
        Web 服务器可能为安全、登录审计和故障排查处理 IP、User-Agent、请求路径、响应状态和时间。
        密码等敏感字段会过滤；登录与必要的管理操作日志和产品数据分别保存。
      </p>
    </section>

    <section>
      <h2>你的选择与联系</h2>
      <p>
        你可以不注册直接答题，也可以退出登录、清除浏览器本地数据、拒绝访问统计，并请求查询、更正或删除账号资料。
        如需处理账号数据，请先在
        <a href="https://github.com/IllegalCreed/quiz-monorepo/issues">Quiz 仓库</a>
        创建不含敏感信息的 Issue 以约定私下核验方式；不要在公开 Issue
        中提交邮箱、令牌、密码或答题记录。
      </p>
    </section>
  </article>
</template>

<style scoped lang="scss">
.privacy-page {
  @apply w-full max-w-3xl mx-auto px-6 py-12 leading-relaxed;
  color: var(--quiz-ui-text);

  header {
    @apply mb-10;
  }

  h1 {
    @apply mt-5 mb-2 text-4xl font-bold;
  }

  h2 {
    @apply mt-8 mb-3 text-xl font-semibold;
  }

  p {
    @apply my-3;
    color: var(--quiz-ui-muted);
  }

  a {
    color: var(--quiz-ui-primary);
    text-underline-offset: 3px;
  }

  code {
    @apply px-1.5 py-0.5 rounded;
    color: var(--quiz-ui-text);
    background: var(--quiz-ui-control-bg);
  }
}

.back-link {
  @apply inline-flex font-medium;
}
</style>

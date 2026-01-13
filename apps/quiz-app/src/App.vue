<script setup lang="ts"></script>

<template>
  <div id="app">
    <header class="app-header">
      <h1 class="title">Quiz</h1>
    </header>

    <main>
      <router-view />
    </main>

    <footer class="app-footer">&copy; Quiz</footer>
  </div>
</template>

<style scoped>
#app { min-height: 100vh; display:flex; flex-direction:column }
.app-header { padding: 16px; border-bottom: 1px solid #eee }
.title { margin: 0; font-size: 1.25rem }
main { flex: 1; padding: 24px }
.app-footer { padding: 12px; text-align:center; color:#6b7280 }
</style>

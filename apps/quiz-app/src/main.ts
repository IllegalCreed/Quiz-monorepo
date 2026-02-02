import { createApp } from "vue";
import { createPinia } from "pinia";
import "virtual:uno.css";
// Include package CSS from @quiz/ui so component styles are present when consuming
import "@quiz/ui/dist/ui.css";

import App from "./App.vue";
import router from "./router";

const app = createApp(App);

app.use(createPinia());
app.use(router);

app.mount("#app");

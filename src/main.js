import { createApp } from "vue";
import { createPinia } from "pinia";
import './tailwind.css'

import App from "./App.vue";
import router from "./router";
import { setupI18n, loadLocaleMessages } from "./i18n";

import ShuttleVue from 'shuttle-vue3';
import "shuttle-vue3/dist/shuttle-vue3.css";
import "shuttle-vue3/dist/variables.css";
import "@/assets/tailwind.css";

import { useAlertStore } from "@/stores/alert";
import { useSessionStore } from "@/stores/session";

import TableEmpty from "@/components/TableEmpty.vue";

const app = createApp(App);

const i18n = setupI18n({
    locale: import.meta.env.VITE_APP_I18N_LOCALE,
    fallbackLocale: import.meta.env.VITE_APP_I18N_FALLBACK_LOCALE,
});

await loadLocaleMessages(i18n, "en");

app.use(createPinia());
app.use(i18n);
app.use(router);
app.use(ShuttleVue);

app.component("TableEmpty", TableEmpty);

const alertStore = useAlertStore();
const sessionStore = useSessionStore();

await sessionStore.initialize()
    .catch(error => {
        alertStore.add({
            message: i18n.global.t("exceptions.session-initialize", { error: error.toString() }),
            variant: "danger",
            name: "session-initialize"
        });

        router.push({ path: "/signin" });
    });

if (window.location.pathname === "/") {
    router.push({ path: sessionStore.authenticated ? "/dashboard" : "/signin" });
}

app.mount("#app");

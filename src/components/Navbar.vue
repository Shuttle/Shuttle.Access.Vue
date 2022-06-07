<template>
    <header>
        <div
            class="px-4 border-0 border-b border-solid border-gray-200 dark:border-gray-700 fixed top-0 left-0 w-full bg-[color:var(--color-background)] z-50">
            <Navbar>
                <template #start>
                    <div class="flex flex-row items-center mr-2">
                        <div class="font-bold text-orange-500 mt-[2px]">Shuttle.Access</div>
                    </div>
                </template>
                <template #navigation>
                    <Navigation :items="items" @click="route" />
                </template>
                <template #end>
                    <div class="flex flex-row items-center">
                        <div class="mx-2">
                            <Toggle aria-label="toggle dark mode" v-model="darkMode" :onIcon="MoonIcon"
                                :offIcon="SunIcon" @click="toggleAppearance" />
                        </div>
                        <div class="hidden sm:block">
                            <Navigation :items="profileItems" dropdown-alignment="right" @click="route" />
                        </div>
                    </div>
                </template>
                <template #navigation-minimal>
                    <Navigation :minimal="true" :items="items" @click="route" />
                </template>
                <template #bottom-minimal class="sm:hidden">
                    <Navigation :minimal="true" :items="profileItems" dropdown-alignment="right" @click="route" />
                </template>
            </Navbar>
        </div>
    </header>
</template>

<script setup>
import map from "./navigation-map";
import { UserIcon, MoonIcon, SunIcon } from "@heroicons/vue/outline";
import { computed, ref } from "vue";
import { useSessionStore } from "@/stores/session";
import { useI18n } from "vue-i18n";
import { useRouter } from "vue-router";

const { t } = useI18n({ useScope: 'global' });

const sessionStore = useSessionStore();
const router = useRouter();

const items = computed(() => {
    var result = [];

    map.forEach((item) => {
        var add = false;
        var subitems = [];

        if (!item.permission || sessionStore.hasPermission(item.permission)) {
            if (item.items !== undefined) {
                item.items.forEach((subitem) => {
                    if (
                        !subitem.permission ||
                        sessionStore.hasPermission(subitem.permission)
                    ) {
                        add = true;

                        subitems.push({
                            to: subitem.to,
                            text: t(subitem.text),
                        });
                    }
                });
            } else {
                add = true;
            }

            if (add) {
                result.push({
                    text: t(item.text),
                    to: item.to || "",
                    items: subitems,
                });
            }
        }
    });

    return result;
});

const profileItems = computed(() => {
    return sessionStore.authenticated ?
        [{
            buttonIcon: UserIcon,
            items: [
                {
                    text: t("password"),
                    to: "/password/token"
                },
                {
                    type: "divider"
                },
                {
                    text: t("sign-out"),
                    click: () => {
                        sessionStore.signOut();
                        router.push({ name: "sign-in" })
                    }
                }
            ]
        }] : [
            {
                text: t("sign-in"),
                to: "/signin"
            }
        ]
});

const route = (item) => {
    router.push({ path: item.to });
}

const storageKey = 'shuttle-theme-appearance';
let userPreference = localStorage?.getItem(storageKey) || 'auto'
const query = window.matchMedia(`(prefers-color-scheme: dark)`)
const classList = document.documentElement.classList
let isDark = userPreference === 'auto' ? query.matches : userPreference === 'dark'
const setClass = (dark) => classList[dark ? 'add' : 'remove']('dark')

query.onchange = (e) => {
    if (userPreference === 'auto') {
        setClass((isDark = e.matches));
    }
}

const toggleAppearance = () => {
    if (typeof localStorage === 'undefined') {
        return;
    }

    setClass((isDark = !isDark));

    localStorage.setItem(
        storageKey,
        (userPreference = isDark
            ? query.matches
                ? 'auto'
                : 'dark'
            : query.matches
                ? 'light'
                : 'auto')
    );
}

const darkMode = ref(isDark);

setClass(isDark);

</script>
<template>
    <div>
        <div class="flex flex-col sm:flex-row gap-2 items-stretch">
            <div v-for="item in items"
                class="group flex flex-col items-center justify-center border border-solid border-[color:rgb(var(--sv-border-primary))] rounded-lg p-2 w-full cursor-pointer hover:bg-[color:rgb(var(--sv-bg-primary--hover))] active:bg-[color:rgb(var(--sv-bg-primary--active))]"
                @click="click(item)">
                <div class="text-2xl font-bold text-[color:rgb(var(--sv-text-title-primary))] group-hover:text-[color:rgb(var(--sv-text-fg-primary--hover))]">{{ item.title }}</div>
                <div class="text-xl font-semibold">{{ item.value }}</div>
            </div>
        </div>
    </div>
</template>

<script setup>
import api from "@/api";
import { onMounted, ref } from "vue";
import { useI18n } from "vue-i18n";
import { useRouter } from "vue-router";

const { t } = useI18n({ useScope: 'global' });
const router = useRouter();

const items = ref([]);

const click = (item) => {
    router.push({ name: item.route })
}

const addItem = (title, value, route) => {
    items.value.push({ title: title, value: value, route: route });
}

const refresh = () => {
    api.get("statistics/dashboard")
        .then(response => {
            addItem(t("permissions"), response.data.permissionCount, "permissions");
            addItem(t("identities"), response.data.identityCount, "identities");
            addItem(t("roles"), response.data.roleCount, "roles");
        })
}

onMounted(() => {
    refresh();
})
</script>
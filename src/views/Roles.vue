<template>
    <div>
        <Title>{{ $t("roles") }}</Title>
        <Strip>
            <Button :icon="RefreshIcon" size="sm" @click="refresh"></Button>
            <Button :icon="PlusIcon" size="sm" @click="add"></Button>
        </Strip>
        <Table :fields="fields" :items="items" :busy="busy" striped>
            <template #item(permissions)="data">
                <Button :icon="ShieldCheckIcon" size="xs" outline @click="permissions(data.item)"></Button>
            </template>
            <template #item(rename)="data">
                <Button :icon="PencilIcon" size="xs" outline @click="rename(data.item)"></Button>
            </template>
            <template #item(remove)="data">
                <Button :icon="TrashIcon" size="xs" outline variant="danger"
                    @click="confirmationStore.show(data.item, remove)"></Button>
            </template>
            <template #busy>
                <Busy />
            </template>
            <template #empty>
                <TableEmpty />
            </template>
        </Table>
    </div>
</template>

<script setup>
import api from "@/api";
import { onMounted, ref } from "vue";
import { useI18n } from "vue-i18n";
import { PencilIcon, PlusIcon, RefreshIcon, TrashIcon, ShieldCheckIcon } from "@heroicons/vue/outline";
import { useRouter } from "vue-router";
import { useAlertStore } from "@/stores/alert";
import { useConfirmationStore } from "@/stores/confirmation";
import { useSecureTableFields } from "@/composables/useSecureTableFields";

var confirmationStore = useConfirmationStore();

const { t } = useI18n({ useScope: 'global' });
const router = useRouter();
const busy = ref();

const fields = useSecureTableFields([
    {
        text: "",
        name: "permissions",
        thClass: "w-1",
        permission: "access://role/manage"
    },
    {
        text: "",
        name: "rename",
        thClass: "w-1",
        permission: "access://role/manage"
    },
    {
        text: "",
        name: "remove",
        thClass: "w-1",
        permission: "access://role/manage"
    },
    {
        text: t("role-name"),
        name: "name",
    },
]);

const items = ref([]);

const refresh = () => {
    busy.value = true;

    api
        .get("roles")
        .then(function (response) {
            if (!response || !response.data) {
                return;
            }

            items.value = response.data;
        })
        .finally(function () {
            busy.value = false;
        });
}

const remove = (item) => {
    confirmationStore.setIsOpen(false);

    api
        .delete(`roles/${item.id}`)
        .then(function () {
            useAlertStore().requestSent();

            refresh();
        });
}

const add = () => {
    router.push({ name: "role" })
}

const permissions = (item) => {
    router.push({ name: "role-permissions", params: { id: item.id } });
}

const rename = (item) => {
    router.push({ name: "role-rename", params: { id: item.id } });
}

onMounted(() => {
    refresh();
})
</script>

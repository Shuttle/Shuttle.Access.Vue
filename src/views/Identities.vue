<template>
    <div>
        <Title>{{ t("identities") }}</Title>
        <Strip>
            <Button :icon="RefreshIcon" size="sm" @click="refresh"></Button>
            <Button :icon="PlusIcon" size="sm" @click="add"></Button>
        </Strip>
        <Table :fields="fields" :items="items" :busy="busy" striped>
            <template #item(roles)="data">
                <Button :icon="UserGroupIcon" size="xs" outline @click="roles(data.item)"></Button>
            </template>
            <template #item(edit)="data">
                <Button :icon="PencilIcon" size="xs" outline @click="edit(data.item)"></Button>
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
import { PencilIcon, PlusIcon, RefreshIcon, TrashIcon, UserGroupIcon } from "@heroicons/vue/outline";
import { useDateFormatter } from "@/composables/useDateFormatter";
import { useSecureTableFields } from "@/composables/useSecureTableFields";
import { useRouter } from "vue-router";
import { useAlertStore } from "@/stores/alert";
import { useConfirmationStore } from "@/stores/confirmation";

var confirmationStore = useConfirmationStore();

const { t } = useI18n({ useScope: 'global' });
const router = useRouter();
const busy = ref();

const fields = useSecureTableFields([
    {
        text: "",
        name: "roles",
        thClass: "w-1",
        permission: "access://identity/manage"
    },
    {
        text: "",
        name: "edit",
        thClass: "w-1",
        permission: "access://identity/manage"
    },
    {
        text: "",
        name: "remove",
        thClass: "w-1",
        permission: "access://identity/manage"
    },
    {
        text: t("name"),
        name: "name",
    },
    {
        text: t("generated-password"),
        name: "generatedPassword",
    },
    {
        text: t("date-registered"),
        name: "dateRegistered",
        formatter: useDateFormatter,
    },
    {
        text: t("registered-by"),
        name: "registeredBy",
    },
    {
        text: t("date-activated"),
        name: "dateActivated",
        formatter: useDateFormatter,
    },
]);

const items = ref([]);

const refresh = () => {
    busy.value = true;

    api
        .get("identities")
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
        .delete(`identities/${item.id}`)
        .then(function () {
            useAlertStore().requestSent();

            refresh();
        });
}

const add = () => {
    router.push({ name: "identity" })
}

const roles = (item) => {
    router.push({ name: "identity-roles", params: { id: item.id } });
}

const edit = (item) => {
    router.push({ name: "identity-rename", params: { id: item.id } });
}

onMounted(() => {
    refresh();
})
</script>
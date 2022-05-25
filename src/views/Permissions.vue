<template>
    <div>
        <Title>{{ $t("permissions") }}</Title>
        <Strip>
            <Button :icon="RefreshIcon" size="sm" @click="refresh"></Button>
            <Button :icon="PlusIcon" size="sm" @click="add"></Button>
        </Strip>
        <Table :fields="fields" :items="items" :busy="busy" striped>
            <template #item(status)="data">
                <ButtonGroup :buttons="status" @click="registerStatus" v-model="data.item.status" />
            </template>
            <template #item(rename)="data">
                <Button :icon="PencilIcon" size="xs" outline @click="rename(data.item)"></Button>
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
import { PlusIcon, RefreshIcon, PencilIcon } from "@heroicons/vue/outline";
import { useRouter } from "vue-router";
import { useAlertStore } from "@/stores/alert";
import { useConfirmationStore } from "@/stores/confirmation";
import { useSecureTableFields } from "@/composables/useSecureTableFields";

var confirmationStore = useConfirmationStore();

const { t } = useI18n({ useScope: 'global' });
const router = useRouter();
const busy = ref();

const status = [
    {
        text: t("active"),
        value: 1
    },
    {
        text: t("deactivated"),
        value: 2
    },
    {
        text: t("removed"),
        value: 3
    },
];

const fields = useSecureTableFields([
    {
        text: "",
        name: "rename",
        thClass: "w-1",
        permission: "access://pemission/manage"
    },
    {
        text: t("status"),
        name: "status",
        thClass: "w-64",
        permission: "access://pemission/manage"
    },
    {
        text: t("permission"),
        name: "name",
    },
]);

const items = ref([]);

const refresh = () => {
    busy.value = true;

    api
        .get("permissions")
        .then(function (response) {
            items.value = response?.data;
//            items.value = response?.data.map(item => { return reactive(item); });
        })
        .finally(function () {
            busy.value = false;
        });
}

const remove = (item) => {
    confirmationStore.setIsOpen(false);

    api
        .delete(`permissions/${item.id}`)
        .then(function () {
            useAlertStore().requestSent();

            refresh();
        });
}

const add = () => {
    router.push({ name: "permission" })
}

const rename = (item) => {
    router.push({ name: "permission-rename", params: { id: item.id } });
}

onMounted(() => {
    refresh();
})
</script>
<template>
    <div>
        <Title>{{ $t("permissions") }}</Title>
        <Strip>
            <Button :icon="RefreshIcon" size="sm" @click="refresh"></Button>
            <Button :icon="PlusIcon" size="sm" @click="add"></Button>
        </Strip>
        <Table :fields="fields" :items="items" :busy="busy" striped>
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
import { PlusIcon, RefreshIcon, TrashIcon } from "@heroicons/vue/outline";
import { useRouter } from "vue-router";
import { useAlertStore } from "@/stores/alert";
import { useConfirmationStore } from "@/stores/confirmation";

var confirmationStore = useConfirmationStore();

const { t } = useI18n({ useScope: 'global' });
const router = useRouter();
const busy = ref();

const fields = [
    {
        text: "",
        name: "remove",
        thClass: "w-1",
    },
    {
        text: t("permission"),
        name: "permission",
    },
];

const items = ref([]);

const refresh = () => {
    busy.value = true;

    api
        .get("permissions")
        .then(function (response) {
            if (!response || !response.data) {
                return;
            }

            items.value = response.data.map(item => { return { permission: item } });
        })
        .finally(function () {
            busy.value = false;
        });
}

const remove = (item) => {
    confirmationStore.setIsOpen(false);

    api
        .delete(`permissions/${encodeURIComponent(item.permission)}`)
        .then(function () {
            useAlertStore().requestSent();

            refresh();
        });
}

const add = () => {
    router.push({ name: "permission" })
}

onMounted(() => {
    refresh();
})
</script>
<template>
    <Title>{{ $t("identities") }}</Title>
    <Strip>
        <Button :icon="RefreshIcon" size="sm" @click="refresh"></Button>
        <Button :icon="PlusIcon" size="sm" @click="add"></Button>
    </Strip>
    <Table :fields="fields" :items="items" :busy="busy">
        <template #item(roles)>
            <Button :icon="UserGroupIcon" size="xs" outline></Button>
        </template>
        <template #item(remove)="data">
            <Button :icon="TrashIcon" size="xs" outline variant="danger" @click="confirm(data.item)"></Button>
        </template>
        <template #busy>
            <Busy />
        </template>
        <template #empty>
            <TableEmpty />
        </template>
    </Table>
    <Dialog :isOpen="confirmationOpen" :setIsOpen="setConfirmationOpen" title="Confirmation"
        message="Are you sure that you would like to delete the identity?">
        <div class="flex flex-row items-center justify-end mt-4">
            <Button variant="danger" class="mr-2 w-20 justify-center" @click="remove()">Yes</Button>
            <Button variant="secondary" class="w-20 justify-center" @click="setConfirmationOpen(false)">Cancel</Button>
        </div>
    </Dialog>
</template>

<script setup>
import api from "@/api";
import { ref } from "vue";
import { useI18n } from "vue-i18n";
import { PlusIcon, RefreshIcon, TrashIcon, UserGroupIcon } from "@heroicons/vue/outline";
import { useDateFormatter } from "@/composables/useDateFormatter";
import { useRouter } from "vue-router";
import { useAlertStore } from "@/stores/alert";

const { t } = useI18n({ useScope: 'global' });
const router = useRouter();
const busy = ref();
const confirmationOpen = ref(false);

var selectedItem;

const setConfirmationOpen = (open) => {
    confirmationOpen.value = open;
}

const confirm = (item) => {
    selectedItem = item;

    setConfirmationOpen(true);
}

const fields = [
    {
        text: "",
        name: "roles",
        thClass: "w-1",
    },
    {
        text: "",
        name: "remove",
        thClass: "w-1",
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
];

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

const remove = () => {
    setConfirmationOpen(false);

    api
        .delete(`identities/${selectedItem.id}`)
        .then(function () {
            useAlertStore().add({
                message: t("messages.request-sent"),
            });

            refresh();
        });
}

refresh();

const add = () => {
    router.push({ name: "identity" })
}
</script>
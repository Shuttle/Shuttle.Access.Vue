<template>
    <div>
        <Title>{{ $t("permissions") }}</Title>
        <Strip>
            <Button :icon="RefreshIcon" size="sm" @click="refresh"></Button>
            <Button :icon="PlusIcon" size="sm" @click="add"></Button>
        </Strip>
        <Table :fields="fields" :items="items" :busy="busy" striped>
            <template #item(status)="data">
                <div class="flex flex-row items-center">
                    <ButtonGroup :buttons="status" @click="(button) => setStatus(data.item, button)"
                        v-model="data.item.status" :disabled="data.item.working" />
                    <div v-if="data.item.working" class="flex flex-row items-center justify-center">
                        <ClockIcon class="sv-icon" />
                    </div>
                </div>
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
import { computed, onMounted, ref } from "vue";
import { useI18n } from "vue-i18n";
import { PlusIcon, RefreshIcon, PencilIcon } from "@heroicons/vue/outline";
import { useRouter } from "vue-router";
import { useAlertStore } from "@/stores/alert";
import { useSecureTableFields } from "@/composables/useSecureTableFields";
import { ClockIcon } from "@heroicons/vue/outline";

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

const workingItems = computed(() => {
    return items.value.filter((item) => {
        return item.working;
    });
});

const workingCount = computed(() => {
    return workingItems.value.length;
});

const getPermissionItem = (id) => {
    return items.value.find(item => {
        return item.id === id;
    })
};

const getWorkingPermissions = () => {
    if (workingCount.value === 0) {
        return;
    }

    api
        .post(`permissions/search`, {
            ids: workingItems.value.map(item => item.id)
        })
        .then(function (response) {
            response.data.forEach(item => {
                var permission = getPermissionItem(item.id);

                permission.working = permission.status !== item.status;
            });
        })
        .then(() => {
            setTimeout(() => {
                getWorkingPermissions();
            }, 1000);
        });
};

const refresh = () => {
    busy.value = true;

    api
        .get("permissions")
        .then(function (response) {
            items.value = response?.data;
        })
        .finally(function () {
            busy.value = false;
        });
}

const setStatus = (permission, button) => {
    permission.working = true;

    api
        .patch(`permissions/${permission.id}`, {
            status: button.value
        })
        .then(function () {
            useAlertStore().requestSent();
            getWorkingPermissions();
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
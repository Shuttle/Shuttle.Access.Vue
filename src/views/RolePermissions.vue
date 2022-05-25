<template>
    <div>
        <Title>{{ `${t("permissions")} - ${name}` }}</Title>
        <Table :fields="fields" :items="items" :busy="busy" striped>
            <template #item(active)="data">
                <div v-if="data.item.working" class="flex flex-row items-center justify-center">
                    <ClockIcon  class="sv-icon"/>
                </div>
                <Checkbox v-else v-model="data.item.active" @click="toggle(data.item)" />
            </template>
            <template #item(permission)="data">
                <span :class="!data.item.active ? 'text-gray-500' : ''">{{ data.item.permission }}</span>
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
import { computed, onMounted, reactive, ref } from "vue";
import { useI18n } from "vue-i18n";
import { useRoute } from 'vue-router';
import { useAlertStore } from "@/stores/alert";
import { ClockIcon } from "@heroicons/vue/outline";

const { t } = useI18n({ useScope: 'global' });
const alertStore = useAlertStore();

const id = ref(useRoute().params.id);
const name = ref('');
const rolePermissions = ref([]);
const permissions = ref([]);
const busy = ref();

const fields = [
    {
        text: "",
        name: "active",
        thClass: "w-1",
    },
    {
        text: t("permission"),
        name: "permission",
    }
];

const items = computed(() => {
    var result = [];

    Array.prototype.forEach.call(rolePermissions.value, (item) => {
        result.push(reactive({
            permission: item,
            active: true,
            working: false,
        }));
    });
    Array.prototype.forEach.call(
        permissions.value.filter((item) => {
            return !result.some((r) => r.permission == item);
        }),
        (item) => {
            result.push(reactive({
                permission: item.name,
                active: false,
                working: false,
            }));
        }
    );

    return result;
});

const refresh = () => {
    api.get(`roles/${id.value}`).then((response) => {
        name.value = response.data.name;
        rolePermissions.value = response.data.permissions;

        api.get("permissions").then((response) => {
            permissions.value = response.data;
        });
    });
};

const workingItems = computed(() => {
    return items.value.filter((item) => {
        return item.working;
    });
});

const workingCount = computed(() => {
    return workingItems.value.length;
});

const getPermissionItem = (permission) => {
    var result;

    Array.prototype.forEach.call(items.value, (item) => {
        if (result) {
            return;
        }

        if (item.permission === permission) {
            result = item;
        }
    });

    return result;
};

const getPermissionStatus = () => {
    if (workingCount.value === 0) {
        return;
    }

    api
        .post(`roles/${id.value}/permission-status`, {
            values: workingItems.value.map(item => item.permission)
        })
        .then(function (response) {
            Array.prototype.forEach.call(response.data, (status) => {
                const item = getPermissionItem(status.permission);
                
                item.working = status.active;
            });
        })
        .then(() => {
            setTimeout(() => {
                getPermissionStatus();
            }, 1000);
        });
};

const toggle = (item) => {
    if (item.working) {
        alertStore.working();
        return;
    }

    if (workingCount.value == 0) {
        startDateRegistered = new Date().toISOString();
    }

    item.working = true;

    api
        .patch(`roles/${id.value}/permissions`, {
            permission: item.permission,
            active: item.active,
        });

    getPermissionStatus();
}

onMounted(() => {
    refresh();
})
</script>
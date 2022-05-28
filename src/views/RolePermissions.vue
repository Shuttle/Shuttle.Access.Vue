<template>
    <div>
        <Title>{{ `${t("permissions")} - ${name}` }}</Title>
        <Table :fields="fields" :items="items" :busy="busy" striped>
            <template #item(active)="data">
                <div v-if="data.item.working" class="flex flex-row items-center justify-center">
                    <ClockIcon class="sv-icon" />
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
        name: "name",
    },
    {
        text: t("status"),
        name: "statusName",
    }
];

const items = computed(() => {
    var result = [];

    rolePermissions.value.forEach(item => {
        result.push(reactive({
            ...item,
            active: true,
            working: false,
        }));
    });
    permissions.value.filter((item) => {
        return !result.some((r) => r.id == item.id);
    }).forEach(item => {
        result.push(reactive({
            ...item,
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

const getPermissionItem = (id) => {
    return items.value.find(item => item.id === id) 
};

const getPermissionAvailability = () => {
    if (workingCount.value === 0) {
        return;
    }

    api
        .post(`roles/${id.value}/permissions/availability`, {
            values: workingItems.value.map(item => item.id)
        })
        .then(function (response) {
            response.data.forEach(availability => {
                getPermissionItem(availability.id).working = availability.active;
            });
        })
        .then(() => {
            setTimeout(() => {
                getPermissionAvailability();
            }, 1000);
        });
};

const toggle = (item) => {
    if (item.working) {
        alertStore.working();
        return;
    }

    item.working = true;

    api
        .patch(`roles/${id.value}/permissions`, {
            permissionId: item.id,
            active: item.active,
        });

    getPermissionAvailability();
}

onMounted(() => {
    refresh();
})
</script>
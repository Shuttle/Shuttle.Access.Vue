<template>
    <div>
        <Title>{{ `${t("roles")} - ${name}` }}</Title>
        <Table :fields="fields" :items="items" :busy="busy" striped>
            <template #item(active)="data">
                <div v-if="data.item.working" class="flex flex-row items-center justify-center">
                    <ClockIcon  class="sv-icon"/>
                </div>
                <Checkbox v-else v-model="data.item.active" @click="toggle(data.item)" />
            </template>
            <template #item(roleName)="data">
                <span :class="!data.item.active ? 'text-gray-500' : ''">{{ data.item.roleName }}</span>
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
const identityRoles = ref([]);
const roles = ref([]);
const busy = ref();

let startDateRegistered;

const fields = [
    {
        text: "",
        name: "active",
        thClass: "w-1",
    },
    {
        text: t("role-name"),
        name: "roleName",
    }
];

const items = computed(() => {
    var result = [];

    Array.prototype.forEach.call(identityRoles.value, (item) => {
        result.push(reactive({
            roleId: item.id,
            roleName: item.name,
            active: true,
            working: false,
        }));
    });
    Array.prototype.forEach.call(
        roles.value.filter((item) => {
            return !result.some((r) => r.roleId == item.id);
        }),
        (item) => {
            result.push(reactive({
                roleId: item.id,
                roleName: item.roleName,
                active: false,
                working: false,
            }));
        }
    );

    return result;
});

const refresh = () => {
    api.get(`identities/${id.value}`).then((response) => {
        name.value = response.data.name;
        identityRoles.value = response.data.roles;

        api.get("roles").then((response) => {
            roles.value = response.data;
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

const getRoleItem = (roleId) => {
    var result;

    Array.prototype.forEach.call(items.value, (item) => {
        if (result) {
            return;
        }

        if (item.roleId === roleId) {
            result = item;
        }
    });

    return result;
};

const getWorkingRoles = () => {
    if (workingCount.value === 0) {
        return;
    }

    api
        .post(`identities/${id.value}/role-status`, {
            values: workingItems.value.map(item => item.roleId)
        })
        .then(function (response) {
            Array.prototype.forEach.call(response.data, (status) => {
                const item = getRoleItem(status.roleId);
                
                item.working = status.active;
            });
        })
        .then(() => {
            setTimeout(() => {
                getWorkingRoles();
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
        .patch(`identities/${id.value}/roles/${item.roleId}`, {
            active: item.active,
        });

    getWorkingRoles();
}

onMounted(() => {
    refresh();
})
</script>
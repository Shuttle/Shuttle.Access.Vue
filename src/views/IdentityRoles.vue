<template>
    <div>
        <Title>{{ `${t("roles")} - ${name}` }}</Title>
        <Table :fields="fields" :items="items" :busy="busy" striped>
            <template #item(active)="data">
                <div v-if="data.item.working" class="flex flex-row items-center justify-center">
                    <ClockIcon class="sv-icon" />
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

    identityRoles.value.forEach(item => {
        result.push(reactive({
            roleId: item.id,
            roleName: item.name,
            active: true,
            working: false,
        }));
    });
    roles.value.filter((item) => {
        return !result.some((r) => r.roleId == item.id);
    }).forEach(item => {
        result.push(reactive({
            roleId: item.id,
            roleName: item.name,
            active: false,
            working: false,
        }));
    });

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

const getRoleItem = (id) => {
    return items.value.find(item => item.roleId === id);
};

const getWorkingRoles = () => {
    if (workingCount.value === 0) {
        return;
    }

    api
        .post(`identities/${id.value}/roles/availability`, {
            values: workingItems.value.map(item => item.roleId)
        })
        .then(function (response) {
            response.data.forEach(availability => {
                getRoleItem(availability.id).working = availability.active;
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
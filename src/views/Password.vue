<template>
    <Form size="sm" @submit.prevent="change()">
        <Title>{{ $t("change-password") }}</Title>
        <Input v-model="state.identityName" :label="$t('identity-name')" class="mb-2" :icon-start="UserIcon" readonly
            autocomplete="off" />
        <Input v-model="state.password" :label="$t('password')" :icon-start="ShieldExclamationIcon"
            :icon-end="getPasswordIcon()" icon-end-clickable @icon-end-click="togglePasswordIcon"
            :type="getPasswordType()" autocomplete="off">
        <template #message>
            <ValidationMessage :message="validation.message('password')" />
        </template>
        </Input>
        <div class="flex flex-row justify-end mt-4">
            <Button @click="change">{{ $t("change") }}</Button>
        </div>
    </Form>
</template>

<script setup>
import { EyeIcon, EyeOffIcon, ShieldExclamationIcon, UserIcon } from "@heroicons/vue/outline";
import { computed, onMounted, reactive, ref } from "vue";
import { useRoute } from 'vue-router';
import { required } from '@vuelidate/validators';
import { useValidation } from "@/composables/useValidation"
import { useAlertStore } from "@/stores/alert";
import { useSessionStore } from "@/stores/session";
import { useI18n } from "vue-i18n";
import api from "@/api";
import router from "@/router";

const { t } = useI18n({ useScope: 'global' });
const alertStore = useAlertStore();

const id = ref(useRoute().params.id);

const state = reactive({
    identityName: "",
    password: ""
});

const rules = computed(() => {
    return {
        identityName: {
            required
        },
        password: {
            required
        }
    }
});

const validation = useValidation(rules, state);

const passwordVisible = ref(false);

const getPasswordIcon = () => {
    return passwordVisible.value ? EyeIcon : EyeOffIcon;
}

const getPasswordType = () => {
    return passwordVisible.value ? "text" : "password";
}

const togglePasswordIcon = () => {
    passwordVisible.value = !passwordVisible.value;
}

const change = async () => {
    const sessionStore = useSessionStore();
    const errors = await validation.errors();

    if (errors.length) {
        return;
    }

    api.put("identities/password/change", {
        id: id.value === "token" ? undefined : id.value,
        token: id.value === "token" ? sessionStore.token : undefined,
        newPassword: state.password
    })
        .then(() => {
            router.push({ name: id.value === "token" ? "dashboard" : "identities" });

            alertStore.add({
                message: t("messages.password-changed"),
                variant: "success",
                name: "password-changed"
            });
        });
}

onMounted(() => {
    if (id.value === "token") {
        const sessionStore = useSessionStore();

        state.identityName = sessionStore.identityName;

        return;
    }

    api.get(`identities/${id.value}`)
        .then(response => { 
            state.identityName = response.data.name;
        });
})
</script>
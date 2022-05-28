<template>
    <Form size="sm" @submit.prevent="signIn()">
        <Title>{{ $t("sign-in") }}</Title>
        <Input v-model="state.identityName" :label="$t('identity-name')" class="mb-2" :icon-start="UserIcon"
            autocomplete="username">
        <template #message>
            <ValidationMessage :message="validation.message('identityName')" />
        </template>
        </Input>
        <Input v-model="state.password" :label="$t('password')" :icon-start="ShieldExclamationIcon"
            :icon-end="getPasswordIcon()" icon-end-clickable @icon-end-click="togglePasswordIcon"
            :type="getPasswordType()" autocomplete="current-password">
        <template #message>
            <ValidationMessage :message="validation.message('password')" />
        </template>
        </Input>
        <div class="flex flex-row justify-end mt-4">
            <Button @click="signIn">{{ $t("sign-in") }}</Button>
        </div>
    </Form>
</template>

<script setup>
import { EyeIcon, EyeOffIcon, ShieldExclamationIcon, UserIcon } from "@heroicons/vue/outline";
import { computed, reactive, ref } from "vue";
import { required } from '@vuelidate/validators';
import { useValidation } from "@/composables/useValidation"
import { useAlertStore } from "@/stores/alert";
import { useSessionStore } from "@/stores/session";
import { useI18n } from "vue-i18n";
import router from "@/router";

const { t } = useI18n({ useScope: 'global' });
const alertStore = useAlertStore();

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

const signIn = async () => {
    const sessionStore = useSessionStore();
    const errors = await validation.errors();

    if (errors.length) {
        return;
    }

    sessionStore.signIn({
        identityName: state.identityName,
        password: state.password
    })
        .then(() => {
            router.push({ name: "dashboard" });

            alertStore.remove("session-initialize");
        })
        .catch(error => {
            alertStore.add({
                message: error.response?.status == 400 ? t("exceptions.invalid-credentials") : error.toString(),
                variant: "danger"
            });
        });
}
</script>
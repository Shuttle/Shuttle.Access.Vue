<template>
    <Form size="sm" @submit.prevent="submit()">
        <Title>{{ $t("identity") }}</Title>
        <Input v-model="state.identityName" :label="$t('identity-name')" class="mb-2" :icon-start="UserIcon"
            autocomplete="username" :alert="validation.validate('identityName')" />
        <Input v-model="state.password" :label="$t('password')" :icon-start="ShieldExclamationIcon"
            :icon-end="getPasswordIcon()" icon-end-clickable @icon-end-click="togglePasswordIcon"
            :type="getPasswordType()" autocomplete="current-password" :alert="validation.validate('password')" />
        <div class="flex flex-row justify-end mt-4">
            <Button @click="submit">{{ $t("register") }}</Button>
        </div>
    </Form>
</template>

<script setup>
import { EyeIcon, EyeOffIcon, ShieldExclamationIcon, UserIcon } from "@heroicons/vue/outline";
import { computed, reactive, ref } from "vue";
import { required } from '@vuelidate/validators';
import { useValidation } from "@/composables/useValidation"
import { useAlertStore } from "@/stores/alert";
import { useI18n } from "vue-i18n";
import router from "@/router";
import api from "@/api";

const { t } = useI18n({ useScope: 'global' });

const state = reactive({
    identityName: "",
    password: ""
});

const rules = computed(() => {
    return {
        identityName: {
            required
        },
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

const submit = async () => {
    const errors = await validation.errors();

    if (errors.length) {
        return;
    }

    api
        .post("identities", {
            name: state.identityName,
            password: state.password,
            system: "system://access"
        })
        .then(function () {
            useAlertStore().add({
                message: t("messages.request-sent"),
            });

            router.push({ name: "identities" });
        });
}
</script>
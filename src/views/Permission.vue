<template>
    <div>
        <Form size="sm" @submit.prevent="submit()">
            <Title>{{ $t("permission") }}</Title>
            <Input v-model="state.permission" :label="$t('permission')" class="mb-2" :alert="validation.validate('permission')" />
            <div class="flex flex-row justify-end mt-4">
                <Button @click="submit">{{ $t("save") }}</Button>
            </div>
        </Form>
    </div>
</template>

<script setup>
import { computed, reactive } from "vue";
import { required } from '@vuelidate/validators';
import { useValidation } from "@/composables/useValidation"
import { useAlertStore } from "@/stores/alert";
import api from "@/api";

const state = reactive({
    permission: "",
});

const rules = computed(() => {
    return {
        permission: {
            required
        },
    }
});

const validation = useValidation(rules, state);

const submit = async () => {
    const errors = await validation.errors();

    if (errors.length) {
        return;
    }

    api
        .post("permissions", {
            permission: state.permission,
        })
        .then(function () {
            useAlertStore().requestSent();
        });
}
</script>
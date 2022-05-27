<template>
    <div>
        <Form size="sm" @submit.prevent="submit()">
            <Title>{{ $t("role") }}</Title>
            <Input v-model="state.name" :label="$t('name')" class="mb-2">
            <template #message>
                <ValidationMessage :message="validation.message('name')" />
            </template>
            </Input>
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
    name: "",
});

const rules = computed(() => {
    return {
        name: {
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
        .post("roles", {
            name: state.name,
        })
        .then(function () {
            useAlertStore().requestSent();
        });
}
</script>
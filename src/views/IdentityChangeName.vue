<template>
    <div>
        <Form size="sm" @submit.prevent="submit()">
            <Title>{{ $t("identity") }}</Title>
            <Input v-model="state.current" :label="$t('name')" class="mb-2" readonly />
            <Input v-model="state.name" :label="$t('new-value')" class="mb-2" :alert="validation.validate('name')" />
            <div class="flex flex-row justify-end mt-4">
                <Button @click="submit" :disabled="same">{{ $t("save") }}</Button>
            </div>
        </Form>
    </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from "vue";
import { required } from '@vuelidate/validators';
import { useRoute } from 'vue-router';
import { useValidation } from "@/composables/useValidation"
import { useAlertStore } from "@/stores/alert";
import api from "@/api";

const id = ref(useRoute().params.id);
const hasRole = computed(() => {
    return !!id.value;
});

const same = computed(() => {
    return state.current === state.name;
})

const state = reactive({
    current: "",
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
        .patch(`identities/${id.value}/name`, {
            name: state.name,
        })
        .then(function () {
            useAlertStore().requestSent();
        });
}

onMounted(() => {
    if (!hasRole.value) {
        return;
    }

    api.get(`identities/${id.value}`)
        .then(item => {
            state.current = item.data.name;
            state.name = item.data.name;
        });
})
</script>
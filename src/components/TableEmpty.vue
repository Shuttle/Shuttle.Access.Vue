<template>
    <div class="p-6 text-center">
        {{ t("table-empty") }}
    </div>
</template>

<script setup>
import { useI18n } from "vue-i18n";

const { t } = useI18n({ useScope: 'global' });
</script>
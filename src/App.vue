<script setup>
import Navbar from "@/components/Navbar.vue";
import { RouterView } from "vue-router";
import { useAlertStore } from "@/stores/alert";

var alertStore = useAlertStore();

</script>

<template>
    <Navbar />
    <Alerts v-if="alertStore.alerts.length" :alerts="alertStore.alerts"
        :sv-class="{ 'sv-alerts': 'm-2 pt-2', 'sv-alert': 'mb-2' }" />
    <div class="p-4">
        <RouterView />
    </div>
</template>

<style>
@import "@/assets/base.css";
</style>

<script setup>
import Navbar from "@/components/Navbar.vue";
import { RouterView } from "vue-router";
import { useAlertStore } from "@/stores/alert";
import { useConfirmationStore } from "@/stores/confirmation";

var alertStore = useAlertStore();
var confirmationStore = useConfirmationStore();
</script>

<template>
    <Navbar />
    <Alerts v-if="alertStore.alerts.length" :alerts="alertStore.alerts"
        :sv-class="{ 'sv-alerts': 'mx-4 mt-2 pt-2', 'sv-alert': 'mb-2' }" @remove="alertStore.remove" />
    <div class="p-4">
        <RouterView v-slot="{ Component, route }">
            <transition name="route" mode="out-in">
                <component :is="Component" :key="route.fullpath"></component>
            </transition>
        </RouterView>
    </div>
    <Dialog :isOpen="confirmationStore.isOpen" :setIsOpen="confirmationStore.setIsOpen" title="Confirmation"
        message="Are you sure that you would like to delete the selected item(s)?">
        <div class="flex flex-row items-center justify-end mt-4">
            <Button variant="danger" class="mr-2 w-20 justify-center"
                @click="confirmationStore.confirmed()">Yes</Button>
            <Button variant="secondary" class="w-20 justify-center"
                @click="confirmationStore.setIsOpen(false)">Cancel</Button>
        </div>
    </Dialog>
</template>

<style>
@import "@/assets/base.css";
</style>

import { defineStore } from "pinia";

export const useConfirmationStore = defineStore("confirmation", {
    state: () => {
        return {
            item: undefined,
            isOpen: false,
            callback: undefined
        }
    },
    actions: {
        show(item, callback) {
            if (!item) {
                throw new Error("The 'item' argument may not be undefined.");
            }

            if (typeof callback !== "function") {
                throw new Error("The 'callback' argument must be a function.");
            }

            this.item = item;
            this.callback = callback;

            this.setIsOpen(true);
        },
        setIsOpen(open) {
            this.isOpen = open;
        },
        confirmed() {
            if (typeof this.callback !== "function") {
                throw new Error("The 'callback' state must be a function.");
            }

            this.callback(this.item);
        }
    },
});

import { defineStore } from "pinia";

export const useAlertStore = defineStore("alert", {
    state: () => {
        return {
            alerts: [],
        }
    },
    actions: {
        add(alert) {
            if (!alert || !alert.message) {
                return;
            }

            if (alert.key || alert.name) {
                this.remove(alert);
            }

            alert.expire = alert.expire ?? true;

            if (alert.expire) {
                let expiryDate = new Date();

                expiryDate.setSeconds(expiryDate.getSeconds() + 10);

                alert.expiryDate = expiryDate;
            }

            this.alerts.push(alert);

            if (this.alerts.length == 1) {
                this._monitor();
            }
        },
        remove(alert) {
            if (!alert?.key) {
                return false;
            }

            const index = this.alerts.findIndex(item => item.key === alert.key);

            if (index < 0) {
                return false;
            }

            this.alerts.splice(index, 1);

            return true;
        },
        _monitor() {
            const self = this;
            const date = new Date();

            if (!this.alerts?.length) {
                return;
            }

            this.alerts = this.alerts.filter(item => {
                return (item.expire && item.expiryDate && item.expiryDate < date) ? undefined : alert;
            });

            setTimeout(function () {
                self._monitor();
            }, 500);
        }
    },
});

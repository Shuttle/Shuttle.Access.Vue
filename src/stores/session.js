import { defineStore } from "pinia";
import axios from "axios";
import configuration from "@/configuration";
import guard from "shuttle-guard";

export let messages = {
    missingCredentials: "Incomplete credentials specified.",
    signInFailure: "Invalid credentials.",
    invalidSession: "Invalid session."
};

export const useSessionStore = defineStore("session", {
    state: () => {
        return {
            authenticated: false,
            initialized: false,
            identityName: "",
            token: "",
            permissions: []
        }
    },
    actions: {
        async initialize() {
            var self = this;

            if (this.initialized) {
                return;
            }

            const identityName = localStorage.getItem("shuttle-access.identityName");
            const token = localStorage.getItem("shuttle-access.token");

            if (!!identityName && !!token) {
                return self.signIn({ identityName: identityName, token: token })
                    .then(function (response) {
                        self.initialized = true;

                        return response;
                    });
            }

            return Promise.resolve();
        },
        addPermission(type, permission) {
            if (this.hasPermission(permission)) {
                return;
            }

            this.permissions.push({ type: type, permission: permission });
        },
        register(session) {
            const self = this;

            if (!session ||
                !session.identityName ||
                !session.token ||
                !session.permissions) {
                throw Error(messages.invalidSession)
            }

            localStorage.setItem('shuttle-access.identityName', session.identityName);
            localStorage.setItem('shuttle-access.token', session.token);

            self.identityName = session.identityName;
            self.token = session.token;

            self.removePermissions('identity');

            session.permissions.forEach(function (item) {
                self.addPermission('identity', item);
            });

            this.authenticated = true;
        },
        async signIn(credentials) {
            var self = this;

            return new Promise((resolve, reject) => {
                if (!credentials || !credentials.identityName || !(!!credentials.password || !!credentials.token)) {
                    reject(new Error(messages.missingCredentials));
                    return;
                }

                return axios.post(configuration.getApiUrl('sessions'), {
                    identityName: credentials.identityName,
                    password: credentials.password,
                    token: credentials.token
                })
                    .then(function (response) {
                        guard.againstUndefined(response, 'response');
                        guard.againstUndefined(response.data, 'response.data');

                        const data = response.data;

                        self.register({
                            identityName: credentials.identityName,
                            token: data.token,
                            permissions: data.permissions
                        });

                        self.isIdentityRequired = false;

                        resolve(response);
                    })
                    .catch(function (error) {
                        reject(error);
                    });
            });
        },
        signOut() {
            this.identityName = undefined;
            this.token = undefined;

            localStorage.removeItem('shuttle-access.identityName');
            localStorage.removeItem('shuttle-access.token');

            this.removePermissions('identity');
        },
        removePermissions(type) {
            this.permissions = this.permissions.filter(function (item) {
                return item.type !== type;
            });
        },
        hasSession() {
            return !!this.token;
        },
        hasPermission(permission) {
            var result = false;
            var permissionCompare = permission.toLowerCase();

            this.permissions.forEach(function (item) {
                if (result) {
                    return;
                }

                result = item.permission === '*' || item.permission.toLowerCase() === permissionCompare;
            });

            return result;
        }
    },
    getters: {
        get status() {
            return this.isIdentityRequired ? 'identity-required' : !this.token ? 'not-signed-in' : 'signed-in';
        }
    }
})
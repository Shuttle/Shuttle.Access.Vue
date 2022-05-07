import { createRouter, createWebHistory } from "vue-router";
import { useSessionStore } from "@/stores/session";
import { useAlertStore } from "@/stores/alert";

export let messages = {
    insufficientPermission: "You do not have permission to access the requested view.  Please contact your system administrator if you require access.",
}

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
        {
            path: '/signin',
            name: 'sign-in',
            component: () => import('../views/SignIn.vue')
        },
        {
            path: "/dashboard",
            name: "dashboard",
            component: () => import('../views/Dashboard.vue')
        },
        {
            path: "/identities",
            name: "identities",
            component: () => import('../views/Identities.vue')
        },
        {
            path: "/identity",
            name: "identity",
            component: () => import('../views/Identity.vue')
        },
        {
            path: '/identities/:id/roles',
            name: 'identity-roles',
            component: () => import('../views/IdentityRoles.vue'),
            meta: {
                permission: 'access://identity/view'
            }
        }, {
            path: "/roles",
            name: "roles",
            component: () => import('../views/Roles.vue')
        },
        {
            path: "/permissions",
            name: "permissions",
            component: () => import('../views/Permissions.vue')
        },
    ],
});

router.beforeEach(async (to, from, next) => {
    const sessionStore = useSessionStore();

    if (!sessionStore.initialized) {
        return next();
    }

    if (!!to.meta.permission && !sessionStore.hasPermission(to.meta.permission)) {
        useAlertStore().add({
            message: messages.insufficientPermission,
            variant: "info"
        })

        return false;
    }

    if (!!to.meta.authenticated && !sessionStore.authenticated && to.name !== 'login') {
        return { name: "login" }
    }

    return next();
})

export default router;

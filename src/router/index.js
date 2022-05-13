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
            component: () => import('../views/Identities.vue'),
            meta: {
                permission: 'access://identity/view'
            }
        },
        {
            path: "/identity",
            name: "identity",
            component: () => import('../views/Identity.vue'),
            meta: {
                permission: 'access://identity/manage'
            }
        },
        {
            path: "/identity/:id/change-name",
            name: "identity-change-name",
            component: () => import('../views/IdentityChangeName.vue'),
            meta: {
                permission: 'access://identities/manage'
            }
        },
        {
            path: '/identities/:id/roles',
            name: 'identity-roles',
            component: () => import('../views/IdentityRoles.vue'),
            meta: {
                permission: 'access://identity/view'
            }
        }, 
        {
            path: "/roles",
            name: "roles",
            component: () => import('../views/Roles.vue'),
            meta: {
                permission: 'access://roles/view'
            }
        },
        {
            path: "/role",
            name: "role",
            component: () => import('../views/Role.vue'),
            meta: {
                permission: 'access://roles/manage'
            }
        },
        {
            path: "/role/:id/change-name",
            name: "role-change-name",
            component: () => import('../views/RoleChangeName.vue'),
            meta: {
                permission: 'access://roles/manage'
            }
        },
        {
            path: '/roles/:id/permissions',
            name: 'role-permissions',
            component: () => import('../views/RolePermissions.vue'),
            meta: {
                permission: 'access://roles/manage'
            }
        },
        {
            path: "/permissions",
            name: "permissions",
            component: () => import('../views/Permissions.vue'),
            meta: {
                permission: 'access://permissions/view'
            }
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

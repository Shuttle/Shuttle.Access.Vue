import Vue from 'vue'
import Router from 'vue-router'
import access from './access';
import store from './store';
import i18n from './i18n';

Vue.use(Router)

const router = new Router({
    mode: 'history',
    base: process.env.BASE_URL,
    routes: [
        {
            path: '/dashboard',
            name: 'dashboard',
            component: () => import(/* webpackChunkName: "dashboard" */ './views/Dashboard.vue')
        },
        {
            path: '/login',
            name: 'login',
            component: () => import(/* webpackChunkName: "login" */ './views/Login.vue')
        },
        {
            path: '/roles',
            name: 'roles',
            component: () => import(/* webpackChunkName: "roles" */ './views/Roles.vue'),
            meta: {
                permission: 'access://roles/view'
            }
        },
        {
            path: '/roles/:id/permissions',
            name: 'role-permissions',
            props: true,
            component: () => import(/* webpackChunkName: "role-permissions" */ './views/RolePermissions.vue'),
            meta: {
                permission: 'access://roles/manage'
            }
        },
        {
            path: '/identities',
            name: 'identities',
            component: () => import(/* webpackChunkName: "identities" */ './views/Identities.vue'),
            meta: {
                permission: 'access://identity/view'
            }
        },
        {
            path: '/identities/:id/roles',
            name: 'identity-roles',
            component: () => import(/* webpackChunkName: "identity-roles" */ './views/IdentityRoles.vue'),
            meta: {
                permission: 'access://identity/view'
            }
        },
        {
            path: '/permissions',
            name: 'permissions',
            component: () => import(/* webpackChunkName: "permissions" */ './views/Permissions.vue'),
            meta: {
                permission: 'access://permissions/view'
            }
        },
        {
            path: '/profile',
            name: 'profile',
            component: () => import(/* webpackChunkName: "profile" */ './views/Profile.vue'),
            meta: {
                requiresAuthentication: true
            }
        },
        {
            path: '/register',
            name: 'register',
            component: () => import(/* webpackChunkName: "register" */ './views/Register.vue')
        },
        {
            path: '/password/:token?',
            name: 'password',
            component: () => import(/* webpackChunkName: "password" */ './views/Password.vue'),
            meta: {
                requiresAuthentication: true
            }
        },
    ]
})

router.beforeEach((to, from, next) => {
    store.dispatch("clearSecondaryNavbarItems");

    if (!access.initialized) {
        return;
    }

    if ((to.meta.permission || to.meta.requiresAuthentication) && access.loginStatus !== 'logged-in') {
        router.push({ path: '/login' });
    } else if (to.fullPath === '/login' && access.loginStatus === 'logged-in') {
        router.push({ path: '/dashboard' });
    } else if ((to.meta.permission && !access.hasPermission(to.meta.permission))) {
        store.dispatch("addAlert", {
            message: i18n.t("permission-required"),
        });

        router.push({ path: '/dashboard' });
    }
    else {
        next();
    }
});

export default router;
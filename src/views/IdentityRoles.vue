<template>
  <div>
    <s-title :text="title" />
    <b-table :items="roles" :fields="fields" dark responsive="md">
      <template v-slot:cell(active)="data">
        <font-awesome-icon v-if="data.item.working" icon="hourglass" />
        <b-form-checkbox v-else v-model="data.item.active" switch @input="toggle(data.item)" />
      </template>
      <template v-slot:cell(role)="data">
        <span :class="!data.item.active ? 'text-muted' : ''">{{data.item.role}}</span>
      </template>
    </b-table>
  </div>
</template>

<script>
export default {
  name: "IdentityRoles",
  data() {
    return {
      identityId: "",
      name: "",
      identityRoles: [],
      roles: [],
      fields: []
    };
  },
  computed: {
    title() {
      return (
        this.$i18n.t("identities") +
        (this.name ? " - " + this.name : "")
      );
    },
    workingItems() {
      return this.roles.filter(function (item) {
        return item.working;
      });
    },
    workingCount() {
      return this.workingItems.length;
    },
  },
  methods: {
    toggle(item) {
      var self = this;

      if (item.working) {
        self.$store.dispatch("addAlert", {
          message: self.$i18n.t("working-message"),
          name: "working-message",
        });
        return;
      }

      item.working = true;

      this.$api
        .post("identities/setrole", {
          identityId: this.identityId,
          roleId: item.roleId,
          active: item.active,
        })
        .then(function(response){
          if (!response.data.success){
            item.active = !item.activel
            item.working = false;
            self.$store.dispatch("addAlert", {
              message: self.$i18n.t(response.data.failureReason)
            });
          }
        })
        .finally(function () {
          self.working = false;
        });

      this.getRoleStatus();
    },

    getRoleItem(roleId) {
      var result;

      Array.prototype.forEach.call(this.roles, (item) => {
        if (result) {
          return;
        }

        if (item.roleId === roleId) {
          result = item;
        }
      });

      return result;
    },

    getRoleStatus() {
      var self = this;

      if (this.workingCount === 0) {
        return;
      }

      var data = {
        identityId: self.identityId,
        roleIds: [],
      };

      Array.prototype.forEach.call(this.workingItems, (item) => {
        data.roleIds.push(item.roleId);
      });

      this.$api
        .post("identities/rolestatus", data)
        .then(function (response) {
          Array.prototype.forEach.call(response.data, (item) => {
            const roleItem = self.getRoleItem(item.roleId);

            if (!roleItem) {
              return;
            }

            roleItem.working = !(roleItem.active === item.active);
          });
        })
        .then(function () {
          setTimeout(function () {
            self.getRoleStatus.call(self);
          }, 1000);
        });
    },

    applyRoles() {
      var roles = [];

      Array.prototype.forEach.call(this.identityRoles, (item) => {
        roles.push({
          roleId: item.id,
          roleName: item.name,
          active: true,
          working: false,
        });
      });
      Array.prototype.forEach.call(
        this.roles.filter((item) => {
          return !roles.some((r) => r.roleId == item.id);
        }),
        (item) => {
          roles.push({
            roleId: item.id,
            roleName: item.roleName,
            active: false,
            working: false,
          });
        }
      );

      this.roles = roles;
    },
    refresh() {
      const self = this;

      this.$api.get("identities/" + this.identityId).then(function (response) {
        self.identityId = response.data.id;
        self.name = response.data.name;
        self.identityRoles = response.data.roles;

        self.$api.get("roles").then(function (response) {
          self.roles = response.data;
          self.applyRoles();
        });
      });
    },
  },
  beforeMount() {
    this.identityId = this.$route.params.id;

    this.fields = [
      {
        label: "",
        key: "active",
        class: "text-center"
      },
      {
        key: "roleName",
        label: this.$i18n.t("role-name"),
        class: "col",
      },
    ];
  },
  mounted() {
    this.refresh();
  },
};
</script>
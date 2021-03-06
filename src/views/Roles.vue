<template>
  <div>
    <s-title :text="$t('roles')" />
    <b-form
      @submit="add"
      class="my-2"
      v-if="$access.hasPermission('access://roles/manage')"
    >
      <b-input-group>
        <b-input-group-prepend>
          <b-button variant="outline-primary" @click="add">
            <font-awesome-icon icon="plus-square" />
          </b-button>
        </b-input-group-prepend>
        <b-form-input v-model="form.roleName"></b-form-input>
      </b-input-group>
    </b-form>
    <b-table
      :items="items"
      :fields="fields"
      dark
      stacked="md"
      :busy="working"
      show-empty
      :empty-text="$t('messages.no-items')"
    >
      <template #table-busy>
        <s-working />
      </template>
      <template v-slot:cell(permissions)="data">
        <b-button
          variant="outline-primary"
          @click="permissions(data.item)"
          size="sm"
          :disabled="!$access.hasPermission('access://roles/manage')"
          ><font-awesome-icon icon="shield-alt"
        /></b-button>
      </template>
      <template v-slot:cell(remove)="data">
        <b-button
          variant="outline-danger"
          v-b-modal.modal-confirmation
          size="sm"
          @click="selectRole(data.item)"
          :disabled="!$access.hasPermission('access://roles/manage')"
        >
          <font-awesome-icon icon="trash-alt" />
        </b-button>
      </template>
    </b-table>
    <b-modal
      id="modal-confirmation"
      :title="$t('confirmation-remove.title')"
      button-size="sm"
      :ok-title="$t('ok')"
      :cancel-title="$t('cancel')"
      @ok="remove"
    >
      <p>{{ $t("confirmation-remove.message") }}</p>
    </b-modal>
  </div>
</template>

<script>
import { required } from "vuelidate/lib/validators";

export default {
  name: "Roles",
  data() {
    return {
      items: [],
      fields: [],
      selectedRole: Object,
      working: false,
      form: {
        roleName: "",
      },
    };
  },
  validations: {
    form: {
      roleName: {
        required,
      },
    },
  },
  methods: {
    permissions(data) {
      this.$router.push({ name: "role-permissions", params: { id: data.id } });
    },
    refresh() {
      const self = this;

      this.working = true;

      this.$api
        .get("roles")
        .then(function (response) {
          self.items = response.data;
        })
        .finally(function () {
          self.working = false;
        });
    },
    add(evt) {
      const self = this;

      evt.preventDefault();

      if (this.$v.$invalid) {
        return;
      }

      this.$api
        .post("roles", {
          name: this.form.roleName,
        })
        .then(function () {
          self.$store.dispatch("addAlert", {
            message: self.$i18n.t("messages.request-sent"),
          });
        });
    },
    remove() {
      const self = this;

      this.$api.delete(`roles/${this.selectedRole.id}`).then(function () {
        self.$store.dispatch("addAlert", {
          message: self.$i18n.t("messages.request-sent"),
        });
      });
    },
    selectRole(item) {
      this.selectedRole = item;
    },
  },
  beforeMount() {
    const self = this;

    this.fields = [
      {
        label: "",
        key: "permissions",
      },
      {
        label: "",
        key: "remove",
      },
      {
        label: this.$i18n.t("role-name"),
        key: "roleName",
        thClass: "col",
      },
    ];

    this.$store.dispatch("addSecondaryNavbarItem", {
      icon: "sync-alt",
      click() {
        self.refresh();
      },
    });
  },
  mounted() {
    this.refresh();
  },
};
</script>

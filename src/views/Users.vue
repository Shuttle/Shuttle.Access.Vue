<template>
  <div>
    <s-title :text="$t('users')" />
    <b-form
      @submit="add"
      class="my-2"
      v-if="$access.hasPermission('access://users/manage')"
    >
      <b-input-group>
        <b-input-group-prepend>
          <b-button variant="outline-primary" @click="add">
            <font-awesome-icon icon="plus-square" />
          </b-button>
        </b-input-group-prepend>
        <b-form-input v-model="form.username"></b-form-input>
      </b-input-group>
    </b-form>
    <b-table
      :items="items"
      :fields="fields"
      dark
      small
      stacked="md"
      :busy="working"
      show-empty
      :empty-text="$t('messages.no-items')"
    >
      <template #table-busy>
        <s-working />
      </template>
      <template v-slot:cell(roles)="data">
        <b-button
          variant="outline-primary"
          @click="roles(data.item)"
          size="sm"
          :disabled="!$access.hasPermission('access://users/manage')"
        >
          <font-awesome-icon icon="user-circle" />
        </b-button>
      </template>
      <template v-slot:cell(remove)="data">
        <b-button
          variant="outline-danger"
          v-b-modal.modal-confirmation
          size="sm"
          @click="selectUser(data.item)"
          :disabled="!$access.hasPermission('access://users/manage')"
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
import formatter from "../formatter";

export default {
  name: "Users",
  data() {
    return {
      items: [],
      fields: [],
      selectedUser: Object,
      working: false,
      form: {
        username: "",
      },
    };
  },
  validations: {
    form: {
      username: {
        required,
      },
    },
  },
  methods: {
    roles(data) {
      this.$router.push({ name: "user-roles", params: { id: data.id } });
    },
    refresh() {
      const self = this;

      this.working = true;

      this.$api
        .get("users")
        .then(function (response) {
          if (!response || !response.data) {
            return;
          }

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
        .post("users", {
          username: this.form.username,
        })
        .then(function () {
          self.$store.dispatch("addAlert", {
            message: self.$i18n.t("request-sent"),
          });
        });
    },
    remove() {
      const self = this;

      this.$api.delete(`users/${this.selectedUser.id}`).then(function () {
        self.$store.dispatch("addAlert", {
          message: self.$i18n.t("request-sent"),
        });
      });
    },
    selectUser(item) {
      this.selectedUser = item;
    },
  },
  beforeMount() {
    const self = this;

    this.fields = [
      {
        label: "",
        key: "roles",
        thClass: "button",
      },
      {
        label: "",
        key: "remove",
        thClass: "button",
      },
      {
        label: this.$i18n.t("username"),
        key: "username",
      },
      {
        label: this.$i18n.t("date-registered"),
        key: "dateRegistered",
        formatter: formatter.date,
      },
      {
        label: this.$i18n.t("registered-by"),
        key: "registeredBy",
      },
      {
        label: this.$i18n.t("date-activated"),
        key: "dateActivated",
        formatter: formatter.date,
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

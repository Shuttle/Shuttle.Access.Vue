<template>
  <div>
    <s-title :text="$t('users')" />
    <s-working v-if="working" />
    <b-form @submit="add" class="my-2" v-if="$access.hasPermission('access://users/manage')">
      <b-input-group>
        <b-input-group-prepend>
          <b-button variant="outline-primary" @click="add">
            <font-awesome-icon icon="plus-square" />
          </b-button>
        </b-input-group-prepend>
        <b-form-input v-model="form.username"></b-form-input>
      </b-input-group>
    </b-form>
    <b-table v-if="showResults" :items="items" :fields="fields" dark small stacked="md">
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
    <b-alert
      v-if="showResultsEmpty"
      show
      variant="info"
      class="mt-2 text-center"
      >{{ $t("messages.no-items") }}</b-alert
    >
  </div>
</template>

<script>
import { required } from "vuelidate/lib/validators";
import formatter from "../formatter";

export default {
  name: "Users",
  data() {
    return {
      items: Array,
      fields: Array,
      selectedUser: Object,
      working: false,
      form: {
        username: "",
      },
    };
  },
  computed: {
    hasItems() {
      return this.items && this.items.length > 0;
    },
    showResults() {
      return this.hasItems && !this.working;
    },
    showResultsEmpty() {
      return !this.hasItems && !this.working;
    },
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

      this.$api.get("users").then(function (response) {
        if (!response || !response.data) {
          return;
        }

        self.items = response.data;
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
      }
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

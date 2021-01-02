<template>
  <div>
    <s-title :text="$t('permissions')" />
    <b-form
      class="my-2"
      @submit="add"
      v-if="$access.hasPermission('access://permission/manage')"
    >
      <b-input-group>
        <b-input-group-prepend>
          <b-button variant="outline-primary" @click="add">
            <font-awesome-icon icon="plus-square" />
          </b-button>
        </b-input-group-prepend>
        <b-form-input v-model="form.permission"></b-form-input>
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
      <template v-slot:cell(remove)="data">
        <b-button
          variant="outline-danger"
          v-b-modal.modal-confirmation
          size="sm"
          @click="selectItem(data.item)"
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

export default {
  name: "Users",
  data() {
    return {
      items: [],
      fields: [],
      selectedItem: Object,
      working: false,
      form: {
        permission: "",
      },
    };
  },
  validations: {
    form: {
      permission: {
        required,
      },
    },
  },
  methods: {
    refresh() {
      const self = this;

      this.working = true;

      this.$api
        .get("permissions")
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
        .post("permissions", {
          permission: this.form.permission,
        })
        .then(function () {
          self.refresh();
        });
    },
    remove() {
      const self = this;

      this.$api
        .delete("permissions", {
          data: self.selectedItem,
        })
        .then(function () {
          self.refresh();
        });
    },
    selectItem(item) {
      this.selectedItem = item;
    },
  },
  beforeMount() {
    const self = this;

    this.fields = [
      {
        label: "",
        key: "remove",
      },
      {
        label: this.$i18n.t("permission"),
        key: "permission",
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

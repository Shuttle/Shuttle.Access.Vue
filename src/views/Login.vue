<template>
  <div class="container-fluid">
    <div class="row">
      <div class="col"></div>
      <div class="col-xl-3 col-lg-4 col-md-5 mx-auto p-0 mt-5 mb-5">
        <s-title :text="$t('login')" />
        <b-form @submit="login" v-if="show" class="w-100">
          <b-form-group
            id="input-group-name"
            :label="$t('name')"
            label-for="input-name"
          >
            <b-form-input
              id="input-name"
              v-model="form.name"
              required
              class="mb-2"
            ></b-form-input>
          </b-form-group>

          <b-form-group
            id="input-group-password"
            :label="$t('password')"
            label-for="input-password"
          >
            <b-form-input
              id="input-password"
              v-model="form.password"
              required
              class="mb-2"
              type="password"
            ></b-form-input>
          </b-form-group>

          <div>
            <b-button
              class="float-right"
              variant="primary"
              type="submit"
              :disabled="working"
            >
              <font-awesome-icon
                icon="circle-notch"
                class="fa-spin mr-2"
                v-if="working"
              />
              {{ $t("login") }}
            </b-button>
          </div>
        </b-form>
      </div>
      <div class="col"></div>
    </div>
  </div>
</template>

<script>
import router from "../router";
import { required } from "vuelidate/lib/validators";

export default {
  data() {
    return {
      form: {
        name: "",
        password: "",
      },
      show: true,
    };
  },
  validations: {
    form: {
      name: {
        required,
      },
      password: {
        required,
      },
    },
  },
  computed: {
    working() {
      return this.$store.state.working;
    },
  },
  methods: {
    login(evt) {
      evt.preventDefault();

      if (this.$v.$invalid) {
        return;
      }

      this.$store
        .dispatch("login", {
          identityName: this.form.name,
          password: this.form.password,
        })
        .then(function (response) {
          if (response.authenticated) {
            router.push("/dashboard");
          }
        });
    },
    register() {
      router.replace("/register");
    },
  },
};
</script>
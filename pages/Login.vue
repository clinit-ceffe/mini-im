<template>
  <div class="context" ref="context">
    <a-card title="登陆" :bordered="false" class="login-wrap">
      <a-form
        :model="formState"
        name="normal_login"
        class="login-form"
        @submit="onSubmit"
        :form="form"
      >
        <a-form-item
          label="账号"
          name="username"
          :rules="[{ required: true, message: 'Please input your username!' }]"
        >
          <a-input v-model="formState.userName" placeholder="登陆账号">
          </a-input>
        </a-form-item>

        <a-form-item
          label="密码"
          name="password"
          :rules="[{ required: true, message: 'Please input your password!' }]"
        >
          <a-input-password
            v-model:value="formState.password"
            placeholder="登陆密码"
          >
          </a-input-password>
        </a-form-item>

        <a-form-item>
          <a-button type="primary" style="width: 100%" htmlType="submit"
            >登陆</a-button
          >
        </a-form-item>
      </a-form>
    </a-card>
  </div>
</template>

<script>
export default {
  name: "Login",
  data() {
    return {
      form: this.$form.createForm(this),
      formState: {
        userName: null,
        password: null,
      },
    };
  },
  mounted(){
  },
  methods: {
    onSubmit(e) {
      e.preventDefault();
      this.form.validateFields((err) => {
        if (!err) {
          this.$axios
            .$get(
              "/api/user/login?account=" +
                this.formState.userName +
                "&password=" +
                this.formState.password
            )
            .then((resp) => {
              if (resp) {
                this.$auth.$storage.setLocalStorage(
                  "userInfo",
                  JSON.stringify(resp)
                );
                console.log("用户信息已缓存", resp);
                this.$router.push("/");
              } else {
                alert("登陆失败！");
              }
            });
        }
      });
    }
  },
};
</script>
<style scoped>
body {
  background: #ccc;
}

.context {
  width: 100%;
  display: flex;
  flex: 1;
  margin: 0;
  height: 100%;
  background: #ccc;
}

.login-wrap {
  width: 400px;
  height: 400px;
  margin: 100px auto;
  border-radius: 8px;
}
</style>
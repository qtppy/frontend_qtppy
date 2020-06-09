<template>
  <section>
    <el-form :model="ruleForm2" :rules="rules2" ref="ruleForm2" label-position="left" label-width="0px" class="demo-ruleForm login-container">
      <h3 class="title">系统登录</h3>
      <el-form-item prop="account">
        <el-input type="text" v-model="ruleForm2.account" auto-complete="off" placeholder="账号"></el-input>
      </el-form-item>
      <el-form-item prop="checkPass">
        <el-input type="password" v-model="ruleForm2.checkPass" auto-complete="off" placeholder="密码"></el-input>
      </el-form-item>
      <el-checkbox v-model="checked" checked class="remember">记住密码</el-checkbox>
      <el-button type="text" icon="el-icon-edit" class="register"  @click="handleRegDialog">注册</el-button>
      <el-form-item style="width:100%;">
        <el-button type="primary" style="width:100%;" @click.native.prevent="handleSubmit2" :loading="logining">登录</el-button>
        <!-- <el-button @click.native.prevent="handleReset2">重置</el-button> -->
      </el-form-item>
    </el-form>

    <!--注册界面-->
    <el-dialog title="注册" :visible="regFormVisible" :close-on-click-modal="false" @close="regFormVisible = false">
      <el-form :model="regFormData" label-width="80px" :rules="regRule" ref="regForm">
        <el-form-item label="用户名称" prop="username">
          <el-input v-model="regFormData.username" auto-complete="off"></el-input>
        </el-form-item>
        <el-form-item label="用户密码" prop="password">
          <el-input type="password" v-model="regFormData.password" auto-complete="off"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click.native="regFormVisible = false">取消</el-button>
        <el-button type="primary" @click.native="regSubmit" :loading="regLoading">提交</el-button>
      </div>
    </el-dialog>
  </section>
</template>

<script>
  import { requestLogin, reqLogin, registerUser } from '../api/api';

  //import NProgress from 'nprogress'
  export default {
    data() {
      return {
        regLoading: false,
        regFormVisible: false, // 注册diglog是示
        regFormData: {
          username: '',
          password: ''
        },
        regRule: {
          username: [
            { required: true, message: '请输入用户名', trigger: 'blur' },
          ],
          password: [
            { required: true, message: '请输入用户密码', trigger: 'blur' },
          ]
        },

        logining: false,
        ruleForm2: {
          account: 'admin',
          checkPass: '123456'
        },
        rules2: {
          account: [
            { required: true, message: '请输入账号', trigger: 'blur' },
            //{ validator: validaePass }
          ],
          checkPass: [
            { required: true, message: '请输入密码', trigger: 'blur' },
            //{ validator: validaePass2 }
          ]
        },
        checked: true
      };
    },
    methods: {
      // 注册
      regSubmit() {
        this.$refs.regForm.validate((valid) => {
          if (valid) {
            this.regLoading = true;

            // 注册请求
            let para = this.regFormData
            registerUser(para).then(res => {
              console.log(res.data);
              if (res.data.errcode !== 0){
                this.$message({
                  message: res.data.errmsg,
                  type: 'error'
                })
              }else {
                this.regFormVisible = false
                this.$message({
                  message: "注册成功",
                  type: "success"
                })
              }
            });
          }
        });
      },
      // 注册隐藏
      handleRegDialog() {
        this.regFormVisible = true
      },
      handleReset2() {
        this.$refs.ruleForm2.resetFields();
      },
      handleSubmit2(ev) {
        var _this = this;
        this.$refs.ruleForm2.validate((valid) => {
          if (valid) {
            //_this.$router.replace('/table');
            this.logining = true;
            //NProgress.start();
            var loginParams = { username: this.ruleForm2.account, password: this.ruleForm2.checkPass };

            // 登录请求，成功跳转到首页/
            reqLogin(loginParams).then(data => {
              this.logining = false;
              //NProgress.done();
              let {  errcode, errmsg, res} = data;
              if (errcode !== 0) {
                this.$message({
                  message: errmsg,
                  type: 'error'
                });
              } else {
                sessionStorage.setItem('user', JSON.stringify(res));
                this.$router.push({ path: '/main' });
              }
            });

          } else {
            console.log('error submit!!');
            return false;
          }
        });
      }
    }
  }

</script>

<style lang="scss" scoped>
  .login-container {
    /*box-shadow: 0 0px 8px 0 rgba(0, 0, 0, 0.06), 0 1px 0px 0 rgba(0, 0, 0, 0.02);*/
    -webkit-border-radius: 5px;
    border-radius: 5px;
    -moz-border-radius: 5px;
    background-clip: padding-box;
    margin: 180px auto;
    width: 350px;
    padding: 35px 35px 15px 35px;
    background: #fff;
    border: 1px solid #eaeaea;
    box-shadow: 0 0 25px #cac6c6;
    .title {
      margin: 0px auto 40px auto;
      text-align: center;
      color: #505458;
    }
    .remember {
      margin: 0px 0px 35px 0px;
    }
    .register {
      margin: 0px 0px 0px 40px;
    }
  }
</style>
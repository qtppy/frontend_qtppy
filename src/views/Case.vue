<template>
	<section>
		<!--工具条-->
		<el-col 
      :span="24" 
      class="toolbar" 
      style="padding-bottom: 0px;"
    >
			<el-form 
        :inline="true" 
        :model="filters"
      >
				<el-form-item>
					<el-link 
            type="primary" 
            icon="el-icon-guide" 
            :underline="false"
          >
            用例查询:
          </el-link>
				</el-form-item>
				<el-form-item>
					<el-input 
            v-model="filters.name" 
            placeholder="用例名称" 
            size="mini"></el-input>
				</el-form-item>
				<el-form-item>
					<el-button 
            type="primary" 
            icon="el-icon-search" 
            size="mini" 
            v-on:click="getCase"
          >查询</el-button>
				</el-form-item>
			</el-form>
		</el-col>

		<!--列表-->
		<el-table 
      :data="casesData" 
      highlight-current-row 
      v-loading="listLoading" 
      @selection-change="selsChange" 
      style="width: 100%;" 
      size="mini">
			<el-table-column 
        type="selection" 
        width="55"></el-table-column>
			<el-table-column 
        type="index" 
        width="100" 
        label="序号" 
        sortable></el-table-column>
			<el-table-column 
        prop="id" 
        label="用例ID" 
        width="120" 
        v-if="visible"></el-table-column>
			<el-table-column 
        prop="name" 
        label="用例名称" 
        width="120" 
        sortable></el-table-column>
			<el-table-column 
        prop="url" 
        label="请求地址" 
        width="120"></el-table-column>
			<el-table-column 
        prop="method" 
        label="请求方法" 
        width="100"></el-table-column>
			<el-table-column 
        prop="desc" 
        label="用例描述" 
        width="200" ></el-table-column>
			<el-table-column 
      prop="createtime" 
      label="创建时间" 
      width="100" 
      :formatter="formatDateDMT"></el-table-column>
			<el-table-column 
        prop="creator" 
        label="创建者" 
        min-width="100"></el-table-column>
			<el-table-column label="操作" width="150">
        <template slot="header" slot-scope>
          <el-button-group>
            <el-tooltip 
              :disabled="false" 
              placement="bottom" 
              effect="light" 
              content="增加测试用例">
              <el-button 
                size="mini" 
                type="primary" 
                icon="el-icon-document-add" 
                @click="caseListClick(0, '')"></el-button>
            </el-tooltip>
            <el-tooltip 
              :disabled="false" 
              placement="bottom" 
              effect="light" 
              content="执行用例">
              <el-button 
                size="mini" 
                type="success" 
                icon="el-icon-s-flag" 
                ></el-button>
            </el-tooltip>
          </el-button-group>  
        </template>
				<template slot-scope="scope">
					<el-tooltip 
            content="编辑" 
            placement="bottom" 
            effect="light">
						<el-button 
              type="warning" 
              size="mini" 
              icon="el-icon-edit"
              circle
              @click="caseListClick(1, scope.row)"></el-button>
					</el-tooltip>
					<el-tooltip 
            content="删除" 
            placement="bottom" 
            effect="light">
						<el-button 
              type="danger" 
              size="mini" 
              icon="el-icon-delete" 
              @click="handleDel(scope.$index, scope.row)" circle></el-button>
					</el-tooltip>
				</template>
			</el-table-column>
		</el-table>

		<!--工具条-->
		<el-col :span="24" class="toolbar">
			<el-button 
        type="danger" 
        @click="batchRemove" 
        :disabled="this.sels.length===0">批量删除</el-button>
			<el-pagination 
        layout="prev, pager, next" 
        @current-change="handleCurrentChange" 
        :page-size="per_page" 
        :total="total" 
        style="float:right;">
			</el-pagination>
		</el-col>
    <caseAddCom ref='caseAddCom'></caseAddCom>
	</section>
</template>

<script>
	import util from '@/common/js/util'
  import { validateURL } from '@/common/js/validate'
	//import NProgress from 'nprogress'
  import { getCaseList, deleteCase, batchRemoveUser, editUser, createCase, debugCase, editCase } from '@/api/api';
  import caseAddCom from '@/views/caseAdd'
	export default {
    components:{caseAddCom},
		data() {
			return {
        /**
         * 用例列表
         * @var filters: 用例列表筛选
         * @var casesData: 存储列表数据
         * @var total: 用例列表总条数
         * @var page: 用例列表当前默认页
         * @var per_page: 用例列表分页条数，后端传值
         * @var listLoading: 用例列表加载时状态
         * @var sels: 用例列表筛选数据存储
         * @var editFormVisible 编辑界而显示
         */
				filters: {
					name: ''
				},
        casesData: [],
        visible: false,
        Paramsize:'mini',
				total: 0,
				page: 1,
				per_page: 10,
				listLoading: false,
				sels: [],
				editFormVisible: false,
				editLoading: false,
				editFormRules: {
					name: [
						{ required: true, message: '请输入姓名', trigger: 'blur' }
					]
				},
				editForm: {
					id: 0,
					name: '',
					sex: -1,
					age: 0,
					birth: '',
					addr: ''
        },
        
        /**验证规则 */
        addCaseRules: {
          method: [
            // {required: true, message:'请输入正确的url地址', trigger: 'blur'}, 
            {validator: validateURL, trigger: 'blur'}
          ],

        },

        // 用例全局设置抽屉
        caseGlobalDialog: false,
        caseGlobalLoading: false,
        caseGlobalActiveName: "base",
      }
		},
		methods: {
			/**
			 * 用例列表，表头操作栏按钮
			 * @param {*} h 表头对象
			 * @param {*} params 表头参数
			 * @returns div html
			 */
      caseListClick(index, row) {
        // 更改标题
        if (index === 1) {
          this.breadcrumbTitle='编辑用例';

          let obj = {};
          obj = this.methodOptions.find((item) => {
            return item.label === row.method;
          })

          // 编辑展示数据
          this.addCaseData = {
            method: obj.value,
            url: row.url,
            urlIndex: 0,
            baseUrl: '',
            header: row.headers,
            body: row.body,
            outParam: '',
            assertData: '',
            isbodyTextAreaButton: false,
            size: 'mini',
            debugWay: 0,
            name: row.name,
            desc: row.desc,
            caseId: row.cid,
          };
          this.bodyRadioChange(row.body.how);
          // body数据初始化
          let tableT = row.body.body.data;

          this.bodyTableData = [];
          let files = row.body.body.files;
          for(let f in files) {
            this.bodyTableData.push(
              {
                key: f,
                value: tableT[f],
                DESCRIPTION: '',
                edit: true,
                fromSelect: 1,
                fromValSelect: false,
                valueEdit: true,
                fromSelectHide: false,
                file: {
                  key: '',
                  name: ''
                },
              }
            );
          }
          for(let k in tableT) {
            this.bodyTableData.push(
              {
                key: k,
                value: tableT[k],
                DESCRIPTION: '',
                edit: true,
                fromSelect: 1,
                fromValSelect: false,
                valueEdit: true,
                fromSelectHide: false,
                file: {
                  key: '',
                  name: ''
                },
              }
            );
          };
        };
        this.handleAddCaseDialog();
      },

			/**
			 * 显示增加case
			 * @param {*} null
			 * @returns null
			 */
			handleAddCaseDialog() {
        this.$refs.caseAddCom.isDialogShow(true);
      },

			/**
			日期类型转换
			@param {*} row table当前行数据
			@param {*} column table当前列数据
			 */
			formatDateDMT: function (row, column) {
				return util.formatDate.format(new Date(row.createtime), 'yyyy-MM-dd hh:mm:ss')
			},

			/**
			 * 翻页功能
			 * @param {*} val 当前页码value
			 * @returns null
			*/
			handleCurrentChange(val) {
				this.page = val;
				this.getCase();
			},

			/** 
			 * 获取测试用例列表
			 * @param {*} 
			 * @returns null
			 */
			getCase() {
				let para = {
					page: this.page,
					name: this.filters.name
				};
				this.listLoading = true;
				// NProgress.start();
				getCaseList(para).then((res) => {
					this.total = res.data.res.total;
					this.per_page = res.data.res.per_page;
                    this.casesData = res.data.res.case;
					this.listLoading = false;
					console.log(this.casesData);
					//NProgress.done();
				});
			},

			/**
			 * 物理删除测试用例
			 * @param {*} index 用例行索引
			 * @param {*} row 当前行对象
			 * @returns null
			 */
			handleDel: function (index, row) {
				this.$confirm('确认删除该记录吗?', '提示', {
					type: 'warning'
				}).then(() => {
					this.listLoading = true;
					//NProgress.start();
					let para = { id: [row.cid] };
					deleteCase(para).then((res) => {
						this.listLoading = false;
						//NProgress.done();
						this.$message({
							message: '删除成功',
							type: 'success'
						});
						this.getCase();
					});
				}).catch(() => {

				});
			},
			//显示编辑界面
			handleEdit: function (index, row) {
				this.editFormVisible = true;
				this.editForm = Object.assign({}, row);
			},
			//编辑
			editSubmit: function () {
				this.$refs.editForm.validate((valid) => {
					if (valid) {
						this.$confirm('确认提交吗？', '提示', {}).then(() => {
							this.editLoading = true;
							//NProgress.start();
							let para = Object.assign({}, this.editForm);
							para.birth = (!para.birth || para.birth == '') ? '' : util.formatDate.format(new Date(para.birth), 'yyyy-MM-dd');
							editUser(para).then((res) => {
								this.editLoading = false;
								//NProgress.done();
								this.$message({
									message: '提交成功',
									type: 'success'
								});
								this.$refs['editForm'].resetFields();
								this.editFormVisible = false;
								this.getCase();
							});
						});
					}
				});
			},
			//新增
			addSubmit: function () {
				this.$refs.addForm.validate((valid) => {
					if (valid) {
						this.$confirm('确认提交吗？', '提示', {}).then(() => {
							this.addLoading = true;
							//NProgress.start();
							let para = Object.assign({}, this.addForm);
							para.birth = (!para.birth || para.birth == '') ? '' : util.formatDate.format(new Date(para.birth), 'yyyy-MM-dd');
							addUser(para).then((res) => {
								this.addLoading = false;
								//NProgress.done();
								this.$message({
									message: '提交成功',
									type: 'success'
								});
								this.$refs['addForm'].resetFields();
								this.addFormVisible = false;
								this.getCase();
							});
						});
					}
				});
			},
			selsChange: function (sels) {
				this.sels = sels;
			},
			//批量删除
			batchRemove: function () {
        var ids = this.sels.map(item => item.cid);
        console.log(ids);
				this.$confirm('确认删除选中记录吗？', '提示', {
					type: 'warning'
				}).then(() => {
					this.listLoading = true;
					//NProgress.start();
					let para = { id: ids };
					deleteCase(para).then((res) => {
						this.listLoading = false;
						//NProgress.done();
						this.$message({
							message: '删除成功',
							type: 'success'
						});
						this.getCase();
					});
				}).catch(() => {

				});
			}
    },
    computed: {
      listData() { 
        // 从Vuex获取用例列表信息
        return this.$store.state.caseList;
      },
    },
		mounted() {
			this.getCase();
		}
	}

</script>

<style scoped-slot>

</style>
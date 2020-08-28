<template>
  <section>
    <!--工具条-->
    <el-col :span="24" class="toolbar" style="padding-bottom: 0px;">
      <el-form :inline="true" size="mini">
        <el-form-item>
					<el-link type="primary" icon="el-icon-cpu" :underline="false">项目:</el-link>
					<el-select v-model="projects.project.selected" filterable  size="mini" placeholder="请选择项目" @change="getSuiteList">
						<el-option
						v-for="item in projects.project.options"
						:key="item.value"
						:label="item.label"
						:value="item.value">
						</el-option>
					</el-select>
				</el-form-item>
				<el-form-item>
					<el-link type="primary" icon="el-icon-guide" :underline="false">场景:</el-link>
					<el-select v-model="projects.suite.selected" filterable size="mini" placeholder="请选择场景" @change="getProjects">
						<el-option
						v-for="item in projects.suite.options"
						:key="item.value"
						:label="item.label"
						:value="item.value">
						</el-option>
					</el-select>
				</el-form-item>
				<el-form-item>
					<el-tooltip placement="top">
						<div slot="content">新增场景</div>
						<el-button type="primary" icon="el-icon-news" size="mini" @click="handleAddSuite">新增</el-button>
					</el-tooltip>
				</el-form-item>
				<el-form-item>
					<el-tooltip placement="top">
						<div slot="content">编辑场景</div>
						<el-button type="primary" icon="el-icon-edit" size="mini" @click="handleSuiteEdit">编辑</el-button>
					</el-tooltip>
				</el-form-item>
			</el-form>
		</el-col>

		<!--列表-->
		<el-table 
			:data="scene.table.data" 
			highlight-current-row 
			v-loading="scene.table.loading" 
			@selection-change="selsChange"
			size="mini"
			style="width: 100%;">
			<el-table-column type="selection" width="55">
			</el-table-column>
			<el-table-column type="index" label="序号" width="100">
			</el-table-column>
			<el-table-column prop="scid" label="场景用例ID" width="100" v-if="scene.table.colVisible">
			</el-table-column>
			<el-table-column prop="scName" label="接口名称" width="200" >
			</el-table-column>
			<el-table-column prop="scUrl" label="接口地址" width="200">
			</el-table-column>
			<el-table-column prop="scMethod" label="请求方法" width="100" >
			</el-table-column>
			<el-table-column prop="create_time" label="创建日期" width="120" :formatter="formatDateDMT" >
			</el-table-column>

			<el-table-column label="操作"  width="300">
				<template slot="header" slot-scope>
					<el-button-group>
						<el-tooltip content="添加用例" placement="bottom" effect="light">
							<el-button type="warning" icon="el-icon-document-add" size="mini" @click="addCaseToList()" ></el-button>
						</el-tooltip>

						<el-tooltip content="上移" placement="bottom" effect="light">
							<el-button type="primary" icon="el-icon-top" size="mini" @click="handleDel(scope.$index, scope.row)" ></el-button>
						</el-tooltip>

						<el-tooltip content="下移" placement="bottom" effect="light">
							<el-button type="primary" icon="el-icon-bottom" size="mini" @click="handleDel(scope.$index, scope.row)" ></el-button>
						</el-tooltip>

                        <el-tooltip content="执行场景用例" placement="bottom" effect="light">
                          <el-button type="success" icon="el-icon-s-flag" size="mini" @click="addCaseToList()" ></el-button>
                        </el-tooltip>
					</el-button-group>  
				</template>
				
				<el-tooltip content="编辑" placement="bottom" effect="light">
					<el-button type="warning" size="mini" icon="el-icon-edit" @click="handleEdit(scope.$index, scope.row)" circle></el-button>
				</el-tooltip>

				<el-tooltip content="删除" placement="bottom" effect="light">
					<el-button type="danger" icon="el-icon-delete" size="mini" @click="handleDel(scope.$index, scope.row)" circle></el-button>
				</el-tooltip>

			</el-table-column>
		</el-table>

		<!--工具条-->
		<el-col :span="24" class="toolbar">
			<el-button type="danger" size="mini" @click="batchRemove" :disabled="this.pages.sels.length===0">批量删除</el-button>
			<el-pagination layout="prev, pager, next" size="mini" @current-change="handleCurrentChange" :page-size="pages.per_page" :total="pages.total" style="float:right;">
			</el-pagination>
		</el-col>

		<!-- 编辑界面 -->
		<el-dialog title="编辑" :visible="scene.edit.visible" :close-on-click-modal="false" @close="scene.edit.visible = false">
			<el-form :model="scene.edit.data" label-width="80px" :rules="scene.edit.rules" ref="editForm" >
				<el-form-item label="场景ID" prop="sid">
					<el-input v-model="scene.edit.data.sid" auto-complete="off" :readonly="scene.edit.sidvisible"></el-input>
				</el-form-item>
				<el-form-item label="场景名称" prop="s_name">
					<el-input v-model="scene.edit.data.s_name" auto-complete="off"></el-input>
				</el-form-item>
				<el-form-item label="描述">
					<el-input type="textarea" v-model="scene.edit.data.s_desc"></el-input>
				</el-form-item>
			</el-form>
			<div slot="footer" class="dialog-footer">
				<el-button @click.native="scene.edit.visible = false" >取消</el-button>
				<el-button type="primary" @click.native="editSubmit" :loading="scene.edit.loading">提交</el-button>
			</div>
		</el-dialog>

		<!-- 新增测试场景 -->
		<el-dialog title="新增" :visible="projects.suite.visible" :close-on-click-modal="false" @close="projects.suite.visible = false">
			<el-form :model="projects.suite.data" label-width="80px" :rules="projects.suite.rules" ref="addSuiteData">
				<el-form-item label="场景名称" prop="s_name">
					<el-input v-model="projects.suite.data.s_name" auto-complete="off"></el-input>
				</el-form-item>
				<el-form-item label="描述">
					<el-input type="textarea" v-model="projects.suite.data.s_desc"></el-input>
				</el-form-item>
			</el-form>
			<div slot="footer" class="dialog-footer">
				<el-button @click.native="projects.suite.visible = false">取消</el-button>
				<el-button type="primary" @click.native="addSubmit" :loading="projects.suite.loading">提交</el-button>
			</div>
		</el-dialog>

		<!-- 添加用例 -->
		<el-dialog 
		    title="添加用例" 
			:close-on-click-modal="false" 
			:visible.sync="addCaseDialog.visible">
			<case-module ref="caseCom" />
			<div slot="footer" class="dialog-footer">
				<el-button @click="addCaseDialog.visible = false" size="mini">取 消</el-button>
				<el-button type="primary" @click="insertCase" size="mini" :loading="addCaseDialog.loading">添 加</el-button>
			</div>
		</el-dialog>
	</section>

</template>


<script>
	import util from '@/common/js/util'
	//import NProgress from 'nprogress'
	import { addSuiteCase, getProjectAllList, getSuiteAllList, createSuite, updateSuiteInfo, getSuiteCaseById, getSuiteByID} from '@/api/api';
	import CASE from '@/views/Case'
	export default {
		components: { 
			"case-module": CASE, 
		},
		data() {
			return {
				// 页码
				pages: {
					total: 0,
					per_page: 10,
					next: null,
					page: 1,
					sels: [],
				},

				//项目及场景
				projects: {
					project: {
						options: [],
						selected: '',
					},
					suite: {
						loading: false,
						options: [],
						selected: '',
						visible: false,
						data:{
							s_name: '',
							s_desc: '',
							project_id: ''
						},
						rules:{
							name: [
								{ required: true, message: '请输入项目名称', trigger: 'blur' }
							],
						},
					},
				},

				// 场景数据
				scene: {
					table: {
						loading: false,
						data: [],
						colVisible: false,
					},
					edit:{
						loading: false,
						visible: false,
						sidVisible: false,
						data: {
							sid: '',
							s_desc: '',
							s_name: ''
						},
						rules: {
							name: [
								{ required: true, message: '请输入项目名称', trigger: 'blur' }
							]
						}
					},
				},

				// 场景添加用例
				addCaseDialog: {
					loading: false,
					visible: false,
					transfer:{
						data: [
							{
								key: 'abc',
								label: 'aaaa'
							},
							{
								key: 'ddd',
								label: 'bbbb'
							}
						],
						model: [1],
					},
				},
			}
		},
		created() {
			this.getProjectSelect()//初始化加载项目列表
		},
		methods: {
      addCaseToList() {
        // 先选择项目及场景之后，才可以增加步骤
        let ops = this.projects;
        if( ops.suite.selected === '') {
          this.$message(
            {
              message: '请选择项目及场景',
              type: 'warning'
            }
          )
        }else{
          this.addCaseDialog.visible = true;
        }
      },
			async insertCase() {
        // console.log('=-=-=-=->', this.$refs.caseCom.sels)
        // console.log('场景ID', this.projects.suite.selected)
        // 根据场景ID，场景用例ID查询场景下用例
        if(this.$refs.caseCom.sels.length <=0) {
          this.$message({
            message: '请勾选，选择用例',
            type: 'warning'
          })
        }else {
          this.addCaseDialog.visible = true;
          let param = {
            data: this.$refs.caseCom.sels,
            sid: this.projects.suite.selected
          };
          await addSuiteCase(param).then(res => {
            this.getProjects();
          });
          this.addCaseDialog.visible = false; 
          // 清除子组件case列表选择状态
          this.$refs.caseCom.$refs.caseTable.clearSelection();
        }
			},
			handleChange(value, direction, movedKeys) {
				console.log(value, direction, movedKeys);
			},

			// 项目创建日期转换
			formatDateDMT: function (row, column) {
				return util.formatDate.format(new Date(row.create_time), 'yyyy-MM-dd')
			},
			//项目状态转换
			formatStatus: function (row, column) {
				return row.p_status == 1 ? '已使用' : row.p_status == 0 ? '未使用' : '未知';
			},
			handleCurrentChange(val) {
				this.pages.page = val;
				this.getProjects();
			},

			// 获取项目
			getProjectSelect () {
				this.projects.project.options = [] //初始化列表
				getProjectAllList().then(res => {
					console.log(res.data);
					let projectArr = res.data.res.project
					for(let i=0; i<projectArr.length; i++){
						this.projects.project.options.push({
							label: projectArr[i].p_name, 
							value: projectArr[i].p_id
						})
					};
					this.projects.project.selected = this.projects.project.options[0].p_id
				});
				
			},
			// 根据项目获取测试集
			getSuiteList (value) {
				let para = {
					"p_id": value
				};
				this.projects.suite.selected = '' // 初始化默认选择项目
				this.projects.suite.options = [] //每次初始化
				getSuiteAllList(para).then(res => {
					let suiteArr = res.data.res.suite
					for(let i=0; i<suiteArr.length; i++){
						this.projects.suite.options.push({
							label: suiteArr[i].s_name,
							value: suiteArr[i].sid
						})
					};
					console.log(this.projects.suite.options)
				});
				// 更改选择值
				if( this.projects.suite.options.length > 0) {
					this.projects.suite.selected = this.projects.suite.options[0].sid
				}
			},
			//获取用户列表
			getProjects() {

        this.scene.table.loading = true;
        let para = {
          sid: this.projects.suite.selected
        }

				//NProgress.start();
        getSuiteCaseById(para).then((res) => {
          console.log('9999999====>', res)
          this.scene.table.data = res.res.case;
					this.pages.total = res.res.total;
					this.pages.per_page = res.res.per_page;
					this.pages.page = res.res.page;
					this.pages.next = res.res.next_page;
        });
        this.scene.table.loading = false;
				//NProgress.done();

			},

			//删除
			handleDel: function (index, row) {
				this.$confirm('确认删除该记录吗?', '提示', {
					type: 'warning'
				}).then(() => {
					this.scene.table.loading = true;
					//NProgress.start();
					let para = { p_id: [row.p_id] };
					deleteProject(para).then((res) => {
						this.scene.table.loading = false;
						//NProgress.done();
						this.$message({
							message: '删除成功',
							type: 'success'
						});
						this.getProjects();
					});
				}).catch(() => {

				});
			},

			//显示编辑界面
			handleEdit: function (index, row) {
				this.scene.edit.visible = true;
				this.scene.edit.data = Object.assign({}, row);
			},
			// 显示场景编辑
			handleSuiteEdit: function () {
        // 先选择项目及场景之后，才可以增加步骤
        let ops = this.projects;
        if( ops.project.options.length <= 0) {
          this.$message(
            {
              message: '请选择项目',
              type: 'warning'
            }
          )
        } else if( ops.suite.selected === '') {
          this.$message(
            {
              message: '请选择场景',
              type: 'warning'
            }
          )
        }else{
          let para = {
            "sid": this.projects.suite.selected
          };
          getSuiteByID(para).then(res => {
            let data = res.data.res
            this.scene.edit.data = {
              sid: data.sid,
              s_name: data.s_name,
              s_desc: data.s_desc
            }
          });
          this.scene.edit.visible = true
        }
			},
			//显示新增界面
			handleAddSuite: function () {
				this.projects.suite.visible = true, // 新增场景是否显示
				this.projects.suite.data = {
					project_id: '',
					p_name: '',
					p_desc: ''
				}
			},
			//编辑
			editSubmit: function () {
				this.$refs.editForm.validate((valid) => {
					if (valid) {
						this.$confirm('确认提交吗？', '提示', {}).then(() => {
							this.scene.edit.loading = true;
							//NProgress.start();
							let para = Object.assign({}, this.scene.edit.data);
							para.create_time = (!para.create_time || para.create_time == '') ? '' : util.formatDate.format(new Date(para.create_time), 'yyyy-MM-dd');
							updateSuiteInfo(para).then((res) => {
								this.scene.edit.loading = false;
								//NProgress.done();
								this.$message({
									message: '提交成功',
									type: 'success'
								});
								this.scene.edit.visible = false;
								this.getSuiteList(this.projects.project.selected);
							});
						});
					}
				});
			},
			//新增
			addSubmit: function () {
				this.$refs.addSuiteData.validate((valid) => {
					if (valid) {
						this.$confirm('确认提交吗？', '提示', {}).then(() => {
							this.projects.suite.loading = true;
							//NProgress.start();
							this.projects.suite.data.project_id = this.projects.project.selected;
							let para = Object.assign({}, this.projects.suite.data);
							// para.create_time = (!para.create_time || para.create_time == '') ? '' : util.formatDate.format(new Date(para.create_time), 'yyyy-MM-dd');
							createSuite(para).then((res) => {
								this.projects.suite.loading = false;
								//NProgress.done();
								this.$message({
									message: '提交成功',
									type: 'success'
								});
								// 设置新增对话框隐藏，重新初始化测试集列表数据
								this.projects.suite.visible = false;
								this.projects.suite.options.push({
									label: res.data.res.s_name,
									value: res.data.res.sid
								});
								// 重新获取所有测试集
								this.getSuiteList(this.projects.project.selected);
							});
						});
					}
				});
			},
			selsChange: function (sels) {
				this.pages.sels = sels;
			},
			//批量删除
			batchRemove: function () {
				var ids = this.sels.map(item => item.p_id);
				this.$confirm('确认删除选中记录吗？', '提示', {
					type: 'warning'
				}).then(() => {
					this.scene.table.loading = true;
					//NProgress.start();
					let para = { p_id: ids };
					deleteProject(para).then((res) => {
						this.scene.table.loading = false;
						//NProgress.done();
						this.$message({
							message: '删除成功',
							type: 'success'
						});
						this.getProjects();
					});
				}).catch(() => {

				});
			}
		},
		mounted() {
			// this.getProjects();
		}
	}

</script>

<style>
	/* el-select解决下拉显示不全问题 */
	.el-select-dropdown .el-scrollbar .el-scrollbar__wrap
	{
		overflow: scroll!important;
	}

</style>
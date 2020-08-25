<template>
	<section>
		<!--工具条-->
		<el-col :span="24" class="toolbar" style="padding-bottom: 0px;">
			<el-form :inline="true" :model="filters" ref="searchTool" size="mini">
				<el-form-item>
					<el-link type="primary" icon="el-icon-cpu" :underline="false">项目:</el-link>
					<el-select v-model="projectSelected" filterable  size="mini" placeholder="请选择项目" @change="getSuiteList">
						<el-option
						v-for="item in projectOptions"
						:key="item.value"
						:label="item.label"
						:value="item.value">
						</el-option>
					</el-select>
				</el-form-item>
				<el-form-item>
					<el-link type="primary" icon="el-icon-guide" :underline="false">场景:</el-link>
					<el-select v-model="suiteSelected" filterable size="mini" placeholder="请选择场景">
						<el-option
						v-for="item in suiteOptions"
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
			:data="cases" 
			highlight-current-row 
			v-loading="listLoading" 
			@selection-change="selsChange"
			size="mini"
			style="width: 100%;">
			<el-table-column type="selection" width="55">
			</el-table-column>
			<el-table-column type="index" label="序号" width="100">
			</el-table-column>
			<el-table-column prop="p_id" label="场景用例ID" width="100" v-if="visible">
			</el-table-column>
			<el-table-column prop="p_name" label="接口名称" width="200" >
			</el-table-column>
			<el-table-column prop="p_status" label="接口地址" width="200" :formatter="formatStatus" >
			</el-table-column>
			<el-table-column prop="p_creator" label="请求方法" width="100" >
			</el-table-column>
			<el-table-column prop="create_time" label="创建日期" width="120" :formatter="formatDateDMT" >
			</el-table-column>

			<el-table-column label="操作" :render-header="renderHeader" width="300">
				<template slot="header" slot-scope>
					<el-button-group>
						<el-tooltip content="添加用例" placement="bottom" effect="light">
							<el-button type="success" icon="el-icon-document-add" size="mini" @click="handleDel(scope.$index, scope.row)" ></el-button>
						</el-tooltip>

						<el-tooltip content="上移" placement="bottom" effect="light">
							<el-button type="primary" icon="el-icon-top" size="mini" @click="handleDel(scope.$index, scope.row)" ></el-button>
						</el-tooltip>

						<el-tooltip content="下移" placement="bottom" effect="light">
							<el-button type="primary" icon="el-icon-bottom" size="mini" @click="handleDel(scope.$index, scope.row)" ></el-button>
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
			<el-button type="danger" size="mini" @click="batchRemove" :disabled="this.sels.length===0">批量删除</el-button>
			<el-pagination layout="prev, pager, next" size="mini" @current-change="handleCurrentChange" :page-size="per_page" :total="total" style="float:right;">
			</el-pagination>
		</el-col>

		<!-- 编辑界面 -->
		<el-dialog title="编辑" :visible="editSuitevisible" :close-on-click-modal="false" @close="editSuitevisible = false">
			<el-form :model="editSuiteData" label-width="80px" :rules="editFormRules" ref="editForm">
				<el-form-item label="场景ID" prop="sid">
					<el-input v-model="editSuiteData.sid" auto-complete="off" :readonly="editSuiteSidVisible"></el-input>
				</el-form-item>
				<el-form-item label="场景名称" prop="s_name">
					<el-input v-model="editSuiteData.s_name" auto-complete="off"></el-input>
				</el-form-item>
				<el-form-item label="描述">
					<el-input type="textarea" v-model="editSuiteData.s_desc"></el-input>
				</el-form-item>
			</el-form>
			<div slot="footer" class="dialog-footer">
				<el-button @click.native="editSuitevisible = false">取消</el-button>
				<el-button type="primary" @click.native="editSubmit" :loading="editLoading">提交</el-button>
			</div>
		</el-dialog>

		<!-- 新增测试场景 -->
		<el-dialog title="新增" :visible="addSuiteVisible" :close-on-click-modal="false" @close="addSuiteVisible = false">
			<el-form :model="addSuiteData" label-width="80px" :rules="addFormRules" ref="addSuiteData">
				<el-form-item label="场景名称" prop="s_name">
					<el-input v-model="addSuiteData.s_name" auto-complete="off"></el-input>
				</el-form-item>
				<el-form-item label="描述">
					<el-input type="textarea" v-model="addSuiteData.s_desc"></el-input>
				</el-form-item>
			</el-form>
			<div slot="footer" class="dialog-footer">
				<el-button @click.native="addSuiteVisible = false">取消</el-button>
				<el-button type="primary" @click.native="addSubmit" :loading="addLoading">提交</el-button>
			</div>
		</el-dialog>		
	</section>
</template>

<script>
	import util from '@/common/js/util'
	//import NProgress from 'nprogress'
	import { getProjectAllList, getSuiteAllList, createSuite, updateSuiteInfo, getProjectList, getSuiteByID} from '@/api/api';

	export default {
		data() {
			return {
				filters: {
					p_name: ''
				},
				cases: [],
				total: 0,
				per_page: 10,
				page: 1,
				listLoading: false,
				sels: [],//列表选中列
				projectIdShow: "visible", //项目Id列是否显示
				editProjectId: true, //编辑界面项目Id是否只读 true只读
				editFormVisible: false,//编辑界面是否显示
				editLoading: false,
				editFormRules: {
					name: [
						{ required: true, message: '请输入项目名称', trigger: 'blur' }
					]
				},
				//编辑界面数据
				editForm: {
					sid: 0,
					name: '',
					desc: ''
				},
				addFormVisible: false,//新增界面是否显示
				addLoading: false,
				addFormRules: {
					name: [
						{ required: true, message: '请输入项目名称', trigger: 'blur' }
					]
				},
				// 项目列表
				projectOptions:[], //项目列表
				projectSelected: '', //默认选择项目
				suiteOptions: [], // Suite列表
				suiteSelected: '', //默认选择测试集
				// 新增测试场景数据
				addSuiteVisible: false, // 新增场景是否显示
				// 新增测试集数据
				addSuiteData: {
					s_name: '',
					s_desc: '',
					project_id: ''
				},
				// 场景编辑
				editSuitevisible: false, //场景编辑是否显示
				editSuiteSidVisible: true,
				editSuiteData: {
					sid: '',
					s_desc: '',
					s_name: ''
				},
				// 新增测试用例
				addCaseLoading: false,
				addCaseVisible: false,
				addCaseSize: 'small',
				// 新增测试用例数据
				addCaseData: {
					method: '',
					url: '',
					urlIndex: 0,
					baseUrl: '',

				},
				// table data
				Paramsize: "mini",
			}
		},
		created() {
			this.getProjectSelect(), //初始化加载项目列表
			this.projectSelected = this.projectOptions[0].p_id
		},
		methods: {

			// Params选项卡增加新行
			addNewRow(index, row) {
				if(index == this.tableData.length - 1) {
					this.tableData.push({
						key: '',
						value: '',
						DESCRIPTION: '',
						edit: true,					
					});
				};
			},
			// 删除行
			deleteRow(index, row) {
				if(index !== 0) {
					this.tableData.splice(index, 1);
					this.addUrlParams(index, row);
				};
			},
			baseUrlSet() {
				this.addCaseData.baseUrl = this.addCaseData.url;
			},
			// 输入框输入焦点
			addUrlParams(index, row) {
				let flag = 0; //key和value全填标记0全填1相反
				let joinUrl = ''
				// 初始化url
				this.addCaseData.url = ''

				// key和value全填才执行拼接
				for (let i=0; i<this.tableData.length-1; i++) {
					if (this.tableData[i].key ==='' && this.tableData[i].value ==='') {
						flag = 1
						break
					};
				};
				// 拼接
				if (flag === 0) {
					for (let j=0; j<this.tableData.length; j++) {
						if (this.tableData[j].key !=='' && this.tableData[j].value !=='') {
							if (this.addCaseData.urlIndex === 0) {
								joinUrl = '?' + this.tableData[j].key + '=' + this.tableData[j].value
								this.addCaseData.urlIndex = 1
							} else {
								joinUrl = joinUrl + '&' + this.tableData[j].key + '=' + this.tableData[j].value
							}
						}
					}
					
				};
				this.addCaseData.urlIndex = 0
				this.addCaseData.url = this.addCaseData.baseUrl + joinUrl
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
				this.page = val;
				this.getProjects();
			},

			// 获取项目
			getProjectSelect () {
				this.projectOptions = [] //初始化列表
				getProjectAllList().then(res => {
					console.log(res.data);
					let projectArr = res.data.res.project
					for(let i=0; i<projectArr.length; i++){
						this.projectOptions.push({
							label: projectArr[i].p_name, 
							value: projectArr[i].p_id
						})
					};
					console.log(this.projectOptions)
				});
				
			},
			// 根据项目获取测试集
			getSuiteList (value) {
				let para = {
					"p_id": value
				};
				this.suiteSelected = '' // 初始化默认选择项目
				this.suiteOptions = [] //每次初始化
				getSuiteAllList(para).then(res => {
					let suiteArr = res.data.res.suite
					for(let i=0; i<suiteArr.length; i++){
						this.suiteOptions.push({
							label: suiteArr[i].s_name,
							value: suiteArr[i].sid
						})
					};
					console.log(this.suiteOptions)
				});
				this.suiteSelected = this.suiteOptions[0].s_id
			},
			//获取用户列表
			getProjects() {
				let para = {
					page: this.page,
					p_name: this.filters.p_name
				};
				this.listLoading = true;
				//NProgress.start();
				getProjectList(para).then((res) => {
					this.total = res.data.res.total;
					this.per_page = res.data.res.per_page;
					this.page = res.data.res.page;
					this.next = res.data.res.next_page;
					this.cases = res.data.res.project;
					this.listLoading = false;
					//NProgress.done();
				});
			},

			//删除
			handleDel: function (index, row) {
				this.$confirm('确认删除该记录吗?', '提示', {
					type: 'warning'
				}).then(() => {
					this.listLoading = true;
					//NProgress.start();
					let para = { p_id: [row.p_id] };
					deleteProject(para).then((res) => {
						this.listLoading = false;
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
				this.editFormVisible = true;
				this.editForm = Object.assign({}, row);
			},
			// 显示场景编辑
			handleSuiteEdit: function () {
				let para = {
					"sid": this.suiteSelected
				};
				getSuiteByID(para).then(res => {
					let data = res.data.res
					this.editSuiteData = {
						sid: data.sid,
						s_name: data.s_name,
						s_desc: data.s_desc
					}
				});
				this.editSuitevisible = true

			},
			//显示新增界面
			handleAddSuite: function () {
				this.addSuiteVisible = true, // 新增场景是否显示
				this.addSuiteData = {
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
							this.editLoading = true;
							//NProgress.start();
							let para = Object.assign({}, this.editSuiteData);
							para.create_time = (!para.create_time || para.create_time == '') ? '' : util.formatDate.format(new Date(para.create_time), 'yyyy-MM-dd');
							updateSuiteInfo(para).then((res) => {
								this.editLoading = false;
								//NProgress.done();
								this.$message({
									message: '提交成功',
									type: 'success'
								});
								this.editSuitevisible = false;
								getSuiteList(this.projectSelected);
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
							this.addLoading = true;
							//NProgress.start();
							this.addSuiteData.project_id = this.projectSelected;
							let para = Object.assign({}, this.addSuiteData);
							// para.create_time = (!para.create_time || para.create_time == '') ? '' : util.formatDate.format(new Date(para.create_time), 'yyyy-MM-dd');
							createSuite(para).then((res) => {
								this.addLoading = false;
								//NProgress.done();
								this.$message({
									message: '提交成功',
									type: 'success'
								});
								// 设置新增对话框隐藏，重新初始化测试集列表数据
								this.addSuiteVisible = false;
								this.suiteOptions.push({
									label: res.data.res.s_name,
									value: res.data.res.sid
								});
								// 重新获取所有测试集
								this.getSuiteList(this.projectSelected);
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
				var ids = this.sels.map(item => item.p_id);
				this.$confirm('确认删除选中记录吗？', '提示', {
					type: 'warning'
				}).then(() => {
					this.listLoading = true;
					//NProgress.start();
					let para = { p_id: ids };
					deleteProject(para).then((res) => {
						this.listLoading = false;
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
			this.getProjects();
		}
	}

</script>

<style scoped-slot>

</style>
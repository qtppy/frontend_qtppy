<template>
	<section>
		<!--工具条-->
		<el-col :span="24" class="toolbar" style="padding-bottom: 0px;">
			<el-form :inline="true" :model="filters">
				<el-form-item>
					<el-link type="primary" icon="el-icon-guide" :underline="false">项目查询:</el-link>
				</el-form-item>
				<el-form-item>
					<el-input v-model="filters.p_name" placeholder="项目名称" size="mini"></el-input>
				</el-form-item>
				<el-form-item>
					<el-button type="primary" icon="el-icon-search" v-on:click="getProjects" size="mini">查询</el-button>
				</el-form-item>
				<el-form-item>
					<el-button type="primary" icon="el-icon-news" @click="handleAdd" size="mini">新增</el-button>
				</el-form-item>
			</el-form>
		</el-col>

		<!--列表-->
		<el-table :data="users" highlight-current-row v-loading="listLoading" @selection-change="selsChange" style="width: 100%;">
			<el-table-column type="selection" width="55">
			</el-table-column>
			<el-table-column type="index" label="序号" width="100">
			</el-table-column>
			<el-table-column prop="p_id" label="项目ID" width="100" v-if="visible">
			</el-table-column>
			</el-table-column>
			<el-table-column prop="p_name" label="项目名称" width="120" sortable>
			</el-table-column>
			<el-table-column prop="p_status" label="状态" width="100" :formatter="formatStatus" sortable>
			</el-table-column>
			<el-table-column prop="p_creator" label="创建人" width="100" sortable>
			</el-table-column>
			<el-table-column prop="create_time" label="创建日期" width="120" :formatter="formatDateDMT" sortable>
			</el-table-column>
			<el-table-column prop="p_desc" label="描述" min-width="180" sortable>
			</el-table-column>
			<el-table-column label="操作" width="150">
				<template scope="scope">
					<el-tooltip content="编辑" placement="bottom" effect="light">
						<el-button type="warning" size="mini" icon="el-icon-edit" @click="handleEdit(scope.$index, scope.row)" circle></el-button>
					</el-tooltip>
					<el-tooltip content="删除" placement="bottom" effect="light">
						<el-button type="danger" size="mini" icon="el-icon-delete" @click="handleDel(scope.$index, scope.row)" circle></el-button>
					</el-tooltip>
				</template>
			</el-table-column>
		</el-table>

		<!--工具条-->
		<el-col :span="24" class="toolbar">
			<el-button type="danger" @click="batchRemove" :disabled="this.sels.length===0">批量删除</el-button>
			<el-pagination layout="prev, pager, next" @current-change="handleCurrentChange" :page-size="per_page" :total="total" style="float:right;">
			</el-pagination>
		</el-col>

		<!--编辑界面-->
		<el-dialog title="编辑" :visible="editFormVisible" :close-on-click-modal="false" @close="editFormVisible=false">
			<el-form :model="editForm" label-width="80px" :rules="editFormRules" ref="editForm">
				<el-form-item label="项目ID" prop="p_id">
					<el-input v-model="editForm.p_id" auto-complete="off" :readonly="editProjectId"></el-input>
				</el-form-item>
				<el-form-item label="项目名称" prop="p_name">
					<el-input v-model="editForm.p_name" auto-complete="off"></el-input>
				</el-form-item>
				<el-form-item label="描述">
					<el-input type="textarea" v-model="editForm.p_desc"></el-input>
				</el-form-item>
			</el-form>
			<div slot="footer" class="dialog-footer">
				<el-button @click.native="editFormVisible = false">取消</el-button>
				<el-button type="primary" @click.native="editSubmit" :loading="editLoading">提交</el-button>
			</div>
		</el-dialog>

		<!--新增界面-->
		<el-dialog title="新增" :visible="addFormVisible" :close-on-click-modal="false" @close="addFormVisible=false">
			<el-form :model="addForm" label-width="80px" :rules="addFormRules" ref="addForm">
				<el-form-item label="项目名称" prop="p_name">
					<el-input v-model="addForm.p_name" auto-complete="off"></el-input>
				</el-form-item>
				<el-form-item label="描述">
					<el-input type="textarea" v-model="addForm.p_desc"></el-input>
				</el-form-item>
			</el-form>
			<div slot="footer" class="dialog-footer">
				<el-button @click.native="addFormVisible = false">取消</el-button>
				<el-button type="primary" @click.native="addSubmit" :loading="addLoading">提交</el-button>
			</div>
		</el-dialog>
	</section>
</template>

<script>
	import util from '@/common/js/util'
	//import NProgress from 'nprogress'
	import { getUserListPage, removeUser, editProject, deleteProject, createProject, getProjectList} from '@/api/api';

	export default {
		data() {
			return {
				filters: {
					p_name: ''
				},
				users: [],
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
					p_id: 0,
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
				//新增界面数据
				addForm: {
					p_name: '',
					p_desc: ''
				}

			}
		},
		methods: {
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
					this.users = res.data.res.project;
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
			//显示新增界面
			handleAdd: function () {
				this.addFormVisible = true;
				this.addForm = {
					p_name: '',
					p_desc: ''
				};
			},
			//编辑
			editSubmit: function () {
				this.$refs.editForm.validate((valid) => {
					if (valid) {
						this.$confirm('确认提交吗？', '提示', {}).then(() => {
							this.editLoading = true;
							//NProgress.start();
							let para = Object.assign({}, this.editForm);
							para.create_time = (!para.create_time || para.create_time == '') ? '' : util.formatDate.format(new Date(para.create_time), 'yyyy-MM-dd');
							editProject(para).then((res) => {
								this.editLoading = false;
								//NProgress.done();
								this.$message({
									message: '提交成功',
									type: 'success'
								});
								this.$refs['editForm'].resetFields();
								this.editFormVisible = false;
								this.getProjects();
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
							// para.create_time = (!para.create_time || para.create_time == '') ? '' : util.formatDate.format(new Date(para.create_time), 'yyyy-MM-dd');
							createProject(para).then((res) => {
								this.addLoading = false;
								//NProgress.done();
								this.$message({
									message: '提交成功',
									type: 'success'
								});
								this.$refs['addForm'].resetFields();
								this.addFormVisible = false;
								this.getProjects();
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

<style scoped>

</style>
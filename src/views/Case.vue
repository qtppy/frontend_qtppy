<template>
	<section>
		<!--工具条-->
		<el-col :span="24" class="toolbar" style="padding-bottom: 0px;">
			<el-form :inline="true" :model="filters">
				<el-form-item>
					<el-link type="primary" icon="el-icon-guide" :underline="false">用例查询:</el-link>
				</el-form-item>
				<el-form-item>
					<el-input v-model="filters.name" placeholder="用例名称" size="mini"></el-input>
				</el-form-item>
				<el-form-item>
					<el-button type="primary" icon="el-icon-search" size="mini" v-on:click="getUsers">查询</el-button>
				</el-form-item>
				<el-form-item>
					<el-button type="primary" icon="el-icon-news" size="mini" @click="handleAdd">新增</el-button>
				</el-form-item>
			</el-form>
		</el-col>

		<!--列表-->
		<el-table :data="users" highlight-current-row v-loading="listLoading" @selection-change="selsChange" style="width: 100%;">
			<el-table-column type="selection" width="55"></el-table-column>
			<el-table-column type="index" width="70" label="序号"></el-table-column>
			<el-table-column prop="caseId" label="用例ID" width="120" v-if="visible"></el-table-column>
			<el-table-column prop="name" label="用例名称" width="120" sortable></el-table-column>
			<el-table-column prop="desc" label="用例描述" width="120"></el-table-column>
			<el-table-column prop="sex" label="性别" width="100" :formatter="formatSex" sortable></el-table-column>
			<el-table-column prop="age" label="年龄" width="100" sortable></el-table-column>
			<el-table-column prop="birth" label="生日" width="120" sortable></el-table-column>
			<el-table-column prop="addr" label="地址" min-width="180" sortable></el-table-column>
			<el-table-column label="操作" width="150" :render-header="renderHeader">
				<template scope="scope">
					<el-button size="small" @click="handleEdit(scope.$index, scope.row)">编辑</el-button>
					<el-button type="danger" size="small" @click="handleDel(scope.$index, scope.row)">删除</el-button>
				</template>
			</el-table-column>
		</el-table>

		<!--工具条-->
		<el-col :span="24" class="toolbar">
			<el-button type="danger" @click="batchRemove" :disabled="this.sels.length===0">批量删除</el-button>
			<el-pagination layout="prev, pager, next" @current-change="handleCurrentChange" :page-size="20" :total="total" style="float:right;">
			</el-pagination>
		</el-col>

		<!--编辑界面-->
		<el-dialog title="编辑" v-model="editFormVisible" :close-on-click-modal="false">
			<el-form :model="editForm" label-width="80px" :rules="editFormRules" ref="editForm">
				<el-form-item label="姓名" prop="name">
					<el-input v-model="editForm.name" auto-complete="off"></el-input>
				</el-form-item>
				<el-form-item label="性别">
					<el-radio-group v-model="editForm.sex">
						<el-radio class="radio" :label="1">男</el-radio>
						<el-radio class="radio" :label="0">女</el-radio>
					</el-radio-group>
				</el-form-item>
				<el-form-item label="年龄">
					<el-input-number v-model="editForm.age" :min="0" :max="200"></el-input-number>
				</el-form-item>
				<el-form-item label="生日">
					<el-date-picker type="date" placeholder="选择日期" v-model="editForm.birth"></el-date-picker>
				</el-form-item>
				<el-form-item label="地址">
					<el-input type="textarea" v-model="editForm.addr"></el-input>
				</el-form-item>
			</el-form>
			<div slot="footer" class="dialog-footer">
				<el-button @click.native="editFormVisible = false">取消</el-button>
				<el-button type="primary" @click.native="editSubmit" :loading="editLoading">提交</el-button>
			</div>
		</el-dialog>

		<!--新增界面-->
		<el-dialog title="新增" v-model="addFormVisible" :close-on-click-modal="false">
			<el-form :model="addForm" label-width="80px" :rules="addFormRules" ref="addForm">
				<el-form-item label="姓名" prop="name">
					<el-input v-model="addForm.name" auto-complete="off"></el-input>
				</el-form-item>
				<el-form-item label="性别">
					<el-radio-group v-model="addForm.sex">
						<el-radio class="radio" :label="1">男</el-radio>
						<el-radio class="radio" :label="0">女</el-radio>
					</el-radio-group>
				</el-form-item>
				<el-form-item label="年龄">
					<el-input-number v-model="addForm.age" :min="0" :max="200"></el-input-number>
				</el-form-item>
				<el-form-item label="生日">
					<el-date-picker type="date" placeholder="选择日期" v-model="addForm.birth"></el-date-picker>
				</el-form-item>
				<el-form-item label="地址">
					<el-input type="textarea" v-model="addForm.addr"></el-input>
				</el-form-item>
			</el-form>
			<div slot="footer" class="dialog-footer">
				<el-button @click.native="addFormVisible = false">取消</el-button>
				<el-button type="primary" @click.native="addSubmit" :loading="addLoading">提交</el-button>
			</div>
		</el-dialog>
		<!-- 新增测试用例 -->
		<el-dialog title="新增测试用例" fullscreen="true" :visible="addCaseVisible" :close-on-click-modal="false" @close="addCaseVisible = false" :size="addCaseSize">
			<el-form :model="addCaseData" label-width="3px" :rules="addFormRules" ref="addSuiteData">
				<el-row>
					<el-col span="12">
						<el-form-item prop="method">
							<el-input placeholder="请输入请求URL" v-model="addCaseData.url" class="input-with-select" @change="baseUrlSet">
								<el-select v-model="mechodSelectValue" placeholder="Method" slot="prepend" :size="addCaseSize" style="width:120px;">
									<el-option
									v-for="item in methodOptions"
									:key="item.value"
									:label="item.label"
									:value="item.value">
									</el-option>
								</el-select>
								<el-button slot="append" icon="el-icon-share" :loading="debugRequestLoading">调试</el-button>
							</el-input>
						</el-form-item>
					</el-col>
				</el-row>
				<el-row>
					<el-col span="24">
						<el-tabs v-model="activeName" @tab-click="handleClick" :size="Paramsize">
							<!-- Params参数 -->
							<el-tab-pane label="Params" name="first">
								<el-table :data="tableData" border stripe style="width: 100%;" :size="Paramsize">
										<el-table-column prop="key" label="Key">
											<template slot-scope="scope">
												<el-input v-if="scope.row.edit" v-model="scope.row.key" placeholder="Key" :size="Paramsize" @change="addUrlParams(scope.$index, scope.row)" @input="addNewRow(scope.$index, scope.row)"></el-input>
												<span v-else>{{scope.row.key}}</span>
											</template>
										</el-table-column>
										<el-table-column prop="value" label="Value">
											<template slot-scope="scope">
												<el-input v-if="scope.row.edit" v-model="scope.row.value" placeholder="Value" :size="Paramsize" @change="addUrlParams(scope.$index, scope.row)" @input="addNewRow(scope.$index, scope.row)"></el-input>
												<span v-else>{{scope.row.value}}</span>
											</template>
										</el-table-column>
										<el-table-column prop="DESCRIPTION" label="DESCRIPTION">
											<template slot-scope="scope">
												<el-input v-if="scope.row.edit" v-model="scope.row.DESCRIPTION" placeholder="DESCRIPTION" :size="Paramsize"  @input="addNewRow(scope.$index, scope.row)"></el-input>
												<span v-else>{{scope.row.DESCRIPTION}}</span>
											</template>
										</el-table-column>
										<el-table-column label="操作" :render-header="renderHeader" >
											<template slot-scope="scope">
												<el-link type="info" :underline="false" icon="el-icon-close" @click.native="deleteRow(scope.$index, scope.row)" circle></el-link>
											</template>
										</el-table-column>
									</el-table>

							</el-tab-pane>
							<el-tab-pane label="Headers" name="headers">
								<el-table :data="tableData" border stripe style="width: 100%;" :size="Paramsize">
										<el-table-column prop="key" label="Key">
											<template slot-scope="scope">
												<el-input v-if="scope.row.edit" v-model="scope.row.key" placeholder="Key" :size="Paramsize" @change="addUrlParams(scope.$index, scope.row)" @input="addNewRow(scope.$index, scope.row)"></el-input>
												<span v-else>{{scope.row.key}}</span>
											</template>
										</el-table-column>
										<el-table-column prop="value" label="Value">
											<template slot-scope="scope">
												<el-input v-if="scope.row.edit" v-model="scope.row.value" placeholder="Value" :size="Paramsize" @change="addUrlParams(scope.$index, scope.row)" @input="addNewRow(scope.$index, scope.row)"></el-input>
												<span v-else>{{scope.row.value}}</span>
											</template>
										</el-table-column>
										<el-table-column prop="DESCRIPTION" label="DESCRIPTION">
											<template slot-scope="scope">
												<el-input v-if="scope.row.edit" v-model="scope.row.DESCRIPTION" placeholder="DESCRIPTION" :size="Paramsize"  @input="addNewRow(scope.$index, scope.row)"></el-input>
												<span v-else>{{scope.row.DESCRIPTION}}</span>
											</template>
										</el-table-column>
										<el-table-column label="操作" :render-header="renderHeader" >
											<template slot-scope="scope">
												<el-link type="info" :underline="false" icon="el-icon-close" @click.native="deleteRow(scope.$index, scope.row)" circle></el-link>
											</template>
										</el-table-column>
									</el-table>
							</el-tab-pane>
							<el-tab-pane label="Body" name="body">Body</el-tab-pane>
						</el-tabs>
					</el-col>
				</el-row>
			</el-form>
			<div slot="footer" class="dialog-footer">
				<el-button @click.native="addCaseVisible = false">取消</el-button>
				<el-button type="primary" @click.native="addSubmit" :loading="addCaseLoading">提交</el-button>
			</div>
		</el-dialog>
	</section>
</template>

<script>
	import util from '@/common/js/util'

	//import NProgress from 'nprogress'
	import { getUserListPage, removeUser, batchRemoveUser, editUser, addUser } from '@/api/api';

	export default {
		data() {
			return {
				filters: {
					name: ''
				},
				users: [],
				total: 0,
				page: 1,
				listLoading: false,
				sels: [],//列表选中列

				editFormVisible: false,//编辑界面是否显示
				editLoading: false,
				editFormRules: {
					name: [
						{ required: true, message: '请输入姓名', trigger: 'blur' }
					]
				},
				//编辑界面数据
				editForm: {
					id: 0,
					name: '',
					sex: -1,
					age: 0,
					birth: '',
					addr: ''
				},

				addFormVisible: false,//新增界面是否显示
				addLoading: false,
				addFormRules: {
					name: [
						{ required: true, message: '请输入姓名', trigger: 'blur' }
					]
				},
				//新增界面数据
				addForm: {
					name: '',
					sex: -1,
					age: 0,
					birth: '',
					addr: ''
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
				tableData: [
					{
						key: '',
						value: '',
						DESCRIPTION: '',
						edit: true,
					},
				],
				// method选项
				methodOptions: [
					{
						value: 0,
						label: 'POST'
					},
					{
						value: 1,
						label: 'GET'
					},
					{
						value: 2,
						label: 'PUT'
					},
					{
						value: 3,
						label: 'PATCH'
					},
					{
						value: 4,
						label: 'DELETE'
					},
					{
						value: 5,
						label: 'COPY'
					},
					{
						value: 6,
						label: 'HEAD'
					},
					{
						value: 7,
						label: 'OPTIONS'
					},
					{
						value: 8,
						label: 'LINK'
					},
					{
						value: 9,
						label: 'UNLINK'
					},
					{
						value: 10,
						label: 'PURGE'
					},
					{
						value: 11,
						label: 'LOCK'
					},
					{
						value: 12,
						label: 'UNLOCK'
					},
					{
						value: 13,
						label: 'PROPFIND'
					},
					{
						value: 14,
						label: 'VIEW'
					}
				],
				mechodSelectValue: '',
				debugRequestLoading: false,

			}
		},
		methods: {
			// 表头操作栏按钮
 			renderHeader(h, params) {
                let a =  [
					h('el-button-group',[
						// 文字提示
						h('el-tooltip',{
							props: {
								disabled: false,
								content: "增加测试用例",
								placement: "bottom",
								effect: "light"
							},
						},
						[
							// 增加按钮
							h('el-button', {
								props: {
									size: "mini",
									type: "primary",
									icon: "el-icon-document-add"
								},
								on: {
									click: () => {
										this.handleAddCaseDialog();
									}
								}
							})
						]),
						
						h('el-tooltip',{
							props: {
								disabled: false,
								content: "全局变量",
								placement: "bottom",
								effect: "light"								
							}
						},
						[
							// 全局变量按钮
							h('el-button', {
								props: {
									size: "mini",
									type: "primary",
									icon: "el-icon-share"
								},
								on: {
									click: () => {
										this.renderAddRow();
									}
								}
							}),
						]),
						h('el-tooltip',{
							props: {
								disabled: false,
								content: "系统函数",
								placement: "bottom",
								effect: "light"								
							}
						},
						[
							// 系统函数按钮
							h('el-button', {
								props: {
									size: "mini",
									type: "primary",
									icon: "el-icon-s-flag"
								},
								on: {
									click: () => {
										this.renderAddRow();
									}
								}
							}),
						]),
					])
				]
                return h('div', a);
			},
			// 显示增加case
			handleAddCaseDialog() {
				this.addCaseVisible = true;
			},
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
			//性别显示转换
			formatSex: function (row, column) {
				return row.sex == 1 ? '男' : row.sex == 0 ? '女' : '未知';
			},
			handleCurrentChange(val) {
				this.page = val;
				this.getUsers();
			},
			//获取用户列表
			getUsers() {
				let para = {
					page: this.page,
					name: this.filters.name
				};
				// this.listLoading = true;
				//NProgress.start();
				// getUserListPage(para).then((res) => {
				// 	this.total = res.data.total;
				// 	this.users = res.data.users;
				// 	this.listLoading = false;
				// 	//NProgress.done();
				// });
			},
			//删除
			handleDel: function (index, row) {
				this.$confirm('确认删除该记录吗?', '提示', {
					type: 'warning'
				}).then(() => {
					this.listLoading = true;
					//NProgress.start();
					let para = { id: row.id };
					removeUser(para).then((res) => {
						this.listLoading = false;
						//NProgress.done();
						this.$message({
							message: '删除成功',
							type: 'success'
						});
						this.getUsers();
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
					name: '',
					sex: -1,
					age: 0,
					birth: '',
					addr: ''
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
								this.getUsers();
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
								this.getUsers();
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
				var ids = this.sels.map(item => item.id).toString();
				this.$confirm('确认删除选中记录吗？', '提示', {
					type: 'warning'
				}).then(() => {
					this.listLoading = true;
					//NProgress.start();
					let para = { ids: ids };
					batchRemoveUser(para).then((res) => {
						this.listLoading = false;
						//NProgress.done();
						this.$message({
							message: '删除成功',
							type: 'success'
						});
						this.getUsers();
					});
				}).catch(() => {

				});
			}
		},
		mounted() {
			this.getUsers();
		}
	}

</script>

<style scoped>

</style>
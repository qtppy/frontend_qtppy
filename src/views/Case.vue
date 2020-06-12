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
					<el-button type="primary" icon="el-icon-news" size="mini" @click="handleAddCaseDialog">新增</el-button>
				</el-form-item>
			</el-form>
		</el-col>

		<!--列表-->
		<el-table :data="casesData" highlight-current-row v-loading="listLoading" @selection-change="selsChange" style="width: 100%;">
			<el-table-column type="selection" width="55"></el-table-column>
			<el-table-column type="index" width="100" label="序号" sortable></el-table-column>
			<el-table-column prop="id" label="用例ID" width="120" v-if="visible"></el-table-column>
			<el-table-column prop="name" label="名称" width="120" sortable></el-table-column>
			<el-table-column prop="url" label="地址" width="120"></el-table-column>
			<el-table-column prop="method" label="方法" width="100"></el-table-column>
			<el-table-column prop="desc" label="描述" width="200" ></el-table-column>
			<el-table-column prop="createtime" label="创建时间" width="100" :formatter="formatDateDMT"></el-table-column>
			<el-table-column prop="creator" label="创建者" min-width="100"></el-table-column>
			<el-table-column label="操作" width="150" :render-header="renderHeaderCaseList">
				<template scope="scope">
					<el-button size="small" @click="handleEdit(scope.$index, scope.row)">编辑</el-button>
					<el-button type="danger" size="small" @click="handleDel(scope.$index, scope.row)">删除</el-button>
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

		<!-- 新增测试用例界面 -->
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
								<el-button type="primary" icon="el-icon-share" size="mini" style="float:right;" v-show="keyValueBthShow" @click="swapParamEditButton">Key-Value Edit</el-button>
								<!-- 文本域展示 -->
								<el-input
									type="textarea"
									:placeholder="placeholderReq"
									v-model="paramsReqTextArea"
									v-show="isParamTextAreaShow" 
									:autosize="paramsTextAreaLimt"
                  @change="paramTextAreaUrlJion">
								</el-input>
								<!-- Params参数table展示 -->
								<el-table :data="tableData" border stripe style="width: 100%;" :size="Paramsize" v-show="isParamTableShow">
										<el-table-column prop="key" label="Key">
											<template slot-scope="scope">
												<el-input v-if="scope.row.edit" v-model="scope.row.key" placeholder="Key" :size="Paramsize" @change="addUrlParams()" @input="addNewRow(scope.$index, scope.row)"></el-input>
												<span v-else>{{scope.row.key}}</span>
											</template>
										</el-table-column>
										<el-table-column prop="value" label="Value">
											<template slot-scope="scope">
												<el-input v-if="scope.row.edit" v-model="scope.row.value" placeholder="Value" :size="Paramsize" @change="addUrlParams()" @input="addNewRow(scope.$index, scope.row)"></el-input>
												<span v-else>{{scope.row.value}}</span>
											</template>
										</el-table-column>
										<el-table-column prop="DESCRIPTION" label="DESCRIPTION">
											<template slot-scope="scope">
												<el-input v-if="scope.row.edit" v-model="scope.row.DESCRIPTION" placeholder="DESCRIPTION" :size="Paramsize"  @input="addNewRow(scope.$index, scope.row)"></el-input>
												<span v-else>{{scope.row.DESCRIPTION}}</span>
											</template>
										</el-table-column>
										<el-table-column label="操作" :render-header="renderHeaderCaseNew" >
											<template slot-scope="scope">
												<el-link type="info" :underline="false" icon="el-icon-close" @click.native="deleteRow(scope.$index, scope.row)" circle></el-link>
											</template>
										</el-table-column>
									</el-table>
								<el-link type="primary" :underline="false" disabled>Response</el-link>
								<el-input
									type="textarea"
									:placeholder="placeholderRes"
									v-model="paramsResTextArea"
									v-show="true" 
									:autosize="paramsTextAreaLimt"
									disabled>
								</el-input>
							</el-tab-pane>
							<el-tab-pane label="Headers" name="headers">
								<el-table :data="tableData" border stripe style="width: 100%;" :size="Paramsize">
										<el-table-column prop="key" label="Key">
											<template slot-scope="scope">
												<el-input v-if="scope.row.edit" v-model="scope.row.key" placeholder="Key" :size="Paramsize" @change="addUrlParams()" @input="addNewRow(scope.$index, scope.row)"></el-input>
												<span v-else>{{scope.row.key}}</span>
											</template>
										</el-table-column>
										<el-table-column prop="value" label="Value">
											<template slot-scope="scope">
												<el-input v-if="scope.row.edit" v-model="scope.row.value" placeholder="Value" :size="Paramsize" @change="addUrlParams()" @input="addNewRow(scope.$index, scope.row)"></el-input>
												<span v-else>{{scope.row.value}}</span>
											</template>
										</el-table-column>
										<el-table-column prop="DESCRIPTION" label="DESCRIPTION">
											<template slot-scope="scope">
												<el-input v-if="scope.row.edit" v-model="scope.row.DESCRIPTION" placeholder="DESCRIPTION" :size="Paramsize"  @input="addNewRow(scope.$index, scope.row)"></el-input>
												<span v-else>{{scope.row.DESCRIPTION}}</span>
											</template>
										</el-table-column>
										<el-table-column label="操作" :render-header="renderHeaderCaseNew">
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
	import { getCaseList, deleteCase, batchRemoveUser, editUser, createCase } from '@/api/api';

	export default {
		data() {
			return {
				filters: {
					name: ''
				},
				casesData: [],
				total: 0,
				page: 1,
				per_page: 10,
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
				isParamTableShow: true, // Param显示table
				isParamTextAreaShow: false, // Param显示textarea
				isParamEditButtonShow: true,
				isParamBulkEditButtonShow: false,
				paramsReqTextArea : '', // param bulk edit内容 request
				paramsResTextArea : '', // param bulk edit内容 response
				paramsTextAreaLimt: { minRows: 7, maxRows: 8}, // param文本域限制
				placeholderReq: "Rows are separated by new lines\nkeys and values are separated by :\nPrepend // to any row you want to add but keep disabled",
				placeholderRes: "Hit Send to get a response",
				keyValueBthShow: false,
				Paramsize: "mini", // Params控年的size
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
			/**
			 * 用例列表，表头操作栏按钮
			 * @param {*} h 表头对象
			 * @param {*} params 表头参数
			 * @returns div html
			 */
 			renderHeaderCaseList(h, params) {
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

			/**
			 * 用例列表，增加用例Params选项卡按钮
			 * @param {*} h 表头对象
			 * @param {*} params 表头参数
			 * @returns div html
			 */
 			renderHeaderCaseNew(h, params) {
                let a =  [
					h('el-button-group',[
						// 文字提示
						h('el-tooltip',{
							props: {
								disabled: false,
								content: "批量编辑",
								placement: "bottom",
								effect: "light"
							},
						},
						[
							// 批量编辑
							h('el-button', {
								props: {
									size: "mini",
									type: "primary",
									icon: "el-icon-s-flag"
								},
								on: {
									click: () => {
										this.isParamTextAreaShow = true;
										this.isParamTableShow = false;
                    this.keyValueBthShow = true;
                    this.resetValParamTextArea();
									}
								}
							}, "Bulk Edit")
						]),
					])
				]
                return h('div', a);
			},
			/**
			 * Params Bulk Edit 与 Key-Value Edit切换
       * @param {*} null
       * @returns null
			 */
			swapParamEditButton() {
				this.isParamTextAreaShow = false;
				this.isParamTableShow = true;
				this.keyValueBthShow = false;
			},

			/**
			 * 显示增加case
			 * @param {*} null
			 * @returns null
			 */
			handleAddCaseDialog() {
				this.addCaseVisible = true;
			},

			/**
			 * Params选项卡增加新行
			 * @param {*} index 操作行索引
			 * @param {*} row 操作行对象
			 */
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

			/**
			 * Params选项卡，table删除行
			 * @param {*} index  table当前索引
			 * @param {*} row 操作行对象
			 */
			deleteRow(index, row) {
				if(index !== 0) {
					this.tableData.splice(index, 1);
          this.addUrlParams();
				};
      },
      
      /**
       * 重新给Param文本域赋值
       */
      resetValParamTextArea() {
        let dt = this.tableData;
        let txt = ''
        for (let i=0; i<dt.length; i++) {
          if (dt[i].key !== '' || dt[i].value !== '') {
            txt = txt + dt[i].key + ':' + dt[i].value + '\n'
          }
        };
        this.paramsReqTextArea = txt;
      },

			/**
			 * 新增用例基础url赋值
			 * @param {*} null
			 * @returns null
			 */
			baseUrlSet() {
				this.addCaseData.baseUrl = this.addCaseData.url;
      },
      
      /**
       * ParamTextarea  url拼接
       * @param {*} null
       * @returns null
       */
      paramTextAreaUrlJion() {
        let dt = this.paramsReqTextArea.split('\n');

        this.tableData = []
        for (let i=0; i<dt.length; i++) {
          let keyVal = dt[i].split(':');
          this.tableData.push({
            key: keyVal[0],
            value: keyVal[1],
            DESCRIPTION: '',
            edit: true
          });
        };
        this.tableData.push({
          key: '',
          value: '',
          DESCRIPTION: '',
          edit: true
        });
        this.addUrlParams();
      },

			/**
			 * Params新增测试用例，获取焦点时自动新增一空白行
			 * @param {*} index table当前行索引
			 * @param {*} row table当前行对象方便取值
			 */
			addUrlParams() {
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
					let para = { id: [row.id] };
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
			this.getCase();
		}
	}

</script>

<style scoped>

</style>
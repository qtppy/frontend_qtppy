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
				<template slot-scope="scope">
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
								<el-button slot="append" icon="el-icon-share" :loading="debugRequestLoading" @click="sendRequest">调试</el-button>
							</el-input>
						</el-form-item>
					</el-col>
				</el-row>
				<el-row>
					<el-col span="24">
						<el-tabs v-model="activeName" @tab-click="handleCaseTabClick" :size="Paramsize">
							<!-- Params参数 -->
							<el-tab-pane label="Params" name="params">
								<el-button type="primary" icon="el-icon-share" size="mini" style="float:right;" v-show="keyValueBthShow" @click="swapParamEditButton">Key-Value Edit</el-button>
								<!-- 文本域展示 -->
								<el-input
									type="textarea"
									:placeholder="placeholderReq"
									v-model="paramsReqTextArea"
									v-show="isParamTextAreaShow" 
									:autosize="paramsTextAreaLimt"
                  @change="setCaseRequestData(tableData, paramsReqTextArea, 0)">
								</el-input>
								<!-- Params参数table展示 -->
								<el-table :data="tableData" border stripe style="width: 100%;" :size="Paramsize" v-show="isParamTableShow">
										<el-table-column prop="key" label="Key">
											<template slot-scope="scope">
												<el-input v-if="scope.row.edit" v-model="scope.row.key" placeholder="Key" :size="Paramsize" @change="addUrlParams()" @input="addNewRow(0, scope.$index, scope.row)"></el-input>
												<span v-else>{{scope.row.key}}</span>
											</template>
										</el-table-column>
										<el-table-column prop="value" label="Value">
											<template slot-scope="scope">
												<el-input v-if="scope.row.edit" v-model="scope.row.value" placeholder="Value" :size="Paramsize" @change="addUrlParams()" @input="addNewRow(0, scope.$index, scope.row)"></el-input>
												<span v-else>{{scope.row.value}}</span>
											</template>
										</el-table-column>
										<el-table-column prop="DESCRIPTION" label="DESCRIPTION">
											<template slot-scope="scope">
												<el-input v-if="scope.row.edit" v-model="scope.row.DESCRIPTION" placeholder="DESCRIPTION" :size="Paramsize"  @input="addNewRow(0, scope.$index, scope.row)"></el-input>
												<span v-else>{{scope.row.DESCRIPTION}}</span>
											</template>
										</el-table-column>
										<el-table-column label="操作" :render-header="renderHeaderCaseNew" >
											<template slot-scope="scope">
												<el-link type="info" :underline="false" icon="el-icon-close" @click.native="deleteRow(1, scope.$index, scope.row)" circle></el-link>
											</template>
										</el-table-column>
									</el-table>
							</el-tab-pane>
              <!-- Header table展示 -->
							<el-tab-pane label="Headers" name="headers">
                <el-button type="primary" icon="el-icon-share" size="mini" style="float:right;" v-show="isHeaderTextAreaButton" @click="sawpHeaderEditButton">Key-Value Edit</el-button>
                <!-- 文本域展示 -->
								<el-input
									type="textarea"
									:placeholder="placeholderReq"
									v-model="headerTextArea"
									v-show="isHeaderTextAreaShow" 
									:autosize="paramsTextAreaLimt"
                  @change="setCaseRequestData(headerTableData, headerTextArea, 1)">
								</el-input>
								<el-table :data="headerTableData" border stripe style="width: 100%;" :size="Paramsize" v-show="isHeaderTabShowTable">
										<el-table-column prop="key" label="Key">
											<template slot-scope="scope">
												<el-input v-if="scope.row.edit" v-model="scope.row.key" placeholder="Key" :size="Paramsize" @input="addNewRow(1, scope.$index, scope.row)"></el-input>
												<span v-else>{{scope.row.key}}</span>
											</template>
										</el-table-column>
										<el-table-column prop="value" label="Value">
											<template slot-scope="scope">
												<el-input v-if="scope.row.edit" v-model="scope.row.value" placeholder="Value" :size="Paramsize" @input="addNewRow(1, scope.$index, scope.row)"></el-input>
												<span v-else>{{scope.row.value}}</span>
											</template>
										</el-table-column>
										<el-table-column prop="DESCRIPTION" label="DESCRIPTION">
											<template slot-scope="scope">
												<el-input v-if="scope.row.edit" v-model="scope.row.DESCRIPTION" placeholder="DESCRIPTION" :size="Paramsize"  @input="addNewRow(1, scope.$index, scope.row)"></el-input>
												<span v-else>{{scope.row.DESCRIPTION}}</span>
											</template>
										</el-table-column>
										<el-table-column label="操作" :render-header="renderHeaderCaseHeader">
											<template slot-scope="scope">
												<el-link type="info" :underline="false" icon="el-icon-close" @click.native="deleteRow(2, scope.$index, scope.row)" circle></el-link>
											</template>
										</el-table-column>
								</el-table>
							</el-tab-pane>
              <!-- Body tab -->
							<el-tab-pane label="Body" name="body">
                <el-radio-group v-model="bodyRadio" size="mini" @change="bodyRadioChange">
                  <el-radio :label="1">none</el-radio>
                  <el-radio :label="2">form-data</el-radio>
                  <el-radio :label="3">x-www-form-urlencoded</el-radio>
                  <el-radio :label="4">raw</el-radio>
                </el-radio-group>
                <el-divider content-position="left"></el-divider>
                <el-button type="primary" icon="el-icon-share" size="mini" style="float:right;" v-show="isbodyTextAreaButton" @click="sawpBodyEditButton">Key-Value Edit</el-button>
                <!-- 文本域展示 -->
								<el-input
									type="textarea"
									:placeholder="placeholderReq"
									v-model="bodyTextArea"
									v-show="isbodyTextAreaShow" 
									:autosize="paramsTextAreaLimt"
                  @change="setCaseRequestData(bodyTableData, bodyTextArea, 2)">
								</el-input>
								<el-table :data="bodyTableData" border stripe style="width: 100%;" :size="Paramsize" v-show="isBodyTabShowTable">
										<el-table-column prop="key" label="Key">
											<template slot-scope="scope">
												<el-input v-if="scope.row.edit" v-model="scope.row.key" placeholder="Key" :size="Paramsize" @input="addNewRow(2, scope.$index, scope.row)"></el-input>
												<span v-else>{{scope.row.key}}</span>
											</template>
										</el-table-column>
										<el-table-column prop="value" label="Value">
											<template slot-scope="scope">
												<el-input v-if="scope.row.edit" v-model="scope.row.value" placeholder="Value" :size="Paramsize" @input="addNewRow(2, scope.$index, scope.row)"></el-input>
												<span v-else>{{scope.row.value}}</span>
											</template>
										</el-table-column>
										<el-table-column prop="DESCRIPTION" label="DESCRIPTION">
											<template slot-scope="scope">
												<el-input v-if="scope.row.edit" v-model="scope.row.DESCRIPTION" placeholder="DESCRIPTION" :size="Paramsize"  @input="addNewRow(2, scope.$index, scope.row)"></el-input>
												<span v-else>{{scope.row.DESCRIPTION}}</span>
											</template>
										</el-table-column>
										<el-table-column label="操作" :render-header="renderHeaderCaseBody">
											<template slot-scope="scope">
												<el-link type="info" :underline="false" icon="el-icon-close" @click.native="deleteRow(3, scope.$index, scope.row)" circle></el-link>
											</template>
										</el-table-column>
								</el-table>
              </el-tab-pane>
              <el-link type="primary" :underline="false" disabled v-show="ressponseShow">Response</el-link>
              <el-input
                type="textarea"
                :placeholder="placeholderRes"
                v-model="paramsResTextArea"
                v-show="ressponseShow" 
                :autosize="paramsTextAreaLimt"
                disabled>
              </el-input>
              <!-- 出参 -->
              <el-tab-pane label="出参" name="output">
								<el-table :data="bodyTableData" border stripe style="width: 100%;" :size="Paramsize" v-show="true">
										<el-table-column prop="key" label="Key">
											<template slot-scope="scope">
												<el-input v-if="scope.row.edit" v-model="scope.row.key" placeholder="Key" :size="Paramsize" @input="addNewRow(2, scope.$index, scope.row)"></el-input>
												<span v-else>{{scope.row.key}}</span>
											</template>
										</el-table-column>
										<el-table-column prop="value" label="Value">
											<template slot-scope="scope">
												<el-input v-if="scope.row.edit" v-model="scope.row.value" placeholder="Value" :size="Paramsize" @input="addNewRow(2, scope.$index, scope.row)"></el-input>
												<span v-else>{{scope.row.value}}</span>
											</template>
										</el-table-column>
										<el-table-column prop="DESCRIPTION" label="DESCRIPTION">
											<template slot-scope="scope">
												<el-input v-if="scope.row.edit" v-model="scope.row.DESCRIPTION" placeholder="DESCRIPTION" :size="Paramsize"  @input="addNewRow(2, scope.$index, scope.row)"></el-input>
												<span v-else>{{scope.row.DESCRIPTION}}</span>
											</template>
										</el-table-column>
										<el-table-column label="操作">
											<template slot-scope="scope">
												<el-link type="danger" :underline="false" icon="el-icon-delete" @click.native="deleteRow(scope.$index, scope.row)" circle></el-link>
											</template>
										</el-table-column>
								</el-table>
              </el-tab-pane>
              <el-tab-pane label="断言" name="assert">Assert</el-tab-pane>
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
        /**
         * 用例列表
         * @var filters: 用例列表筛选
         * @var casesData: 存储列表数据
         * @var total: 用例列表总条数
         * @var page: 用例列表当前默认页
         * @var per_page: 用例列表分页条数，后端传值
         * @var listLoading: 用例列表加载时状态
         * @var sels: 用例列表筛选数据存储
         */
				filters: {
					name: ''
				},
				casesData: [],
				total: 0,
				page: 1,
				per_page: 10,
				listLoading: false,
				sels: [],//列表选中列

        /**
         * 编辑界面
         */
				editFormVisible: false,
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

        /**
         * 新增测试用例界面配置
         * @var addCaseLoading: 提交新增时按钮显示loading状态
         * @var addCaseVisible: 新增用例胃里面dialog显示控制
         * @var addCaseSize: 增加界面控件显示size控制
         */
				addCaseLoading: false,
				addCaseVisible: false,
				addCaseSize: 'small',

        /**
         * 新增测试用例数据
         * @var method: POST OR GET ...
         * @var url: 请求url
         * @var urlIndex: url初始化索引，第一拼接为0
         * @var baseURl: 存储初始化url
         * @var header: 请求头信息
         */
				addCaseData: {
					method: '',
					url: '',
					urlIndex: 0,
          baseUrl: '',
          header: '',
          body: {
            how: '',
            body: ''
          },

				},
        /**
         * 新增界面table的一些配置
         * @var isParamTableShow: Param显示table
         * @var isParamTextAreaShow: Param显示textarea
         * @var isParamEditButtonShow: key-value模式下edit按钮显示
         * @var isParamBulkEditButtonShow: 表格模式下BulkEdit按钮显示
         * @var paramsReqTextArea: ParamsReqTextArea文本域内容
         * @var paramsResTextArea: Resonpon内容
         * @var paramsTextAreaLimt: 文本域大小限制
         * @var placeholderReq: 文本域模式下默认展示内容
         * @var placeholderRes: 文本域模式下Resonpon默认展示内容
         * @var keyValueBthShow: key-value按钮显示控制
         * @var Paramsize: Params控年的size
         * @var tableData: Params内容
         * @var ressponseShow: 响应textarea和label
         * @var caseTabindex: tab点击状态
         */
				isParamTableShow: true,
				isParamTextAreaShow: false,
				isParamEditButtonShow: true,
				isParamBulkEditButtonShow: false,
        paramsReqTextArea : '',
        ressponseShow: true,
        caseTabindex: 1,
				paramsResTextArea : '',
				paramsTextAreaLimt: { minRows: 7, maxRows: 8},
				placeholderReq: "Rows are separated by new lines\nkeys and values are separated by :\nPrepend // to any row you want to add but keep disabled",
				placeholderRes: "Hit Send to get a response",
				keyValueBthShow: false,
				Paramsize: "mini",
				tableData: [
					{
						key: '',
						value: '',
						DESCRIPTION: '',
						edit: true,
					},
        ],

        /**
         * 新增用例Header Tab数据存储
         * @var headerTableData
         * @var headerTextArea 请求头文本域内容存储
         * @var isHeaderTextAreaShow 文本域是否显示
         * @var isHeaderTabShowTable 请求header tab头table显示
         */
        isHeaderTextAreaButton: false,
        isHeaderTabShowTable: true,
        isHeaderTextAreaShow: false,
        headerTextArea: '',
        headerTableData: [
          {
            key: '',
            value: '',
            DESCRIPTION: '',
            edit: true,
          }
        ],
        /**
         * Body
         * @var bodyRadio el-radio-group v-model
         * @var bodyTableData 请求body数据
         * @var bodyTextArea body文本域内容
         * @var isbodyTextAreaShow body文本域显示
         * @var isBodyTabShowTable table显示
         */
        bodyRadio: 1,
        bodyTableData: [
          {
          key: '',
          value: '',
          DESCRIPTION: '',
          edit: true,
          }
        ],
        bodyTextArea: '',
        isbodyTextAreaShow: false, 
        isBodyTabShowTable: false,
        /**
         * 出参
         */
        outputArgsData: [
          {
            name: '',
            exp: '',
            match: '',
            source: [
              {
                value: 0,
                label: 'Body: TEXT'
              },
              {
                value: 1,
                label: 'Body: JSON'
              },
              {
                value: 2,
                label: 'Header: K/V'
              },
              {
                value: 3,
                label: 'Cookie: K/V'
              },
              {
                value: 4,
                label: '响应状态码'
              }
            ],
            edit: true
          }
        ],
        /**
         * method选项内容
         * @var methodOptions: method列表内容
         * @var mechodSelectValue: 列表默认值
         * @var debugRequestLoading：点调试按钮加载状态
         */
				methodOptions: [
					{
						value: 0,
						label: 'GET'
					},
					{
						value: 1,
						label: 'POST'
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
				mechodSelectValue: 0,
				debugRequestLoading: false,
			}
		},
		methods: {
      /**
       * body radio @change
       * @var isBodyTabShowTable 控制none内容显示
       * @var label redio自动传的选择value
       */
      bodyRadioChange(label) {
        if (label === 1) {
          this.isBodyTabShowTable = false;
          this.isbodyTextAreaShow = false;
          this.isbodyTextAreaButton = false;

        } else if(label === 4){
          this.isBodyTabShowTable = false;
          this.isbodyTextAreaShow = true;
          this.isbodyTextAreaButton = false;
          this.placeholderReq = '';

        }else{
          this.isBodyTabShowTable = true;
          this.isbodyTextAreaShow = false;
          this.isbodyTextAreaButton = false;
        };
        
      },

      /**
       * 新增测试用例;调试功能
       */
      sendRequest() {
        this.initRequestData();
        console.log(this.addCaseData)
      },
      /**
       * 整理请求头
       * @description 请求Params数据无需整，已初始化到url中
       */
      initRequestData() {
        // 请求头数据
        let headerArr = this.headerTableData;
        let headerMap = {};
        for (let i=0; i<headerArr.length; i++) {
          if (headerArr[i].key!=='') {
            headerMap[headerArr[i].key] = headerArr[i].value;
          };
        };
        this.addCaseData.header = headerMap;

        // method数据
        let obj = {};
        obj = this.methodOptions.find((item) => {
          return item.value === this.mechodSelectValue;
        })
        this.addCaseData.method = obj.label;

        // body数据
        if (this.bodyRadio === 4) {
          this.addCaseData.body.body = this.bodyTextArea;
        }else {
          let bodyArr = this.bodyTableData;
          let bodyMap = {};
          for (let i=0; i<bodyArr.length; i++) {
            if (bodyArr[i].key!=='') {
              bodyMap[bodyArr[i].key] = bodyArr[i].value;
            };
          };
          this.addCaseData.body.body = bodyMap;
        };
        this.addCaseData.body.how = this.bodyRadio;
      },

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
                    this.resetValParamTextArea(this.tableData, 0);
									}
								}
							}, "Bulk Edit")
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
 			renderHeaderCaseHeader(h, params) {
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
                    this.isHeaderTextAreaShow = true;
                    this.isHeaderTabShowTable = false;
                    this.isHeaderTextAreaButton = true;
                    this.resetValParamTextArea(this.headerTableData, 1);
									}
								}
							}, "Bulk Edit")
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
 			renderHeaderCaseBody(h, params) {
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
                    this.isbodyTextAreaShow = true;
                    this.isBodyTabShowTable = false;
                    this.isbodyTextAreaButton = true;
                    this.resetValParamTextArea(this.bodyTableData, 2);
									}
								}
							}, "Bulk Edit")
						]),
					])
				]
        return h('div', a);
      },
      /**
       * 新增用例tab切换
       */
      handleCaseTabClick(tab, event) {
        if (tab.name === "assert" || tab.name === "output") {
          this.ressponseShow = false;
        }else{
          this.ressponseShow = true;
        };
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
			 * Header Bulk Edit 与 Key-Value Edit切换
       * @param {*} null
       * @returns null
			 */
      sawpHeaderEditButton() {
        this.isHeaderTextAreaShow = false;
        this.isHeaderTabShowTable = true;
        this.isHeaderTextAreaButton = false;
      },

      /**
       * body Bulk Edit 与 key-Value Edit切换
       * @param {*} null
       * @returns null
       */
      sawpBodyEditButton() {
        this.isbodyTextAreaShow = false;
        this.isbodyTextAreaButton = false;
        this.isBodyTabShowTable = true;
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
       * @param {*} tabIndex
       * 0: params
       * 1: header
       * 2: body
			 */
			addNewRow(tabIndex, index, row) {
        if(tabIndex === 0) {
          if(index ==this.tableData.length - 1) {
            this.tableData.push({
              key: '',
              value: '',
              DESCRIPTION: '',
              edit: true,					
            });
          };
        } else if(tabIndex === 1) {
          if(index ==this.headerTableData.length - 1) {
            this.headerTableData.push({
              key: '',
              value: '',
              DESCRIPTION: '',
              edit: true,					
            });
          };
        } else if(tabIndex === 2) {
          if(index ==this.bodyTableData.length - 1) {
            this.bodyTableData.push({
              key: '',
              value: '',
              DESCRIPTION: '',
              edit: true,					
            });
          };         
        };
			},

			/**
			 * Params选项卡，table删除行
			 * @param {*} index  table当前索引
			 * @param {*} row 操作行对象
			 */
			deleteRow(tableIndex, index, row) {
				if(index !== 0) {
          if (tableIndex === 1) {
            this.tableData.splice(index, 1);
            this.addUrlParams();
          } else if(tableIndex === 2) {
            this.headerTableData.splice(index, 1);
          } else if(tableIndex === 3) {
            this.bodyTableData.splice(index, 1);
          };
				};
      },
      
      /**
       * 重新给Param文本域赋值
       * @param dt 存储table数据变量this.tableData
       * @param index 
       * @var index 0:this.tabledata
       * @var index 1:this.headerTableData
       */
      resetValParamTextArea(dt, index) {
        let txt = ''
        for (let i=0; i<dt.length; i++) {
          if (dt[i].key !== '' || dt[i].value !== '') {
            txt = txt + dt[i].key + ':' + dt[i].value + '\n'
          }
        };
        if(index === 0) {
          this.paramsReqTextArea = txt;
        }else if(index === 1) {
          this.headerTextArea = txt;
        }else if(index === 2) {
          this.bodyTextArea = txt;
        };
        
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
       * @param {*} tableObj params  header数据存储变量this.tabledata
       * @param {*} index 0:this.tabledata; 1:this.header
       * @returns null
       */
      setCaseRequestData(tableObj, textarea, index) {
        let dt = textarea.split('\n');

        tableObj = []
        for (let i=0; i<dt.length; i++) {
          let keyVal = dt[i].split(':');
          // keyVal长度大于1，才是有效值
          if ( keyVal.length > 1) {
            tableObj.push({
              key: keyVal[0],
              value: keyVal[1],
              DESCRIPTION: '',
              edit: true
            });
          };
        };
        tableObj.push({
          key: '',
          value: '',
          DESCRIPTION: '',
          edit: true
        });
        if (index === 0) {
          this.tableData = tableObj;
          this.addUrlParams();
        }else if(index === 1) {
          this.headerTableData = tableObj;
        }else if(index === 2) {
          this.bodyTableData = tableObj;
        };
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

<style scoped-slot>

</style>
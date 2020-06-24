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
					<el-button type="primary" icon="el-icon-search" size="mini" v-on:click="getCase">查询</el-button>
				</el-form-item>
				<el-form-item>
					<el-button type="primary" icon="el-icon-news" size="mini" @click="handleAddCaseDialog">新增</el-button>
				</el-form-item>
			</el-form>
		</el-col>

		<!--列表-->
		<el-table :data="casesData" highlight-current-row v-loading="listLoading" @selection-change="selsChange" style="width: 100%;" size="mini">
			<el-table-column type="selection" width="55"></el-table-column>
			<el-table-column type="index" width="100" label="序号" sortable></el-table-column>
			<el-table-column prop="id" label="用例ID" width="120" v-if="visible"></el-table-column>
			<el-table-column prop="name" label="名称" width="120" sortable></el-table-column>
			<el-table-column prop="url" label="地址" width="120"></el-table-column>
			<el-table-column prop="method" label="方法" width="100"></el-table-column>
			<el-table-column prop="desc" label="描述" width="200" ></el-table-column>
			<el-table-column prop="createtime" label="创建时间" width="100" :formatter="formatDateDMT"></el-table-column>
			<el-table-column prop="creator" label="创建者" min-width="100"></el-table-column>
			<el-table-column label="操作" width="150">
        <template slot="header" slot-scope>
          <el-button-group>
            <el-tooltip :disabled="false" placement="bottom" effect="light" content="增加测试用例">
              <el-button size="mini" type="primary" icon="el-icon-document-add" @click="caseListClick"></el-button>
            </el-tooltip>
            <el-tooltip :disabled="false" placement="bottom" effect="light" content="全局变量">
              <el-button size="mini" type="primary" icon="el-icon-share" @click="caseListClick"></el-button>
            </el-tooltip>
            <el-tooltip :disabled="false" placement="bottom" effect="light" content="系统函数">
              <el-button size="mini" type="primary" icon="el-icon-s-flag" @click="caseListClick"></el-button>
            </el-tooltip>
          </el-button-group>  
        </template>
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

		<!-- 编辑界面
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
		</el-dialog> -->

		<!-- 新增测试用例界面 -->
		<el-dialog :title="addCaseTitle" :fullscreen="true" :visible="addCaseVisible" :close-on-click-modal="false" @close="addCaseVisible = false">
			<el-form :model="addCaseData" label-width="3px" ref="addSuiteData">
				<el-row>
					<el-col :span="12">
						<el-form-item prop="method">
							<el-input placeholder="请输入请求URL" v-model="addCaseData.url" class="input-with-select" @change="baseUrlSet" size="small">
								<el-select v-model="mechodSelectValue" placeholder="Method" slot="prepend" style="width:120px;">
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
          <el-col :span="6"></el-col>
          <el-col :span="6">
            <el-button type="info" icon="el-icon-copy-document" @click.native="addSubmit" :loading="addCaseLoading" plain size="small">保存</el-button>
          </el-col>
				</el-row>
				<el-row>
					<el-col :span="24">
						<el-tabs v-model="requestBodyTab" @tab-click="handleCaseTabClick" :size="Paramsize">
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
								<el-table :data="tableData" border stripe style="width: 100%;" size="mini" v-show="isParamTableShow">
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
										<el-table-column label="操作">
                      <template slot="header" slot-scope>
                        <el-button-group>
                          <el-tooltip :disabled="false" placement="bottom" effect="light">批量编辑</el-tooltip>
                          <el-button size="mini" type="primary" icon="el-icon-s-flag" @click="paramBulkEditClick">Bulk Edit</el-button>
                        </el-button-group>  
                      </template>
											<template slot-scope="scope">
												<el-link type="info" v-if="tableData.length > 1" :underline="false" icon="el-icon-close" @click.native="deleteRow(1, scope.$index, scope.row)" circle></el-link>
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
										<el-table-column label="操作">
                      <template slot="header" slot-scope>
                        <el-button-group>
                          <el-tooltip :disabled="false" placement="bottom" effect="light">批量编辑</el-tooltip>
                          <el-button size="mini" type="primary" icon="el-icon-s-flag" @click="headerBulkEditClick">Bulk Edit</el-button>
                        </el-button-group>                       
                      </template>
											<template slot-scope="scope">
												<el-link type="info" v-if="headerTableData.length > 1" :underline="false" icon="el-icon-close" @click.native="deleteRow(2, scope.$index, scope.row)" circle></el-link>
											</template>
										</el-table-column>
								</el-table>
							</el-tab-pane>
              <!-- Body tab -->
							<el-tab-pane label="Body" name="body">
                <el-radio-group v-model="bodyRadio" :size="addCaseData.size" @change="bodyRadioChange">
                  <el-radio :label="1">none</el-radio>
                  <el-radio :label="2">form-data</el-radio>
                  <el-radio :label="3">x-www-form-urlencoded</el-radio>
                  <el-radio :label="4">raw</el-radio>
                </el-radio-group>
                <el-divider content-position="left"></el-divider>
                <el-button type="primary" icon="el-icon-share" size="mini" style="float:right;" v-show="addCaseData.isbodyTextAreaButton" @click="sawpBodyEditButton">Key-Value Edit</el-button>
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
                        <el-input v-if="scope.row.edit" v-model="scope.row.key" placeholder="Key" :size="Paramsize" @input="addNewRow(2, scope.$index, scope.row)">
                          <el-select v-model="scope.row.fromSelect" slot="append" style="width: 70px;" @change="formDataSelectChange(scope.$index, scope.row)">
                            <el-option
                              v-for="item in formDataOptions"
                              :key="item.value"
                              :label="item.label"
                              :value="item.value">
                            </el-option>
                          </el-select>
                        </el-input>
                        <span v-else>{{scope.row.key}}</span>
											</template>
										</el-table-column>
										<el-table-column prop="value" label="Value">
											<template slot-scope="scope">
												<el-input v-if="scope.row.valueEdit" v-model="scope.row.value" placeholder="Value" :size="Paramsize" @input="addNewRow(2, scope.$index, scope.row)"></el-input>
												<span v-else>{{scope.row.value}}</span>
                        <!-- 上传 -->
                        <el-upload
                          class="upload-demo"
                          action="/api/case/upload"
                          :auto-upload="true"
                          :limit="1"
                          :on-remove="file => handleRemove(file, scope.row)"
                          :on-exceed="handleExceed"
                          :on-success="response => handleSuccess(response, scope.row)"
                          v-if="scope.row.fromValSelect">
                          <el-button type="info" size="mini">选择文件</el-button>
                        </el-upload>
											</template>
										</el-table-column>
										<el-table-column prop="DESCRIPTION" label="DESCRIPTION">
											<template slot-scope="scope">
												<el-input v-if="scope.row.edit" v-model="scope.row.DESCRIPTION" placeholder="DESCRIPTION" :size="Paramsize"  @input="addNewRow(2, scope.$index, scope.row)"></el-input>
												<span v-else>{{scope.row.DESCRIPTION}}</span>
											</template>
										</el-table-column>
										<el-table-column label="操作" scoped-slot>
											<template slot="header">
                        <el-button-group>
                          <el-tooltip :disabled="false" placement="bottom" effect="light">批量编辑</el-tooltip>
                          <el-button size="mini" type="primary" icon="el-icon-s-flag" @click="BodyBulkEditClick">Bulk Edit</el-button>
                        </el-button-group>
											</template>
                      <template slot-scope="scope">
                        <el-link type="info" v-if="bodyTableData.length > 1" :underline="false" icon="el-icon-close" @click.native="deleteRow(3, scope.$index, scope.row)" circle></el-link>
                      </template>
										</el-table-column>
								</el-table>
              </el-tab-pane>
              <!-- 出参 -->
              <el-tab-pane label="出参" name="output">
								<el-table :data="outputArgsData" border stripe style="width: 100%;" :size="Paramsize" v-show="true">
										<el-table-column prop="name" label="出参名">
											<template slot-scope="scope">
												<el-input v-if="scope.row.edit" v-model="scope.row.name" placeholder="输入出参名称" :size="Paramsize" @input="addNewRow(3, scope.$index, scope.row)"></el-input>
												<span v-else>{{scope.row.name}}</span>
											</template>
										</el-table-column>
										<el-table-column prop="source" label="来源">
											<template slot-scope="scope">
                        <el-select v-model="scope.row.source" size="mini" @change="outArgsSelectChange(scope.$index, scope.row)">
                          <el-option
                            v-for="item in outPutArgsOptions"
                            :key="item.value"
                            :label="item.label"
                            :value="item.value">
                          </el-option>
                        </el-select>
											</template>
										</el-table-column>
										<el-table-column prop='exp' label="解析表达式" scoped-slot>
                      <template slot='header'>
                        <span>解析表达式</span>
                        <el-tooltip  placement="bottom" effect="light">
                          <div slot="content">
                            Example:<br/>
                            1.Body.Text 正则表达式<br/>
                            常见正则表达式中使用到的字符范围示例如下:<br/>
                            英文字母:[a-zA-Z]<br/>
                            数字:[0-9]<br/>
                            中文字符范围:[\u4e00-\u9fa5]<br/>
                            中文、英文、数字：[\u4e00-\u9fa5a-zA-Z0-9]<br/>
                            指定符合条件的字符个数：[a-zA-Z]{2,4} 表示2-4个字符；{2}表示字符个数为2个。<br/>
                            注意：尽量不要使用*,否则0个也会匹配到<br/>
                            <br/>
                            2.Body.Json JSON串<br/>
                            示例: result开头<br/>
                            {"errcode":0, "errmsg": "success", "res":{"cno": 163285, "ak":[1,2,3]}}<br/>
                            取值字典: result.res.cno<br/>
                            取值数组: result.res.ak[1]<br/>
                            <br/>
                            3.Header: K/V<br/>
                            header头部取值，输入要取值的key即可<br/>
                            示例: content-type<br/>
                            <br/>
                            4.Cookie: K/V<br/>
                            cookie取值，输入要取值的key即可<br/>
                            示例: session<br/>
                            <br/>
                            5.响应状态码<br/>
                            输入整型的状态码即可<br/>
                            示例: 200
                          </div>
                          <el-link type="success" icon="el-icon-question" :underline="false"></el-link>
                        </el-tooltip>
                      </template>
											<template slot-scope="scope">
												<el-input v-if="scope.row.expEdit" v-model="scope.row.exp" placeholder="输入出参提取表达式" :size="Paramsize"  @input="addNewRow(3, scope.$index, scope.row)"></el-input>
												<span v-else>{{scope.row.exp}}</span>
											</template>
										</el-table-column>
										<el-table-column prop="match" scope-slot>
                      <template slot="header">
                        <span>第几个匹配</span>
                        <el-tooltip placement="bottom" effect="light">
                          <div slot="content">
                            当表达式匹配到多处<br/>
                            时，指定第几个字符串<br/>
                            作为出参。从0开始，<br/>
                            -n表示倒数第n个，<br/>
                            正负均不可超过99。<br/>
                            若想随机取匹配对象，<br/>
                            填写random。
                          </div>
                          <el-link type="success" icon="el-icon-question" :underline="false"></el-link>
                        </el-tooltip>
                      </template>
											<template slot-scope="scope">
												<el-input v-if="scope.row.matchEdit" v-model="scope.row.match" placeholder="" :size="Paramsize"  @input="addNewRow(3, scope.$index, scope.row)"></el-input>
												<span v-else>{{scope.row.match}}</span>
											</template>
										</el-table-column>
										<el-table-column label="操作">
											<template slot-scope="scope">
												<el-link type="danger" v-if="outputArgsData.length > 1" :underline="false" icon="el-icon-delete" @click.native="deleteRow(4, scope.$index, scope.row)" circle></el-link>
											</template>
										</el-table-column>
								</el-table>
              </el-tab-pane>
              <!-- 断言tab -->
              <el-tab-pane label="断言" name="assert">
								<el-table :data="assertData" border stripe style="width: 100%;" :size="Paramsize" v-show="true">
										<el-table-column prop="checkType" label="断言类型">
											<template slot-scope="scope">
                        <el-select v-model="scope.row.checkType" size="mini" @change="assertSelectChange(scope.$index, scope.row)">
                          <el-option
                            v-for="item in assertTypeOptions"
                            :key="item.value"
                            :label="item.label"
                            :value="item.value">
                          </el-option>
                        </el-select>
											</template>
										</el-table-column>
										<el-table-column prop="checkObject" label="断言对象">
											<template slot-scope="scope">
												<el-input v-if="scope.row.objectEdit" v-model="scope.row.checkObject" placeholder="请输入断言对象"  :disabled="scope.row.assertCheckobjectDisabled" :size="Paramsize" @input="addNewRow(3, scope.$index, scope.row)"></el-input>
												<!-- <span v-else>{{scope.row.checkObject}}</span> -->
                        <el-select v-else v-model="scope.row.checkObject" size="mini">
                          <el-option
                            v-for="item in assertCheckobjectOutArgs"
                            :key="item.value"
                            :label="item.label"
                            :value="item.value">
                          </el-option>
                        </el-select>
											</template>
										</el-table-column>
										<el-table-column prop="checkCondition" label="断言条件">
											<template slot-scope="scope">
                        <el-select v-model="scope.row.checkCondition" size="mini" @change="outArgsSelectChange(scope.$index, scope.row)">
                          <el-option
                            v-for="item in assertCondiationOptions"
                            :key="item.value"
                            :label="item.label"
                            :value="item.value">
                          </el-option>
                        </el-select>
											</template>
										</el-table-column>
										<el-table-column prop="checkContent" label="断言内容">
											<template slot-scope="scope">
												<el-input v-if="scope.row.edit" v-model="scope.row.checkContent" placeholder="输入期望值" :size="Paramsize"  @input="addNewRow(3, scope.$index, scope.row)"></el-input>
												<span v-else>{{scope.row.checkContent}}</span>
											</template>
										</el-table-column>
										<el-table-column label="操作">
											<template slot-scope="scope">
												<el-link type="danger" v-if="assertData.length > 1" :underline="false" icon="el-icon-delete" @click.native="deleteRow(5, scope.$index, scope.row)" circle></el-link>
											</template>
										</el-table-column>
								</el-table>
              </el-tab-pane>
						</el-tabs>
					</el-col>
				</el-row>
        <el-row>
          <el-tabs v-model="responseBodyTab" size="mini" v-loading="responseLoading"     
          element-loading-text="Send Request..."
          element-loading-spinner="el-icon-loading">
            <!-- Response body-->
            <el-tab-pane label="Body" name="responseBody">
              <el-input
                type="textarea"
                :placeholder="placeholderRes"
                v-model="paramsResTextArea"
                :autosize="paramsTextAreaLimt"
                :readonly="responseReadOnly">
              </el-input>
            </el-tab-pane>
            <!-- Response headers -->
            <el-tab-pane label="Headers" name="responseHeaders">
              <el-table :data="responseHeaderData" border stripe style="width: 100%;" :size="Paramsize" v-show="true">
										<el-table-column prop="key" label="Key">
											<template slot-scope="scope">
												<el-input v-if="scope.row.key" v-model="scope.row.key" :size="Paramsize" :readonly="responseReadOnly"></el-input>
												<span v-else>{{scope.row.key}}</span>
											</template>
										</el-table-column>
										<el-table-column prop="value" label="Value">
											<template slot-scope="scope">
												<el-input v-if="scope.row.value" v-model="scope.row.value" :size="Paramsize" :readonly="responseReadOnly"></el-input>
												<span v-else>{{scope.row.value}}</span>
											</template>
										</el-table-column>
								</el-table>
            </el-tab-pane>
            <!-- Response Cookies-->
            <el-tab-pane label="Cookies" name="responseCookies">
              <el-table :data="responseCookiesData" border stripe style="width: 100%;" :size="Paramsize" v-show="true">
										<el-table-column prop="key" label="Key">
											<template slot-scope="scope">
												<el-input v-if="scope.row.key" v-model="scope.row.key" :size="Paramsize" :readonly="responseReadOnly"></el-input>
												<span v-else>{{scope.row.key}}</span>
											</template>
										</el-table-column>
										<el-table-column prop="value" label="Value">
											<template slot-scope="scope">
												<el-input v-if="scope.row.value" v-model="scope.row.value" :size="Paramsize" :readonly="responseReadOnly"></el-input>
												<span v-else>{{scope.row.value}}</span>
											</template>
										</el-table-column>
								</el-table>
            </el-tab-pane>        
          </el-tabs>
        </el-row>
			</el-form>
		</el-dialog>
	</section>
</template>

<script>
	import util from '@/common/js/util'
  import { validateURL } from '@/common/js/validate'
	//import NProgress from 'nprogress'
	import { getCaseList, deleteCase, batchRemoveUser, editUser, createCase, debugCase } from '@/api/api';
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
         * @var editFormVisible 编辑界而显示
         */
				filters: {
					name: ''
				},
        casesData: [],
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

        /**
         * 新增测试用例界面配置
         * @var addCaseLoading: 提交新增时按钮显示loading状态
         * @var addCaseVisible: 新增用例胃里面dialog显示控制
         * @var addCaseSize: 增加界面控件显示size控制
         * @var visible: 用例ID show
         */
				addCaseLoading: false,
				addCaseVisible: false,
        addCaseSize: 'mini',
        visible: false,
        addCaseTitle: '用例管理 / 新增用例',

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
          outParam: '',
          assertData: '',
          isbodyTextAreaButton: false,
          size: 'mini',
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
        requestBodyTab: 'body',
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
        formDataOptions: [
          {
            value: 1,
            label: 'Text'
          },
          {
            value: 2,
            label: 'File'
          }
        ],
        bodyRadio: 1,
        bodyTableData: [
          {
          key: '',
          value: '',
          DESCRIPTION: '',
          edit: true,
          fromSelect: 1,
          fromValSelect: false,
          valueEdit: true,
          file: {
            key: '',
            name: ''
          },
          }
        ],
        bodyTextArea: '',
        isbodyTextAreaShow: false, 
        isBodyTabShowTable: false,
        fromDataCurrentRowIndex: '',
        /**
         * 出参
         * @var outPutArgsOptions 出参来源下拉列表
         * @var outputArgsData 出参数据
         */
        outPutArgsOptions: [
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
        outputArgsData: [
          {
            name: '',
            exp: '',
            match: 0,
            edit: true,
            source: 0,
            expEdit: true,
            matchEdit: false, 
          },
        ],

        /**
         * 断言
         * @var assertData 检查点数据
         */
        assertData: [
          {
            type: 0,
            checkObject: '',
            checkCondition: 0,
            checkContent: '',
            checkType: '',
            edit: true,
            assertCheckobjectDisabled: false,
            assertCheckobjectOptionShow: false,
            assertCheckobjectShow: true,
            objectEdit: true,
          },
        ],
        assertTypeOptions: [
          {
            value: 0,
            label: '响应header'
          },          
          {
            value: 1,
            label: '响应状态码'
          },          
          {
            value: 2,
            label: '响应body'
          },          
          {
            value: 3,
            label: '出参'
          }
        ],
        assertCondiationOptions: [
          {
            value: 0,
            label: '大于'
          },
          {
            value: 1,
            label: '大于等于'
          },
          {
            value: 2,
            label: '小于'
          },
          {
            value: 3,
            label: '小于等于'
          },
          {
            value: 4,
            label: '等于'
          },
          {
            value: 5,
            label: '不等于'
          },
          {
            value: 6,
            label: '包含'
          },
          {
            value: 7,
            label: '不包含'
          },
          {
            value: 8,
            label: '属于'
          },
          {
            value: 9,
            label: '不属于'
          },
          {
            value: 10,
            label: '存在'
          },
          {
            value: 11,
            label: '不存在'
          },
          {
            value: 12,
            label: '正则匹配'
          }
        ],
        assertCheckobjectDisabled: false,
        assertCheckobjectOptionShow: false,
        assertCheckobjectShow: true,
        assertCheckobjectOutArgs: [
          {
            value: 0,
            label: 'code'
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
      
        /**
         * 响应
         * @var responseBodyTab 响应body tab选中名称
         * @var HeadersResTextArea 响应Headers
         * @var responseHeaderData 响应头数据
         * @var responseLoading 响应加载
         * @var responseReadOnly 响应文本只读
         */
        responseBodyTab: 'responseBody',
        HeadersResTextArea: '',
        responseHeaderData: [
          {
            key: '',
            value: ''
          }
        ],
        responseReadOnly: true,
        responseLoading: false,
        cookiesResTextArea: '',
        responseCookiesData: [
          {
            key: '',
            value: ''
          }
        ],
      }
		},
		methods: {
      /**
       * outArgsSelectChange
       * 出参来源修改时，其它输入项，对应输入状态变更
       * @param {*} index 所在行索引
       * @param {*} row 所在行数据
       */
      outArgsSelectChange (index, row) {
        console.log(index, row);
        // 来源选择了状态码
        if(row.source === 4) {
          row.expEdit = false;
          row.exp = "code";
        } else {
          row.expEdit = true;
          row.exp = "";
          row.matchEdit = false;
          row.match= "无需填写";
        };
        if( row.source === 0) {
          row.matchEdit = true;
          row.match = 0;
        };
      },
      /**
       * 上传文件
       */
      handleSuccess(response, row) {
        console.log(response)
        if (response.errcode === 0) {
          row.file.key = row.key;
          row.file.name = response.res.filename;
        } else {
          this.$message({
            message: response.errmsg,
            type: 'warning'
          })
          row.file = '';
        };
        console.log(this.bodyTableData);
      },
      /**
       * 移除上传文件
       */
      handleRemove(file, row) {
        console.log(file.raw);
        row.file = '';
      },
      handlePreview(file) {
        console.log(file);
      },
      handleExceed(files, fileList) {
        this.$message.warning(`当前限制选择 1 个文件，本次选择了 ${files.length} 个文件，共选择了 ${files.length + fileList.length} 个文件`);
      },
      beforeRemove(file, fileList) {
        return this.$confirm(`确定移除 ${ file.name }？`);
      },

      /**
       * form-data,选择类型
       * @param {*} index 行索引
       * @param {*} row 行数据
       * @var row.fromSelect 1  Text类型
       * @var row.fromSelect 2  File类型
       */
      formDataSelectChange(index, row) {
        if (row.fromSelect === 2) {
          row.fromValSelect = true;
          row.valueEdit = false;
        } else {
          row.fromValSelect = false;
          row.valueEdit = true;
        };
      },
      /**
       * 断言类型@change
       * @param {*} index table行索引
       * @param {*} row table行数据
       * @function addNewRow 增加新行数据
       */
      assertSelectChange(index, row) {
        // row.checkType 0
        if (row.checkType === 1) {
          row.checkObject = '状态码';
          row.assertCheckobjectDisabled = true;
          row.assertCheckobjectOptionShow = false;
        };
        if (row.checkType === 2) {
          row.objectEdit = true;
          row.checkObject = '整个body';
          row.assertCheckobjectDisabled = true;
          row.assertCheckobjectOptionShow = false;
        };
        // 出参
        if (row.checkType === 3) {
          // 重新初始化参数
          this.assertCheckobjectOutArgs = [];
          let outParamData = this.outputArgsData;
          for (let i=0; i<outParamData.length; i++) {
            if (outParamData[i].name !== '') {
              this.assertCheckobjectOutArgs.push(
                {
                  value: i,
                  label: outParamData[i].name,
                }
              )
            };
          };
          row.objectEdit = false;
          row.checkObject = 0;
          console.log('===>', this.outputArgsData);

        };
        if (row.checkType === 4) {
          row.objectEdit = false;
          row.assertCheckobjectOptionShow = true;
        };
        console.log(this.assertData)
        console.log(row)
        this.addNewRow(4, index, row);
      },
      /**
       * body radio @change
       * @var isBodyTabShowTable 控制none内容显示
       * @var label redio自动传的选择value
       */
      bodyRadioChange(label) {
        if (label === 1) {
          this.isBodyTabShowTable = false;
          this.isbodyTextAreaShow = false;
          this.addCaseData.isbodyTextAreaButton = false;

        } else if(label === 4){
          this.isBodyTabShowTable = false;
          this.isbodyTextAreaShow = true;
          this.addCaseData.isbodyTextAreaButton = false;
          this.placeholderReq = '';

        }else{
          this.isBodyTabShowTable = true;
          this.isbodyTextAreaShow = false;
          this.addCaseData.isbodyTextAreaButton = false;
        };
        
      },

      /**
       * 新增测试用例;调试功能
       */
      sendRequest() {
        this.responseLoading = true;
        this.initRequestData();
        console.log(this.addCaseData)
        this.debugRequest();
        this.responseLoading = false;
      },
      /**
       * debug单接口
       */
      debugRequest() {
        let param = this.addCaseData;
        debugCase(param).then((res) => {
          console.log(res.data);
          // 初始化响应数据，否则调用多次会累加
          this.paramsResTextArea = '';
          this.responseHeaderData = [];
          this.responseCookiesData = [];

          // body转换成格式化json输出到文本域
          this.paramsResTextArea = util.formatJson.format(
            JSON.stringify(res.data.res.data)
          );

          // 请求头数据整理
          let headersMap = res.data.res.headers;
          for (let key in headersMap) {
            this.responseHeaderData.push({
              key: key,
              value: headersMap[key]
            });
          };

          // cookies数据整理
          let cookiesMap = res.data.res.cookies;
          for (let key in cookiesMap) {
            this.responseCookiesData.push({
              key: key,
              value: cookiesMap[key]
            });
          };
          console.log(this.responseHeaderData)
        })
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
          let bodyMap = {
            data: {},
            files: []
          };
          console.log('------------------------')
          console.log(this.bodyTableData);
          for (let i=0; i<bodyArr.length; i++) {
            if (bodyArr[i].key!=='' && bodyArr[i].file.key==='') {
              bodyMap['data'][bodyArr[i].key] = bodyArr[i].value;
            };
            if (bodyArr[i].key!=='' && bodyArr[i].file!=='' && bodyArr[i].file.key !=='' && bodyArr[i].file.name !=='') {
              bodyMap['files'].push({
                  file: bodyArr[i].file
                });
            };
          };
          console.log('------------------------')
          console.log(bodyMap);
          this.addCaseData.body.body = bodyMap;
        };
        this.addCaseData.body.how = this.bodyRadio;

        // 出参数据
        this.addCaseData.outParam = this.outputArgsData;

        // 断言数据
        this.addCaseData.assertData = this.assertData;
      },
			/**
			 * 用例列表，表头操作栏按钮
			 * @param {*} h 表头对象
			 * @param {*} params 表头参数
			 * @returns div html
			 */
      caseListClick() {
        this.handleAddCaseDialog();  
      },
			/**
			 * 用例列表，增加用例Params选项卡按钮
			 * @param {*} h 表头对象
			 * @param {*} params 表头参数
			 * @returns div html
			 */
      paramBulkEditClick() {
        this.isParamTextAreaShow = true;
        this.isParamTableShow = false;
        this.keyValueBthShow = true;
        this.resetValParamTextArea(this.tableData, 0);
      },
			/**
			 * 用例列表，增加用例Params选项卡按钮
			 * @param {*} h 表头对象
			 * @param {*} params 表头参数
			 * @returns div html
			 */
      headerBulkEditClick() {
        this.isHeaderTextAreaShow = true;
        this.isHeaderTabShowTable = false;
        this.isHeaderTextAreaButton = true;
        this.resetValParamTextArea(this.headerTableData, 1);       
      },
			/**
			 * 用例列表，增加用例Params选项卡按钮
			 * @param {*} h 表头对象
			 * @param {*} params 表头参数
			 * @returns div html
			 */
      BodyBulkEditClick() {
        this.isbodyTextAreaShow = true;
        this.isBodyTabShowTable = false;
        this.addCaseData.isbodyTextAreaButton = true;
        this.resetValParamTextArea(this.bodyTableData, 2);        
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
        this.addCaseData.isbodyTextAreaButton = false;
		this.isBodyTabShowTable = true;
		// 重写状态
		for(let i=0; i<this.bodyTableData.length; i++) {
			this.bodyTableData.fromSelect = 1;
		}
		
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
              fromSelect: 1,
              fromValSelect: false,
              valueEdit: true,
              file: {
                key: '',
                name: ''
              },	
            });
          };         
        };
        if (tabIndex === 3) {
          if(index ==this.outputArgsData.length - 1) {
            this.outputArgsData.push({
              name: '',
              exp: '',
              match: '无需填写',
              edit: true,
              source: 0,
              expEdit: true,
              matchEdit: false,

            })
          };
        };
        if (tabIndex === 4) {
          if(index ==this.assertData.length - 1) {
            this.assertData.push({
              type: 0,
              checkObject: '',
              checkCondition: 0,
              checkContent: '',
              checkType: '',
              edit: true,
              assertCheckobjectDisabled: false,
              assertCheckobjectOptionShow: false,
              assertCheckobjectShow: true,
              objectEdit: true,   
            })
          };
        };
			},

			/**
			 * Params选项卡，table删除行
			 * @param {*} index  table当前索引
			 * @param {*} row 操作行对象
       * @param {*} tableIndex 
       * @var tableIndex 1:Params
       * @var tableIndex 2:Header
       * @var tableIndex 3:Body
       * @var tableIndex 3:出参
       * @var tableIndex 5:断言
			 */
			deleteRow(tableIndex, index, row) {
        if (tableIndex === 1) {
          this.tableData.splice(index, 1);
          this.addUrlParams();
        } else if(tableIndex === 2) {
          this.headerTableData.splice(index, 1);
        } else if(tableIndex === 3) {
          this.bodyTableData.splice(index, 1);
        };
        if (tableIndex === 4) {
          this.outputArgsData.splice(index, 1)
        };
        if (tableIndex === 5) {
          this.assertData.splice(index, 1)
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
						this.getCase();
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
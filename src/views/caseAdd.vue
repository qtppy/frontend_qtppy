<template>
  <!-- 新增测试用例界面 -->
  <el-dialog
    class="commonDialog"
    :fullscreen="true"
    :visible.sync="add.visible" 
    v-if="add.visible"
    :close-on-click-modal="false" 
    @close="closeDestroy">
    <template slot="title">
        {{add.breadcrumbTitle}}
    </template>
    <el-form 
      :model="add" 
      label-width="3px" 
      ref="addSuiteData">
      <el-row>
        <el-col :span="8">
          <el-form-item prop="method">
            <el-input 
            placeholder="请输入请求URL" 
            v-model="add.url" 
            class="input-with-select" 
            @change="baseUrlSet" 
            size="small"
            >
            <el-select 
            v-model="add.method" 
            placeholder="Method" 
            slot="prepend" 
            style="width:100px;"
            >
              <el-option
                v-for="item in add.methodOptions"
                :key="item.value"
                :label="item.label"
                :value="item.label">
              </el-option>
            </el-select>
            </el-input>
          </el-form-item>
        </el-col>
        <el-col :span="2">
            <el-dropdown 
            size="small" 
            split-button 
            type="primary"
            trigger="click"
            :loading="add.debugLoading"
            @click="sendRequest"
            @command="sendRequest"
            >
                <i class="el-icon-share"></i>
                调试
                <el-dropdown-menu slot="dropdown">
                <el-dropdown-item
                    command="debug_and_save"
                    :loading="add.Loading"
                >
                    <i class="el-icon-collection"></i>
                    调试并保存
                </el-dropdown-item>
                </el-dropdown-menu>
            </el-dropdown>
        </el-col>
        <el-col :span="6">
        <el-input
            type="text"
            placeholder="请输入用例名称"
            prefix-icon="el-icon-edit"
            size="small"
            v-model="add.name"
            maxlength="50"
            show-word-limit
        >
        <template slot="prepend">
            <el-link 
            type="primary" 
            :underline="false"
            >
            用例名称:
            </el-link>
        </template>
        </el-input>
        </el-col>
        <el-col :span="8">
        <el-input
            type="text"
            placeholder="请输入用例描述"
            prefix-icon="el-icon-edit"
            size="small"
            v-model="add.desc"
            maxlength="100"
            show-word-limit>
        <template slot="prepend">
            <el-link type="primary" :underline="false">用例描述:</el-link>
        </template>
        </el-input>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="24">
          <el-tabs 
            v-model="add.body.tab"
            @tab-click="handleCaseTabClick" 
            :size="add.size">

            <!-- Params参数 -->
            <el-tab-pane label="Params" name="params">
                <el-button 
                  type="primary" 
                  icon="el-icon-share" 
                  size="mini" 
                  style="float:right;" 
                  v-show="add.params.keyValueBthShow" 
                  @click="swapParamEditButton">Key-Value Edit</el-button>

                <!-- 文本域展示 -->
                <el-input
                    type="textarea"
                    :placeholder="add.params.placeholderReq"
                    v-model="add.params.txtArea"
                    v-show="add.params.isParamTextAreaShow" 
                    :autosize="add.params.paramsTextAreaLimt"
                    @change="setCaseRequestData(add.params.txtArea, 0)">
                </el-input>

                <!-- Params参数table展示 -->
                <el-table 
                  :data="add.params.table" 
                  border stripe style="width: 100%;" 
                  size="mini" 
                  v-show="add.params.isParamTableShow">
                  <el-table-column prop="key" label="Key">
                    <template slot-scope="scope">
                      <el-input 
                        v-if="scope.row.edit" 
                        v-model="scope.row.key" 
                        placeholder="Key" 
                        :size="add.size" 
                        @change="addUrlParams()" 
                        @input="addNewRow(0, scope.$index, scope.row)"/>
                      <span v-else>{{scope.row.key}}</span>
                    </template>
                  </el-table-column>
                  <el-table-column prop="value" label="Value">
                      <template slot-scope="scope">
                          <el-input 
                            v-if="scope.row.edit" 
                            v-model="scope.row.value" 
                            placeholder="Value" 
                            :size="add.size" 
                            @change="addUrlParams()" 
                            @input="addNewRow(0, scope.$index, scope.row)"/>
                          <span v-else>{{scope.row.value}}</span>
                      </template>
                  </el-table-column>
                  <el-table-column prop="DESCRIPTION" label="DESCRIPTION">
                      <template slot-scope="scope">
                          <el-input 
                            v-if="scope.row.edit" 
                            v-model="scope.row.DESCRIPTION" 
                            placeholder="DESCRIPTION" 
                            :size="add.size"  
                            @input="addNewRow(0, scope.$index, scope.row)"/>
                          <span v-else>{{scope.row.DESCRIPTION}}</span>
                      </template>
                  </el-table-column>

                  // 操作
                  <el-table-column label="操作">
                    <template slot="header" slot-scope>
                      <el-button-group>
                          <el-tooltip 
                            :disabled="false" 
                            placement="bottom" 
                            effect="light">批量编辑</el-tooltip>
                          <el-button 
                            size="mini" 
                            type="primary" 
                            icon="el-icon-s-flag" 
                            @click="paramBulkEditClick">Bulk Edit</el-button>
                      </el-button-group>  
                    </template>
                    <template slot-scope="scope">
                      <el-link 
                        type="info" 
                        v-if="add.params.table.length > 1" 
                        :underline="false" 
                        icon="el-icon-close" 
                        @click.native="deleteRow(1, scope.$index, scope.row)" 
                        circle/>
                    </template>
                  </el-table-column>
                </el-table>
            </el-tab-pane>

            <!-- Header table展示 -->
            <el-tab-pane 
              label="Headers" 
              name="headers">
              <el-button 
                type="primary" 
                icon="el-icon-share" 
                size="mini" 
                style="float:right;" 
                v-show="add.headers.isAreaBtnShow" 
                @click="sawpHeaderEditButton">Key-Value Edit</el-button>
              <!-- 文本域展示 -->
              <el-input
                type="textarea"
                :placeholder="add.params.placeholderReq"
                v-model="add.headers.headerTextArea"
                v-show="add.headers.isAreaShow" 
                :autosize="add.params.paramsTextAreaLimt"
                @change="setCaseRequestData(add.headers.headerTextArea, 1)"/>
                <el-table 
                  :data="add.headers.table" 
                  border stripe style="width: 100%;" 
                  :size="add.size" 
                  v-show="add.headers.isTableShow">

                    <el-table-column prop="key" label="Key">
                        <template slot-scope="scope">
                            <el-input 
                              v-if="scope.row.edit" 
                              v-model="scope.row.key" 
                              placeholder="Key" 
                              :size="add.size" 
                              @input="addNewRow(1, scope.$index, scope.row)"/>
                            <span v-else>{{scope.row.key}}</span>
                        </template>
                    </el-table-column>
                    
                    <el-table-column prop="value" label="Value">
                        <template slot-scope="scope">
                            <el-input 
                              v-if="scope.row.edit" 
                              v-model="scope.row.value" 
                              placeholder="Value" 
                              :size="add.size" 
                              @input="addNewRow(1, scope.$index, scope.row)"/>
                            <span v-else>{{scope.row.value}}</span>
                        </template>
                    </el-table-column>

                    <el-table-column prop="DESCRIPTION" label="DESCRIPTION">
                        <template slot-scope="scope">
                            <el-input 
                              v-if="scope.row.edit" 
                              v-model="scope.row.DESCRIPTION" 
                              placeholder="DESCRIPTION" 
                              :size="add.size"  
                              @input="addNewRow(1, scope.$index, scope.row)"/>
                            <span v-else>{{scope.row.DESCRIPTION}}</span>
                        </template>
                    </el-table-column>

                    <el-table-column label="操作">
                      <template slot="header" slot-scope>
                      <el-button-group>
                          <el-tooltip :disabled="false" placement="bottom" effect="light">批量编辑</el-tooltip>
                          <el-button 
                            size="mini" 
                            type="primary" 
                            icon="el-icon-s-flag" 
                            @click="headerBulkEditClick">Bulk Edit</el-button>
                      </el-button-group>

                      </template>
                      <template slot-scope="scope">
                        <el-link type="info" 
                          v-if="add.headers.table.length > 1" 
                          :underline="false" 
                          icon="el-icon-close" 
                          @click.native="deleteRow(2, scope.$index, scope.row)" 
                          circle/>
                      </template>

                  </el-table-column>
                </el-table>
            </el-tab-pane>

            <!-- Body tab -->
            <el-tab-pane label="Body" name="body">
              <el-radio-group 
                v-model="add.body.how" 
                :size="add.size" 
                @change="radioChange">
                <el-radio :label="1">none</el-radio>
                <el-radio :label="2">form-data</el-radio>
                <el-radio :label="3">x-www-form-urlencoded</el-radio>
                <el-radio :label="4">raw</el-radio>
              </el-radio-group>
              <el-divider content-position="left"/>
              <el-button 
                type="primary" 
                icon="el-icon-share" 
                size="mini" 
                style="float:right;" 
                v-show="add.body.textAreaButton" 
                @click="sawpBodyEditButton">Key-Value Edit</el-button>
              <!-- 文本域展示 -->
              <el-input
                type="textarea"
                :placeholder="add.params.placeholderReq"
                v-model="add.body.txtArea"
                v-show="add.body.textAreaShow" 
                :autosize="add.params.paramsTextAreaLimt"
                @change='setCaseRequestData(add.body.txtArea, 2)'/>
                <el-table :data="add.body.table" border stripe style="width: 100%;" :size="add.size" v-show="add.body.tabShowTable">
                  <el-table-column prop="key" label="Key">
                    <template slot-scope="scope">
                      <el-input
                        v-if="scope.row.edit" 
                        v-model="scope.row.key" 
                        placeholder="Key" 
                        :size="add.size" 
                        @input="addNewRow(2, scope.$index, scope.row)" 
                        @click.native="mouseOverHoverShowSelect(scope.row)">

                        <el-select 
                          v-model="scope.row.fromSelect" 
                          v-if="scope.row.fromSelectHide" 
                          slot="append" 
                          style="width: 70px;" 
                          @change="formDataSelectChange(scope.$index, scope.row)">
                          <el-option
                              v-for="item in add.body.options"
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
                      <el-input 
                        v-if="scope.row.valueEdit" 
                        v-model="scope.row.value" 
                        placeholder="Value" 
                        :size="add.size" 
                        @input="addNewRow(2, scope.$index, scope.row)"/>
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
                        <el-input v-if="scope.row.edit" v-model="scope.row.DESCRIPTION" placeholder="DESCRIPTION" :size="add.size"  @input="addNewRow(2, scope.$index, scope.row)"></el-input>
                        <span v-else>{{scope.row.DESCRIPTION}}</span>
                    </template>
                  </el-table-column>

                  <el-table-column label="操作" scoped-slot>
                    <template slot="header">
                      <el-button-group>
                        <el-tooltip :disabled="false" placement="bottom" effect="light">批量编辑</el-tooltip>
                        <el-button 
                          size="mini" 
                          type="primary" 
                          icon="el-icon-s-flag" 
                          @click="BodyBulkEditClick">Bulk Edit</el-button>
                      </el-button-group>
                    </template>

                    <template slot-scope="scope">
                      <el-link 
                        type="info" 
                        v-if="add.body.table.length > 1" 
                        :underline="false" icon="el-icon-close" 
                        @click.native="deleteRow(3, scope.$index, scope.row)" 
                        circle/>
                    </template>
                  </el-table-column>
                </el-table>
              </el-tab-pane>
              
              <!-- 出参 -->
              <el-tab-pane name="output" scope-slot>
                <template slot="label">
                  <span>出参</span>
                  <el-tooltip  placement="bottom" effect="light">
                  <div slot="content">
                      出参是从当前请求的 Response 中截取需要的内容，<br/>
                      <br/>
                      在后续的请求中作为参数使用。<br/>
                      <br/>
                      在一个API请求中,可以定义多个出参。
                  </div>
                  <el-link type="success" icon="el-icon-question" :underline="false"></el-link>                 
                  </el-tooltip>
                </template>

                <el-table 
                  :data="add.outParam.data" 
                  border stripe style="width: 100%;" 
                  :size="add.size" 
                  v-show="true">
                  <el-table-column prop="name" label="出参名">
                    <template slot-scope="scope">
                        <el-input 
                          v-if="scope.row.edit" 
                          v-model="scope.row.name" 
                          placeholder="输入出参名称" 
                          :size="add.size" 
                          @input="addNewRow(3, scope.$index, scope.row)"/>
                        <span v-else>{{scope.row.name}}</span>
                    </template>
                  </el-table-column>

                  <el-table-column prop="source" label="来源">
                    <template slot-scope="scope">
                      <el-select v-model="scope.row.source" size="mini" @change="outArgsSelectChange(scope.$index, scope.row)">
                        <el-option
                        v-for="item in add.outParam.options"
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
                      <el-input 
                        v-if="scope.row.expEdit" 
                        v-model="scope.row.exp" 
                        placeholder="输入出参提取表达式" 
                        :size="add.size"  
                        @input="addNewRow(3, scope.$index, scope.row)"/>
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
                        <el-input 
                          v-if="scope.row.matchEdit" 
                          v-model="scope.row.match" 
                          placeholder="" 
                          :size="add.size"  
                          @input="addNewRow(3, scope.$index, scope.row)"/>
                        <span v-else>{{scope.row.match}}</span>
                    </template>
                  </el-table-column>

                  <el-table-column label="操作">
                    <template slot-scope="scope">
                      <el-link 
                        type="danger" 
                        v-if="add.outParam.data.length > 1" 
                        :underline="false" 
                        icon="el-icon-delete" 
                        @click.native="deleteRow(4, scope.$index, scope.row)" 
                        circle/>
                    </template>
                  </el-table-column>
                </el-table>
              </el-tab-pane>

              <!-- 断言tab -->
              <el-tab-pane name="assert">
                <template slot="label">
                    <span>断言</span>
                    <el-tooltip  placement="bottom" effect="light">
                    <div slot="content">
                        断言，用来判断业务是否正常。<br/>
                    </div>
                    <el-link type="success" icon="el-icon-question" :underline="false"/>           
                    </el-tooltip>
                </template>

                <el-table 
                  :data="add.assert.data" 
                  border stripe style="width: 100%;" 
                  :size="add.size" 
                  v-show="true">
                  <el-table-column prop="checkType" label="断言类型">
                    <template slot-scope="scope">
                      <el-select 
                        v-model="scope.row.checkType" 
                        size="mini" 
                        @change="assertSelectChange(scope.$index, scope.row)">
                        <el-option
                          v-for="item in add.assert.options"
                          :key="item.value"
                          :label="item.label"
                          :value="item.value"/>
                      </el-select>
                    </template>
                  </el-table-column>

                  <el-table-column prop="checkObject" label="断言对象">
                    <template slot-scope="scope">
                      <el-input 
                        v-if="scope.row.objectEdit" 
                        v-model="scope.row.checkObject" 
                        placeholder="请输入断言对象"  
                        :disabled="scope.row.assertCheckobjectDisabled" 
                        :size="add.size" 
                        @input="addNewRow(3, scope.$index, scope.row)"/>
                        <el-select v-else v-model="scope.row.checkObject" size="mini">
                            <el-option
                            v-for="item in add.assert.checkObject"
                            :key="item.value"
                            :label="item.label"
                            :value="item.value">
                            </el-option>
                        </el-select>
                    </template>
                  </el-table-column>

                  <el-table-column prop="checkCondition" label="断言条件">
                    <template slot-scope="scope">
                      <el-select 
                        v-model="scope.row.checkCondition" 
                        size="mini" 
                        @change="outArgsSelectChange(scope.$index, scope.row)">
                        <el-option
                        v-for="item in add.assert.condiationOptions"
                        :key="item.value"
                        :label="item.label"
                        :value="item.value">
                        </el-option>
                      </el-select>
                    </template>
                  </el-table-column>

                  <el-table-column prop="checkContent">
                    <template slot="header">
                      <span>断言内容</span>
                      <el-tooltip placement="bottom" effect="light">
                        <div slot="content">
                        “属于”、“不属于”支持正负整数、0、字符串：<br/>
                        <br/>
                        1. 数值：请按照标准的数学表达式规范填写。示例如下：<br/>
                        <br/>
                        - 表示闭区间：{[-20,20]}<br/>
                        <br/>
                        - 表示集合：{[-200, 200], -1, 2}<br/>
                        <br/>
                        说明：当数值集合中不包括负整数时，旧表达式仍然生效，<br/>
                        <br/>
                        但不推荐使用。例如，[200-300,1]，可表示包括 1 、200 至 300<br/>
                        <br/>
                        闭区间的整数的集合。<br/>
                        <br/>
                        2. 字符串示例：{'abc', 'bcd', '200', '-200', '已报名', '报名成功'}
                        </div>
                        <el-link type="success" icon="el-icon-question" :underline="false"></el-link>
                      </el-tooltip>
                    </template>

                    <template slot-scope="scope">
                        <el-input 
                          v-if="scope.row.edit" 
                          v-model="scope.row.checkContent" 
                          placeholder="输入期望值" 
                          :size="add.size"  
                          @input="addNewRow(3, scope.$index, scope.row)"/>
                        <span v-else>{{scope.row.checkContent}}</span>
                    </template>
                  </el-table-column>

                  <el-table-column label="操作">
                    <template slot-scope="scope">
                      <el-link 
                        type="danger" 
                        v-if="add.assert.data.length > 1" 
                        :underline="false" 
                        icon="el-icon-delete" 
                        @click.native="deleteRow(5, scope.$index, scope.row)" 
                        circle/>
                    </template>
                  </el-table-column>
                </el-table>
              </el-tab-pane>
          </el-tabs>
        </el-col>
      </el-row>

      <el-row>
        <el-tabs
          v-model="add.responses.bodyTab"
          type="border-card"
          size="mini" 
          v-loading="add.responses.loading"     
          element-loading-text="Send Request..."
          element-loading-spinner="el-icon-loading">
          <!-- Response body-->
          <el-tab-pane label="Body" name="responseBody">
              <el-input
              type="textarea"
              :placeholder="add.params.placeholderRes"
              v-model="add.params.resArea"
              :autosize="add.params.paramsTextAreaLimt"
              :readonly="add.responses.readOnly">
              </el-input>
          </el-tab-pane>
          <!-- Response headers -->
          <el-tab-pane label="Headers" name="responseHeaders">
            <el-table :data="add.responses.header" border stripe style="width: 100%;" :size="add.size" v-show="true">
              <el-table-column prop="key" label="Key">
                <template slot-scope="scope">
                  <el-input 
                    v-if="scope.row.key" 
                    v-model="scope.row.key" 
                    :size="add.size" 
                    :readonly="add.responses.readOnly"/>
                  <span v-else>{{scope.row.key}}</span>
                </template>
              </el-table-column>

              <el-table-column prop="value" label="Value">
                <template slot-scope="scope">
                  <el-input 
                    v-if="scope.row.value" 
                    v-model="scope.row.value" 
                    :size="add.size" 
                    :readonly="add.responses.readOnly"/>
                  <span v-else>{{scope.row.value}}</span>
                </template>
              </el-table-column>
            </el-table>
          </el-tab-pane>

          <!-- Response Cookies-->
          <el-tab-pane label="Cookies" name="responseCookies">
            <el-table :data="add.responses.cookies" border stripe style="width: 100%;" :size="add.size" v-show="true">
              <el-table-column prop="key" label="Key">
                <template slot-scope="scope">
                    <el-input 
                      v-if="scope.row.key" 
                      v-model="scope.row.key" 
                      :size="add.size" 
                      :readonly="add.responses.readOnly"/>
                    <span v-else>{{scope.row.key}}</span>
                </template>
              </el-table-column>
              <el-table-column prop="value" label="Value">
                <template slot-scope="scope">
                  <el-input 
                    v-if="scope.row.value" 
                    v-model="scope.row.value" 
                    :size="add.size" 
                    :readonly="add.responses.readOnly"/>
                  <span v-else>{{scope.row.value}}</span>
                </template>
              </el-table-column>
            </el-table>
          </el-tab-pane>

          <!-- Test Result -->
          <el-tab-pane label="Test Results" name="Test Results">
            <el-collapse accordion>
            <el-collapse-item>
              <template slot="title">
                出参变量
              </template>
              <div v-for="item in add.result.outList.outList" :key="item.var_name">
                {{item.var_name}}:{{item.var_value}}
              </div>
            </el-collapse-item>
            <el-collapse-item>
                <template slot="title">
                断言结果
                </template>
                <div>控制反馈：通过界面样式和交互动效让用户可以清晰的感知自己的操作；</div>
            </el-collapse-item>
            </el-collapse>
          </el-tab-pane>

          <!-- Response 状态 -->
          <el-tab-pane  v-if="add.responses.toolVisible" name="add.responses.tool" scope-slot disabled>
            <template slot="label">
              <span style="padding-left: 650px"></span>
              <el-link type="info" :underline="false" disabled>
                  Status: {{this.add.responses.tool.status}}
                  <i 
                    v-if="this.add.responses.tool.status === 200" 
                    class="el-icon-circle-check" 
                    style="color:#67C23A;"/>
                  <i 
                    v-else 
                    class="el-icon-circle-close" 
                    style="color:#F56C6C;"/>
              </el-link>
              <el-link type="info" :underline="false" disabled>
                  Time: 
                  <i style="color:#67C23A;">{{this.add.responses.tool.time}} ms</i>
              </el-link>
            </template> 
          </el-tab-pane>
        </el-tabs>
      </el-row>
    </el-form>
  </el-dialog>
</template>

<script>
  import util from '@/common/js/util'
  import { debugCase, createCase } from '@/api/api';
  export default {
      name: 'contacts11',
      props: [],
      data() {
        return {
          add: {
            method: 'GET',
            url: '',
            urlIndex: 0,
            baseUrl: '',
            header: '',
            debugWay: 0,
            name: '',
            desc: '',
            caseId: '',
            visible: false,
            breadcrumbTitle: '新增用例',
            debugLoading: false,
            Loading: false,
            size: 'mini',
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
            // 头信息
            headers:{
              isAreaBtnShow: false,
              isTableShow: true,
              isAreaShow: false,
              headerTextArea: '',
              table: [
                {
                  key: '',
                  value: '',
                  DESCRIPTION: '',
                  edit: true,
                }
              ]
            },
            // params数据
            params:{
              isParamTableShow: true,
              isParamTextAreaShow: false,
              isParamEditButtonShow: true,
              isParamBulkEditButtonShow: false,
              txtArea : '',
              ressponseShow: true,
              caseTabindex: 1,
              resArea : '',
              paramsTextAreaLimt: { minRows: 7, maxRows: 8},
              placeholderReq: "Rows are separated by new lines\nkeys and values are separated by :\nPrepend // to any row you want to add but keep disabled",
              placeholderRes: "Hit Send to get a response",
              keyValueBthShow: false,
              Paramsize: "mini",
              requestBodyTab: 'body',
              table: [
                {
                  key: '',
                  value: '',
                  DESCRIPTION: '',
                  edit: true,
                },
              ],
            },
            // body数据
            body: {
              how: 1,
              body: '',
              txtArea: '',
              textAreaShow: false, 
              tabShowTable: false,
              textAreaButton: false,
              radio: 1,
              tab: 'body',
              table: [
                {
                  key: '',
                  value: '',
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
              ],
              options: [
                {
                  value: 1,
                  label: 'Text'
                },
                {
                  value: 2,
                  label: 'File'
                }
              ],
            },
            // 出参
            outParam: {
              data: [
                {
                  name: '',
                  exp: '',
                  match: 0,
                  edit: true,
                  source: 0,
                  expEdit: true,
                  matchEdit: true, 
                },
              ],
              options: [
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
            },
            assert: {
              data: [
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
              options: [
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
              checkObject: [
                {
                  value: 0,
                  label: 'code'
                }
              ],
              condiationOptions: [
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
              ]
            },
            // 响应Response
            responses: {
              loading: false,
              bodyTab: 'responseBody',
              header: [
                {
                  key: '',
                  value: ''
                }
              ],
              readOnly: true,
              cookies: [
                {
                  key: '',
                  value: ''
                }
              ],
              toolVisible: false,
              tool: {
                status: 0,
                time: 0,
                size: 0
              },
            },
            // 
            result: {
              outList: [],
            },
            
          },
        }
      },
      methods: {
        /**
         * 新增用例基础url赋值
         * @param {*} null
         * @returns null
         */
        baseUrlSet() {
          this.add.baseUrl = this.add.url;
        },
        // dialog 显示
        isDialogShow(val) {
          this.add.visible = val;
        },
        // 
        closeDestroy() {
          console.log('aaaa')
        },
        /** 新增测试用例;调试功能
         */
        async sendRequest(command) {
          // 调试并保存；默认调试
          if(command === 'debug_and_save') {
            this.add.debugWay = 1;
            // 调用创建用例接口
            await createCase(this.add).then(res => {
              this.add.caseId = res.data.res.c_id;
              // 调用父组件，刷新用例列表
              this.$parent.getCase();
              this.$message({
                message: '保存成功',
                type: 'success'
              });
            })
          }else {
            this.add.debugWay = 0;
            this.add.caseId = '';
            this.$message({
              message: '执行调试',
              type: 'success'
            });
          };
          this.add.responses.loading = true;
          this.initRequestData();

          this.debugRequest();
          this.add.responses.loading = false;

        },
        /** debug单接口
         */
        debugRequest() {
          let param = this.add;

          debugCase(param).then((res) => {
            // 响应状态
            this.add.responses.tool.status = res.data.res.status_code;
            this.add.responses.tool.time = res.data.res.elapsed;
            // 响应出参数据
            this.add.result.outList = res.data.res.out_param_list;

            // 响应状态栏
            this.add.responses.toolVisible = true;

            // 初始化响应数据，否则调用多次会累加
            this.add.params.resArea = '';
            this.add.responses.header = [];
            this.add.responses.cookies = [];

            // body转换成格式化json输出到文本域
            this.add.params.resArea = util.formatJson.format(
              JSON.stringify(res.data.res.data)
            );

            // 请求头数据整理
            let headersMap = res.data.res.headers;
            for (let key in headersMap) {
              this.add.responses.header.push({
                key: key,
                value: headersMap[key]
              });
            };

            // cookies数据整理
            let cookiesMap = res.data.res.cookies;
            for (let key in cookiesMap) {
              this.add.responses.cookies.push({
                key: key,
                value: cookiesMap[key]
              });
            };
            console.log(this.add.responses.header)
          })
        },
        /** 整理请求头
         * @description 请求Params数据无需整，已初始化到url中
         */
        initRequestData() {
          // 请求头数据
          let headerArr = this.add.headers.table;
          let headerMap = {};
          for (let i=0; i<headerArr.length; i++) {
            if (headerArr[i].key!=='') {
              headerMap[headerArr[i].key] = headerArr[i].value;
            };
          };
          this.add.header = headerMap;

          // body数据
          if (this.add.body.how === 4) {
            this.add.body.body = this.add.body.txtArea;
          }else {
            let bodyArr = this.add.body.table;
            let bodyMap = {
              data: {},
              files: []
            };

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

            this.add.body.body = bodyMap;
          };
        },
        /** 新增用例tab切换
         * @param {string} tab 标签lable名称
         * @param {event} event 事件
         */
        handleCaseTabClick(tab, event) {
          if (tab.name === "assert" || tab.name === "output") {
            this.ressponseShow = false;
          }else{
            this.ressponseShow = true;
          };
        },
        /** Params Bulk Edit 与 Key-Value Edit切换
         * @param {*} null
         * @returns null
         */
        swapParamEditButton() {
          this.add.params.isParamTextAreaShow = false;
          this.add.params.isParamTableShow = true;
          this.add.params.keyValueBthShow = false;
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
          if(index === 0) { // params参数
            this.add.params.txtArea = txt;
          }else if(index === 1) { // 头
            this.add.headers.headerTextArea = txt;
          }else if(index === 2) { // body
            this.add.body.txtArea = txt;
          };
          
        },
        /** ParamTextarea  url拼接
         * @param {*} tableObj params  header数据存储变量this.tabledata
         * @param {*} index 0:this.tabledata; 1:this.header
         * @returns null
         */
        setCaseRequestData(textarea, index) {
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
          if (index === 0) { // params
            this.add.params.table = tableObj;
            this.addUrlParams();
          }else if(index === 1) { // header
            this.add.headers.table = tableObj;
          }else if(index === 2) { // body
            this.add.body.table = tableObj;
          };
        },

        /** Params新增测试用例，获取焦点时自动新增一空白行
         * @param {*} index table当前行索引
         * @param {*} row table当前行对象方便取值
         */
        addUrlParams() {
          let flag = 0; //key和value全填标记0全填1相反
          let joinUrl = ''
          // 初始化url
          this.add.url = ''

          // key和value全填才执行拼接
          for (let i=0; i<this.add.params.table.length-1; i++) {
            if (this.add.params.table[i].key ==='' && this.add.params.table[i].value ==='') {
              flag = 1
              break
            };
          };
          // 拼接
          if (flag === 0) {
            for (let j=0; j<this.add.params.table.length; j++) {
              if (this.add.params.table[j].key !=='' && this.add.params.table[j].value !=='') {
                if (this.add.urlIndex === 0) {
                  joinUrl = '?' + this.add.params.table[j].key + '=' + this.add.params.table[j].value
                  this.add.urlIndex = 1
                } else {
                  joinUrl = joinUrl + '&' + this.add.params.table[j].key + '=' + this.add.params.table[j].value
                }
              }
            }
            
          };
          this.add.urlIndex = 0
          this.add.url = this.add.baseUrl + joinUrl
        },
        /** Params选项卡增加新行
         * @param {*} index 操作行索引
         * @param {*} row 操作行对象
         * @param {*} tabIndex
         * 0: params
         * 1: header
         * 2: body
         */
        addNewRow(tabIndex, index, row) {
          if(tabIndex === 0) {
            if(index ==this.add.params.table.length - 1) {
              this.add.params.table.push({
                key: '',
                value: '',
                DESCRIPTION: '',
                edit: true,					
              });
            };
          } else if(tabIndex === 1) { // 头数据
            if(index ==this.add.headers.table.length - 1) {
              this.add.headers.table.push({
                key: '',
                value: '',
                DESCRIPTION: '',
                edit: true,					
              });
            };
          } else if(tabIndex === 2) { // body数据
            if(index ==this.add.body.table.length - 1) {
              this.add.body.table.push({
                key: '',
                value: '',
                DESCRIPTION: '',
                edit: true,
                fromSelect: 1,
                fromValSelect: false,
                fromSelectHide: false,
                valueEdit: true,
                file: {
                  key: '',
                  name: ''
                },	
              });
            };         
          };
          if (tabIndex === 3) { // 输出参数数据
            if(index ==this.add.outParam.data.length - 1) {
              this.add.outParam.data.push({
                name: '',
                exp: '',
                match: 0,
                edit: true,
                source: 0,
                expEdit: true,
                matchEdit: true,

              })
            };
          };
          if (tabIndex === 4) { // 断言数据
            if(index ==this.add.assert.data.length - 1) {
              this.add.assert.data.push({
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
        /** 用例列表，增加用例Params选项卡按钮
         * @param {*} h 表头对象
         * @param {*} params 表头参数
         * @returns div html
         */
        paramBulkEditClick() {
          this.add.params.isParamTextAreaShow = true;
          this.add.params.isParamTableShow = false;
          this.add.params.keyValueBthShow = true;
          this.resetValParamTextArea(this.add.params.table, 0);
        },
        /** Params选项卡，table删除行
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
          if (tableIndex === 1) {  // params参数
            this.add.params.table.splice(index, 1);
            this.addUrlParams();
          } else if(tableIndex === 2) {  // 头数据
            this.add.headers.table.splice(index, 1);
          } else if(tableIndex === 3) { // body数据
            this.add.body.table.splice(index, 1);
          };
          if (tableIndex === 4) { // 输出参数
            this.add.outParam.data.splice(index, 1)
          };
          if (tableIndex === 5) { // 断言
            this.add.assert.data.splice(index, 1)
          };
        },
        /** Header Bulk Edit 与 Key-Value Edit切换
         * @param {*} null
         * @returns null
         */
        sawpHeaderEditButton() {
          this.add.headers.isAreaShow = false;
          this.add.headers.isTableShow = true;
          this.add.headers.isAreaBtnShow = false;
        },
        /** ParamTextarea  url拼接
         * @param {*} tableObj params  header数据存储变量this.tabledata
         * @param {*} index 0:this.tabledata; 1:this.header
         * @returns null
         */
        setCaseRequestData(textarea, index) {
          let dt = textarea.split('\n');

          let tableObj = []
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
            this.add.params.table = tableObj;
            this.addUrlParams();
          }else if(index === 1) {
            this.add.headers.table = tableObj;
          }else if(index === 2) {
            this.add.body.table = tableObj;
          };
        },
        /** 用例列表，增加用例Params选项卡按钮
         * @param {*} h 表头对象
         * @param {*} params 表头参数
         * @returns div html
         */
        headerBulkEditClick() {
          this.add.headers.isAreaShow = true;
          this.add.headers.isTableShow = false;
          this.add.headers.isAreaBtnShow = true;
          this.resetValParamTextArea(this.add.headers.table, 1);       
        },
        /** body radio change
         * @var add.body.tabShowTable 控制none内容显示
         * @var label redio自动传的选择value
         */
        radioChange(label) {
          if (label === 1) {
            this.add.body.tabShowTable = false;
            this.add.body.textAreaShow = false;
            this.add.body.textAreaButton = false;

          } else if(label === 4){
            this.add.body.tabShowTable = false;
            this.add.body.textAreaShow = true;
            this.add.body.textAreaButton = false;
            this.add.params.placeholderReqplaceholderReq = '';

          }else{
            this.add.body.tabShowTable = true;
            this.add.body.textAreaShow = false;
            this.add.body.textAreaButton = false;
          };
          
        },
        /** body Bulk Edit 与 key-Value Edit切换
         * @param {*} null
         * @returns null
         */
        sawpBodyEditButton() {
          this.add.body.textAreaShow = false;
          this.add.body.textAreaButton = false;
          this.add.body.tabShowTable = true;
          // 重写状态
          for(let i=0; i<this.add.body.table.length; i++) {
            this.add.body.table.fromSelect = 1;
          }
      
        },
        /** form-data 鼠标悬停，展示file下拉框
         */
        mouseOverHoverShowSelect(row) {
          row.fromSelectHide = true;
        },
        /** form-data,选择类型
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
        /** 移除上传文件
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
        /** 上传文件
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
          console.log(this.add.body.table);
        },
        /** 用例列表，增加用例Params选项卡按钮
         * @param {*} h 表头对象
         * @param {*} params 表头参数
         * @returns div html
         */
        BodyBulkEditClick() {
          this.add.body.textAreaShow = true;
          this.add.body.tabShowTable = false;
          this.add.body.textAreaButton = true;
          this.resetValParamTextArea(this.add.body.table, 2);        
        },
        /** 新增用例tab切换
         */
        handleCaseTabClick(tab, event) {
          if (tab.name === "assert" || tab.name === "output") {
            this.ressponseShow = false;
          }else{
            this.ressponseShow = true;
          };
        },
        /** outArgsSelectChange
         * 出参来源修改时，其它输入项，对应输入状态变更
         * @param {*} index 所在行索引
         * @param {*} row 所在行数据
         */
        outArgsSelectChange (index, row) {
          console.log(index, row);
          // 来源选择了状态码
          if(row.source === 4) {
            row.expEdit = false;
            row.matchEdit = false;
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
        /** 断言类型 change
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
            this.initOutParams();

          };
          if (row.checkType === 4) {
            row.objectEdit = false;
            row.assertCheckobjectOptionShow = true;
          };

          this.addNewRow(4, index, row);
        },
        /** 初始化出参对象
         * 
         */
        initOutParams() {
          let data = this.add.assert.data;
          for(let i=0;i<data.length;i++){
            if(data[i].checkType === 3) {
              this.add.assert.checkObject = [];
              let outParamData = this.add.outParam.data;

              for (let i=0; i<outParamData.length; i++) {
                if (outParamData[i].name !== '') {
                  this.add.assert.checkObject.push(
                    {
                      value: i,
                      label: outParamData[i].name,
                    }
                  )
                };
              };
              data[i].objectEdit = false;
              data[i].checkObject = 0;
              console.log('===>', this.add.outParam.data); 
            }
          }         
        },
        /** outArgsSelectChange
         * 出参来源修改时，其它输入项，对应输入状态变更
         * @param {*} index 所在行索引
         * @param {*} row 所在行数据
         */
        outArgsSelectChange (index, row) {
          console.log(index, row);
          // 来源选择了状态码
          if(row.source === 4) {
            row.expEdit = false;
            row.matchEdit = false;
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
      },
      mounted() {

      },
  }
</script>
<style>
/*head 部分*/
/* Dialog对话框 公共部分样式 Start*/
/*蒙层部分*/
.commonDialog {
  width: 100%;
  height: 100vh;
  position: fixed;
  left: 0;
  top: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.4);
  z-index: 101;
  overflow: hidden;
}
/*框体部分*/
.commonDialog .content{
  background: white;
  display: flex;
  flex-direction: column;
  align-items: center;
  border-radius: 9px;
  box-shadow: 2px 3px 5px #bbb;
  overflow: hidden;
  padding-bottom: 25px;
  margin-bottom: 30px;
  max-height: 90%;
  width: 1000px;
}
/*head 部分*/
.commonDialog .content .head{
  height: 44px;
  line-height: 44px;
  background: #efefef;
  width: 100%;
  text-align: center;
  color: #666;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 10px;
  box-sizing: border-box;
}
/*内容区部分*/
.commonDialog .content .main{
  width: 100%;
  max-height: 70vh;
  flex: 1;
  display: flex;
  flex-direction: column;
  padding:25px 20px;
  box-sizing: border-box;
  -webkit-overflow-scrolling: touch;
  overflow-y: auto;
  margin-bottom: 5px;
}
.el-dialog,.el-message-box {
  border-radius: 9px;
}
.el-dialog__headerbtn,.el-message-box__headerbtn {
  /* top: 5px !important;
   right: 10px;*/
  font-size: 18px;
}
.el-icon-close {
  color: #666 !important;
}
.el-dialog__header,.el-message-box__header {
  border-top-left-radius: 9px;
  border-top-right-radius: 9px;
  height: 44px;
  background: #efefef;
  width: 100%;
  text-align: center;
  color: #666;
  display: -webkit-box;
  display: -ms-flexbox;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 20px;
  box-sizing: border-box;
}
.el-dialog__title,.el-message-box__title {
  color: #666;
  font-size: 12px !important;
}
.coverage-release .el-dialog__body {
  padding: 20px;
}
/* Dialog对话框 公共部分样式 End*/
</style>
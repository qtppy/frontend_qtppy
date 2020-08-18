import Vue from 'vue'
import Vuex from 'vuex'
Vue.use(Vuex);

export default new Vuex.Store({
  state:{
    // 测试用例列表
    caseList: [],
    addList: [],
    add: {
      method: 0,
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
      // 断言
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
      
    }
  },
  getters: {

  },
  // 以同步方式实现
  mutations: {
    // 增加用列
    setCaseList(state, data) {
        state.caseList = data;
    },
  },
  actions: {
      
  },
})
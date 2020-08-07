import Vue from 'vue'
import Vuex from 'vuex'
Vue.use(Vuex);

export default new Vuex.Store({
    state:{
        // 测试用例列表
        caseList: [],
        addList: [],
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
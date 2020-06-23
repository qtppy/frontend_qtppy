import Login from './views/Login.vue'
import NotFound from './views/404.vue'
import Home from './views/Home.vue'
import Main from './views/Main.vue'
// import Page4 from './views/nav2/Page4.vue'
// import Page5 from './views/nav2/Page5.vue'
// import Page6 from './views/nav3/Page6.vue'

import Case from './views/Case.vue'
import Suite from './views/suite.vue'
import Project from './views/Project.vue'
import echarts from './views/charts/echarts.vue'

let routes = [
    {
        path: '/login',
        component: Login,
        name: '',
        hidden: true
    },
    {
        path: '/404',
        component: NotFound,
        name: '',
        hidden: true
    },
    //{ path: '/main', component: Main },
    {
        path: '/',
        component: Home,
        name: '项目管理',
        iconCls: 'fa fa-product-hunt',//图标样式class
        children: [
            { path: '/main', component: Main, name: '主页', hidden: true },
            { path: '/project', component: Project, name: '我的项目' },
        ]
    },
    {
        path: '/',
        component: Home,
        name: '用例管理',
        iconCls: 'fa fa-briefcase',
        leaf: true,
        children: [
            { path: '/case', component: Case, name: '用例管理' }
        ]
    },
    {
        path: '/',
        component: Home,
        name: '测试场景',
        iconCls: 'fa fa-suitcase',
        leaf: true,//只有一个节点
        children: [
            { path: '/suite', component: Suite, name: '测试场景' }
        ]
    },
    {
        path: '/',
        component: Home,
        name: '测试计划',
        iconCls: 'fa fa-plane',
        leaf: true,//只有一个节点
        children: [
            { path: '/page6', component: echarts, name: '测试计划' }
        ]
    },
    {
        path: '/',
        component: Home,
        name: '测试报告',
        iconCls: 'fa fa-folder-open',
        leaf: true,
        children: [
            { path: '/page5', component: echarts, name: '测试报告' }
        ]
    },
    {
        path: '/',
        component: Home,
        name: '测试服务',
        iconCls: 'fa fa-server',
        children: [
            { path: '/page4', component: echarts, name: 'Mock' },
            { path: '/page3', component: echarts, name: '页面5' }
        ]
    },
    {
        path: '/',
        component: Home,
        name: '测试设置',
        iconCls: 'fa fa-gears',
        children: [
            { path: '/page2', component: echarts, name: '参数列表' },
            { path: '/page1', component: echarts, name: '系统函数' },
            { path: '/page23', component: echarts, name: '数据源管理' },
            { path: '/page0', component: echarts, name: '定时任务' }
        ]
    },
    {
        path: '/',
        component: Home,
        name: 'Charts',
        iconCls: 'fa fa-bar-chart',
        children: [
            { path: '/echarts', component: echarts, name: '执行统计' }
        ]
    },
    {
        path: '*',
        hidden: true,
        redirect: { path: '/404' }
    }
];

export default routes;
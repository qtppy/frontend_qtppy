
import NotFound from './views/404.vue'
import Home from './views/Home.vue'

// vue-router 路由懒加载来提高速度

let routes = [
    {
        path: '/login',
        component: Login => require(['@/views/Login'], Login),
        name: '',
        hidden: true
    },
    {
        path: '/404',
        component:  Main =>require(['@/views/Main'], Main),
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
            { path: '/main', component: Main =>require(['@/views/Main'], Main), name: '主页', hidden: true },
            { path: '/project', component: Project =>require(['@/views/Project'], Project), name: '我的项目' },
        ]
    },
    {
        path: '/',
        component: Home,
        name: '测试用例',
        iconCls: 'fa fa-briefcase',
        leaf: true,
        children: [
            { path: '/case', component: Case => require(['@/views/Case'], Case), name: '用例管理' }
        ]
    },
    {
        path: '/',
        component: Home,
        name: '场景管理',
        iconCls: 'fa fa-suitcase',
        leaf: true,//只有一个节点
        children: [
            { path: '/suite', component: Suite => require(['@/views/suite'], Suite), name: '测试场景' }
        ]
    },
    {
        path: '/',
        component: Home,
        name: '测试执行',
        iconCls: 'fa fa-plane',
        leaf: true,//只有一个节点
        children: [
            { path: '/page6', component: echarts =>require(['@/views/charts/echarts'], echarts), name: '测试计划' }
        ]
    },
    {
        path: '/',
        component: Home,
        name: '测试结果',
        iconCls: 'fa fa-folder-open',
        leaf: true,
        children: [
            { path: '/page5', component: echarts =>require(['@/views/charts/echarts'], echarts), name: '测试报告' }
        ]
    },
    {
        path: '/',
        component: Home,
        name: '测试服务',
        iconCls: 'fa fa-server',
        children: [
            { path: '/page4', component: echarts =>require(['@/views/charts/echarts'], echarts), name: 'Mock' },
            { path: '/page3', component: echarts =>require(['@/views/charts/echarts'], echarts), name: '页面5' }
        ]
    },
    {
        path: '/',
        component: Home,
        name: '测试设置',
        iconCls: 'fa fa-gears',
        children: [
            { path: '/page2', component: echarts =>require(['@/views/charts/echarts'], echarts), name: '参数列表' },
            { path: '/page1', component: echarts =>require(['@/views/charts/echarts'], echarts), name: '系统函数' },
            { path: '/page23', component: echarts =>require(['@/views/charts/echarts'], echarts), name: '数据源管理' },
            { path: '/page0', component: echarts =>require(['@/views/charts/echarts'], echarts), name: '定时任务' }
        ]
    },
    {
        path: '/',
        component: Home,
        name: 'Charts',
        iconCls: 'fa fa-bar-chart',
        children: [
            { path: '/echarts', component: echarts =>require(['@/views/charts/echarts'], echarts), name: '执行统计' }
        ]
    },
    {
        path: '*',
        hidden: true,
        redirect: { path: '/404' }
    }
];

export default routes;
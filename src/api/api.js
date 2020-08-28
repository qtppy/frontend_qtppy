import axios from 'axios';

let base = '';

let tmp_ip = 'http://127.0.0.1:5000';

export const requestLogin = params => { return axios.post(`${base}/login`, params).then(res => res.data); };

export const getUserList = params => { return axios.get(`${base}/user/list`, { params: params }); };

export const getUserListPage = params => { return axios.get(`${base}/user/listpage`, { params: params }); };

export const removeUser = params => { return axios.get(`${base}/user/remove`, { params: params }); };

export const batchRemoveUser = params => { return axios.get(`${base}/user/batchremove`, { params: params }); };

export const editUser = params => { return axios.get(`${base}/user/edit`, { params: params }); };

export const addUser = params => { return axios.get(`${base}/user/add`, { params: params }); };



export const createProject = params => { return axios.post(`/api/project/create`, params); };

export const getProjectList = params => { return axios.post(`/api/project/getlist`, params) };

export const editProject = params => { return axios.post('/api/project/update',  params) };

export const deleteProject = params => { return axios.post('/api/project/delete', params) };

// 新建测试集
export const createSuite = params => { return axios.post(`/api/project/suite/create`, params); };

// 获取该用户下的所有项目
export const getProjectAllList = params => { return axios.post(`/api/project/getAllList`); };

// 根据项目ID获取所有测试集
export const getSuiteAllList = params => { return axios.post(`/api/project/suite/getlistbyId`, params); };

// 根据sid获取测试集
export const getSuiteByID = params => { return axios.post(`/api/project/suite/getSuitebySid`, params); };

// 修改测试集
export const updateSuiteInfo = params => { return axios.post(`/api/project/suite/update`, params); };

// 获取测试用例
export const getCaseList = params => { return axios.post(`/api/case/getcaselist`, params); };

// 修改测试用例
export const editCase = params => { return axios.post(`/api/case/edit`, params).then(res => res.data); };

// 删除测试用例
export const deleteCase = params => { return axios.post('/api/case/delete', params) };

// 新建测试用例
export const createCase = params => { return axios.post('/api/case/create', params) };

// debug测试用例
export const debugCase = params => { return axios.post(`/api/run/debug`, params); };

// qtppy登录
export const reqLogin = params => { return axios.post(`/api/auth/login`, params).then(res => res.data); };

// 注册
export const registerUser = params => { return axios.post(`/api/auth/register`, params); };

// 登出
export const logout = params => { return axios.post('/api/auth/logout'); }; 


// 根据uid获取全局变量
export const getVarByUid = params => { return axios.post(`/api/var/getVarByUid`, params).then(res => res.data); };

//获取系统函数映射关系
export const getSystemFunc = params => { return axios.post(`/api/var/getSystemFunc`).then(res => res.data); };

//获取场景case ID
export const getSuiteCaseById = params => { return axios.post(`/api/project/suite/getSuiteCaseById`, params).then(res => res.data) };

// 为场景增加测试步骤
export const addSuiteCase = params => { return axios.post(`/api/project/suite/addCase`, params).then(res => res.data) };
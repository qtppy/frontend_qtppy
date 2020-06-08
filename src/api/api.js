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

// qtppy登录
export const reqLogin = params => { return axios.post(`/api/auth/login`, params).then(res => res.data); };

/*
 * @Author: dfh
 * @Date: 2021-03-26 06:52:06
 * @LastEditors: dfh
 * @LastEditTime: 2021-03-26 09:02:04
 * @Modified By: dfh
 * @FilePath: /day33-axios/src/index.js
 */
import axios from './axios';
const baseUrl = 'http://localhost:8080';
const user = {
    name: 'zhangsan',
    password: '123456'
}

//请求拦截
axios.interceptors.request.use((config) => {
    config.headers.name += '1';
    return config;
})
const request_interceptor = axios.interceptors.request.use((config) => {
    config.headers.name += '2';
    return config;
})
axios.interceptors.request.use((config) => {
    config.headers.name += '3';
    return config;
})
axios.interceptors.request.eject(request_interceptor);


//响应拦截
axios.interceptors.response.use(response => {
    response.data.name += '1';
    return response;
})
const response_intereptor = axios.interceptors.response.use(response => {
    response.data.name += '2';
    return response;
})
axios.interceptors.response.use(response => {
    response.data.name += '3';
    return response;
})
axios.interceptors.response.eject(response_intereptor);

axios({
    url: baseUrl + '/post',
    method: 'post',
    headers: {
        'Content-Type': 'application/json',
        'name':'lisi'
    },
    data: user,
    timeout: 1000,
}).then(response => {
    console.log(response.data);
}).catch(error => {
    console.log(error);
})
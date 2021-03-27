/*
 * @Author: dfh
 * @Date: 2021-03-26 06:52:06
 * @LastEditors: dfh
 * @LastEditTime: 2021-03-27 11:37:55
 * @Modified By: dfh
 * @FilePath: /day33-axios/src/index.js
 */
import axios from './axios';
const baseUrl = 'http://localhost:8080';
const user = {
    name: 'zhangsan',
    password: '123456'
}

const CancelToken = axios.CancelToken;
const source = CancelToken.source();
const isCancel = axios.isCancel;
axios({
    url: baseUrl + '/post',
    method: 'post',
    headers: {
        'name': 'lisi',
    },
    data: user,
    timeout: 1000,
    cancelToken: source.token
}).then(response => {
    console.log(response.data);
}).catch(error => {
    if (isCancel(error)) {
        console.log('用户自己' + error)
    } else {
        console.log(error);
    }
})

source.cancel('取消请求')
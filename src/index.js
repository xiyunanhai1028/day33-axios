/*
 * @Author: dfh
 * @Date: 2021-03-26 06:52:06
 * @LastEditors: dfh
 * @LastEditTime: 2021-03-27 11:09:10
 * @Modified By: dfh
 * @FilePath: /day33-axios/src/index.js
 */
import axios from 'axios';
const baseUrl = 'http://localhost:8080';
const user = {
    name: 'zhangsan',
    password: '123456'
}

axios({
    url: baseUrl + '/post',
    method: 'post',
    headers: {
        'name': 'lisi',
    },
    data: user,
    timeout: 1000
}).then(response => {
    console.log(response.data);
}).catch(error => {
    console.log(error);
})
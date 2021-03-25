/*
 * @Author: dfh
 * @Date: 2021-03-26 06:52:06
 * @LastEditors: dfh
 * @LastEditTime: 2021-03-26 07:34:41
 * @Modified By: dfh
 * @FilePath: /day33-axios/src/index.js
 */
import axios from './axios';
const baseUrl = 'http://localhost:8080';
const user = {
    name: 'zhangsan',
    password: '123456'
}
axios({
    url:baseUrl+ '/post',
    method: 'post',
    headers:{
        'Content-Type':'application/json'
    },
    data:user
}).then(response => {
    console.log(response);
}).catch(error => {
    console.log(error);
})
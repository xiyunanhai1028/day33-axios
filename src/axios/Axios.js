/*
 * @Author: dfh
 * @Date: 2021-03-26 07:07:39
 * @LastEditors: dfh
 * @LastEditTime: 2021-03-26 07:35:23
 * @Modified By: dfh
 * @FilePath: /day33-axios/src/axios/Axios.js
 */
import qs from 'qs';
import parseHeaders from 'parse-headers';

class Axios {

    request(config = {}) {
        return this.dispatchRequest(config);
    }

    dispatchRequest(config) {
        return new Promise((resolve, reject) => {
            let { url, method = 'get', params, data, headers } = config;
            if (params) {//{name:'zhangsan',password:'123456'}=>name='zhangsan'&password='123456'
                params = qs.stringify(params);
                url = url + (url.indexOf('?') > -1 ? '&' : '?') + params;
            }
            const xhr = new XMLHttpRequest();
            //第三个参数异步
            xhr.open(method, url, true);
            //设置返回值为json
            xhr.responseType = 'json';
            xhr.onreadystatechange = function () {
                if (xhr.readyState === 4) {
                    if (xhr.status >= 200 && xhr.status < 300) {
                        const response = {
                            data: xhr.response,
                            headers: parseHeaders(xhr.getAllResponseHeaders()),
                            status: xhr.status,
                            statusText: xhr.statusText,
                            config,
                            request: xhr
                        }
                        resolve(response);
                    } else {
                        reject('请求失败');
                    }
                }
            }

            //请求头的处理
            if (headers) {
                Object.keys(headers).forEach(key => {
                    xhr.setRequestHeader(key, headers[key]);
                })
            }

            //请求体的处理
            let body = null;
            if (typeof data === 'object' && data !== null) {
                body = JSON.stringify(data);//转化为字符串
            }
            xhr.send(body);
        })
    }
}

export default Axios;
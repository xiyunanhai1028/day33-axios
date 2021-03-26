/*
 * @Author: dfh
 * @Date: 2021-03-26 07:07:39
 * @LastEditors: dfh
 * @LastEditTime: 2021-03-26 09:02:20
 * @Modified By: dfh
 * @FilePath: /day33-axios/src/axios/Axios.js
 */
import qs from 'qs';
import parseHeaders from 'parse-headers';
import AxiosInterceptorManager from './AxiosInterceptorManager';
class Axios {

    constructor() {
        this.interceptors = {
            request: new AxiosInterceptorManager(),//请求拦截器的管理者
            response: new AxiosInterceptorManager()//响应拦截器的管理者
        };
    }

    request(config = {}) {
        const chain = [{//设置真正发请求的，然后将请求拦截出入前面，响应拦截插入后面，实现现走请求拦截，再发请求，最后响应拦截
            onFulfilled: this.dispatchRequest,
            onRejected: undefined
        }];
        //将请求拦截器一个一个插入最前面，实现先放的后执行
        this.interceptors.request.interceptors.forEach(interceptor => {
            interceptor && chain.unshift(interceptor);
        })
        //将响应拦截一个个查处末尾，实现先放先执行
        this.interceptors.response.interceptors.forEach(interceptor => {
            interceptor && chain.push(interceptor);
        })
        let promise = Promise.resolve(config);
        while (chain.length) {
            const { onFulfilled, onRejected } = chain.shift();//取出每次的第一条数据
            //将config传入onFulfilled
            promise = promise.then(onFulfilled, onRejected);
        }
        return promise;
    }

    dispatchRequest(config) {
        return new Promise((resolve, reject) => {
            let { url, method = 'get', params, data, headers, timeout } = config;
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
                    if (xhr.status >= 200 && xhr.status !== 0) {
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
                        reject(new Error(`Error: Request failed with status code ${xhr.status}`))
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

            //超时异常
            if (timeout) {
                xhr.timeout = timeout;//设置超时时间
                xhr.ontimeout = function () {//超时监听
                    reject(new Error(`Error: timeout of ${timeout}ms exceeded`));
                }
            }

            //网络异常
            xhr.onerror = function () {
                reject(new Error(`net::ERR_INTERNET_DISCONNECTED`));
            }

            xhr.send(body);
        })
    }
}

export default Axios;
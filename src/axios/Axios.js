/*
 * @Author: dfh
 * @Date: 2021-03-26 07:07:39
 * @LastEditors: dfh
 * @LastEditTime: 2021-03-27 11:12:02
 * @Modified By: dfh
 * @FilePath: /day33-axios/src/axios/Axios.js
 */
import qs from 'qs';
import parseHeaders from 'parse-headers';
import AxiosInterceptorManager from './AxiosInterceptorManager';

//默认配置
const defaults = {
    method: 'get',
    timeout: 0,
    headers: {
        common: {
            accept: 'application/json'//指定告诉服务器返回JSON格式的数据
        }
    },
    transformRequest: function (data, headers) {
        headers['content-type'] = 'application/x-www-form-urlencoded';
        return qs.stringify(data);
    },
    transformResponse: function (data) {
        if (typeof data === 'string');
        data = JSON.parse(data);
        return data;
    }
}
const getStyleMethods = ['get', 'head', 'delete', 'options'];//get风格的请求
getStyleMethods.forEach(method => {
    defaults.headers[method] = {}
})

const postStyleMethods = ['put', 'post', 'patch'];//post风格的请求，会有请求体，需要加默认请求体格式
postStyleMethods.forEach(method => {
    defaults.headers[method] = {
        'content-type': 'application/json'//请求体格式
    }
})

const allMethods = [...getStyleMethods, ...postStyleMethods];

class Axios {

    constructor() {
        this.defaults = defaults;
        this.interceptors = {
            request: new AxiosInterceptorManager(),//请求拦截器的管理者
            response: new AxiosInterceptorManager()//响应拦截器的管理者
        };
    }

    request(config = {}) {
        //合并默认配置headers和用户自己配置headers
        config.headers = Object.assign(this.defaults.headers, config.headers);
        //如果有请求转换，执行
        if (config.transformRequest && config.data) {
            config.data = config.transformRequest(config.data, config.headers);
        }
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
            //第三个参数异步i,
            xhr.open(method, url, true);
            //设置返回值为json
            xhr.responseType = 'json';
            xhr.onreadystatechange = function () {
                if (xhr.readyState === 4) {
                    if (xhr.status >= 200 && xhr.status !== 0) {
                        let response = {
                            data: xhr.response,
                            headers: parseHeaders(xhr.getAllResponseHeaders()),
                            status: xhr.status,
                            statusText: xhr.statusText,
                            config,
                            request: xhr
                        }
                        debugger
                        //响应转换
                        if (config.transformResponse) {
                            response = config.transformResponse(response);
                        }
                        resolve(response);
                    } else {
                        reject(new Error(`Error: Request failed with status code ${xhr.status}`))
                    }
                }
            }

            //请求头的处理
            if (headers) {
                /**
                 * headers:{
                 *   common:{accept: 'application/json'},
                 *   post:{'content-type':'application/json'}
                 * }
                 */
                Object.keys(headers).forEach(key => {
                    if (key === 'common' || allMethods.includes(key)) {
                        if (key === 'common' || key === config.method) {
                            Object.keys(headers[key]).forEach(key2 => {
                                xhr.setRequestHeader(key2, headers[key][key2]);
                            })
                        }
                    } else {
                        xhr.setRequestHeader(key, headers[key]);
                    }
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
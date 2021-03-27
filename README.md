<!--
 * @Author: dfh
 * @Date: 2021-03-26 06:45:02
 * @LastEditors: dfh
 * @LastEditTime: 2021-03-27 11:56:20
 * @Modified By: dfh
 * @FilePath: /day33-axios/README.md
-->
> axios其实是一个对象，有主要的6部分组成，分别为：config,data,headers,request,status,statusText

![截屏2021-03-26 06.57.08.png](https://p1-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/cd5b6ec5e7ba437791ad427b21b051cf~tplv-k3u1fbpfcp-watermark.image)

### 1.get
#### 1.1.使用
```javascript
import axios from 'axios';
const baseUrl = 'http://localhost:8080';
const user = {
    name: 'zhangsan',
    password: '123456'
}
axios({
    url:baseUrl+ '/get',
    method: 'get',
    params: user
}).then(response => {
    console.log(response);
}).catch(error => {
    console.log(error);
})
```

#### 1.2.支持get的实现
```javascript
axios
├── Axios.js
└── index.js
```
##### 1.2.1.`axios/index.js`
```javascript
import Axios from './Axios';
function createInstance(){
    const context=new Axios();
    //让request方法里的this永远指向context也就是new Axios
    let instance=Axios.prototype.request.bind(context);
    //把Axios的类的实例和类的原型上的方法都拷贝到了instance上，也就是request方法上
    instance=Object.assign(instance,Axios.prototype,context);
    return instance;
}
const axios=createInstance();
export default axios;
```

##### 1.2.2.`axios/Axios.js`
```javascript
import qs from 'qs';
import parseHeaders from 'parse-headers';

class Axios {

    request(config = {}) {
        return this.dispatchRequest(config);
    }

    dispatchRequest(config) {
        return new Promise((resolve, reject) => {
            let { url, method, params } = config;
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
            xhr.send();
        })
    }
}

export default Axios;
```

### 2.post

#### 2.1.使用
```javascript
import axios from 'axios';
const baseUrl = 'http://localhost:8080';
const user = {
    name: 'zhangsan',
    password: '123456'
}
axios({
    url:baseUrl+ '/post',
    method: 'post',
    headers:{//请求头
        'Content-Type':'application/json'
    },
    data:user,//请求体
}).then(response => {
    console.log(response);
}).catch(error => {
    console.log(error);
})
```

#### 2.2.实现
##### 2.2.1.修改`Axios.js`
> 主要是对请求头和请求体做处理
```javascript
import qs from 'qs';
import parseHeaders from 'parse-headers';

class Axios {

    request(config = {}) {
        return this.dispatchRequest(config);
    }

    dispatchRequest(config) {
        return new Promise((resolve, reject) => {
+           let { url, method = 'get', params, data, headers } = config;
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
+           if (headers) {
+               Object.keys(headers).forEach(key => {
+                   xhr.setRequestHeader(key, headers[key]);
+               })
+           }

            //请求体的处理
+           let body = null;
+           if (typeof data === 'object' && data !== null) {
+               body = JSON.stringify(data);//转化为字符串
+           }
+           xhr.send(body);
        })
    }
}

export default Axios;
```

### 3.错误处理
- 请求超时
- 网络异常
- 状态码错误

#### 3.1.实例
##### 3.1.1.请求超时
> 这个的这个`/post_timeout?timeout=3000`接口会在`3s`后返回结果,接口调用设置的请求时间为`1s`，因此会报:`Error: timeout of 1000ms exceeded`异常
```javascript
axios({
    url: baseUrl + '/post_timeout?timeout=3000',
    method: 'post',
    headers: {
        'Content-Type': 'application/json'
    },
    data: user,
+   timeout: 1000
}).then(response => {
    console.log(response);
}).catch(error => {
    console.log(error);
})
```

##### 3.1.2.网络异常
> 设置`3s`后发请求，但是在这个期间断网了，报：`net::ERR_INTERNET_DISCONNECTED`
```javascript
+ setTimeout(() => {
    axios({
        url: baseUrl + '/post',
        method: 'post',
        headers: {
            'Content-Type': 'application/json'
        },
        data: user
    }).then(response => {
        console.log(response);
    }).catch(error => {
        console.log(error);
    })
+ }, 3000);
```

##### 3.1.3.状态码错误
> 这个的这个接口`/post_status?code=300`,返回的状态码是`300`,报：`Error: Request failed with status code 300`
```javascript
axios({
    url: baseUrl + '/post_status?code=300',
    method: 'post',
    headers: {
        'Content-Type': 'application/json'
    },
    data: user,
    timeout:1000,
}).then(response => {
    console.log(response);
}).catch(error => {
    console.log(error);
})
```

#### 3.2.实现
##### 3.2.1.`Axios.js修改`
```javascript
import qs from 'qs';
import parseHeaders from 'parse-headers';

class Axios {

    request(config = {}) {
        return this.dispatchRequest(config);
    }

    dispatchRequest(config) {
        return new Promise((resolve, reject) => {
+       let { url, method = 'get', params, data, headers,timeout } = config;
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
+                if (xhr.readyState === 4 && xhr.status !==0) {
                   if (xhr.status >= 200 && xhr.status <300) {
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
 +                      reject(new Error(`Error: Request failed with status code ${xhr.status}`))
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
+           if(timeout){
+               xhr.timeout=timeout;//设置超时时间
+               xhr.ontimeout=function(){//超时监听
+                   reject(new Error(`Error: timeout of ${timeout}ms exceeded`));
+               }
+           }

            //网络异常
+           xhr.onerror=function(){
+               reject(new Error(`net::ERR_INTERNET_DISCONNECTED`));
+           }

            xhr.send(body);
        })
    }
}

export default Axios;
```

### 4.拦截器
- axios请求拦截器是插入后执行，响应拦截器是先插入先执行
- interceptors.request.use:使用请求拦截器
    - `use(onFulfilled?: (value: AxiosRequestConfig) => AxiosRequestConfig | Promise<AxiosRequestConfig>, onRejected?: (error: any) => any): number`
    - use回调有两个可选参数：`onFulfilled`和`onRejected`
    - onFulfilled执行返回值可能是`AxiosRequestConfig`|`Promise<AxiosRequestConfig>`,use执行返回值是当前位置，便于eject取消
- interceptors.response.use:使用响应拦截器
    - `use(onFulfilled?: (value: AxiosResponse<any>) => AxiosResponse<any> | Promise<AxiosResponse<any>>, onRejected?: (error: any) => any): number`
    - use回调有两个可选参数：`onFulfilled`和`onRejected`
    - onFulfilled执行返回值可能是`AxiosResponse<any>`|`Promise<AxiosResponse<any>>,`,use执行返回值是当前位置，便于eject取消
    
- interceptors.request.eject:取消请求使用的某个拦截器
- interceptors.response.eject:取消响应使用的某个拦截器


#### 4.1.使用
> axios请求拦截器是插入后执行，响应拦截器是先插入先执行
```javascript
import axios from 'axios';
const baseUrl = 'http://localhost:8080';
const user = {
    name: 'zhangsan',
    password: '123456'
}

//请求拦截
+axios.interceptors.request.use((config) => {
+   config.headers.name += '1';
+   return config;
+})
+const request_interceptor = axios.interceptors.request.use((config) => {
+   config.headers.name += '2';
+   return config;
+})
+axios.interceptors.request.use((config) => {
+   config.headers.name += '3';
+   return config;
+})
+axios.interceptors.request.eject(request_interceptor);//取消某个请求拦截器


//响应拦截
+axios.interceptors.response.use(response => {
+   response.data.name += '1';
+   return response;
+})
+const response_intereptor = axios.interceptors.response.use(response => {
+   response.data.name += '2';
+   return response;
+})
+axios.interceptors.response.use(response => {
+   response.data.name += '3';
+   return response;
+})
+axios.interceptors.response.eject(response_intereptor);//取消某个设置的影响拦截器

axios({
    url: baseUrl + '/post',
    method: 'post',
    headers: {
        'Content-Type': 'application/json',
+       'name':'lisi'
    },
    data: user,
    timeout: 1000,
}).then(response => {
    console.log(response.data);
}).catch(error => {
    console.log(error);
})
```
##### 4.1.1.请求分析
> 从请求头我们能观察到，name=lisi31,过程是这样的，我们设置了三次请求拦截，由于请求拦截是先插入的后执行，所以应该是`name321`,但是由于我们`eject(取消)`了第二次的请求拦截，所以最终请求发的是`name31`
![9DD0F4C5803EC97E32BCC771E9A7FBAD.png](https://p9-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/f3b757aa2f7d4453b07611c7d28b8d98~tplv-k3u1fbpfcp-watermark.image)

##### 4.1.2.响应分析
> 从响应数据我们很容观测到，name最终返回了zhangsan13,同样我们也设置了三次响应拦截，响应拦截是先插入的先执行，本应该是`zhangsan123`的，但是因为我们同样`eject(取消)`了第二次响应拦截，所以最终结果成了`zhangsan13`

![QQ20210326-082934@2x.png](https://p6-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/fcac196f5a2a477e9c47f8b15fda5d8a~tplv-k3u1fbpfcp-watermark.image)

#### 4.2.实现
```javascript
axios
├── Axios.js
├── AxiosInterceptorManager.js
└── index.js
```

##### 4.2.1.`AxiosInterceptorManager.js`拦截器管理者
```javascript
class AxiosInterceptorManager{
    constructor(){
        this.interceptors=[];
    }
    //注册拦截器
    use(onFulfilled,onRejected){
        this.interceptors.push({
            onFulfilled,
            onRejected
        })
        return this.interceptors.length-1;//返回当前注册的位置
    }
    //取消拦截器
    eject(interceptorIndex){
        if(this.interceptors[interceptorIndex]){
            this.interceptors[interceptorIndex]=null;
        }
    }
}
export default AxiosInterceptorManager;
```

##### 4.2.2.`Axios.js修改`
```javascript
import qs from 'qs';
import parseHeaders from 'parse-headers';
+ import AxiosInterceptorManager from './AxiosInterceptorManager';
class Axios {

+   constructor() {
+       this.interceptors = {
+           request: new AxiosInterceptorManager(),//请求拦截器的管理者
+           response: new AxiosInterceptorManager()//响应拦截器的管理者
+       };
+   }

    request(config = {}) {
 +      const chain = [{//设置真正发请求的，然后将请求拦截出入前面，响应拦截插入后面，实现现走请求拦截，再发请求，最后响应拦截
 +          onFulfilled: this.dispatchRequest,
 +          onRejected: undefined
 +      }];
        //将请求拦截器一个一个插入最前面，实现先放的后执行
 +      this.interceptors.request.interceptors.forEach(interceptor => {
 +          interceptor && chain.unshift(interceptor);
 +      })
        //将响应拦截一个个查处末尾，实现先放先执行
 +      this.interceptors.response.interceptors.forEach(interceptor => {
 +          interceptor && chain.push(interceptor);
 +      })
 +      let promise = Promise.resolve(config);
 +      while (chain.length) {
 +          const { onFulfilled, onRejected } = chain.shift();//取出每次的第一条数据
            //将config传入onFulfilled
 +          promise = promise.then(onFulfilled, onRejected);
 +      }
 +      return promise;
 +  }

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
                if (xhr.readyState === 4 && xhr.status !==0) {
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
```

### 5.合并配置
> 此过程主要是将客户设置的headers和默认headers合并起来
#### 5.1.使用：
```javascript
axios({
    url: baseUrl + '/post',
    method: 'post',
    headers: {
        'name': 'lisi',
    },
    data: user,
    timeout: 1000,
}).then(response => {
    console.log(response.data);
}).catch(error => {
    console.log(error);
})
```

![QQ20210327-102916.png](https://p6-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/198d337a3a904fa2a9908b946806882e~tplv-k3u1fbpfcp-watermark.image)
#### 5.2.实现
```javascript
import qs from 'qs';
import parseHeaders from 'parse-headers';
import AxiosInterceptorManager from './AxiosInterceptorManager';

//默认配置
+const defaults = {
+   method: 'get',
+   timeout: 0,
+   headers: {
+       common: {
+           accept: 'application/json'//指定告诉服务器返回JSON格式的数据
+       }
+   }
+}
+const getStyleMethods = ['get', 'head', 'delete', 'options'];//get风格的请求
+getStyleMethods.forEach(method => {
+   defaults.headers[method] = {}
+})

+const postStyleMethods = ['put', 'post', 'patch'];//post风格的请求，会有请求体，需要加默认请求体格式
+postStyleMethods.forEach(method => {
+   defaults.headers[method] = {
+       'content-type':'application/json'//请求体格式
+   }
+})

+const allMethods = [...getStyleMethods, ...postStyleMethods];

class Axios {

    constructor() {
+       this.defaults = defaults;
        this.interceptors = {
            request: new AxiosInterceptorManager(),//请求拦截器的管理者
            response: new AxiosInterceptorManager()//响应拦截器的管理者
        };
    }

    request(config = {}) {
        //合并默认配置headers和用户自己配置headers
+       config.headers = Object.assign(this.defaults.headers, config.headers);

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
                if (xhr.readyState === 4  && xhr.status !==0) {
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
+               Object.keys(headers).forEach(key => {
+                   if (key === 'common' || allMethods.includes(key)) {
+                       if (key === 'common' || key === config.method) {
+                           Object.keys(headers[key]).forEach(key2 => {
+                               xhr.setRequestHeader(key2, headers[key][key2]);
+                           })
+                       }
+                   } else {
+                       xhr.setRequestHeader(key, headers[key]);
+                   }
+               })
+           }

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
```

### 6.转换请求与响应

#### 6.1.`Axios.js修改`

```javascript
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
+   transformRequest: function (data, headers) {
+       headers['content-type'] = 'application/x-www-form-urlencoded';
+       return qs.stringify(data);
+   },
+   transformResponse: function (data) {
+       if (typeof data === 'string');
+       data = JSON.parse(data);
+       return data;
+   }
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
+       if (config.transformRequest && config.data) {
+           config.data = config.transformRequest(config.data, config.headers);
+       }
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
                if (xhr.readyState === 4 && xhr.status !==0) {
                    if (xhr.status >= 200 && xhr.status < 300) {
                        let response = {
                            data: xhr.response,
                            headers: parseHeaders(xhr.getAllResponseHeaders()),
                            status: xhr.status,
                            statusText: xhr.statusText,
                            config,
                            request: xhr
                        }
                        //响应转换
+                       if (config.transformResponse) {
+                           response = config.transformResponse(response);
+                       }
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
```

### 7.取消任务
- isCancel:判断是否是用户自己取得任务
- CancelToken:是一个类，`source`方法返回一个对象，包含`token`和`cancel`
- cancel:取消任务

#### 7.1.实例

![QQ20210327-111900.png](https://p1-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/7183309f72674a9b975637febdd12dd4~tplv-k3u1fbpfcp-watermark.image)
```javascript
import axios from 'axios';
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
```

#### 7.2.实现
```javascript
axios
├── Axios.js
├── AxiosInterceptorManager.js
├── cancel.js
└── index.js
```
##### 7.2.1.`cancel.js`
```javascript
export class Cancel {
    constructor(reason) {
        //存放取消的原因
        this.reason = reason;
    }
}
export class CancelToken {
    constructor() {
        this.resolve = null;
    }
    source() {
        return {
            token: new Promise(resolve => {
                this.resolve = resolve;
            }),
            cancel: reason => {
                this.resolve(new Cancel(reason))
            }
        }
    }
}

//判断error是不是Cancel的实例
export function isCancel(error) {
    return error instanceof Cancel;
}
```

##### 7.2.2.`index.js修改`
```javascript
    import Axios from './Axios';
+   import { CancelToken, isCancel } from './cancel';
    function createInstance() {
        const context = new Axios();
        //让request方法里的this永远指向context也就是new Axios
        let instance = Axios.prototype.request.bind(context);
        //把Axios的类的实例和类的原型上的方法都拷贝到了instance上，也就是request方法上
        instance = Object.assign(instance, Axios.prototype, context);
        return instance;
    }
    const axios = createInstance();
+   axios.CancelToken = new CancelToken();
+   axios.isCancel = isCancel;
    export default axios;
```
##### 7.2.3.`Axios.js修改`
```javascript
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
                if (xhr.readyState === 4 && xhr.status !== 0) {
                    if (xhr.status >= 200 && xhr.status < 300) {
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

            //处理用户自己取消的操作
+           if (config.cancelToken) {
+               config.cancelToken.then(reason => {
+                   xhr.abort();//取消请求
+                   reject(reason);
+               })
+           }
            xhr.send(body);
        })
    }
}

export default Axios;
```

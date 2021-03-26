/*
 * @Author: dfh
 * @Date: 2021-03-26 08:38:43
 * @LastEditors: dfh
 * @LastEditTime: 2021-03-26 08:42:22
 * @Modified By: dfh
 * @FilePath: /day33-axios/src/axios/AxiosInterceptorManager.js
 */
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
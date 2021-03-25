/*
 * @Author: dfh
 * @Date: 2021-03-26 07:01:46
 * @LastEditors: dfh
 * @LastEditTime: 2021-03-26 07:07:28
 * @Modified By: dfh
 * @FilePath: /day33-axios/src/axios/index.js
 */
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
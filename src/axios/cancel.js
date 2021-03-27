/*
 * @Author: dfh
 * @Date: 2021-03-27 11:19:43
 * @LastEditors: dfh
 * @LastEditTime: 2021-03-27 11:40:49
 * @Modified By: dfh
 * @FilePath: /day33-axios/src/axios/cancel.js
 */

export class Cancel {
    constructor(reason) {
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
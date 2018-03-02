import axios from 'axios';
import _ from 'underscore';
import Qs from 'qs';

let util = {};

util.invoke = function(options) {
    return new Promise((resolve, reject) => {
        if (!util.ajax) {
            util.ajax = axios.create({
                baseURL: window._TY_APIHost,
                timeout: 30000,
                withCredentials: true
            });
        }
        util.ajax(options).then(function(response) {
            if (response && response['data'] && response['data']['code'] && response['data']['code'] == -401) {
                //未登录
                location.href = window._TY_SSOURL;
            } else if (response && response['data'] && response['data']['code'] && response['data']['code'] == -400) {
                //TY未登录
                location.href = "http://" + document.location.host + "/#/ty-login";
            } else {
                resolve(response);
            }
        }).catch(function(error) {
            reject(error);
        });
    });
}

//为了能请求第三方或自定义额接口，保证图片上传到第三方文件服务器，这里不设置baseURL
util.post = function(url, param, options) {
    return util.invoke(_.extend({
        url: url,
        method: 'post',
        data: Qs.stringify(param)
    }, options));
}

util.get = function(url, param, options) {
    return util.invoke(_.extend({
        url: url,
        method: 'get',
        params: param
    }, options));
}

//深拷贝  对象/数组
util.deepClone = function(obj) {
    let cloneObj;
    if (!_.isObject(obj) || typeof obj === 'function') {
        return obj;
    }
    cloneObj = _.isArray(obj) ? [] : {};
    for (var i in obj) {
        if (obj.hasOwnProperty(i)) {
            if (!_.isObject(obj[i])) {
                // obj[i]为null和undefined都会进入这里
                cloneObj[i] = obj[i];
            } else {
                cloneObj[i] = util.deepClone(obj[i]);
            }
        }
    }
    return cloneObj;
}

util._resovleTpl = function(str, data) {
    try {
        return _.template(str)(data);
    } catch (e) {
        return "";
    }
}

util._tpl = function(tpl, data) {
    if (typeof tpl === 'string') {
        //字符串
        return util._resovleTpl(tpl, data);
    } else if (_.isArray(tpl)) {
        //数组
        for (let i = 0; i < tpl.length; i++) {
            let newObj = util._tpl(tpl[i], data);
            if (typeof newObj === 'object') {
                tpl[i] = newObj;
            }
        }
    } else if (_.isObject(tpl)) {
        //对象 js 对象和数组 都是object类型，不过上面已经过滤掉array了
        for (let o in tpl) {
            if (tpl.hasOwnProperty(o)) {
                let val = util._tpl(tpl[o], data);
                if (typeof val === 'string') {
                    //除string类型外，其他类型不需要返回
                    tpl[o] = val;
                }
            }
        }
    }
    return tpl;
};
/**
 * 模板解析工具  支持对象，数组，字符串
 * @param tpl
 * @param data
 */
util.tpl = function(tpl, data) {
    let result = tpl;
    if (typeof tpl === 'object') {
        //对象或者数组,为保证不改变请求参数值，先深拷贝
        result = util.deepClone(tpl);
    }
    //深拷贝对象 模板解析
    return util._tpl(result, data);
}

util.uuid = function(len, radix) {
    var chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'.split('');
    var uuid = [];
    var i;
    radix = radix || chars.length;
    if (len) {
        for (i = 0; i < len; i++) uuid[i] = chars[0 | Math.random() * radix];
    } else {
        var r;
        uuid[8] = uuid[13] = uuid[18] = uuid[23] = '-';
        uuid[14] = '4';
        for (i = 0; i < 36; i++) {
            if (!uuid[i]) {
                r = 0 | Math.random() * 16;
                uuid[i] = chars[(i == 19) ? (r & 0x3) | 0x8 : r];
            }
        }
    }
    return uuid.join('');
};

/**
 *  组装模板或者getDsData方法的参数
 */
util.buildTplParams = function(t, obj) {
    return _.extend({
        "bb": t,
        "router": t.$route.params,
        "route": t.$route,
        "external": t.external,
        "local": window.localStorage,
        "session": window.sessionStorage
    }, (obj ? obj : {}));
};

//获取DS
/**
DS配置案例
{
    api:"/list-data",
    category:'config',//ds选择器 不是type字段而是category字段
    method:"post",
    inputs:[
        {paramName:'a',valueType:"constant",constant:123},
        {paramName:'b',valueType:"inputValueObj",valueKey:"bb",variable:"pageSize"},
        {paramName:'c',valueType:"inputValueObj",valueKey:"router",variable:"page"},
        {paramName:'d',valueType:"inputValueObj",valueKey:"row-data",variable:"alias"},
    ],
    outputs:[
        {dataKey:"tableData",valueKey:"data-list-1"},
        {dataKey:"obj",valueKey:"data-obj-1",handle:"${buzzCode}"}
    ]
}

 type 是指接口的类型，目前分为配置接口config和自定义接口custom

bb-list中的table data获取数据的调用方式 , util.getDSData(ds, {"bb":this ,"router":this.$router.param} , function(){} );

bb-list中的button group中execute-ds的按钮调用方法，util.getDSData(ds, {"bb":this ,"router":this.$router.param , "row-data":row} , function(){} );
**/
util.getDSData = function(ds, inputValueObj, success, error) {
    var api = ds['api'];
    var type = ds['category'] || 'config'; //默认是配置接口
    if (!api) {
        error(500, "请求参数无效");
        return;
    }
    var method = ds['method'] || 'post';
    var requestParam = {};
    var inputs = ds['inputs'] || [];
    var outputs = ds['outputs'] || [];
    if (inputs && inputs.length > 0) {
        inputs.forEach(function(input) {
            var valueType = input['valueType'];
            var paramValue = null;
            if (valueType == 'constant') {
                paramValue = input['constant'];
            } else if (valueType == 'template') { //支持参数为自定义模板
                paramValue = util.tpl(input['variable'], inputValueObj[input['valueKey']]);
            } else if (valueType == 'inputValueObj') {
                var _inputData = inputValueObj[input['valueKey']];
                if (_inputData && typeof input['variable'] == 'string') {
                    var paramArr = input['variable'].split('.');
                    if (paramArr.length > 1) { //支持参数形式 a.b[1].c.d[0][0].e
                        var paramValueStr = '_inputData' + '.' + input['variable'];
                        try {
                            paramValue = eval("(" + paramValueStr + ")");
                        } catch (error) {
                            console.log('DS上传参数配置有误:', error);
                        }
                    } else {
                        paramValue = _inputData[input['variable']];
                    }
                }
            }
            requestParam[input['paramName']] = paramValue;
        });
    }
    var apiUrl = api;
    if (type == 'config') {
        //如果不是自定义接口
        apiUrl = window._TY_ContentPath + "/" + api;
    }
    util[method](apiUrl, requestParam).then(function(response) {
        var data = response['data'];
        if (data['ok']) {
            var realDataMap = data['data'];
            new Promise(function(resolve, reject) {
                const promiseArr = [];
                outputs.forEach(function(output) {
                    var _outputValue = null;
                    var paramArr = output['valueKey'].split('.');
                    if (paramArr.length > 1) { //支持参数形式  a.b[1].c.d[0][0].e
                        var paramValueStr = "realDataMap" + '.' + output['valueKey'];
                        try {
                            _outputValue = eval("(" + paramValueStr + ")");
                        } catch (error) {
                            console.log('DS取值参数配置有误:', error);
                        }
                    } else {
                        _outputValue = realDataMap[output['valueKey']];
                    }
                    if (output['handle']) {
                        //加载handle对应的buzz函数，进行执行，异步操作统一通过Promise处理
                        const item = new Promise((resolve, reject) => {
                            util.loadBuzz(output['handle'], function(code) {
                                output['value'] = eval(code);
                                resolve();
                            });
                        });
                        promiseArr.push(item);
                    } else {
                        output['value'] = _outputValue;
                    }
                });
                //等待forEach中的异步全部执行完
                Promise.all(promiseArr).then(values => {
                    resolve(outputs);
                });
            }).then((outputs) => {
                success(outputs)
            });
        } else {
            error(data['code'], data['message']);
        }
    }).catch(function(err) {
        error(err);
    });
}

//统一的解析按钮逻辑
util.resolveButton = function(button, valueobj) {
    var t = valueobj['bb'];
    if (button['action'] == 'url') {
        //URL跳转
        //为了兼容扩展dataparam的值的范围，注意URL参数的Encode
        var dataParam = valueobj['row-data'] || {};
        dataParam = Object.assign({}, dataParam, valueobj);
        var url = util.tpl(button['url'], dataParam);
        url = encodeURI(url);
        if (button['urlType'] == 'openWindow') {
            window.open(url);
        } else {
            if (url.indexOf("http") == 0) {
                document.location.href = url;
            } else {
                t.$router.push(url);
            }
        }
        //触发按钮执行完成事件
        t.$emit("button-finish", button, valueobj);
    } else if (button['action'] == 'execute-ds') {
        var ds = button['ds'];
        var valueKey = button.valueKey || 'row-data';
        var confirmTitle = button['confirmTitle'] ? util.tpl(button['confirmTitle'], valueobj[valueKey]) : "提示";
        var confirmText = button['confirmText'] ? util.tpl(button['confirmText'], valueobj[valueKey]) : "是否执行此操作";
        button['callBackStaticWords'] = button['callBackStaticWords'] ? button['callBackStaticWords'] : ''
        var messageInfo = button['callBackStaticWords'] ? util.tpl(button['callBackStaticWords'], valueobj[valueKey]) : "操作成功";
        t.$confirm(confirmText, confirmTitle, {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
        }).then(() => {
            util.getDSData(ds, valueobj, function(map) {
                //TODO
                t.$message({
                    type: 'success',
                    message: messageInfo
                });
                // util.buttonCallback(button, valueobj, callback, map);
                //触发按钮执行完成事件
                t.$emit("button-finish", button, valueobj, map);
            }, function(err, msg) {
                t.$message({
                    type: 'warning',
                    message: msg || messageInfo
                });
                // util.buttonCallback(button, valueobj, callback, err);
                //触发按钮执行完成事件
                t.$emit("button-finish", button, valueobj, err);
            });
        }).catch(() => {
            t.$message({
                type: 'info',
                message: '操作未完成'
            });
        });
    } else if (button['action'] == 'dialog-page') {
        //TODO 弹出一个页面对话框
        require.ensure(["art-dialog"], function(require) {
            var Vue = valueobj['bb'].vue;
            var _page = new Vue({
                router: t.$router,
                render: function(createElement) {
                    const pageItem = createElement('bb-page', {
                        props: {
                            pageAlias: button['dialogPage'],
                            params: valueobj
                        },
                        on: {
                            'after-unload': (val) => {
                                //触发按钮执行完成事件
                                t.$emit("button-finish", button, valueobj);
                                //关闭并销毁dialog
                                t.dialog.close().remove();
                                t.dialog = null;
                            }
                        }
                    }, []);
                    return createElement('div', {}, [pageItem])
                }
            }).$mount();
            var dialog = require('art-dialog');
            var d = dialog({
                width: 800,
                zIndex: 100,
                title: '消息',
                content: _page.$el
            });
            d.showModal();
            t.dialog = d;
        }, 'art-dialog');
    } else if (button['action'] == 'code') {
        //执行代码
        button['method'].call(this, valueobj['row-data']);
        //触发按钮执行完成事件
        t.$emit("button-finish", button, valueobj);
    } else if (button['action'] == 'buzz') {
        //如果是巴斯代码，远程加载
        util.loadBuzz(button.buzz, function(code) {
            t.util = util;
            eval(code);
            //触发按钮执行完成事件
            t.$emit("button-finish", button, valueobj);
        });
    }
}

//检查vue对象是否含有uuid,通过$children来找
util._checkVueHasRef = function(uuid, vueObj) {
    //判断vue对象是否是该uuid组件逻辑
    if (vueObj && vueObj.$vnode && vueObj.$vnode.data && vueObj.$vnode.data.ref && vueObj.$vnode.data.ref == uuid) {
        return vueObj;
    }
    return null;
}

//深度遍历，可能会影响性能，后面考虑改成层级遍历
util._findChildBB = function(uuid, children) {
    let resultVue = null;
    if (children && children.length > 0) {
        for (let i = 0; i < children.length; i++) {
            let vueItem = children[i];
            resultVue = util._checkVueHasRef(uuid, vueItem);
            if (resultVue && resultVue != null) {
                return resultVue;
            }
            if (vueItem.$children && vueItem.$children.length > 0) {
                //还有子 则继续遍历
                resultVue = util._findChildBB(uuid, vueItem.$children);
                if (resultVue && resultVue != null) {
                    return resultVue;
                }
            }
        }
    }
    return resultVue;
}

/**
    根据pageAlias和uuid 查询这个uuid的积木vue对象
**/
util.findBBByUuid = function(uuid, pageAlias) {
    const pages = window._TY_Page_Data;
    if (!pages) {
        return null; //没有页面存储
    }
    let root = pages[pageAlias]; //初始根
    if (!pageAlias) {
        //没有传pageAlias,直接从根找    如果页面已经切换，$children 是不会保留切换前的页面vue对象的，所以这里可以任意获取一个页面，然后找到根，再往下找
        for (let o in pages) {
            pageAlias = o;
            root = pages[pageAlias];
            break;
        }
        //如果不传pageAlias  就从根找起  ,否则从传过来的page开始找起
        while (root.$parent) {
            root = root.$parent;
        }
    }
    //判断当前vue对象是不是要找的vue组件
    let resultVue = util._checkVueHasRef(uuid, root);
    if (resultVue && resultVue != null) {
        return resultVue;
    } else if (root.$children && root.$children.length > 0) {
        resultVue = util._findChildBB(uuid, root.$children);
    }
    return resultVue;
}

/**
    获取当前容器组件的子积木列表
**/
util.loadChildBB = function(t) {
    let result = [];
    if (t && t.$refs) {
        //不是空对象
        for (let i in t.$refs) {
            let item = {
                uuid: i
            };
            item.name = t.$refs[i].$attrs.aliasName || t.$refs[i].$vnode.componentOptions.tag; //设置组件名称
            item.bbAlias = t.$refs[i].$vnode.componentOptions.tag; //设置积木别名
            if (JSON.stringify(t.$refs[i].$refs) === '{}') {
                //说明没有子组件了
                item.isleaf = true;
            } else {
                //说明还有子
                item.children = [];
            }
            result.push(item);
        }
    }
    return result;
}



util.loadBuzz = function(buzz, handle) {
    var params = {
        alias: buzz
    };
    util.get(window._TY_ContentPath + '/read-buzz-by-alias', params).then(function(map) {
        var data = map.data.data.data;
        if (handle) {
            handle(data.code);
        }
    }).catch(function(err) {
        console.log(err);
    });;
}

/**
 * 构建form表单组件 默认值
 * @param t
 * @param p_value
 */
util.buildDefaultValTpl = function(t, p_value) {
    if (!t.value && t.defaultValTpl) {
        t[p_value] = util.tpl(t.defaultValTpl, util.buildTplParams(t));
        t.$emit('input', t[p_value]);
    }
}

window._TY_Tool = util;

export default util;
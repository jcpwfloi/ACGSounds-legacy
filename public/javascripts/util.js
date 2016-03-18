/**
 * Global Utilities
 * @function __get(a, b) return a if exists else b
 * @function __(str) functional as i18n __()
 *  @param {String} str str to be converted
 * @function each(obj, callback, context) Object Iterator
 *  @param {Object|Array} obj Object to be iterated
 *  @param {Function} callback callback function callback(value, key)
 *  @param {Object} context performed as `this`
 * @function String.prototype.format
 * @function Date.prototype.format
 * @function $.urlParam(str) get `GET` paramaters
 *  @param {String} str `GET` key
 *  @return {String} `GET` value
 */
function __get(a,b) {return a ? a : b;}
function abs(a) {return a > 0 ? a : -a;}

function each(obj, callback, context) {
    if (!obj) return;
    var key;
    if (typeof(obj.length) !== 'undefined') {
        for (key = 0; key < obj.length; ++ key)
        if (callback.call(context, obj[key], key) === false)
            return;
    } else {
        for (key in obj) {
            if (obj.hasOwnProperty(key) && callback.call(context, obj[key], key) === false) return;
        }
    }
}

function __(str) {
    return window.locales[languageSetting] ? __get(window.locales[languageSetting][str], str) : __get(window.locales['default'][str], str);
}

String.prototype.format = function() {
    var args = arguments;
    return this.replace(/{(\d+)}/g, function(match, number) { 
        return typeof args[number] != 'undefined' ? args[number] : match;
    });
};
Date.prototype.Format = function (fmt) {
    var o = {
        "M+": this.getMonth() + 1, //月份
        "d+": this.getDate(), //日
        "h+": this.getHours(), //小时
        "m+": this.getMinutes(), //分
        "s+": this.getSeconds(), //秒
        "q+": Math.floor((this.getMonth() + 3) / 3), //季度
        "S": this.getMilliseconds() //毫秒
    };
    if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
    for (var k in o)
        if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
    return fmt;
};

$.urlParam = function(name){
    var results = new RegExp('[\?&]' + name + '=([^&#]*)').exec(window.location.href);
    if (results == null){
        return null;
    } else {
        return results[1] || 0;
    }
}

function loginWithCallback() {
    window.location.href = '/user/login?callback=' + window.location.href;
}


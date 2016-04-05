(function(window, document, undefined) {'use strict';
 function General(opt) {
     this.options = {};
     extend(this.options, opt);
 }

 function each(obj, callback, context) {
     if (!obj) return;
     var i;
     if (typeof obj == Array) {
         for (i = 0; i < obj.length; ++ i)
             if (callback.call(context, obj[i], i) === false) return;
     } else {
         for (i in obj)
             if (obj.hasOwnProperty(i) && callback.call(context, obj[i], i) === false) return;
     }
 }

 function extend(dest, args) {
     var arg = arguments;
     each(arg, function(obj) {
         if (obj !== dest) {
             each(obj, function(value, key) {
                 dest[key] = value;
             });
         }
     }, this);
     return dest;
 }

 function arrayRemove(array, value) {
     var index = array.indexOf(value);
     if (index > -1) {
         array.splice(index, 1);
     }
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

 //exports
 window.each = each;
 window.extend = extend;
 window.arrayRemove = arrayRemove;
 window.General = General;
 window.max = function(a, b) { return a > b ? a : b; }
 window.abs = function(a) { return a > 0 ? a : -a; }

})(window, document);


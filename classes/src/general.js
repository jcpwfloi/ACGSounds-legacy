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

 //exports
 window.each = each;
 window.extend = extend;
 window.General = General;

})(window, document);


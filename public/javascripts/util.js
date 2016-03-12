function __get(a,b) {return a ? a : b;}
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
$.urlParam = function(name){
    var results = new RegExp('[\?&]' + name + '=([^&#]*)').exec(window.location.href);
    if (results == null){
        return null;
    } else {
        return results[1] || 0;
    }
}

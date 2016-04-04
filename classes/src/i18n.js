(function(window, document, undefined) {'use strict';
 function i18n(opts) {
     this.defaults = {
         locale: ['zh', 'en'],
         language: 'zh'
     };

     this.locale = {};
     this.options = {};

     extend(this.options, this.defaults, opts);
     
     each(this.options.locale, function(value) {
         this.locale[value] = {};
     }, this);
 }

 i18n.prototype = {
     updateLocale: function(lang, json) {
         if (!this.locale[lang]) this.locale[lang] = {};
         extend(this.locale[lang], json);
     },
     addLocale: function(lang, json) {
         this.locale[lang] = json;
     },
     ___: function(lang, key) {
         if (this.options.locale.indexOf(lang) !== -1)
             return _get(lang, key);
         else throw Error('No such language');
     },
     __: function(key) {
         return ___(this.options.language, key);
     }
 };

 function _get(lang, key) {
     return this.locale[lang][key] ? this.locale[lang][key] : key;
 }

 window.i18n = i18n;
})(window, document);


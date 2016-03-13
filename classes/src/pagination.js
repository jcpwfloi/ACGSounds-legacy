(function(window, document, undefined) {'use strict';
 function Pagination(opt, data) {
     this.defaults = {
         offset: 5,
         current: 1
     };

     this.options = {};

     extend(this.options, this.defaults, opt);
 }

 Pagination.prototype = {
 };

 window.Pagination = Pagination;
})(window, document);
